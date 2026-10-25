"""initial schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-10-25 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. users
    op.create_table(
        'users',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('email', sa.String(length=255), nullable=False, unique=True),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=20), nullable=False, server_default='candidate'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('email_verified_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_login_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )

    # 2. refresh_tokens
    op.create_table(
        'refresh_tokens',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('user_id', sa.String(length=36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('token_hash', sa.String(length=64), nullable=False, unique=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('revoked_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('user_agent', sa.String(length=500), nullable=True),
        sa.Column('ip_address', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )

    # 3. skills
    op.create_table(
        'skills',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('canonical_name', sa.String(length=100), nullable=False, unique=True),
        sa.Column('normalized_key', sa.String(length=100), nullable=False, unique=True),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )

    # 4. career_roles
    op.create_table(
        'career_roles',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('slug', sa.String(length=100), nullable=False, unique=True),
        sa.Column('title', sa.String(length=150), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('experience_level', sa.String(length=50), nullable=False, server_default='entry'),
        sa.Column('responsibilities', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )

    # 5. candidate_profiles
    op.create_table(
        'candidate_profiles',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('user_id', sa.String(length=36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('full_name', sa.String(length=200), nullable=False),
        sa.Column('headline', sa.String(length=300), nullable=True),
        sa.Column('phone', sa.String(length=30), nullable=True),
        sa.Column('linkedin_url', sa.String(length=500), nullable=True),
        sa.Column('github_url', sa.String(length=500), nullable=True),
        sa.Column('education_summary', sa.Text(), nullable=True),
        sa.Column('experience_level', sa.String(length=20), nullable=False, server_default='entry'),
        sa.Column('target_salary', sa.String(length=100), nullable=True),
        sa.Column('target_role_id', sa.String(length=36), sa.ForeignKey('career_roles.id', ondelete='SET NULL'), nullable=True),
        sa.Column('work_mode', sa.String(length=20), nullable=False, server_default='hybrid'),
        sa.Column('preferred_locations', sa.Text(), nullable=True),
        sa.Column('career_goal', sa.Text(), nullable=True),
        sa.Column('target_roles_json', sa.Text(), nullable=True),
        sa.Column('onboarding_completed', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )


def downgrade() -> None:
    op.drop_table('candidate_profiles')
    op.drop_table('career_roles')
    op.drop_table('skills')
    op.drop_table('refresh_tokens')
    op.drop_table('users')
