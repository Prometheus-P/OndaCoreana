"""AuthUseCase 테스트.

QA 표준 적용: test_should_[행동]_when_[조건] 명명 규칙
"""

import pytest
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

from app.application.dto.auth import (
    RegisterRequest,
    LoginRequest,
)
from app.application.use_cases.auth import (
    RegisterUserUseCase,
    LoginUserUseCase,
    RefreshTokenUseCase,
    GetOAuthAuthorizationUrlUseCase,
    OAuthLoginUseCase,
)
from app.domain.entities.user import User
from app.domain.exceptions.auth import (
    EmailAlreadyExistsError,
    InvalidCredentialsError,
)
from app.domain.value_objects.email import Email
from app.domain.value_objects.password import Password
from app.infrastructure.external.jwt_service import JWTServiceImpl


class TestRegisterUserUseCase:
    """RegisterUserUseCase 테스트."""

    @pytest.mark.asyncio
    async def test_should_create_user_when_valid_data_provided(
        self,
        mock_user_repository: AsyncMock,
        valid_registration_data: dict,
    ):
        """유효한 데이터로 사용자 등록 시 성공해야 한다."""
        # Given
        mock_user_repository.exists_by_email.return_value = False
        mock_user_repository.create.return_value = MagicMock(
            id=uuid4(),
            email=Email(valid_registration_data["email"]),
            nickname=valid_registration_data["nickname"],
        )

        use_case = RegisterUserUseCase(mock_user_repository)
        request = RegisterRequest(**valid_registration_data)

        # When
        result = await use_case.execute(request)

        # Then
        assert result.email == valid_registration_data["email"]
        assert result.nickname == valid_registration_data["nickname"]
        mock_user_repository.create.assert_called_once()

    @pytest.mark.asyncio
    async def test_should_raise_error_when_email_already_exists(
        self,
        mock_user_repository: AsyncMock,
        valid_registration_data: dict,
    ):
        """이미 존재하는 이메일로 등록 시 EmailAlreadyExistsError 발생."""
        # Given
        mock_user_repository.exists_by_email.return_value = True

        use_case = RegisterUserUseCase(mock_user_repository)
        request = RegisterRequest(**valid_registration_data)

        # When/Then
        with pytest.raises(EmailAlreadyExistsError):
            await use_case.execute(request)

    @pytest.mark.asyncio
    async def test_should_hash_password_when_creating_user(
        self,
        mock_user_repository: AsyncMock,
        valid_registration_data: dict,
    ):
        """사용자 생성 시 비밀번호가 해시되어야 한다."""
        # Given
        mock_user_repository.exists_by_email.return_value = False
        created_user = MagicMock(
            id=uuid4(),
            email=Email(valid_registration_data["email"]),
            nickname=valid_registration_data["nickname"],
        )
        mock_user_repository.create.return_value = created_user

        use_case = RegisterUserUseCase(mock_user_repository)
        request = RegisterRequest(**valid_registration_data)

        # When
        await use_case.execute(request)

        # Then: create가 호출될 때 User 객체의 password_hash가 설정되어 있어야 함
        call_args = mock_user_repository.create.call_args[0][0]
        assert call_args.password_hash is not None
        assert call_args.password_hash != valid_registration_data["password"]


class TestLoginUserUseCase:
    """LoginUserUseCase 테스트."""

    @pytest.mark.asyncio
    async def test_should_return_tokens_when_credentials_valid(
        self,
        mock_user_repository: AsyncMock,
        jwt_service: JWTServiceImpl,
        sample_user: User,
    ):
        """유효한 자격증명으로 로그인 시 토큰을 반환해야 한다."""
        # Given
        password = Password("SecureP@ss1")
        sample_user.password_hash = password.hash()
        mock_user_repository.find_by_email.return_value = sample_user

        use_case = LoginUserUseCase(mock_user_repository, jwt_service)
        request = LoginRequest(email="maria@example.com", password="SecureP@ss1")

        # When
        result = await use_case.execute(request)

        # Then
        assert result.tokens.access_token is not None
        assert result.tokens.refresh_token is not None
        assert result.user.email == "maria@example.com"

    @pytest.mark.asyncio
    async def test_should_raise_error_when_user_not_found(
        self,
        mock_user_repository: AsyncMock,
        jwt_service: JWTServiceImpl,
    ):
        """존재하지 않는 사용자로 로그인 시 InvalidCredentialsError 발생."""
        # Given
        mock_user_repository.find_by_email.return_value = None

        use_case = LoginUserUseCase(mock_user_repository, jwt_service)
        request = LoginRequest(email="notfound@example.com", password="SecureP@ss1")

        # When/Then
        with pytest.raises(InvalidCredentialsError):
            await use_case.execute(request)

    @pytest.mark.asyncio
    async def test_should_raise_error_when_password_incorrect(
        self,
        mock_user_repository: AsyncMock,
        jwt_service: JWTServiceImpl,
        sample_user: User,
    ):
        """잘못된 비밀번호로 로그인 시 InvalidCredentialsError 발생."""
        # Given
        password = Password("SecureP@ss1")
        sample_user.password_hash = password.hash()
        mock_user_repository.find_by_email.return_value = sample_user

        use_case = LoginUserUseCase(mock_user_repository, jwt_service)
        request = LoginRequest(email="maria@example.com", password="WrongP@ss1")

        # When/Then
        with pytest.raises(InvalidCredentialsError):
            await use_case.execute(request)

    @pytest.mark.asyncio
    async def test_should_raise_error_when_user_inactive(
        self,
        mock_user_repository: AsyncMock,
        jwt_service: JWTServiceImpl,
        sample_user: User,
    ):
        """비활성화된 사용자 로그인 시 InvalidCredentialsError 발생."""
        # Given
        password = Password("SecureP@ss1")
        sample_user.password_hash = password.hash()
        sample_user.is_active = False
        mock_user_repository.find_by_email.return_value = sample_user

        use_case = LoginUserUseCase(mock_user_repository, jwt_service)
        request = LoginRequest(email="maria@example.com", password="SecureP@ss1")

        # When/Then
        with pytest.raises(InvalidCredentialsError):
            await use_case.execute(request)


class TestRefreshTokenUseCase:
    """RefreshTokenUseCase 테스트."""

    @pytest.mark.asyncio
    async def test_should_return_new_tokens_when_refresh_token_valid(
        self,
        mock_user_repository: AsyncMock,
        jwt_service: JWTServiceImpl,
        sample_user: User,
    ):
        """유효한 리프레시 토큰으로 새 토큰을 발급해야 한다."""
        # Given
        refresh_token = jwt_service.create_refresh_token(str(sample_user.id))
        mock_user_repository.find_by_id.return_value = sample_user

        use_case = RefreshTokenUseCase(mock_user_repository, jwt_service)

        # When
        result = await use_case.execute(refresh_token)

        # Then
        assert result.access_token is not None
        assert result.refresh_token is not None
        assert result.token_type == "bearer"

    @pytest.mark.asyncio
    async def test_should_raise_error_when_user_not_found_for_refresh(
        self,
        mock_user_repository: AsyncMock,
        jwt_service: JWTServiceImpl,
        sample_user: User,
    ):
        """리프레시 토큰의 사용자가 존재하지 않으면 InvalidCredentialsError 발생."""
        # Given
        refresh_token = jwt_service.create_refresh_token(str(sample_user.id))
        mock_user_repository.find_by_id.return_value = None

        use_case = RefreshTokenUseCase(mock_user_repository, jwt_service)

        # When/Then
        with pytest.raises(InvalidCredentialsError):
            await use_case.execute(refresh_token)

    @pytest.mark.asyncio
    async def test_should_raise_error_when_user_inactive_for_refresh(
        self,
        mock_user_repository: AsyncMock,
        jwt_service: JWTServiceImpl,
        sample_user: User,
    ):
        """비활성화된 사용자의 리프레시 토큰은 거부해야 한다."""
        # Given
        sample_user.is_active = False
        refresh_token = jwt_service.create_refresh_token(str(sample_user.id))
        mock_user_repository.find_by_id.return_value = sample_user

        use_case = RefreshTokenUseCase(mock_user_repository, jwt_service)

        # When/Then
        with pytest.raises(InvalidCredentialsError):
            await use_case.execute(refresh_token)


class TestGetOAuthAuthorizationUrlUseCase:
    """GetOAuthAuthorizationUrlUseCase 테스트."""

    def test_should_return_authorization_url_when_called(self):
        """OAuth 인증 URL을 반환해야 한다."""
        # Given
        mock_oauth_service = MagicMock()
        mock_oauth_service.get_authorization_url.return_value = (
            "https://accounts.google.com/o/oauth2/auth?state=test"
        )

        use_case = GetOAuthAuthorizationUrlUseCase(mock_oauth_service)

        # When
        result = use_case.execute()

        # Then
        assert result.authorization_url is not None
        assert result.state is not None
        assert len(result.state) > 0

    def test_should_generate_unique_state_when_called_multiple_times(self):
        """여러 번 호출 시 고유한 state를 생성해야 한다."""
        # Given
        mock_oauth_service = MagicMock()
        mock_oauth_service.get_authorization_url.return_value = "https://oauth.example.com"

        use_case = GetOAuthAuthorizationUrlUseCase(mock_oauth_service)

        # When
        result1 = use_case.execute()
        result2 = use_case.execute()

        # Then
        assert result1.state != result2.state


class TestOAuthLoginUseCase:
    """OAuthLoginUseCase 테스트."""

    @pytest.mark.asyncio
    async def test_should_login_existing_oauth_user_when_found(
        self,
        mock_user_repository: AsyncMock,
        jwt_service: JWTServiceImpl,
        sample_user: User,
    ):
        """기존 OAuth 사용자 로그인 시 토큰을 반환해야 한다."""
        # Given
        mock_oauth_service = AsyncMock()
        mock_oauth_service.exchange_code_for_token.return_value = "oauth_access_token"
        mock_oauth_service.get_user_info.return_value = MagicMock(
            provider="google",
            provider_id="google_123",
            email="maria@example.com",
            name="Maria",
            avatar_url="https://example.com/avatar.jpg",
        )

        mock_user_repository.find_by_oauth.return_value = sample_user

        use_case = OAuthLoginUseCase(
            mock_oauth_service, mock_user_repository, jwt_service
        )

        # When
        result = await use_case.execute("auth_code")

        # Then
        assert result.tokens.access_token is not None
        assert result.user.email == sample_user.email.value
        assert result.is_new_user is False

    @pytest.mark.asyncio
    async def test_should_create_new_user_when_oauth_user_not_exists(
        self,
        mock_user_repository: AsyncMock,
        jwt_service: JWTServiceImpl,
    ):
        """새 OAuth 사용자 로그인 시 사용자를 생성해야 한다."""
        # Given
        mock_oauth_service = AsyncMock()
        mock_oauth_service.exchange_code_for_token.return_value = "oauth_access_token"
        mock_oauth_service.get_user_info.return_value = MagicMock(
            provider="google",
            provider_id="google_new_123",
            email="newuser@example.com",
            name="New User",
            avatar_url="https://example.com/new_avatar.jpg",
        )

        mock_user_repository.find_by_oauth.return_value = None
        mock_user_repository.find_by_email.return_value = None

        new_user = User(
            id=uuid4(),
            email=Email("newuser@example.com"),
            nickname="New User",
            country="",
            preferred_language="es",
            is_verified=True,
            oauth_provider="google",
            oauth_id="google_new_123",
        )
        mock_user_repository.create.return_value = new_user

        use_case = OAuthLoginUseCase(
            mock_oauth_service, mock_user_repository, jwt_service
        )

        # When
        result = await use_case.execute("auth_code")

        # Then
        assert result.tokens.access_token is not None
        assert result.is_new_user is True
        mock_user_repository.create.assert_called_once()

    @pytest.mark.asyncio
    async def test_should_link_oauth_to_existing_email_user_when_email_exists(
        self,
        mock_user_repository: AsyncMock,
        jwt_service: JWTServiceImpl,
        sample_user: User,
    ):
        """기존 이메일 사용자가 OAuth 로그인 시 계정을 연결해야 한다."""
        # Given
        mock_oauth_service = AsyncMock()
        mock_oauth_service.exchange_code_for_token.return_value = "oauth_access_token"
        mock_oauth_service.get_user_info.return_value = MagicMock(
            provider="google",
            provider_id="google_link_123",
            email="maria@example.com",
            name="Maria",
            avatar_url="https://example.com/avatar.jpg",
        )

        mock_user_repository.find_by_oauth.return_value = None
        mock_user_repository.find_by_email.return_value = sample_user
        mock_user_repository.update.return_value = sample_user

        use_case = OAuthLoginUseCase(
            mock_oauth_service, mock_user_repository, jwt_service
        )

        # When
        result = await use_case.execute("auth_code")

        # Then
        assert result.tokens.access_token is not None
        assert result.is_new_user is False
        mock_user_repository.update.assert_called_once()

    @pytest.mark.asyncio
    async def test_should_raise_error_when_oauth_user_is_inactive(
        self,
        mock_user_repository: AsyncMock,
        jwt_service: JWTServiceImpl,
        sample_user: User,
    ):
        """비활성화된 OAuth 사용자 로그인 시 InvalidCredentialsError 발생."""
        # Given
        sample_user.is_active = False
        mock_oauth_service = AsyncMock()
        mock_oauth_service.exchange_code_for_token.return_value = "oauth_access_token"
        mock_oauth_service.get_user_info.return_value = MagicMock(
            provider="google",
            provider_id="google_123",
            email="maria@example.com",
            name="Maria",
            avatar_url=None,
        )

        mock_user_repository.find_by_oauth.return_value = sample_user

        use_case = OAuthLoginUseCase(
            mock_oauth_service, mock_user_repository, jwt_service
        )

        # When/Then
        with pytest.raises(InvalidCredentialsError):
            await use_case.execute("auth_code")


class TestAuthUseCasesSecurity:
    """AuthUseCase 보안 테스트."""

    @pytest.mark.asyncio
    async def test_should_return_same_error_for_invalid_email_and_password(
        self,
        mock_user_repository: AsyncMock,
        jwt_service: JWTServiceImpl,
        sample_user: User,
    ):
        """이메일 미존재와 비밀번호 오류 시 동일한 에러 타입을 반환해야 한다."""
        use_case = LoginUserUseCase(mock_user_repository, jwt_service)

        # Case 1: 존재하지 않는 이메일
        mock_user_repository.find_by_email.return_value = None
        request1 = LoginRequest(email="notfound@example.com", password="SecureP@ss1")

        with pytest.raises(InvalidCredentialsError) as exc_info1:
            await use_case.execute(request1)

        # Case 2: 잘못된 비밀번호
        password = Password("SecureP@ss1")
        sample_user.password_hash = password.hash()
        mock_user_repository.find_by_email.return_value = sample_user
        request2 = LoginRequest(email="maria@example.com", password="WrongP@ss1")

        with pytest.raises(InvalidCredentialsError) as exc_info2:
            await use_case.execute(request2)

        # Then: 동일한 에러 타입
        assert type(exc_info1.value) == type(exc_info2.value)

    @pytest.mark.asyncio
    async def test_should_not_expose_user_existence_in_error(
        self,
        mock_user_repository: AsyncMock,
        jwt_service: JWTServiceImpl,
    ):
        """에러 메시지에 사용자 존재 여부가 노출되지 않아야 한다."""
        # Given
        mock_user_repository.find_by_email.return_value = None

        use_case = LoginUserUseCase(mock_user_repository, jwt_service)
        request = LoginRequest(email="notfound@example.com", password="SecureP@ss1")

        # When/Then
        with pytest.raises(InvalidCredentialsError) as exc_info:
            await use_case.execute(request)

        error_message = str(exc_info.value).lower()
        assert "not found" not in error_message
        assert "does not exist" not in error_message
