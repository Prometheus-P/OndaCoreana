"""Validation Exceptions - 유효성 검증 예외."""

from app.domain.exceptions.base import DomainError


class ValidationError(DomainError):
    """유효성 검증 실패 예외."""

    def __init__(self, message: str) -> None:
        super().__init__(message, code="VALIDATION_ERROR")


class InvalidEmailError(ValidationError):
    """잘못된 이메일 형식 예외."""

    def __init__(self, message: str = "잘못된 이메일 형식입니다.") -> None:
        super().__init__(message)
        self.code = "INVALID_EMAIL"


class WeakPasswordError(ValidationError):
    """약한 비밀번호 예외."""

    def __init__(self, message: str = "비밀번호가 너무 약합니다.") -> None:
        super().__init__(message)
        self.code = "WEAK_PASSWORD"


class InvalidNicknameError(ValidationError):
    """잘못된 닉네임 예외."""

    def __init__(self, message: str = "닉네임은 2-20자 사이여야 합니다.") -> None:
        super().__init__(message)
        self.code = "INVALID_NICKNAME"
