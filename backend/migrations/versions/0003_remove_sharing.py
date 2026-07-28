"""Remove public résumé sharing."""

from alembic import op
import sqlalchemy as sa

revision = "0003"
down_revision = "0002"


def upgrade() -> None:
    op.drop_index("ix_resumes_public_share", table_name="resumes")
    op.drop_column("resumes", "is_public")
    op.drop_column("resumes", "share_slug")


def downgrade() -> None:
    op.add_column("resumes", sa.Column("share_slug", sa.String(48), nullable=True))
    op.add_column(
        "resumes",
        sa.Column("is_public", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.create_index(
        "ix_resumes_public_share",
        "resumes",
        ["share_slug"],
        unique=True,
        postgresql_where=sa.text("is_public = true"),
    )
