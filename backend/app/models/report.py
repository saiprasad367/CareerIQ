"""
CareerIQ — Reports, user preferences, and analysis run models.
"""
from __future__ import annotations

from typing import Optional
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, JSON, Enum as SAEnum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class CareerReport(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "career_reports"

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    report_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False, index=True,
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    report_payload: Mapped[Optional[dict]] = mapped_column(JSON().with_variant(JSONB, "postgresql"), nullable=True)
    role_title: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)


class UserPreferences(Base, TimestampMixin):
    __tablename__ = "user_preferences"

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True, nullable=False,
    )
    default_role_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("career_roles.id", ondelete="SET NULL"), nullable=True
    )
    score_threshold: Mapped[int] = mapped_column(Integer, default=60, nullable=False)
    show_demo_badges: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    show_formulas: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    job_alerts: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    roadmap_reminders: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    application_followups: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    weekly_digest: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)


# Alias for singular import compatibility
UserPreference = UserPreferences


class AnalysisRun(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "analysis_runs"

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    analysis_type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    input_version: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    model_version: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    scoring_version: Mapped[str] = mapped_column(String(20), default="1.0", nullable=False)
    status: Mapped[str] = mapped_column(
        String(50), default="pending", nullable=False
    )
    metrics: Mapped[Optional[dict]] = mapped_column(JSON().with_variant(JSONB, "postgresql"), nullable=True)
    error_code: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
