"""
Chat API Endpoint for Phase 3 AI Chatbot.

Provides conversational interface for task management via natural language.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import Optional
from uuid import UUID

from app.database import get_session
from app.schemas.chat import ChatRequest, ChatResponse, ConversationHistoryResponse
from app.agents import ConversationAgent
from app.api.deps import get_current_user_id


router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/{user_id}/chat", response_model=ChatResponse)
async def chat(
    user_id: str,
    request: ChatRequest,
    session: AsyncSession = Depends(get_session),
    authenticated_user_id: str = Depends(get_current_user_id)
):
    """
    Process a chat message from the user.

    This endpoint:
    1. Verifies user authentication via JWT token
    2. Creates or retrieves conversation
    3. Processes message with ConversationAgent
    4. Returns assistant response with conversation metadata

    Args:
        user_id: User identifier from URL path
        request: ChatRequest with message and optional conversation_id
        session: Database session (injected)
        authenticated_user_id: User ID from JWT token (injected)

    Returns:
        ChatResponse with assistant message and conversation metadata

    Raises:
        HTTPException: 401 if user_id doesn't match JWT token
        HTTPException: 500 if processing fails
    """
    # Verify user_id matches JWT token (security check)
    if user_id != authenticated_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID mismatch"
        )

    try:
        # Parse conversation_id if provided
        conversation_id = None
        if request.conversation_id:
            try:
                conversation_id = UUID(request.conversation_id)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid conversation_id format"
                )

        # Initialize ConversationAgent
        agent = ConversationAgent()

        # Process chat message
        result = await agent.process_chat_message(
            user_id=user_id,
            user_message=request.message,
            conversation_id=conversation_id,
            session=session
        )

        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.get("error", "Failed to process message")
            )

        return ChatResponse(
            success=True,
            conversation_id=result["conversation_id"],
            response=result["response"],
            tool_calls=result.get("tool_calls", [])
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/{user_id}/conversations/{conversation_id}", response_model=ConversationHistoryResponse)
async def get_conversation_history(
    user_id: str,
    conversation_id: str,
    session: AsyncSession = Depends(get_session),
    authenticated_user_id: str = Depends(get_current_user_id)
):
    """
    Retrieve conversation history.

    Args:
        user_id: User identifier from URL path
        conversation_id: Conversation identifier
        session: Database session (injected)
        authenticated_user_id: User ID from JWT token (injected)

    Returns:
        ConversationHistoryResponse with all messages

    Raises:
        HTTPException: 401 if user_id doesn't match JWT token
        HTTPException: 404 if conversation not found
        HTTPException: 500 if retrieval fails
    """
    # Verify user_id matches JWT token
    if user_id != authenticated_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID mismatch"
        )

    try:
        # Parse conversation_id
        try:
            conv_uuid = UUID(conversation_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid conversation_id format"
            )

        # Initialize ConversationAgent
        agent = ConversationAgent()

        # Get conversation history
        result = await agent.get_conversation_history(
            user_id=user_id,
            conversation_id=conv_uuid,
            session=session
        )

        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )

        return ConversationHistoryResponse(
            success=True,
            conversation_id=result["conversation_id"],
            messages=result["messages"],
            created_at=result["created_at"],
            updated_at=result["updated_at"]
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )
