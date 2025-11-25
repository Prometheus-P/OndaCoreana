---
title: HallyuLatino TDD 개발 계획
version: 1.0.0
status: Active
owner: @hallyulatino-team
created: 2025-11-25
updated: 2025-11-25
reviewers: []
language: Korean (한국어)
---

# plan.md - TDD 개발 계획

> 이 문서는 실시간으로 업데이트됩니다. 각 기능 구현 전에 테스트 케이스를 먼저 정의합니다.

## 변경 이력 (Changelog)

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.3.0 | 2025-11-25 | @claude | Phase 3 사용자 서비스 완료 (프로필, 시청기록, 즐겨찾기) |
| 1.2.0 | 2025-11-25 | @claude | Phase 2 인증 서비스 완료 (Google OAuth 포함) |
| 1.1.0 | 2025-11-25 | @claude | Phase 1 인프라 설정 완료 |
| 1.0.0 | 2025-11-25 | @hallyulatino-team | 최초 작성 |

---

## 📊 전체 진행 상황

```
┌─────────────────────────────────────────────────────────────┐
│ 🎯 MVP Development Progress                                  │
├─────────────────────────────────────────────────────────────┤
│ Phase 1: 인프라 설정           ████████████████████ 100%    │
│ Phase 2: 인증 서비스           ████████████████████ 100%    │
│ Phase 3: 사용자 서비스         ████████████████████ 100%    │
│ Phase 4: 콘텐츠 서비스         ░░░░░░░░░░░░░░░░░░░░  0%     │
│ Phase 5: AI 번역 서비스        ░░░░░░░░░░░░░░░░░░░░  0%     │
│ Phase 6: 추천 시스템           ░░░░░░░░░░░░░░░░░░░░  0%     │
│ Phase 7: 프론트엔드            ██████████████░░░░░░  70%    │
│ Phase 8: 통합 테스트           ░░░░░░░░░░░░░░░░░░░░  0%     │
├─────────────────────────────────────────────────────────────┤
│ 전체 진행률                    ██████████░░░░░░░░░░  46%    │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Phase 1: 인프라 설정 (완료)

### 1.1 프로젝트 구조 설정

| 상태 | 태스크 | 테스트 케이스 | 담당자 |
|:----:|--------|---------------|--------|
| ✅ | 백엔드 프로젝트 초기화 (Clean Architecture) | - | @claude |
| ✅ | 프론트엔드 프로젝트 초기화 (Next.js 14) | - | @claude |
| ✅ | Docker Compose 설정 | 컨테이너 정상 실행 확인 | @claude |
| ✅ | CI/CD 파이프라인 설정 | 파이프라인 정상 동작 확인 | @claude |

### 1.2 데이터베이스 설정

| 상태 | 태스크 | 테스트 케이스 | 담당자 |
|:----:|--------|---------------|--------|
| ✅ | PostgreSQL 스키마 설계 (users 테이블) | - | @claude |
| ✅ | Alembic 마이그레이션 설정 | 마이그레이션 실행/롤백 테스트 | @claude |
| ✅ | Redis 연결 설정 | 연결 테스트 | @claude |
| ⬜ | pgvector 확장 설정 (Elasticsearch 대체) | 벡터 검색 테스트 | TBD |

---

## ✅ Phase 2: 인증 서비스 (Auth Service) - 완료

### 2.1 사용자 등록

**테스트 케이스:** ✅ 구현 완료 (`tests/unit/auth/test_registration.py`)

```python
# tests/unit/auth/test_registration.py

class TestUserRegistration:
    """사용자 등록 기능 테스트"""

    def test_should_register_user_with_valid_email_and_password(self):
        """유효한 이메일과 비밀번호로 사용자를 등록할 수 있다"""
        # Given: 유효한 이메일과 비밀번호
        # When: 등록 API 호출
        # Then: 201 Created, 사용자 ID 반환
        pass  # ✅ 구현됨

    def test_should_reject_registration_with_invalid_email_format(self):
        """잘못된 이메일 형식으로 등록 시 실패해야 한다"""
        # Given: 잘못된 형식의 이메일
        # When: 등록 API 호출
        # Then: 400 Bad Request, INVALID_EMAIL 에러
        pass  # ✅ 구현됨

    def test_should_reject_registration_with_weak_password(self):
        """약한 비밀번호로 등록 시 실패해야 한다"""
        # Given: 8자 미만 비밀번호
        # When: 등록 API 호출
        # Then: 400 Bad Request, WEAK_PASSWORD 에러
        pass  # ✅ 구현됨

    def test_should_reject_registration_with_duplicate_email(self):
        """이미 등록된 이메일로 등록 시 실패해야 한다"""
        # Given: 이미 등록된 이메일
        # When: 등록 API 호출
        # Then: 409 Conflict, EMAIL_ALREADY_EXISTS 에러
        pass

    def test_should_hash_password_before_storing(self):
        """비밀번호는 해시되어 저장되어야 한다"""
        # Given: 평문 비밀번호
        # When: 등록 완료 후 DB 확인
        # Then: 저장된 비밀번호는 해시값
        pass
```

| 상태 | 태스크 | 담당자 |
|:----:|--------|--------|
| ✅ | 테스트 케이스 작성 (RED) | @claude |
| ✅ | User 도메인 모델 구현 | @claude |
| ✅ | UserRepository 구현 | @claude |
| ✅ | RegistrationService 구현 (GREEN) | @claude |
| ✅ | 리팩토링 (REFACTOR) | @claude |

### 2.2 로그인/로그아웃

**테스트 케이스:**

```python
# tests/unit/auth/test_login.py

class TestUserLogin:
    """사용자 로그인 기능 테스트"""

    def test_should_return_tokens_when_valid_credentials(self):
        """유효한 자격증명으로 로그인 시 토큰을 반환해야 한다"""
        # Given: 등록된 사용자의 이메일과 비밀번호
        # When: 로그인 API 호출
        # Then: 200 OK, access_token과 refresh_token 반환
        pass

    def test_should_reject_login_with_wrong_password(self):
        """잘못된 비밀번호로 로그인 시 실패해야 한다"""
        # Given: 등록된 이메일과 잘못된 비밀번호
        # When: 로그인 API 호출
        # Then: 401 Unauthorized, INVALID_CREDENTIALS 에러
        pass

    def test_should_reject_login_with_nonexistent_email(self):
        """존재하지 않는 이메일로 로그인 시 실패해야 한다"""
        # Given: 등록되지 않은 이메일
        # When: 로그인 API 호출
        # Then: 401 Unauthorized, INVALID_CREDENTIALS 에러
        pass

    def test_should_include_user_info_in_access_token(self):
        """Access Token에 사용자 정보가 포함되어야 한다"""
        # Given: 로그인 성공
        # When: Access Token 디코딩
        # Then: user_id, email, roles 포함
        pass


class TestTokenRefresh:
    """토큰 갱신 기능 테스트"""

    def test_should_return_new_access_token_with_valid_refresh_token(self):
        """유효한 Refresh Token으로 새 Access Token을 발급해야 한다"""
        pass

    def test_should_reject_expired_refresh_token(self):
        """만료된 Refresh Token은 거부해야 한다"""
        pass

    def test_should_reject_revoked_refresh_token(self):
        """폐기된 Refresh Token은 거부해야 한다"""
        pass
```

| 상태 | 태스크 | 담당자 |
|:----:|--------|--------|
| ✅ | 테스트 케이스 작성 (RED) | @claude |
| ✅ | JWTService 구현 | @claude |
| ✅ | AuthenticationService 구현 (GREEN) | @claude |
| ✅ | 리팩토링 (REFACTOR) | @claude |

### 2.3 소셜 로그인 (OAuth)

**테스트 케이스:**

```python
# tests/unit/auth/test_oauth.py

class TestGoogleOAuth:
    """Google OAuth 로그인 테스트"""

    def test_should_create_user_on_first_google_login(self):
        """첫 Google 로그인 시 사용자를 생성해야 한다"""
        pass

    def test_should_link_existing_user_on_google_login(self):
        """기존 사용자와 Google 계정을 연결해야 한다"""
        pass

    def test_should_return_tokens_on_successful_google_login(self):
        """Google 로그인 성공 시 토큰을 반환해야 한다"""
        pass


class TestFacebookOAuth:
    """Facebook OAuth 로그인 테스트"""

    def test_should_create_user_on_first_facebook_login(self):
        """첫 Facebook 로그인 시 사용자를 생성해야 한다"""
        pass
```

| 상태 | 태스크 | 담당자 |
|:----:|--------|--------|
| ✅ | 테스트 케이스 작성 (RED) | @claude |
| ✅ | OAuthService 구현 | @claude |
| ✅ | Google OAuth 연동 (GREEN) | @claude |
| ⬜ | Facebook OAuth 연동 (GREEN) | TBD |
| ✅ | 리팩토링 (REFACTOR) | @claude |

---

## ✅ Phase 3: 사용자 서비스 (User Service) - 완료

### 3.1 프로필 관리

**테스트 케이스:** ✅ 구현 완료 (`tests/unit/user/test_profile.py`)

```python
# tests/unit/user/test_profile.py

class TestUserProfile:
    """사용자 프로필 관리 테스트"""

    def test_should_return_user_profile_when_authenticated(self):
        """인증된 사용자는 자신의 프로필을 조회할 수 있다"""
        pass  # ✅ 구현됨

    def test_should_update_profile_with_valid_data(self):
        """유효한 데이터로 프로필을 업데이트할 수 있다"""
        pass  # ✅ 구현됨

    def test_should_reject_profile_update_with_invalid_nickname(self):
        """부적절한 닉네임으로 프로필 업데이트 시 실패해야 한다"""
        pass  # ✅ 구현됨

    def test_should_upload_profile_image(self):
        """프로필 이미지를 업로드할 수 있다"""
        pass  # ⬜ 추후 구현 (OAuth 아바타 사용)
```

| 상태 | 태스크 | 담당자 |
|:----:|--------|--------|
| ✅ | 테스트 케이스 작성 (RED) | @claude |
| ✅ | UserProfile 도메인 모델 구현 | @claude |
| ✅ | ProfileService (Use Cases) 구현 (GREEN) | @claude |
| ⬜ | 이미지 업로드 구현 | TBD |
| ✅ | 프론트엔드 프로필 UI 구현 | @claude |
| ✅ | 리팩토링 (REFACTOR) | @claude |

### 3.2 시청 기록

**테스트 케이스:** ✅ 구현 완료 (`tests/unit/user/test_watch_history.py`)

```python
# tests/unit/user/test_watch_history.py

class TestWatchHistory:
    """시청 기록 기능 테스트"""

    def test_should_record_watch_progress(self):
        """콘텐츠 시청 진행 상황을 기록해야 한다"""
        pass  # ✅ 구현됨

    def test_should_resume_from_last_position(self):
        """마지막 시청 위치부터 재생을 재개해야 한다"""
        pass  # ✅ 구현됨

    def test_should_list_watch_history_in_reverse_chronological_order(self):
        """시청 기록을 최신순으로 조회해야 한다"""
        pass  # ✅ 구현됨
```

| 상태 | 태스크 | 담당자 |
|:----:|--------|--------|
| ✅ | 테스트 케이스 작성 (RED) | @claude |
| ✅ | WatchHistory 도메인 모델 구현 | @claude |
| ✅ | WatchHistoryRepository 구현 | @claude |
| ✅ | WatchHistory Use Cases 구현 (GREEN) | @claude |
| ✅ | WatchHistory API 엔드포인트 구현 | @claude |
| ✅ | 리팩토링 (REFACTOR) | @claude |

### 3.3 즐겨찾기

**테스트 케이스:** ✅ 구현 완료 (`tests/unit/user/test_favorites.py`)

```python
# tests/unit/user/test_favorites.py

class TestFavorites:
    """즐겨찾기 기능 테스트"""

    def test_should_add_content_to_favorites(self):
        """콘텐츠를 즐겨찾기에 추가할 수 있다"""
        pass  # ✅ 구현됨

    def test_should_remove_content_from_favorites(self):
        """콘텐츠를 즐겨찾기에서 제거할 수 있다"""
        pass  # ✅ 구현됨

    def test_should_not_duplicate_favorites(self):
        """이미 즐겨찾기된 콘텐츠는 중복 추가되지 않아야 한다"""
        pass  # ✅ 구현됨
```

| 상태 | 태스크 | 담당자 |
|:----:|--------|--------|
| ✅ | 테스트 케이스 작성 (RED) | @claude |
| ✅ | Favorite 도메인 모델 구현 | @claude |
| ✅ | FavoriteRepository 구현 | @claude |
| ✅ | Favorite Use Cases 구현 (GREEN) | @claude |
| ✅ | Favorites API 엔드포인트 구현 | @claude |
| ✅ | 리팩토링 (REFACTOR) | @claude |

---

## 🔴 Phase 4: 콘텐츠 서비스 (Content Service)

### 4.1 콘텐츠 CRUD

**테스트 케이스:**

```python
# tests/unit/content/test_content_crud.py

class TestContentRetrieval:
    """콘텐츠 조회 기능 테스트"""

    def test_should_return_content_by_id(self):
        """ID로 콘텐츠를 조회할 수 있다"""
        pass

    def test_should_return_404_for_nonexistent_content(self):
        """존재하지 않는 콘텐츠 조회 시 404를 반환해야 한다"""
        pass

    def test_should_list_contents_with_pagination(self):
        """콘텐츠 목록을 페이지네이션으로 조회할 수 있다"""
        pass

    def test_should_filter_contents_by_category(self):
        """카테고리로 콘텐츠를 필터링할 수 있다"""
        pass

    def test_should_filter_contents_by_genre(self):
        """장르로 콘텐츠를 필터링할 수 있다"""
        pass
```

| 상태 | 태스크 | 담당자 |
|:----:|--------|--------|
| ⬜ | 테스트 케이스 작성 (RED) | TBD |
| ⬜ | Content 도메인 모델 구현 | TBD |
| ⬜ | ContentRepository 구현 | TBD |
| ⬜ | ContentService 구현 (GREEN) | TBD |
| ⬜ | 리팩토링 (REFACTOR) | TBD |

### 4.2 콘텐츠 검색

**테스트 케이스:**

```python
# tests/unit/content/test_content_search.py

class TestContentSearch:
    """콘텐츠 검색 기능 테스트"""

    def test_should_search_by_title(self):
        """제목으로 콘텐츠를 검색할 수 있다"""
        pass

    def test_should_search_by_actor_name(self):
        """배우 이름으로 콘텐츠를 검색할 수 있다"""
        pass

    def test_should_return_results_with_relevance_score(self):
        """검색 결과에 관련도 점수가 포함되어야 한다"""
        pass

    def test_should_support_korean_and_spanish_search(self):
        """한국어와 스페인어로 검색할 수 있다"""
        pass

    def test_should_suggest_autocomplete_results(self):
        """자동완성 결과를 제안해야 한다"""
        pass
```

| 상태 | 태스크 | 담당자 |
|:----:|--------|--------|
| ⬜ | 테스트 케이스 작성 (RED) | TBD |
| ⬜ | Elasticsearch 인덱스 설계 | TBD |
| ⬜ | SearchService 구현 (GREEN) | TBD |
| ⬜ | 자동완성 구현 | TBD |
| ⬜ | 리팩토링 (REFACTOR) | TBD |

### 4.3 스트리밍

**테스트 케이스:**

```python
# tests/unit/content/test_streaming.py

class TestVideoStreaming:
    """비디오 스트리밍 기능 테스트"""

    def test_should_return_streaming_url_for_authorized_user(self):
        """인증된 사용자에게 스트리밍 URL을 제공해야 한다"""
        pass

    def test_should_support_adaptive_bitrate_streaming(self):
        """적응형 비트레이트 스트리밍을 지원해야 한다"""
        pass

    def test_should_track_playback_position(self):
        """재생 위치를 추적해야 한다"""
        pass

    def test_should_reject_streaming_for_unauthorized_user(self):
        """미인증 사용자의 스트리밍 요청을 거부해야 한다"""
        pass
```

| 상태 | 태스크 | 담당자 |
|:----:|--------|--------|
| ⬜ | 테스트 케이스 작성 (RED) | TBD |
| ⬜ | StreamingService 구현 | TBD |
| ⬜ | CDN 연동 구현 (GREEN) | TBD |
| ⬜ | 리팩토링 (REFACTOR) | TBD |

---

## 🔴 Phase 5: AI 번역 서비스 (Translation Service)

### 5.1 자막 번역

**테스트 케이스:**

```python
# tests/unit/ai/test_translation.py

class TestSubtitleTranslation:
    """자막 번역 기능 테스트"""

    def test_should_translate_korean_to_spanish(self):
        """한국어 자막을 스페인어로 번역해야 한다"""
        pass

    def test_should_translate_korean_to_portuguese(self):
        """한국어 자막을 포르투갈어로 번역해야 한다"""
        pass

    def test_should_preserve_timing_information(self):
        """번역 시 타이밍 정보를 보존해야 한다"""
        pass

    def test_should_handle_special_characters(self):
        """특수 문자를 올바르게 처리해야 한다"""
        pass

    def test_should_maintain_cultural_context(self):
        """문화적 맥락을 유지하면서 번역해야 한다"""
        pass

    def test_should_cache_translated_subtitles(self):
        """번역된 자막을 캐시해야 한다"""
        pass
```

| 상태 | 태스크 | 담당자 |
|:----:|--------|--------|
| ⬜ | 테스트 케이스 작성 (RED) | TBD |
| ⬜ | TranslationWorker 구현 | TBD |
| ⬜ | OpenAI GPT-4 연동 (GREEN) | TBD |
| ⬜ | 캐싱 레이어 구현 | TBD |
| ⬜ | 리팩토링 (REFACTOR) | TBD |

### 5.2 음성 인식 (자막 생성)

**테스트 케이스:**

```python
# tests/unit/ai/test_speech_recognition.py

class TestSpeechRecognition:
    """음성 인식 기능 테스트"""

    def test_should_transcribe_korean_audio(self):
        """한국어 오디오를 텍스트로 변환해야 한다"""
        pass

    def test_should_generate_timestamps(self):
        """타임스탬프를 생성해야 한다"""
        pass

    def test_should_handle_multiple_speakers(self):
        """여러 화자를 구분해야 한다"""
        pass

    def test_should_filter_background_noise(self):
        """배경 소음을 필터링해야 한다"""
        pass
```

| 상태 | 태스크 | 담당자 |
|:----:|--------|--------|
| ⬜ | 테스트 케이스 작성 (RED) | TBD |
| ⬜ | SpeechRecognitionWorker 구현 | TBD |
| ⬜ | Whisper 연동 (GREEN) | TBD |
| ⬜ | 리팩토링 (REFACTOR) | TBD |

---

## 🔴 Phase 6: 추천 시스템 (Recommendation Service)

### 6.1 콘텐츠 추천

**테스트 케이스:**

```python
# tests/unit/recommendation/test_recommendation.py

class TestContentRecommendation:
    """콘텐츠 추천 기능 테스트"""

    def test_should_recommend_based_on_watch_history(self):
        """시청 기록 기반으로 추천해야 한다"""
        pass

    def test_should_recommend_based_on_favorites(self):
        """즐겨찾기 기반으로 추천해야 한다"""
        pass

    def test_should_provide_diverse_recommendations(self):
        """다양한 추천을 제공해야 한다"""
        pass

    def test_should_update_recommendations_on_new_activity(self):
        """새로운 활동 시 추천을 업데이트해야 한다"""
        pass

    def test_should_handle_cold_start_users(self):
        """신규 사용자도 추천을 받을 수 있어야 한다"""
        pass
```

| 상태 | 태스크 | 담당자 |
|:----:|--------|--------|
| ⬜ | 테스트 케이스 작성 (RED) | TBD |
| ⬜ | RecommendationWorker 구현 | TBD |
| ⬜ | Pinecone 벡터 DB 연동 | TBD |
| ⬜ | 추천 알고리즘 구현 (GREEN) | TBD |
| ⬜ | 리팩토링 (REFACTOR) | TBD |

---

## 🔴 Phase 7: 프론트엔드 (Frontend)

### 7.1 인증 UI

**테스트 케이스:**

```typescript
// tests/e2e/auth.spec.ts

describe('Authentication Flow', () => {
  it('should register new user successfully', () => {
    // 회원가입 폼 작성 → 제출 → 성공 메시지 확인
  });

  it('should login with valid credentials', () => {
    // 로그인 폼 작성 → 제출 → 대시보드 리다이렉트
  });

  it('should show error for invalid credentials', () => {
    // 잘못된 정보 입력 → 에러 메시지 표시
  });

  it('should logout successfully', () => {
    // 로그아웃 버튼 클릭 → 로그인 페이지 리다이렉트
  });
});
```

| 상태 | 태스크 | 담당자 |
|:----:|--------|--------|
| ⬜ | 테스트 케이스 작성 (RED) | TBD |
| ⬜ | 로그인/회원가입 페이지 구현 | TBD |
| ⬜ | 인증 상태 관리 구현 (GREEN) | TBD |
| ⬜ | 리팩토링 (REFACTOR) | TBD |

### 7.2 콘텐츠 브라우징 UI

| 상태 | 태스크 | 담당자 |
|:----:|--------|--------|
| ⬜ | 테스트 케이스 작성 (RED) | TBD |
| ⬜ | 홈 페이지 구현 | TBD |
| ⬜ | 콘텐츠 상세 페이지 구현 | TBD |
| ⬜ | 검색 기능 구현 (GREEN) | TBD |
| ⬜ | 리팩토링 (REFACTOR) | TBD |

### 7.3 비디오 플레이어

| 상태 | 태스크 | 담당자 |
|:----:|--------|--------|
| ⬜ | 테스트 케이스 작성 (RED) | TBD |
| ⬜ | 커스텀 비디오 플레이어 구현 | TBD |
| ⬜ | 자막 표시 기능 구현 | TBD |
| ⬜ | 언어 선택 기능 구현 (GREEN) | TBD |
| ⬜ | 리팩토링 (REFACTOR) | TBD |

---

## 🔴 Phase 8: 통합 테스트 및 QA

### 8.1 통합 테스트

| 상태 | 태스크 | 담당자 |
|:----:|--------|--------|
| ⬜ | API 통합 테스트 | TBD |
| ⬜ | E2E 테스트 | TBD |
| ⬜ | 성능 테스트 | TBD |
| ⬜ | 보안 테스트 | TBD |

### 8.2 QA 체크리스트

| 상태 | 항목 |
|:----:|------|
| ⬜ | 모든 단위 테스트 통과 |
| ⬜ | 테스트 커버리지 80% 이상 |
| ⬜ | 보안 취약점 스캔 통과 |
| ⬜ | 성능 목표 달성 (API P95 < 200ms) |
| ⬜ | 접근성 검사 통과 |
| ⬜ | 크로스 브라우저 테스트 |

---

## 📝 작업 상태 범례

| 아이콘 | 상태 |
|:------:|------|
| ⬜ | 대기 (Pending) |
| 🔄 | 진행 중 (In Progress) |
| ✅ | 완료 (Completed) |
| ❌ | 차단됨 (Blocked) |
| ⏸️ | 일시 중단 (On Hold) |

---

## 📊 테스트 커버리지 목표

| 영역 | 현재 | 목표 |
|------|------|------|
| 백엔드 Unit | 0% | 80% |
| 백엔드 Integration | 0% | 60% |
| 프론트엔드 Unit | 0% | 70% |
| E2E | 0% | Critical Path 100% |

---

## 🔗 관련 문서

- [CONTEXT.md](./CONTEXT.md) - 프로젝트 컨텍스트
- [docs/specs/PRD.md](./docs/specs/PRD.md) - 제품 요구사항
- [docs/guides/TDD_GUIDE.md](./docs/guides/TDD_GUIDE.md) - TDD 가이드
- [docs/guides/TEST_STRATEGY_GUIDE.md](./docs/guides/TEST_STRATEGY_GUIDE.md) - 테스트 전략

---

*이 문서는 개발 진행에 따라 실시간으로 업데이트됩니다.*
