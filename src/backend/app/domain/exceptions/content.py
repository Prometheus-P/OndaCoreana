"""Content Domain Exceptions - 콘텐츠 도메인 예외."""

from app.domain.exceptions.base import DomainError


class ContentNotFoundError(DomainError):
    """콘텐츠를 찾을 수 없을 때 발생하는 예외."""

    def __init__(self, content_id: str | None = None) -> None:
        message = "콘텐츠를 찾을 수 없습니다."
        if content_id:
            message = f"콘텐츠 ID '{content_id}'를 찾을 수 없습니다."
        super().__init__(message, code="CONTENT_NOT_FOUND")


class ContentNotViewableError(DomainError):
    """콘텐츠를 볼 수 없을 때 발생하는 예외."""

    def __init__(self) -> None:
        super().__init__(
            "이 콘텐츠는 현재 시청할 수 없습니다.",
            code="CONTENT_NOT_VIEWABLE"
        )


class InvalidContentDataError(DomainError):
    """유효하지 않은 콘텐츠 데이터일 때 발생하는 예외."""

    def __init__(self, message: str = "유효하지 않은 콘텐츠 데이터입니다.") -> None:
        super().__init__(message, code="INVALID_CONTENT_DATA")
