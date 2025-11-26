"""사용자 로그인 기능 테스트.

TDD RED 단계: 실패하는 테스트를 먼저 작성합니다.
QA 표준 적용: test_should_[행동]_when_[조건] 명명 규칙
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
    async def test_should_return_tokens_when_credentials_are_valid(
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
    async def test_should_reject_login_when_password_is_wrong(
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
    async def test_should_reject_login_when_email_does_not_exist(
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
    async def test_should_reject_login_when_user_is_inactive(
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

    def test_should_include_user_info_in_token_when_token_is_created(
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


class TestLoginEdgeCases:
    """로그인 엣지 케이스 테스트."""

    @pytest.mark.asyncio
    async def test_should_reject_login_when_email_is_empty(
        self,
        mock_user_repository: AsyncMock,
        jwt_service: JWTServiceImpl,
    ):
        """빈 이메일로 로그인 시 실패해야 한다."""
        # Given: 빈 이메일
        use_case = LoginUserUseCase(mock_user_repository, jwt_service)

        # When/Then: 빈 이메일 검증 실패
        with pytest.raises((InvalidCredentialsError, ValueError)):
            request = LoginRequest(email="", password="SecureP@ss1")
            await use_case.execute(request)

    @pytest.mark.asyncio
    async def test_should_reject_login_when_password_is_empty(
        self,
        mock_user_repository: AsyncMock,
        jwt_service: JWTServiceImpl,
    ):
        """빈 비밀번호로 로그인 시 실패해야 한다."""
        # Given: 빈 비밀번호
        use_case = LoginUserUseCase(mock_user_repository, jwt_service)

        # When/Then: 빈 비밀번호 검증 실패
        with pytest.raises((InvalidCredentialsError, ValueError)):
            request = LoginRequest(email="maria@example.com", password="")
            await use_case.execute(request)

    @pytest.mark.asyncio
    async def test_should_reject_login_when_email_is_whitespace_only(
        self,
        mock_user_repository: AsyncMock,
        jwt_service: JWTServiceImpl,
    ):
        """공백만 있는 이메일로 로그인 시 실패해야 한다."""
        # Given: 공백만 있는 이메일
        use_case = LoginUserUseCase(mock_user_repository, jwt_service)

        # When/Then: 검증 실패
        with pytest.raises((InvalidCredentialsError, ValueError)):
            request = LoginRequest(email="   ", password="SecureP@ss1")
            await use_case.execute(request)

    @pytest.mark.asyncio
    async def test_should_reject_login_when_password_is_whitespace_only(
        self,
        mock_user_repository: AsyncMock,
        jwt_service: JWTServiceImpl,
    ):
        """공백만 있는 비밀번호로 로그인 시 실패해야 한다."""
        # Given: 공백만 있는 비밀번호
        use_case = LoginUserUseCase(mock_user_repository, jwt_service)

        # When/Then: 검증 실패
        with pytest.raises((InvalidCredentialsError, ValueError)):
            request = LoginRequest(email="maria@example.com", password="   ")
            await use_case.execute(request)

    @pytest.mark.asyncio
    async def test_should_handle_login_when_email_has_leading_trailing_spaces(
        self,
        mock_user_repository: AsyncMock,
        jwt_service: JWTServiceImpl,
        sample_user: User,
    ):
        """이메일 앞뒤 공백은 제거되어 처리되어야 한다."""
        # Given: 앞뒤 공백이 있는 이메일
        password = Password("SecureP@ss1")
        sample_user.password_hash = password.hash()

        mock_user_repository.find_by_email.return_value = sample_user

        request = LoginRequest(email="  maria@example.com  ", password="SecureP@ss1")
        use_case = LoginUserUseCase(mock_user_repository, jwt_service)

        # When: 로그인 실행
        result = await use_case.execute(request)

        # Then: 정상 로그인 (공백 제거됨)
        assert result.tokens.access_token is not None


class TestLoginSecurity:
    """로그인 보안 테스트 - 에러 메시지 정보 유출 방지."""

    @pytest.mark.asyncio
    async def test_should_return_same_error_when_email_not_found_vs_wrong_password(
        self,
        mock_user_repository: AsyncMock,
        jwt_service: JWTServiceImpl,
        sample_user: User,
    ):
        """이메일 미존재와 비밀번호 오류 시 동일한 에러를 반환해야 한다.

        보안: 이메일 존재 여부를 추측할 수 없도록 동일한 에러 반환
        """
        # Case 1: 존재하지 않는 이메일
        mock_user_repository.find_by_email.return_value = None
        request1 = LoginRequest(email="nonexistent@example.com", password="SecureP@ss1")
        use_case = LoginUserUseCase(mock_user_repository, jwt_service)

        with pytest.raises(InvalidCredentialsError) as exc_info1:
            await use_case.execute(request1)

        # Case 2: 잘못된 비밀번호
        password = Password("SecureP@ss1")
        sample_user.password_hash = password.hash()
        mock_user_repository.find_by_email.return_value = sample_user

        request2 = LoginRequest(email="maria@example.com", password="WrongP@ss1")

        with pytest.raises(InvalidCredentialsError) as exc_info2:
            await use_case.execute(request2)

        # Then: 동일한 에러 타입과 유사한 메시지
        assert type(exc_info1.value) == type(exc_info2.value)

    @pytest.mark.asyncio
    async def test_should_not_reveal_user_existence_in_error_message(
        self,
        mock_user_repository: AsyncMock,
        jwt_service: JWTServiceImpl,
    ):
        """에러 메시지에 사용자 존재 여부가 노출되지 않아야 한다."""
        # Given: 존재하지 않는 이메일
        mock_user_repository.find_by_email.return_value = None
        request = LoginRequest(email="nonexistent@example.com", password="SecureP@ss1")
        use_case = LoginUserUseCase(mock_user_repository, jwt_service)

        # When/Then: 에러 메시지 검증
        with pytest.raises(InvalidCredentialsError) as exc_info:
            await use_case.execute(request)

        error_message = str(exc_info.value).lower()
        # 이메일 존재 여부를 암시하는 문구가 없어야 함
        assert "not found" not in error_message
        assert "does not exist" not in error_message
        assert "no user" not in error_message

    @pytest.mark.asyncio
    async def test_should_reject_login_when_sql_injection_attempted_in_email(
        self,
        mock_user_repository: AsyncMock,
        jwt_service: JWTServiceImpl,
    ):
        """SQL 인젝션 시도가 포함된 이메일은 거부해야 한다."""
        # Given: SQL 인젝션 시도
        malicious_email = "admin'--@example.com"
        mock_user_repository.find_by_email.return_value = None

        use_case = LoginUserUseCase(mock_user_repository, jwt_service)

        # When/Then: 정상적인 검증 실패 (SQL 실행 안됨)
        with pytest.raises((InvalidCredentialsError, ValueError)):
            request = LoginRequest(email=malicious_email, password="SecureP@ss1")
            await use_case.execute(request)

    @pytest.mark.asyncio
    async def test_should_reject_login_when_xss_attempted_in_email(
        self,
        mock_user_repository: AsyncMock,
        jwt_service: JWTServiceImpl,
    ):
        """XSS 시도가 포함된 이메일은 거부해야 한다."""
        # Given: XSS 시도
        malicious_email = "<script>alert('xss')</script>@example.com"
        mock_user_repository.find_by_email.return_value = None

        use_case = LoginUserUseCase(mock_user_repository, jwt_service)

        # When/Then: 검증 실패
        with pytest.raises((InvalidCredentialsError, ValueError)):
            request = LoginRequest(email=malicious_email, password="SecureP@ss1")
            await use_case.execute(request)


class TestTokenRefresh:
    """토큰 갱신 기능 테스트."""

    def test_should_create_valid_refresh_token_when_user_id_provided(
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

    def test_should_differentiate_token_types_when_both_tokens_created(
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
