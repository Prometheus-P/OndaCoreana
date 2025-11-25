"""Favorite Exceptions - 즐겨찾기 관련 예외."""

from app.domain.exceptions.base import DomainError


class AlreadyFavoriteError(DomainError):
    """이미 즐겨찾기됨 예외."""

    def __init__(self, message: str = "이미 즐겨찾기에 추가된 콘텐츠입니다.") -> None:
        super().__init__(message, code="ALREADY_FAVORITE")


class FavoriteNotFoundError(DomainError):
    """즐겨찾기 없음 예외."""

    def __init__(self, message: str = "즐겨찾기에서 찾을 수 없습니다.") -> None:
        super().__init__(message, code="FAVORITE_NOT_FOUND")
