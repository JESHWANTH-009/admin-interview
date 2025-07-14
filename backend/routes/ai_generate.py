from fastapi import APIRouter, Depends, HTTPException
from auth import verify_firebase_token
from pydantic import BaseModel
from typing import Literal
from utils.ai_utils import generate_questions_gemini

router = APIRouter(prefix="/generate", tags=["AI"])

class AIGenerateRequest(BaseModel):
    role: str
    experience: str
    count: int
    question_type: Literal["MCQ", "Text"]

@router.post("/ai")
async def generate_ai_questions(data: AIGenerateRequest, user=Depends(verify_firebase_token)):
    try:
        questions = generate_questions_gemini(data.role, data.experience, data.count, data.question_type)
        return { "questions": questions }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
