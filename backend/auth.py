# ai-interview-coach-backend/auth.py

import firebase_admin
from firebase_admin import auth as firebase_auth, credentials, firestore
from fastapi import HTTPException, status, Depends, APIRouter
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
from dotenv import load_dotenv
from pydantic import BaseModel
from datetime import datetime
from typing import Literal

# Load environment variables
load_dotenv()

auth_router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

# Firebase Initialization
if not firebase_admin._apps:
    service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY_PATH")
    if not service_account_path or not os.path.exists(service_account_path):
        raise FileNotFoundError(
            f"Firebase service account key file not found at {service_account_path}. "
            "Please ensure FIREBASE_SERVICE_ACCOUNT_KEY_PATH is set correctly in your .env file."
        )
    cred = credentials.Certificate(service_account_path)
    firebase_admin.initialize_app(cred)
    print("Firebase Admin SDK initialized successfully.")

# Bearer auth scheme
bearer_scheme = HTTPBearer()

# Save user info to Firestore (if not exists)
def save_user_to_firestore(uid: str, email: str, name: str = ""):
    db = firestore.client()
    print(f"Saving user: {uid}, {email}")  # Debug log
    user_ref = db.collection("users").document(uid)
    if not user_ref.get().exists:
        user_ref.set({
            "uid": uid,
            "email": email,
            "name": name,
            "created_at": firestore.SERVER_TIMESTAMP
        })

# Verify Firebase ID Token and log user in
# Verify Firebase ID Token and log user in
async def verify_firebase_token(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    try:
        # Debugging the raw token
        print("Authorization Header:", credentials.credentials if credentials else "None")

        token = credentials.credentials
        decoded_token = firebase_auth.verify_id_token(token)

        # Debug decoded token data
        print("Decoded Token:", decoded_token)

        uid = decoded_token.get("uid")
        email = decoded_token.get("email")
        name = decoded_token.get("name", "")  # Optional: Display name from Firebase

        # Save user to Firestore (if not exists)
        save_user_to_firestore(uid, email, name)

        return {
            "uid": uid,
            "email": email,
            "name": name
        }

    except Exception as e:
        print(f"Token verification failed: {str(e)}")  # Add this log
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Firebase token: {str(e)}"
        )
