"""
CareerIQ — Career Assistant Service.
Provides candidate-aware guidance using contextual deterministic fallback,
with optional Google Gemini LLM integration when credentials are configured.
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import get_settings
from app.core.errors import NotFoundError
from app.models.assistant import ChatMessage, ChatSession
from app.models.profile import CandidateProfile
from app.models.skill import CandidateSkill, Skill
from app.schemas.assistant import ChatMessageItem, ChatResponse, ChatSessionResponse


class AssistantService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.settings = get_settings()

    async def get_or_create_session(self, user_id: str, session_id: Optional[str] = None) -> ChatSession:
        if session_id:
            stmt = select(ChatSession).where(
                ChatSession.id == session_id, ChatSession.user_id == user_id
            ).options(selectinload(ChatSession.messages))
            session = (await self.db.execute(stmt)).scalar_one_or_none()
            if session:
                return session

        # Create new session
        new_session = ChatSession(user_id=user_id, title="Career Guidance Session")
        self.db.add(new_session)
        await self.db.commit()
        await self.db.refresh(new_session)
        return new_session

    async def get_sessions(self, user_id: str) -> List[ChatSessionResponse]:
        stmt = (
            select(ChatSession)
            .where(ChatSession.user_id == user_id)
            .order_by(ChatSession.updated_at.desc())
            .options(selectinload(ChatSession.messages))
        )
        sessions = (await self.db.execute(stmt)).scalars().all()
        return [
            ChatSessionResponse(
                id=s.id,
                title=s.title,
                created_at=s.created_at,
                updated_at=s.updated_at,
                messages=[
                    ChatMessageItem(
                        id=m.id,
                        role=m.role,
                        content=m.content,
                        created_at=m.created_at,
                        metadata=m.metadata_json,
                    )
                    for m in s.messages
                ],
            )
            for s in sessions
        ]

    async def delete_session(self, user_id: str, session_id: str) -> bool:
        stmt = select(ChatSession).where(ChatSession.id == session_id, ChatSession.user_id == user_id)
        session = (await self.db.execute(stmt)).scalar_one_or_none()
        if not session:
            raise NotFoundError("Chat session not found.")
        await self.db.delete(session)
        await self.db.commit()
        return True

    async def _build_candidate_context(self, user_id: str) -> Dict[str, Any]:
        # Fetch profile
        prof_stmt = select(CandidateProfile).where(CandidateProfile.user_id == user_id)
        profile = (await self.db.execute(prof_stmt)).scalar_one_or_none()

        # Fetch candidate skills
        skills_stmt = (
            select(Skill.canonical_name)
            .join(CandidateSkill, CandidateSkill.skill_id == Skill.id)
            .where(CandidateSkill.user_id == user_id)
        )
        skills = list((await self.db.execute(skills_stmt)).scalars().all())

        return {
            "name": profile.full_name if profile else "Candidate",
            "experience_level": profile.experience_level if profile else "entry",
            "work_mode": profile.work_mode if profile else "hybrid",
            "headline": profile.headline if profile else None,
            "skills": skills,
        }

    def _generate_deterministic_response(self, prompt: str, ctx: Dict[str, Any]) -> Tuple[str, List[str]]:
        """High-value contextual responses based on domain intent and candidate profile."""
        q = prompt.lower()
        name = ctx["name"]
        skills = ctx["skills"]
        skills_str = ", ".join(skills[:5]) if skills else "your core foundational skills"

        if any(w in q for w in ("resume", "cv", "optimize", "bullet")):
            resp = (
                f"Hello {name}! To optimize your resume for technical roles, focus on the XYZ formula: "
                f"'Accomplished [X], as measured by [Y], by doing [Z]'. Highlight your practical experience "
                f"with {skills_str}. Ensure you quantify accomplishments (e.g., latency reduction, throughput, "
                f"or test coverage) rather than listing passive duties."
            )
            actions = ["Run ATS Resume Analysis", "View Resume Optimizer", "Add Missing Skills"]
        elif any(w in q for w in ("job", "match", "apply", "opportunity")):
            resp = (
                f"Based on your profile, you are matched best with roles requiring {skills_str}. "
                f"Check the Jobs tab where jobs are ranked with the formula M = 0.45K + 0.25E + 0.15X + 0.15P. "
                f"Applying to jobs where your match score exceeds 70% significantly increases response rates."
            )
            actions = ["Explore Matched Jobs", "Review Skill Gaps", "Track Applications"]
        elif any(w in q for w in ("roadmap", "learn", "study", "skills")):
            resp = (
                f"Great question! To level up from {ctx['experience_level']} level, check your personalized "
                f"learning roadmap. We recommend focusing on high-weight required skills first, building practical "
                f"end-to-end projects, and committing to weekly progress milestones."
            )
            actions = ["Open Learning Roadmap", "View Project Templates", "Check Skill Gaps"]
        elif any(w in q for w in ("interview", "prepare", "question")):
            resp = (
                f"For technical interviews, prepare for three pillars: 1) Data structures and algorithmic problem solving, "
                f"2) System design & API architecture using technologies like {skills_str}, and 3) Behavioral stories "
                f"using the STAR method (Situation, Task, Action, Result)."
            )
            actions = ["Practice System Design", "Review Projects", "Schedule Follow-up"]
        else:
            resp = (
                f"Hi {name}! I am your CareerIQ Career Intelligence Assistant. I have analyzed your profile "
                f"(current skills: {skills_str}). I can assist you with resume optimization, targeted job matching, "
                f"closing skill gaps, or preparing for technical interviews. What would you like to explore today?"
            )
            actions = ["Analyze Skill Gaps", "Explore Matched Jobs", "Optimize My Resume"]

        return resp, actions

    async def chat(self, user_id: str, prompt: str, session_id: Optional[str] = None) -> ChatResponse:
        session = await self.get_or_create_session(user_id, session_id)
        ctx = await self._build_candidate_context(user_id)

        # Record user message
        user_msg = ChatMessage(session_id=session.id, role="user", content=prompt.strip())
        self.db.add(user_msg)

        model_mode = "deterministic_contextual_fallback"
        response_text = ""
        suggested_actions = []

        # Try Gemini if configured
        from app.services.gemini_service import GeminiService
        gemini = GeminiService()
        llm_reply = gemini.generate_assistant_reply(prompt, ctx)
        if llm_reply:
            response_text = llm_reply
            model_mode = "gemini_generative_ai"
            suggested_actions = ["Explore Matched Jobs", "Check Learning Roadmap", "Analyze Skill Gaps"]
        else:
            response_text, suggested_actions = self._generate_deterministic_response(prompt, ctx)

        # Record assistant message
        asst_msg = ChatMessage(
            session_id=session.id,
            role="assistant",
            content=response_text,
            metadata_json={"mode": model_mode, "actions": suggested_actions},
        )
        self.db.add(asst_msg)
        session.updated_at = datetime.now(timezone.utc)
        await self.db.commit()

        return ChatResponse(
            session_id=session.id,
            response=response_text,
            model_mode=model_mode,
            suggested_actions=suggested_actions,
        )
