# Issue #62: Newsletter 리드 세분화 및 자동화 구현 계획

> **Branch:** `feat/newsletter-segmentation`
> **Issue:** [#62](https://github.com/Prometheus-P/OndaCoreana/issues/62)
> **Status:** Planning
> **Created:** 2025-12-18

---

## 1. 현황 분석

### 1.1 현재 구현 상태
- **NewsletterForm.astro**: 이메일만 수집하는 단순 폼
- **Buttondown 연동**: `mode: 'no-cors'`로 embed form action에 직접 POST
- **환경변수**: `PUBLIC_BUTTONDOWN_USERNAME`만 사용 중 (API 키 미사용)

### 1.2 문제점
1. 관심사(interests) 수집 없음 → 세그먼트 불가
2. 구독 컨텍스트(source page) 미추적
3. Buttondown 태그/메타데이터 연동 없음
4. API 키 기반 서버사이드 연동 없음

---

## 2. 기술 설계

### 2.1 Buttondown API 활용 전략

Buttondown API는 구독자 생성 시 `tags`와 `metadata` 필드를 지원합니다:

```typescript
// POST https://api.buttondown.email/v1/subscribers
{
  "email": "user@example.com",
  "tags": ["kpop", "dramas"],
  "metadata": {
    "source": "guias/ver-kdramas-gratis",
    "country": "MX",
    "locale": "es"
  }
}
```

**Rate Limit**: 100 requests/hour (충분함)

### 2.2 아키텍처 결정

| 옵션 | 장점 | 단점 |
|------|------|------|
| **A. Astro API Route (SSR)** | 타입 안전, 키 보호 | Cloudflare Pages 어댑터 필요 |
| **B. Cloudflare Worker** | 독립적, 확장성 | 별도 배포/관리 |
| **C. 클라이언트 + 히든 필드** | 단순, SSG 유지 | 태그만 가능, 키 노출 불가 |

**선택: 옵션 A (Astro API Route)**
- 이유: 이미 Astro 5.x 사용 중, `@astrojs/cloudflare` 어댑터로 하이브리드 렌더링 가능
- API 키를 서버에서만 사용하여 보안 유지

### 2.3 데이터 스키마

```typescript
// src/types/newsletter.ts
export interface NewsletterSubscription {
  email: string;
  interests: Array<'kpop' | 'dramas' | 'travel' | 'language'>;
  source: string;      // 현재 페이지 경로
  country?: string;    // 선택적 (폼 또는 IP 기반)
  locale: 'es' | 'pt';
}

// Buttondown으로 전송될 형태
export interface ButtondownPayload {
  email: string;
  tags: string[];
  metadata: {
    source: string;
    country?: string;
    locale: string;
    subscribed_at: string;
  };
}
```

---

## 3. 구현 작업 목록

### Task 1: Astro 하이브리드 렌더링 설정 (P0)
- [ ] `@astrojs/cloudflare` 어댑터 설치
- [ ] `astro.config.mjs`에서 `output: 'hybrid'` 설정
- [ ] `wrangler.toml` 생성 (Cloudflare Pages Functions 설정)

### Task 2: 환경변수 및 타입 추가 (P0)
- [ ] `.env.example`에 `BUTTONDOWN_API_KEY` 추가 (비공개, 서버용)
- [ ] `src/env.d.ts` 타입 확장
- [ ] `src/types/newsletter.ts` 생성

### Task 3: API 엔드포인트 생성 (P0)
- [ ] `src/pages/api/newsletter/subscribe.ts` 생성
  - POST 요청 처리
  - 입력 유효성 검사 (Zod)
  - Buttondown API 호출
  - 에러 핸들링 및 응답

### Task 4: NewsletterForm 컴포넌트 개선 (P1)
- [ ] 관심사 체크박스 UI 추가 (kpop, dramas, travel, language)
- [ ] 현재 페이지 경로를 hidden field로 포함
- [ ] 새 API 엔드포인트로 fetch 변경
- [ ] 성공/실패 상태 UI 개선

### Task 5: 콘텐츠 페이지별 자동 태깅 (P1)
- [ ] `ArticleLayout.astro`에서 contentType을 NewsletterForm에 전달
- [ ] 해당 카테고리를 pre-checked 상태로 표시

### Task 6: 테스트 및 문서화 (P2)
- [ ] E2E 테스트: 구독 플로우
- [ ] `ENVIRONMENT.md` 문서 업데이트

---

## 4. 파일 변경 목록

### 신규 생성
```
src/pages/api/newsletter/subscribe.ts   # API 엔드포인트
src/types/newsletter.ts                  # 타입 정의
```

### 수정
```
astro.config.mjs                         # 하이브리드 렌더링 설정
.env.example                             # BUTTONDOWN_API_KEY 추가
src/env.d.ts                             # 환경변수 타입
src/components/newsletter/NewsletterForm.astro  # 관심사 UI 추가
src/layouts/ArticleLayout.astro          # contentType prop 전달
docs/ENVIRONMENT.md                      # 문서 업데이트
```

---

## 5. API 엔드포인트 상세 설계

### POST /api/newsletter/subscribe

**Request Body:**
```json
{
  "email": "user@example.com",
  "interests": ["kpop", "dramas"],
  "source": "/dramas/squid-game-temporada-2",
  "locale": "es"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Suscripción exitosa. Revisa tu correo para confirmar."
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "error": "email_invalid" | "rate_limited" | "server_error"
}
```

---

## 6. UI 목업

### 개선된 NewsletterForm (card variant)

```
┌─────────────────────────────────────────────────────────┐
│  ¿No quieres perderte nada?                             │
│  Suscríbete y recibe las últimas noticias...            │
│                                                         │
│  [Tu correo electrónico          ]                      │
│                                                         │
│  ¿Qué te interesa? (opcional)                           │
│  ☑ K-Pop   ☑ K-Dramas   ☐ Viajes   ☐ Idioma            │
│                                                         │
│  [        Suscribirse        ]                          │
│                                                         │
│  ─────────────────────────────────────────────────      │
│  Respetamos tu privacidad. Sin spam.                    │
└─────────────────────────────────────────────────────────┘
```

---

## 7. 리스크 및 고려사항

### 7.1 Cloudflare Pages Functions
- `@astrojs/cloudflare` 어댑터 사용 시 일부 Node.js API 제한
- `fetch`는 지원됨 (Buttondown API 호출 가능)

### 7.2 Rate Limiting
- Buttondown: 100 req/hour
- 클라이언트 측 디바운싱으로 충분히 대응 가능

### 7.3 개인정보 보호
- 이메일 외 필수 수집 정보 최소화
- 관심사는 선택적(optional)으로 유지

---

## 8. 완료 기준

- [ ] 사용자가 관심사를 선택하여 구독 가능
- [ ] Buttondown에 태그가 정상 적용됨
- [ ] 구독 소스(페이지)가 메타데이터로 저장됨
- [ ] 빌드 및 타입체크 통과
- [ ] E2E 테스트 통과

---

## 참고 자료

- [Buttondown API - Creating Subscribers](https://docs.buttondown.com/api-subscribers-create)
- [Buttondown Metadata](https://docs.buttondown.com/metadata)
- [Astro Cloudflare Adapter](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
- Issue #62: [Phase 2] Newsletter 리드 세분화 및 자동화
