"""
CareerIQ — Multi-user isolation, ownership checks, and feature integration tests.
"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_multi_user_isolation(client: AsyncClient):
    # 1. Register User A
    res_a = await client.post("/api/v1/auth/register", json={
        "email": "candidate_a@careeriq.dev",
        "password": "Password123!Secure",
        "full_name": "Candidate A",
    })
    assert res_a.status_code == 201
    token_a = res_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # 2. Register User B
    res_b = await client.post("/api/v1/auth/register", json={
        "email": "candidate_b@careeriq.dev",
        "password": "Password123!Secure",
        "full_name": "Candidate B",
    })
    assert res_b.status_code == 201
    token_b = res_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 3. User A creates an application
    app_payload = {
        "job_title": "Backend Engineer",
        "company": "Alpha Corp",
        "status": "Applied",
        "notes": "Secret notes for user A",
    }
    create_app = await client.post("/api/v1/applications", json=app_payload, headers=headers_a)
    assert create_app.status_code == 201
    app_id_a = create_app.json()["id"]

    # 4. User B lists applications -> Should NOT see User A's application
    res_b_apps = await client.get("/api/v1/applications", headers=headers_b)
    assert res_b_apps.status_code == 200
    b_apps = res_b_apps.json()
    assert all(item["id"] != app_id_a for item in b_apps)

    # 5. User B tries to update User A's application -> Should return 404 (ownership check)
    tamper_res = await client.patch(
        f"/api/v1/applications/{app_id_a}/status",
        json={"status": "Rejected"},
        headers=headers_b,
    )
    assert tamper_res.status_code == 404

    # 6. User A updates own application -> 200 OK
    update_res = await client.patch(
        f"/api/v1/applications/{app_id_a}/status",
        json={"status": "Interview"},
        headers=headers_a,
    )
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "Interview"


@pytest.mark.asyncio
async def test_skills_and_roadmap_flow(client: AsyncClient):
    # Register candidate
    reg = await client.post("/api/v1/auth/register", json={
        "email": "skills_user@careeriq.dev",
        "password": "Password123!Secure",
        "full_name": "Skills Learner",
    })
    headers = {"Authorization": f"Bearer {reg.json()['access_token']}"}

    # 1. Add skill to profile
    add_skill = await client.post(
        "/api/v1/profile/skills",
        json={"skill_name": "FastAPI", "proficiency": "intermediate", "evidence_source": "user_entered"},
        headers=headers,
    )
    assert add_skill.status_code == 201
    assert add_skill.json()["skill_name"] == "FastAPI"

    # 2. Query skill taxonomy
    tax_res = await client.get("/api/v1/skills/taxonomy")
    assert tax_res.status_code == 200

    # 3. Normalize raw skills
    norm_res = await client.post(
        "/api/v1/skills/normalize",
        json={"raw_skills": ["python3", "reactjs", "postgres"]},
    )
    assert norm_res.status_code == 200
    norm_items = norm_res.json()["normalized"]
    assert len(norm_items) == 3

    # 4. Generate learning roadmap
    road_res = await client.get("/api/v1/roadmap", headers=headers)
    assert road_res.status_code == 200
    assert road_res.json()["total_tasks"] > 0
