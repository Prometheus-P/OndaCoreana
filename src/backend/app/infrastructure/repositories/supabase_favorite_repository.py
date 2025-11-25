"""Supabase Favorite Repository - Supabase 기반 즐겨찾기 리포지토리 구현."""

from datetime import datetime
from uuid import UUID

from supabase import Client

from app.domain.entities.favorite import Favorite
from app.domain.repositories.favorite_repository import FavoriteRepository


class SupabaseFavoriteRepository(FavoriteRepository):
    """Supabase 기반 즐겨찾기 리포지토리 구현.

    Supabase PostgreSQL을 사용하여 즐겨찾기 데이터를 저장/조회합니다.
    """

    TABLE_NAME = "favorites"

    def __init__(self, client: Client) -> None:
        self._client = client

    async def create(self, favorite: Favorite) -> Favorite:
        """즐겨찾기를 생성합니다."""
        data = {
            "id": str(favorite.id),
            "user_id": str(favorite.user_id),
            "content_id": str(favorite.content_id),
            "content_title": favorite.content_title,
            "content_type": favorite.content_type,
            "thumbnail_url": favorite.thumbnail_url,
            "created_at": favorite.created_at.isoformat(),
            "updated_at": favorite.updated_at.isoformat(),
        }

        result = self._client.table(self.TABLE_NAME).insert(data).execute()

        if result.data:
            return self._to_entity(result.data[0])
        return favorite

    async def find_by_id(self, favorite_id: UUID) -> Favorite | None:
        """ID로 즐겨찾기를 조회합니다."""
        result = (
            self._client.table(self.TABLE_NAME)
            .select("*")
            .eq("id", str(favorite_id))
            .execute()
        )

        if result.data and len(result.data) > 0:
            return self._to_entity(result.data[0])
        return None

    async def find_by_user_id(
        self, user_id: UUID, limit: int = 20, offset: int = 0
    ) -> list[Favorite]:
        """사용자의 즐겨찾기를 조회합니다 (최신순)."""
        result = (
            self._client.table(self.TABLE_NAME)
            .select("*")
            .eq("user_id", str(user_id))
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )

        if result.data:
            return [self._to_entity(row) for row in result.data]
        return []

    async def find_by_user_and_content(
        self, user_id: UUID, content_id: UUID
    ) -> Favorite | None:
        """사용자와 콘텐츠로 즐겨찾기를 조회합니다."""
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

    async def delete(self, favorite_id: UUID) -> bool:
        """즐겨찾기를 삭제합니다."""
        result = (
            self._client.table(self.TABLE_NAME)
            .delete()
            .eq("id", str(favorite_id))
            .execute()
        )
        return len(result.data) > 0 if result.data else False

    async def count_by_user_id(self, user_id: UUID) -> int:
        """사용자의 즐겨찾기 개수를 조회합니다."""
        result = (
            self._client.table(self.TABLE_NAME)
            .select("id", count="exact")
            .eq("user_id", str(user_id))
            .execute()
        )
        return result.count if result.count else 0

    def _to_entity(self, data: dict) -> Favorite:
        """데이터베이스 레코드를 엔티티로 변환합니다."""
        return Favorite(
            id=UUID(data["id"]),
            user_id=UUID(data["user_id"]),
            content_id=UUID(data["content_id"]),
            content_title=data.get("content_title", ""),
            content_type=data.get("content_type", ""),
            thumbnail_url=data.get("thumbnail_url"),
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
