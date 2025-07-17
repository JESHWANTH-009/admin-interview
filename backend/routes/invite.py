from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import List
from auth import verify_firebase_token
from firebase_admin import firestore
from utils.email_utils import send_email # Currently disabled
import uuid
from datetime import datetime
import os

router = APIRouter(prefix="/invite", tags=["Invites"])
db = firestore.client()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

class InviteSendRequest(BaseModel):
    interview_id: str
    emails: List[EmailStr]

@router.post("/send")
async def send_invites(
    data: InviteSendRequest,
    user=Depends(verify_firebase_token)
):
    successes = []
    failures = []

    for email in data.emails:
        token = str(uuid.uuid4())
        link = f"{FRONTEND_URL}/interview/{token}"
        candidate_doc = {
            "interview_id": data.interview_id,
            "email": email,
            "status": "pending",
            "sent_at": datetime.utcnow(),
            "link": link
        }

        try:
            # Save candidate token doc in 'invites'
            db.collection("invites").document(token).set(candidate_doc)

            # Update interview doc to include this candidate (Firestore ArrayUnion)
            interview_ref = db.collection("interviews").document(data.interview_id)
            interview_ref.update({
                "candidates": firestore.ArrayUnion([candidate_doc])
            })

            # Optionally send email
            await send_email(
                email,
                "Your Interview Link",
                f"Hello,\n\nYou have been invited to an interview. Please use the following link to access your interview:\n{link}\n\nBest regards,\nAdmin Team"
            )

            successes.append({"email": email, "link": link})

        except Exception as e:
            failures.append({"email": email, "reason": str(e)})

    return {"success": successes, "failed": failures}


@router.get("/interview/{uuid}")
async def get_candidate_by_token(uuid: str):
    doc_ref = db.collection("invites").document(uuid)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Invalid token")

    data = doc.to_dict()
    return {
        "email": data.get("email"),
        "interview_id": data.get("interview_id"),
        "status": data.get("status")
    }
