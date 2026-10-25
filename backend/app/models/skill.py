"""
CareerIQ — Skill taxonomy models: Skill, SkillAlias, CandidateSkill.
"""
from __future__ import annotations

from typing import Optional, List

from sqlalchemy import Float, ForeignKey, String, Text, UniqueConstraint, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


import re

SKILL_CATEGORIES = (
    "programming", "frontend", "backend", "database",
    "devops", "ai-ml", "cloud", "tools", "soft-skills", "other"
)


class Skill(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "skills"

    canonical_name: Mapped[str] = mapped_column(String(200), nullable=False)
    normalized_key: Mapped[str] = mapped_column(String(200), unique=True, nullable=False, index=True)
    category: Mapped[str] = mapped_column(
        String(50), nullable=False, default="general"
    )
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    demand_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    def __init__(self, **kwargs):
        if "canonical_name" in kwargs and "normalized_key" not in kwargs:
            clean = re.sub(r"[^\w\s\+\#]", "", kwargs["canonical_name"].lower())
            kwargs["normalized_key"] = re.sub(r"\s+", " ", clean).strip()
        super().__init__(**kwargs)

    # Relationships
    aliases: Mapped[List["SkillAlias"]] = relationship(
        "SkillAlias", back_populates="skill", cascade="all, delete-orphan"
    )
    candidate_skills: Mapped[List["CandidateSkill"]] = relationship(
        "CandidateSkill", back_populates="skill"
    )
    role_skills: Mapped[List["RoleSkill"]] = relationship(
        "RoleSkill", primaryjoin="Skill.id == RoleSkill.skill_id", back_populates="skill"
    )
    job_skills: Mapped[List["JobSkill"]] = relationship("JobSkill", back_populates="skill")


class SkillAlias(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "skill_aliases"
    __table_args__ = (UniqueConstraint("normalized_alias", name="uq_skill_alias_norm"),)

    skill_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True
    )
    alias: Mapped[str] = mapped_column(String(200), nullable=False)
    normalized_alias: Mapped[str] = mapped_column(String(200), nullable=False, index=True)

    skill: Mapped["Skill"] = relationship("Skill", back_populates="aliases")

    def __init__(self, **kwargs):
        if "alias" in kwargs and "normalized_alias" not in kwargs:
            clean = re.sub(r"[^\w\s\+\#]", "", kwargs["alias"].lower())
            kwargs["normalized_alias"] = re.sub(r"\s+", " ", clean).strip()
        super().__init__(**kwargs)


class CandidateSkill(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "candidate_skills"
    __table_args__ = (UniqueConstraint("user_id", "skill_id", name="uq_candidate_skill"),)

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    skill_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True
    )
    proficiency: Mapped[str] = mapped_column(
        String(50), default="intermediate", nullable=False,
    )
    years_experience: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    evidence_source: Mapped[str] = mapped_column(
        String(50), default="user_entered", nullable=False,
    )
    evidence_reference: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    skill: Mapped["Skill"] = relationship("Skill", back_populates="candidate_skills")
