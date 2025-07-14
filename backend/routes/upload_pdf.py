from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Depends
from fastapi.responses import JSONResponse
from auth import verify_firebase_token
import io

router = APIRouter(prefix="/upload", tags=["Upload"])

@router.post("/pdf")
async def upload_pdf(
    file: UploadFile = File(...),
    question_type: str = Form(...),
    # user=Depends(verify_firebase_token)  # Temporarily comment out for testing
):
    if not file.filename or not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    try:
        try:
            import pdfplumber
        except ImportError:
            raise HTTPException(status_code=500, detail="pdfplumber is not installed on the server.")
        contents = await file.read()
        with pdfplumber.open(io.BytesIO(contents)) as pdf:
            text = "\n".join(page.extract_text() or '' for page in pdf.pages)
        # Simple question extraction: one question per line
        questions = [line.strip() for line in text.split('\n') if line.strip()]
        # Optionally, filter/format based on question_type
        return JSONResponse({"questions": questions})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse PDF: {str(e)}") 