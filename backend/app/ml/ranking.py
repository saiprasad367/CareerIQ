"""
CareerIQ — Core scoring and ranking formulas.
Preserves the exact mathematical definitions specified in src/lib/scoring.ts:
  Job Matching:      M = 0.45K + 0.25E + 0.15X + 0.15P
  ATS Compatibility: A = 0.50R + 0.30T + 0.20F
"""
from __future__ import annotations

from typing import Dict, List, Set, Tuple


SCORING_VERSION = "1.0.0"


def calculate_skill_coverage(
    candidate_skills: Set[str],
    required_skills: Set[str],
) -> float:
    """
    K = (matched required skills / total required skills) * 100
    Returns 100.0 if required_skills is empty (safe zero-denominator handling).
    """
    if not required_skills:
        return 100.0
    matched = candidate_skills.intersection(required_skills)
    return round((len(matched) / len(required_skills)) * 100.0, 1)


def calculate_experience_compatibility(
    candidate_level: str,
    job_level: str,
) -> float:
    """
    X = Experience compatibility score (0 to 100).
    """
    levels = {"entry": 1, "mid": 2, "senior": 3, "lead": 4}
    c_num = levels.get(candidate_level.lower(), 1)
    j_num = levels.get(job_level.lower(), 1)

    diff = c_num - j_num
    if diff == 0:
        return 100.0
    elif diff > 0:
        # Candidate is higher level: high compatibility
        return 90.0
    elif diff == -1:
        # One level lower (e.g. entry applying to mid)
        return 70.0
    else:
        # Two or more levels lower
        return 40.0


def calculate_preference_compatibility(
    candidate_work_mode: str,
    candidate_locations: List[str],
    job_work_mode: str,
    job_location: str,
) -> float:
    """
    P = Preference compatibility score (0 to 100).
    Considers work mode match (remote/hybrid/onsite) and location match.
    """
    score = 0.0

    # Work mode match (up to 60 points)
    c_mode = candidate_work_mode.lower()
    j_mode = job_work_mode.lower()
    if c_mode == "any" or c_mode == j_mode:
        score += 60.0
    elif (c_mode == "hybrid" and j_mode in ("remote", "onsite")) or (c_mode == "remote" and j_mode == "hybrid"):
        score += 40.0
    else:
        score += 20.0

    # Location match (up to 40 points)
    if j_mode == "remote":
        score += 40.0
    elif not candidate_locations:
        score += 30.0
    else:
        norm_j_loc = job_location.lower()
        if any(loc.lower() in norm_j_loc or norm_j_loc in loc.lower() for loc in candidate_locations):
            score += 40.0
        else:
            score += 15.0

    return min(100.0, round(score, 1))


def calculate_job_match(
    candidate_skills: Set[str],
    required_skills: Set[str],
    semantic_similarity: float,  # E in [0, 100]
    candidate_level: str = "entry",
    job_level: str = "entry",
    candidate_work_mode: str = "hybrid",
    candidate_locations: List[str] = None,
    job_work_mode: str = "hybrid",
    job_location: str = "Remote",
) -> Dict[str, float]:
    """
    Computes overall match score M = 0.45K + 0.25E + 0.15X + 0.15P.
    """
    k = calculate_skill_coverage(candidate_skills, required_skills)
    e = max(0.0, min(100.0, semantic_similarity))
    x = calculate_experience_compatibility(candidate_level, job_level)
    p = calculate_preference_compatibility(
        candidate_work_mode, candidate_locations or [], job_work_mode, job_location
    )

    total_m = (0.45 * k) + (0.25 * e) + (0.15 * x) + (0.15 * p)
    total_m = round(max(0.0, min(100.0, total_m)), 1)

    return {
        "score": total_m,
        "required_skill_coverage": k,
        "semantic_similarity": round(e, 1),
        "experience_compatibility": x,
        "preference_compatibility": p,
        "scoring_version": SCORING_VERSION,
    }


def calculate_ats_score(
    candidate_skills: Set[str],
    job_required_skills: Set[str],
    candidate_keywords: Set[str],
    job_keywords: Set[str],
    formatting_checks: Dict[str, bool],
) -> Dict[str, float]:
    """
    ATS compatibility: A = 0.50R + 0.30T + 0.20F
      R = required skill coverage
      T = relevant keyword coverage
      F = formatting / section completeness
    """
    # R: Skill coverage
    r = calculate_skill_coverage(candidate_skills, job_required_skills)

    # T: Keyword coverage
    if not job_keywords:
        t = 100.0
    else:
        matched_kw = candidate_keywords.intersection(job_keywords)
        t = round((len(matched_kw) / len(job_keywords)) * 100.0, 1)

    # F: Formatting completeness (e.g. contact_info, summary, experience, education, skills)
    if not formatting_checks:
        f = 80.0
    else:
        passed = sum(1 for v in formatting_checks.values() if v)
        f = round((passed / len(formatting_checks)) * 100.0, 1)

    ats = (0.50 * r) + (0.30 * t) + (0.20 * f)
    ats = round(max(0.0, min(100.0, ats)), 1)

    return {
        "overall_score": ats,
        "required_skill_coverage": r,
        "keyword_coverage": t,
        "formatting_completeness": f,
        "scoring_version": SCORING_VERSION,
    }
