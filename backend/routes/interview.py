from fastapi import APIRouter, Depends, HTTPException, Request
from auth import verify_firebase_token
from schemas import CreateInterviewRequest, SubmitAnswersRequest
from firebase_admin import firestore
from datetime import datetime
import uuid
import httpx
import os
import re
import json
from pydantic import BaseModel
from typing import List
from llm.gemini_evaluator import evaluate_answer
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/interviews", tags=["Interview"])
db = firestore.client()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

@router.post("/create")
async def create_interview(data: CreateInterviewRequest, user=Depends(verify_firebase_token)):
    interview_id = str(uuid.uuid4())
    interview_doc = {
        "id": interview_id,
        "title": data.title,
        "role": data.role,
        "question_type": data.question_type,
        "questions": data.questions,
        "created_by": user["uid"],
        "created_at": datetime.utcnow(),
        "candidates": []
    }

    try:
        db.collection("interviews").document(interview_id).set(interview_doc)
        return {"message": "Interview created", "interview_id": interview_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{interview_id}")
async def get_interview(interview_id: str, user=Depends(verify_firebase_token)):
    doc_ref = db.collection("interviews").document(interview_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Interview not found")

    return doc.to_dict()

@router.get("/")
async def list_interviews(user=Depends(verify_firebase_token)):
    try:
        interviews_ref = db.collection("interviews")
        interviews = []
        for doc in interviews_ref.stream():
            interview = doc.to_dict()
            candidates = interview.get("candidates", [])
            completed_candidates = [c for c in candidates if c.get("status") == "completed" and c.get("total_score") is not None]
            questions = interview.get("questions", [])
            if completed_candidates and questions:
                max_score = len(questions)
                avg_score = sum(c["total_score"] for c in completed_candidates) / len(completed_candidates)
                avg_score_percent = round((avg_score / max_score) * 100, 1)
            else:
                avg_score_percent = 0
            interview["avgScore"] = avg_score_percent
            interviews.append(interview)
        return {"interviews": interviews}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/public/{interview_id}")
async def get_interview_public(interview_id: str):
    doc_ref = db.collection("interviews").document(interview_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Interview not found")

    return doc.to_dict()

@router.post("/submit")
async def submit_answers(data: SubmitAnswersRequest):
    token = data.token
    answers = data.answers

    invite_ref = db.collection("invites").document(token)
    invite_doc = invite_ref.get()

    if not invite_doc.exists:
        raise HTTPException(status_code=404, detail="Invite not found")

    candidate_data = invite_doc.to_dict()
    interview_id = candidate_data["interview_id"]

    interview_ref = db.collection("interviews").document(interview_id)
    interview_doc = interview_ref.get()

    if not interview_doc.exists:
        raise HTTPException(status_code=404, detail="Interview not found")

    interview_data = interview_doc.to_dict()
    questions = interview_data["questions"]

    evaluation_results = []
    scores = []
    feedback = []

    for question, answer in zip(questions, answers):
        result = await evaluate_answer(question, answer)
        evaluation_results.append({
            "question": question,
            "answer": answer,
            "score": result.get("score", 0),
            "feedback": result.get("feedback", "")
        })
        scores.append(result.get("score", 0))
        feedback.append(result.get("feedback", ""))

    total_score = sum(scores)

    invite_ref.update({
        "answers": answers,
        "scores": scores,
        "feedback": feedback,
        "evaluations": evaluation_results,
        "status": "completed",
        "submitted_at": datetime.utcnow(),
        "total_score": total_score
    })

    # Update the candidate in the interview's candidates array
    interview_doc = interview_ref.get()
    if interview_doc.exists:
        interview_data = interview_doc.to_dict()
        candidates = interview_data.get("candidates", [])
        updated_candidates = []
        for c in candidates:
            if (
                c.get("email", "").strip().lower() == candidate_data.get("email", "").strip().lower()
                and c.get("link") == candidate_data.get("link")
            ):
                c["status"] = "completed"
                c["answers"] = answers
                c["scores"] = scores
                c["feedback"] = feedback
                c["evaluations"] = evaluation_results
                c["submitted_at"] = datetime.utcnow()
                c["total_score"] = total_score
            updated_candidates.append(c)
        interview_ref.update({"candidates": updated_candidates})

    return {
        "scores": scores,
        "feedback": feedback,
        "total_score": total_score,
        "evaluations": evaluation_results
    }

@router.delete("/{interview_id}")
async def delete_interview(interview_id: str, user=Depends(verify_firebase_token)):
    doc_ref = db.collection("interviews").document(interview_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Interview not found")
    doc_ref.delete()
    return {"message": "Interview deleted"}

# --- Recent Activity Endpoint ---
@router.get("/api/recent-activity", include_in_schema=True)
def get_recent_activity():
    try:
        activity_ref = db.collection("activity_log").order_by("timestamp", direction=firestore.Query.DESCENDING).limit(10)
        docs = activity_ref.stream()
        activity = []
        for doc in docs:
            data = doc.to_dict()
            activity.append({
                "message": data.get("message", ""),
                "timestamp": data.get("timestamp", "")
            })
        return JSONResponse({"activity": activity})
    except Exception as e:
        return JSONResponse({"activity": []})
