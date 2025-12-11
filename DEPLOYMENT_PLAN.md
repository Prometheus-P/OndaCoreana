# OndaCoreana 배포 계획

## 1. 목표 & 기준
- **가용성**: 99.9% 이상 (Cloudflare Pages/Global CDN 기반).
- **배포 속도**: `main`/`staging` push 후 10분 내 반영.
- **롤백**: 장애 감지 후 5분 내 이전 빌드로 전환 (커밋/태그 기반).
- **품질 게이트**: CI 단계에서 `pnpm check` + `pnpm build` 필수 통과.

## 2. 브랜치/환경 전략
- **브랜치**
  - `main` → Production
  - `staging` → Staging
  - `feature/*` → 기능 개발 및 PR Preview
- **Cloudflare Pages 매핑**
  - Production 배포: `main` push
  - Staging 배포: `staging` push (Preview URL을 Staging 고정 또는 별도 Pages 프로젝트)
  - Preview: PR/feature 브랜치 자동 Preview URL 생성

## 3. Cloudflare Pages 설정 값
- **Framework preset**: Astro
- **Build command**: `pnpm build`
- **Output directory**: `dist`
- **Node version**: `18`
- **Install command**: `pnpm install --frozen-lockfile`
- **Environment variables (예시)**: `GA_MEASUREMENT_ID="<실제 값 입력>", SENTRY_DSN="<실제 값 입력>"`

## 4. CI 파이프라인 개요
- 위치: `.github/workflows/ci.yml`
- 트리거: `push`/`pull_request` (대상: `main`, `staging`)
- 단계: pnpm 설치 → Node 18 세팅 → `pnpm install --frozen-lockfile` → `pnpm run --if-present check` → `pnpm build`
- 목적: Cloudflare Pages 배포 전 빌드/타입 오류 사전 차단

## 5. QA & 롤백 전략
- **사전 검증**: PR에서 CI green 확인, Preview URL smoke test 3건 이상 (홈, 카테고리, 상세).
- **릴리즈 승인**: Staging Preview OK → `main` 머지.
- **롤백**:
  - Git revert: `git revert <problematic_commit>` 후 push → Pages 자동 재배포
  - 태그 롤백: `git checkout <last_good_tag>` → hotfix 브랜치 생성 → 머지 & 배포
  - 긴급: Cloudflare Pages에서 이전 Production 빌드를 재배포(Available deployments 목록에서 Promote)

## 6. SEO/Analytics 도입 로드맵
- **v1.0**: 기본 GA(GA4) 측정, sitemap/robots 유지, Open Graph/JSON-LD 검증.
- **v1.1**: Pagefind 검색 개선, Core Web Vitals 모니터링 대시보드 추가.
- **v1.2**: Sentry 브라우저 SDK 도입(샘플링 5% 시작), 404/500 커스텀 페이지.
- **v2.0**: A/B 테스트(Split URL), 광고 태그 관리(TCF 2.2 동의 배너) 및 성능 예산 수립.

## 7. 운영 루틴
- **주간**: 콘텐츠 배치 점검, Lighthouse quick audit(모바일), GA 리포트 검토.
- **월간**: 의존성 업데이트 배치, 보안 점검(Trivy/Dependabot 결과 확인), SEO 키워드 리프레시.
- **분기**: 인프라 리허설(롤백/DR), 성능 예산 재조정.

## 8. QA & 롤백 체크리스트 (운영용)
### 배포 전 PR 체크리스트
- [ ] CI `build-and-validate` 성공 확인 (`pnpm check`, `pnpm build` 포함)
- [ ] Preview URL에서 핵심 경로 3건 수동 검증 (홈, 카테고리, 콘텐츠 상세)
- [ ] 새 환경 변수/시크릿 변경 사항을 Cloudflare Pages에 반영했는지 확인
- [ ] CHANGELOG/README 영향 여부 검토

### 배포 후 Production 체크리스트
- [ ] Production URL 로드 및 랜덤 페이지 3건 200 OK
- [ ] 콘솔 에러 및 404/500 미발생 확인
- [ ] GA/Sentry(또는 로깅)에서 신규 세션 집계 및 에러 알림 정상 수신 여부 확인
- [ ] Sitemap/robots 접근성 확인 (`/sitemap-index.xml`, `/robots.txt`)

### Git 기준 롤백 방법
- **단일 커밋 롤백**: `git revert <commit>` → push → Pages 자동 재배포
- **여러 커밋 롤백**: `git revert <oldest_commit>^..<newest_commit>` → push
- **태그 기준 롤백**: `git checkout <stable_tag>` → `git checkout -b hotfix/redeploy` → 변경 없이 `git push` 후 PR 머지
- **Cloudflare 빠른 복구**: Pages 대시보드 → Deployments → 이전 성공 빌드 선택 후 **Promote to Production**

## 9. 추가 운영 문서 제안
- `/docs/OPS_CHECKLIST.md`에 운영용 체크리스트와 온콜 절차를 유지관리. (본 계획서에는 핵심만 담고, 세부 runbook은 별도 파일에서 업데이트)
