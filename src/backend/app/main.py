"""HallyuLatino Backend Application - 메인 진입점."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import get_settings
from app.infrastructure.database.connection import close_database, init_database
from app.infrastructure.cache.redis_cache import close_redis
from app.presentation.api.router import api_router

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """애플리케이션 생명주기 관리.

    시작 시 데이터베이스 초기화, 종료 시 연결 해제.
    """
    # Startup
    logger.info("Starting HallyuLatino API...")
    settings = get_settings()
    logger.info(f"Environment: {settings.app_env}")

    await init_database()
    logger.info("Database initialized")

    yield

    # Shutdown
    logger.info("Shutting down HallyuLatino API...")
    await close_database()
    await close_redis()
    logger.info("Connections closed")


def create_app() -> FastAPI:
    """FastAPI 애플리케이션을 생성합니다."""
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        description="라틴 아메리카를 위한 AI 기반 한류 콘텐츠 플랫폼 API",
        version="0.1.0",
        docs_url="/docs" if settings.is_development else None,
        redoc_url="/redoc" if settings.is_development else None,
        lifespan=lifespan,
    )

    # CORS 설정
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 라우터 등록
    app.include_router(api_router)

    return app


# 앱 인스턴스
app = create_app()


if __name__ == "__main__":
    import uvicorn

    settings = get_settings()
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.is_development,
    )
