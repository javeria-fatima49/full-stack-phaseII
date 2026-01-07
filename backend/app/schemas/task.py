"""
Pydantic schemas for task request/response validation.
"""

from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from typing import Optional


class TaskCreate(BaseModel):
    """Schema for creating a new task"""
    title: str = Field(
        min_length=1,
        max_length=200,
        description="Task title (1-200 characters)"
    )
    description: Optional[str] = Field(
        default=None,
        max_length=1000,
        description="Optional task description (max 1000 characters)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Complete project documentation",
                "description": "Write comprehensive docs for the API"
            }
        }


class TaskUpdate(BaseModel):
    """Schema for updating an existing task (all fields optional)"""
    title: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=200,
        description="Updated task title"
    )
    description: Optional[str] = Field(
        default=None,
        max_length=1000,
        description="Updated task description"
    )
    completed: Optional[bool] = Field(
        default=None,
        description="Updated completion status"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Updated title",
                "description": "Updated description",
                "completed": True
            }
        }


class TaskResponse(BaseModel):
    """Schema for task response"""
    id: UUID
    title: str
    description: Optional[str]
    completed: bool
    created_at: datetime
    updated_at: datetime
    user_id: str

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "title": "Complete project documentation",
                "description": "Write comprehensive docs for the API",
                "completed": False,
                "created_at": "2026-01-07T10:00:00Z",
                "updated_at": "2026-01-07T10:00:00Z",
                "user_id": "user-123"
            }
        }
