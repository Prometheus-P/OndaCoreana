"""Domain Entities - 핵심 비즈니스 객체."""

from app.domain.entities.base import Entity
from app.domain.entities.user import User

__all__ = ["Entity", "User"]
