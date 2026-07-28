"""Initial Persona tables."""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001"
down_revision = None

def upgrade() -> None:
    op.create_table("users", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("email", sa.String(320), nullable=False, unique=True), sa.Column("password_hash", sa.Text(), nullable=False), sa.Column("display_name", sa.String(120), nullable=False, server_default=""), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_table("resumes", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("owner_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False), sa.Column("title", sa.String(160), nullable=False), sa.Column("document", postgresql.JSONB(), nullable=False), sa.Column("version", sa.Integer(), nullable=False, server_default="1"), sa.Column("share_slug", sa.String(48), unique=True), sa.Column("is_public", sa.Boolean(), nullable=False, server_default=sa.false()), sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_table("resume_versions", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("resume_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False), sa.Column("version", sa.Integer(), nullable=False), sa.Column("document", postgresql.JSONB(), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()))

def downgrade() -> None:
    op.drop_table("resume_versions"); op.drop_table("resumes"); op.drop_table("users")
