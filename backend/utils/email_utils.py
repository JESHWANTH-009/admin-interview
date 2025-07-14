import requests
import os
from dotenv import load_dotenv

load_dotenv()

BREVO_API_KEY = os.getenv("BREVO_API_KEY")
FROM_EMAIL = os.getenv("SENDER_EMAIL")
FRONTEND_URL = os.getenv("FRONTEND_URL")


def send_interview_email(email: str, token: str):
    url = f"https://api.brevo.com/v3/smtp/email"
    payload = {
        "sender": {"name": "AI Interviewer", "email": FROM_EMAIL},
        "to": [{"email": email}],
        "subject": "Your Interview Link",
        "htmlContent": f"<p>Hello,<br>Your interview link: <a href='{FRONTEND_URL}/interview/{token}'>Click here</a></p>"
    }
    headers = {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json"
    }
    response = requests.post(url, json=payload, headers=headers)
    return response.status_code == 201
