"""사용자 프로필 관리 단위 테스트."""

import pytest
from unittest.mock import AsyncMock, MagicMock
from uuid import UUID

from app.application.dto.user import (
    UserProfileResponse,
    UpdateProfileRequest,
)
from app.application.use_cases.user import (
    GetUserProfileUseCase,
    UpdateUserProfileUseCase,
)
from app.domain.entities.user import User
from app.domain.exceptions.auth import UserNotFoundError
from app.domain.value_objects.email import Email


class TestGetUserProfile:
    """사용자 프로필 조회 테스트."""

    @pytest.fixture
    def mock_user_repository(self):
        """사용자 리포지토리 목."""
        return MagicMock()

    @pytest.mark.asyncio
    async def test_should_return_user_profile_when_authenticated(
        self, mock_user_repository
    ):
        """인증된 사용자는 자신의 프로필을 조회할 수 있다."""
        # Given
        user_id = UUID("12345678-1234-1234-1234-123456789012")
        user = User(
            id=user_id,
            email=Email("test@example.com"),
            nickname="TestUser",
            country="MX",
            preferred_language="es",
            is_active=True,
            is_verified=True,
            avatar_url="https://example.com/avatar.jpg",
        )
        mock_user_repository.find_by_id = AsyncMock(return_value=user)

        use_case = GetUserProfileUseCase(mock_user_repository)

        # When
        result = await use_case.execute(user_id)

        # Then
        assert isinstance(result, UserProfileResponse)
        assert result.id == str(user_id)
        assert result.email == "test@example.com"
        assert result.nickname == "TestUser"
        assert result.country == "MX"
        assert result.preferred_language == "es"
        mock_user_repository.find_by_id.assert_called_once_with(user_id)

    @pytest.mark.asyncio
    async def test_should_raise_error_when_user_not_found(
        self, mock_user_repository
    ):
        """사용자가 존재하지 않으면 에러를 발생시켜야 한다."""
        # Given
        user_id = UUID("12345678-1234-1234-1234-123456789012")
        mock_user_repository.find_by_id = AsyncMock(return_value=None)

        use_case = GetUserProfileUseCase(mock_user_repository)

        # When & Then
        with pytest.raises(UserNotFoundError):
            await use_case.execute(user_id)


class TestUpdateUserProfile:
    """사용자 프로필 업데이트 테스트."""

    @pytest.fixture
    def mock_user_repository(self):
        """사용자 리포지토리 목."""
        return MagicMock()

    @pytest.mark.asyncio
    async def test_should_update_profile_with_valid_data(
        self, mock_user_repository
    ):
        """유효한 데이터로 프로필을 업데이트할 수 있다."""
        # Given
        user_id = UUID("12345678-1234-1234-1234-123456789012")
        user = User(
            id=user_id,
            email=Email("test@example.com"),
            nickname="OldNickname",
            country="MX",
            preferred_language="es",
        )
        updated_user = User(
            id=user_id,
            email=Email("test@example.com"),
            nickname="NewNickname",
            country="BR",
            preferred_language="pt",
        )

        mock_user_repository.find_by_id = AsyncMock(return_value=user)
        mock_user_repository.update = AsyncMock(return_value=updated_user)

        use_case = UpdateUserProfileUseCase(mock_user_repository)

        request = UpdateProfileRequest(
            nickname="NewNickname",
            country="BR",
            preferred_language="pt",
        )

        # When
        result = await use_case.execute(user_id, request)

        # Then
        assert result.nickname == "NewNickname"
        assert result.country == "BR"
        assert result.preferred_language == "pt"
        mock_user_repository.update.assert_called_once()

    @pytest.mark.asyncio
    async def test_should_reject_profile_update_with_invalid_nickname(
        self, mock_user_repository
    ):
        """부적절한 닉네임으로 프로필 업데이트 시 실패해야 한다."""
        # Given
        user_id = UUID("12345678-1234-1234-1234-123456789012")
        user = User(
            id=user_id,
            email=Email("test@example.com"),
            nickname="OldNickname",
        )
        mock_user_repository.find_by_id = AsyncMock(return_value=user)

        use_case = UpdateUserProfileUseCase(mock_user_repository)

        # 닉네임이 너무 짧음 (1자)
        request = UpdateProfileRequest(nickname="X")

        # When & Then
        from app.domain.exceptions.validation import InvalidNicknameError
        with pytest.raises(InvalidNicknameError):
            await use_case.execute(user_id, request)

    @pytest.mark.asyncio
    async def test_should_update_avatar_url(self, mock_user_repository):
        """아바타 URL을 업데이트할 수 있다."""
        # Given
        user_id = UUID("12345678-1234-1234-1234-123456789012")
        user = User(
            id=user_id,
            email=Email("test@example.com"),
            nickname="TestUser",
            avatar_url=None,
        )
        updated_user = User(
            id=user_id,
            email=Email("test@example.com"),
            nickname="TestUser",
            avatar_url="https://example.com/new-avatar.jpg",
        )

        mock_user_repository.find_by_id = AsyncMock(return_value=user)
        mock_user_repository.update = AsyncMock(return_value=updated_user)

        use_case = UpdateUserProfileUseCase(mock_user_repository)

        request = UpdateProfileRequest(
            avatar_url="https://example.com/new-avatar.jpg"
        )

        # When
        result = await use_case.execute(user_id, request)

        # Then
        assert result.avatar_url == "https://example.com/new-avatar.jpg"

    @pytest.mark.asyncio
    async def test_should_raise_error_when_updating_nonexistent_user(
        self, mock_user_repository
    ):
        """존재하지 않는 사용자의 프로필 업데이트는 에러를 발생시켜야 한다."""
        # Given
        user_id = UUID("12345678-1234-1234-1234-123456789012")
        mock_user_repository.find_by_id = AsyncMock(return_value=None)

        use_case = UpdateUserProfileUseCase(mock_user_repository)

        request = UpdateProfileRequest(nickname="NewNickname")

        # When & Then
        with pytest.raises(UserNotFoundError):
            await use_case.execute(user_id, request)
