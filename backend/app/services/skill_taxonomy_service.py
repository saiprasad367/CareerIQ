"""
CareerIQ — Skill taxonomy service: canonical lookup, alias normalization, candidate skill inventory.
"""
from __future__ import annotations

import re
from typing import Dict, List, Optional, Set, Tuple
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import NotFoundError
from app.models.skill import CandidateSkill, Skill, SkillAlias
from app.schemas.skill import (
    CandidateSkillCreate,
    CandidateSkillResponse,
    CandidateSkillUpdate,
    NormalizedSkillItem,
    SkillNormalizeResponse,
    SkillResponse,
)


class SkillTaxonomyService:
    def __init__(self, db: AsyncSession):
        self.db = db

    @staticmethod
    def normalize_key(name: str) -> str:
        """Normalizes skill string: lowercase, strips punctuation, collapses spaces."""
        cleaned = re.sub(r"[^\w\s\+\#]", "", name.lower())
        return re.sub(r"\s+", " ", cleaned).strip()

    async def get_all_canonical_skills(self) -> List[Skill]:
        stmt = select(Skill).order_by(Skill.canonical_name.asc())
        return list((await self.db.execute(stmt)).scalars().all())

    async def search_skills(self, query: str, limit: int = 20) -> List[Skill]:
        norm = self.normalize_key(query)
        stmt = (
            select(Skill)
            .where(Skill.canonical_name.ilike(f"%{query}%") | Skill.normalized_key.ilike(f"%{norm}%"))
            .limit(limit)
        )
        return list((await self.db.execute(stmt)).scalars().all())

    async def normalize_skills(self, raw_skills: List[str]) -> SkillNormalizeResponse:
        """
        Maps a list of raw skill strings to their canonical counterparts using
        canonical names and the skill_aliases table.
        """
        all_skills = await self.get_all_canonical_skills()
        # Pre-build lookup maps
        canon_map = {self.normalize_key(s.canonical_name): s for s in all_skills}

        # Load aliases
        alias_stmt = select(SkillAlias)
        aliases = (await self.db.execute(alias_stmt)).scalars().all()
        alias_map = {self.normalize_key(a.alias): a.skill_id for a in aliases}
        skill_id_map = {s.id: s for s in all_skills}

        results: List[NormalizedSkillItem] = []
        for raw in raw_skills:
            norm = self.normalize_key(raw)
            if not norm:
                continue

            if norm in canon_map:
                matched_skill = canon_map[norm]
                results.append(
                    NormalizedSkillItem(
                        original=raw,
                        canonical_name=matched_skill.canonical_name,
                        skill_id=matched_skill.id,
                        matched=True,
                        confidence=1.0,
                    )
                )
            elif norm in alias_map:
                matched_skill = skill_id_map.get(alias_map[norm])
                canon_name = matched_skill.canonical_name if matched_skill else raw
                results.append(
                    NormalizedSkillItem(
                        original=raw,
                        canonical_name=canon_name,
                        skill_id=alias_map[norm],
                        matched=True,
                        confidence=0.95,
                    )
                )
            else:
                # Substring/fuzzy check
                best_match = None
                for c_norm, c_skill in canon_map.items():
                    if norm in c_norm or c_norm in norm:
                        best_match = c_skill
                        break
                if best_match:
                    results.append(
                        NormalizedSkillItem(
                            original=raw,
                            canonical_name=best_match.canonical_name,
                            skill_id=best_match.id,
                            matched=True,
                            confidence=0.8,
                        )
                    )
                else:
                    results.append(
                        NormalizedSkillItem(
                            original=raw,
                            canonical_name=raw.strip(),
                            skill_id=None,
                            matched=False,
                            confidence=0.5,
                        )
                    )

        return SkillNormalizeResponse(normalized=results)

    # --- Candidate Skill Inventory ---
    async def get_candidate_skills(self, user_id: str) -> List[CandidateSkillResponse]:
        stmt = (
            select(CandidateSkill, Skill)
            .join(Skill, CandidateSkill.skill_id == Skill.id)
            .where(CandidateSkill.user_id == user_id)
        )
        rows = (await self.db.execute(stmt)).all()
        return [
            CandidateSkillResponse(
                id=cs.id,
                user_id=cs.user_id,
                skill_id=cs.skill_id,
                skill_name=skill.canonical_name,
                category=skill.category,
                proficiency=cs.proficiency,
                years_experience=cs.years_experience,
                evidence_source=cs.evidence_source,
                confidence=cs.confidence,
            )
            for cs, skill in rows
        ]

    async def add_candidate_skill(self, user_id: str, data: CandidateSkillCreate) -> CandidateSkillResponse:
        norm = self.normalize_key(data.skill_name)
        # Find or create skill
        stmt = select(Skill).where(Skill.canonical_name.ilike(data.skill_name.strip()))
        skill = (await self.db.execute(stmt)).scalar_one_or_none()
        if not skill:
            skill = Skill(canonical_name=data.skill_name.strip(), category="general")
            self.db.add(skill)
            await self.db.flush()

        # Check if already added
        cs_stmt = select(CandidateSkill).where(
            CandidateSkill.user_id == user_id, CandidateSkill.skill_id == skill.id
        )
        existing = (await self.db.execute(cs_stmt)).scalar_one_or_none()
        if existing:
            existing.proficiency = data.proficiency
            existing.years_experience = data.years_experience
            existing.evidence_source = data.evidence_source
            await self.db.commit()
            return CandidateSkillResponse(
                id=existing.id,
                user_id=existing.user_id,
                skill_id=skill.id,
                skill_name=skill.canonical_name,
                category=skill.category,
                proficiency=existing.proficiency,
                years_experience=existing.years_experience,
                evidence_source=existing.evidence_source,
                confidence=existing.confidence,
            )

        new_cs = CandidateSkill(
            user_id=user_id,
            skill_id=skill.id,
            proficiency=data.proficiency,
            years_experience=data.years_experience,
            evidence_source=data.evidence_source,
        )
        self.db.add(new_cs)
        await self.db.commit()
        await self.db.refresh(new_cs)

        return CandidateSkillResponse(
            id=new_cs.id,
            user_id=new_cs.user_id,
            skill_id=skill.id,
            skill_name=skill.canonical_name,
            category=skill.category,
            proficiency=new_cs.proficiency,
            years_experience=new_cs.years_experience,
            evidence_source=new_cs.evidence_source,
            confidence=new_cs.confidence,
        )

    async def delete_candidate_skill(self, user_id: str, skill_id: str) -> bool:
        stmt = select(CandidateSkill).where(
            CandidateSkill.user_id == user_id,
            (CandidateSkill.skill_id == skill_id) | (CandidateSkill.id == skill_id),
        )
        cs = (await self.db.execute(stmt)).scalar_one_or_none()
        if not cs:
            raise NotFoundError("Candidate skill not found.")
        await self.db.delete(cs)
        await self.db.commit()
        return True
