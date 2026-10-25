"""
CareerIQ — Learning Roadmap and Catalog Service.
Generates personalized roadmaps and manages candidate task progress.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import select, delete, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.errors import NotFoundError
from app.models.career_role import CareerRole, RoleSkill
from app.models.roadmap import (
    LearningResource,
    ProjectTemplate,
    ProjectTemplateSkill,
    ResourceSkill,
    RoadmapTask,
)
from app.models.skill import CandidateSkill, Skill
from app.schemas.roadmap import (
    LearningResourceResponse,
    ProjectTemplateResponse,
    RoadmapOverview,
    RoadmapTaskCreate,
    RoadmapTaskResponse,
    RoadmapTaskStatusUpdate,
    RoadmapTaskUpdate,
)


class LearningService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_resources(self, skill_name: Optional[str] = None) -> List[LearningResourceResponse]:
        stmt = select(LearningResource).where(LearningResource.is_active == True).options(
            selectinload(LearningResource.resource_skills).selectinload(ResourceSkill.skill)
        )
        resources = (await self.db.execute(stmt)).scalars().all()
        result = []
        for r in resources:
            s_names = [rs.skill.canonical_name for rs in r.resource_skills if rs.skill]
            if skill_name and not any(skill_name.lower() in s.lower() for s in s_names):
                continue
            result.append(
                LearningResourceResponse(
                    id=r.id,
                    title=r.title,
                    provider=r.provider,
                    url=r.url,
                    description=r.description,
                    difficulty=r.difficulty,
                    estimated_hours=r.estimated_hours,
                    resource_type=r.resource_type,
                    skills=s_names,
                )
            )
        return result

    async def get_project_templates(self) -> List[ProjectTemplateResponse]:
        stmt = select(ProjectTemplate).where(ProjectTemplate.is_active == True).options(
            selectinload(ProjectTemplate.template_skills).selectinload(ProjectTemplateSkill.skill)
        )
        templates = (await self.db.execute(stmt)).scalars().all()
        result = []
        for t in templates:
            s_names = [ts.skill.canonical_name for ts in t.template_skills if ts.skill]
            result.append(
                ProjectTemplateResponse(
                    id=t.id,
                    title=t.title,
                    description=t.description,
                    difficulty=t.difficulty,
                    estimated_hours=t.estimated_hours,
                    repository_url=t.repository_url,
                    skills=s_names,
                )
            )
        return result

    # --- Roadmap Tasks ---
    async def get_user_roadmap(self, user_id: str) -> RoadmapOverview:
        stmt = select(RoadmapTask).where(RoadmapTask.user_id == user_id).order_by(RoadmapTask.sort_order.asc())
        tasks = list((await self.db.execute(stmt)).scalars().all())

        total = len(tasks)
        completed = sum(1 for t in tasks if t.status == "completed")
        in_progress = sum(1 for t in tasks if t.status == "in_progress")
        remaining_hours = sum(t.estimated_hours for t in tasks if t.status != "completed")
        completion_pct = round((completed / total * 100.0) if total > 0 else 0.0, 1)

        task_responses = [
            RoadmapTaskResponse(
                id=t.id,
                user_id=t.user_id,
                role_id=t.role_id,
                resource_id=t.resource_id,
                project_template_id=t.project_template_id,
                title=t.title,
                description=t.description,
                phase=t.phase,
                difficulty=t.difficulty,
                estimated_hours=t.estimated_hours,
                status=t.status,
                sort_order=t.sort_order,
                is_custom=t.is_custom,
                completed_at=t.completed_at,
                created_at=t.created_at,
                updated_at=t.updated_at,
            )
            for t in tasks
        ]

        return RoadmapOverview(
            role_title="Target Role Pathway",
            completion_percentage=completion_pct,
            total_tasks=total,
            completed_tasks=completed,
            in_progress_tasks=in_progress,
            estimated_hours_remaining=remaining_hours,
            tasks=task_responses,
        )

    async def generate_roadmap(self, user_id: str, role_id: Optional[str] = None) -> RoadmapOverview:
        """Generates structured roadmap tasks personalized for the candidate's target role."""
        # Clear existing non-custom tasks if regenerating
        await self.db.execute(
            delete(RoadmapTask).where(RoadmapTask.user_id == user_id, RoadmapTask.is_custom == False)
        )

        # Standard curriculum phases
        curriculum = [
            {
                "title": "Master Async Python & Modern REST Architecture",
                "desc": "Deep dive into FastAPI, Pydantic v2 validation, and async SQLAlchemy connection pools.",
                "phase": "Foundation",
                "difficulty": "intermediate",
                "hours": 15,
            },
            {
                "title": "Relational Data Modeling & PostgreSQL Indexing",
                "desc": "Design normalized schemas, UUID primary keys, and Alembic version-controlled migrations.",
                "phase": "Core Skills",
                "difficulty": "intermediate",
                "hours": 12,
            },
            {
                "title": "Build Applied AI / Semantic Matching Pipeline",
                "desc": "Integrate local sentence embeddings, cosine similarity, and multi-factor ranking algorithms.",
                "phase": "Advanced",
                "difficulty": "advanced",
                "hours": 20,
            },
            {
                "title": "Production Deployment & End-to-End Testing",
                "desc": "Dockerize services, write comprehensive pytest suites, and configure secure CORS/auth cookies.",
                "phase": "Capstone",
                "difficulty": "advanced",
                "hours": 18,
            },
        ]

        for i, item in enumerate(curriculum):
            task = RoadmapTask(
                user_id=user_id,
                role_id=role_id,
                title=item["title"],
                description=item["desc"],
                phase=item["phase"],
                difficulty=item["difficulty"],
                estimated_hours=item["hours"],
                sort_order=i,
                status="todo",
                is_custom=False,
            )
            self.db.add(task)

        await self.db.commit()
        return await self.get_user_roadmap(user_id)

    async def create_custom_task(self, user_id: str, data: RoadmapTaskCreate) -> RoadmapTaskResponse:
        task = RoadmapTask(
            user_id=user_id,
            role_id=data.role_id,
            title=data.title,
            description=data.description,
            phase=data.phase,
            difficulty=data.difficulty,
            estimated_hours=data.estimated_hours,
            status=data.status,
            sort_order=data.sort_order,
            is_custom=True,
        )
        self.db.add(task)
        await self.db.commit()
        await self.db.refresh(task)
        return RoadmapTaskResponse.model_validate(task)

    async def update_task_status(self, user_id: str, task_id: str, status_str: str) -> RoadmapTaskResponse:
        task = await self.db.get(RoadmapTask, task_id)
        if not task or task.user_id != user_id:
            raise NotFoundError("Roadmap task not found.")
        task.status = status_str
        if status_str == "completed":
            task.completed_at = datetime.now(timezone.utc)
        else:
            task.completed_at = None
        await self.db.commit()
        await self.db.refresh(task)
        return RoadmapTaskResponse.model_validate(task)

    async def delete_task(self, user_id: str, task_id: str) -> bool:
        task = await self.db.get(RoadmapTask, task_id)
        if not task or task.user_id != user_id:
            raise NotFoundError("Roadmap task not found.")
        await self.db.delete(task)
        await self.db.commit()
        return True
