"""Create users table

Revision ID: 001
Revises:
Create Date: 2025-11-25
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create users table."""
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(255), nullable=True),
        sa.Column("nickname", sa.String(50), nullable=False),
        sa.Column("country", sa.String(2), nullable=False),
        sa.Column(
            "preferred_language",
            sa.String(2),
            nullable=False,
            server_default="es",
        ),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("is_verified", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("role", sa.String(20), nullable=False, server_default="user"),
        sa.Column("avatar_url", sa.String(500), nullable=True),
        sa.Column("oauth_provider", sa.String(50), nullable=True),
        sa.Column("oauth_id", sa.String(255), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )

    # 인덱스 생성
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_oauth", "users", ["oauth_provider", "oauth_id"])
    op.create_index("ix_users_created_at", "users", ["created_at"])


def downgrade() -> None:
    """Drop users table."""
    op.drop_index("ix_users_created_at", table_name="users")
    op.drop_index("ix_users_oauth", table_name="users")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
