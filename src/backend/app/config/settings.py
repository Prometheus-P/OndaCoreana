"""애플리케이션 설정 모듈.

환경변수 기반 설정을 관리합니다.
"""

from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """애플리케이션 설정.

    환경변수에서 설정값을 로드합니다.
    .env 파일도 지원합니다.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # 앱 설정
    app_name: str = "HallyuLatino API"
    app_env: Literal["development", "staging", "production"] = "development"
    debug: bool = True
    api_version: str = "v1"

    # 서버 설정
    host: str = "0.0.0.0"
    port: int = 8000

    # 데이터베이스 설정
    database_url: str = "postgresql://postgres:postgres@localhost:5432/hallyulatino"

    # Redis 설정
    redis_url: str = "redis://localhost:6379/0"

    # Supabase 설정
    supabase_url: str = ""
    supabase_service_key: str = ""
    supabase_anon_key: str = ""

    # JWT 설정
    secret_key: str = "dev-secret-key-change-in-production"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    algorithm: str = "HS256"

    # OAuth 설정
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:3000/auth/callback/google"

    # 외부 서비스
    deepl_api_key: str = ""
    openai_api_key: str = ""

    # n8n 웹훅
    n8n_webhook_url: str = "http://localhost:5678/webhook"

    # CORS 설정
    cors_origins: list[str] = ["http://localhost:3000"]

    @property
    def is_development(self) -> bool:
        """개발 환경 여부."""
        return self.app_env == "development"

    @property
    def is_production(self) -> bool:
        """프로덕션 환경 여부."""
        return self.app_env == "production"


@lru_cache
def get_settings() -> Settings:
    """설정 인스턴스를 반환합니다 (싱글톤 패턴)."""
    return Settings()
