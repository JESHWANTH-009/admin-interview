from fastapi import APIRouter, HTTPException, Depends
from auth import verify_firebase_token
from firebase_admin import firestore

router = APIRouter(prefix="/interviews", tags=["Results"])
db = firestore.client()

@router.get("/{interview_id}/results")
async def get_results(interview_id: str, user=Depends(verify_firebase_token)):
    try:
        interview_ref = db.collection("interviews").document(interview_id)
        if not interview_ref.get().exists:
            raise HTTPException(status_code=404, detail="Interview not found")

        candidates_ref = interview_ref.collection("candidates").stream()
        results = []
        for doc in candidates_ref:
            candidate = doc.to_dict()
            candidate["token"] = doc.id
            results.append(candidate)

        return {"candidates": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
