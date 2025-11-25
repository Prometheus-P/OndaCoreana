"""Base Entity - 모든 엔티티의 기본 클래스."""

from abc import ABC
from datetime import datetime
from typing import Any
from uuid import UUID, uuid4


class Entity(ABC):
    """모든 도메인 엔티티의 기본 클래스.

    Attributes:
        id: 엔티티 고유 식별자 (UUID)
        created_at: 생성 일시
        updated_at: 수정 일시
    """

    def __init__(
        self,
        id: UUID | None = None,
        created_at: datetime | None = None,
        updated_at: datetime | None = None,
    ) -> None:
        self.id = id or uuid4()
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()

    def __eq__(self, other: Any) -> bool:
        """동등성 비교 (ID 기반)."""
        if not isinstance(other, Entity):
            return False
        return self.id == other.id

    def __hash__(self) -> int:
        """해시값 (ID 기반)."""
        return hash(self.id)

    def __repr__(self) -> str:
        """문자열 표현."""
        return f"<{self.__class__.__name__}(id={self.id})>"
