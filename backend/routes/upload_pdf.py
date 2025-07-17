from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Depends
from fastapi.responses import JSONResponse
from auth import verify_firebase_token  # If you plan to re-enable authentication
import io
import re

router = APIRouter(prefix="/upload", tags=["Upload"])

@router.post("/pdf")
async def upload_pdf(
    file: UploadFile = File(...),
    # user=Depends(verify_firebase_token)  # Uncomment when using authentication
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

        # Clean and split text into lines
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        questions = []
        current_question = ""

        for line in lines:
            # Detect start of new question (e.g., "1.", "2)", etc.)
            if re.match(r'^\d+[\.\)]', line):
                if current_question:
                    questions.append(current_question.strip())
                current_question = line
            else:
                current_question += " " + line  # Continue appending to current question

        # Append last question if exists
        if current_question:
            questions.append(current_question.strip())

        return JSONResponse({"questions": questions})
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse PDF: {str(e)}")
