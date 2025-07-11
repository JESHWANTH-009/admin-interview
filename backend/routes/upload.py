from fastapi import APIRouter, UploadFile, File, HTTPException
from utils.pdf_parser import extract_questions_from_pdf

router = APIRouter(prefix="/upload", tags=["PDF Upload"])

@router.post("/pdf")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed.")
    
    try:
        questions = extract_questions_from_pdf(file)
        return {"questions": questions[:20]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")