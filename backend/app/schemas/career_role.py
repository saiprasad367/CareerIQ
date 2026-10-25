"""
CareerIQ — CareerRole and RoleSkill schemas.
"""
from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel


class RoleSkillItem(BaseModel):
    skill_id: str
    skill_name: str
    requirement_type: str  # required or preferred
    importance_weight: float
    expected_proficiency: str


class CareerRoleBase(BaseModel):
    slug: str
    title: str
    description: str
    category: str
    experience_level: str = "entry"
    responsibilities: Optional[str] = None


class CareerRoleResponse(CareerRoleBase):
    id: str
    is_active: bool
    skills: Optional[List[RoleSkillItem]] = None

    class Config:
        from_attributes = True


class CareerRoleRecommendation(BaseModel):
    role_id: str
    slug: str
    title: str
    description: str
    category: str
    match_percentage: float
    matched_skills: List[str]
    missing_critical_skills: List[str]
    readiness_level: str  # High, Moderate, Developing
