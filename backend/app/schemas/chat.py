"""
Chat API Schemas for Phase 3 AI Chatbot.

Defines request and response schemas for the chat endpoint.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from uuid import UUID


class ToolCall(BaseModel):
    """Schema for tool call information"""
    tool: str = Field(..., description="Name of the MCP tool called")
    parameters: Dict[str, Any] = Field(..., description="Parameters passed to the tool")
    result: Dict[str, Any] = Field(..., description="Result returned by the tool")


class ChatRequest(BaseModel):
    """
    Request schema for chat endpoint.

    Represents a user message sent to the AI chatbot.
    """
    message: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="User's message content"
    )
    conversation_id: Optional[str] = Field(
        None,
        description="Existing conversation ID (optional, creates new if not provided)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "message": "Add buy groceries to my list",
                "conversation_id": "550e8400-e29b-41d4-a716-446655440000"
            }
        }


class ChatResponse(BaseModel):
    """
    Response schema for chat endpoint.

    Contains the assistant's response and conversation metadata.
    """
    success: bool = Field(..., description="Whether the request was successful")
    conversation_id: str = Field(..., description="Conversation identifier")
    response: str = Field(..., description="Assistant's response message")
    tool_calls: List[ToolCall] = Field(
        default_factory=list,
        description="List of MCP tools called during processing"
    )
    error: Optional[str] = Field(
        None,
        description="Error message if request failed"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
                "response": "I've added 'buy groceries' to your task list.",
                "tool_calls": [
                    {
                        "tool": "add_task",
                        "parameters": {"title": "buy groceries"},
                        "result": {"success": True, "task": {"id": "...", "title": "buy groceries"}}
                    }
                ]
            }
        }


class ConversationHistoryResponse(BaseModel):
    """
    Response schema for conversation history endpoint.

    Contains full conversation history with all messages.
    """
    success: bool = Field(..., description="Whether the request was successful")
    conversation_id: str = Field(..., description="Conversation identifier")
    messages: List[Dict[str, str]] = Field(
        ...,
        description="List of messages with role and content"
    )
    created_at: str = Field(..., description="Conversation creation timestamp")
    updated_at: str = Field(..., description="Last update timestamp")
    error: Optional[str] = Field(
        None,
        description="Error message if request failed"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
                "messages": [
                    {"role": "user", "content": "Add buy groceries"},
                    {"role": "assistant", "content": "I've added 'buy groceries' to your list."}
                ],
                "created_at": "2026-01-16T10:00:00Z",
                "updated_at": "2026-01-16T10:05:00Z"
            }
        }
