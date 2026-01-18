"""
MCP Tool Handlers for Phase 3 AI Chatbot.

Implements the actual logic for each MCP tool.
These are stateless functions that interact with the database.
"""

from typing import Dict, Any, Optional, List
from uuid import UUID
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from app.models import Task
from datetime import datetime


async def add_task_handler(
    user_id: str,
    title: str,
    description: Optional[str] = None,
    session: AsyncSession = None
) -> Dict[str, Any]:
    """
    Create a new task for the user.

    Args:
        user_id: User identifier from JWT token
        title: Task title (1-200 characters)
        description: Optional task description
        session: Database session

    Returns:
        Dict with task details and success status
    """
    try:
        # Create new task
        task = Task(
            user_id=user_id,
            title=title,
            description=description,
            completed=False
        )

        session.add(task)
        await session.flush()  # Flush instead of commit - let caller commit
        await session.refresh(task)

        return {
            "success": True,
            "task": {
                "id": str(task.id),
                "title": task.title,
                "description": task.description,
                "completed": task.completed,
                "created_at": task.created_at.isoformat()
            },
            "message": f"Task '{title}' created successfully"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to create task"
        }


async def list_tasks_handler(
    user_id: str,
    completed: Optional[bool] = None,
    session: AsyncSession = None
) -> Dict[str, Any]:
    """
    Retrieve all tasks for the user.

    Args:
        user_id: User identifier from JWT token
        completed: Filter by completion status (optional)
        session: Database session

    Returns:
        Dict with list of tasks and success status
    """
    try:
        # Build query
        query = select(Task).where(Task.user_id == user_id)

        if completed is not None:
            query = query.where(Task.completed == completed)

        # Execute query
        result = await session.execute(query)
        tasks = result.scalars().all()

        # Format tasks
        task_list = [
            {
                "id": str(task.id),
                "title": task.title,
                "description": task.description,
                "completed": task.completed,
                "created_at": task.created_at.isoformat()
            }
            for task in tasks
        ]

        return {
            "success": True,
            "tasks": task_list,
            "count": len(task_list),
            "message": f"Found {len(task_list)} task(s)"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to retrieve tasks"
        }


async def complete_task_handler(
    user_id: str,
    task_id: Optional[str] = None,
    title: Optional[str] = None,
    session: AsyncSession = None
) -> Dict[str, Any]:
    """
    Mark a task as complete.

    Args:
        user_id: User identifier from JWT token
        task_id: UUID of the task (optional)
        title: Task title to match (optional)
        session: Database session

    Returns:
        Dict with updated task details and success status
    """
    try:
        # Build query
        query = select(Task).where(Task.user_id == user_id)

        if task_id:
            query = query.where(Task.id == UUID(task_id))
        elif title:
            query = query.where(Task.title.ilike(f"%{title}%"))
        else:
            return {
                "success": False,
                "message": "Either task_id or title must be provided"
            }

        # Execute query
        result = await session.execute(query)
        task = result.scalar_one_or_none()

        if not task:
            return {
                "success": False,
                "message": "Task not found"
            }

        # Update task
        task.completed = True
        task.updated_at = datetime.utcnow()

        await session.flush()  # Flush instead of commit
        await session.refresh(task)

        return {
            "success": True,
            "task": {
                "id": str(task.id),
                "title": task.title,
                "completed": task.completed
            },
            "message": f"Task '{task.title}' marked as complete"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to complete task"
        }


async def update_task_handler(
    user_id: str,
    task_id: Optional[str] = None,
    current_title: Optional[str] = None,
    title: Optional[str] = None,
    description: Optional[str] = None,
    session: AsyncSession = None
) -> Dict[str, Any]:
    """
    Update task details.

    Args:
        user_id: User identifier from JWT token
        task_id: UUID of the task (optional)
        current_title: Current task title to match (optional)
        title: New task title (optional)
        description: New task description (optional)
        session: Database session

    Returns:
        Dict with updated task details and success status
    """
    try:
        # Build query to find task
        query = select(Task).where(Task.user_id == user_id)

        if task_id:
            query = query.where(Task.id == UUID(task_id))
        elif current_title:
            query = query.where(Task.title.ilike(f"%{current_title}%"))
        else:
            return {
                "success": False,
                "message": "Either task_id or current_title must be provided"
            }

        result = await session.execute(query)
        task = result.scalar_one_or_none()

        if not task:
            return {
                "success": False,
                "message": "Task not found"
            }

        # Store old title for response message
        old_title = task.title

        # Update fields
        if title:
            task.title = title
        if description is not None:
            task.description = description

        task.updated_at = datetime.utcnow()

        await session.flush()  # Flush instead of commit
        await session.refresh(task)

        return {
            "success": True,
            "task": {
                "id": str(task.id),
                "title": task.title,
                "description": task.description,
                "completed": task.completed,
                "updated_at": task.updated_at.isoformat()
            },
            "message": f"Task '{old_title}' updated successfully"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to update task"
        }


async def delete_task_handler(
    user_id: str,
    task_id: Optional[str] = None,
    title: Optional[str] = None,
    session: AsyncSession = None
) -> Dict[str, Any]:
    """
    Delete a task permanently.

    Args:
        user_id: User identifier from JWT token
        task_id: UUID of the task (optional)
        title: Task title to match (optional)
        session: Database session

    Returns:
        Dict with success status and message
    """
    try:
        # Build query
        query = select(Task).where(Task.user_id == user_id)

        if task_id:
            query = query.where(Task.id == UUID(task_id))
        elif title:
            query = query.where(Task.title.ilike(f"%{title}%"))
        else:
            return {
                "success": False,
                "message": "Either task_id or title must be provided"
            }

        # Execute query
        result = await session.execute(query)
        task = result.scalar_one_or_none()

        if not task:
            return {
                "success": False,
                "message": "Task not found"
            }

        # Delete task
        task_title = task.title
        await session.delete(task)
        await session.flush()  # Flush instead of commit

        return {
            "success": True,
            "message": f"Task '{task_title}' deleted successfully"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to delete task"
        }
