"""Health Check API - 헬스체크 엔드포인트."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check() -> dict:
    """헬스체크 엔드포인트.

    Returns:
        dict: 서비스 상태
    """
    return {
        "status": "healthy",
        "service": "HallyuLatino API",
        "version": "0.1.0",
    }


@router.get("/")
async def root() -> dict:
    """루트 엔드포인트.

    Returns:
        dict: API 정보
    """
    return {
        "message": "HallyuLatino API",
        "version": "0.1.0",
        "docs": "/docs",
    }
