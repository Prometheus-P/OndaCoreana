"""Auth API - 인증 관련 엔드포인트."""

from fastapi import APIRouter, Depends, HTTPException, status

from app.application.dto.auth import (
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    TokenResponse,
    OAuthAuthorizationUrl,
    OAuthCallbackRequest,
    OAuthLoginResponse,
)
from app.application.use_cases.auth import (
    LoginUserUseCase,
    RefreshTokenUseCase,
    RegisterUserUseCase,
    GetOAuthAuthorizationUrlUseCase,
    OAuthLoginUseCase,
)
from app.domain.exceptions.auth import (
    EmailAlreadyExistsError,
    InvalidCredentialsError,
    TokenExpiredError,
    OAuthError,
)
from app.domain.exceptions.validation import InvalidEmailError, WeakPasswordError
from app.presentation.api.dependencies import (
    get_jwt_service,
    get_user_repository,
    get_google_oauth_service,
)

router = APIRouter()


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="회원가입",
    description="이메일과 비밀번호로 새 사용자를 등록합니다.",
)
async def register(
    request: RegisterRequest,
    user_repository=Depends(get_user_repository),
) -> RegisterResponse:
    """회원가입 엔드포인트.

    Args:
        request: 회원가입 요청

    Returns:
        RegisterResponse: 등록된 사용자 정보

    Raises:
        400: 유효성 검증 실패
        409: 이메일 중복
    """
    try:
        use_case = RegisterUserUseCase(user_repository)
        return await use_case.execute(request)

    except EmailAlreadyExistsError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": e.code, "message": e.message},
        )
    except (InvalidEmailError, WeakPasswordError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": e.code, "message": e.message},
        )


@router.post(
    "/login",
    response_model=LoginResponse,
    summary="로그인",
    description="이메일과 비밀번호로 로그인합니다.",
)
async def login(
    request: LoginRequest,
    user_repository=Depends(get_user_repository),
    jwt_service=Depends(get_jwt_service),
) -> LoginResponse:
    """로그인 엔드포인트.

    Args:
        request: 로그인 요청

    Returns:
        LoginResponse: 토큰 및 사용자 정보

    Raises:
        401: 인증 실패
    """
    try:
        use_case = LoginUserUseCase(user_repository, jwt_service)
        return await use_case.execute(request)

    except InvalidCredentialsError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": e.code, "message": e.message},
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="토큰 갱신",
    description="리프레시 토큰으로 새 액세스 토큰을 발급합니다.",
)
async def refresh_token(
    refresh_token: str,
    user_repository=Depends(get_user_repository),
    jwt_service=Depends(get_jwt_service),
) -> TokenResponse:
    """토큰 갱신 엔드포인트.

    Args:
        refresh_token: 리프레시 토큰

    Returns:
        TokenResponse: 새 토큰

    Raises:
        401: 토큰 유효하지 않음
    """
    try:
        use_case = RefreshTokenUseCase(user_repository, jwt_service)
        return await use_case.execute(refresh_token)

    except (TokenExpiredError, InvalidCredentialsError) as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": e.code, "message": e.message},
            headers={"WWW-Authenticate": "Bearer"},
        )


# ─────────────────────────────────────────────────────────────────
# OAuth 엔드포인트
# ─────────────────────────────────────────────────────────────────


@router.get(
    "/oauth/google",
    response_model=OAuthAuthorizationUrl,
    summary="Google OAuth 인증 URL",
    description="Google OAuth 인증 페이지로 리다이렉트할 URL을 반환합니다.",
)
async def get_google_auth_url(
    oauth_service=Depends(get_google_oauth_service),
) -> OAuthAuthorizationUrl:
    """Google OAuth 인증 URL 엔드포인트.

    Returns:
        OAuthAuthorizationUrl: Google OAuth 인증 URL과 상태 값
    """
    use_case = GetOAuthAuthorizationUrlUseCase(oauth_service)
    return use_case.execute()


@router.post(
    "/oauth/google/callback",
    response_model=OAuthLoginResponse,
    summary="Google OAuth 콜백",
    description="Google OAuth 인증 후 콜백을 처리합니다.",
)
async def google_oauth_callback(
    request: OAuthCallbackRequest,
    oauth_service=Depends(get_google_oauth_service),
    user_repository=Depends(get_user_repository),
    jwt_service=Depends(get_jwt_service),
) -> OAuthLoginResponse:
    """Google OAuth 콜백 엔드포인트.

    Args:
        request: OAuth 콜백 요청 (code, state)

    Returns:
        OAuthLoginResponse: 사용자 정보 및 토큰

    Raises:
        400: OAuth 인증 실패
        401: 계정 비활성화
    """
    try:
        use_case = OAuthLoginUseCase(oauth_service, user_repository, jwt_service)
        return await use_case.execute(request.code)

    except OAuthError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": e.code, "message": e.message},
        )
    except InvalidCredentialsError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": e.code, "message": e.message},
        )
