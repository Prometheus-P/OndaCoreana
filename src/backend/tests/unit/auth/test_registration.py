"""사용자 등록 기능 테스트.

TDD RED 단계: 실패하는 테스트를 먼저 작성합니다.
"""

import pytest
from unittest.mock import AsyncMock

from app.application.dto.auth import RegisterRequest
from app.application.use_cases.auth import RegisterUserUseCase
from app.domain.exceptions.auth import EmailAlreadyExistsError
from app.domain.exceptions.validation import InvalidEmailError, WeakPasswordError
from app.domain.value_objects.email import Email


class TestUserRegistration:
    """사용자 등록 기능 테스트."""

    @pytest.mark.asyncio
    async def test_should_register_user_with_valid_email_and_password(
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

    def test_should_reject_registration_with_invalid_email_format(self):
        """잘못된 이메일 형식으로 등록 시 실패해야 한다."""
        # Given: 잘못된 형식의 이메일
        invalid_email = "invalid-email"

        # When/Then: InvalidEmailError 발생
        with pytest.raises(InvalidEmailError):
            Email(invalid_email)

    def test_should_reject_registration_with_weak_password(self):
        """약한 비밀번호로 등록 시 실패해야 한다."""
        # Given: 8자 미만 비밀번호
        from app.domain.value_objects.password import Password

        # When/Then: WeakPasswordError 발생
        with pytest.raises(WeakPasswordError):
            Password("weak")

    def test_should_reject_password_without_uppercase(self):
        """대문자가 없는 비밀번호로 등록 시 실패해야 한다."""
        from app.domain.value_objects.password import Password

        with pytest.raises(WeakPasswordError):
            Password("lowercase@123")

    def test_should_reject_password_without_special_char(self):
        """특수문자가 없는 비밀번호로 등록 시 실패해야 한다."""
        from app.domain.value_objects.password import Password

        with pytest.raises(WeakPasswordError):
            Password("NoSpecial123")

    @pytest.mark.asyncio
    async def test_should_reject_registration_with_duplicate_email(
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

    def test_should_hash_password_before_storing(self):
        """비밀번호는 해시되어 저장되어야 한다."""
        from app.domain.value_objects.password import Password

        # Given: 평문 비밀번호
        password = Password("SecureP@ss1")

        # When: 해시 생성
        hashed = password.hash()

        # Then: 해시값은 원본과 다름
        assert hashed != "SecureP@ss1"
        assert hashed.startswith("$2b$")  # bcrypt 해시 형식

    def test_should_verify_hashed_password(self):
        """해시된 비밀번호를 검증할 수 있어야 한다."""
        from app.domain.value_objects.password import Password

        # Given: 비밀번호 생성 및 해시
        password = Password("SecureP@ss1")
        hashed = password.hash()

        # When: 검증
        result = password.verify(hashed)

        # Then: 검증 성공
        assert result is True

    def test_email_should_be_normalized_to_lowercase(self):
        """이메일은 소문자로 정규화되어야 한다."""
        # Given: 대문자 포함 이메일
        email = Email("Maria@Example.COM")

        # Then: 소문자로 정규화
        assert email.value == "maria@example.com"
