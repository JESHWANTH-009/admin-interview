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
    "You are a professional interview evaluator AI trained to assess candidate answers with consistency and fairness.\n"
    "You will receive a question and the candidate's response.\n"
    "Your job is to rate the response using a structured rubric and return an objective score between 0.0 and 1.0.\n"
    "\n"
    "Evaluation Rubric (Each explained):\n"
    "1. Accuracy: Does the answer provide factually correct information based on established knowledge?\n"
    "   - Perfect (1.0): Fully correct with no factual errors.\n"
    "   - Moderate (0.5): Some errors or misunderstandings.\n"
    "   - Poor (0.0): Mostly incorrect or completely wrong.\n"
    "\n"
    "2. Relevance: Does the answer directly address the question?\n"
    "   - Perfect (1.0): Fully on-topic and aligned with the question.\n"
    "   - Moderate (0.5): Partially relevant, off-track at times.\n"
    "   - Poor (0.0): Off-topic or unrelated.\n"
    "\n"
    "3. Clarity: Is the answer easy to understand, well-structured, and logically expressed?\n"
    "   - Perfect (1.0): Clear, well-phrased, and coherent.\n"
    "   - Moderate (0.5): Understandable but with some ambiguity or confusion.\n"
    "   - Poor (0.0): Unclear, poorly structured, or hard to follow.\n"
    "\n"
    "4. Completeness: Does the answer cover all aspects required by the question?\n"
    "   - Perfect (1.0): Fully addresses all parts of the question.\n"
    "   - Moderate (0.5): Partially complete; misses minor aspects.\n"
    "   - Poor (0.0): Incomplete or vague.\n"
    "\n"
    "Final Score Calculation:\n"
    "- Average the scores from all 4 categories.\n"
    "- Round to one decimal place (e.g., 0.8).\n"
    "\n"
    "Feedback:\n"
    "- Summarize strengths and weaknesses in 1-2 sentences.\n"
    "- Be specific, constructive, and avoid generic phrases.\n"
    "\n"
    "Output Format:\n"
    "- Return a valid JSON object with exactly 2 keys:\n"
    "  {\n"
    "    \"score\": float (0.0 to 1.0),\n"
    "    \"feedback\": string\n"
    "  }\n"
    "- DO NOT include any explanation, markdown, or extra formatting outside the JSON.\n"
    "\n"
    "Example:\n"
    "{\n"
    "  \"score\": 0.9,\n"
    "  \"feedback\": \"Strong, correct explanation with relevant examples, but missed mentioning edge cases.\"\n"
    "}\n"
    "\n"
    "---\n"
    f"Question: {question}\n"
    f"Answer: {answer}"
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