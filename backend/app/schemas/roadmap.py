"""
CareerIQ — Learning resources, project templates, and roadmap task schemas.
"""
from __future__ import annotations

from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class LearningResourceResponse(BaseModel):
    id: str
    title: str
    provider: str
    url: str
    description: str
    difficulty: str  # beginner, intermediate, advanced
    estimated_hours: Optional[int] = None
    resource_type: str  # course, documentation, video, tutorial
    skills: List[str] = []

    class Config:
        from_attributes = True


class ProjectTemplateResponse(BaseModel):
    id: str
    title: str
    description: str
    difficulty: str
    estimated_hours: int
    repository_url: Optional[str] = None
    skills: List[str] = []

    class Config:
        from_attributes = True


class RoadmapTaskBase(BaseModel):
    role_id: Optional[str] = None
    resource_id: Optional[str] = None
    project_template_id: Optional[str] = None
    title: str
    description: str
    phase: str = "Foundation"  # Foundation, Core Skills, Advanced, Capstone
    difficulty: str = "beginner"
    estimated_hours: int = 10
    status: str = "todo"  # todo, in_progress, completed
    sort_order: int = 0
    is_custom: bool = False


class RoadmapTaskCreate(RoadmapTaskBase):
    pass


class RoadmapTaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    phase: Optional[str] = None
    difficulty: Optional[str] = None
    estimated_hours: Optional[int] = None
    status: Optional[str] = None
    sort_order: Optional[int] = None


class RoadmapTaskStatusUpdate(BaseModel):
    status: str = Field(..., description="todo, in_progress, completed")


class RoadmapTaskResponse(RoadmapTaskBase):
    id: str
    user_id: str
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class RoadmapOverview(BaseModel):
    role_title: str
    completion_percentage: float
    total_tasks: int
    completed_tasks: int
    in_progress_tasks: int
    estimated_hours_remaining: int
    tasks: List[RoadmapTaskResponse]
