"""
MCP Tool Definitions for Phase 3 AI Chatbot.

Defines the schema and metadata for MCP tools that the AI agents can call.
These tools are stateless functions that interact with the database.
"""

from typing import Dict, Any, List
from pydantic import BaseModel, Field


class MCPToolDefinition(BaseModel):
    """Schema for MCP tool definition"""
    name: str
    description: str
    parameters: Dict[str, Any]


# Tool: add_task
ADD_TASK_TOOL = MCPToolDefinition(
    name="add_task",
    description="Create a new task for the user. Extracts task title and optional description from natural language.",
    parameters={
        "type": "object",
        "properties": {
            "title": {
                "type": "string",
                "description": "Task title (1-200 characters)",
                "minLength": 1,
                "maxLength": 200
            },
            "description": {
                "type": "string",
                "description": "Optional task description (max 1000 characters)",
                "maxLength": 1000
            }
        },
        "required": ["title"]
    }
)

# Tool: list_tasks
LIST_TASKS_TOOL = MCPToolDefinition(
    name="list_tasks",
    description="Retrieve all tasks for the user. Can filter by completion status.",
    parameters={
        "type": "object",
        "properties": {
            "completed": {
                "type": "boolean",
                "description": "Filter by completion status (optional)"
            }
        },
        "required": []
    }
)

# Tool: complete_task
COMPLETE_TASK_TOOL = MCPToolDefinition(
    name="complete_task",
    description="Mark a task as complete. Requires task ID or title to identify the task.",
    parameters={
        "type": "object",
        "properties": {
            "task_id": {
                "type": "string",
                "description": "UUID of the task to complete"
            },
            "title": {
                "type": "string",
                "description": "Task title to match (alternative to task_id)"
            }
        },
        "required": []
    }
)

# Tool: update_task
UPDATE_TASK_TOOL = MCPToolDefinition(
    name="update_task",
    description="Update task details (title or description). Requires task ID or current title to identify the task.",
    parameters={
        "type": "object",
        "properties": {
            "task_id": {
                "type": "string",
                "description": "UUID of the task to update (optional, alternative to current_title)"
            },
            "current_title": {
                "type": "string",
                "description": "Current task title to match (optional, alternative to task_id)"
            },
            "title": {
                "type": "string",
                "description": "New task title (optional)",
                "maxLength": 200
            },
            "description": {
                "type": "string",
                "description": "New task description (optional)",
                "maxLength": 1000
            }
        },
        "required": []
    }
)

# Tool: delete_task
DELETE_TASK_TOOL = MCPToolDefinition(
    name="delete_task",
    description="Delete a task permanently. Requires task ID or title to identify the task.",
    parameters={
        "type": "object",
        "properties": {
            "task_id": {
                "type": "string",
                "description": "UUID of the task to delete"
            },
            "title": {
                "type": "string",
                "description": "Task title to match (alternative to task_id)"
            }
        },
        "required": []
    }
)

# All tools registry
ALL_TOOLS: List[MCPToolDefinition] = [
    ADD_TASK_TOOL,
    LIST_TASKS_TOOL,
    COMPLETE_TASK_TOOL,
    UPDATE_TASK_TOOL,
    DELETE_TASK_TOOL
]
