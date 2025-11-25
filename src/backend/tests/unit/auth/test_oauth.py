"""OAuth 유스케이스 단위 테스트."""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import UUID

from app.application.dto.auth import OAuthAuthorizationUrl, OAuthLoginResponse
from app.application.interfaces.oauth_service import OAuthService, OAuthUserInfo
from app.application.use_cases.auth import (
    GetOAuthAuthorizationUrlUseCase,
    OAuthLoginUseCase,
)
from app.domain.entities.user import User
from app.domain.exceptions.auth import InvalidCredentialsError, OAuthError
from app.domain.value_objects.email import Email


class TestGetOAuthAuthorizationUrlUseCase:
    """OAuth 인증 URL 조회 유스케이스 테스트."""

    def test_execute_should_return_authorization_url(self):
        """인증 URL과 상태 값을 반환해야 함."""
        # Given
        mock_oauth_service = MagicMock(spec=OAuthService)
        mock_oauth_service.get_authorization_url.return_value = (
            "https://accounts.google.com/o/oauth2/v2/auth?client_id=test"
        )

        use_case = GetOAuthAuthorizationUrlUseCase(mock_oauth_service)

        # When
        result = use_case.execute()

        # Then
        assert isinstance(result, OAuthAuthorizationUrl)
        assert result.authorization_url.startswith("https://accounts.google.com")
        assert len(result.state) > 0
        mock_oauth_service.get_authorization_url.assert_called_once()


class TestOAuthLoginUseCase:
    """OAuth 로그인 유스케이스 테스트."""

    @pytest.fixture
    def mock_oauth_service(self):
        """OAuth 서비스 목."""
        service = MagicMock(spec=OAuthService)
        service.provider_name = "google"
        service.exchange_code_for_token = AsyncMock(return_value="test_access_token")
        service.get_user_info = AsyncMock(
            return_value=OAuthUserInfo(
                provider="google",
                provider_id="123456789",
                email="oauth@example.com",
                name="OAuth User",
                avatar_url="https://example.com/avatar.jpg",
            )
        )
        return service

    @pytest.fixture
    def mock_user_repository(self):
        """사용자 리포지토리 목."""
        repo = MagicMock()
        repo.find_by_oauth = AsyncMock(return_value=None)
        repo.find_by_email = AsyncMock(return_value=None)
        repo.create = AsyncMock()
        repo.update = AsyncMock()
        return repo

    @pytest.fixture
    def mock_jwt_service(self):
        """JWT 서비스 목."""
        service = MagicMock()
        service.create_access_token.return_value = "test_access_token"
        service.create_refresh_token.return_value = "test_refresh_token"
        service.access_token_expire_seconds = 1800
        return service

    @pytest.mark.asyncio
    async def test_execute_should_create_new_user_when_not_exists(
        self,
        mock_oauth_service,
        mock_user_repository,
        mock_jwt_service,
    ):
        """OAuth 사용자가 없으면 새로 생성해야 함."""
        # Given
        new_user = User(
            id=UUID("12345678-1234-1234-1234-123456789012"),
            email=Email("oauth@example.com"),
            nickname="OAuth User",
            is_verified=True,
            oauth_provider="google",
            oauth_id="123456789",
        )
        mock_user_repository.create.return_value = new_user

        use_case = OAuthLoginUseCase(
            mock_oauth_service,
            mock_user_repository,
            mock_jwt_service,
        )

        # When
        result = await use_case.execute("auth_code_123")

        # Then
        assert isinstance(result, OAuthLoginResponse)
        assert result.is_new_user is True
        assert result.user.email == "oauth@example.com"
        mock_user_repository.create.assert_called_once()

    @pytest.mark.asyncio
    async def test_execute_should_login_existing_oauth_user(
        self,
        mock_oauth_service,
        mock_user_repository,
        mock_jwt_service,
    ):
        """기존 OAuth 사용자는 바로 로그인해야 함."""
        # Given
        existing_user = User(
            id=UUID("12345678-1234-1234-1234-123456789012"),
            email=Email("oauth@example.com"),
            nickname="Existing User",
            is_verified=True,
            oauth_provider="google",
            oauth_id="123456789",
        )
        mock_user_repository.find_by_oauth.return_value = existing_user

        use_case = OAuthLoginUseCase(
            mock_oauth_service,
            mock_user_repository,
            mock_jwt_service,
        )

        # When
        result = await use_case.execute("auth_code_123")

        # Then
        assert result.is_new_user is False
        assert result.user.email == "oauth@example.com"
        mock_user_repository.create.assert_not_called()

    @pytest.mark.asyncio
    async def test_execute_should_link_oauth_to_existing_email_user(
        self,
        mock_oauth_service,
        mock_user_repository,
        mock_jwt_service,
    ):
        """이메일이 같은 기존 사용자에게 OAuth를 연결해야 함."""
        # Given
        existing_user = User(
            id=UUID("12345678-1234-1234-1234-123456789012"),
            email=Email("oauth@example.com"),
            nickname="Existing User",
            is_verified=True,
        )
        mock_user_repository.find_by_oauth.return_value = None
        mock_user_repository.find_by_email.return_value = existing_user
        mock_user_repository.update.return_value = existing_user

        use_case = OAuthLoginUseCase(
            mock_oauth_service,
            mock_user_repository,
            mock_jwt_service,
        )

        # When
        result = await use_case.execute("auth_code_123")

        # Then
        assert result.is_new_user is False
        mock_user_repository.update.assert_called_once()
        mock_user_repository.create.assert_not_called()

    @pytest.mark.asyncio
    async def test_execute_should_raise_error_when_user_inactive(
        self,
        mock_oauth_service,
        mock_user_repository,
        mock_jwt_service,
    ):
        """비활성 사용자는 로그인 실패해야 함."""
        # Given
        inactive_user = User(
            id=UUID("12345678-1234-1234-1234-123456789012"),
            email=Email("oauth@example.com"),
            nickname="Inactive User",
            is_active=False,
            oauth_provider="google",
            oauth_id="123456789",
        )
        mock_user_repository.find_by_oauth.return_value = inactive_user

        use_case = OAuthLoginUseCase(
            mock_oauth_service,
            mock_user_repository,
            mock_jwt_service,
        )

        # When & Then
        with pytest.raises(InvalidCredentialsError):
            await use_case.execute("auth_code_123")

    @pytest.mark.asyncio
    async def test_execute_should_raise_error_when_token_exchange_fails(
        self,
        mock_oauth_service,
        mock_user_repository,
        mock_jwt_service,
    ):
        """토큰 교환 실패시 에러를 발생시켜야 함."""
        # Given
        mock_oauth_service.exchange_code_for_token.side_effect = OAuthError(
            "토큰 교환 실패"
        )

        use_case = OAuthLoginUseCase(
            mock_oauth_service,
            mock_user_repository,
            mock_jwt_service,
        )

        # When & Then
        with pytest.raises(OAuthError):
            await use_case.execute("invalid_code")
