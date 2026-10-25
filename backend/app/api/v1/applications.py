"""
CareerIQ — Job Applications Tracker API (Kanban Board).
"""
from __future__ import annotations

from typing import Annotated, List
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.errors import NotFoundError
from app.db.session import get_db
from app.models.application import Application
from app.models.user import User
from app.schemas.application import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationStatusUpdate,
    ApplicationUpdate,
)
from app.schemas.common import MessageResponse

router = APIRouter(prefix="/applications", tags=["Applications Tracker"])


@router.get("", response_model=List[ApplicationResponse])
async def list_applications(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    stmt = (
        select(Application)
        .where(Application.user_id == current_user.id)
        .order_by(Application.updated_at.desc())
    )
    return list((await db.execute(stmt)).scalars().all())


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_application(
    data: ApplicationCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    app_record = Application(user_id=current_user.id, **data.model_dump())
    db.add(app_record)
    await db.commit()
    await db.refresh(app_record)
    return app_record


@router.patch("/{application_id}/status", response_model=ApplicationResponse)
async def update_application_status(
    application_id: str,
    data: ApplicationStatusUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    app_record = await db.get(Application, application_id)
    if not app_record or app_record.user_id != current_user.id:
        raise NotFoundError("Application record not found.")

    app_record.status = data.status
    await db.commit()
    await db.refresh(app_record)
    return app_record


@router.patch("/{application_id}", response_model=ApplicationResponse)
async def update_application(
    application_id: str,
    data: ApplicationUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    app_record = await db.get(Application, application_id)
    if not app_record or app_record.user_id != current_user.id:
        raise NotFoundError("Application record not found.")

    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(app_record, k, v)
    await db.commit()
    await db.refresh(app_record)
    return app_record


@router.delete("/{application_id}", response_model=MessageResponse)
async def delete_application(
    application_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    app_record = await db.get(Application, application_id)
    if not app_record or app_record.user_id != current_user.id:
        raise NotFoundError("Application record not found.")

    await db.delete(app_record)
    await db.commit()
    return MessageResponse(message="Application deleted successfully.")
