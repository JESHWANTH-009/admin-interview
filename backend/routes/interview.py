# backend/routes/interview.py
from fastapi import APIRouter, Depends, HTTPException
from auth import verify_firebase_token
from schemas import CreateInterviewRequest
from firebase_admin import firestore
from datetime import datetime
import uuid

router = APIRouter(prefix="/interviews", tags=["Interview"])

db = firestore.client()

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
        return { "message": "Interview created", "interview_id": interview_id }
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
