"""Supabase WatchHistory Repository - Supabase 기반 시청 기록 리포지토리 구현."""

from datetime import datetime
from uuid import UUID

from supabase import Client

from app.domain.entities.watch_history import WatchHistory
from app.domain.repositories.watch_history_repository import WatchHistoryRepository


class SupabaseWatchHistoryRepository(WatchHistoryRepository):
    """Supabase 기반 시청 기록 리포지토리 구현.

    Supabase PostgreSQL을 사용하여 시청 기록 데이터를 저장/조회합니다.
    """

    TABLE_NAME = "watch_history"

    def __init__(self, client: Client) -> None:
        self._client = client

    async def create(self, watch_history: WatchHistory) -> WatchHistory:
        """시청 기록을 생성합니다."""
        data = {
            "id": str(watch_history.id),
            "user_id": str(watch_history.user_id),
            "content_id": str(watch_history.content_id),
            "content_title": watch_history.content_title,
            "episode_number": watch_history.episode_number,
            "progress_seconds": watch_history.progress_seconds,
            "duration_seconds": watch_history.duration_seconds,
            "thumbnail_url": watch_history.thumbnail_url,
            "watched_at": watch_history.watched_at.isoformat()
            if watch_history.watched_at
            else datetime.utcnow().isoformat(),
            "created_at": watch_history.created_at.isoformat(),
            "updated_at": watch_history.updated_at.isoformat(),
        }

        result = self._client.table(self.TABLE_NAME).insert(data).execute()

        if result.data:
            return self._to_entity(result.data[0])
        return watch_history

    async def find_by_id(self, history_id: UUID) -> WatchHistory | None:
        """ID로 시청 기록을 조회합니다."""
        result = (
            self._client.table(self.TABLE_NAME)
            .select("*")
            .eq("id", str(history_id))
            .execute()
        )

        if result.data and len(result.data) > 0:
            return self._to_entity(result.data[0])
        return None

    async def find_by_user_id(
        self, user_id: UUID, limit: int = 20, offset: int = 0
    ) -> list[WatchHistory]:
        """사용자의 시청 기록을 조회합니다 (최신순)."""
        result = (
            self._client.table(self.TABLE_NAME)
            .select("*")
            .eq("user_id", str(user_id))
            .order("watched_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )

        if result.data:
            return [self._to_entity(row) for row in result.data]
        return []

    async def find_by_user_and_content(
        self, user_id: UUID, content_id: UUID
    ) -> WatchHistory | None:
        """사용자와 콘텐츠로 시청 기록을 조회합니다."""
        result = (
            self._client.table(self.TABLE_NAME)
            .select("*")
            .eq("user_id", str(user_id))
            .eq("content_id", str(content_id))
            .execute()
        )

        if result.data and len(result.data) > 0:
            return self._to_entity(result.data[0])
        return None

    async def update(self, watch_history: WatchHistory) -> WatchHistory:
        """시청 기록을 업데이트합니다."""
        data = {
            "content_title": watch_history.content_title,
            "episode_number": watch_history.episode_number,
            "progress_seconds": watch_history.progress_seconds,
            "duration_seconds": watch_history.duration_seconds,
            "thumbnail_url": watch_history.thumbnail_url,
            "watched_at": watch_history.watched_at.isoformat()
            if watch_history.watched_at
            else datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }

        result = (
            self._client.table(self.TABLE_NAME)
            .update(data)
            .eq("id", str(watch_history.id))
            .execute()
        )

        if result.data:
            return self._to_entity(result.data[0])
        return watch_history

    async def delete(self, history_id: UUID) -> bool:
        """시청 기록을 삭제합니다."""
        result = (
            self._client.table(self.TABLE_NAME)
            .delete()
            .eq("id", str(history_id))
            .execute()
        )
        return len(result.data) > 0 if result.data else False

    def _to_entity(self, data: dict) -> WatchHistory:
        """데이터베이스 레코드를 엔티티로 변환합니다."""
        return WatchHistory(
            id=UUID(data["id"]),
            user_id=UUID(data["user_id"]),
            content_id=UUID(data["content_id"]),
            content_title=data.get("content_title", ""),
            episode_number=data.get("episode_number"),
            progress_seconds=data.get("progress_seconds", 0),
            duration_seconds=data.get("duration_seconds", 0),
            thumbnail_url=data.get("thumbnail_url"),
            watched_at=datetime.fromisoformat(
                data["watched_at"].replace("Z", "+00:00")
            )
            if data.get("watched_at")
            else None,
            created_at=datetime.fromisoformat(
                data["created_at"].replace("Z", "+00:00")
            )
            if data.get("created_at")
            else None,
            updated_at=datetime.fromisoformat(
                data["updated_at"].replace("Z", "+00:00")
            )
            if data.get("updated_at")
            else None,
        )
