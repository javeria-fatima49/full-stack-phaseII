"""
Pydantic schemas for authentication request/response validation.
"""

from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from uuid import UUID
from typing import Optional


class UserSignup(BaseModel):
    """Schema for user registration"""
    email: EmailStr = Field(
        description="User email address"
    )
    password: str = Field(
        min_length=8,
        max_length=100,
        description="User password (8-100 characters)"
    )
    name: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Optional user display name"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "securepassword123",
                "name": "John Doe"
            }
        }


class UserSignin(BaseModel):
    """Schema for user login"""
    email: EmailStr = Field(
        description="User email address"
    )
    password: str = Field(
        description="User password"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "securepassword123"
            }
        }


class UserResponse(BaseModel):
    """Schema for user response (without password)"""
    id: UUID
    email: str
    name: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "email": "user@example.com",
                "name": "John Doe",
                "created_at": "2026-01-07T10:00:00Z",
                "updated_at": "2026-01-07T10:00:00Z"
            }
        }


class AuthResponse(BaseModel):
    """Schema for authentication response with token"""
    token: str = Field(
        description="JWT access token"
    )
    user: UserResponse = Field(
        description="Authenticated user information"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "user": {
                    "id": "550e8400-e29b-41d4-a716-446655440000",
                    "email": "user@example.com",
                    "name": "John Doe",
                    "created_at": "2026-01-07T10:00:00Z",
                    "updated_at": "2026-01-07T10:00:00Z"
                }
            }
        }


class MessageResponse(BaseModel):
    """Schema for simple message responses"""
    message: str = Field(
        description="Response message"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "message": "Operation successful"
            }
        }
