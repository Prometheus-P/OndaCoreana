"""API Router - 메인 API 라우터."""

from fastapi import APIRouter

from app.presentation.api.v1 import auth, health, users, watch_history, favorites

api_router = APIRouter()

# Health check
api_router.include_router(
    health.router,
    tags=["Health"],
)

# API v1
api_router.include_router(
    auth.router,
    prefix="/v1/auth",
    tags=["Authentication"],
)

api_router.include_router(
    users.router,
    prefix="/v1/users",
    tags=["Users"],
)

api_router.include_router(
    watch_history.router,
    prefix="/v1/watch-history",
    tags=["Watch History"],
)

api_router.include_router(
    favorites.router,
    prefix="/v1/favorites",
    tags=["Favorites"],
)
