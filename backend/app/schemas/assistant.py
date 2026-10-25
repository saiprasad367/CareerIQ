"""
CareerIQ — AI Career Assistant schemas.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel


class ChatMessageRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


class ChatMessageItem(BaseModel):
    id: str
    role: str  # user, assistant
    content: str
    created_at: datetime
    metadata: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class ChatSessionResponse(BaseModel):
    id: str
    title: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    messages: List[ChatMessageItem] = []

    class Config:
        from_attributes = True


class ChatResponse(BaseModel):
    session_id: str
    response: str
    model_mode: str  # "deterministic_contextual_fallback" or "gemini_pro"
    suggested_actions: Optional[List[str]] = None
