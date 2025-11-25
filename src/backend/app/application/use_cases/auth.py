"""Auth Use Cases - 인증 관련 유스케이스."""

import secrets

from app.application.dto.auth import (
    RegisterRequest,
    RegisterResponse,
    LoginRequest,
    LoginResponse,
    TokenResponse,
    UserBasicInfo,
    OAuthAuthorizationUrl,
    OAuthLoginResponse,
)
from app.application.interfaces.oauth_service import OAuthService
from app.application.interfaces.jwt_service import JWTService
from app.domain.entities.user import User
from app.domain.exceptions.auth import (
    EmailAlreadyExistsError,
    InvalidCredentialsError,
)
from app.domain.repositories.user_repository import UserRepository
from app.domain.value_objects.email import Email
from app.domain.value_objects.password import Password


class RegisterUserUseCase:
    """사용자 등록 유스케이스.

    새로운 사용자를 등록하고 인증 이메일을 발송합니다.
    """

    def __init__(self, user_repository: UserRepository) -> None:
        self._user_repository = user_repository

    async def execute(self, request: RegisterRequest) -> RegisterResponse:
        """사용자를 등록합니다.

        Args:
            request: 회원가입 요청 DTO

        Returns:
            RegisterResponse: 회원가입 응답 DTO

        Raises:
            EmailAlreadyExistsError: 이메일이 이미 존재하는 경우
            InvalidEmailError: 이메일 형식이 잘못된 경우
            WeakPasswordError: 비밀번호가 약한 경우
        """
        # 이메일 값 객체 생성 (유효성 검증 포함)
        email = Email(request.email)

        # 이메일 중복 확인
        if await self._user_repository.exists_by_email(email):
            raise EmailAlreadyExistsError()

        # 비밀번호 값 객체 생성 (강도 검증 포함)
        password = Password(request.password)

        # 사용자 엔티티 생성
        user = User(
            email=email,
            nickname=request.nickname,
            country=request.country,
            preferred_language=request.preferred_language,
        )
        user.set_password(password)

        # 저장
        created_user = await self._user_repository.create(user)

        return RegisterResponse(
            id=str(created_user.id),
            email=created_user.email.value,
            nickname=created_user.nickname,
        )


class LoginUserUseCase:
    """사용자 로그인 유스케이스.

    이메일/비밀번호로 사용자를 인증하고 토큰을 발급합니다.
    """

    def __init__(
        self,
        user_repository: UserRepository,
        jwt_service: JWTService,
    ) -> None:
        self._user_repository = user_repository
        self._jwt_service = jwt_service

    async def execute(self, request: LoginRequest) -> LoginResponse:
        """사용자를 로그인합니다.

        Args:
            request: 로그인 요청 DTO

        Returns:
            LoginResponse: 로그인 응답 DTO

        Raises:
            InvalidCredentialsError: 이메일 또는 비밀번호가 틀린 경우
        """
        # 이메일로 사용자 조회
        email = Email(request.email)
        user = await self._user_repository.find_by_email(email)

        if not user:
            raise InvalidCredentialsError()

        # 로그인 가능 여부 확인
        if not user.can_login():
            raise InvalidCredentialsError("계정이 비활성화되었습니다.")

        # 비밀번호 검증
        if not Password.verify_hash(request.password, user.password_hash):
            raise InvalidCredentialsError()

        # 토큰 생성
        access_token = self._jwt_service.create_access_token(
            user_id=str(user.id),
            email=user.email.value,
            role=user.role,
        )
        refresh_token = self._jwt_service.create_refresh_token(
            user_id=str(user.id),
        )

        return LoginResponse(
            user=UserBasicInfo(
                id=str(user.id),
                email=user.email.value,
                nickname=user.nickname,
                preferred_language=user.preferred_language,
            ),
            tokens=TokenResponse(
                access_token=access_token,
                refresh_token=refresh_token,
                expires_in=self._jwt_service.access_token_expire_seconds,
            ),
        )


class RefreshTokenUseCase:
    """토큰 갱신 유스케이스.

    유효한 리프레시 토큰으로 새 액세스 토큰을 발급합니다.
    """

    def __init__(
        self,
        user_repository: UserRepository,
        jwt_service: JWTService,
    ) -> None:
        self._user_repository = user_repository
        self._jwt_service = jwt_service

    async def execute(self, refresh_token: str) -> TokenResponse:
        """토큰을 갱신합니다.

        Args:
            refresh_token: 리프레시 토큰

        Returns:
            TokenResponse: 새 토큰 응답 DTO

        Raises:
            TokenExpiredError: 토큰이 만료된 경우
            InvalidCredentialsError: 토큰이 유효하지 않은 경우
        """
        # 리프레시 토큰 검증 및 사용자 ID 추출
        payload = self._jwt_service.verify_refresh_token(refresh_token)
        user_id = payload.get("sub")

        if not user_id:
            raise InvalidCredentialsError("유효하지 않은 토큰입니다.")

        # 사용자 조회
        from uuid import UUID
        user = await self._user_repository.find_by_id(UUID(user_id))

        if not user or not user.can_login():
            raise InvalidCredentialsError("사용자를 찾을 수 없습니다.")

        # 새 토큰 생성
        access_token = self._jwt_service.create_access_token(
            user_id=str(user.id),
            email=user.email.value,
            role=user.role,
        )
        new_refresh_token = self._jwt_service.create_refresh_token(
            user_id=str(user.id),
        )

        return TokenResponse(
            access_token=access_token,
            refresh_token=new_refresh_token,
            expires_in=self._jwt_service.access_token_expire_seconds,
        )


class GetOAuthAuthorizationUrlUseCase:
    """OAuth 인증 URL 조회 유스케이스.

    OAuth 제공자의 인증 URL을 생성합니다.
    """

    def __init__(self, oauth_service: OAuthService) -> None:
        self._oauth_service = oauth_service

    def execute(self) -> OAuthAuthorizationUrl:
        """OAuth 인증 URL을 생성합니다.

        Returns:
            OAuthAuthorizationUrl: 인증 URL과 상태 값
        """
        state = secrets.token_urlsafe(32)
        authorization_url = self._oauth_service.get_authorization_url(state)

        return OAuthAuthorizationUrl(
            authorization_url=authorization_url,
            state=state,
        )


class OAuthLoginUseCase:
    """OAuth 로그인 유스케이스.

    OAuth 콜백을 처리하고 사용자를 인증/생성합니다.
    """

    def __init__(
        self,
        oauth_service: OAuthService,
        user_repository: UserRepository,
        jwt_service: JWTService,
    ) -> None:
        self._oauth_service = oauth_service
        self._user_repository = user_repository
        self._jwt_service = jwt_service

    async def execute(self, code: str) -> OAuthLoginResponse:
        """OAuth 로그인을 처리합니다.

        Args:
            code: OAuth 인증 코드

        Returns:
            OAuthLoginResponse: 로그인 응답 (사용자 정보 + 토큰)

        Raises:
            OAuthError: OAuth 인증 실패
        """
        # 1. 인증 코드로 액세스 토큰 교환
        oauth_token = await self._oauth_service.exchange_code_for_token(code)

        # 2. 사용자 정보 조회
        oauth_user_info = await self._oauth_service.get_user_info(oauth_token)

        # 3. 기존 OAuth 사용자 확인
        user = await self._user_repository.find_by_oauth(
            provider=oauth_user_info.provider,
            oauth_id=oauth_user_info.provider_id,
        )

        is_new_user = False

        if not user:
            # 4a. 이메일로 기존 사용자 확인 (계정 연결)
            email = Email(oauth_user_info.email)
            existing_user = await self._user_repository.find_by_email(email)

            if existing_user:
                # 기존 계정에 OAuth 연결
                existing_user.oauth_provider = oauth_user_info.provider
                existing_user.oauth_id = oauth_user_info.provider_id
                if oauth_user_info.avatar_url and not existing_user.avatar_url:
                    existing_user.avatar_url = oauth_user_info.avatar_url
                user = await self._user_repository.update(existing_user)
            else:
                # 4b. 새 사용자 생성
                is_new_user = True
                nickname = oauth_user_info.name or oauth_user_info.email.split("@")[0]

                user = User(
                    email=email,
                    nickname=nickname[:20],  # 닉네임 최대 길이
                    country="",  # 나중에 프로필에서 설정
                    preferred_language="es",
                    is_verified=True,  # OAuth 인증된 이메일은 검증됨
                    oauth_provider=oauth_user_info.provider,
                    oauth_id=oauth_user_info.provider_id,
                    avatar_url=oauth_user_info.avatar_url,
                )
                user = await self._user_repository.create(user)

        # 5. 로그인 가능 여부 확인
        if not user.can_login():
            raise InvalidCredentialsError("계정이 비활성화되었습니다.")

        # 6. 토큰 생성
        access_token = self._jwt_service.create_access_token(
            user_id=str(user.id),
            email=user.email.value,
            role=user.role,
        )
        refresh_token = self._jwt_service.create_refresh_token(
            user_id=str(user.id),
        )

        return OAuthLoginResponse(
            user=UserBasicInfo(
                id=str(user.id),
                email=user.email.value,
                nickname=user.nickname,
                preferred_language=user.preferred_language,
            ),
            tokens=TokenResponse(
                access_token=access_token,
                refresh_token=refresh_token,
                expires_in=self._jwt_service.access_token_expire_seconds,
            ),
            is_new_user=is_new_user,
        )
