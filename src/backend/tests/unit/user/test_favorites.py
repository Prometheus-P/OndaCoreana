"""즐겨찾기 기능 단위 테스트."""

import pytest
from unittest.mock import AsyncMock, MagicMock
from uuid import UUID
from datetime import datetime

from app.application.dto.favorite import (
    FavoriteResponse,
    AddFavoriteRequest,
)
from app.application.use_cases.favorite import (
    GetFavoritesUseCase,
    AddFavoriteUseCase,
    RemoveFavoriteUseCase,
    CheckFavoriteUseCase,
)
from app.domain.entities.favorite import Favorite
from app.domain.exceptions.favorite import AlreadyFavoriteError, FavoriteNotFoundError


class TestGetFavorites:
    """즐겨찾기 조회 테스트."""

    @pytest.fixture
    def mock_favorite_repository(self):
        """즐겨찾기 리포지토리 목."""
        return MagicMock()

    @pytest.mark.asyncio
    async def test_should_list_favorites(self, mock_favorite_repository):
        """즐겨찾기 목록을 조회해야 한다."""
        # Given
        user_id = UUID("12345678-1234-1234-1234-123456789012")
        favorites = [
            Favorite(
                id=UUID("11111111-1111-1111-1111-111111111111"),
                user_id=user_id,
                content_id=UUID("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                content_title="Drama A",
                content_type="drama",
                thumbnail_url="https://example.com/a.jpg",
                created_at=datetime(2025, 11, 25, 10, 0, 0),
            ),
            Favorite(
                id=UUID("22222222-2222-2222-2222-222222222222"),
                user_id=user_id,
                content_id=UUID("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                content_title="Drama B",
                content_type="drama",
                thumbnail_url="https://example.com/b.jpg",
                created_at=datetime(2025, 11, 24, 10, 0, 0),
            ),
        ]
        mock_favorite_repository.find_by_user_id = AsyncMock(return_value=favorites)

        use_case = GetFavoritesUseCase(mock_favorite_repository)

        # When
        result = await use_case.execute(user_id, limit=20, offset=0)

        # Then
        assert len(result) == 2
        assert result[0].content_title == "Drama A"
        assert result[1].content_title == "Drama B"


class TestAddFavorite:
    """즐겨찾기 추가 테스트."""

    @pytest.fixture
    def mock_favorite_repository(self):
        """즐겨찾기 리포지토리 목."""
        return MagicMock()

    @pytest.mark.asyncio
    async def test_should_add_content_to_favorites(self, mock_favorite_repository):
        """콘텐츠를 즐겨찾기에 추가할 수 있다."""
        # Given
        user_id = UUID("12345678-1234-1234-1234-123456789012")
        content_id = UUID("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")

        mock_favorite_repository.find_by_user_and_content = AsyncMock(
            return_value=None
        )
        mock_favorite_repository.create = AsyncMock(
            return_value=Favorite(
                id=UUID("11111111-1111-1111-1111-111111111111"),
                user_id=user_id,
                content_id=content_id,
                content_title="Drama A",
                content_type="drama",
            )
        )

        use_case = AddFavoriteUseCase(mock_favorite_repository)

        request = AddFavoriteRequest(
            content_id=str(content_id),
            content_title="Drama A",
            content_type="drama",
        )

        # When
        result = await use_case.execute(user_id, request)

        # Then
        assert result.content_title == "Drama A"
        mock_favorite_repository.create.assert_called_once()

    @pytest.mark.asyncio
    async def test_should_not_duplicate_favorites(self, mock_favorite_repository):
        """이미 즐겨찾기된 콘텐츠는 중복 추가되지 않아야 한다."""
        # Given
        user_id = UUID("12345678-1234-1234-1234-123456789012")
        content_id = UUID("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")

        existing_favorite = Favorite(
            id=UUID("11111111-1111-1111-1111-111111111111"),
            user_id=user_id,
            content_id=content_id,
            content_title="Drama A",
            content_type="drama",
        )
        mock_favorite_repository.find_by_user_and_content = AsyncMock(
            return_value=existing_favorite
        )

        use_case = AddFavoriteUseCase(mock_favorite_repository)

        request = AddFavoriteRequest(
            content_id=str(content_id),
            content_title="Drama A",
            content_type="drama",
        )

        # When & Then
        with pytest.raises(AlreadyFavoriteError):
            await use_case.execute(user_id, request)


class TestRemoveFavorite:
    """즐겨찾기 제거 테스트."""

    @pytest.fixture
    def mock_favorite_repository(self):
        """즐겨찾기 리포지토리 목."""
        return MagicMock()

    @pytest.mark.asyncio
    async def test_should_remove_content_from_favorites(
        self, mock_favorite_repository
    ):
        """콘텐츠를 즐겨찾기에서 제거할 수 있다."""
        # Given
        user_id = UUID("12345678-1234-1234-1234-123456789012")
        content_id = UUID("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")

        existing_favorite = Favorite(
            id=UUID("11111111-1111-1111-1111-111111111111"),
            user_id=user_id,
            content_id=content_id,
            content_title="Drama A",
            content_type="drama",
        )
        mock_favorite_repository.find_by_user_and_content = AsyncMock(
            return_value=existing_favorite
        )
        mock_favorite_repository.delete = AsyncMock(return_value=True)

        use_case = RemoveFavoriteUseCase(mock_favorite_repository)

        # When
        result = await use_case.execute(user_id, content_id)

        # Then
        assert result is True
        mock_favorite_repository.delete.assert_called_once()

    @pytest.mark.asyncio
    async def test_should_raise_error_when_favorite_not_found(
        self, mock_favorite_repository
    ):
        """즐겨찾기에 없는 콘텐츠 제거 시 에러를 발생시켜야 한다."""
        # Given
        user_id = UUID("12345678-1234-1234-1234-123456789012")
        content_id = UUID("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")

        mock_favorite_repository.find_by_user_and_content = AsyncMock(
            return_value=None
        )

        use_case = RemoveFavoriteUseCase(mock_favorite_repository)

        # When & Then
        with pytest.raises(FavoriteNotFoundError):
            await use_case.execute(user_id, content_id)


class TestCheckFavorite:
    """즐겨찾기 확인 테스트."""

    @pytest.fixture
    def mock_favorite_repository(self):
        """즐겨찾기 리포지토리 목."""
        return MagicMock()

    @pytest.mark.asyncio
    async def test_should_return_true_if_favorited(self, mock_favorite_repository):
        """즐겨찾기된 콘텐츠면 True를 반환해야 한다."""
        # Given
        user_id = UUID("12345678-1234-1234-1234-123456789012")
        content_id = UUID("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")

        existing_favorite = Favorite(
            id=UUID("11111111-1111-1111-1111-111111111111"),
            user_id=user_id,
            content_id=content_id,
            content_title="Drama A",
            content_type="drama",
        )
        mock_favorite_repository.find_by_user_and_content = AsyncMock(
            return_value=existing_favorite
        )

        use_case = CheckFavoriteUseCase(mock_favorite_repository)

        # When
        result = await use_case.execute(user_id, content_id)

        # Then
        assert result is True

    @pytest.mark.asyncio
    async def test_should_return_false_if_not_favorited(
        self, mock_favorite_repository
    ):
        """즐겨찾기되지 않은 콘텐츠면 False를 반환해야 한다."""
        # Given
        user_id = UUID("12345678-1234-1234-1234-123456789012")
        content_id = UUID("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")

        mock_favorite_repository.find_by_user_and_content = AsyncMock(
            return_value=None
        )

        use_case = CheckFavoriteUseCase(mock_favorite_repository)

        # When
        result = await use_case.execute(user_id, content_id)

        # Then
        assert result is False
