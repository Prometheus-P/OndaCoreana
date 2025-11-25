"""Auth DTOs - 인증 관련 데이터 전송 객체."""

from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    """회원가입 요청 DTO.

    Attributes:
        email: 이메일 (필수, 유효한 형식)
        password: 비밀번호 (필수, 최소 8자)
        nickname: 닉네임 (필수, 2-20자)
        country: 국가 코드 (필수)
        preferred_language: 선호 언어 (필수, es/pt/en)
    """

    email: EmailStr = Field(
        ...,
        description="사용자 이메일",
        examples=["maria@example.com"],
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="비밀번호 (8자 이상, 대소문자+숫자+특수문자)",
        examples=["SecureP@ss1"],
    )
    nickname: str = Field(
        ...,
        min_length=2,
        max_length=20,
        description="닉네임 (2-20자)",
        examples=["Maria123"],
    )
    country: str = Field(
        ...,
        min_length=2,
        max_length=2,
        description="국가 코드 (ISO 3166-1 alpha-2)",
        examples=["MX"],
    )
    preferred_language: Literal["es", "pt", "en"] = Field(
        default="es",
        description="선호 언어",
    )


class RegisterResponse(BaseModel):
    """회원가입 응답 DTO."""

    id: str = Field(..., description="사용자 ID")
    email: str = Field(..., description="이메일")
    nickname: str = Field(..., description="닉네임")
    message: str = Field(
        default="회원가입이 완료되었습니다. 이메일 인증을 진행해주세요.",
        description="응답 메시지",
    )


class LoginRequest(BaseModel):
    """로그인 요청 DTO."""

    email: EmailStr = Field(
        ...,
        description="이메일",
        examples=["maria@example.com"],
    )
    password: str = Field(
        ...,
        description="비밀번호",
        examples=["SecureP@ss1"],
    )


class TokenResponse(BaseModel):
    """토큰 응답 DTO."""

    access_token: str = Field(..., description="액세스 토큰")
    refresh_token: str = Field(..., description="리프레시 토큰")
    token_type: str = Field(default="bearer", description="토큰 타입")
    expires_in: int = Field(..., description="만료 시간 (초)")


class LoginResponse(BaseModel):
    """로그인 응답 DTO."""

    user: "UserBasicInfo"
    tokens: TokenResponse


class UserBasicInfo(BaseModel):
    """사용자 기본 정보."""

    id: str
    email: str
    nickname: str
    preferred_language: str


# 순환 참조 해결
LoginResponse.model_rebuild()


# OAuth DTOs
class OAuthAuthorizationUrl(BaseModel):
    """OAuth 인증 URL 응답 DTO."""

    authorization_url: str = Field(..., description="OAuth 인증 URL")
    state: str = Field(..., description="CSRF 방지 상태 값")


class OAuthCallbackRequest(BaseModel):
    """OAuth 콜백 요청 DTO."""

    code: str = Field(..., description="OAuth 인증 코드")
    state: str = Field(..., description="CSRF 방지 상태 값")


class OAuthLoginResponse(BaseModel):
    """OAuth 로그인 응답 DTO."""

    user: UserBasicInfo
    tokens: TokenResponse
    is_new_user: bool = Field(default=False, description="신규 사용자 여부")
