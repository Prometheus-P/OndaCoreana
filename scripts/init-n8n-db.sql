-- ═══════════════════════════════════════════════════════════════
-- n8n 데이터베이스 초기화
-- ═══════════════════════════════════════════════════════════════

-- n8n 전용 데이터베이스 생성
CREATE DATABASE n8n;

-- 코멘트
COMMENT ON DATABASE n8n IS 'n8n 워크플로우 자동화 데이터베이스';

SELECT 'n8n database initialized successfully' AS status;
