# OndaCoreana Platform Roadmap

## Vision: Digital Silk Road for K-Culture in LATAM

OndaCoreana는 단순 콘텐츠 사이트를 넘어 남미와 한국을 잇는 **K-Culture 조달 플랫폼**으로 진화합니다.

---

## Phase 0-1: Foundation (완료)

### 완료된 작업
- [x] AdminGate 보안 강화 (SHA-256 해시 기반 인증)
- [x] SEOHead 동적 로케일 지원 (es-419, pt-BR)
- [x] i18n 유틸리티 생성
- [x] AdSense 및 Affiliate 시스템 구축
- [x] RSS 피드 자동 인제스트 파이프라인 (`scripts/ingest/`)
- [x] Content Quality Gates 구현 (`scripts/quality/`)
- [x] CI/CD 파이프라인 강화 (lint, typecheck, tests, quality)
- [x] GitHub Actions 워크플로우 (CI + Scheduled Ingest)
- [x] Operations Runbook 작성 (`OPS_RUNBOOK.md`)

### 기술 부채 (다음 단계)
- [ ] Cloudflare Access 또는 Supabase Auth로 Admin 인증 마이그레이션
- [ ] 콘텐츠 CMS 도입 (Sanity, Strapi, 또는 Keystatic)
- [ ] Affiliate 태그 실제 값으로 교체 (`data/affiliate-links.json`)

---

## Phase 2: Monetization & Lead Capture (1~3개월)

### 2.1 Affiliate 위젯 고도화

```
src/components/commerce/
├── ProductCard.astro        # 개별 상품 카드
├── ProductCarousel.astro    # 상품 캐러셀
├── StreamingCTA.astro       # 스트리밍 서비스 CTA
└── AffiliateBanner.astro    # 배너형 제휴 광고
```

#### 컨텍스트 기반 상품 추천 로직
```typescript
// 콘텐츠 타입별 추천 매핑
const contextProductMap = {
  dramas: ['streaming', 'merch', 'books'],
  kpop: ['albums', 'merch', 'concert_tickets'],
  guias: {
    viaje: ['esim', 'travel_insurance', 'accommodation'],
    streaming: ['vpn', 'streaming_subscriptions'],
    idioma: ['courses', 'books', 'apps'],
  },
};
```

### 2.2 Newsletter 리드 캡처 최적화

**목표**: 구독자 DB를 잠재 고객 풀로 활용

```typescript
// 리드 세분화 스키마
interface NewsletterLead {
  email: string;
  locale: 'es' | 'pt';
  country?: string;  // IP 기반 또는 선택
  interests: ('dramas' | 'kpop' | 'travel' | 'language')[];
  source: string;    // 가입 페이지/캠페인
  createdAt: Date;
  engagementScore: number;  // 오픈율/클릭률 기반
}
```

**구현 전략**:
1. Exit-intent 팝업 (모바일: 스크롤 기반)
2. 콘텐츠 잠금 (일부 프리미엄 가이드)
3. 관심사 기반 세그먼테이션
4. 환영 시퀀스 자동화 (Buttondown + Zapier)

---

## Phase 3: Platform Features (3~6개월)

### 3.1 Group Order (공구) 중개 플랫폼

남미 K-Pop 팬덤의 가장 큰 pain point: **고가의 국제 배송비, 복잡한 공구 프로세스**

#### 기술 스택 추천

| 레이어 | 기술 | 선정 이유 |
|--------|------|-----------|
| Frontend | Astro + React Islands | 기존 스택 유지, 동적 기능만 React |
| Backend | Supabase | PostgreSQL + Auth + Realtime + Storage |
| Payments | Stripe Connect / MercadoPago | 남미 현지 결제 + 에스크로 |
| Hosting | Cloudflare Pages + Workers | 글로벌 엣지 + 서버리스 |
| Queue | Cloudflare Queues | 주문 처리 비동기 |

#### 데이터 모델

```sql
-- Supabase PostgreSQL Schema

-- 사용자 (Supabase Auth 확장)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE,
  display_name TEXT,
  country TEXT,  -- ISO 3166-1 alpha-2
  locale TEXT DEFAULT 'es',
  trust_score INTEGER DEFAULT 0,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 공구 (Group Order)
CREATE TABLE group_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID REFERENCES profiles NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  product_url TEXT,
  product_image TEXT,

  -- 가격 정보
  unit_price_krw INTEGER NOT NULL,
  shipping_per_unit_krw INTEGER,
  platform_fee_percent DECIMAL(4,2) DEFAULT 5.00,

  -- 수량 조건
  min_quantity INTEGER NOT NULL,
  max_quantity INTEGER,
  current_quantity INTEGER DEFAULT 0,

  -- 배송 목적지
  destination_countries TEXT[] DEFAULT ARRAY['MX', 'AR', 'CL', 'BR'],

  -- 상태
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft', 'open', 'filled', 'purchasing', 'shipping', 'completed', 'cancelled')),

  -- 기간
  deadline TIMESTAMPTZ NOT NULL,
  estimated_delivery DATE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 참여 (Participation)
CREATE TABLE participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_order_id UUID REFERENCES group_orders NOT NULL,
  user_id UUID REFERENCES profiles NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,

  -- 배송 정보
  shipping_address JSONB,

  -- 결제 정보
  payment_status TEXT DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
  payment_id TEXT,  -- Stripe/MercadoPago reference
  amount_paid_usd DECIMAL(10,2),

  -- 상태
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'cancelled', 'fulfilled')),

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(group_order_id, user_id)
);

-- 리뷰/평가
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_order_id UUID REFERENCES group_orders NOT NULL,
  reviewer_id UUID REFERENCES profiles NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(group_order_id, reviewer_id)
);

-- 알림
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE participations ENABLE ROW LEVEL SECURITY;

-- 프로필: 본인만 수정 가능
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- 공구: 누구나 조회, 인증 사용자만 생성
CREATE POLICY "Anyone can view open orders"
  ON group_orders FOR SELECT USING (status != 'draft' OR organizer_id = auth.uid());
CREATE POLICY "Authenticated users can create orders"
  ON group_orders FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

#### API 엔드포인트 설계

```typescript
// Cloudflare Workers API Routes

// Group Orders
GET    /api/orders              // 목록 조회 (필터: status, country)
POST   /api/orders              // 공구 생성
GET    /api/orders/:id          // 상세 조회
PATCH  /api/orders/:id          // 수정 (주최자만)
DELETE /api/orders/:id          // 취소 (조건부)

// Participations
POST   /api/orders/:id/join     // 참여 신청
DELETE /api/orders/:id/leave    // 참여 취소
GET    /api/orders/:id/participants  // 참여자 목록

// Payments (Webhook)
POST   /api/webhooks/stripe
POST   /api/webhooks/mercadopago

// User
GET    /api/me                  // 내 프로필
GET    /api/me/orders           // 내 공구 (주최/참여)
GET    /api/me/notifications    // 알림
```

### 3.2 프리미엄 컨설팅 서비스

**서비스 라인업**:
1. **K-Career**: 한국 취업/인턴십 컨설팅
2. **K-Study**: 한국 유학 가이드
3. **K-Visa**: 비자 대행 연결

**결제 연동**: Stripe Checkout + Calendly 예약 시스템

---

## Phase 4: Scale & Expand (6개월+)

### 4.1 영어권 역진출

- 서브도메인: `en.ondacoreana.com`
- 콘텐츠 현지화 자동화 (DeepL API + 휴먼 리뷰)
- SEO: `en-US`, `en-GB` hreflang 추가

### 4.2 커뮤니티 기능

- 포럼/댓글 (Supabase Realtime)
- 사용자 생성 콘텐츠 (팬 리뷰, 추천)
- 게이미피케이션 (배지, 레벨)

### 4.3 모바일 앱

- PWA 우선 (Astro + Service Worker)
- 이후 React Native 앱 고려

---

## 수익 모델 요약

| 채널 | 단기 (0-6M) | 중장기 (6M+) |
|------|-------------|--------------|
| 광고 | AdSense | 직접 스폰서십 |
| 제휴 | Amazon, 스트리밍 | 직접 계약 (YesAsia, 위버스샵) |
| 공구 | - | 거래 수수료 5% |
| 컨설팅 | - | 서비스별 고정 요금 |
| 프리미엄 | - | 구독형 콘텐츠 (연 $29) |

---

## 기술 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────────┐
│                      Cloudflare Edge                            │
├─────────────────────────────────────────────────────────────────┤
│  Pages (Static)  │  Workers (API)  │  R2 (Media)  │  KV (Cache) │
└────────┬─────────┴────────┬────────┴──────────────┴─────────────┘
         │                  │
         │                  ▼
         │         ┌────────────────┐
         │         │    Supabase    │
         │         ├────────────────┤
         │         │ PostgreSQL     │
         │         │ Auth           │
         │         │ Realtime       │
         │         │ Storage        │
         │         └────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────────┐
│                     Astro Frontend                             │
├────────────────────────────────────────────────────────────────┤
│ Static Pages (SSG)  │  React Islands (Interactive)            │
│ - Content           │  - Auth Forms                           │
│ - Listings          │  - Order Management                     │
│ - SEO Landing       │  - Payment Flow                         │
└────────────────────────────────────────────────────────────────┘
```

---

## 다음 단계

1. **즉시**: Supabase 프로젝트 생성 및 스키마 배포
2. **1주차**: Auth 흐름 구현 (Magic Link + Social)
3. **2주차**: 공구 CRUD MVP
4. **3주차**: 결제 연동 (Stripe Connect 샌드박스)
5. **4주차**: 베타 테스트 (소규모 팬덤 그룹)

---

*Last updated: 2025-12-15*
