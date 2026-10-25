# Import all models so Alembic can discover them for migrations
from app.db.base import Base  # noqa: F401
from app.models.user import User, RefreshToken  # noqa: F401
from app.models.profile import CandidateProfile  # noqa: F401
from app.models.skill import Skill, SkillAlias, CandidateSkill  # noqa: F401
from app.models.education import Education, Experience, Project  # noqa: F401
from app.models.career_role import CareerRole, RoleSkill  # noqa: F401
from app.models.resume import ResumeDocument, ResumeAnalysis  # noqa: F401
from app.models.job import Company, Job, JobSkill, SavedJob, JobMatch  # noqa: F401
from app.models.application import Application  # noqa: F401
from app.models.roadmap import LearningResource, ProjectTemplate, RoadmapTask  # noqa: F401
from app.models.assistant import ChatSession, ChatMessage  # noqa: F401
from app.models.report import CareerReport, UserPreferences, AnalysisRun  # noqa: F401
