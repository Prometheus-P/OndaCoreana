"""시청 기록 기능 단위 테스트."""

import pytest
from unittest.mock import AsyncMock, MagicMock
from uuid import UUID
from datetime import datetime

from app.application.dto.watch_history import (
    WatchHistoryResponse,
    RecordWatchProgressRequest,
)
from app.application.use_cases.watch_history import (
    GetWatchHistoryUseCase,
    RecordWatchProgressUseCase,
    GetWatchProgressUseCase,
)
from app.domain.entities.watch_history import WatchHistory


class TestGetWatchHistory:
    """시청 기록 조회 테스트."""

    @pytest.fixture
    def mock_watch_history_repository(self):
        """시청 기록 리포지토리 목."""
        return MagicMock()

    @pytest.mark.asyncio
    async def test_should_list_watch_history_in_reverse_chronological_order(
        self, mock_watch_history_repository
    ):
        """시청 기록을 최신순으로 조회해야 한다."""
        # Given
        user_id = UUID("12345678-1234-1234-1234-123456789012")
        history_items = [
            WatchHistory(
                id=UUID("11111111-1111-1111-1111-111111111111"),
                user_id=user_id,
                content_id=UUID("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                content_title="Drama A",
                episode_number=1,
                progress_seconds=1800,
                duration_seconds=3600,
                watched_at=datetime(2025, 11, 25, 10, 0, 0),
            ),
            WatchHistory(
                id=UUID("22222222-2222-2222-2222-222222222222"),
                user_id=user_id,
                content_id=UUID("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                content_title="Drama B",
                episode_number=3,
                progress_seconds=2700,
                duration_seconds=3600,
                watched_at=datetime(2025, 11, 24, 15, 0, 0),
            ),
        ]
        mock_watch_history_repository.find_by_user_id = AsyncMock(
            return_value=history_items
        )

        use_case = GetWatchHistoryUseCase(mock_watch_history_repository)

        # When
        result = await use_case.execute(user_id, limit=10, offset=0)

        # Then
        assert len(result) == 2
        assert result[0].content_title == "Drama A"
        assert result[1].content_title == "Drama B"
        mock_watch_history_repository.find_by_user_id.assert_called_once_with(
            user_id, limit=10, offset=0
        )

    @pytest.mark.asyncio
    async def test_should_return_empty_list_for_new_user(
        self, mock_watch_history_repository
    ):
        """신규 사용자는 빈 시청 기록을 반환해야 한다."""
        # Given
        user_id = UUID("12345678-1234-1234-1234-123456789012")
        mock_watch_history_repository.find_by_user_id = AsyncMock(return_value=[])

        use_case = GetWatchHistoryUseCase(mock_watch_history_repository)

        # When
        result = await use_case.execute(user_id, limit=10, offset=0)

        # Then
        assert len(result) == 0


class TestRecordWatchProgress:
    """시청 진행 상황 기록 테스트."""

    @pytest.fixture
    def mock_watch_history_repository(self):
        """시청 기록 리포지토리 목."""
        return MagicMock()

    @pytest.mark.asyncio
    async def test_should_record_watch_progress(
        self, mock_watch_history_repository
    ):
        """콘텐츠 시청 진행 상황을 기록해야 한다."""
        # Given
        user_id = UUID("12345678-1234-1234-1234-123456789012")
        content_id = UUID("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")

        mock_watch_history_repository.find_by_user_and_content = AsyncMock(
            return_value=None
        )
        mock_watch_history_repository.create = AsyncMock(
            return_value=WatchHistory(
                id=UUID("11111111-1111-1111-1111-111111111111"),
                user_id=user_id,
                content_id=content_id,
                content_title="Drama A",
                episode_number=1,
                progress_seconds=900,
                duration_seconds=3600,
            )
        )

        use_case = RecordWatchProgressUseCase(mock_watch_history_repository)

        request = RecordWatchProgressRequest(
            content_id=str(content_id),
            content_title="Drama A",
            episode_number=1,
            progress_seconds=900,
            duration_seconds=3600,
        )

        # When
        result = await use_case.execute(user_id, request)

        # Then
        assert result.progress_seconds == 900
        assert result.duration_seconds == 3600
        mock_watch_history_repository.create.assert_called_once()

    @pytest.mark.asyncio
    async def test_should_update_existing_watch_progress(
        self, mock_watch_history_repository
    ):
        """기존 시청 기록이 있으면 업데이트해야 한다."""
        # Given
        user_id = UUID("12345678-1234-1234-1234-123456789012")
        content_id = UUID("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")

        existing_history = WatchHistory(
            id=UUID("11111111-1111-1111-1111-111111111111"),
            user_id=user_id,
            content_id=content_id,
            content_title="Drama A",
            episode_number=1,
            progress_seconds=900,
            duration_seconds=3600,
        )
        mock_watch_history_repository.find_by_user_and_content = AsyncMock(
            return_value=existing_history
        )
        mock_watch_history_repository.update = AsyncMock(
            return_value=WatchHistory(
                id=UUID("11111111-1111-1111-1111-111111111111"),
                user_id=user_id,
                content_id=content_id,
                content_title="Drama A",
                episode_number=1,
                progress_seconds=1800,
                duration_seconds=3600,
            )
        )

        use_case = RecordWatchProgressUseCase(mock_watch_history_repository)

        request = RecordWatchProgressRequest(
            content_id=str(content_id),
            content_title="Drama A",
            episode_number=1,
            progress_seconds=1800,
            duration_seconds=3600,
        )

        # When
        result = await use_case.execute(user_id, request)

        # Then
        assert result.progress_seconds == 1800
        mock_watch_history_repository.update.assert_called_once()
        mock_watch_history_repository.create.assert_not_called()


class TestGetWatchProgress:
    """시청 진행 상황 조회 테스트."""

    @pytest.fixture
    def mock_watch_history_repository(self):
        """시청 기록 리포지토리 목."""
        return MagicMock()

    @pytest.mark.asyncio
    async def test_should_resume_from_last_position(
        self, mock_watch_history_repository
    ):
        """마지막 시청 위치부터 재생을 재개해야 한다."""
        # Given
        user_id = UUID("12345678-1234-1234-1234-123456789012")
        content_id = UUID("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")

        existing_history = WatchHistory(
            id=UUID("11111111-1111-1111-1111-111111111111"),
            user_id=user_id,
            content_id=content_id,
            content_title="Drama A",
            episode_number=1,
            progress_seconds=1500,
            duration_seconds=3600,
        )
        mock_watch_history_repository.find_by_user_and_content = AsyncMock(
            return_value=existing_history
        )

        use_case = GetWatchProgressUseCase(mock_watch_history_repository)

        # When
        result = await use_case.execute(user_id, content_id)

        # Then
        assert result is not None
        assert result.progress_seconds == 1500

    @pytest.mark.asyncio
    async def test_should_return_none_for_unwatched_content(
        self, mock_watch_history_repository
    ):
        """시청 기록이 없으면 None을 반환해야 한다."""
        # Given
        user_id = UUID("12345678-1234-1234-1234-123456789012")
        content_id = UUID("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")

        mock_watch_history_repository.find_by_user_and_content = AsyncMock(
            return_value=None
        )

        use_case = GetWatchProgressUseCase(mock_watch_history_repository)

        # When
        result = await use_case.execute(user_id, content_id)

        # Then
        assert result is None
