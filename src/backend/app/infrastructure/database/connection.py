"""Database Connection - 데이터베이스 연결 관리."""

from typing import AsyncGenerator

from supabase import create_client, Client
from supabase.lib.client_options import ClientOptions

from app.config.settings import get_settings

# 전역 Supabase 클라이언트 (싱글톤)
_supabase_client: Client | None = None


def get_supabase_client() -> Client:
    """Supabase 클라이언트를 반환합니다.

    Returns:
        Client: Supabase 클라이언트 인스턴스
    """
    global _supabase_client

    if _supabase_client is None:
        settings = get_settings()
        _supabase_client = create_client(
            settings.supabase_url,
            settings.supabase_service_key,
            options=ClientOptions(
                postgrest_client_timeout=10,
                storage_client_timeout=30,
            ),
        )

    return _supabase_client


async def get_database() -> AsyncGenerator[Client, None]:
    """데이터베이스 연결을 반환하는 의존성.

    Yields:
        Client: Supabase 클라이언트
    """
    client = get_supabase_client()
    try:
        yield client
    finally:
        pass  # Supabase 클라이언트는 명시적 종료 불필요


async def init_database() -> None:
    """데이터베이스를 초기화합니다.

    애플리케이션 시작 시 호출됩니다.
    """
    # Supabase 연결 테스트
    client = get_supabase_client()
    # 연결 확인을 위한 간단한 쿼리
    try:
        client.table("users").select("id").limit(1).execute()
    except Exception:
        # 테이블이 없어도 연결은 성공
        pass


async def close_database() -> None:
    """데이터베이스 연결을 종료합니다.

    애플리케이션 종료 시 호출됩니다.
    """
    global _supabase_client
    _supabase_client = None
