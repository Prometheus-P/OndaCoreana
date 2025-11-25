"""Users API - 사용자 관련 엔드포인트."""

from fastapi import APIRouter, Depends, HTTPException, status

from app.application.dto.user import UserProfileResponse, UserUpdateRequest
from app.application.use_cases.user import (
    GetUserProfileUseCase,
    UpdateUserProfileUseCase,
)
from app.domain.entities.user import User
from app.domain.exceptions.auth import UserNotFoundError
from app.domain.exceptions.validation import InvalidNicknameError
from app.presentation.api.dependencies import (
    get_current_user,
    get_user_repository,
)

router = APIRouter()


@router.get(
    "/me",
    response_model=UserProfileResponse,
    summary="내 프로필 조회",
    description="현재 로그인한 사용자의 프로필을 조회합니다.",
)
async def get_me(
    current_user: User = Depends(get_current_user),
    user_repository=Depends(get_user_repository),
) -> UserProfileResponse:
    """내 프로필 조회 엔드포인트.

    Returns:
        UserProfileResponse: 사용자 프로필
    """
    try:
        use_case = GetUserProfileUseCase(user_repository)
        return await use_case.execute(current_user.id)

    except UserNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": e.code, "message": e.message},
        )


@router.patch(
    "/me",
    response_model=UserProfileResponse,
    summary="내 프로필 수정",
    description="현재 로그인한 사용자의 프로필을 수정합니다.",
)
async def update_me(
    request: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    user_repository=Depends(get_user_repository),
) -> UserProfileResponse:
    """내 프로필 수정 엔드포인트.

    Args:
        request: 수정할 정보

    Returns:
        UserProfileResponse: 수정된 사용자 프로필

    Raises:
        400: 유효성 검증 실패
        404: 사용자 없음
    """
    try:
        use_case = UpdateUserProfileUseCase(user_repository)
        return await use_case.execute(current_user.id, request)

    except UserNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": e.code, "message": e.message},
        )
    except InvalidNicknameError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": e.code, "message": e.message},
        )
