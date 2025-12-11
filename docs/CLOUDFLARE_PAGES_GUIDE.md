# 운영자용 Cloudflare 설정 가이드

아래 절차는 Cloudflare Pages에 OndaCoreana를 배포하기 위한 운영 체크리스트다. GitHub 연동만으로 배포가 진행되므로, 모든 설정은 Cloudflare 대시보드에서 완료한다.

## 1. Pages 프로젝트 생성
1. Cloudflare 대시보드 → **Pages** → **Create a project** 클릭.
2. **Connect to Git** 선택 후 GitHub 권한을 승인한다.
3. 레포지토리: `Prometheus-P/OndaCoreana`를 선택한다.

## 2. Build 설정
- **Framework preset**: `Astro`
- **Build command**: `pnpm build`
- **Output directory**: `dist`
- **Node version**: `18`
- **Package manager**: `pnpm` (대시보드에서 `Install Command`가 비어 있으면 `pnpm install --frozen-lockfile`로 지정)
- **Root directory**: 기본값(`/`)

## 3. 환경별 배포 구조
- **Production**: `main` 브랜치 기준, Pages의 Production 배포로 연결.
- **Staging**: `staging` 브랜치 기준, 별도 Pages 프로젝트나 Preview 배포를 Staging URL로 고정.
- **Preview**: PR/feature 브랜치 자동 Preview URL. Cloudflare Pages의 자동 Preview 기능을 활성화한다.

## 4. 환경 변수/시크릿 설정
Cloudflare Pages → 해당 프로젝트 → **Settings → Environment Variables**에서 설정한다. Key는 그대로, Value는 실제 값을 운영자가 입력한다.
- `GA_MEASUREMENT_ID="<여기에 실제 GA ID 입력>"`
- `SENTRY_DSN="<여기에 실제 Sentry DSN 입력>"`
- `CLOUDFLARE_ANALYTICS_TOKEN="<필요 시 여기에 실제 토큰 입력>"`
- 필요 시 API 연동 키를 동일 위치에 추가한다.

### 환경별 스코프
- **Production**: 기본 Environment Variables 섹션에 등록.
- **Preview/Staging**: `Preview` 탭에 동일 Key를 등록하되 값은 스테이징 자원으로 분리.

## 5. 브랜치 및 배포 정책
1. **Production**: `main` push 시 자동 Production 배포.
2. **Staging**: `staging` push 시 Preview 배포를 Staging 전용 URL에 매핑하거나, 별도 Pages 프로젝트를 생성해 `staging`만 연결.
3. **PR**: PR 생성 시 Preview 배포 링크가 자동 생성되도록 설정을 유지.

## 6. 캐시 및 빌드 최적화
- **Caching**: Pages 기본 캐싱을 사용하되, 이미지/폰트는 `public/`에 두어 빌드 시 그대로 서빙.
- **Build hooks**: 필요 시 `npm_config_cache` 또는 pnpm store 캐시를 활용할 수 있지만, 기본 설정으로도 충분.

## 7. 모니터링/알림 연동 (선택)
- Cloudflare Pages → **Webhooks**에서 GitHub/Slack 알림을 설정해 배포 성공/실패를 통지.
- GA/Sentry 등 외부 모니터링은 위 환경 변수로 주입.

## 8. 도메인 연결
1. Pages 프로젝트 → **Custom Domains** → 기존 도메인 추가.
2. 안내된 CNAME 레코드를 DNS에 등록 (예: `www` → `your-project.pages.dev`).
3. SSL/TLS는 Cloudflare 기본 설정(Full) 유지.

## 9. 권장 운영 절차
- 배포 전: GitHub Actions CI가 green인지 확인.
- 배포 후: Preview/Production URL 상태 확인, 주요 페이지(홈, 콘텐츠 상세) 랜덤 3건 Smoke Test.
- 장애 시: `main` 태그/커밋 기준 롤백 후 Pages 재배포.
