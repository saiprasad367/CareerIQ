"""
CareerIQ — User Preferences and Settings Service.
"""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.report import UserPreference
from app.schemas.report import UserPreferencesResponse, UserPreferencesUpdate


class NotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_preferences(self, user_id: str) -> UserPreference:
        stmt = select(UserPreference).where(UserPreference.user_id == user_id)
        pref = (await self.db.execute(stmt)).scalar_one_or_none()
        if not pref:
            pref = UserPreference(user_id=user_id)
            self.db.add(pref)
            await self.db.commit()
            await self.db.refresh(pref)
        return pref

    async def update_preferences(self, user_id: str, data: UserPreferencesUpdate) -> UserPreference:
        pref = await self.get_preferences(user_id)
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(pref, k, v)
        await self.db.commit()
        await self.db.refresh(pref)
        return pref
