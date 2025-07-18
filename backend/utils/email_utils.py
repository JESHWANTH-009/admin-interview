import os
from dotenv import load_dotenv
import aiosmtplib
from email.message import EmailMessage

load_dotenv()

EMAIL_FROM = os.getenv("EMAIL_FROM")            # e.g., jeshwanth912@gmail.com
EMAIL_USER = os.getenv("EMAIL_USER")            # e.g., 9204f4001@smtp-brevo.com
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")    # Brevo SMTP key
EMAIL_HOST = os.getenv("EMAIL_HOST")            # smtp-relay.brevo.com
EMAIL_PORT = int(os.getenv("EMAIL_PORT"))       # 587

async def send_email(to_email: str, subject: str, body: str):
    message = EmailMessage()
    message["From"] = EMAIL_FROM
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(body)

    try:
        await aiosmtplib.send(
            message,
            hostname=EMAIL_HOST,
            port=EMAIL_PORT,
            username=EMAIL_USER,          # ✅ Correct username
            password=EMAIL_PASSWORD,
            start_tls=True,
        )
        print("Email sent successfully!")
    except Exception as e:
        print("Failed to send email:", str(e))
