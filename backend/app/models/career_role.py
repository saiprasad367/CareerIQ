"""
CareerIQ — CareerRole and RoleSkill models.
"""
from __future__ import annotations

from typing import Optional, List

from sqlalchemy import Boolean, Float, ForeignKey, String, Text, UniqueConstraint, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class CareerRole(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "career_roles"

    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    experience_level: Mapped[str] = mapped_column(
        String(50), default="entry", nullable=False,
    )
    responsibilities: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON list
    avg_salary_inr: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    growth_outlook: Mapped[Optional[str]] = mapped_column(
        String(50), nullable=True,
    )
    typical_experience: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    role_skills: Mapped[List["RoleSkill"]] = relationship(
        "RoleSkill", back_populates="role", cascade="all, delete-orphan"
    )


class RoleSkill(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "role_skills"
    __table_args__ = (
        UniqueConstraint("role_id", "skill_id", name="uq_role_skill"),
    )

    role_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("career_roles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    skill_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True
    )
    requirement_type: Mapped[str] = mapped_column(
        String(50), default="required", nullable=False,
    )
    importance_weight: Mapped[float] = mapped_column(Float, default=0.5, nullable=False)
    expected_proficiency: Mapped[str] = mapped_column(
        String(50), default="intermediate", nullable=False,
    )
    prerequisite_skill_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("skills.id", ondelete="SET NULL"), nullable=True
    )

    # Relationships
    role: Mapped["CareerRole"] = relationship("CareerRole", back_populates="role_skills")
    skill: Mapped["Skill"] = relationship("Skill", back_populates="role_skills", foreign_keys=[skill_id])
