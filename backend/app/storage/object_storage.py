"""
CareerIQ — S3 / Supabase private object storage provider (lazy initialized).
"""
from __future__ import annotations

import io
from typing import Optional
from app.core.config import get_settings
from app.storage.base import StorageProvider


class S3StorageProvider(StorageProvider):
    def __init__(self):
        settings = get_settings()
        self.bucket = settings.S3_BUCKET_NAME
        self.endpoint = settings.S3_ENDPOINT_URL
        self.access_key = settings.S3_ACCESS_KEY_ID
        self.secret_key = settings.S3_SECRET_ACCESS_KEY
        self.region = settings.S3_REGION

    def _get_client(self):
        try:
            import boto3
            return boto3.client(
                "s3",
                endpoint_url=self.endpoint or None,
                aws_access_key_id=self.access_key,
                aws_secret_access_key=self.secret_key,
                region_name=self.region,
            )
        except ImportError:
            raise RuntimeError("boto3 is required for S3StorageProvider. Install it or use STORAGE_BACKEND=local.")

    async def upload(
        self,
        file_data: bytes,
        storage_key: str,
        content_type: str = "application/octet-stream",
    ) -> str:
        client = self._get_client()
        client.put_object(
            Bucket=self.bucket,
            Key=storage_key,
            Body=file_data,
            ContentType=content_type,
            ServerSideEncryption="AES256",
        )
        return storage_key

    async def download(self, storage_key: str) -> bytes:
        client = self._get_client()
        out = io.BytesIO()
        client.download_fileobj(self.bucket, storage_key, out)
        return out.getvalue()

    async def delete(self, storage_key: str) -> bool:
        client = self._get_client()
        client.delete_object(Bucket=self.bucket, Key=storage_key)
        return True

    async def exists(self, storage_key: str) -> bool:
        client = self._get_client()
        try:
            client.head_object(Bucket=self.bucket, Key=storage_key)
            return True
        except Exception:
            return False
