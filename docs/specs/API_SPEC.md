---
title: HallyuLatino API 명세
version: 1.0.0
status: Draft
owner: @hallyulatino-team
created: 2025-11-25
updated: 2025-11-25
reviewers: []
language: Korean (한국어)
---

# API_SPEC.md - API 명세서

## 변경 이력 (Changelog)

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2025-11-25 | @hallyulatino-team | 최초 작성 |

## 관련 문서 (Related Documents)

- [ARCHITECTURE.md](./ARCHITECTURE.md) - 시스템 아키텍처
- [DATA_MODEL.md](./DATA_MODEL.md) - 데이터 모델

---

## 1. API 개요 (API Overview)

### 1.1 기본 정보

| 항목 | 값 |
|------|-----|
| Base URL (Dev) | `http://localhost:8000/api` |
| Base URL (Staging) | `https://api-staging.hallyulatino.com/api` |
| Base URL (Prod) | `https://api.hallyulatino.com/api` |
| API Version | v1 |
| 프로토콜 | HTTPS (TLS 1.3) |
| 형식 | JSON |
| 인코딩 | UTF-8 |

### 1.2 인증 (Authentication)

모든 인증이 필요한 엔드포인트는 `Authorization` 헤더에 Bearer 토큰을 포함해야 합니다.

```http
Authorization: Bearer <access_token>
```

### 1.3 공통 응답 형식

**성공 응답:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2025-11-25T12:00:00Z",
    "request_id": "req_abc123"
  }
}
```

**에러 응답:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "이메일 또는 비밀번호가 올바르지 않습니다.",
    "details": { ... }
  },
  "meta": {
    "timestamp": "2025-11-25T12:00:00Z",
    "request_id": "req_abc123"
  }
}
```

### 1.4 공통 에러 코드

| HTTP Status | 에러 코드 | 설명 |
|-------------|-----------|------|
| 400 | `VALIDATION_ERROR` | 입력 검증 실패 |
| 401 | `UNAUTHORIZED` | 인증 필요 |
| 401 | `INVALID_TOKEN` | 잘못된 토큰 |
| 401 | `TOKEN_EXPIRED` | 만료된 토큰 |
| 403 | `FORBIDDEN` | 권한 없음 |
| 404 | `NOT_FOUND` | 리소스 없음 |
| 409 | `CONFLICT` | 리소스 충돌 |
| 429 | `RATE_LIMITED` | 요청 제한 초과 |
| 500 | `INTERNAL_ERROR` | 서버 내부 오류 |

### 1.5 Rate Limiting

| 엔드포인트 유형 | 제한 |
|-----------------|------|
| 인증 API | 10 req/min |
| 일반 API | 100 req/min |
| 검색 API | 30 req/min |
| 스트리밍 API | 5 req/min |

Rate Limit 정보는 응답 헤더에 포함됩니다:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1700924400
```

---

## 2. 인증 API (Authentication)

### 2.1 회원가입

사용자 계정을 생성합니다.

```http
POST /api/v1/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecureP@ss123",
  "nickname": "usuario123",
  "country": "MX",
  "language": "es",
  "terms_agreed": true,
  "privacy_agreed": true,
  "marketing_agreed": false
}
```

**Validation Rules:**

| 필드 | 타입 | 필수 | 규칙 |
|------|------|:----:|------|
| email | string | ✓ | 유효한 이메일 형식, max 255 |
| password | string | ✓ | min 8, 대소문자+숫자+특수문자 |
| nickname | string | ✓ | 2-20자, 영문/숫자/한글 |
| country | string | ✓ | ISO 3166-1 alpha-2 |
| language | string | ✓ | "es" 또는 "pt" |
| terms_agreed | boolean | ✓ | true |
| privacy_agreed | boolean | ✓ | true |
| marketing_agreed | boolean | - | - |

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user_id": "usr_abc123",
    "email": "user@example.com",
    "nickname": "usuario123",
    "email_verified": false,
    "created_at": "2025-11-25T12:00:00Z"
  }
}
```

**Error Responses:**

| Status | Code | 상황 |
|--------|------|------|
| 400 | `VALIDATION_ERROR` | 입력 검증 실패 |
| 409 | `EMAIL_ALREADY_EXISTS` | 이메일 중복 |

---

### 2.2 로그인

이메일과 비밀번호로 로그인합니다.

```http
POST /api/v1/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecureP@ss123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "Bearer",
    "expires_in": 1800,
    "user": {
      "user_id": "usr_abc123",
      "email": "user@example.com",
      "nickname": "usuario123",
      "role": "user"
    }
  }
}
```

**Error Responses:**

| Status | Code | 상황 |
|--------|------|------|
| 401 | `INVALID_CREDENTIALS` | 이메일/비밀번호 불일치 |
| 403 | `EMAIL_NOT_VERIFIED` | 이메일 미인증 |

---

### 2.3 토큰 갱신

Refresh Token으로 새 Access Token을 발급받습니다.

```http
POST /api/v1/auth/refresh
```

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 1800
  }
}
```

---

### 2.4 로그아웃

현재 세션을 종료합니다.

```http
POST /api/v1/auth/logout
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "로그아웃되었습니다."
  }
}
```

---

### 2.5 OAuth 로그인 (Google)

```http
GET /api/v1/auth/oauth/google
```

**Query Parameters:**

| 파라미터 | 필수 | 설명 |
|----------|:----:|------|
| redirect_uri | ✓ | 콜백 URI |

**Response:** OAuth 로그인 페이지로 리다이렉트

**Callback:**
```http
GET /api/v1/auth/oauth/google/callback
```

---

## 3. 사용자 API (Users)

### 3.1 내 프로필 조회

```http
GET /api/v1/users/me
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user_id": "usr_abc123",
    "email": "user@example.com",
    "nickname": "usuario123",
    "avatar_url": "https://cdn.hallyulatino.com/avatars/usr_abc123.jpg",
    "country": "MX",
    "language": "es",
    "role": "user",
    "subscription": {
      "plan": "free",
      "expires_at": null
    },
    "stats": {
      "watch_time_minutes": 1250,
      "favorites_count": 45,
      "reviews_count": 12
    },
    "created_at": "2025-11-25T12:00:00Z"
  }
}
```

---

### 3.2 프로필 업데이트

```http
PATCH /api/v1/users/me
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "nickname": "nuevo_nombre",
  "language": "pt",
  "avatar_url": "https://cdn.hallyulatino.com/avatars/new.jpg"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user_id": "usr_abc123",
    "nickname": "nuevo_nombre",
    "language": "pt",
    "avatar_url": "https://cdn.hallyulatino.com/avatars/new.jpg",
    "updated_at": "2025-11-25T13:00:00Z"
  }
}
```

---

### 3.3 시청 기록 조회

```http
GET /api/v1/users/me/watch-history
Authorization: Bearer <access_token>
```

**Query Parameters:**

| 파라미터 | 기본값 | 설명 |
|----------|--------|------|
| page | 1 | 페이지 번호 |
| limit | 20 | 페이지당 항목 수 (max 50) |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "content_id": "cnt_drama123",
        "episode_id": "ep_001",
        "title": "사랑의 불시착",
        "episode_number": 5,
        "thumbnail_url": "https://cdn.hallyulatino.com/thumbs/drama123_ep5.jpg",
        "progress_seconds": 2400,
        "duration_seconds": 4200,
        "progress_percent": 57,
        "watched_at": "2025-11-25T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "total_pages": 3
    }
  }
}
```

---

### 3.4 즐겨찾기 목록

```http
GET /api/v1/users/me/favorites
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "content_id": "cnt_drama123",
        "title": "사랑의 불시착",
        "title_translated": "Aterrizaje de Emergencia en Tu Corazón",
        "poster_url": "https://cdn.hallyulatino.com/posters/drama123.jpg",
        "type": "drama",
        "year": 2019,
        "added_at": "2025-11-20T15:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15
    }
  }
}
```

---

### 3.5 즐겨찾기 추가/삭제

**추가:**
```http
POST /api/v1/users/me/favorites
Authorization: Bearer <access_token>
```

```json
{
  "content_id": "cnt_drama123"
}
```

**삭제:**
```http
DELETE /api/v1/users/me/favorites/{content_id}
Authorization: Bearer <access_token>
```

---

## 4. 콘텐츠 API (Contents)

### 4.1 콘텐츠 목록 조회

```http
GET /api/v1/contents
```

**Query Parameters:**

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| page | int | 1 | 페이지 번호 |
| limit | int | 20 | 페이지당 항목 (max 50) |
| type | string | - | `drama`, `movie`, `variety`, `kpop` |
| genre | string | - | 장르 필터 |
| year | int | - | 연도 필터 |
| sort | string | `popular` | `popular`, `recent`, `rating` |
| language | string | - | 자막 언어 필터 |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "content_id": "cnt_drama123",
        "type": "drama",
        "title": "사랑의 불시착",
        "title_translated": "Aterrizaje de Emergencia en Tu Corazón",
        "poster_url": "https://cdn.hallyulatino.com/posters/drama123.jpg",
        "year": 2019,
        "genres": ["로맨스", "코미디"],
        "rating": 4.8,
        "total_episodes": 16,
        "available_subtitles": ["es", "pt"],
        "is_new": false,
        "is_exclusive": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "total_pages": 8
    }
  }
}
```

---

### 4.2 콘텐츠 상세 조회

```http
GET /api/v1/contents/{content_id}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "content_id": "cnt_drama123",
    "type": "drama",
    "title": "사랑의 불시착",
    "title_translated": "Aterrizaje de Emergencia en Tu Corazón",
    "original_title": "사랑의 불시착",
    "description": "남한의 재벌 상속녀와 북한 장교의 사랑 이야기...",
    "description_translated": "Una historia de amor entre una heredera...",
    "poster_url": "https://cdn.hallyulatino.com/posters/drama123.jpg",
    "backdrop_url": "https://cdn.hallyulatino.com/backdrops/drama123.jpg",
    "trailer_url": "https://cdn.hallyulatino.com/trailers/drama123.mp4",
    "year": 2019,
    "genres": [
      {"id": "genre_romance", "name": "로맨스", "name_translated": "Romance"},
      {"id": "genre_comedy", "name": "코미디", "name_translated": "Comedia"}
    ],
    "rating": 4.8,
    "rating_count": 12500,
    "duration_minutes": 70,
    "total_episodes": 16,
    "available_subtitles": ["es", "pt", "en"],
    "cast": [
      {
        "person_id": "per_001",
        "name": "손예진",
        "name_romanized": "Son Ye-jin",
        "role": "윤세리",
        "profile_url": "https://cdn.hallyulatino.com/people/per_001.jpg"
      }
    ],
    "director": {
      "person_id": "per_010",
      "name": "이정효",
      "name_romanized": "Lee Jung-hyo"
    },
    "network": "tvN",
    "episodes": [
      {
        "episode_id": "ep_001",
        "episode_number": 1,
        "title": "1화",
        "title_translated": "Episodio 1",
        "description": "...",
        "thumbnail_url": "https://cdn.hallyulatino.com/thumbs/drama123_ep1.jpg",
        "duration_seconds": 4200,
        "air_date": "2019-12-14"
      }
    ],
    "similar_contents": ["cnt_drama456", "cnt_drama789"],
    "created_at": "2025-01-15T00:00:00Z"
  }
}
```

---

### 4.3 스트리밍 URL 조회

```http
GET /api/v1/contents/{content_id}/episodes/{episode_id}/stream
Authorization: Bearer <access_token>
```

**Query Parameters:**

| 파라미터 | 기본값 | 설명 |
|----------|--------|------|
| quality | `auto` | `auto`, `360p`, `480p`, `720p`, `1080p` |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "stream_url": "https://cdn.hallyulatino.com/streams/drama123/ep001/manifest.m3u8",
    "stream_type": "hls",
    "qualities": [
      {"quality": "1080p", "bitrate": 5000000},
      {"quality": "720p", "bitrate": 2500000},
      {"quality": "480p", "bitrate": 1000000},
      {"quality": "360p", "bitrate": 500000}
    ],
    "subtitles": [
      {
        "language": "es",
        "label": "Español",
        "url": "https://cdn.hallyulatino.com/subtitles/drama123/ep001/es.vtt"
      },
      {
        "language": "pt",
        "label": "Português",
        "url": "https://cdn.hallyulatino.com/subtitles/drama123/ep001/pt.vtt"
      }
    ],
    "resume_position_seconds": 2400,
    "expires_at": "2025-11-25T13:00:00Z"
  }
}
```

---

### 4.4 재생 진행 상황 업데이트

```http
POST /api/v1/contents/{content_id}/episodes/{episode_id}/progress
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "position_seconds": 2500,
  "is_completed": false
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "content_id": "cnt_drama123",
    "episode_id": "ep_001",
    "position_seconds": 2500,
    "is_completed": false,
    "updated_at": "2025-11-25T12:30:00Z"
  }
}
```

---

## 5. 검색 API (Search)

### 5.1 콘텐츠 검색

```http
GET /api/v1/search
```

**Query Parameters:**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| q | string | ✓ | 검색어 (min 2자) |
| type | string | - | 콘텐츠 타입 필터 |
| page | int | - | 페이지 (기본 1) |
| limit | int | - | 결과 수 (기본 20) |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "query": "사랑",
    "items": [
      {
        "content_id": "cnt_drama123",
        "type": "drama",
        "title": "사랑의 불시착",
        "title_translated": "Aterrizaje de Emergencia en Tu Corazón",
        "poster_url": "https://cdn.hallyulatino.com/posters/drama123.jpg",
        "year": 2019,
        "rating": 4.8,
        "relevance_score": 0.95
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25
    }
  }
}
```

---

### 5.2 자동완성

```http
GET /api/v1/search/autocomplete
```

**Query Parameters:**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| q | string | ✓ | 검색어 (min 1자) |
| limit | int | - | 결과 수 (기본 10, max 20) |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {"text": "사랑의 불시착", "type": "title"},
      {"text": "사랑의 이해", "type": "title"},
      {"text": "손예진", "type": "person"}
    ]
  }
}
```

---

## 6. 추천 API (Recommendations)

### 6.1 개인화 추천

```http
GET /api/v1/recommendations
Authorization: Bearer <access_token>
```

**Query Parameters:**

| 파라미터 | 기본값 | 설명 |
|----------|--------|------|
| limit | 20 | 추천 수 (max 50) |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "sections": [
      {
        "section_id": "for_you",
        "title": "당신을 위한 추천",
        "title_translated": "Recomendado para ti",
        "items": [
          {
            "content_id": "cnt_drama456",
            "title": "이태원 클라쓰",
            "poster_url": "...",
            "recommendation_reason": "사랑의 불시착을 좋아하셨기 때문에"
          }
        ]
      },
      {
        "section_id": "trending",
        "title": "인기 콘텐츠",
        "title_translated": "Tendencias",
        "items": [...]
      },
      {
        "section_id": "new_releases",
        "title": "신규 콘텐츠",
        "title_translated": "Nuevos lanzamientos",
        "items": [...]
      }
    ]
  }
}
```

---

### 6.2 유사 콘텐츠

```http
GET /api/v1/contents/{content_id}/similar
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "content_id": "cnt_drama789",
        "title": "별에서 온 그대",
        "poster_url": "...",
        "similarity_score": 0.85
      }
    ]
  }
}
```

---

## 7. OpenAPI 스펙

전체 OpenAPI 3.0 스펙은 다음에서 확인할 수 있습니다:

- **Swagger UI**: `https://api.hallyulatino.com/docs`
- **ReDoc**: `https://api.hallyulatino.com/redoc`
- **JSON 스펙**: `https://api.hallyulatino.com/openapi.json`

---

## 8. SDK 및 예제 코드

### Python

```python
import httpx

class HallyuLatinoClient:
    """HallyuLatino API 클라이언트"""

    def __init__(self, base_url: str = "https://api.hallyulatino.com/api/v1"):
        self.base_url = base_url
        self.client = httpx.Client()
        self.access_token = None

    def login(self, email: str, password: str) -> dict:
        """로그인하여 토큰을 획득합니다."""
        response = self.client.post(
            f"{self.base_url}/auth/login",
            json={"email": email, "password": password}
        )
        response.raise_for_status()
        data = response.json()["data"]
        self.access_token = data["access_token"]
        return data

    def get_contents(self, page: int = 1, limit: int = 20) -> dict:
        """콘텐츠 목록을 조회합니다."""
        response = self.client.get(
            f"{self.base_url}/contents",
            params={"page": page, "limit": limit}
        )
        response.raise_for_status()
        return response.json()["data"]

    def get_stream_url(self, content_id: str, episode_id: str) -> dict:
        """스트리밍 URL을 조회합니다."""
        response = self.client.get(
            f"{self.base_url}/contents/{content_id}/episodes/{episode_id}/stream",
            headers={"Authorization": f"Bearer {self.access_token}"}
        )
        response.raise_for_status()
        return response.json()["data"]


# 사용 예시
client = HallyuLatinoClient()
client.login("user@example.com", "password")
contents = client.get_contents()
```

### TypeScript

```typescript
interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

class HallyuLatinoClient {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor(baseUrl = 'https://api.hallyulatino.com/api/v1') {
    this.baseUrl = baseUrl;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const { data } = await response.json();
    this.accessToken = data.access_token;
    return data;
  }

  async getContents(page = 1, limit = 20): Promise<Content[]> {
    const response = await fetch(
      `${this.baseUrl}/contents?page=${page}&limit=${limit}`
    );
    const { data } = await response.json();
    return data.items;
  }
}
```

---

*이 API 문서는 지속적으로 업데이트됩니다. 변경사항은 CHANGELOG를 참고하세요.*
