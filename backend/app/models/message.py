"""
SQLModel Message model for database table definition.
Phase 3: AI Chatbot - Message persistence
"""

from sqlmodel import SQLModel, Field
from datetime import datetime
from uuid import UUID, uuid4
from enum import Enum


class MessageRole(str, Enum):
    """
    Message role enumeration.

    Defines who sent the message in a conversation.
    """
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class Message(SQLModel, table=True):
    """
    SQLModel representation of a conversation message.

    Stores individual messages within a conversation.
    Each message has a role (user/assistant/system) and content.
    """
    __tablename__ = "messages"

    # Primary key
    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        nullable=False,
        description="Unique message identifier"
    )

    # Foreign key to conversation
    conversation_id: UUID = Field(
        nullable=False,
        foreign_key="conversations.id",
        index=True,
        description="Reference to parent conversation"
    )

    # User association (denormalized for query efficiency)
    user_id: str = Field(
        max_length=255,
        nullable=False,
        index=True,
        description="User identifier from JWT token"
    )

    # Message content
    role: MessageRole = Field(
        nullable=False,
        description="Message sender role (user/assistant/system)"
    )

    content: str = Field(
        nullable=False,
        description="Message text content"
    )

    # Timestamp
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Message creation timestamp (UTC)"
    )

    class Config:
        """Pydantic configuration"""
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "conversation_id": "660e8400-e29b-41d4-a716-446655440000",
                "user_id": "user-123",
                "role": "user",
                "content": "Add buy groceries to my list",
                "created_at": "2026-01-16T10:00:00Z"
            }
        }
