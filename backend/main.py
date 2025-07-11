from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import upload

app = FastAPI(title="AI Interview System")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","http://192.168.0.136:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(upload.router)
@app.get("/")
def root():
    return {"message": "AI-admin-interview is started"}