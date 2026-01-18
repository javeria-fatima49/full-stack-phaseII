"""
ConversationAgent for Phase 3 AI Chatbot.

Manages conversation history, persists messages, and coordinates with TaskManagerAgent.
This agent is stateless and fetches conversation context from the database.
"""

from typing import Dict, Any, Optional, List
from uuid import UUID
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from app.models import Conversation, Message, MessageRole
from app.agents.task_manager_agent import TaskManagerAgent
from datetime import datetime


class ConversationAgent:
    """
    AI agent that manages conversation context and persistence.

    Coordinates with TaskManagerAgent for task-related operations.
    Handles conversation history fetching and message persistence.
    """

    def __init__(self):
        """Initialize ConversationAgent with TaskManagerAgent"""
        self.task_manager = TaskManagerAgent()

    async def process_chat_message(
        self,
        user_id: str,
        user_message: str,
        conversation_id: Optional[UUID],
        session: AsyncSession
    ) -> Dict[str, Any]:
        """
        Process a chat message from the user.

        CRITICAL: This method maintains proper async context for the session.
        Cohere API calls happen in TaskManagerAgent without touching the session.

        Args:
            user_id: User identifier from JWT token
            user_message: User's message content
            conversation_id: Existing conversation ID (optional)
            session: Database session

        Returns:
            Dict with assistant response and conversation metadata
        """
        try:
            # Get or create conversation
            conversation = await self._get_or_create_conversation(
                user_id=user_id,
                conversation_id=conversation_id,
                session=session
            )

            # CRITICAL: Flush immediately to ensure conversation.id is loaded
            await session.flush()
            await session.refresh(conversation)

            # CRITICAL: Extract conversation_id as plain UUID to avoid lazy loading issues
            conv_id = conversation.id

            # Fetch conversation history
            history = await self._fetch_conversation_history(
                conversation_id=conv_id,
                session=session
            )

            # Persist user message
            await self._persist_message(
                conversation_id=conv_id,
                user_id=user_id,
                role=MessageRole.USER,
                content=user_message,
                session=session
            )

            # Flush to persist user message
            await session.flush()

            # CRITICAL: Ensure conversation object is fully loaded
            # This prevents lazy loading during later operations
            await session.refresh(conversation)

            # Process message with TaskManagerAgent (NO session passed)
            # CRITICAL: Cohere API calls happen here without session access
            # The history is already plain dicts, so no lazy loading can occur
            agent_response = await self.task_manager.process_message(
                user_message=user_message,
                conversation_history=history,
                user_id=user_id
            )

            if not agent_response.get("success"):
                # Error in agent processing
                assistant_message = agent_response.get("response", "I'm sorry, I couldn't process that.")
                await self._persist_message(
                    conversation_id=conv_id,
                    user_id=user_id,
                    role=MessageRole.ASSISTANT,
                    content=assistant_message,
                    session=session
                )
                conversation.updated_at = datetime.utcnow()
                await session.commit()

                return {
                    "success": False,
                    "conversation_id": str(conv_id),
                    "response": assistant_message,
                    "error": agent_response.get("error")
                }

            # Check if tools need to be executed
            if agent_response.get("needs_tool_execution"):
                # Execute tools with proper session context
                tool_calls = agent_response.get("tool_calls", [])
                tool_results = []

                for tool_call in tool_calls:
                    tool_name = tool_call["name"]
                    tool_params = tool_call["parameters"]

                    # Import tool registry
                    from app.mcp import TOOL_REGISTRY

                    # Execute MCP tool with session in proper async context
                    handler = TOOL_REGISTRY.get(tool_name)
                    if handler:
                        result = await handler(
                            user_id=user_id,
                            session=session,
                            **tool_params
                        )
                        # Validate tool result - ensure it's a dict with at least success field
                        if result is None:
                            result = {
                                "success": False,
                                "message": f"Tool {tool_name} returned None",
                                "error": "Tool execution failed"
                            }
                        elif not isinstance(result, dict):
                            result = {
                                "success": False,
                                "message": f"Tool {tool_name} returned invalid format",
                                "error": "Invalid tool response"
                            }
                        elif "success" not in result:
                            # Add success field if missing
                            result["success"] = True

                        tool_results.append(result)
                    else:
                        # Handler not found
                        tool_results.append({
                            "success": False,
                            "message": f"Tool {tool_name} not found",
                            "error": "Unknown tool"
                        })

                # Flush after tool execution
                await session.flush()

                # CRITICAL: Refresh conversation object to ensure it's in session context
                await session.refresh(conversation)

                # Validate tool_results before generating response
                if not tool_results:
                    tool_results = [{
                        "success": False,
                        "message": "No tools were executed",
                        "error": "Empty tool results"
                    }]

                # Generate final response from Cohere (NO session passed)
                assistant_message = await self.task_manager.generate_final_response(
                    user_message=user_message,
                    conversation_history=history,
                    tool_calls=tool_calls,
                    tool_results=tool_results
                )

                # Persist assistant response
                await self._persist_message(
                    conversation_id=conv_id,
                    user_id=user_id,
                    role=MessageRole.ASSISTANT,
                    content=assistant_message,
                    session=session
                )

                # Update conversation timestamp and commit ALL changes at once
                conversation.updated_at = datetime.utcnow()
                await session.commit()

                return {
                    "success": True,
                    "conversation_id": str(conv_id),
                    "response": assistant_message,
                    "tool_calls": [
                        {
                            "tool": tc["name"],
                            "parameters": tc["parameters"],
                            "result": tr
                        }
                        for tc, tr in zip(tool_calls, tool_results)
                    ]
                }
            else:
                # No tool execution needed, just conversational response
                assistant_message = agent_response.get("response", "I'm sorry, I couldn't process that.")

                # Persist assistant response
                await self._persist_message(
                    conversation_id=conv_id,
                    user_id=user_id,
                    role=MessageRole.ASSISTANT,
                    content=assistant_message,
                    session=session
                )

                # Update conversation timestamp and commit ALL changes at once
                conversation.updated_at = datetime.utcnow()
                await session.commit()

                return {
                    "success": True,
                    "conversation_id": str(conv_id),
                    "response": assistant_message,
                    "tool_calls": []
                }

        except Exception as e:
            # Rollback on error
            await session.rollback()
            return {
                "success": False,
                "response": "I'm sorry, I encountered an error. Please try again.",
                "error": str(e)
            }

    async def _get_or_create_conversation(
        self,
        user_id: str,
        conversation_id: Optional[UUID],
        session: AsyncSession
    ) -> Conversation:
        """
        Get existing conversation or create a new one.

        Args:
            user_id: User identifier
            conversation_id: Existing conversation ID (optional)
            session: Database session

        Returns:
            Conversation object
        """
        if conversation_id:
            # Fetch existing conversation
            query = select(Conversation).where(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id
            )
            result = await session.execute(query)
            conversation = result.scalar_one_or_none()

            if conversation:
                return conversation

        # Create new conversation
        conversation = Conversation(user_id=user_id)
        session.add(conversation)
        # Don't flush or commit - let SQLAlchemy track it

        return conversation

    async def _fetch_conversation_history(
        self,
        conversation_id: UUID,
        session: AsyncSession,
        limit: int = 50
    ) -> List[Dict[str, str]]:
        """
        Fetch conversation history from database.

        Args:
            conversation_id: Conversation identifier
            session: Database session
            limit: Maximum number of messages to fetch (default: 50)

        Returns:
            List of messages with role and content
        """
        query = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
            .limit(limit)
        )

        result = await session.execute(query)
        messages = result.scalars().all()

        return [
            {
                "role": msg.role.value,
                "content": msg.content
            }
            for msg in messages
        ]

    async def _persist_message(
        self,
        conversation_id: UUID,
        user_id: str,
        role: MessageRole,
        content: str,
        session: AsyncSession
    ) -> Message:
        """
        Persist a message to the database.

        Args:
            conversation_id: Conversation identifier
            user_id: User identifier
            role: Message role (user/assistant/system)
            content: Message content
            session: Database session

        Returns:
            Created Message object
        """
        message = Message(
            conversation_id=conversation_id,
            user_id=user_id,
            role=role,
            content=content
        )

        session.add(message)
        # Don't flush or commit - let SQLAlchemy track it

        return message

    async def get_conversation_history(
        self,
        user_id: str,
        conversation_id: UUID,
        session: AsyncSession
    ) -> Dict[str, Any]:
        """
        Get full conversation history for display.

        Args:
            user_id: User identifier
            conversation_id: Conversation identifier
            session: Database session

        Returns:
            Dict with conversation metadata and messages
        """
        try:
            # Verify conversation belongs to user
            query = select(Conversation).where(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id
            )
            result = await session.execute(query)
            conversation = result.scalar_one_or_none()

            if not conversation:
                return {
                    "success": False,
                    "error": "Conversation not found"
                }

            # Fetch messages
            messages = await self._fetch_conversation_history(
                conversation_id=conversation_id,
                session=session
            )

            return {
                "success": True,
                "conversation_id": str(conversation.id),
                "messages": messages,
                "created_at": conversation.created_at.isoformat(),
                "updated_at": conversation.updated_at.isoformat()
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
