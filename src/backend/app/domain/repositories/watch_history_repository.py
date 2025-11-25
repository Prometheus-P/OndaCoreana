"""WatchHistory Repository Interface - 시청 기록 리포지토리 인터페이스."""

from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.entities.watch_history import WatchHistory


class WatchHistoryRepository(ABC):
    """시청 기록 리포지토리 인터페이스.

    도메인 계층에서 정의하는 리포지토리 인터페이스입니다.
    실제 구현은 인프라 계층에서 담당합니다.
    """

    @abstractmethod
    async def create(self, watch_history: WatchHistory) -> WatchHistory:
        """시청 기록을 생성합니다.

        Args:
            watch_history: 생성할 시청 기록

        Returns:
            WatchHistory: 생성된 시청 기록
        """
        pass

    @abstractmethod
    async def find_by_id(self, history_id: UUID) -> WatchHistory | None:
        """ID로 시청 기록을 조회합니다.

        Args:
            history_id: 시청 기록 ID

        Returns:
            WatchHistory | None: 시청 기록 또는 None
        """
        pass

    @abstractmethod
    async def find_by_user_id(
        self, user_id: UUID, limit: int = 20, offset: int = 0
    ) -> list[WatchHistory]:
        """사용자의 시청 기록을 조회합니다.

        Args:
            user_id: 사용자 ID
            limit: 조회 개수
            offset: 시작 위치

        Returns:
            list[WatchHistory]: 시청 기록 목록 (최신순)
        """
        pass

    @abstractmethod
    async def find_by_user_and_content(
        self, user_id: UUID, content_id: UUID
    ) -> WatchHistory | None:
        """사용자와 콘텐츠로 시청 기록을 조회합니다.

        Args:
            user_id: 사용자 ID
            content_id: 콘텐츠 ID

        Returns:
            WatchHistory | None: 시청 기록 또는 None
        """
        pass

    @abstractmethod
    async def update(self, watch_history: WatchHistory) -> WatchHistory:
        """시청 기록을 업데이트합니다.

        Args:
            watch_history: 업데이트할 시청 기록

        Returns:
            WatchHistory: 업데이트된 시청 기록
        """
        pass

    @abstractmethod
    async def delete(self, history_id: UUID) -> bool:
        """시청 기록을 삭제합니다.

        Args:
            history_id: 삭제할 시청 기록 ID

        Returns:
            bool: 삭제 성공 여부
        """
        pass
