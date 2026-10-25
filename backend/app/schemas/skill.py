"""
CareerIQ — Skill taxonomy and candidate skill schemas.
"""
from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel, Field


class SkillBase(BaseModel):
    canonical_name: str
    category: str = "general"
    description: Optional[str] = None


class SkillCreate(SkillBase):
    aliases: Optional[List[str]] = None


class SkillResponse(SkillBase):
    id: str
    normalized_key: str

    class Config:
        from_attributes = True


class CandidateSkillBase(BaseModel):
    skill_name: str
    proficiency: str = "intermediate"  # beginner, intermediate, advanced, unknown
    years_experience: Optional[float] = None
    evidence_source: str = "user_entered"  # resume, user_entered, project, verified


class CandidateSkillCreate(CandidateSkillBase):
    pass


class CandidateSkillUpdate(BaseModel):
    proficiency: Optional[str] = None
    years_experience: Optional[float] = None
    evidence_source: Optional[str] = None


class CandidateSkillResponse(BaseModel):
    id: str
    user_id: str
    skill_id: str
    skill_name: str
    category: str
    proficiency: str
    years_experience: Optional[float] = None
    evidence_source: str
    confidence: Optional[float] = None

    class Config:
        from_attributes = True


class SkillNormalizeRequest(BaseModel):
    raw_skills: List[str]


class NormalizedSkillItem(BaseModel):
    original: str
    canonical_name: str
    skill_id: Optional[str] = None
    matched: bool
    confidence: float


class SkillNormalizeResponse(BaseModel):
    normalized: List[NormalizedSkillItem]


class SkillGapItem(BaseModel):
    skill_name: str
    category: str
    requirement_type: str  # required or preferred
    importance_weight: float
    is_missing: bool
    user_proficiency: Optional[str] = None
    expected_proficiency: str
    recommended_resources: Optional[List[dict]] = None


class SkillGapResponse(BaseModel):
    role_id: str
    role_title: str
    overall_match_percentage: float
    required_skills_count: int
    matched_skills_count: int
    missing_required_count: int
    missing_preferred_count: int
    gaps: List[SkillGapItem]
