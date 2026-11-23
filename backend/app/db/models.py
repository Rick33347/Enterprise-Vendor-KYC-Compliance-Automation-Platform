from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, JSON
from app.db.database import Base


class EvaluationRecord(Base):
    __tablename__ = "evaluations"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    organization_name = Column(String, nullable=True)
    document_type = Column(String, nullable=False)
    important_dates = Column(JSON, default=list)
    confidence_score = Column(Integer, nullable=False)
    compliance_score = Column(Integer, nullable=False)
    status = Column(String, nullable=False)
    flags = Column(JSON, default=list)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))