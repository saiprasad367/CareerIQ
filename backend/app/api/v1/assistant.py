"""
CareerIQ — Career Assistant Chat API.
"""
from __future__ import annotations

from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.assistant import (
    ChatMessageRequest,
    ChatResponse,
    ChatSessionResponse,
)
from app.schemas.common import MessageResponse
from app.services.assistant_service import AssistantService

router = APIRouter(prefix="/assistant", tags=["Career Assistant"])


@router.get("/sessions", response_model=List[ChatSessionResponse])
async def get_chat_sessions(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = AssistantService(db)
    return await service.get_sessions(current_user.id)


@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(
    data: ChatMessageRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = AssistantService(db)
    return await service.chat(current_user.id, data.message, session_id=data.session_id)


@router.delete("/sessions/{session_id}", response_model=MessageResponse)
async def delete_chat_session(
    session_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = AssistantService(db)
    await service.delete_session(current_user.id, session_id)
    return MessageResponse(message="Chat session deleted.")
