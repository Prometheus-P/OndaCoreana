"""User Repository Interface - 사용자 리포지토리 인터페이스."""

from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.entities.user import User
from app.domain.value_objects.email import Email


class UserRepository(ABC):
    """사용자 리포지토리 인터페이스.

    도메인 계층에서 정의하는 리포지토리 인터페이스입니다.
    실제 구현은 인프라 계층에서 담당합니다.
    """

    @abstractmethod
    async def create(self, user: User) -> User:
        """사용자를 생성합니다.

        Args:
            user: 생성할 사용자 엔티티

        Returns:
            User: 생성된 사용자 엔티티
        """
        pass

    @abstractmethod
    async def find_by_id(self, user_id: UUID) -> User | None:
        """ID로 사용자를 조회합니다.

        Args:
            user_id: 사용자 ID

        Returns:
            User | None: 사용자 엔티티 또는 None
        """
        pass

    @abstractmethod
    async def find_by_email(self, email: Email) -> User | None:
        """이메일로 사용자를 조회합니다.

        Args:
            email: 이메일 값 객체

        Returns:
            User | None: 사용자 엔티티 또는 None
        """
        pass

    @abstractmethod
    async def update(self, user: User) -> User:
        """사용자 정보를 업데이트합니다.

        Args:
            user: 업데이트할 사용자 엔티티

        Returns:
            User: 업데이트된 사용자 엔티티
        """
        pass

    @abstractmethod
    async def delete(self, user_id: UUID) -> bool:
        """사용자를 삭제합니다.

        Args:
            user_id: 삭제할 사용자 ID

        Returns:
            bool: 삭제 성공 여부
        """
        pass

    @abstractmethod
    async def exists_by_email(self, email: Email) -> bool:
        """이메일이 이미 존재하는지 확인합니다.

        Args:
            email: 확인할 이메일

        Returns:
            bool: 존재 여부
        """
        pass

    @abstractmethod
    async def find_by_oauth(self, provider: str, oauth_id: str) -> User | None:
        """OAuth 정보로 사용자를 조회합니다.

        Args:
            provider: OAuth 제공자 (google, facebook 등)
            oauth_id: OAuth 사용자 ID

        Returns:
            User | None: 사용자 엔티티 또는 None
        """
        pass
