"""
CareerIQ — Targeted Tests for Resume Upload, Parsing, Security Signatures and Constraints.
"""
import io
import pytest
from httpx import AsyncClient


def create_minimal_pdf_bytes(text_content: str = "Arjun Mehta\narjun@example.com\n+91 9876543210\nPython, FastAPI, Docker, PostgreSQL") -> bytes:
    # A minimal valid PDF structure with %PDF- header
    pdf = (
        b"%PDF-1.4\n"
        b"1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
        b"2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n"
        b"3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\n"
        b"xref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000053 00000 n\n0000000102 00000 n\n"
        b"trailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF\n"
    )
    # Append text to payload for regex scanning
    return pdf + text_content.encode("utf-8")


@pytest.mark.asyncio
async def test_resume_upload_valid_pdf(client: AsyncClient):
    # 1. Register & login user
    reg = await client.post("/api/v1/auth/register", json={
        "email": "resume_candidate@careeriq.dev",
        "password": "Password123!Secure",
        "full_name": "Resume Candidate",
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Upload valid PDF
    pdf_bytes = create_minimal_pdf_bytes("Candidate Name\nresume_cand@example.com\nSkills: Python, FastAPI, PostgreSQL, Git")
    files = {"file": ("my_resume.pdf", pdf_bytes, "application/pdf")}
    res = await client.post("/api/v1/resumes/upload", files=files, headers=headers)

    assert res.status_code == 201
    data = res.json()
    assert "analysis_id" in data
    assert data["analysis_status"] in ("completed", "ocr_required")
    assert "parsed_payload" in data


@pytest.mark.asyncio
async def test_resume_upload_invalid_extension(client: AsyncClient):
    reg = await client.post("/api/v1/auth/register", json={
        "email": "bad_ext@careeriq.dev",
        "password": "Password123!Secure",
        "full_name": "Bad Ext",
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    files = {"file": ("malicious.exe", b"MZ\x90\x00\x03...", "application/x-msdownload")}
    res = await client.post("/api/v1/resumes/upload", files=files, headers=headers)
    assert res.status_code == 400
    assert "Only PDF" in res.json()["error"]["message"]


@pytest.mark.asyncio
async def test_resume_upload_invalid_signature(client: AsyncClient):
    reg = await client.post("/api/v1/auth/register", json={
        "email": "fake_pdf@careeriq.dev",
        "password": "Password123!Secure",
        "full_name": "Fake PDF",
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Name says .pdf but bytes do not start with %PDF
    fake_bytes = b"NOT_A_REAL_PDF_FILE_HEADER"
    files = {"file": ("spoofed.pdf", fake_bytes, "application/pdf")}
    res = await client.post("/api/v1/resumes/upload", files=files, headers=headers)
    assert res.status_code == 400
    assert "signature does not match" in res.json()["error"]["message"]


@pytest.mark.asyncio
async def test_resume_upload_empty_file(client: AsyncClient):
    reg = await client.post("/api/v1/auth/register", json={
        "email": "empty_pdf@careeriq.dev",
        "password": "Password123!Secure",
        "full_name": "Empty PDF",
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    files = {"file": ("empty.pdf", b"", "application/pdf")}
    res = await client.post("/api/v1/resumes/upload", files=files, headers=headers)
    assert res.status_code == 400
