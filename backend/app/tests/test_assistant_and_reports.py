"""
CareerIQ — Targeted Tests for Assistant Interaction, Fallback, Sessions, and Reports.
"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_assistant_chat_deterministic_fallback(client: AsyncClient):
    # 1. Register candidate
    reg = await client.post("/api/v1/auth/register", json={
        "email": "assistant_tester@careeriq.dev",
        "password": "Password123!Secure",
        "full_name": "Assistant Tester",
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Chat with assistant without Gemini API key -> Deterministic contextual fallback
    chat_res = await client.post(
        "/api/v1/assistant/chat",
        json={"message": "How do I optimize my resume for backend developer roles?"},
        headers=headers,
    )
    assert chat_res.status_code == 200
    data = chat_res.json()
    assert "session_id" in data
    assert len(data["response"]) > 20
    assert "gemini" in data["model_mode"] or data["model_mode"] == "deterministic_contextual_fallback"
    session_id = data["session_id"]

    # 3. Follow-up chat in same session
    followup_res = await client.post(
        "/api/v1/assistant/chat",
        json={"message": "What interview questions should I practice?", "session_id": session_id},
        headers=headers,
    )
    assert followup_res.status_code == 200
    assert followup_res.json()["session_id"] == session_id

    # 4. List user sessions
    sess_list = await client.get("/api/v1/assistant/sessions", headers=headers)
    assert sess_list.status_code == 200
    assert any(s["id"] == session_id for s in sess_list.json())


@pytest.mark.asyncio
async def test_report_generation_and_retrieval(client: AsyncClient):
    # Register candidate
    reg = await client.post("/api/v1/auth/register", json={
        "email": "report_user@careeriq.dev",
        "password": "Password123!Secure",
        "full_name": "Report User",
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Generate career recommendation report
    gen_res = await client.post(
        "/api/v1/reports",
        json={"report_type": "career-recommendations", "title": "My Career Direction"},
        headers=headers,
    )
    assert gen_res.status_code == 201
    report = gen_res.json()
    assert report["report_type"] == "career-recommendations"
    assert "id" in report
    assert "report_payload" in report
    report_id = report["id"]

    # 2. Retrieve report by ID
    get_res = await client.get(f"/api/v1/reports/{report_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["id"] == report_id

    # 3. List reports
    list_res = await client.get("/api/v1/reports", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1
