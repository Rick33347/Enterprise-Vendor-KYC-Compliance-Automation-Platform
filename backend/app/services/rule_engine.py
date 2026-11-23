import re
from datetime import datetime
from typing import Literal
from pydantic import BaseModel

from app.schemas.extraction import DocumentExtraction


# --- Output Schemas ---
class RuleFlag(BaseModel):
    rule_id: str
    severity: Literal["LOW", "MEDIUM", "HIGH"]
    message: str


class ComplianceReport(BaseModel):
    status: Literal["APPROVED", "REVIEW_REQUIRED", "REJECTED"]
    compliance_score: int
    flags: list[RuleFlag]
    extracted_data: DocumentExtraction


# --- Allowed KYC Document Types ---
ALLOWED_KYC_TYPES = {
    "invoice",
    "tax form",
    "gst certificate",
    "pan card",
    "contract",
    "business license",
    "incorporation certificate",
    "bank statement",
}


def evaluate_compliance(data: DocumentExtraction) -> ComplianceReport:
    """
    Runs deterministic compliance rules against AI-extracted document data.
    Starts at a score of 100 and deducts points for each violated rule.
    """
    flags: list[RuleFlag] = []
    score = 100

    # Rule 1: AI Extraction Confidence Check
    if data.confidence_score < 60:
        score -= 40
        flags.append(RuleFlag(
            rule_id="LOW_CONFIDENCE_CRITICAL",
            severity="HIGH",
            message=f"Extraction confidence is critically low ({data.confidence_score}%). Manual review required."
        ))
    elif data.confidence_score < 80:
        score -= 20
        flags.append(RuleFlag(
            rule_id="LOW_CONFIDENCE_WARNING",
            severity="MEDIUM",
            message=f"Extraction confidence is below threshold ({data.confidence_score}% < 80%)."
        ))

    # Rule 2: Organization / Vendor Name Presence
    if not data.organization_name or not data.organization_name.strip():
        score -= 30
        flags.append(RuleFlag(
            rule_id="MISSING_ORGANIZATION",
            severity="HIGH",
            message="No organization or vendor name could be identified on the document."
        ))

    # Rule 3: Document Type Whitelist (KYC Relevance)
    doc_type_clean = data.document_type.strip().lower()
    if doc_type_clean not in ALLOWED_KYC_TYPES:
        score -= 35
        flags.append(RuleFlag(
            rule_id="UNSUPPORTED_DOC_TYPE",
            severity="HIGH",
            message=f"Document classified as '{data.document_type}', which is not an approved KYC document type."
        ))

    # Rule 4: Date Presence & Staleness Check
    if not data.important_dates:
        score -= 15
        flags.append(RuleFlag(
            rule_id="MISSING_DATES",
            severity="MEDIUM",
            message="No issue, expiry, or reference dates were found on the document."
        ))
    else:
        # Extract all 4-digit years (e.g., "2018-2019" -> [2018, 2019])
        years = [
            int(year)
            for date_str in data.important_dates
            for year in re.findall(r"\b(19\d{2}|20\d{2})\b", date_str)
        ]
        current_year = datetime.now().year
        if years and max(years) < current_year - 2:
            score -= 25
            flags.append(RuleFlag(
                rule_id="DOCUMENT_OUTDATED",
                severity="HIGH",
                message=f"Most recent date found ({max(years)}) is more than 2 years old."
            ))

    # Clamp score between 0 and 100
    final_score = max(0, score)

    # Determine Final Status
    high_severity_count = sum(1 for f in flags if f.severity == "HIGH")
    if final_score < 50 or high_severity_count >= 2:
        status = "REJECTED"
    elif final_score < 80 or len(flags) > 0:
        status = "REVIEW_REQUIRED"
    else:
        status = "APPROVED"

    return ComplianceReport(
        status=status,
        compliance_score=final_score,
        flags=flags,
        extracted_data=data,
    )


# --- End-to-End Pipeline Test ---
if __name__ == "__main__":
    from app.services.document_parser import extract_text_from_pdf
    from app.services.AI_extractor import extract_structured_data

    test_pdf_path = "app/services/sample_invoice.pdf"

    print("1. Parsing PDF...")
    raw_text = extract_text_from_pdf(test_pdf_path)

    print("2. Extracting structured data with Groq...")
    extracted = extract_structured_data(raw_text)

    print("3. Running Compliance Rule Engine...")
    report = evaluate_compliance(extracted)

    print("\n--- Final Compliance Report ---")
    print(report.model_dump_json(indent=2))