---
title: HallyuLatino 문서 인덱스
version: 1.1.0
status: Active
owner: @hallyulatino-team
created: 2025-11-25
updated: 2025-11-26
language: Korean (한국어)
---

# HallyuLatino 문서 인덱스

> 모든 프로젝트 문서에 대한 네비게이션 허브

---

## 루트 문서

| 문서 | 설명 | 대상 독자 |
|------|------|-----------|
| [CONTEXT.md](../CONTEXT.md) | 프로젝트 Single Source of Truth | 전체 팀 |
| [README.md](../README.md) | 프로젝트 소개 및 빠른 시작 | 신규 개발자 |
| [ENVIRONMENT.md](../ENVIRONMENT.md) | 개발 환경 설정 가이드 | 개발자 |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | 기여 가이드라인 | 기여자 |

---

## 기술 스펙 (docs/specs/)

| 문서 | 설명 | 상태 |
|------|------|------|
| [PRD.md](./specs/PRD.md) | 제품 요구사항 문서 | Draft |
| [ARCHITECTURE.md](./specs/ARCHITECTURE.md) | 시스템 아키텍처 설계 | Draft |
| [API_SPEC.md](./specs/API_SPEC.md) | REST API 명세 | Draft |
| [DATA_MODEL.md](./specs/DATA_MODEL.md) | 데이터베이스 스키마 및 ERD | Draft |

### ADRs (Architecture Decision Records)

| 문서 | 제목 | 상태 |
|------|------|------|
| [ADR-0000](./specs/ADRs/ADR-0000-template.md) | ADR 템플릿 | Template |
| [ADR-0001](./specs/ADRs/ADR-0001-tech-stack.md) | 기술 스택 선정 | Accepted |
| [ADR-0002](./specs/ADRs/ADR-0002-tech-stack-optimization.md) | 기술 스택 최적화 | Accepted |

---

## 개발 가이드 (docs/guides/)

| 문서 | 설명 | 상태 |
|------|------|------|
| [TDD_GUIDE.md](./guides/TDD_GUIDE.md) | TDD 개발 사이클 가이드 | Active |
| [CODE_REVIEW_GUIDE.md](./guides/CODE_REVIEW_GUIDE.md) | 코드 리뷰 체크리스트 | Active |
| [VERSIONING_GUIDE.md](./guides/VERSIONING_GUIDE.md) | 버전 관리 규칙 | Active |

---

## 개발 계획 (docs/)

| 문서 | 설명 | 상태 |
|------|------|------|
| [plan.md](./plan.md) | TDD 개발 계획 및 진행 상황 | Active |

---

## 비즈니스 문서 (docs/business/)

| 문서 | 설명 | 상태 |
|------|------|------|
| PRODUCT_VISION.md | 제품 비전 및 North Star | Planned |
| COST_MODEL.md | 비용 구조 및 수익 모델 | Planned |
| ROLLOUT_STRATEGY.md | 런칭 전략 | Planned |

---

## 운영 문서 (docs/operations/)

| 문서 | 설명 | 상태 |
|------|------|------|
| [DEPLOYMENT_CHECKLIST.md](./operations/DEPLOYMENT_CHECKLIST.md) | 배포 체크리스트 | Active |

---

## 빠른 링크

### 개발자용

- [빠른 시작](../README.md#-빠른-시작)
- [환경 설정](../ENVIRONMENT.md)
- [기여하기](../CONTRIBUTING.md)
- [TDD 가이드](./guides/TDD_GUIDE.md)
- [코드 리뷰 가이드](./guides/CODE_REVIEW_GUIDE.md)

### API 참조

- [API 명세](./specs/API_SPEC.md)
- [데이터 모델](./specs/DATA_MODEL.md)
- [시스템 아키텍처](./specs/ARCHITECTURE.md)

### 운영

- [배포 체크리스트](./operations/DEPLOYMENT_CHECKLIST.md)

---

## 문서 상태 범례

| 상태 | 설명 |
|------|------|
| **Active** | 승인됨, 사용 가능 |
| **Draft** | 초안, 검토 필요 |
| **Review** | 검토 중 |
| **Planned** | 작성 예정 |
| **Deprecated** | 사용 중단 예정 |

---

## 문서 업데이트 가이드

1. 문서 수정 시 상단 메타데이터의 `updated` 날짜 업데이트
2. 변경 이력(Changelog) 섹션에 변경 내용 추가
3. 관련 문서 간 링크 확인 및 업데이트
4. PR 생성하여 리뷰 요청

---

*마지막 업데이트: 2025-11-26*
