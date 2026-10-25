"""
CareerIQ — Resume document and analysis models.
"""
from __future__ import annotations

from typing import Optional
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, JSON, Enum as SAEnum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class ResumeDocument(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "resume_documents"

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    original_filename: Mapped[str] = mapped_column(String(500), nullable=False)
    storage_key: Mapped[str] = mapped_column(String(1000), nullable=False)
    content_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    checksum_sha256: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    parsing_status: Mapped[str] = mapped_column(
        String(50),
        default="pending", nullable=False,
    )
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    analyses: Mapped[list["ResumeAnalysis"]] = relationship(
        "ResumeAnalysis", back_populates="resume", cascade="all, delete-orphan"
    )


class ResumeAnalysis(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "resume_analyses"

    resume_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("resume_documents.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    analysis_version: Mapped[str] = mapped_column(String(20), default="1.0", nullable=False)
    parser_version: Mapped[str] = mapped_column(String(20), default="1.0", nullable=False)
    raw_text_reference: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    parsed_payload: Mapped[Optional[dict]] = mapped_column(JSON().with_variant(JSONB, "postgresql"), nullable=True)
    readability_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    ats_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    section_scores: Mapped[Optional[dict]] = mapped_column(JSON().with_variant(JSONB, "postgresql"), nullable=True)
    suggested_roles: Mapped[Optional[dict]] = mapped_column(JSON().with_variant(JSONB, "postgresql"), nullable=True)
    missing_info: Mapped[Optional[dict]] = mapped_column(JSON().with_variant(JSONB, "postgresql"), nullable=True)
    analysis_status: Mapped[str] = mapped_column(
        String(50),
        default="pending", nullable=False,
    )
    error_code: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    resume: Mapped["ResumeDocument"] = relationship("ResumeDocument", back_populates="analyses")


class ResumeAnalysisSkill(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "resume_analysis_skills"

    analysis_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("resume_analyses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    skill_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True
    )
    evidence_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    confidence: Mapped[Optional[float]] = mapped_column(Float, default=0.8, nullable=True)
    evidence_section: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
