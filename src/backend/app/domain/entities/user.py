"""User Entity - 사용자 도메인 엔티티."""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Literal
from uuid import UUID

from app.domain.entities.base import Entity
from app.domain.value_objects.email import Email
from app.domain.value_objects.password import Password


@dataclass
class User(Entity):
    """사용자 엔티티.

    사용자의 핵심 비즈니스 로직을 포함합니다.

    Attributes:
        email: 사용자 이메일 (고유)
        password_hash: 해시된 비밀번호
        nickname: 사용자 닉네임
        country: 국가 코드 (ISO 3166-1 alpha-2)
        preferred_language: 선호 언어 (es: 스페인어, pt: 포르투갈어)
        is_active: 활성 상태
        is_verified: 이메일 인증 여부
        role: 사용자 역할
    """

    email: Email = field(default_factory=lambda: Email(""))
    password_hash: str = ""
    nickname: str = ""
    country: str = ""
    preferred_language: Literal["es", "pt", "en"] = "es"
    is_active: bool = True
    is_verified: bool = False
    role: Literal["user", "admin", "moderator"] = "user"
    avatar_url: str | None = None

    # OAuth 관련
    oauth_provider: str | None = None
    oauth_id: str | None = None

    def __init__(
        self,
        email: Email | str,
        password_hash: str = "",
        nickname: str = "",
        country: str = "",
        preferred_language: Literal["es", "pt", "en"] = "es",
        is_active: bool = True,
        is_verified: bool = False,
        role: Literal["user", "admin", "moderator"] = "user",
        avatar_url: str | None = None,
        oauth_provider: str | None = None,
        oauth_id: str | None = None,
        id: UUID | None = None,
        created_at: datetime | None = None,
        updated_at: datetime | None = None,
    ) -> None:
        super().__init__(id=id, created_at=created_at, updated_at=updated_at)
        self.email = email if isinstance(email, Email) else Email(email)
        self.password_hash = password_hash
        self.nickname = nickname
        self.country = country
        self.preferred_language = preferred_language
        self.is_active = is_active
        self.is_verified = is_verified
        self.role = role
        self.avatar_url = avatar_url
        self.oauth_provider = oauth_provider
        self.oauth_id = oauth_id

    def verify_password(self, password: Password) -> bool:
        """비밀번호를 검증합니다.

        Args:
            password: 검증할 비밀번호 값 객체

        Returns:
            bool: 비밀번호 일치 여부
        """
        return password.verify(self.password_hash)

    def set_password(self, password: Password) -> None:
        """비밀번호를 설정합니다.

        Args:
            password: 설정할 비밀번호 값 객체
        """
        self.password_hash = password.hash()
        self.updated_at = datetime.utcnow()

    def activate(self) -> None:
        """사용자를 활성화합니다."""
        self.is_active = True
        self.updated_at = datetime.utcnow()

    def deactivate(self) -> None:
        """사용자를 비활성화합니다."""
        self.is_active = False
        self.updated_at = datetime.utcnow()

    def verify_email(self) -> None:
        """이메일 인증을 완료합니다."""
        self.is_verified = True
        self.updated_at = datetime.utcnow()

    def is_oauth_user(self) -> bool:
        """OAuth 사용자인지 확인합니다."""
        return self.oauth_provider is not None

    def can_login(self) -> bool:
        """로그인 가능 여부를 확인합니다."""
        return self.is_active
