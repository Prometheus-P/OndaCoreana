"""사용자 로그인 기능 테스트.

TDD RED 단계: 실패하는 테스트를 먼저 작성합니다.
"""

import pytest
from unittest.mock import AsyncMock

from app.application.dto.auth import LoginRequest
from app.application.use_cases.auth import LoginUserUseCase
from app.domain.entities.user import User
from app.domain.exceptions.auth import InvalidCredentialsError
from app.domain.value_objects.email import Email
from app.domain.value_objects.password import Password
from app.infrastructure.external.jwt_service import JWTServiceImpl


class TestUserLogin:
    """사용자 로그인 기능 테스트."""

    @pytest.mark.asyncio
    async def test_should_return_tokens_when_valid_credentials(
        self,
        mock_user_repository: AsyncMock,
        jwt_service: JWTServiceImpl,
        sample_user: User,
    ):
        """유효한 자격증명으로 로그인 시 토큰을 반환해야 한다."""
        # Given: 등록된 사용자의 이메일과 비밀번호
        password = Password("SecureP@ss1")
        sample_user.password_hash = password.hash()

        mock_user_repository.find_by_email.return_value = sample_user

        request = LoginRequest(email="maria@example.com", password="SecureP@ss1")
        use_case = LoginUserUseCase(mock_user_repository, jwt_service)

        # When: 로그인 실행
        result = await use_case.execute(request)

        # Then: 토큰 반환
        assert result.tokens.access_token is not None
        assert result.tokens.refresh_token is not None
        assert result.tokens.token_type == "bearer"
        assert result.user.email == "maria@example.com"

    @pytest.mark.asyncio
    async def test_should_reject_login_with_wrong_password(
        self,
        mock_user_repository: AsyncMock,
        jwt_service: JWTServiceImpl,
        sample_user: User,
    ):
        """잘못된 비밀번호로 로그인 시 실패해야 한다."""
        # Given: 등록된 이메일과 잘못된 비밀번호
        password = Password("SecureP@ss1")
        sample_user.password_hash = password.hash()

        mock_user_repository.find_by_email.return_value = sample_user

        request = LoginRequest(email="maria@example.com", password="WrongP@ss1")
        use_case = LoginUserUseCase(mock_user_repository, jwt_service)

        # When/Then: InvalidCredentialsError 발생
        with pytest.raises(InvalidCredentialsError):
            await use_case.execute(request)

    @pytest.mark.asyncio
    async def test_should_reject_login_with_nonexistent_email(
        self,
        mock_user_repository: AsyncMock,
        jwt_service: JWTServiceImpl,
    ):
        """존재하지 않는 이메일로 로그인 시 실패해야 한다."""
        # Given: 등록되지 않은 이메일
        mock_user_repository.find_by_email.return_value = None

        request = LoginRequest(email="nonexistent@example.com", password="SecureP@ss1")
        use_case = LoginUserUseCase(mock_user_repository, jwt_service)

        # When/Then: InvalidCredentialsError 발생
        with pytest.raises(InvalidCredentialsError):
            await use_case.execute(request)

    @pytest.mark.asyncio
    async def test_should_reject_login_for_inactive_user(
        self,
        mock_user_repository: AsyncMock,
        jwt_service: JWTServiceImpl,
        sample_user: User,
    ):
        """비활성화된 사용자의 로그인 시 실패해야 한다."""
        # Given: 비활성화된 사용자
        password = Password("SecureP@ss1")
        sample_user.password_hash = password.hash()
        sample_user.is_active = False

        mock_user_repository.find_by_email.return_value = sample_user

        request = LoginRequest(email="maria@example.com", password="SecureP@ss1")
        use_case = LoginUserUseCase(mock_user_repository, jwt_service)

        # When/Then: InvalidCredentialsError 발생
        with pytest.raises(InvalidCredentialsError):
            await use_case.execute(request)

    def test_should_include_user_info_in_access_token(
        self,
        jwt_service: JWTServiceImpl,
    ):
        """Access Token에 사용자 정보가 포함되어야 한다."""
        # Given: 사용자 정보
        user_id = "test-user-id"
        email = "maria@example.com"
        role = "user"

        # When: Access Token 생성
        token = jwt_service.create_access_token(user_id, email, role)

        # Then: 토큰 디코딩하여 정보 확인
        payload = jwt_service.verify_access_token(token)
        assert payload["sub"] == user_id
        assert payload["email"] == email
        assert payload["role"] == role


class TestTokenRefresh:
    """토큰 갱신 기능 테스트."""

    def test_should_create_valid_refresh_token(
        self,
        jwt_service: JWTServiceImpl,
    ):
        """유효한 Refresh Token을 생성해야 한다."""
        # Given: 사용자 ID
        user_id = "test-user-id"

        # When: Refresh Token 생성
        token = jwt_service.create_refresh_token(user_id)

        # Then: 토큰 검증 성공
        payload = jwt_service.verify_refresh_token(token)
        assert payload["sub"] == user_id
        assert payload["type"] == "refresh"

    def test_should_differentiate_access_and_refresh_tokens(
        self,
        jwt_service: JWTServiceImpl,
    ):
        """Access Token과 Refresh Token은 구분되어야 한다."""
        # Given: 두 종류의 토큰 생성
        user_id = "test-user-id"
        access_token = jwt_service.create_access_token(
            user_id, "test@example.com", "user"
        )
        refresh_token = jwt_service.create_refresh_token(user_id)

        # Then: 서로 다른 타입
        access_payload = jwt_service.verify_access_token(access_token)
        refresh_payload = jwt_service.verify_refresh_token(refresh_token)

        assert access_payload["type"] == "access"
        assert refresh_payload["type"] == "refresh"
