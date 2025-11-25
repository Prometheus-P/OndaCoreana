"""Content Repository Interface - 콘텐츠 리포지토리 인터페이스."""

from abc import ABC, abstractmethod
from typing import Literal
from uuid import UUID

from app.domain.entities.content import Content


class ContentRepository(ABC):
    """콘텐츠 리포지토리 추상 클래스.

    콘텐츠 엔티티의 영속성을 관리합니다.
    """

    @abstractmethod
    async def find_by_id(self, content_id: UUID) -> Content | None:
        """ID로 콘텐츠를 조회합니다.

        Args:
            content_id: 콘텐츠 ID

        Returns:
            Content | None: 콘텐츠 엔티티 또는 None
        """
        pass

    @abstractmethod
    async def find_all(
        self,
        offset: int = 0,
        limit: int = 20,
        published_only: bool = True,
    ) -> list[Content]:
        """모든 콘텐츠를 조회합니다.

        Args:
            offset: 시작 위치
            limit: 최대 개수
            published_only: 게시된 콘텐츠만 조회

        Returns:
            list[Content]: 콘텐츠 목록
        """
        pass

    @abstractmethod
    async def find_by_type(
        self,
        content_type: Literal["drama", "movie", "mv", "variety"],
        offset: int = 0,
        limit: int = 20,
    ) -> list[Content]:
        """콘텐츠 유형으로 조회합니다.

        Args:
            content_type: 콘텐츠 유형
            offset: 시작 위치
            limit: 최대 개수

        Returns:
            list[Content]: 콘텐츠 목록
        """
        pass

    @abstractmethod
    async def find_by_genre(
        self,
        genre: str,
        offset: int = 0,
        limit: int = 20,
    ) -> list[Content]:
        """장르로 콘텐츠를 조회합니다.

        Args:
            genre: 장르
            offset: 시작 위치
            limit: 최대 개수

        Returns:
            list[Content]: 콘텐츠 목록
        """
        pass

    @abstractmethod
    async def search(
        self,
        query: str,
        offset: int = 0,
        limit: int = 20,
    ) -> list[Content]:
        """키워드로 콘텐츠를 검색합니다.

        Args:
            query: 검색어
            offset: 시작 위치
            limit: 최대 개수

        Returns:
            list[Content]: 검색 결과
        """
        pass

    @abstractmethod
    async def count(self, published_only: bool = True) -> int:
        """전체 콘텐츠 수를 반환합니다.

        Args:
            published_only: 게시된 콘텐츠만 카운트

        Returns:
            int: 콘텐츠 수
        """
        pass

    @abstractmethod
    async def count_by_type(
        self,
        content_type: Literal["drama", "movie", "mv", "variety"],
    ) -> int:
        """콘텐츠 유형별 수를 반환합니다.

        Args:
            content_type: 콘텐츠 유형

        Returns:
            int: 콘텐츠 수
        """
        pass

    @abstractmethod
    async def count_by_genre(self, genre: str) -> int:
        """장르별 콘텐츠 수를 반환합니다.

        Args:
            genre: 장르

        Returns:
            int: 콘텐츠 수
        """
        pass

    @abstractmethod
    async def create(self, content: Content) -> Content:
        """새 콘텐츠를 생성합니다.

        Args:
            content: 생성할 콘텐츠 엔티티

        Returns:
            Content: 생성된 콘텐츠
        """
        pass

    @abstractmethod
    async def update(self, content: Content) -> Content:
        """콘텐츠를 수정합니다.

        Args:
            content: 수정할 콘텐츠 엔티티

        Returns:
            Content: 수정된 콘텐츠
        """
        pass

    @abstractmethod
    async def delete(self, content_id: UUID) -> bool:
        """콘텐츠를 삭제합니다.

        Args:
            content_id: 삭제할 콘텐츠 ID

        Returns:
            bool: 삭제 성공 여부
        """
        pass
