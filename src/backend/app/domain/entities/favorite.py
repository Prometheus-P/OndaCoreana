"""Favorite Entity - 즐겨찾기 도메인 엔티티."""

from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID

from app.domain.entities.base import Entity


@dataclass
class Favorite(Entity):
    """즐겨찾기 엔티티.

    사용자의 콘텐츠 즐겨찾기를 저장합니다.

    Attributes:
        user_id: 사용자 ID
        content_id: 콘텐츠 ID
        content_title: 콘텐츠 제목
        content_type: 콘텐츠 유형 (drama, movie, music, etc.)
        thumbnail_url: 썸네일 URL
    """

    user_id: UUID = field(default_factory=lambda: UUID(int=0))
    content_id: UUID = field(default_factory=lambda: UUID(int=0))
    content_title: str = ""
    content_type: str = ""
    thumbnail_url: str | None = None

    def __init__(
        self,
        user_id: UUID,
        content_id: UUID,
        content_title: str = "",
        content_type: str = "",
        thumbnail_url: str | None = None,
        id: UUID | None = None,
        created_at: datetime | None = None,
        updated_at: datetime | None = None,
    ) -> None:
        super().__init__(id=id, created_at=created_at, updated_at=updated_at)
        self.user_id = user_id
        self.content_id = content_id
        self.content_title = content_title
        self.content_type = content_type
        self.thumbnail_url = thumbnail_url
