import os
import shutil
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session

from app.services.document_parser import extract_text_from_pdf
from app.services.AI_extractor import extract_structured_data
from app.services.rule_engine import evaluate_compliance, ComplianceReport
from app.db.database import get_db
from app.db.models import EvaluationRecord

router = APIRouter(prefix="/api/v1", tags=["KYC Compliance"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/evaluate-document", response_model=ComplianceReport)
async def evaluate_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    temp_filename = f"{uuid.uuid4()}_{file.filename}"
    temp_path = os.path.join(UPLOAD_DIR, temp_filename)

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        raw_text = extract_text_from_pdf(temp_path)
        if not raw_text or "Failed to process" in raw_text:
            raise HTTPException(status_code=422, detail="Could not extract readable text from the PDF.")

        extracted_data = extract_structured_data(raw_text)
        compliance_report = evaluate_compliance(extracted_data)

        # Save evaluation record to SQLite
        db_record = EvaluationRecord(
            filename=file.filename,
            organization_name=extracted_data.organization_name,
            document_type=extracted_data.document_type,
            important_dates=extracted_data.important_dates,
            confidence_score=extracted_data.confidence_score,
            compliance_score=compliance_report.compliance_score,
            status=compliance_report.status,
            flags=[flag.model_dump() for flag in compliance_report.flags],
        )
        db.add(db_record)
        db.commit()
        db.refresh(db_record)

        return compliance_report

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline error: {str(e)}")
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


@router.get("/history")
def get_evaluation_history(db: Session = Depends(get_db)):
    """Returns all past KYC document evaluations, newest first."""
    records = db.query(EvaluationRecord).order_by(EvaluationRecord.created_at.desc()).all()
    return records