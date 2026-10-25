"""
CareerIQ — Abstract Storage Interface for private file management.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from typing import BinaryIO, Optional


class StorageProvider(ABC):
    """
    Storage interface supporting both local private filesystem storage
    and S3/Supabase private object storage.
    Files are NEVER publicly accessible by default.
    """

    @abstractmethod
    async def upload(
        self,
        file_data: bytes,
        storage_key: str,
        content_type: str = "application/octet-stream",
    ) -> str:
        """Saves file securely and returns the storage reference key."""
        pass

    @abstractmethod
    async def download(self, storage_key: str) -> bytes:
        """Retrieves raw file bytes by storage key."""
        pass

    @abstractmethod
    async def delete(self, storage_key: str) -> bool:
        """Deletes file from storage."""
        pass

    @abstractmethod
    async def exists(self, storage_key: str) -> bool:
        """Checks if a file exists under the given key."""
        pass
