"""
TaskManagerAgent for Phase 3 AI Chatbot.

Uses Cohere API to interpret natural language commands and invoke MCP tools.
This agent is stateless and processes one message at a time.
"""

import cohere
import asyncio
from typing import Dict, Any, Optional, List
from sqlmodel.ext.asyncio.session import AsyncSession
from app.config import settings
from app.mcp import TOOL_REGISTRY, ALL_TOOLS
import json


class TaskManagerAgent:
    """
    AI agent that interprets task-related commands and calls MCP tools.

    Uses Cohere API for natural language understanding and intent recognition.
    Supports intents: CREATE, LIST, COMPLETE, UPDATE, DELETE
    """

    # List of Cohere models to try in order (best to worst)
    AVAILABLE_MODELS = [
        "command-r-plus",      # Most capable (if available)
        "command-r",           # Good balance of capability and speed
        "command-nightly",     # Latest experimental features
        "command",             # Standard model
        "command-light"        # Fastest, least capable
    ]

    def __init__(self):
        """Initialize TaskManagerAgent with Cohere API client"""
        self.client = cohere.Client(api_key=settings.cohere_api_key)
        self.tools = self._format_tools_for_cohere()
        self.current_model = None  # Will be set on first successful call

    def _format_tools_for_cohere(self) -> List[Dict[str, Any]]:
        """
        Format MCP tools for Cohere API tool calling.

        Returns:
            List of tool definitions in Cohere format
        """
        cohere_tools = []
        for tool in ALL_TOOLS:
            cohere_tools.append({
                "name": tool.name,
                "description": tool.description,
                "parameter_definitions": tool.parameters.get("properties", {})
            })
        return cohere_tools

    def _call_cohere_with_fallback(self, **kwargs) -> Any:
        """
        Call Cohere API with automatic model fallback.

        Tries models in order from AVAILABLE_MODELS list until one succeeds.
        Caches the working model for future calls.

        Args:
            **kwargs: Arguments to pass to cohere.chat()

        Returns:
            Cohere API response

        Raises:
            Exception: If all models fail or non-404 error occurs
        """
        # If we already know which model works, use it
        if self.current_model:
            try:
                return self.client.chat(model=self.current_model, **kwargs)
            except Exception as e:
                # If cached model fails, reset and try fallback
                error_str = str(e)
                if "404" in error_str or "was removed" in error_str:
                    print(f"Cached model {self.current_model} no longer available, trying fallback...")
                    self.current_model = None
                else:
                    # For other errors (rate limit, auth, etc.), raise immediately
                    raise

        # Try each model in order
        last_error = None
        for model in self.AVAILABLE_MODELS:
            try:
                print(f"Trying Cohere model: {model}")
                response = self.client.chat(model=model, **kwargs)
                # Success! Cache this model for future use
                self.current_model = model
                print(f"✓ Successfully using Cohere model: {model}")
                return response
            except Exception as e:
                error_str = str(e)
                # Check if it's a 404 (model not found) error
                if "404" in error_str or "was removed" in error_str:
                    print(f"✗ Model {model} not available: {error_str}")
                    last_error = e
                    continue  # Try next model
                else:
                    # For other errors (rate limit, auth, etc.), raise immediately
                    print(f"✗ Error with model {model}: {error_str}")
                    raise

        # If we get here, all models failed
        raise Exception(
            f"All Cohere models failed. Last error: {last_error}. "
            f"Tried models: {', '.join(self.AVAILABLE_MODELS)}"
        )

    async def process_message(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]],
        user_id: str
    ) -> Dict[str, Any]:
        """
        Process a user message and determine appropriate action.

        CRITICAL: This method does NOT receive a session parameter.
        Tool execution happens separately in the caller with proper session context.

        Args:
            user_message: User's natural language input
            conversation_history: Previous messages for context
            user_id: User identifier from JWT token

        Returns:
            Dict with response text and tool calls to execute
        """
        try:
            # Build conversation context for Cohere
            chat_history = self._build_chat_history(conversation_history)

            # Call Cohere API with tool calling (run in thread to avoid blocking)
            # CRITICAL: No session object in scope here
            # Uses automatic model fallback to find available model
            response = await asyncio.to_thread(
                self._call_cohere_with_fallback,
                message=user_message,
                chat_history=chat_history,
                tools=self.tools,
                temperature=0.3
            )

            # Check if Cohere wants to call a tool
            if response.tool_calls:
                # Return tool calls for execution by caller
                # Caller will execute tools with proper session context
                return {
                    "success": True,
                    "needs_tool_execution": True,
                    "tool_calls": [
                        {
                            "name": tc.name,
                            "parameters": tc.parameters
                        }
                        for tc in response.tool_calls
                    ],
                    "initial_response": response.text
                }
            else:
                # No tool call needed, return conversational response
                return {
                    "success": True,
                    "needs_tool_execution": False,
                    "response": response.text,
                    "tool_calls": []
                }

        except Exception as e:
            # Fallback response on error
            return {
                "success": False,
                "needs_tool_execution": False,
                "response": "I'm sorry, I encountered an error processing your request. Please try again.",
                "error": str(e)
            }

    async def generate_final_response(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]],
        tool_calls: List[Dict[str, Any]],
        tool_results: List[Dict[str, Any]]
    ) -> str:
        """
        Generate final response after tool execution.

        CRITICAL: This method does NOT receive a session parameter.
        It only calls Cohere API to format the final response.

        Args:
            user_message: Original user message
            conversation_history: Previous messages for context
            tool_calls: List of tool calls that were executed
            tool_results: Results from tool execution

        Returns:
            Final response text from Cohere or fallback response
        """
        try:
            chat_history = self._build_chat_history(conversation_history)

            # Generate final response with tool results (run in thread)
            # CRITICAL: No session object in scope here
            # Uses automatic model fallback to find available model
            final_response = await asyncio.to_thread(
                self._call_cohere_with_fallback,
                message=user_message,
                chat_history=chat_history,
                tools=self.tools,
                tool_results=[
                    {
                        "call": {"name": tc["name"], "parameters": tc["parameters"]},
                        "outputs": [{"result": json.dumps(tr)}]
                    }
                    for tc, tr in zip(tool_calls, tool_results)
                ],
                temperature=0.3
            )

            return final_response.text

        except Exception as e:
            # Fallback: Generate response from tool results directly
            print(f"Cohere API failed in generate_final_response: {str(e)}")
            print("Generating fallback response from tool results...")
            return self._generate_fallback_response(tool_calls, tool_results)

    def _generate_fallback_response(
        self,
        tool_calls: List[Dict[str, Any]],
        tool_results: List[Dict[str, Any]]
    ) -> str:
        """
        Generate a fallback response from tool results when Cohere API fails.

        This method creates human-readable responses directly from tool execution results,
        ensuring users always get meaningful feedback even if AI response generation fails.

        Args:
            tool_calls: List of tool calls that were executed
            tool_results: Results from tool execution

        Returns:
            Human-readable response string
        """
        if not tool_results or len(tool_results) == 0:
            return "I've processed your request successfully."

        responses = []

        for tool_call, result in zip(tool_calls, tool_results):
            tool_name = tool_call.get("name", "unknown")

            # Safely extract result data with defaults
            success = result.get("success", False)
            message = result.get("message", "")

            if not success:
                # Tool execution failed
                error_msg = result.get("error", "Unknown error")
                responses.append(f"Failed to {tool_name.replace('_', ' ')}: {message or error_msg}")
                continue

            # Tool execution succeeded - format response based on tool type
            if tool_name == "add_task":
                task = result.get("task", {})
                title = task.get("title", "your task")
                responses.append(f"✓ Created task: {title}")

            elif tool_name == "list_tasks":
                tasks = result.get("tasks", [])
                count = result.get("count", len(tasks))

                if count == 0:
                    responses.append("You have no tasks.")
                elif count == 1:
                    responses.append("You have 1 task:")
                else:
                    responses.append(f"You have {count} tasks:")

                # List up to 10 tasks
                for i, task in enumerate(tasks[:10]):
                    title = task.get("title", "Untitled")
                    completed = task.get("completed", False)
                    status = "✓" if completed else "○"
                    responses.append(f"  {status} {title}")

                if count > 10:
                    responses.append(f"  ... and {count - 10} more")

            elif tool_name == "complete_task":
                task = result.get("task", {})
                title = task.get("title", "the task")
                responses.append(f"✓ Marked as complete: {title}")

            elif tool_name == "update_task":
                task = result.get("task", {})
                title = task.get("title", "the task")
                # Extract old title from message if available
                message_parts = message.split("'")
                if len(message_parts) >= 2:
                    old_title = message_parts[1]
                    responses.append(f"✓ Updated '{old_title}' to: {title}")
                else:
                    responses.append(f"✓ Updated task: {title}")

            elif tool_name == "delete_task":
                # Message already contains the task title
                responses.append(f"✓ {message}")

            else:
                # Unknown tool - use generic success message
                responses.append(f"✓ {message or 'Operation completed successfully'}")

        return "\n".join(responses) if responses else "I've completed your request successfully."

    def _build_chat_history(
        self,
        conversation_history: List[Dict[str, str]]
    ) -> List[Dict[str, str]]:
        """
        Convert conversation history to Cohere chat history format.

        Args:
            conversation_history: List of messages with role and content

        Returns:
            List of messages in Cohere format
        """
        chat_history = []
        for msg in conversation_history:
            role = msg.get("role")
            content = msg.get("content")

            if role == "user":
                chat_history.append({"role": "USER", "message": content})
            elif role == "assistant":
                chat_history.append({"role": "CHATBOT", "message": content})

        return chat_history

    def recognize_intent(self, user_message: str) -> str:
        """
        Recognize user intent from natural language.

        Args:
            user_message: User's input message

        Returns:
            Intent string (CREATE, LIST, COMPLETE, UPDATE, DELETE, GENERAL)
        """
        message_lower = user_message.lower()

        # CREATE intent
        if any(word in message_lower for word in ["add", "create", "new task", "make a task"]):
            return "CREATE"

        # LIST intent
        if any(word in message_lower for word in ["show", "list", "what are", "my tasks", "view tasks"]):
            return "LIST"

        # COMPLETE intent
        if any(word in message_lower for word in ["complete", "done", "finish", "mark as complete"]):
            return "COMPLETE"

        # UPDATE intent
        if any(word in message_lower for word in ["update", "change", "edit", "modify"]):
            return "UPDATE"

        # DELETE intent
        if any(word in message_lower for word in ["delete", "remove", "cancel"]):
            return "DELETE"

        return "GENERAL"
