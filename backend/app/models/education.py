"""
CareerIQ — Education, Experience, and Project models.
"""
from __future__ import annotations

from typing import Optional
from datetime import date

from sqlalchemy import Boolean, Date, ForeignKey, Integer, String, Text, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Education(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "education"

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    institution: Mapped[str] = mapped_column(String(300), nullable=False)
    degree: Mapped[str] = mapped_column(String(200), nullable=False)
    field_of_study: Mapped[str] = mapped_column(String(200), nullable=False)
    start_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    end_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    grade_or_gpa: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_current: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)


class Experience(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "experience"

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    company: Mapped[str] = mapped_column(String(300), nullable=False)
    role_title: Mapped[str] = mapped_column(String(200), nullable=False)
    employment_type: Mapped[str] = mapped_column(
        SAEnum("full-time", "part-time", "internship", "contract", "freelance",
               name="employment_type_enum"),
        default="full-time", nullable=False,
    )
    start_date: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)  # YYYY-MM or YYYY-MM-DD
    end_date: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    is_current: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    skills_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON list of skill names


class Project(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "projects"

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    github_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    live_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    start_date: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    end_date: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    skills_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON list of skill names
    year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
