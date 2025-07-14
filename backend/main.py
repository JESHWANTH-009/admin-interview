# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.interview import router as interview_router
from routes.upload_pdf import router as upload_pdf_router  # Uncomment this
from routes.ai_generate import router as ai_generate_router
from routes.candidate import router as candidate_router
from routes.invite import router as invite_router
from routes.results import router as results_router
app = FastAPI()

# Allow frontend
origins = [
    "http://localhost:3000",
    "http://192.168.31.43:3000",
      # React frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(interview_router)
app.include_router(upload_pdf_router)  # Uncomment this
app.include_router(ai_generate_router)
app.include_router(candidate_router)
app.include_router(invite_router)
app.include_router(results_router)

@app.get("/")
def root():
    return { "message": "AI Interview API" }
