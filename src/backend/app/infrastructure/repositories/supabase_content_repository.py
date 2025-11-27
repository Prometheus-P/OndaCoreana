"""Supabase Content Repository - Supabase 기반 콘텐츠 리포지토리 구현."""

from datetime import datetime
from typing import Literal
from uuid import UUID

from supabase import Client

from app.domain.entities.base import utc_now
from app.domain.entities.content import Content
from app.domain.repositories.content_repository import ContentRepository


class SupabaseContentRepository(ContentRepository):
    """Supabase 기반 콘텐츠 리포지토리 구현.

    Supabase PostgreSQL을 사용하여 콘텐츠 데이터를 저장/조회합니다.
    """

    TABLE_NAME = "contents"

    def __init__(self, client: Client) -> None:
        self._client = client

    async def find_by_id(self, content_id: UUID) -> Content | None:
        """ID로 콘텐츠를 조회합니다."""
        result = (
            self._client.table(self.TABLE_NAME)
            .select("*")
            .eq("id", str(content_id))
            .execute()
        )

        if result.data and len(result.data) > 0:
            return self._to_entity(result.data[0])
        return None

    async def find_all(
        self,
        offset: int = 0,
        limit: int = 20,
        published_only: bool = True,
    ) -> list[Content]:
        """모든 콘텐츠를 조회합니다."""
        query = self._client.table(self.TABLE_NAME).select("*")

        if published_only:
            query = query.eq("is_published", True)

        result = (
            query
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )

        return [self._to_entity(data) for data in result.data] if result.data else []

    async def find_by_type(
        self,
        content_type: Literal["drama", "movie", "mv", "variety"],
        offset: int = 0,
        limit: int = 20,
    ) -> list[Content]:
        """콘텐츠 유형으로 조회합니다."""
        result = (
            self._client.table(self.TABLE_NAME)
            .select("*")
            .eq("content_type", content_type)
            .eq("is_published", True)
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )

        return [self._to_entity(data) for data in result.data] if result.data else []

    async def find_by_genre(
        self,
        genre: str,
        offset: int = 0,
        limit: int = 20,
    ) -> list[Content]:
        """장르로 콘텐츠를 조회합니다."""
        # PostgreSQL의 배열 contains 연산자 사용
        result = (
            self._client.table(self.TABLE_NAME)
            .select("*")
            .contains("genre", [genre])
            .eq("is_published", True)
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )

        return [self._to_entity(data) for data in result.data] if result.data else []

    async def search(
        self,
        query: str,
        offset: int = 0,
        limit: int = 20,
    ) -> list[Content]:
        """키워드로 콘텐츠를 검색합니다.

        PostgreSQL의 전문 검색 (Full-Text Search)을 사용합니다.
        제목, 설명, 출연진에서 검색합니다.
        """
        # ilike를 사용한 부분 검색 (PostgreSQL FTS 설정 전까지)
        search_pattern = f"%{query}%"

        result = (
            self._client.table(self.TABLE_NAME)
            .select("*")
            .eq("is_published", True)
            .or_(
                f"title.ilike.{search_pattern},"
                f"title_es.ilike.{search_pattern},"
                f"title_pt.ilike.{search_pattern},"
                f"description.ilike.{search_pattern},"
                f"director.ilike.{search_pattern}"
            )
            .order("view_count", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )

        return [self._to_entity(data) for data in result.data] if result.data else []

    async def count(self, published_only: bool = True) -> int:
        """전체 콘텐츠 수를 반환합니다."""
        query = self._client.table(self.TABLE_NAME).select("id", count="exact")

        if published_only:
            query = query.eq("is_published", True)

        result = query.execute()
        return result.count if result.count else 0

    async def count_by_type(
        self,
        content_type: Literal["drama", "movie", "mv", "variety"],
    ) -> int:
        """콘텐츠 유형별 수를 반환합니다."""
        result = (
            self._client.table(self.TABLE_NAME)
            .select("id", count="exact")
            .eq("content_type", content_type)
            .eq("is_published", True)
            .execute()
        )
        return result.count if result.count else 0

    async def count_by_genre(self, genre: str) -> int:
        """장르별 콘텐츠 수를 반환합니다."""
        result = (
            self._client.table(self.TABLE_NAME)
            .select("id", count="exact")
            .contains("genre", [genre])
            .eq("is_published", True)
            .execute()
        )
        return result.count if result.count else 0

    async def count_search(self, query: str) -> int:
        """검색 결과 콘텐츠 수를 반환합니다."""
        search_pattern = f"%{query}%"

        result = (
            self._client.table(self.TABLE_NAME)
            .select("id", count="exact")
            .eq("is_published", True)
            .or_(
                f"title.ilike.{search_pattern},"
                f"title_es.ilike.{search_pattern},"
                f"title_pt.ilike.{search_pattern},"
                f"description.ilike.{search_pattern},"
                f"director.ilike.{search_pattern}"
            )
            .execute()
        )
        return result.count if result.count else 0

    async def create(self, content: Content) -> Content:
        """새 콘텐츠를 생성합니다."""
        data = self._to_dict(content)

        result = self._client.table(self.TABLE_NAME).insert(data).execute()

        if result.data:
            return self._to_entity(result.data[0])
        return content

    async def update(self, content: Content) -> Content:
        """콘텐츠를 수정합니다."""
        data = self._to_dict(content)
        data["updated_at"] = utc_now().isoformat()
        del data["id"]  # ID는 업데이트하지 않음
        del data["created_at"]  # created_at은 업데이트하지 않음

        result = (
            self._client.table(self.TABLE_NAME)
            .update(data)
            .eq("id", str(content.id))
            .execute()
        )

        if result.data:
            return self._to_entity(result.data[0])
        return content

    async def delete(self, content_id: UUID) -> bool:
        """콘텐츠를 삭제합니다."""
        result = (
            self._client.table(self.TABLE_NAME)
            .delete()
            .eq("id", str(content_id))
            .execute()
        )
        return len(result.data) > 0 if result.data else False

    def _to_dict(self, content: Content) -> dict:
        """엔티티를 딕셔너리로 변환합니다."""
        return {
            "id": str(content.id),
            "title": content.title,
            "title_es": content.title_es,
            "title_pt": content.title_pt,
            "description": content.description,
            "description_es": content.description_es,
            "description_pt": content.description_pt,
            "content_type": content.content_type,
            "genre": content.genre,
            "release_year": content.release_year,
            "duration_minutes": content.duration_minutes,
            "thumbnail_url": content.thumbnail_url,
            "video_url": content.video_url,
            "rating": content.rating,
            "view_count": content.view_count,
            "is_published": content.is_published,
            "cast": content.cast,
            "director": content.director,
            "production_company": content.production_company,
            "season": content.season,
            "episode": content.episode,
            "series_id": str(content.series_id) if content.series_id else None,
            "created_at": content.created_at.isoformat(),
            "updated_at": content.updated_at.isoformat(),
        }

    def _to_entity(self, data: dict) -> Content:
        """데이터베이스 레코드를 엔티티로 변환합니다."""
        series_id = None
        if data.get("series_id"):
            try:
                series_id = UUID(data["series_id"])
            except (ValueError, TypeError):
                series_id = None

        return Content(
            id=UUID(data["id"]),
            title=data.get("title", ""),
            title_es=data.get("title_es", ""),
            title_pt=data.get("title_pt", ""),
            description=data.get("description", ""),
            description_es=data.get("description_es", ""),
            description_pt=data.get("description_pt", ""),
            content_type=data.get("content_type", "drama"),
            genre=data.get("genre", []),
            release_year=data.get("release_year", 2024),
            duration_minutes=data.get("duration_minutes", 0),
            thumbnail_url=data.get("thumbnail_url", ""),
            video_url=data.get("video_url", ""),
            rating=data.get("rating", 0.0),
            view_count=data.get("view_count", 0),
            is_published=data.get("is_published", True),
            cast=data.get("cast", []),
            director=data.get("director", ""),
            production_company=data.get("production_company", ""),
            season=data.get("season"),
            episode=data.get("episode"),
            series_id=series_id,
            created_at=datetime.fromisoformat(data["created_at"].replace("Z", "+00:00"))
            if data.get("created_at")
            else None,
            updated_at=datetime.fromisoformat(data["updated_at"].replace("Z", "+00:00"))
            if data.get("updated_at")
            else None,
        )
