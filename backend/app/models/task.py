"""
SQLModel Task model for database table definition.
"""

from sqlmodel import SQLModel, Field
from datetime import datetime
from uuid import UUID, uuid4
from typing import Optional


class Task(SQLModel, table=True):
    """
    SQLModel representation of a task.

    This model serves dual purposes:
    1. Database table definition (via table=True)
    2. Pydantic schema for validation and serialization
    """
    __tablename__ = "tasks"

    # Primary key
    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        nullable=False,
        description="Unique task identifier"
    )

    # Task content
    title: str = Field(
        min_length=1,
        max_length=200,
        nullable=False,
        description="Task title (1-200 characters)"
    )

    description: Optional[str] = Field(
        default=None,
        max_length=1000,
        nullable=True,
        description="Optional task description (max 1000 characters)"
    )

    # Status
    completed: bool = Field(
        default=False,
        nullable=False,
        description="Task completion status"
    )

    # User association
    user_id: str = Field(
        max_length=255,
        nullable=False,
        index=True,
        description="User identifier from JWT token"
    )

    # Timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Task creation timestamp (UTC)"
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
                "title": "Complete project documentation",
                "description": "Write comprehensive docs for the API",
                "completed": False,
                "user_id": "user-123",
                "created_at": "2026-01-07T10:00:00Z",
                "updated_at": "2026-01-07T10:00:00Z"
            }
        }
