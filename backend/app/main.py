"""
CareerIQ — FastAPI Application Entrypoint.
AI-Powered Career Intelligence, Skill Gap Analysis and Personalized Job Recommendation System.
"""
from __future__ import annotations

from contextlib import asynccontextmanager
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.v1.router import api_v1_router
from app.core.config import get_settings
from app.core.errors import register_exception_handlers
from app.core.logging import configure_logging
from app.db.base import Base
from app.db.session import engine
from app.schemas.common import HealthResponse, ReadinessResponse
from app.storage import get_storage_provider


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: configure logging and auto-create tables if running with SQLite or in dev
    configure_logging()
    settings = get_settings()

    # Automatically initialize tables in development if needed
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Automatically run initial seed if database is empty
    from app.db.session import AsyncSessionFactory
    from app.db.seed import seed_database
    async with AsyncSessionFactory() as session:
        try:
            await seed_database(session)
        except Exception as e:
            # Table might already be populated
            pass

    yield
    # Shutdown
    await engine.dispose()


settings = get_settings()

app = FastAPI(
    title="CareerIQ API",
    description=(
        "AI-Powered Career Intelligence, Skill Gap Analysis, "
        "and Personalized Job Recommendation System REST API."
    ),
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Exception handlers
register_exception_handlers(app)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(api_v1_router)


# --- Root Health and Meta Endpoints ---
@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    return HealthResponse(
        status="healthy",
        app=settings.APP_NAME,
        version=settings.APP_VERSION,
        environment=settings.APP_ENV,
    )


@app.get("/ready", response_model=ReadinessResponse, tags=["Health"])
async def readiness_check():
    db_status = "connected"
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    storage_status = "ready"
    try:
        storage = get_storage_provider()
        storage_status = f"{settings.STORAGE_BACKEND}_active"
    except Exception as e:
        storage_status = f"error: {str(e)}"

    is_ready = db_status == "connected"
    return ReadinessResponse(
        status="ready" if is_ready else "degraded",
        database=db_status,
        storage=storage_status,
    )


@app.get("/api/v1/meta", tags=["Metadata"])
async def get_api_meta():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV,
        "features": {
            "resume_parsing": True,
            "ats_scoring": True,
            "skill_gap_analysis": True,
            "hybrid_job_matching": True,
            "learning_roadmap": True,
            "career_assistant": True,
            "llm_gemini_enabled": settings.llm_enabled,
            "storage_backend": settings.STORAGE_BACKEND,
        },
        "scoring_formulas": {
            "job_matching": "M = 0.45K + 0.25E + 0.15X + 0.15P",
            "ats_compatibility": "A = 0.50R + 0.30T + 0.20F",
        },
    }
