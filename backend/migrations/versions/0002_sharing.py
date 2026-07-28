"""Index public share lookups."""
from alembic import op

revision = "0002"
down_revision = "0001"

def upgrade() -> None:
    op.create_index("ix_resumes_public_share", "resumes", ["share_slug"], unique=True, postgresql_where="is_public = true")

def downgrade() -> None:
    op.drop_index("ix_resumes_public_share", table_name="resumes")
