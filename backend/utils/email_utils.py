import requests
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Required environment variables
BREVO_API_KEY = os.getenv("BREVO_API_KEY")
FROM_EMAIL = os.getenv("SENDER_EMAIL")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")  # fallback to localhost

if not BREVO_API_KEY or not FROM_EMAIL:
    raise ValueError("BREVO_API_KEY or SENDER_EMAIL not set in environment variables")

# Sends email using token (used if only token is passed, link is auto-generated)
def send_interview_email(email: str, token: str) -> bool:
    interview_link = f"{FRONTEND_URL}/interview/{token}"
    return send_email_via_brevo(email, interview_link)

# Sends email using full custom link
def send_email_via_brevo(email: str, link: str) -> bool:
    url = "https://api.brevo.com/v3/smtp/email"
    payload = {
        "sender": {
            "name": "AI Interviewer",
            "email": FROM_EMAIL
        },
        "to": [{"email": email}],
        "subject": "Your Interview Invitation",
        "htmlContent": f"""
            <html>
                <body>
                    <p>Hello,</p>
                    <p>You are invited to an interview.</p>
                    <p><a href="{link}">Click here to start your interview</a></p>
                </body>
            </html>
        """
    }
    headers = {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json"
    }
    response = requests.post(url, json=payload, headers=headers)

    if response.status_code != 201:
        print(f"Email to {email} failed: {response.status_code} - {response.text}")
    else:
        print(f"Email sent to {email}")

    return response.status_code == 201
