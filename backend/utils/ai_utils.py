import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def generate_questions_gemini(role: str, experience: str, count: int, question_type: str) -> list:
    prompt = (
        f"Generate {count} {question_type.upper()} interview questions "
        f"for a {role} with {experience} experience. "
        "Be clear and job-relevant. Return only the questions."
    )

    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(prompt)

    # Split by newlines or bullet points
    if hasattr(response, "text"):
        lines = [q.strip() for q in response.text.strip().split('\n') if q.strip()]
        return lines
    else:
        return []
