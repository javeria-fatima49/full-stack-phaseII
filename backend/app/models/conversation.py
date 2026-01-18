"""
SQLModel Conversation model for database table definition.
Phase 3: AI Chatbot - Conversation persistence
"""

from sqlmodel import SQLModel, Field
from datetime import datetime
from uuid import UUID, uuid4
from typing import Optional


class Conversation(SQLModel, table=True):
    """
    SQLModel representation of a conversation session.

    Stores chat sessions between users and the AI assistant.
    Each conversation contains multiple messages.
    """
    __tablename__ = "conversations"

    # Primary key
    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        nullable=False,
        description="Unique conversation identifier"
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
        description="Conversation creation timestamp (UTC)"
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
                "user_id": "user-123",
                "created_at": "2026-01-16T10:00:00Z",
                "updated_at": "2026-01-16T10:00:00Z"
            }
        }
