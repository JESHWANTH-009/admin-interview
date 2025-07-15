import os
import json
import re
import asyncio
from dotenv import load_dotenv
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted

# Load .env file
load_dotenv()

# Configure Gemini model
API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel("gemini-2.0-flash")

async def evaluate_answer(question: str, answer: str) -> dict:
    system_prompt = (
        "You are an AI evaluator. Evaluate the candidate's answer to the question below.\n"
        "Rate the answer with a score from 0 to 1 based on: Accuracy, Relevance, Clarity, and Completeness.\n"
        "Labels to consider: Accurate, Relevant, Irrelevant, Unclear, Incorrect.\n"
        "Return ONLY a JSON object with 'score' and 'feedback' as keys, and nothing else.\n"
        "Example: {\"score\": 0.8, \"feedback\": \"Good answer, but could be more detailed.\"}\n"
        f"\nQuestion: {question}\nAnswer: {answer}"
    )
    retries = 3
    for attempt in range(retries):
        try:
            # The SDK is sync, so run in a thread pool for async compatibility
            response = await asyncio.to_thread(
                model.generate_content,
                system_prompt,
                generation_config={"temperature": 0.2}
            )
            text = response.text
            match = re.search(r"\{.*?\}", text, re.DOTALL)
            if match:
                parsed = json.loads(match.group())
                score = parsed.get("score", 0)
                feedback = parsed.get("feedback", "")
                return {"score": score, "feedback": feedback}
            else:
                return {"score": 0, "feedback": f"LLM did not return a valid JSON object. Raw output: {text}"}
        except ResourceExhausted as e:
            if attempt < retries - 1:
                await asyncio.sleep(1)
                continue
            return {"score": 0, "feedback": f"Gemini overloaded: {str(e)}"}
        except Exception as e:
            if attempt < retries - 1:
                await asyncio.sleep(1)
                continue
            return {"score": 0, "feedback": f"Evaluation failed: {str(e)}"} 