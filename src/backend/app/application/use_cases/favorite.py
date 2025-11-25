"""Favorite Use Cases - 즐겨찾기 관련 유스케이스."""

from uuid import UUID

from app.application.dto.favorite import (
    FavoriteResponse,
    AddFavoriteRequest,
)
from app.domain.entities.favorite import Favorite
from app.domain.exceptions.favorite import AlreadyFavoriteError, FavoriteNotFoundError
from app.domain.repositories.favorite_repository import FavoriteRepository


class GetFavoritesUseCase:
    """즐겨찾기 목록 조회 유스케이스.

    사용자의 즐겨찾기 목록을 최신순으로 조회합니다.
    """

    def __init__(self, favorite_repository: FavoriteRepository) -> None:
        self._favorite_repository = favorite_repository

    async def execute(
        self, user_id: UUID, limit: int = 20, offset: int = 0
    ) -> list[FavoriteResponse]:
        """즐겨찾기 목록을 조회합니다.

        Args:
            user_id: 사용자 ID
            limit: 조회 개수
            offset: 시작 위치

        Returns:
            list[FavoriteResponse]: 즐겨찾기 목록
        """
        favorites = await self._favorite_repository.find_by_user_id(
            user_id, limit=limit, offset=offset
        )

        return [self._to_response(favorite) for favorite in favorites]

    def _to_response(self, favorite: Favorite) -> FavoriteResponse:
        """엔티티를 응답 DTO로 변환합니다."""
        return FavoriteResponse(
            id=str(favorite.id),
            content_id=str(favorite.content_id),
            content_title=favorite.content_title,
            content_type=favorite.content_type,
            thumbnail_url=favorite.thumbnail_url,
            created_at=favorite.created_at,
        )


class AddFavoriteUseCase:
    """즐겨찾기 추가 유스케이스.

    콘텐츠를 사용자의 즐겨찾기에 추가합니다.
    """

    def __init__(self, favorite_repository: FavoriteRepository) -> None:
        self._favorite_repository = favorite_repository

    async def execute(
        self, user_id: UUID, request: AddFavoriteRequest
    ) -> FavoriteResponse:
        """콘텐츠를 즐겨찾기에 추가합니다.

        Args:
            user_id: 사용자 ID
            request: 즐겨찾기 추가 요청

        Returns:
            FavoriteResponse: 추가된 즐겨찾기

        Raises:
            AlreadyFavoriteError: 이미 즐겨찾기에 추가된 경우
        """
        content_id = UUID(request.content_id)

        # 이미 즐겨찾기에 있는지 확인
        existing = await self._favorite_repository.find_by_user_and_content(
            user_id, content_id
        )

        if existing:
            raise AlreadyFavoriteError()

        # 새 즐겨찾기 생성
        new_favorite = Favorite(
            user_id=user_id,
            content_id=content_id,
            content_title=request.content_title,
            content_type=request.content_type,
            thumbnail_url=request.thumbnail_url,
        )

        created = await self._favorite_repository.create(new_favorite)

        return FavoriteResponse(
            id=str(created.id),
            content_id=str(created.content_id),
            content_title=created.content_title,
            content_type=created.content_type,
            thumbnail_url=created.thumbnail_url,
            created_at=created.created_at,
        )


class RemoveFavoriteUseCase:
    """즐겨찾기 제거 유스케이스.

    콘텐츠를 사용자의 즐겨찾기에서 제거합니다.
    """

    def __init__(self, favorite_repository: FavoriteRepository) -> None:
        self._favorite_repository = favorite_repository

    async def execute(self, user_id: UUID, content_id: UUID) -> bool:
        """콘텐츠를 즐겨찾기에서 제거합니다.

        Args:
            user_id: 사용자 ID
            content_id: 콘텐츠 ID

        Returns:
            bool: 삭제 성공 여부

        Raises:
            FavoriteNotFoundError: 즐겨찾기에서 찾을 수 없는 경우
        """
        # 즐겨찾기 확인
        favorite = await self._favorite_repository.find_by_user_and_content(
            user_id, content_id
        )

        if not favorite:
            raise FavoriteNotFoundError()

        # 삭제
        return await self._favorite_repository.delete(favorite.id)


class CheckFavoriteUseCase:
    """즐겨찾기 확인 유스케이스.

    콘텐츠가 사용자의 즐겨찾기에 있는지 확인합니다.
    """

    def __init__(self, favorite_repository: FavoriteRepository) -> None:
        self._favorite_repository = favorite_repository

    async def execute(self, user_id: UUID, content_id: UUID) -> bool:
        """콘텐츠가 즐겨찾기에 있는지 확인합니다.

        Args:
            user_id: 사용자 ID
            content_id: 콘텐츠 ID

        Returns:
            bool: 즐겨찾기 여부
        """
        favorite = await self._favorite_repository.find_by_user_and_content(
            user_id, content_id
        )

        return favorite is not None
