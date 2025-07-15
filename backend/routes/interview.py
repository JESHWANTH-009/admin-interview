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
        interviews = [doc.to_dict() for doc in interviews_ref.stream()]
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

    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY
    }

    async with httpx.AsyncClient() as client:
        for question, answer in zip(questions, answers):
            system_prompt = (
                "You are an AI evaluator. Evaluate the candidate's answer to the question below.\n"
                "Rate the answer with a score from 0 to 1 based on: Accuracy, Relevance, Clarity, and Completeness.\n"
                "Labels to consider: Accurate, Relevant, Irrelevant, Unclear, Incorrect.\n"
                "Return ONLY a JSON object with 'score' and 'feedback' as keys, and nothing else.\n"
                "Example: {\"score\": 0.8, \"feedback\": \"Good answer.\"}\n\n"
                f"Question: {question}\nAnswer: {answer}"
            )

            payload = {
                "contents": [{
                    "parts": [{"text": system_prompt}]
                }]
            }

            try:
                response = await client.post(GEMINI_API_URL, headers=headers, json=payload)
                data = response.json()
                print("Gemini API raw response:", data)  # Debug print

                if "candidates" in data and data["candidates"]:
                    text = data["candidates"][0]["content"]["parts"][0]["text"]
                    match = re.search(r"\{.*?\}", text, re.DOTALL)
                    if match:
                        parsed = json.loads(match.group())
                        score = parsed.get("score", 0)
                        fb = parsed.get("feedback", "")
                    else:
                        fb = f"LLM did not return a valid JSON object. Raw output: {text}"
                else:
                    fb = f"Unexpected Gemini response: {data}"
                    score = 0

            except Exception as e:
                evaluation_results.append({
                    "question": question,
                    "answer": answer,
                    "score": 0,
                    "feedback": f"Evaluation failed: {str(e)}"
                })
                scores.append(0)
                feedback.append("Evaluation failed")

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

    return {
        "scores": scores,
        "feedback": feedback,
        "total_score": total_score,
        "evaluations": evaluation_results
    }
