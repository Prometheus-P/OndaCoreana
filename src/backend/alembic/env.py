"""Alembic Environment Configuration."""

import os
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

# Alembic Config 객체
config = context.config

# 로깅 설정
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# 환경변수에서 DATABASE_URL 가져오기
database_url = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/hallyulatino"
)
config.set_main_option("sqlalchemy.url", database_url)

# 메타데이터 (Supabase 사용으로 실제 SQLAlchemy 모델 없음)
target_metadata = None


def run_migrations_offline() -> None:
    """오프라인 모드 마이그레이션 실행.

    SQL 스크립트만 생성하고 실제 DB 연결은 하지 않습니다.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """온라인 모드 마이그레이션 실행.

    실제 DB에 연결하여 마이그레이션을 실행합니다.
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
