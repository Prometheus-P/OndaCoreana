"""Favorite Repository Interface - 즐겨찾기 리포지토리 인터페이스."""

from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.entities.favorite import Favorite


class FavoriteRepository(ABC):
    """즐겨찾기 리포지토리 인터페이스.

    도메인 계층에서 정의하는 리포지토리 인터페이스입니다.
    실제 구현은 인프라 계층에서 담당합니다.
    """

    @abstractmethod
    async def create(self, favorite: Favorite) -> Favorite:
        """즐겨찾기를 생성합니다.

        Args:
            favorite: 생성할 즐겨찾기

        Returns:
            Favorite: 생성된 즐겨찾기
        """
        pass

    @abstractmethod
    async def find_by_id(self, favorite_id: UUID) -> Favorite | None:
        """ID로 즐겨찾기를 조회합니다.

        Args:
            favorite_id: 즐겨찾기 ID

        Returns:
            Favorite | None: 즐겨찾기 또는 None
        """
        pass

    @abstractmethod
    async def find_by_user_id(
        self, user_id: UUID, limit: int = 20, offset: int = 0
    ) -> list[Favorite]:
        """사용자의 즐겨찾기를 조회합니다.

        Args:
            user_id: 사용자 ID
            limit: 조회 개수
            offset: 시작 위치

        Returns:
            list[Favorite]: 즐겨찾기 목록 (최신순)
        """
        pass

    @abstractmethod
    async def find_by_user_and_content(
        self, user_id: UUID, content_id: UUID
    ) -> Favorite | None:
        """사용자와 콘텐츠로 즐겨찾기를 조회합니다.

        Args:
            user_id: 사용자 ID
            content_id: 콘텐츠 ID

        Returns:
            Favorite | None: 즐겨찾기 또는 None
        """
        pass

    @abstractmethod
    async def delete(self, favorite_id: UUID) -> bool:
        """즐겨찾기를 삭제합니다.

        Args:
            favorite_id: 삭제할 즐겨찾기 ID

        Returns:
            bool: 삭제 성공 여부
        """
        pass

    @abstractmethod
    async def count_by_user_id(self, user_id: UUID) -> int:
        """사용자의 즐겨찾기 개수를 조회합니다.

        Args:
            user_id: 사용자 ID

        Returns:
            int: 즐겨찾기 개수
        """
        pass
