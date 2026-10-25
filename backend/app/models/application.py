"""
CareerIQ — Application tracker model.
"""
from __future__ import annotations

from typing import Optional
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


APPLICATION_STATUSES = ("saved", "applied", "assessment", "interview", "offer", "rejected", "withdrawn")


class Application(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "applications"

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    job_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("jobs.id", ondelete="SET NULL"), nullable=True
    )
    job_title: Mapped[str] = mapped_column(String(300), nullable=False)
    company: Mapped[str] = mapped_column(String(300), nullable=False)
    location: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    work_mode: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    salary: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(
        String(50),
        default="Applied", nullable=False, index=True,
    )
    applied_date: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    follow_up_date: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    next_action: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
