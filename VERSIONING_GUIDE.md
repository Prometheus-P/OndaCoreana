---
title: HallyuLatino 버전 관리 가이드
version: 1.0.0
status: Draft
owner: @hallyulatino-team
created: 2025-11-25
updated: 2025-11-25
reviewers: []
language: Korean (한국어)
---

# VERSIONING_GUIDE.md - 버전 관리 가이드

## 변경 이력 (Changelog)

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2025-11-25 | @hallyulatino-team | 최초 작성 |

## 관련 문서 (Related Documents)

- [CONTRIBUTING.md](./CONTRIBUTING.md) - 기여 가이드
- [docs/operations/RELEASE_MANAGEMENT.md](./docs/operations/RELEASE_MANAGEMENT.md) - 릴리스 관리

---

## 📋 목차

1. [Semantic Versioning](#-semantic-versioning)
2. [Git 브랜치 전략](#-git-브랜치-전략)
3. [태그 관리](#-태그-관리)
4. [릴리스 프로세스](#-릴리스-프로세스)
5. [Changelog 관리](#-changelog-관리)
6. [API 버전 관리](#-api-버전-관리)

---

## 📌 Semantic Versioning

### 버전 형식

```
MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]

예시:
  1.0.0
  2.1.3
  1.0.0-alpha.1
  1.0.0-beta.2
  1.0.0-rc.1
  2.0.0+build.1234
```

### 버전 증가 규칙

```
┌─────────────────────────────────────────────────────────────┐
│                  Semantic Versioning 규칙                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  MAJOR (주 버전)                                             │
│  ├─ 하위 호환되지 않는 API 변경                               │
│  └─ 예: 1.9.0 → 2.0.0                                       │
│                                                             │
│  MINOR (부 버전)                                             │
│  ├─ 하위 호환되는 새 기능 추가                                │
│  └─ 예: 1.0.9 → 1.1.0                                       │
│                                                             │
│  PATCH (수 버전)                                             │
│  ├─ 하위 호환되는 버그 수정                                   │
│  └─ 예: 1.0.0 → 1.0.1                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 버전 변경 예시

| 변경 유형 | 버전 변화 | 예시 |
|-----------|-----------|------|
| Breaking API 변경 | MAJOR | 1.2.3 → 2.0.0 |
| 새 기능 추가 | MINOR | 1.2.3 → 1.3.0 |
| 버그 수정 | PATCH | 1.2.3 → 1.2.4 |
| 보안 패치 | PATCH | 1.2.3 → 1.2.4 |
| 문서 수정 | 변경 없음 | 1.2.3 → 1.2.3 |
| 내부 리팩토링 | PATCH | 1.2.3 → 1.2.4 |

### Pre-release 버전

| 단계 | 형식 | 설명 |
|------|------|------|
| Alpha | `1.0.0-alpha.1` | 초기 개발, 불안정 |
| Beta | `1.0.0-beta.1` | 기능 완료, 테스트 중 |
| RC | `1.0.0-rc.1` | 릴리스 후보, 최종 테스트 |

### 버전 우선순위

```
0.9.0 < 1.0.0-alpha < 1.0.0-alpha.1 < 1.0.0-beta
< 1.0.0-beta.2 < 1.0.0-rc.1 < 1.0.0 < 1.0.1
```

---

## 🌳 Git 브랜치 전략

### 브랜치 구조

```
                    ┌─────────────────────────────────────┐
                    │             BRANCHES                 │
                    └─────────────────────────────────────┘

    main ─────●─────────●─────────●─────────●───────────▶
              │         │         │         │
              │    v1.0.0    v1.1.0    v1.2.0
              │         │         │         │
              │         │         │         │
  develop ────●────●────●────●────●────●────●────●──────▶
                   │              │              │
                   │              │              │
  feature ─────────●──────────────●              │
                                                 │
  release ───────────────────────────────────────●──────▶
                                            v1.2.0-rc.1

  hotfix ──────────────────────●───────────────────────▶
                           v1.1.1
```

### 브랜치 역할

| 브랜치 | 목적 | 수명 | 병합 대상 |
|--------|------|------|-----------|
| `main` | 프로덕션 코드 | 영구 | - |
| `develop` | 개발 통합 | 영구 | main |
| `feature/*` | 기능 개발 | 임시 | develop |
| `release/*` | 릴리스 준비 | 임시 | main, develop |
| `hotfix/*` | 긴급 수정 | 임시 | main, develop |

### 브랜치 보호 규칙

#### main 브랜치
```yaml
protection_rules:
  - require_pull_request_reviews: true
    required_approving_review_count: 2
  - require_status_checks: true
    required_status_checks:
      - ci/build
      - ci/test
      - security/scan
  - require_linear_history: true
  - restrict_push: true
  - allow_force_push: false
  - allow_deletions: false
```

#### develop 브랜치
```yaml
protection_rules:
  - require_pull_request_reviews: true
    required_approving_review_count: 1
  - require_status_checks: true
  - allow_force_push: false
```

---

## 🏷️ 태그 관리

### 태그 명명 규칙

```bash
# 릴리스 태그
v1.0.0
v1.1.0
v2.0.0

# Pre-release 태그
v1.0.0-alpha.1
v1.0.0-beta.1
v1.0.0-rc.1
```

### 태그 생성

```bash
# 릴리스 태그 생성
git tag -a v1.0.0 -m "Release v1.0.0: Initial release"

# 특정 커밋에 태그
git tag -a v1.0.0 9fceb02 -m "Release v1.0.0"

# 태그 푸시
git push origin v1.0.0

# 모든 태그 푸시
git push origin --tags
```

### Annotated vs Lightweight 태그

| 유형 | 사용 시점 | 예시 |
|------|-----------|------|
| Annotated | 릴리스 (권장) | `git tag -a v1.0.0 -m "message"` |
| Lightweight | 임시 마킹 | `git tag v1.0.0-temp` |

---

## 🚀 릴리스 프로세스

### 릴리스 플로우

```
┌─────────────────────────────────────────────────────────────┐
│                    Release Process                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Release Branch      2. Version Bump      3. Testing     │
│       생성                   버전 업데이트        QA 검증    │
│         │                      │                  │         │
│         ▼                      ▼                  ▼         │
│    ┌─────────┐          ┌─────────┐        ┌─────────┐     │
│    │release/ │─────────▶│ Update  │───────▶│  QA     │     │
│    │v1.2.0   │          │ Version │        │ Testing │     │
│    └─────────┘          └─────────┘        └─────────┘     │
│                                                  │          │
│  6. Cleanup          5. Tag & Release    4. Merge          │
│     브랜치 정리          태그 생성           main 병합       │
│         │                   │                  │            │
│         ▼                   ▼                  ▼            │
│    ┌─────────┐         ┌─────────┐       ┌─────────┐       │
│    │ Delete  │◀────────│  v1.2.0 │◀──────│  Merge  │       │
│    │ Branch  │         │  Tag    │       │ to main │       │
│    └─────────┘         └─────────┘       └─────────┘       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 상세 단계

#### 1. 릴리스 브랜치 생성

```bash
# develop에서 릴리스 브랜치 생성
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0
```

#### 2. 버전 업데이트

```bash
# package.json 버전 업데이트 (Frontend)
npm version 1.2.0 --no-git-tag-version

# pyproject.toml 버전 업데이트 (Backend)
# version = "1.2.0" 수동 수정

# CHANGELOG.md 업데이트
# 커밋
git add -A
git commit -m "chore(release): bump version to 1.2.0"
```

#### 3. QA 테스트

```bash
# 스테이징 환경 배포
make deploy-staging

# 테스트 실행
make test-all
```

#### 4. main으로 병합

```bash
# PR 생성 및 리뷰
# main으로 병합
git checkout main
git merge --no-ff release/v1.2.0
```

#### 5. 태그 생성 및 릴리스

```bash
# 태그 생성
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0

# GitHub Release 생성 (CI/CD 자동화)
```

#### 6. develop으로 역병합 및 정리

```bash
# develop으로 병합
git checkout develop
git merge --no-ff release/v1.2.0

# 릴리스 브랜치 삭제
git branch -d release/v1.2.0
git push origin --delete release/v1.2.0
```

### 핫픽스 프로세스

```bash
# 1. main에서 hotfix 브랜치 생성
git checkout main
git checkout -b hotfix/v1.2.1

# 2. 버그 수정 및 버전 업데이트
# ... 수정 작업 ...
git commit -m "fix(auth): resolve critical security vulnerability"

# 3. main으로 병합 및 태그
git checkout main
git merge --no-ff hotfix/v1.2.1
git tag -a v1.2.1 -m "Hotfix v1.2.1"

# 4. develop으로 역병합
git checkout develop
git merge --no-ff hotfix/v1.2.1

# 5. 브랜치 삭제
git branch -d hotfix/v1.2.1
```

---

## 📝 Changelog 관리

### CHANGELOG.md 형식

```markdown
# Changelog

이 프로젝트의 모든 주요 변경사항이 이 파일에 기록됩니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 기반으로 하며,
이 프로젝트는 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

## [Unreleased]

### Added
- 새로운 기능

### Changed
- 기존 기능 변경

### Deprecated
- 곧 제거될 기능

### Removed
- 제거된 기능

### Fixed
- 버그 수정

### Security
- 보안 취약점 수정

## [1.2.0] - 2025-11-25

### Added
- 사용자 프로필 이미지 업로드 기능 추가 (#123)
- Google OAuth 로그인 지원 (#124)

### Changed
- 비디오 플레이어 UI 개선 (#125)

### Fixed
- 로그인 시 세션 만료 오류 수정 (#126)

## [1.1.0] - 2025-11-01

### Added
- AI 자막 번역 기능 (한→스페인어) (#100)
- 콘텐츠 검색 기능 (#101)

### Security
- JWT 토큰 만료 시간 단축 (#102)

## [1.0.0] - 2025-10-15

### Added
- 초기 릴리스
- 사용자 인증 시스템
- 콘텐츠 스트리밍
- 기본 UI
```

### Changelog 작성 규칙

1. **최신 버전이 위에**: 역순으로 기록
2. **날짜 포함**: ISO 8601 형식 (YYYY-MM-DD)
3. **이슈/PR 링크**: 관련 이슈나 PR 번호 포함
4. **사용자 관점**: 기술적 세부사항보다 변경 영향 중심
5. **카테고리 분류**: Added, Changed, Fixed 등으로 분류

### 자동화

```yaml
# .github/workflows/release.yml
- name: Generate Changelog
  uses: conventional-changelog/standard-version@v1
  with:
    skip:
      commit: true
      tag: true
```

---

## 🔌 API 버전 관리

### URL 기반 버전 관리

```
https://api.hallyulatino.com/v1/users
https://api.hallyulatino.com/v2/users
```

### 버전 관리 전략

```python
# src/backend/app/api/v1/router.py
from fastapi import APIRouter

router_v1 = APIRouter(prefix="/v1")

@router_v1.get("/users/{user_id}")
async def get_user_v1(user_id: int):
    """V1 API: 사용자 조회"""
    return {"id": user_id, "version": "v1"}


# src/backend/app/api/v2/router.py
router_v2 = APIRouter(prefix="/v2")

@router_v2.get("/users/{user_id}")
async def get_user_v2(user_id: int):
    """V2 API: 사용자 조회 (확장된 필드 포함)"""
    return {
        "id": user_id,
        "version": "v2",
        "profile": {...},
        "preferences": {...}
    }
```

### API 버전 지원 정책

| 버전 | 상태 | 지원 종료 |
|------|------|-----------|
| v2 | Current | - |
| v1 | Deprecated | 2026-06-01 |

### Deprecation 공지

```python
from fastapi import Header, HTTPException
from datetime import datetime

async def check_api_version(
    x_api_version: str = Header(default="v2")
):
    if x_api_version == "v1":
        # 응답 헤더에 경고 추가
        return {
            "X-API-Deprecation-Warning": "v1 is deprecated. Please migrate to v2 by 2026-06-01",
            "X-API-Deprecation-Date": "2026-06-01"
        }
```

---

## 📦 패키지 버전 관리

### Frontend (package.json)

```json
{
  "name": "hallyulatino-frontend",
  "version": "1.2.0",
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0"
  }
}
```

### Backend (pyproject.toml)

```toml
[project]
name = "hallyulatino-backend"
version = "1.2.0"

[project.dependencies]
fastapi = "^0.109.0"
sqlalchemy = "^2.0.0"
```

### 의존성 버전 범위

| 기호 | 의미 | 예시 |
|------|------|------|
| `^` | Minor 업데이트 허용 | `^1.2.3` → `1.x.x` |
| `~` | Patch 업데이트 허용 | `~1.2.3` → `1.2.x` |
| `>=` | 이상 | `>=1.2.3` |
| `==` | 정확히 일치 | `==1.2.3` |

---

## 🔧 버전 관리 도구

### Git Hooks

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# 버전 일관성 검사
npm run version-check
```

### Version Check Script

```python
# scripts/version_check.py
"""버전 일관성 검사 스크립트"""
import json
import toml

def check_versions():
    # package.json 버전
    with open('src/frontend/package.json') as f:
        fe_version = json.load(f)['version']

    # pyproject.toml 버전
    with open('src/backend/pyproject.toml') as f:
        be_version = toml.load(f)['project']['version']

    # CHANGELOG.md 최신 버전
    # ... 파싱 로직 ...

    if fe_version != be_version:
        raise ValueError(f"Version mismatch: FE={fe_version}, BE={be_version}")

    print(f"✅ Version check passed: {fe_version}")

if __name__ == "__main__":
    check_versions()
```

---

## 📊 버전 관리 체크리스트

### 릴리스 전 체크리스트

- [ ] 모든 테스트 통과
- [ ] CHANGELOG.md 업데이트
- [ ] 버전 번호 업데이트 (모든 파일)
- [ ] API 문서 업데이트
- [ ] Breaking Changes 문서화
- [ ] Deprecation 경고 추가 (해당 시)
- [ ] 릴리스 노트 작성

### 릴리스 후 체크리스트

- [ ] Git 태그 생성
- [ ] GitHub Release 발행
- [ ] 프로덕션 배포 완료
- [ ] 모니터링 확인
- [ ] 공지사항 발행 (필요 시)

---

*이 가이드는 프로젝트의 안정적인 버전 관리를 위해 지속적으로 업데이트됩니다.*
