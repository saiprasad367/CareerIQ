"""
CareerIQ — Targeted Tests for Security, Refresh Token Rotation, Revocation, and Email Normalization.
"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_email_normalization_and_uniqueness(client: AsyncClient):
    # Register with mixed case and whitespace
    reg1 = await client.post("/api/v1/auth/register", json={
        "email": "  Candidate.Test@CareerIQ.dev  ",
        "password": "Password123!Secure",
        "full_name": "Test User",
    })
    assert reg1.status_code == 201
    assert reg1.json()["email"] == "candidate.test@careeriq.dev"

    # Attempt to register duplicate with different casing
    reg2 = await client.post("/api/v1/auth/register", json={
        "email": "CANDIDATE.TEST@careeriq.dev",
        "password": "AnotherPassword123!",
        "full_name": "Duplicate User",
    })
    assert reg2.status_code == 409
    assert "already exists" in reg2.json()["error"]["message"]


@pytest.mark.asyncio
async def test_refresh_token_rotation_and_revocation(client: AsyncClient):
    # Register user
    reg = await client.post("/api/v1/auth/register", json={
        "email": "refresh_flow@careeriq.dev",
        "password": "Password123!Secure",
        "full_name": "Refresh User",
    })
    assert reg.status_code == 201

    # Login to get refresh token cookie / response
    login_res = await client.post("/api/v1/auth/login", json={
        "email": "refresh_flow@careeriq.dev",
        "password": "Password123!Secure",
    })
    assert login_res.status_code == 200
    cookies = login_res.cookies

    # Rotate refresh token
    refresh_res = await client.post("/api/v1/auth/refresh", cookies=cookies)
    assert refresh_res.status_code == 200
    assert "access_token" in refresh_res.json()
    new_cookies = refresh_res.cookies

    # Attempt to reuse old revoked refresh token -> Must fail with 401
    reuse_res = await client.post("/api/v1/auth/refresh", cookies=cookies)
    assert reuse_res.status_code == 401

    # Logout with new cookies
    logout_res = await client.post("/api/v1/auth/logout", cookies=new_cookies)
    assert logout_res.status_code == 200

    # Refresh after logout -> Must fail with 401
    after_logout_res = await client.post("/api/v1/auth/refresh", cookies=new_cookies)
    assert after_logout_res.status_code == 401


@pytest.mark.asyncio
async def test_cross_user_report_isolation(client: AsyncClient):
    # User 1
    reg1 = await client.post("/api/v1/auth/register", json={
        "email": "owner_one@careeriq.dev",
        "password": "Password123!Secure",
        "full_name": "Owner One",
    })
    token1 = reg1.json()["access_token"]

    # User 2
    reg2 = await client.post("/api/v1/auth/register", json={
        "email": "owner_two@careeriq.dev",
        "password": "Password123!Secure",
        "full_name": "Owner Two",
    })
    token2 = reg2.json()["access_token"]

    # User 1 creates report
    res_report = await client.post(
        "/api/v1/reports",
        json={"report_type": "career-recommendations", "title": "Confidential Report"},
        headers={"Authorization": f"Bearer {token1}"},
    )
    report_id = res_report.json()["id"]

    # User 2 tries to access User 1's report
    unauth_get = await client.get(
        f"/api/v1/reports/{report_id}",
        headers={"Authorization": f"Bearer {token2}"},
    )
    assert unauth_get.status_code == 404
