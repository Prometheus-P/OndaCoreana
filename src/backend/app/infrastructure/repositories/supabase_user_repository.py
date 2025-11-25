"""Supabase User Repository - Supabase 기반 사용자 리포지토리 구현."""

from datetime import datetime
from uuid import UUID

from supabase import Client

from app.domain.entities.user import User
from app.domain.repositories.user_repository import UserRepository
from app.domain.value_objects.email import Email


class SupabaseUserRepository(UserRepository):
    """Supabase 기반 사용자 리포지토리 구현.

    Supabase PostgreSQL을 사용하여 사용자 데이터를 저장/조회합니다.
    """

    TABLE_NAME = "users"

    def __init__(self, client: Client) -> None:
        self._client = client

    async def create(self, user: User) -> User:
        """사용자를 생성합니다."""
        data = {
            "id": str(user.id),
            "email": user.email.value,
            "password_hash": user.password_hash,
            "nickname": user.nickname,
            "country": user.country,
            "preferred_language": user.preferred_language,
            "is_active": user.is_active,
            "is_verified": user.is_verified,
            "role": user.role,
            "avatar_url": user.avatar_url,
            "oauth_provider": user.oauth_provider,
            "oauth_id": user.oauth_id,
            "created_at": user.created_at.isoformat(),
            "updated_at": user.updated_at.isoformat(),
        }

        result = self._client.table(self.TABLE_NAME).insert(data).execute()

        if result.data:
            return self._to_entity(result.data[0])
        return user

    async def find_by_id(self, user_id: UUID) -> User | None:
        """ID로 사용자를 조회합니다."""
        result = (
            self._client.table(self.TABLE_NAME)
            .select("*")
            .eq("id", str(user_id))
            .execute()
        )

        if result.data and len(result.data) > 0:
            return self._to_entity(result.data[0])
        return None

    async def find_by_email(self, email: Email) -> User | None:
        """이메일로 사용자를 조회합니다."""
        result = (
            self._client.table(self.TABLE_NAME)
            .select("*")
            .eq("email", email.value)
            .execute()
        )

        if result.data and len(result.data) > 0:
            return self._to_entity(result.data[0])
        return None

    async def update(self, user: User) -> User:
        """사용자 정보를 업데이트합니다."""
        data = {
            "email": user.email.value,
            "password_hash": user.password_hash,
            "nickname": user.nickname,
            "country": user.country,
            "preferred_language": user.preferred_language,
            "is_active": user.is_active,
            "is_verified": user.is_verified,
            "role": user.role,
            "avatar_url": user.avatar_url,
            "oauth_provider": user.oauth_provider,
            "oauth_id": user.oauth_id,
            "updated_at": datetime.utcnow().isoformat(),
        }

        result = (
            self._client.table(self.TABLE_NAME)
            .update(data)
            .eq("id", str(user.id))
            .execute()
        )

        if result.data:
            return self._to_entity(result.data[0])
        return user

    async def delete(self, user_id: UUID) -> bool:
        """사용자를 삭제합니다."""
        result = (
            self._client.table(self.TABLE_NAME)
            .delete()
            .eq("id", str(user_id))
            .execute()
        )
        return len(result.data) > 0 if result.data else False

    async def exists_by_email(self, email: Email) -> bool:
        """이메일이 이미 존재하는지 확인합니다."""
        result = (
            self._client.table(self.TABLE_NAME)
            .select("id")
            .eq("email", email.value)
            .execute()
        )
        return len(result.data) > 0 if result.data else False

    async def find_by_oauth(self, provider: str, oauth_id: str) -> User | None:
        """OAuth 정보로 사용자를 조회합니다."""
        result = (
            self._client.table(self.TABLE_NAME)
            .select("*")
            .eq("oauth_provider", provider)
            .eq("oauth_id", oauth_id)
            .execute()
        )

        if result.data and len(result.data) > 0:
            return self._to_entity(result.data[0])
        return None

    def _to_entity(self, data: dict) -> User:
        """데이터베이스 레코드를 엔티티로 변환합니다."""
        return User(
            id=UUID(data["id"]),
            email=Email(data["email"]),
            password_hash=data.get("password_hash", ""),
            nickname=data.get("nickname", ""),
            country=data.get("country", ""),
            preferred_language=data.get("preferred_language", "es"),
            is_active=data.get("is_active", True),
            is_verified=data.get("is_verified", False),
            role=data.get("role", "user"),
            avatar_url=data.get("avatar_url"),
            oauth_provider=data.get("oauth_provider"),
            oauth_id=data.get("oauth_id"),
            created_at=datetime.fromisoformat(data["created_at"].replace("Z", "+00:00"))
            if data.get("created_at")
            else None,
            updated_at=datetime.fromisoformat(data["updated_at"].replace("Z", "+00:00"))
            if data.get("updated_at")
            else None,
        )
