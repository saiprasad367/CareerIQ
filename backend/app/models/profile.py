"""
CareerIQ — Candidate profile model.
"""
from __future__ import annotations

from typing import Optional, List
from sqlalchemy import Boolean, ForeignKey, String, Text, ARRAY, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class CandidateProfile(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "candidate_profiles"

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"),
        unique=True, nullable=False, index=True,
    )
    full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    headline: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    linkedin_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    github_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    education_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    experience_level: Mapped[str] = mapped_column(
        String(50), default="entry", nullable=False,
    )
    target_salary: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    target_role_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("career_roles.id", ondelete="SET NULL"), nullable=True
    )
    work_mode: Mapped[str] = mapped_column(
        String(50), default="hybrid", nullable=False,
    )
    preferred_locations: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON-serialized list
    career_goal: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    target_roles_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON list of role strings
    onboarding_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="profile")
    target_role: Mapped[Optional["CareerRole"]] = relationship("CareerRole", foreign_keys=[target_role_id])
