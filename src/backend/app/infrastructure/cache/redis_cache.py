"""Redis Cache - Redis 캐시 구현."""

import json
from typing import Any

import redis.asyncio as redis

from app.config.settings import get_settings

# 전역 Redis 클라이언트
_redis_client: redis.Redis | None = None


async def get_redis() -> redis.Redis:
    """Redis 클라이언트를 반환합니다."""
    global _redis_client

    if _redis_client is None:
        settings = get_settings()
        _redis_client = redis.from_url(
            settings.redis_url,
            encoding="utf-8",
            decode_responses=True,
        )

    return _redis_client


async def close_redis() -> None:
    """Redis 연결을 종료합니다."""
    global _redis_client
    if _redis_client:
        await _redis_client.close()
        _redis_client = None


class RedisCache:
    """Redis 캐시 클래스.

    JSON 직렬화를 사용한 캐시 저장/조회를 제공합니다.
    """

    def __init__(self, client: redis.Redis, prefix: str = "hallyulatino") -> None:
        self._client = client
        self._prefix = prefix

    def _make_key(self, key: str) -> str:
        """캐시 키를 생성합니다."""
        return f"{self._prefix}:{key}"

    async def get(self, key: str) -> Any | None:
        """캐시 값을 조회합니다."""
        value = await self._client.get(self._make_key(key))
        if value:
            return json.loads(value)
        return None

    async def set(
        self,
        key: str,
        value: Any,
        expire_seconds: int | None = None,
    ) -> None:
        """캐시 값을 저장합니다."""
        await self._client.set(
            self._make_key(key),
            json.dumps(value),
            ex=expire_seconds,
        )

    async def delete(self, key: str) -> None:
        """캐시 값을 삭제합니다."""
        await self._client.delete(self._make_key(key))

    async def exists(self, key: str) -> bool:
        """캐시 키가 존재하는지 확인합니다."""
        return await self._client.exists(self._make_key(key)) > 0

    async def increment(self, key: str, amount: int = 1) -> int:
        """캐시 값을 증가시킵니다."""
        return await self._client.incr(self._make_key(key), amount)

    async def set_with_ttl(
        self,
        key: str,
        value: Any,
        ttl_seconds: int,
    ) -> None:
        """TTL과 함께 캐시 값을 저장합니다."""
        await self.set(key, value, expire_seconds=ttl_seconds)
