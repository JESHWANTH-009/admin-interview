# ai-interview-coach-backend/auth.py
import firebase_admin
from firebase_admin import auth, credentials, firestore
from fastapi import HTTPException, status, Depends, APIRouter
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
from dotenv import load_dotenv
from pydantic import BaseModel

# Load environment variables
load_dotenv()

# Define the auth router
auth_router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

# Firebase Initialization (only once)
if not firebase_admin._apps:
    service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY_PATH")#firebase file
    if not service_account_path or not os.path.exists(service_account_path):
        raise FileNotFoundError(
            f"Firebase service account key file not found at {service_account_path}. "
            "Please ensure FIREBASE_SERVICE_ACCOUNT_KEY_PATH is set correctly in your .env file."
        )
    cred = credentials.Certificate(service_account_path)
    firebase_admin.initialize_app(cred)
    print("Firebase Admin SDK initialized successfully.")

#HTTPBearer
bearer_scheme = HTTPBearer()

async def verify_firebase_token(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    try:
        token = credentials.credentials
        decoded_token = firebase_auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Firebase token"
        )