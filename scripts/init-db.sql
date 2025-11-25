-- ═══════════════════════════════════════════════════════════════
-- HallyuLatino 데이터베이스 초기화 스크립트
-- ═══════════════════════════════════════════════════════════════

-- 확장 모듈 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";  -- pgvector for AI recommendations

-- 코멘트
COMMENT ON DATABASE hallyulatino IS 'HallyuLatino 메인 데이터베이스';

-- 초기 테이블 생성은 Alembic 마이그레이션으로 관리됩니다.
-- 이 스크립트는 확장 모듈 활성화 및 초기 설정만 담당합니다.

-- 개발 환경용 테스트 데이터는 별도의 seed 스크립트로 관리합니다.

SELECT 'HallyuLatino database initialized successfully' AS status;
