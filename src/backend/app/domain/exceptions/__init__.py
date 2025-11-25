"""Domain Exceptions - 도메인 예외."""

from app.domain.exceptions.base import DomainError
from app.domain.exceptions.validation import (
    InvalidEmailError,
    ValidationError,
    WeakPasswordError,
)
from app.domain.exceptions.auth import (
    AuthenticationError,
    InvalidCredentialsError,
    TokenExpiredError,
    UserNotFoundError,
    EmailAlreadyExistsError,
)

__all__ = [
    "DomainError",
    "ValidationError",
    "InvalidEmailError",
    "WeakPasswordError",
    "AuthenticationError",
    "InvalidCredentialsError",
    "TokenExpiredError",
    "UserNotFoundError",
    "EmailAlreadyExistsError",
]
