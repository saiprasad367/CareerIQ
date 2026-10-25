"""
CareerIQ — Authentication & Ownership Tests.
"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_and_login_flow(client: AsyncClient):
    # 1. Register candidate
    reg_payload = {
        "email": "test.candidate@careeriq.dev",
        "password": "Password123!Secure",
        "full_name": "Test Candidate",
        "role": "candidate",
    }
    res = await client.post("/api/v1/auth/register", json=reg_payload)
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["email"] == "test.candidate@careeriq.dev"
    assert data["onboarding_completed"] is False
    token = data["access_token"]

    # 2. Duplicate registration should return 409
    res_dup = await client.post("/api/v1/auth/register", json=reg_payload)
    assert res_dup.status_code == 409

    # 3. Login with correct credentials
    login_payload = {
        "email": "test.candidate@careeriq.dev",
        "password": "Password123!Secure",
    }
    res_login = await client.post("/api/v1/auth/login", json=login_payload)
    assert res_login.status_code == 200
    assert "access_token" in res_login.json()

    # 4. Login with incorrect password should return 401
    bad_login = {
        "email": "test.candidate@careeriq.dev",
        "password": "WrongPassword999",
    }
    res_bad = await client.post("/api/v1/auth/login", json=bad_login)
    assert res_bad.status_code == 401

    # 5. Access /auth/me with Bearer token
    headers = {"Authorization": f"Bearer {token}"}
    res_me = await client.get("/api/v1/auth/me", headers=headers)
    assert res_me.status_code == 200
    assert res_me.json()["email"] == "test.candidate@careeriq.dev"

    # 6. Unauthenticated request to protected endpoint should return 401
    res_unauth = await client.get("/api/v1/profile")
    assert res_unauth.status_code == 401
