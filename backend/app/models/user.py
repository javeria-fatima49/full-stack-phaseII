"""
SQLModel User model for database table definition.
"""

from sqlmodel import SQLModel, Field
from datetime import datetime
from uuid import UUID, uuid4
from typing import Optional


class User(SQLModel, table=True):
    """
    SQLModel representation of a user.

    This model serves dual purposes:
    1. Database table definition (via table=True)
    2. Pydantic schema for validation and serialization
    """
    __tablename__ = "users"

    # Primary key
    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        nullable=False,
        description="Unique user identifier"
    )

    # User credentials
    email: str = Field(
        max_length=255,
        nullable=False,
        unique=True,
        index=True,
        description="User email address (unique, indexed)"
    )

    password_hash: str = Field(
        max_length=255,
        nullable=False,
        description="Bcrypt hashed password"
    )

    # User profile
    name: Optional[str] = Field(
        default=None,
        max_length=255,
        nullable=True,
        description="Optional user display name"
    )

    # Timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="User registration timestamp (UTC)"
    )

    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Last update timestamp (UTC)"
    )

    class Config:
        """Pydantic configuration"""
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "email": "user@example.com",
                "name": "John Doe",
                "created_at": "2026-01-07T10:00:00Z",
                "updated_at": "2026-01-07T10:00:00Z"
            }
        }
