"""
CareerIQ — Authentication request and response schemas.
"""
from __future__ import annotations

from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=2, max_length=200)
    role: str = Field(default="candidate")


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user_id: str
    email: str
    role: str
    full_name: str
    onboarding_completed: bool


class RefreshRequest(BaseModel):
    refresh_token: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    is_active: bool
    full_name: Optional[str] = None
    onboarding_completed: bool = False
