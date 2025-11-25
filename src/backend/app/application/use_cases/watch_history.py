"""WatchHistory Use Cases - 시청 기록 관련 유스케이스."""

from uuid import UUID

from app.application.dto.watch_history import (
    WatchHistoryResponse,
    RecordWatchProgressRequest,
    WatchProgressResponse,
)
from app.domain.entities.watch_history import WatchHistory
from app.domain.repositories.watch_history_repository import WatchHistoryRepository


class GetWatchHistoryUseCase:
    """시청 기록 조회 유스케이스.

    사용자의 시청 기록을 최신순으로 조회합니다.
    """

    def __init__(self, watch_history_repository: WatchHistoryRepository) -> None:
        self._watch_history_repository = watch_history_repository

    async def execute(
        self, user_id: UUID, limit: int = 20, offset: int = 0
    ) -> list[WatchHistoryResponse]:
        """시청 기록을 조회합니다.

        Args:
            user_id: 사용자 ID
            limit: 조회 개수
            offset: 시작 위치

        Returns:
            list[WatchHistoryResponse]: 시청 기록 목록
        """
        history_items = await self._watch_history_repository.find_by_user_id(
            user_id, limit=limit, offset=offset
        )

        return [self._to_response(item) for item in history_items]

    def _to_response(self, history: WatchHistory) -> WatchHistoryResponse:
        """엔티티를 응답 DTO로 변환합니다."""
        return WatchHistoryResponse(
            id=str(history.id),
            content_id=str(history.content_id),
            content_title=history.content_title,
            episode_number=history.episode_number,
            progress_seconds=history.progress_seconds,
            duration_seconds=history.duration_seconds,
            progress_percentage=history.progress_percentage,
            is_completed=history.is_completed,
            thumbnail_url=history.thumbnail_url,
            watched_at=history.watched_at,
        )


class RecordWatchProgressUseCase:
    """시청 진행 상황 기록 유스케이스.

    콘텐츠 시청 진행 상황을 기록합니다.
    """

    def __init__(self, watch_history_repository: WatchHistoryRepository) -> None:
        self._watch_history_repository = watch_history_repository

    async def execute(
        self, user_id: UUID, request: RecordWatchProgressRequest
    ) -> WatchHistoryResponse:
        """시청 진행 상황을 기록합니다.

        Args:
            user_id: 사용자 ID
            request: 시청 진행 상황

        Returns:
            WatchHistoryResponse: 저장된 시청 기록
        """
        content_id = UUID(request.content_id)

        # 기존 기록 확인
        existing = await self._watch_history_repository.find_by_user_and_content(
            user_id, content_id
        )

        if existing:
            # 기존 기록 업데이트
            existing.update_progress(request.progress_seconds)
            if request.episode_number is not None:
                existing.episode_number = request.episode_number
            if request.thumbnail_url is not None:
                existing.thumbnail_url = request.thumbnail_url

            updated = await self._watch_history_repository.update(existing)
            return self._to_response(updated)
        else:
            # 새 기록 생성
            new_history = WatchHistory(
                user_id=user_id,
                content_id=content_id,
                content_title=request.content_title,
                episode_number=request.episode_number,
                progress_seconds=request.progress_seconds,
                duration_seconds=request.duration_seconds,
                thumbnail_url=request.thumbnail_url,
            )
            created = await self._watch_history_repository.create(new_history)
            return self._to_response(created)

    def _to_response(self, history: WatchHistory) -> WatchHistoryResponse:
        """엔티티를 응답 DTO로 변환합니다."""
        return WatchHistoryResponse(
            id=str(history.id),
            content_id=str(history.content_id),
            content_title=history.content_title,
            episode_number=history.episode_number,
            progress_seconds=history.progress_seconds,
            duration_seconds=history.duration_seconds,
            progress_percentage=history.progress_percentage,
            is_completed=history.is_completed,
            thumbnail_url=history.thumbnail_url,
            watched_at=history.watched_at,
        )


class GetWatchProgressUseCase:
    """시청 진행 상황 조회 유스케이스.

    특정 콘텐츠의 시청 진행 상황을 조회합니다.
    """

    def __init__(self, watch_history_repository: WatchHistoryRepository) -> None:
        self._watch_history_repository = watch_history_repository

    async def execute(
        self, user_id: UUID, content_id: UUID
    ) -> WatchProgressResponse | None:
        """시청 진행 상황을 조회합니다.

        Args:
            user_id: 사용자 ID
            content_id: 콘텐츠 ID

        Returns:
            WatchProgressResponse | None: 시청 진행 상황 또는 None
        """
        history = await self._watch_history_repository.find_by_user_and_content(
            user_id, content_id
        )

        if not history:
            return None

        return WatchProgressResponse(
            content_id=str(history.content_id),
            episode_number=history.episode_number,
            progress_seconds=history.progress_seconds,
            duration_seconds=history.duration_seconds,
            progress_percentage=history.progress_percentage,
        )
