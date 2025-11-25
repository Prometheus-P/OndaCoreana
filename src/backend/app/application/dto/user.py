"""User DTOs - 사용자 관련 데이터 전송 객체."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class UserResponse(BaseModel):
    """사용자 응답 DTO."""

    id: str = Field(..., description="사용자 ID")
    email: str = Field(..., description="이메일")
    nickname: str = Field(..., description="닉네임")
    country: str = Field(..., description="국가 코드")
    preferred_language: str = Field(..., description="선호 언어")
    is_active: bool = Field(..., description="활성 상태")
    is_verified: bool = Field(..., description="이메일 인증 여부")
    role: str = Field(..., description="사용자 역할")
    avatar_url: str | None = Field(None, description="프로필 이미지 URL")
    created_at: datetime = Field(..., description="가입일")


class UserProfileResponse(BaseModel):
    """사용자 프로필 응답 DTO."""

    id: str = Field(..., description="사용자 ID")
    email: str = Field(..., description="이메일")
    nickname: str = Field(..., description="닉네임")
    country: str = Field(..., description="국가 코드")
    preferred_language: str = Field(..., description="선호 언어")
    is_active: bool = Field(..., description="활성 상태")
    is_verified: bool = Field(..., description="이메일 인증 여부")
    role: str = Field(..., description="사용자 역할")
    avatar_url: str | None = Field(None, description="프로필 이미지 URL")
    created_at: datetime | None = Field(None, description="가입일")


class UserUpdateRequest(BaseModel):
    """사용자 정보 수정 요청 DTO."""

    nickname: str | None = Field(
        None,
        min_length=2,
        max_length=20,
        description="닉네임",
    )
    country: str | None = Field(
        None,
        min_length=2,
        max_length=2,
        description="국가 코드",
    )
    preferred_language: Literal["es", "pt", "en"] | None = Field(
        None,
        description="선호 언어",
    )
    avatar_url: str | None = Field(
        None,
        max_length=500,
        description="프로필 이미지 URL",
    )


# Alias for compatibility
UpdateProfileRequest = UserUpdateRequest
