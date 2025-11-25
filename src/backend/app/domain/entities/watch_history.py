"""WatchHistory Entity - 시청 기록 도메인 엔티티."""

from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID

from app.domain.entities.base import Entity


@dataclass
class WatchHistory(Entity):
    """시청 기록 엔티티.

    사용자의 콘텐츠 시청 기록을 저장합니다.

    Attributes:
        user_id: 사용자 ID
        content_id: 콘텐츠 ID
        content_title: 콘텐츠 제목
        episode_number: 에피소드 번호 (선택)
        progress_seconds: 시청 진행 시간 (초)
        duration_seconds: 전체 재생 시간 (초)
        watched_at: 마지막 시청 시간
    """

    user_id: UUID = field(default_factory=lambda: UUID(int=0))
    content_id: UUID = field(default_factory=lambda: UUID(int=0))
    content_title: str = ""
    episode_number: int | None = None
    progress_seconds: int = 0
    duration_seconds: int = 0
    watched_at: datetime | None = None
    thumbnail_url: str | None = None

    def __init__(
        self,
        user_id: UUID,
        content_id: UUID,
        content_title: str = "",
        episode_number: int | None = None,
        progress_seconds: int = 0,
        duration_seconds: int = 0,
        watched_at: datetime | None = None,
        thumbnail_url: str | None = None,
        id: UUID | None = None,
        created_at: datetime | None = None,
        updated_at: datetime | None = None,
    ) -> None:
        super().__init__(id=id, created_at=created_at, updated_at=updated_at)
        self.user_id = user_id
        self.content_id = content_id
        self.content_title = content_title
        self.episode_number = episode_number
        self.progress_seconds = progress_seconds
        self.duration_seconds = duration_seconds
        self.watched_at = watched_at or datetime.utcnow()
        self.thumbnail_url = thumbnail_url

    def update_progress(self, progress_seconds: int) -> None:
        """시청 진행 상황을 업데이트합니다.

        Args:
            progress_seconds: 새로운 진행 시간 (초)
        """
        self.progress_seconds = progress_seconds
        self.watched_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    @property
    def progress_percentage(self) -> float:
        """시청 진행률 (%)을 반환합니다."""
        if self.duration_seconds == 0:
            return 0.0
        return (self.progress_seconds / self.duration_seconds) * 100

    @property
    def is_completed(self) -> bool:
        """시청 완료 여부를 반환합니다 (90% 이상 시청)."""
        return self.progress_percentage >= 90
