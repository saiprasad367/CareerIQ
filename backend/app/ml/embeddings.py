"""
CareerIQ — Semantic embeddings and similarity calculation.
Uses sentence-transformers if available; provides a fast deterministic
TF-IDF / N-gram cosine similarity fallback when offline or model is not loaded.
"""
from __future__ import annotations

import math
import re
from functools import lru_cache
from typing import List, Optional
import structlog

logger = structlog.get_logger(__name__)

_MODEL_INSTANCE = None
_MODEL_LOAD_FAILED = False


def _get_sentence_transformer():
    global _MODEL_INSTANCE, _MODEL_LOAD_FAILED
    if _MODEL_INSTANCE is not None:
        return _MODEL_INSTANCE
    if _MODEL_LOAD_FAILED:
        return None

    try:
        from sentence_transformers import SentenceTransformer
        logger.info("loading_sentence_transformer_model", model="all-MiniLM-L6-v2")
        _MODEL_INSTANCE = SentenceTransformer("all-MiniLM-L6-v2")
        return _MODEL_INSTANCE
    except Exception as e:
        logger.warning("sentence_transformer_unavailable_using_fallback", error=str(e))
        _MODEL_LOAD_FAILED = True
        return None


def _tokenize(text: str) -> List[str]:
    return [w for w in re.findall(r"\b[a-zA-Z0-9_\-\.\#\+]{2,}\b", text.lower())]


def compute_fallback_similarity(text1: str, text2: str) -> float:
    """
    Fast cosine similarity based on sublinear term frequencies.
    Always returns a float between 0.0 and 100.0.
    """
    tokens1 = _tokenize(text1)
    tokens2 = _tokenize(text2)

    if not tokens1 or not tokens2:
        return 50.0  # neutral similarity

    # Frequency vectors
    vec1 = {}
    for t in tokens1:
        vec1[t] = vec1.get(t, 0) + 1
    vec2 = {}
    for t in tokens2:
        vec2[t] = vec2.get(t, 0) + 1

    # Dot product and magnitudes
    dot = 0.0
    for k, v in vec1.items():
        if k in vec2:
            dot += (1 + math.log(v)) * (1 + math.log(vec2[k]))

    mag1 = math.sqrt(sum((1 + math.log(v)) ** 2 for v in vec1.values()))
    mag2 = math.sqrt(sum((1 + math.log(v)) ** 2 for v in vec2.values()))

    if mag1 == 0 or mag2 == 0:
        return 50.0

    cos_sim = dot / (mag1 * mag2)
    # Scale from [0, 1] to [0, 100]
    return round(float(cos_sim * 100.0), 1)


def compute_semantic_similarity(text1: str, text2: str) -> float:
    """
    Computes semantic similarity score (0.0 to 100.0) between two text blocks.
    Tries sentence-transformers first; seamlessly falls back if unavailable.
    """
    if not text1.strip() or not text2.strip():
        return 50.0

    model = _get_sentence_transformer()
    if model is not None:
        try:
            from sentence_transformers import util
            emb1 = model.encode(text1, convert_to_tensor=True)
            emb2 = model.encode(text2, convert_to_tensor=True)
            cos_score = util.cos_sim(emb1, emb2).item()
            # Normalize to 0-100 range
            normalized = max(0.0, min(100.0, float(cos_score * 100.0)))
            return round(normalized, 1)
        except Exception as e:
            logger.warning("sentence_transformers_inference_failed", error=str(e))

    return compute_fallback_similarity(text1, text2)
