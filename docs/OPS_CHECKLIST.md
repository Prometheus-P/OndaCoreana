# OPS_CHECKLIST

운영자가 배포/장애 대응을 빠르게 수행하기 위한 실행형 체크리스트다. 상세 절차는 `DEPLOYMENT_PLAN.md`를 우선 참고하고, 본 문서는 반복적/빈번한 작업을 짧게 정리한다.

## 1. 배포 전 (PR 단계)
- [ ] 대상 브랜치: `feature/*` → `staging` → `main` 흐름 확인
- [ ] CI `build-and-validate` green 확인 (타입/빌드)
- [ ] Preview URL에서 홈/카테고리/콘텐츠 상세 각 1건 확인
- [ ] 새/변경된 환경 변수 목록화 후 Cloudflare Pages `Preview`/`Production` 탭에 반영 준비

## 2. Staging 배포 확인
- [ ] `staging` push 후 생성된 Preview URL에서 변경 사항 시각적 확인
- [ ] Lighthouse 간단 점검(모바일, Performance 85+ 유지 목표)
- [ ] SEO 메타(타이틀/OG)와 다국어 라우팅 정상 여부 확인

## 3. Production 배포 후
- [ ] 배포 완료 알림/로그 확인 (Cloudflare Pages Deployments)
- [ ] Production URL 응답 코드 200, 랜덤 3페이지 노출 확인
- [ ] GA/Sentry 대시보드에서 신규 세션/에러 유입 확인
- [ ] `/sitemap-index.xml`, `/robots.txt` 접근 테스트

## 4. 롤백/장애 대응
- [ ] 문제가 된 커밋/배포 ID 식별 → `git revert <commit>` 또는 Pages Deployments에서 이전 빌드 **Promote**
- [ ] 롤백 후 동일 경로 3건 재검증
- [ ] 장애 리포트 작성(원인, 영향 범위, 대응 내역) 후 README/CHANGELOG 영향 검토

## 5. 주기적 유지보수
- [ ] 주간: 콘텐츠 릴리즈 계획 점검, GA 주요 지표 검토
- [ ] 월간: `pnpm update --latest` 검토 후 Staging에서 회귀 테스트, 보안 스캔(Trivy) 실행
- [ ] 분기: 롤백/DR 리허설 1회, SEO 키워드 및 링크 건강도 점검
