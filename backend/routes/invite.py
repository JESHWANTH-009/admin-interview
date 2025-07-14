from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import List
from auth import verify_firebase_token
from firebase_admin import firestore
from utils.email_utils import send_interview_email  # you’ll write this below
import uuid

router = APIRouter(prefix="/interviews", tags=["Invites"])
db = firestore.client()

class InviteRequest(BaseModel):
    interview_id: str
    emails: List[EmailStr]

@router.post("/send-invites")
async def send_invites(data: InviteRequest, user=Depends(verify_firebase_token)):
    try:
        interview_ref = db.collection("interviews").document(data.interview_id)
        if not interview_ref.get().exists:
            raise HTTPException(status_code=404, detail="Interview not found")

        for email in data.emails:
            token = str(uuid.uuid4())
            candidate_ref = interview_ref.collection("candidates").document(token)
            candidate_ref.set({"email": email, "status": "not started"})
            send_interview_email(email, token)

        return {"message": "Invites sent"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))