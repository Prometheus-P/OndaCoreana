"""Authentication Exceptions - 인증 관련 예외."""

from app.domain.exceptions.base import DomainError


class AuthenticationError(DomainError):
    """인증 실패 예외."""

    def __init__(self, message: str = "인증에 실패했습니다.") -> None:
        super().__init__(message, code="AUTHENTICATION_ERROR")


class InvalidCredentialsError(AuthenticationError):
    """잘못된 자격증명 예외."""

    def __init__(
        self, message: str = "이메일 또는 비밀번호가 올바르지 않습니다."
    ) -> None:
        super().__init__(message)
        self.code = "INVALID_CREDENTIALS"


class TokenExpiredError(AuthenticationError):
    """토큰 만료 예외."""

    def __init__(self, message: str = "토큰이 만료되었습니다.") -> None:
        super().__init__(message)
        self.code = "TOKEN_EXPIRED"


class UserNotFoundError(DomainError):
    """사용자 없음 예외."""

    def __init__(self, message: str = "사용자를 찾을 수 없습니다.") -> None:
        super().__init__(message, code="USER_NOT_FOUND")


class EmailAlreadyExistsError(DomainError):
    """이메일 중복 예외."""

    def __init__(self, message: str = "이미 등록된 이메일입니다.") -> None:
        super().__init__(message, code="EMAIL_ALREADY_EXISTS")


class OAuthError(DomainError):
    """OAuth 인증 예외."""

    def __init__(self, message: str = "OAuth 인증에 실패했습니다.") -> None:
        super().__init__(message, code="OAUTH_ERROR")
