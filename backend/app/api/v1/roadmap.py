"""
CareerIQ — Learning Roadmap & Catalog API.
"""
from __future__ import annotations

from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.roadmap import (
    LearningResourceResponse,
    ProjectTemplateResponse,
    RoadmapOverview,
    RoadmapTaskCreate,
    RoadmapTaskResponse,
    RoadmapTaskStatusUpdate,
    RoadmapTaskUpdate,
)
from app.services.learning_service import LearningService

router = APIRouter(prefix="/roadmap", tags=["Learning Roadmap"])


@router.get("", response_model=RoadmapOverview)
async def get_roadmap(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = LearningService(db)
    roadmap = await service.get_user_roadmap(current_user.id)
    if roadmap.total_tasks == 0:
        # Generate initial roadmap automatically if user doesn't have one yet
        return await service.generate_roadmap(current_user.id)
    return roadmap


@router.post("/generate", response_model=RoadmapOverview)
async def generate_roadmap(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    role_id: Optional[str] = None,
):
    service = LearningService(db)
    return await service.generate_roadmap(current_user.id, role_id=role_id)


@router.post("/tasks", response_model=RoadmapTaskResponse, status_code=status.HTTP_201_CREATED)
async def create_custom_task(
    data: RoadmapTaskCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = LearningService(db)
    return await service.create_custom_task(current_user.id, data)


@router.patch("/tasks/{task_id}/status", response_model=RoadmapTaskResponse)
async def update_task_status(
    task_id: str,
    data: RoadmapTaskStatusUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = LearningService(db)
    return await service.update_task_status(current_user.id, task_id, data.status)


@router.delete("/tasks/{task_id}", response_model=MessageResponse)
async def delete_task(
    task_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = LearningService(db)
    await service.delete_task(current_user.id, task_id)
    return MessageResponse(message="Roadmap task removed.")


@router.get("/resources", response_model=List[LearningResourceResponse])
async def get_learning_resources(
    db: Annotated[AsyncSession, Depends(get_db)],
    skill: Optional[str] = None,
):
    service = LearningService(db)
    return await service.get_resources(skill_name=skill)


@router.get("/project-templates", response_model=List[ProjectTemplateResponse])
async def get_project_templates(
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = LearningService(db)
    return await service.get_project_templates()
