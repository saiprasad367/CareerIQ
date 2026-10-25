"""
CareerIQ — Local private filesystem storage provider.
"""
from __future__ import annotations

import os
from pathlib import Path
from app.core.config import get_settings
from app.storage.base import StorageProvider


class LocalStorageProvider(StorageProvider):
    def __init__(self, base_dir: Optional[Path] = None):
        settings = get_settings()
        self.base_dir = Path(base_dir or settings.LOCAL_STORAGE_DIR).resolve()
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def _get_path(self, storage_key: str) -> Path:
        # Sanitize against path traversal attacks
        clean_key = os.path.basename(storage_key.replace("/", os.sep))
        return self.base_dir / clean_key

    async def upload(
        self,
        file_data: bytes,
        storage_key: str,
        content_type: str = "application/octet-stream",
    ) -> str:
        target_path = self._get_path(storage_key)
        target_path.write_bytes(file_data)
        return storage_key

    async def download(self, storage_key: str) -> bytes:
        target_path = self._get_path(storage_key)
        if not target_path.exists():
            raise FileNotFoundError(f"File not found in storage: {storage_key}")
        return target_path.read_bytes()

    async def delete(self, storage_key: str) -> bool:
        target_path = self._get_path(storage_key)
        if target_path.exists():
            target_path.unlink()
            return True
        return False

    async def exists(self, storage_key: str) -> bool:
        return self._get_path(storage_key).exists()
