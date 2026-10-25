"""
CareerIQ — Learning resources, project templates, and roadmap task models.
"""
from __future__ import annotations

from typing import Optional, List
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class ResourceSkill(Base):
    __tablename__ = "resource_skills"
    __table_args__ = (UniqueConstraint("resource_id", "skill_id", name="uq_resource_skill"),)

    resource_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("learning_resources.id", ondelete="CASCADE"), primary_key=True
    )
    skill_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True
    )

    resource: Mapped["LearningResource"] = relationship("LearningResource", back_populates="resource_skills")
    skill: Mapped["Skill"] = relationship("Skill")


class ProjectTemplateSkill(Base):
    __tablename__ = "project_template_skills"
    __table_args__ = (UniqueConstraint("project_template_id", "skill_id", name="uq_project_template_skill"),)

    project_template_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("project_templates.id", ondelete="CASCADE"), primary_key=True
    )
    skill_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True
    )

    template: Mapped["ProjectTemplate"] = relationship("ProjectTemplate", back_populates="template_skills")
    skill: Mapped["Skill"] = relationship("Skill")


class LearningResource(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "learning_resources"

    title: Mapped[str] = mapped_column(String(400), nullable=False)
    provider: Mapped[str] = mapped_column(String(200), nullable=False)
    url: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    difficulty: Mapped[str] = mapped_column(String(50), default="intermediate", nullable=False)
    estimated_hours: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    resource_type: Mapped[str] = mapped_column(String(50), default="course", nullable=False)
    is_free: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    last_verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    skills_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    resource_skills: Mapped[List["ResourceSkill"]] = relationship(
        "ResourceSkill", back_populates="resource", cascade="all, delete-orphan"
    )


class ProjectTemplate(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "project_templates"

    title: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    difficulty: Mapped[str] = mapped_column(String(50), default="medium", nullable=False)
    estimated_hours: Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    repository_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    skills_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    template_skills: Mapped[List["ProjectTemplateSkill"]] = relationship(
        "ProjectTemplateSkill", back_populates="template", cascade="all, delete-orphan"
    )


class RoadmapTask(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "roadmap_tasks"

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    role_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("career_roles.id", ondelete="SET NULL"), nullable=True
    )
    resource_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("learning_resources.id", ondelete="SET NULL"), nullable=True
    )
    project_template_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("project_templates.id", ondelete="SET NULL"), nullable=True
    )
    title: Mapped[str] = mapped_column(String(400), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    phase: Mapped[str] = mapped_column(String(50), default="Foundation", nullable=False, index=True)
    difficulty: Mapped[str] = mapped_column(String(50), default="beginner", nullable=False)
    estimated_hours: Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="todo", nullable=False, index=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_custom: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    resource: Mapped[Optional["LearningResource"]] = relationship("LearningResource")
    project_template: Mapped[Optional["ProjectTemplate"]] = relationship("ProjectTemplate")
