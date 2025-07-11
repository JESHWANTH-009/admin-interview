import pdfplumber
import re
from fastapi import UploadFile
import io

def extract_questions_from_pdf(uploaded_file: UploadFile):
    questions = []

    # Read file contents into memory
    pdf_bytes = uploaded_file.file.read()
    file_stream = io.BytesIO(pdf_bytes)  # create file-like object

    with pdfplumber.open(file_stream) as pdf:
        combined = ""
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                combined += " " + text.replace('\n', ' ')

        # Regex to match numbered questions
        raw_questions = re.findall(r'\d+\.\s.*?(?=\s\d+\.|$)', combined)

        for q in raw_questions:
            clean_q = q.strip()
            if len(clean_q) > 10:
                questions.append(clean_q)

    return questions
