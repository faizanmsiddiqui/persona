"""Use timestamps instead of incremental save versions."""

from alembic import op
import sqlalchemy as sa

revision = "0004"
down_revision = "0003"


def upgrade() -> None:
    op.drop_column("resume_versions", "version")
    op.drop_column("resumes", "version")


def downgrade() -> None:
    op.add_column(
        "resumes",
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
    )
    op.add_column(
        "resume_versions",
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
    )
