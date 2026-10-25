"""
CareerIQ — Company, Job, JobSkill, SavedJob, and JobMatch models.
"""
from __future__ import annotations

import re
from typing import Optional
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint, JSON, Enum as SAEnum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Company(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "companies"

    name: Mapped[str] = mapped_column(String(300), nullable=False)
    normalized_name: Mapped[str] = mapped_column(String(300), nullable=False, index=True)
    website: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    size: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    industry: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)

    def __init__(self, **kwargs):
        if "name" in kwargs and "normalized_name" not in kwargs:
            clean = re.sub(r"[^\w\s]", "", kwargs["name"].lower())
            kwargs["normalized_name"] = re.sub(r"\s+", " ", clean).strip()
        super().__init__(**kwargs)

    jobs: Mapped[list["Job"]] = relationship("Job", back_populates="company")


class Job(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "jobs"

    company_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("companies.id", ondelete="SET NULL"), nullable=True, index=True
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False, index=True)
    normalized_title: Mapped[str] = mapped_column(String(300), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String(200), nullable=True, index=True)
    work_mode: Mapped[str] = mapped_column(
        String(50),
        default="onsite", nullable=False, index=True,
    )
    employment_type: Mapped[str] = mapped_column(
        String(50),
        default="full-time", nullable=False,
    )
    experience_level: Mapped[str] = mapped_column(
        String(50),
        default="entry", nullable=False, index=True,
    )
    salary_min: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    salary_max: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    salary_currency: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    salary_display: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    responsibilities: Mapped[Optional[dict]] = mapped_column(JSON().with_variant(JSONB, "postgresql"), nullable=True)
    role_category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    source_name: Mapped[str] = mapped_column(String(100), default="curated", nullable=False)
    source_url: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    source_external_id: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    data_license: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    is_sample_data: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    posted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    collected_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)

    def __init__(self, **kwargs):
        if "title" in kwargs and "normalized_title" not in kwargs:
            clean = re.sub(r"[^\w\s]", "", kwargs["title"].lower())
            kwargs["normalized_title"] = re.sub(r"\s+", " ", clean).strip()
        super().__init__(**kwargs)

    company: Mapped[Optional["Company"]] = relationship("Company", back_populates="jobs")
    job_skills: Mapped[list["JobSkill"]] = relationship(
        "JobSkill", back_populates="job", cascade="all, delete-orphan"
    )


class JobSkill(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "job_skills"
    __table_args__ = (UniqueConstraint("job_id", "skill_id", name="uq_job_skill"),)

    job_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True
    )
    skill_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True
    )
    requirement_type: Mapped[str] = mapped_column(
        SAEnum("required", "preferred", name="job_skill_req_enum"),
        default="required", nullable=False,
    )
    importance_weight: Mapped[float] = mapped_column(Float, default=0.5, nullable=False)

    job: Mapped["Job"] = relationship("Job", back_populates="job_skills")
    skill: Mapped["Skill"] = relationship("Skill", back_populates="job_skills")


class SavedJob(Base):
    __tablename__ = "saved_jobs"
    __table_args__ = (UniqueConstraint("user_id", "job_id", name="uq_saved_job"),)

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True, nullable=False,
    )
    job_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("jobs.id", ondelete="CASCADE"),
        primary_key=True, nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )


class JobMatch(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "job_matches"

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    job_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True
    )
    resume_analysis_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("resume_analyses.id", ondelete="SET NULL"), nullable=True
    )
    score: Mapped[float] = mapped_column(Float, nullable=False)
    score_breakdown: Mapped[Optional[dict]] = mapped_column(JSON().with_variant(JSONB, "postgresql"), nullable=True)
    matched_skill_ids: Mapped[Optional[dict]] = mapped_column(JSON().with_variant(JSONB, "postgresql"), nullable=True)
    missing_skill_ids: Mapped[Optional[dict]] = mapped_column(JSON().with_variant(JSONB, "postgresql"), nullable=True)
    scoring_version: Mapped[str] = mapped_column(String(20), default="1.0", nullable=False)
