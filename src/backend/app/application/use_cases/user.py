"""User Use Cases - 사용자 관련 유스케이스."""

from uuid import UUID

from app.application.dto.user import (
    UserProfileResponse,
    UpdateProfileRequest,
)
from app.domain.entities.user import User
from app.domain.exceptions.auth import UserNotFoundError
from app.domain.exceptions.validation import InvalidNicknameError
from app.domain.repositories.user_repository import UserRepository


class GetUserProfileUseCase:
    """사용자 프로필 조회 유스케이스.

    인증된 사용자의 프로필 정보를 조회합니다.
    """

    def __init__(self, user_repository: UserRepository) -> None:
        self._user_repository = user_repository

    async def execute(self, user_id: UUID) -> UserProfileResponse:
        """사용자 프로필을 조회합니다.

        Args:
            user_id: 사용자 ID

        Returns:
            UserProfileResponse: 사용자 프로필 정보

        Raises:
            UserNotFoundError: 사용자가 존재하지 않는 경우
        """
        user = await self._user_repository.find_by_id(user_id)

        if not user:
            raise UserNotFoundError()

        return self._to_response(user)

    def _to_response(self, user: User) -> UserProfileResponse:
        """사용자 엔티티를 응답 DTO로 변환합니다."""
        return UserProfileResponse(
            id=str(user.id),
            email=user.email.value,
            nickname=user.nickname,
            country=user.country,
            preferred_language=user.preferred_language,
            is_active=user.is_active,
            is_verified=user.is_verified,
            role=user.role,
            avatar_url=user.avatar_url,
            created_at=user.created_at,
        )


class UpdateUserProfileUseCase:
    """사용자 프로필 업데이트 유스케이스.

    사용자의 프로필 정보를 업데이트합니다.
    """

    def __init__(self, user_repository: UserRepository) -> None:
        self._user_repository = user_repository

    async def execute(
        self, user_id: UUID, request: UpdateProfileRequest
    ) -> UserProfileResponse:
        """사용자 프로필을 업데이트합니다.

        Args:
            user_id: 사용자 ID
            request: 프로필 업데이트 요청

        Returns:
            UserProfileResponse: 업데이트된 프로필 정보

        Raises:
            UserNotFoundError: 사용자가 존재하지 않는 경우
            InvalidNicknameError: 닉네임이 유효하지 않은 경우
        """
        user = await self._user_repository.find_by_id(user_id)

        if not user:
            raise UserNotFoundError()

        # 닉네임 유효성 검증
        if request.nickname is not None:
            if len(request.nickname) < 2 or len(request.nickname) > 20:
                raise InvalidNicknameError()
            user.nickname = request.nickname

        # 국가 업데이트
        if request.country is not None:
            user.country = request.country

        # 선호 언어 업데이트
        if request.preferred_language is not None:
            user.preferred_language = request.preferred_language

        # 아바타 URL 업데이트
        if request.avatar_url is not None:
            user.avatar_url = request.avatar_url

        # 저장
        updated_user = await self._user_repository.update(user)

        return self._to_response(updated_user)

    def _to_response(self, user: User) -> UserProfileResponse:
        """사용자 엔티티를 응답 DTO로 변환합니다."""
        return UserProfileResponse(
            id=str(user.id),
            email=user.email.value,
            nickname=user.nickname,
            country=user.country,
            preferred_language=user.preferred_language,
            is_active=user.is_active,
            is_verified=user.is_verified,
            role=user.role,
            avatar_url=user.avatar_url,
            created_at=user.created_at,
        )
