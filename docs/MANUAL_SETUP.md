# 수동 설정 작업 목록

> 이 문서는 AI가 자동으로 처리할 수 없고 **사람이 직접 수행해야 하는 작업**들입니다.

---

## 로컬 개발을 위한 최소 설정 순서

```
1️⃣  Supabase 프로젝트 생성 ─────────────────── 필수
2️⃣  보안 키 생성 (SECRET_KEY, JWT_SECRET) ─── 필수
3️⃣  Google OAuth 설정 ────────────────────── 소셜로그인시
4️⃣  AI 서비스 API 키 ─────────────────────── AI기능 사용시
5️⃣  n8n Credentials 설정 ─────────────────── 자동화 사용시
```

---

## 1. Supabase 프로젝트 설정 (Issue #4) - HIGH

**왜 필요한가?** 데이터베이스와 인증의 핵심 인프라입니다.

### 작업 단계

- [ ] https://supabase.com 에서 계정 생성 및 로그인
- [ ] 새 프로젝트 생성 (이름: `hallyulatino`)
- [ ] 리전 선택: `South America (São Paulo)` 권장
- [ ] Settings > API 에서 키 복사

### .env 설정

```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_KEY=<your-service-key>

# 프론트엔드용
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

---

## 2. 보안 키 설정 (Issue #10) - HIGH

**왜 필요한가?** 기본 비밀번호는 보안 취약점입니다.

### 안전한 키 생성 방법

```bash
# 터미널에서 실행
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

### .env 설정

```bash
SECRET_KEY=<위에서 생성한 값>
JWT_SECRET_KEY=<다른 안전한 랜덤 값>
```

---

## 3. Google OAuth 설정 (Issue #5) - HIGH

**왜 필요한가?** 소셜 로그인(Google 계정으로 로그인) 기능에 필요합니다.

### 작업 단계

- [ ] https://console.cloud.google.com 접속
- [ ] 프로젝트 생성 또는 선택
- [ ] APIs & Services > OAuth consent screen 설정
  - [ ] User Type: External
  - [ ] App name: HallyuLatino
  - [ ] 범위: email, profile, openid
- [ ] APIs & Services > Credentials > Create OAuth client ID
- [ ] Application type: Web application 선택
- [ ] Authorized redirect URIs 추가:
  - [ ] `http://localhost:3000/auth/callback/google` (로컬)

### .env 설정

```bash
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback/google
```

---

## 4. AI 서비스 API 키 설정 (Issue #6) - MEDIUM

| 서비스 | 용도 | 가입 URL | 무료 티어 |
|--------|------|----------|-----------|
| **DeepL** | 자막 번역 (한↔스페인어) | https://www.deepl.com/pro-api | 50만 자/월 |
| **OpenAI** | 챗봇 (GPT-4) | https://platform.openai.com | 일부 무료 크레딧 |
| **Replicate** | 음성 인식 (Whisper) | https://replicate.com | 일부 무료 |

### .env 설정

```bash
DEEPL_API_KEY=xxx
OPENAI_API_KEY=sk-xxx
REPLICATE_API_TOKEN=r8_xxx
```

---

## 5. n8n Credentials 설정 (Issue #7) - MEDIUM

**전제조건:** Supabase, DeepL, Replicate 설정 완료 후

### 작업 단계

- [ ] `docker-compose up -d` 실행
- [ ] http://localhost:5678 접속
- [ ] 기본 계정(admin/admin)으로 로그인 후 비밀번호 변경
- [ ] Settings > Credentials 에서 각 서비스 연결

---

## 6. 결제 시스템 설정 (Issue #8) - LOW

| 서비스 | 대상 지역 | 가입 URL |
|--------|----------|----------|
| **Stripe** | 글로벌 | https://stripe.com |
| **MercadoPago** | 라틴 아메리카 | https://www.mercadopago.com.br/developers |

### .env 설정 (테스트 키)

```bash
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
MERCADOPAGO_ACCESS_TOKEN=xxx
```

---

## 7. 프로덕션 배포 환경 설정 (Issue #9) - LOW

| 서비스 | 용도 | 가입 URL | 비용 |
|--------|------|----------|------|
| **Vercel** | 프론트엔드 호스팅 | https://vercel.com | 무료~$20/월 |
| **Railway** | 백엔드 호스팅 | https://railway.app | $20~50/월 |
| **Upstash** | Redis (캐시) | https://upstash.com | 무료~$10/월 |
| **Cloudflare R2** | 미디어 저장소 | https://cloudflare.com | 무료~$15/월 |

---

## 주의사항

1. **절대 커밋하지 마세요**: `.env` 파일, API 키, 시크릿
2. **테스트 키 사용**: 결제 서비스는 반드시 테스트 모드로 시작
3. **비밀번호 변경**: 기본 비밀번호(admin/admin 등)는 즉시 변경

---

## 완료 체크리스트

- [ ] Supabase 프로젝트 생성 완료
- [ ] 보안 키 생성 및 .env 설정 완료
- [ ] Google OAuth 설정 완료
- [ ] AI 서비스 API 키 설정 완료
- [ ] n8n Credentials 설정 완료
- [ ] 결제 시스템 설정 완료 (선택)
- [ ] 프로덕션 배포 환경 설정 완료 (선택)

---

*이 문서는 설정 완료 시 체크박스를 업데이트하세요.*
