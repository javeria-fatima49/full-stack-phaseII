"""
MCP Tools Package for Phase 3 AI Chatbot.

Exports MCP tool definitions, handlers, and registry.
"""

from app.mcp.tools import (
    ADD_TASK_TOOL,
    LIST_TASKS_TOOL,
    COMPLETE_TASK_TOOL,
    UPDATE_TASK_TOOL,
    DELETE_TASK_TOOL,
    ALL_TOOLS
)

from app.mcp.handlers import (
    add_task_handler,
    list_tasks_handler,
    complete_task_handler,
    update_task_handler,
    delete_task_handler
)

from typing import Dict, Callable, Any


# MCP Tool Registry: Maps tool names to their handler functions
TOOL_REGISTRY: Dict[str, Callable] = {
    "add_task": add_task_handler,
    "list_tasks": list_tasks_handler,
    "complete_task": complete_task_handler,
    "update_task": update_task_handler,
    "delete_task": delete_task_handler
}


def get_tool_handler(tool_name: str) -> Callable:
    """
    Get the handler function for a given tool name.

    Args:
        tool_name: Name of the MCP tool

    Returns:
        Handler function for the tool

    Raises:
        KeyError: If tool name is not found in registry
    """
    if tool_name not in TOOL_REGISTRY:
        raise KeyError(f"Tool '{tool_name}' not found in registry")

    return TOOL_REGISTRY[tool_name]


__all__ = [
    "ADD_TASK_TOOL",
    "LIST_TASKS_TOOL",
    "COMPLETE_TASK_TOOL",
    "UPDATE_TASK_TOOL",
    "DELETE_TASK_TOOL",
    "ALL_TOOLS",
    "add_task_handler",
    "list_tasks_handler",
    "complete_task_handler",
    "update_task_handler",
    "delete_task_handler",
    "TOOL_REGISTRY",
    "get_tool_handler"
]
