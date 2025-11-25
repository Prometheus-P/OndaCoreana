"""Favorites API - 즐겨찾기 관련 엔드포인트."""

from uuid import UUID

from fastapi import APIRouter, Depends, Query, HTTPException, status

from app.application.dto.favorite import (
    FavoriteResponse,
    AddFavoriteRequest,
    FavoriteCheckResponse,
)
from app.application.use_cases.favorite import (
    GetFavoritesUseCase,
    AddFavoriteUseCase,
    RemoveFavoriteUseCase,
    CheckFavoriteUseCase,
)
from app.domain.entities.user import User
from app.domain.exceptions.favorite import AlreadyFavoriteError, FavoriteNotFoundError
from app.presentation.api.dependencies import (
    get_current_user,
    get_favorite_repository,
)

router = APIRouter()


@router.get(
    "",
    response_model=list[FavoriteResponse],
    summary="즐겨찾기 목록 조회",
    description="사용자의 즐겨찾기 목록을 최신순으로 조회합니다.",
)
async def get_favorites(
    current_user: User = Depends(get_current_user),
    favorite_repository=Depends(get_favorite_repository),
    limit: int = Query(20, ge=1, le=100, description="조회 개수"),
    offset: int = Query(0, ge=0, description="시작 위치"),
) -> list[FavoriteResponse]:
    """즐겨찾기 목록 조회 엔드포인트.

    Returns:
        list[FavoriteResponse]: 즐겨찾기 목록
    """
    use_case = GetFavoritesUseCase(favorite_repository)
    return await use_case.execute(current_user.id, limit=limit, offset=offset)


@router.post(
    "",
    response_model=FavoriteResponse,
    status_code=status.HTTP_201_CREATED,
    summary="즐겨찾기 추가",
    description="콘텐츠를 즐겨찾기에 추가합니다.",
)
async def add_favorite(
    request: AddFavoriteRequest,
    current_user: User = Depends(get_current_user),
    favorite_repository=Depends(get_favorite_repository),
) -> FavoriteResponse:
    """즐겨찾기 추가 엔드포인트.

    Args:
        request: 즐겨찾기 추가 요청

    Returns:
        FavoriteResponse: 추가된 즐겨찾기
    """
    try:
        use_case = AddFavoriteUseCase(favorite_repository)
        return await use_case.execute(current_user.id, request)
    except AlreadyFavoriteError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": e.code, "message": e.message},
        )


@router.delete(
    "/{content_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="즐겨찾기 제거",
    description="콘텐츠를 즐겨찾기에서 제거합니다.",
)
async def remove_favorite(
    content_id: UUID,
    current_user: User = Depends(get_current_user),
    favorite_repository=Depends(get_favorite_repository),
) -> None:
    """즐겨찾기 제거 엔드포인트.

    Args:
        content_id: 콘텐츠 ID
    """
    try:
        use_case = RemoveFavoriteUseCase(favorite_repository)
        await use_case.execute(current_user.id, content_id)
    except FavoriteNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": e.code, "message": e.message},
        )


@router.get(
    "/check/{content_id}",
    response_model=FavoriteCheckResponse,
    summary="즐겨찾기 확인",
    description="콘텐츠가 즐겨찾기에 있는지 확인합니다.",
)
async def check_favorite(
    content_id: UUID,
    current_user: User = Depends(get_current_user),
    favorite_repository=Depends(get_favorite_repository),
) -> FavoriteCheckResponse:
    """즐겨찾기 확인 엔드포인트.

    Args:
        content_id: 콘텐츠 ID

    Returns:
        FavoriteCheckResponse: 즐겨찾기 여부
    """
    use_case = CheckFavoriteUseCase(favorite_repository)
    is_favorite = await use_case.execute(current_user.id, content_id)
    return FavoriteCheckResponse(
        content_id=str(content_id),
        is_favorite=is_favorite,
    )
