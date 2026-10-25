"""
CareerIQ — Storage Factory.
"""
from functools import lru_cache
from app.core.config import get_settings
from app.storage.base import StorageProvider
from app.storage.local import LocalStorageProvider


@lru_cache(maxsize=1)
def get_storage_provider() -> StorageProvider:
    settings = get_settings()
    if settings.STORAGE_BACKEND in ("s3", "supabase"):
        from app.storage.object_storage import S3StorageProvider
        return S3StorageProvider()
    return LocalStorageProvider()
