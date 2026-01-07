"""
Task API endpoints.
All endpoints require JWT authentication and enforce user isolation.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.api.deps import get_session, get_current_user


router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("/", response_model=List[TaskResponse], status_code=200)
async def list_tasks(
    status_filter: Optional[str] = "all",
    sortField: Optional[str] = "created_at",
    sortOrder: Optional[str] = "desc",
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    List all tasks for authenticated user with filtering and sorting.

    Query Parameters:
    - status: Filter by completion status ('all', 'pending', 'completed')
    - sortField: Field to sort by ('created_at', 'title', 'updated_at')
    - sortOrder: Sort direction ('asc', 'desc')

    Returns:
    - List of tasks matching filters, sorted as specified
    """
    # Build base query with user filter
    query = select(Task).where(Task.user_id == current_user_id)

    # Apply status filter
    if status_filter == "pending":
        query = query.where(Task.completed == False)
    elif status_filter == "completed":
        query = query.where(Task.completed == True)
    # 'all' means no additional filter

    # Apply sorting
    if sortField == "title":
        sort_column = Task.title
    elif sortField == "updated_at":
        sort_column = Task.updated_at
    else:  # default to created_at
        sort_column = Task.created_at

    if sortOrder == "asc":
        query = query.order_by(sort_column.asc())
    else:  # default to desc
        query = query.order_by(sort_column.desc())

    # Execute query
    tasks = session.exec(query).all()

    return tasks


@router.get("/{id}", response_model=TaskResponse, status_code=200)
async def get_task(
    id: UUID,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get a single task by ID for the authenticated user.

    Path Parameters:
    - id: Task UUID

    Returns:
    - Task object if found and owned by user

    Raises:
    - 404: Task not found or belongs to another user
    """
    # Query with user_id filter for security
    task = session.exec(
        select(Task)
        .where(Task.id == id)
        .where(Task.user_id == current_user_id)
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return task


@router.post("/", response_model=TaskResponse, status_code=201)
async def create_task(
    task_data: TaskCreate,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create a new task for the authenticated user.

    Request Body:
    - title: Task title (required, 1-200 characters)
    - description: Task description (optional, max 1000 characters)

    Returns:
    - Created task object with 201 status

    Raises:
    - 400: Validation error
    """
    # Create new task with user_id from JWT (never trust client input)
    task = Task(
        title=task_data.title,
        description=task_data.description,
        user_id=current_user_id,
        completed=False,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    # Save to database
    session.add(task)
    session.commit()
    session.refresh(task)

    return task


@router.put("/{id}", response_model=TaskResponse, status_code=200)
async def update_task(
    id: UUID,
    task_data: TaskUpdate,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Update an existing task for the authenticated user.
    Supports partial updates (only provided fields are updated).

    Path Parameters:
    - id: Task UUID

    Request Body (all optional):
    - title: Updated task title
    - description: Updated task description
    - completed: Updated completion status

    Returns:
    - Updated task object

    Raises:
    - 404: Task not found or belongs to another user
    - 400: Validation error
    """
    # Fetch task with user_id filter
    task = session.exec(
        select(Task)
        .where(Task.id == id)
        .where(Task.user_id == current_user_id)
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Update only provided fields (partial update)
    if task_data.title is not None:
        task.title = task_data.title
    if task_data.description is not None:
        task.description = task_data.description
    if task_data.completed is not None:
        task.completed = task_data.completed

    # Always update timestamp
    task.updated_at = datetime.utcnow()

    # Save changes
    session.add(task)
    session.commit()
    session.refresh(task)

    return task


@router.delete("/{id}", status_code=204)
async def delete_task(
    id: UUID,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Delete a task for the authenticated user.

    Path Parameters:
    - id: Task UUID

    Returns:
    - 204 No Content on success

    Raises:
    - 404: Task not found or belongs to another user
    """
    # Fetch task with user_id filter
    task = session.exec(
        select(Task)
        .where(Task.id == id)
        .where(Task.user_id == current_user_id)
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Delete task (hard delete)
    session.delete(task)
    session.commit()

    return None


@router.patch("/{id}/complete", response_model=TaskResponse, status_code=200)
async def toggle_task_completion(
    id: UUID,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Toggle the completion status of a task (pending ↔ completed).

    Path Parameters:
    - id: Task UUID

    Returns:
    - Updated task object

    Raises:
    - 404: Task not found or belongs to another user
    """
    # Fetch task with user_id filter
    task = session.exec(
        select(Task)
        .where(Task.id == id)
        .where(Task.user_id == current_user_id)
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Toggle completion status
    task.completed = not task.completed
    task.updated_at = datetime.utcnow()

    # Save changes
    session.add(task)
    session.commit()
    session.refresh(task)

    return task
