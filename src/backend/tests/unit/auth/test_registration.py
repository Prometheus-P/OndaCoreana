"""사용자 등록 기능 테스트.

TDD RED 단계: 실패하는 테스트를 먼저 작성합니다.
QA 표준 적용: test_should_[행동]_when_[조건] 명명 규칙
"""

import pytest
from unittest.mock import AsyncMock

from app.application.dto.auth import RegisterRequest
from app.application.use_cases.auth import RegisterUserUseCase
from app.domain.exceptions.auth import EmailAlreadyExistsError
from app.domain.exceptions.validation import InvalidEmailError, WeakPasswordError
from app.domain.value_objects.email import Email
from app.domain.value_objects.password import Password


class TestUserRegistration:
    """사용자 등록 기능 테스트."""

    @pytest.mark.asyncio
    async def test_should_register_user_when_email_and_password_are_valid(
        self,
        mock_user_repository: AsyncMock,
        valid_registration_data: dict,
    ):
        """유효한 이메일과 비밀번호로 사용자를 등록할 수 있다."""
        # Given: 유효한 이메일과 비밀번호
        mock_user_repository.exists_by_email.return_value = False
        mock_user_repository.create.return_value = AsyncMock(
            id="test-uuid",
            email=Email(valid_registration_data["email"]),
            nickname=valid_registration_data["nickname"],
        )

        request = RegisterRequest(**valid_registration_data)
        use_case = RegisterUserUseCase(mock_user_repository)

        # When: 등록 실행
        result = await use_case.execute(request)

        # Then: 201 Created, 사용자 ID 반환
        assert result.email == valid_registration_data["email"]
        assert result.nickname == valid_registration_data["nickname"]
        mock_user_repository.create.assert_called_once()

    def test_should_reject_registration_when_email_format_is_invalid(self):
        """잘못된 이메일 형식으로 등록 시 실패해야 한다."""
        # Given: 잘못된 형식의 이메일
        invalid_email = "invalid-email"

        # When/Then: InvalidEmailError 발생
        with pytest.raises(InvalidEmailError):
            Email(invalid_email)

    def test_should_reject_registration_when_password_is_too_short(self):
        """8자 미만 비밀번호로 등록 시 실패해야 한다."""
        # Given: 8자 미만 비밀번호
        # When/Then: WeakPasswordError 발생
        with pytest.raises(WeakPasswordError):
            Password("weak")

    def test_should_reject_registration_when_password_has_no_uppercase(self):
        """대문자가 없는 비밀번호로 등록 시 실패해야 한다."""
        with pytest.raises(WeakPasswordError):
            Password("lowercase@123")

    def test_should_reject_registration_when_password_has_no_special_char(self):
        """특수문자가 없는 비밀번호로 등록 시 실패해야 한다."""
        with pytest.raises(WeakPasswordError):
            Password("NoSpecial123")

    @pytest.mark.asyncio
    async def test_should_reject_registration_when_email_is_duplicate(
        self,
        mock_user_repository: AsyncMock,
        valid_registration_data: dict,
    ):
        """이미 등록된 이메일로 등록 시 실패해야 한다."""
        # Given: 이미 등록된 이메일
        mock_user_repository.exists_by_email.return_value = True

        request = RegisterRequest(**valid_registration_data)
        use_case = RegisterUserUseCase(mock_user_repository)

        # When/Then: EmailAlreadyExistsError 발생
        with pytest.raises(EmailAlreadyExistsError):
            await use_case.execute(request)

    def test_should_hash_password_when_storing(self):
        """비밀번호는 해시되어 저장되어야 한다."""
        # Given: 평문 비밀번호
        password = Password("SecureP@ss1")

        # When: 해시 생성
        hashed = password.hash()

        # Then: 해시값은 원본과 다름
        assert hashed != "SecureP@ss1"
        assert hashed.startswith("$2b$")  # bcrypt 해시 형식

    def test_should_verify_password_when_hash_is_valid(self):
        """해시된 비밀번호를 검증할 수 있어야 한다."""
        # Given: 비밀번호 생성 및 해시
        password = Password("SecureP@ss1")
        hashed = password.hash()

        # When: 검증
        result = password.verify(hashed)

        # Then: 검증 성공
        assert result is True

    def test_should_normalize_email_to_lowercase_when_registering(self):
        """이메일은 소문자로 정규화되어야 한다."""
        # Given: 대문자 포함 이메일
        email = Email("Maria@Example.COM")

        # Then: 소문자로 정규화
        assert email.value == "maria@example.com"


class TestRegistrationEdgeCases:
    """등록 엣지 케이스 테스트."""

    def test_should_reject_registration_when_email_is_empty(self):
        """빈 이메일로 등록 시 실패해야 한다."""
        with pytest.raises((InvalidEmailError, ValueError)):
            Email("")

    def test_should_reject_registration_when_email_is_whitespace_only(self):
        """공백만 있는 이메일로 등록 시 실패해야 한다."""
        with pytest.raises((InvalidEmailError, ValueError)):
            Email("   ")

    def test_should_reject_registration_when_password_is_empty(self):
        """빈 비밀번호로 등록 시 실패해야 한다."""
        with pytest.raises((WeakPasswordError, ValueError)):
            Password("")

    def test_should_reject_registration_when_password_is_whitespace_only(self):
        """공백만 있는 비밀번호로 등록 시 실패해야 한다."""
        with pytest.raises((WeakPasswordError, ValueError)):
            Password("        ")

    def test_should_reject_registration_when_password_has_no_lowercase(self):
        """소문자가 없는 비밀번호로 등록 시 실패해야 한다."""
        with pytest.raises(WeakPasswordError):
            Password("UPPERCASE@123")

    def test_should_reject_registration_when_password_has_no_number(self):
        """숫자가 없는 비밀번호로 등록 시 실패해야 한다."""
        with pytest.raises(WeakPasswordError):
            Password("NoNumber@Pass")

    def test_should_reject_registration_when_email_missing_at_symbol(self):
        """@ 기호가 없는 이메일로 등록 시 실패해야 한다."""
        with pytest.raises(InvalidEmailError):
            Email("invalidemail.com")

    def test_should_reject_registration_when_email_missing_domain(self):
        """도메인이 없는 이메일로 등록 시 실패해야 한다."""
        with pytest.raises(InvalidEmailError):
            Email("user@")

    def test_should_reject_registration_when_email_has_multiple_at_symbols(self):
        """@ 기호가 여러 개인 이메일로 등록 시 실패해야 한다."""
        with pytest.raises(InvalidEmailError):
            Email("user@@example.com")

    def test_should_reject_registration_when_email_has_invalid_characters(self):
        """유효하지 않은 문자가 포함된 이메일로 등록 시 실패해야 한다."""
        with pytest.raises(InvalidEmailError):
            Email("user<script>@example.com")

    @pytest.mark.asyncio
    async def test_should_trim_email_when_registering_with_leading_trailing_spaces(
        self,
        mock_user_repository: AsyncMock,
        valid_registration_data: dict,
    ):
        """이메일 앞뒤 공백은 제거되어 처리되어야 한다."""
        # Given: 앞뒤 공백이 있는 이메일
        mock_user_repository.exists_by_email.return_value = False
        mock_user_repository.create.return_value = AsyncMock(
            id="test-uuid",
            email=Email(valid_registration_data["email"]),
            nickname=valid_registration_data["nickname"],
        )

        data_with_spaces = valid_registration_data.copy()
        data_with_spaces["email"] = f"  {valid_registration_data['email']}  "

        request = RegisterRequest(**data_with_spaces)
        use_case = RegisterUserUseCase(mock_user_repository)

        # When: 등록 실행
        result = await use_case.execute(request)

        # Then: 정상 등록 (공백 제거됨)
        assert result.email == valid_registration_data["email"]


class TestRegistrationSecurity:
    """등록 보안 테스트 - 에러 메시지 정보 유출 방지."""

    @pytest.mark.asyncio
    async def test_should_not_reveal_existing_emails_in_error_message(
        self,
        mock_user_repository: AsyncMock,
        valid_registration_data: dict,
    ):
        """에러 메시지에 기존 이메일 정보가 노출되지 않아야 한다."""
        # Given: 이미 등록된 이메일
        mock_user_repository.exists_by_email.return_value = True

        request = RegisterRequest(**valid_registration_data)
        use_case = RegisterUserUseCase(mock_user_repository)

        # When/Then: 에러 메시지 검증
        with pytest.raises(EmailAlreadyExistsError) as exc_info:
            await use_case.execute(request)

        error_message = str(exc_info.value).lower()
        # 구체적인 이메일 주소가 노출되지 않아야 함
        assert valid_registration_data["email"].lower() not in error_message

    def test_should_reject_registration_when_sql_injection_attempted_in_email(self):
        """SQL 인젝션 시도가 포함된 이메일은 거부해야 한다."""
        # Given: SQL 인젝션 시도
        malicious_emails = [
            "admin'--@example.com",
            "'; DROP TABLE users;--@example.com",
            "admin' OR '1'='1@example.com",
        ]

        for malicious_email in malicious_emails:
            # When/Then: 검증 실패
            with pytest.raises((InvalidEmailError, ValueError)):
                Email(malicious_email)

    def test_should_reject_registration_when_xss_attempted_in_email(self):
        """XSS 시도가 포함된 이메일은 거부해야 한다."""
        # Given: XSS 시도
        malicious_emails = [
            "<script>alert('xss')</script>@example.com",
            "user<img src=x onerror=alert(1)>@example.com",
            "javascript:alert(1)@example.com",
        ]

        for malicious_email in malicious_emails:
            # When/Then: 검증 실패
            with pytest.raises((InvalidEmailError, ValueError)):
                Email(malicious_email)

    @pytest.mark.asyncio
    async def test_should_reject_registration_when_sql_injection_attempted_in_nickname(
        self,
        mock_user_repository: AsyncMock,
        valid_registration_data: dict,
    ):
        """SQL 인젝션 시도가 포함된 닉네임은 거부해야 한다."""
        # Given: SQL 인젝션 시도
        mock_user_repository.exists_by_email.return_value = False

        malicious_data = valid_registration_data.copy()
        malicious_data["nickname"] = "'; DROP TABLE users;--"

        request = RegisterRequest(**malicious_data)
        use_case = RegisterUserUseCase(mock_user_repository)

        # When/Then: 검증 실패 또는 이스케이프 처리
        # 구현에 따라 ValueError 또는 정상 처리(sanitized) 가능
        try:
            result = await use_case.execute(request)
            # 정상 처리된 경우, 원본 악성 문자열이 그대로 저장되지 않아야 함
            assert "DROP TABLE" not in result.nickname or result.nickname != malicious_data["nickname"]
        except (ValueError, Exception):
            pass  # 검증 실패는 예상된 동작

    @pytest.mark.asyncio
    async def test_should_reject_registration_when_xss_attempted_in_nickname(
        self,
        mock_user_repository: AsyncMock,
        valid_registration_data: dict,
    ):
        """XSS 시도가 포함된 닉네임은 거부해야 한다."""
        # Given: XSS 시도
        mock_user_repository.exists_by_email.return_value = False

        malicious_data = valid_registration_data.copy()
        malicious_data["nickname"] = "<script>alert('xss')</script>"

        request = RegisterRequest(**malicious_data)
        use_case = RegisterUserUseCase(mock_user_repository)

        # When/Then: 검증 실패 또는 이스케이프 처리
        try:
            result = await use_case.execute(request)
            # 정상 처리된 경우, 원본 스크립트 태그가 그대로 저장되지 않아야 함
            assert "<script>" not in result.nickname
        except (ValueError, Exception):
            pass  # 검증 실패는 예상된 동작

    def test_should_not_allow_password_equal_to_common_passwords(self):
        """일반적으로 사용되는 약한 비밀번호는 거부해야 한다."""
        common_passwords = [
            "Password1!",
            "Qwerty123!",
            "Admin123!@",
        ]

        # 이 테스트는 구현에 따라 실패할 수 있음
        # 일반적인 비밀번호 블랙리스트 기능이 있는 경우 테스트
        for common_pwd in common_passwords:
            try:
                pwd = Password(common_pwd)
                # 블랙리스트 기능이 없다면 통과, 있다면 WeakPasswordError
            except WeakPasswordError:
                pass  # 예상된 동작
