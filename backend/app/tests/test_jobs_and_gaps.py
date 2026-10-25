"""
CareerIQ — Targeted Tests for Jobs Filtering, Matching, Role Recommendations, and Skill Gaps.
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.seed import seed_database


@pytest.mark.asyncio
async def test_jobs_and_roles_matching(client: AsyncClient, test_db: AsyncSession):
    # Seed canonical data
    await seed_database(test_db)
    await test_db.commit()

    # 1. Register candidate
    reg = await client.post("/api/v1/auth/register", json={
        "email": "job_hunter@careeriq.dev",
        "password": "Password123!Secure",
        "full_name": "Job Hunter",
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Add skills to candidate profile
    for skill in ["Python", "FastAPI", "PostgreSQL", "Git", "REST API"]:
        await client.post(
            "/api/v1/profile/skills",
            json={"skill_name": skill, "proficiency": "intermediate"},
            headers=headers,
        )

    # 3. List career roles
    roles_res = await client.get("/api/v1/career-roles")
    assert roles_res.status_code == 200
    roles = roles_res.json()
    assert len(roles) >= 5

    # 4. Get personalized role recommendations
    rec_res = await client.get("/api/v1/career-roles/recommendations", headers=headers)
    assert rec_res.status_code == 200
    recs = rec_res.json()
    assert len(recs) > 0
    # Match percentage must be between 0 and 100
    for r in recs:
        assert 0.0 <= r["match_percentage"] <= 100.0

    # 5. Get skill gaps for top recommended role
    top_role_id = recs[0]["role_id"]
    gaps_res = await client.get(f"/api/v1/career-roles/{top_role_id}/gaps", headers=headers)
    assert gaps_res.status_code == 200
    gaps = gaps_res.json()
    assert "role_id" in gaps
    assert "gaps" in gaps
    assert "matched_skills_count" in gaps
    assert len(gaps["gaps"]) > 0

    # 6. Search jobs with filters
    jobs_search = await client.get("/api/v1/jobs?work_mode=remote", headers=headers)
    assert jobs_search.status_code == 200

    # 7. Job recommendations
    job_recs = await client.get("/api/v1/jobs/recommendations", headers=headers)
    assert job_recs.status_code == 200
    j_list = job_recs.json()
    assert len(j_list) > 0
    top_job = j_list[0]
    assert 0.0 <= top_job["match_score"] <= 100.0

    # 8. Save and unsave job
    job_id = top_job["id"]
    save_res = await client.post(f"/api/v1/jobs/{job_id}/save", headers=headers)
    assert save_res.status_code == 200

    saved_list = await client.get("/api/v1/jobs/saved", headers=headers)
    assert saved_list.status_code == 200
    assert any(s["job_id"] == job_id for s in saved_list.json())

    unsave_res = await client.delete(f"/api/v1/jobs/{job_id}/save", headers=headers)
    assert unsave_res.status_code == 200
