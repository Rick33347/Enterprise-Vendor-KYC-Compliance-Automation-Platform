from pydantic import BaseModel, Field
from typing import Optional

class DocumentExtraction(BaseModel):
    """
    This defines the exact structure we will force the AI to return.
    The descriptions tell the AI exactly how to identify each field.
    """
    organization_name: str = Field(
        ..., 
        description="The name of the company, vendor, or institution on the document."
    )
    document_type: str = Field(
        ..., 
        description="The classification of the document (e.g., Invoice, Tax Form, Syllabus, Contract)."
    )
    important_dates: Optional[list[str]] = Field(
        default_factory=list, 
        description="Any critical dates mentioned in the document, such as issue dates, semesters, or expiry dates."
    )
    confidence_score: int = Field(
        ..., 
        description="Your confidence score from 1 to 100 that this extraction is highly accurate."
    )