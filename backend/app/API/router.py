import os
import shutil
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException

from app.services.document_parser import extract_text_from_pdf
from app.services.AI_extractor import extract_structured_data
from app.services.rule_engine import evaluate_compliance, ComplianceReport

router = APIRouter(prefix="/api/v1", tags=["KYC Compliance"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/evaluate-document", response_model=ComplianceReport)
async def evaluate_document(file: UploadFile = File(...)):
    # 1. Validate file type
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    # 2. Save uploaded file temporarily with a unique name
    temp_filename = f"{uuid.uuid4()}_{file.filename}"
    temp_path = os.path.join(UPLOAD_DIR, temp_filename)

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 3. Run the 3-stage pipeline
        raw_text = extract_text_from_pdf(temp_path)
        if not raw_text or "Failed to process" in raw_text:
            raise HTTPException(status_code=422, detail="Could not extract readable text from the PDF.")

        extracted_data = extract_structured_data(raw_text)
        compliance_report = evaluate_compliance(extracted_data)

        return compliance_report

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline error: {str(e)}")
    finally:
        # 4. Always clean up the temporary PDF
        if os.path.exists(temp_path):
            os.remove(temp_path)