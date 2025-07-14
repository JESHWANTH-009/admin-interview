from fastapi import APIRouter, HTTPException
from firebase_admin import firestore

router = APIRouter(prefix="/interview", tags=["Candidate"])
db = firestore.client()

@router.get("/{token}")
def get_interview_by_token(token: str):
    try:
        interviews_ref = db.collection("interviews").get()
        for doc in interviews_ref:
            interview = doc.to_dict()
            candidate_ref = db.collection("interviews").document(doc.id).collection("candidates").document(token)
            if candidate_ref.get().exists:
                return {
                    "title": interview["title"],
                    "role": interview["role"],
                    "question_type": interview["question_type"],
                    "questions": interview["questions"]
                }
        raise HTTPException(status_code=404, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))