"""
CareerIQ — Unit tests for matching and ATS formulas.
Verifies mathematical correctness of:
  M = 0.45K + 0.25E + 0.15X + 0.15P
  A = 0.50R + 0.30T + 0.20F
"""
import pytest
from app.ml.ranking import (
    calculate_ats_score,
    calculate_experience_compatibility,
    calculate_job_match,
    calculate_preference_compatibility,
    calculate_skill_coverage,
)


def test_skill_coverage_calculation():
    cand_skills = {"python", "fastapi", "sql"}
    req_skills = {"python", "fastapi", "docker", "kubernetes"}
    coverage = calculate_skill_coverage(cand_skills, req_skills)
    assert coverage == 50.0  # 2 of 4 matched = 50.0%


def test_zero_required_skills_safe_handling():
    # Never divide by zero
    coverage = calculate_skill_coverage({"python"}, set())
    assert coverage == 100.0


def test_experience_compatibility_levels():
    assert calculate_experience_compatibility("entry", "entry") == 100.0
    assert calculate_experience_compatibility("mid", "entry") == 90.0
    assert calculate_experience_compatibility("entry", "mid") == 70.0
    assert calculate_experience_compatibility("entry", "senior") == 40.0


def test_preference_compatibility():
    score_match = calculate_preference_compatibility("hybrid", ["Bengaluru"], "hybrid", "Bengaluru, India")
    assert score_match == 100.0  # 60 mode + 40 location

    score_mismatch = calculate_preference_compatibility("remote", ["Pune"], "onsite", "Delhi")
    assert score_mismatch < 50.0


def test_job_match_formula_weights():
    cand_skills = {"python", "fastapi"}
    req_skills = {"python", "fastapi"}  # K = 100
    semantic_sim = 80.0                 # E = 80

    res = calculate_job_match(
        candidate_skills=cand_skills,
        required_skills=req_skills,
        semantic_similarity=semantic_sim,
        candidate_level="entry",
        job_level="entry",            # X = 100
        candidate_work_mode="hybrid",
        candidate_locations=["Bengaluru"],
        job_work_mode="hybrid",
        job_location="Bengaluru",     # P = 100
    )

    # Expected M = (0.45 * 100) + (0.25 * 80) + (0.15 * 100) + (0.15 * 100)
    #            = 45 + 20 + 15 + 15 = 95.0
    assert res["score"] == 95.0
    assert res["required_skill_coverage"] == 100.0
    assert res["semantic_similarity"] == 80.0
    assert res["experience_compatibility"] == 100.0
    assert res["preference_compatibility"] == 100.0


def test_ats_score_formula():
    cand_skills = {"python", "sql"}
    req_skills = {"python", "sql", "docker", "aws"}  # R = 50%
    cand_kw = {"async", "rest", "git"}
    job_kw = {"async", "rest", "docker"}              # T = 66.7%
    formatting = {"contact": True, "skills": True, "edu": True, "exp": True}  # F = 100%

    ats_res = calculate_ats_score(
        candidate_skills=cand_skills,
        job_required_skills=req_skills,
        candidate_keywords=cand_kw,
        job_keywords=job_kw,
        formatting_checks=formatting,
    )

    # Expected: (0.50 * 50) + (0.30 * 66.7) + (0.20 * 100) = 25 + 20.0 + 20.0 = 65.0
    assert ats_res["overall_score"] > 60.0
    assert ats_res["overall_score"] < 70.0
