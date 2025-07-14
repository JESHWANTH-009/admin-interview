# backend/schemas.py
from pydantic import BaseModel
from typing import List, Literal

class Question(BaseModel):
    question: str

class CreateInterviewRequest(BaseModel):
    title: str
    role: str
    question_type: Literal["MCQ", "Text"]
    questions: List[str]
