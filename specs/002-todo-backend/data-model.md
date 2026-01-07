---
title: Todo App Backend Database Schema
type: database
status: draft
version: 1.0
created: 2026-01-07
updated: 2026-01-07
owners: backend-team
tags: [database, sqlmodel, postgresql, schema]
---

# Todo App Backend Database Schema

## Overview

This document defines the database schema for the Todo App backend using SQLModel ORM with PostgreSQL. The schema is designed for multi-user task management with strict user isolation, ensuring each user can only access their own tasks.

**Database Technology:** Neon Serverless PostgreSQL
**ORM:** SQLModel (combines SQLAlchemy + Pydantic)
**Migration Strategy:** Alembic (future consideration)

---

## Table Definitions

### Table: `tasks`

**Purpose:** Store user tasks with title, description, completion status, and timestamps.

**Columns:**

| Column Name | Type | Constraints | Description |
|-------------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | Unique task identifier (auto-generated) |
| `title` | VARCHAR(200) | NOT NULL | Task title (1-200 characters) |
| `description` | TEXT | NULL | Optional task description (max 1000 chars enforced at app level) |
| `completed` | BOOLEAN | NOT NULL, DEFAULT FALSE | Task completion status |
| `user_id` | VARCHAR(255) | NOT NULL, INDEX | User identifier from JWT token |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() | Task creation timestamp |
| `updated_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**

1. **Primary Key Index** (automatic):
   - Column: `id`
   - Purpose: Fast lookups by task ID

2. **User Tasks Index**:
   - Columns: `user_id`, `created_at DESC`
   - Purpose: Efficient retrieval of all tasks for a user, sorted by creation date
   - Query pattern: `SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC`

3. **User Completed Tasks Index**:
   - Columns: `user_id`, `completed`, `created_at DESC`
   - Purpose: Fast filtering by completion status
   - Query pattern: `SELECT * FROM tasks WHERE user_id = ? AND completed = ? ORDER BY created_at DESC`

4. **User Tasks by Title Index**:
   - Columns: `user_id`, `title`
   - Purpose: Sorting tasks alphabetically by title
   - Query pattern: `SELECT * FROM tasks WHERE user_id = ? ORDER BY title ASC`

**Constraints:**

1. **Primary Key Constraint**:
   - `PRIMARY KEY (id)`
   - Ensures each task has a unique identifier

2. **Not Null Constraints**:
   - `title NOT NULL` - Every task must have a title
   - `completed NOT NULL` - Completion status must be explicitly set
   - `user_id NOT NULL` - Every task must belong to a user
   - `created_at NOT NULL` - Creation timestamp required
   - `updated_at NOT NULL` - Update timestamp required

3. **Check Constraints**:
   - `CHECK (LENGTH(title) >= 1 AND LENGTH(title) <= 200)` - Title length validation
   - `CHECK (LENGTH(description) <= 1000)` - Description length validation (if not null)

**No Foreign Keys:**
- `user_id` is NOT a foreign key because user data is managed by Better Auth (frontend)
- Backend treats `user_id` as an opaque string identifier
- User isolation enforced by filtering queries with `WHERE user_id = ?`

---

## SQLModel Model Definition

### Task Model

```python
from sqlmodel import SQLModel, Field
from datetime import datetime
from uuid import UUID, uuid4
from typing import Optional

class Task(SQLModel, table=True):
    """
    SQLModel representation of a task.

    This model serves dual purposes:
    1. Database table definition (via table=True)
    2. Pydantic schema for validation and serialization
    """
    __tablename__ = "tasks"

    # Primary key
    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        nullable=False,
        description="Unique task identifier"
    )

    # Task content
    title: str = Field(
        min_length=1,
        max_length=200,
        nullable=False,
        description="Task title (1-200 characters)"
    )

    description: Optional[str] = Field(
        default=None,
        max_length=1000,
        nullable=True,
        description="Optional task description (max 1000 characters)"
    )

    # Status
    completed: bool = Field(
        default=False,
        nullable=False,
        description="Task completion status"
    )

    # User association
    user_id: str = Field(
        max_length=255,
        nullable=False,
        index=True,
        description="User identifier from JWT token"
    )

    # Timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Task creation timestamp (UTC)"
    )

    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Last update timestamp (UTC)"
    )

    class Config:
        """Pydantic configuration"""
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "title": "Complete project documentation",
                "description": "Write comprehensive docs for the API",
                "completed": False,
                "user_id": "user-123",
                "created_at": "2026-01-07T10:00:00Z",
                "updated_at": "2026-01-07T10:00:00Z"
            }
        }
```

---

## Database Indexes - Detailed Specification

### Index 1: Primary Key (Automatic)
```sql
CREATE UNIQUE INDEX tasks_pkey ON tasks (id);
```
- **Type:** B-tree (default)
- **Cardinality:** High (one per task)
- **Usage:** Direct task lookups by ID
- **Query Example:** `SELECT * FROM tasks WHERE id = '550e8400-e29b-41d4-a716-446655440000'`

---

### Index 2: User Tasks by Creation Date
```sql
CREATE INDEX idx_tasks_user_created ON tasks (user_id, created_at DESC);
```
- **Type:** B-tree composite index
- **Cardinality:** Medium (multiple tasks per user)
- **Usage:** List all tasks for a user, sorted by creation date (most recent first)
- **Query Example:** `SELECT * FROM tasks WHERE user_id = 'user-123' ORDER BY created_at DESC`
- **Performance:** O(log n) lookup + sequential scan of user's tasks

---

### Index 3: User Tasks by Completion Status
```sql
CREATE INDEX idx_tasks_user_completed_created ON tasks (user_id, completed, created_at DESC);
```
- **Type:** B-tree composite index
- **Cardinality:** Medium
- **Usage:** Filter tasks by completion status (pending/completed)
- **Query Example:** `SELECT * FROM tasks WHERE user_id = 'user-123' AND completed = false ORDER BY created_at DESC`
- **Performance:** O(log n) lookup + sequential scan of filtered tasks

---

### Index 4: User Tasks by Title
```sql
CREATE INDEX idx_tasks_user_title ON tasks (user_id, title);
```
- **Type:** B-tree composite index
- **Cardinality:** Medium
- **Usage:** Sort tasks alphabetically by title
- **Query Example:** `SELECT * FROM tasks WHERE user_id = 'user-123' ORDER BY title ASC`
- **Performance:** O(log n) lookup + sequential scan in title order

---

## Data Integrity Rules

### Rule 1: User Isolation
**Enforcement:** Application-level filtering
**Implementation:**
```python
# All queries MUST include user_id filter
tasks = session.exec(
    select(Task).where(Task.user_id == current_user_id)
).all()
```
**Validation:** Never trust user_id from request body/params; always use JWT claim

---

### Rule 2: Title Required
**Enforcement:** Database NOT NULL constraint + Pydantic validation
**Implementation:**
- Database: `title VARCHAR(200) NOT NULL`
- Pydantic: `title: str = Field(min_length=1, max_length=200)`
**Error:** 400 Bad Request if title missing or empty

---

### Rule 3: Timestamp Consistency
**Enforcement:** Application-level logic
**Implementation:**
```python
# On create
task.created_at = datetime.utcnow()
task.updated_at = datetime.utcnow()

# On update
task.updated_at = datetime.utcnow()
# created_at never changes
```
**Validation:** `updated_at >= created_at` always true

---

### Rule 4: Completion Status Default
**Enforcement:** Database DEFAULT constraint
**Implementation:** `completed BOOLEAN NOT NULL DEFAULT FALSE`
**Behavior:** New tasks are always pending unless explicitly set to completed

---

## Migration Strategy

### Initial Schema Creation

**Using SQLModel:**
```python
from sqlmodel import SQLModel, create_engine

# Create all tables
engine = create_engine(DATABASE_URL)
SQLModel.metadata.create_all(engine)
```

**Generated SQL:**
```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_created ON tasks (user_id, created_at DESC);
CREATE INDEX idx_tasks_user_completed_created ON tasks (user_id, completed, created_at DESC);
CREATE INDEX idx_tasks_user_title ON tasks (user_id, title);
```

---

### Future Schema Changes (Alembic)

**For production, use Alembic for migrations:**

1. **Install Alembic:**
   ```bash
   pip install alembic
   alembic init alembic
   ```

2. **Configure Alembic:**
   ```python
   # alembic/env.py
   from app.models import Task
   target_metadata = SQLModel.metadata
   ```

3. **Generate Migration:**
   ```bash
   alembic revision --autogenerate -m "Create tasks table"
   ```

4. **Apply Migration:**
   ```bash
   alembic upgrade head
   ```

---

### Rollback Plan

**If schema needs to be rolled back:**

1. **Drop Indexes:**
   ```sql
   DROP INDEX IF EXISTS idx_tasks_user_title;
   DROP INDEX IF EXISTS idx_tasks_user_completed_created;
   DROP INDEX IF EXISTS idx_tasks_user_created;
   ```

2. **Drop Table:**
   ```sql
   DROP TABLE IF EXISTS tasks;
   ```

**Data Preservation:**
- Before dropping, export data: `pg_dump -t tasks > tasks_backup.sql`
- After rollback, restore if needed: `psql < tasks_backup.sql`

---

### Zero-Downtime Requirements

**For production deployments:**

1. **Additive Changes Only:**
   - New columns must be nullable or have defaults
   - Never drop columns in same deployment as code changes

2. **Backward Compatibility:**
   - Old code must work with new schema during deployment
   - New code must work with old schema during rollback

3. **Index Creation:**
   - Create indexes with `CONCURRENTLY` option to avoid table locks
   - Example: `CREATE INDEX CONCURRENTLY idx_new ON tasks (column)`

---

## Sample Data

### Development Seed Data

```sql
-- User 1 tasks
INSERT INTO tasks (id, title, description, completed, user_id, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Complete project documentation', 'Write comprehensive docs for the API', false, 'user-123', '2026-01-07T10:00:00Z', '2026-01-07T10:00:00Z'),
('550e8400-e29b-41d4-a716-446655440001', 'Review pull requests', NULL, false, 'user-123', '2026-01-06T15:30:00Z', '2026-01-06T15:30:00Z'),
('550e8400-e29b-41d4-a716-446655440002', 'Deploy to production', 'Deploy backend and frontend', true, 'user-123', '2026-01-05T09:00:00Z', '2026-01-06T14:00:00Z');

-- User 2 tasks (different user, isolated data)
INSERT INTO tasks (id, title, description, completed, user_id, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440003', 'Buy groceries', 'Milk, eggs, bread', false, 'user-456', '2026-01-07T08:00:00Z', '2026-01-07T08:00:00Z'),
('550e8400-e29b-41d4-a716-446655440004', 'Call dentist', NULL, true, 'user-456', '2026-01-06T12:00:00Z', '2026-01-06T16:00:00Z');
```

---

## Query Patterns and Performance

### Pattern 1: List All User Tasks
```python
# SQLModel query
tasks = session.exec(
    select(Task)
    .where(Task.user_id == current_user_id)
    .order_by(Task.created_at.desc())
).all()
```
**Index Used:** `idx_tasks_user_created`
**Performance:** O(log n) + O(m) where m = number of user's tasks

---

### Pattern 2: Filter by Completion Status
```python
# SQLModel query
tasks = session.exec(
    select(Task)
    .where(Task.user_id == current_user_id)
    .where(Task.completed == False)
    .order_by(Task.created_at.desc())
).all()
```
**Index Used:** `idx_tasks_user_completed_created`
**Performance:** O(log n) + O(m) where m = number of matching tasks

---

### Pattern 3: Sort by Title
```python
# SQLModel query
tasks = session.exec(
    select(Task)
    .where(Task.user_id == current_user_id)
    .order_by(Task.title.asc())
).all()
```
**Index Used:** `idx_tasks_user_title`
**Performance:** O(log n) + O(m) where m = number of user's tasks

---

### Pattern 4: Get Single Task
```python
# SQLModel query
task = session.exec(
    select(Task)
    .where(Task.id == task_id)
    .where(Task.user_id == current_user_id)
).first()
```
**Index Used:** Primary key index
**Performance:** O(log n) - very fast

---

### Pattern 5: Update Task
```python
# SQLModel query
task = session.get(Task, task_id)
if task and task.user_id == current_user_id:
    task.title = new_title
    task.updated_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)
```
**Index Used:** Primary key index
**Performance:** O(log n) lookup + O(1) update

---

### Pattern 6: Delete Task
```python
# SQLModel query
task = session.get(Task, task_id)
if task and task.user_id == current_user_id:
    session.delete(task)
    session.commit()
```
**Index Used:** Primary key index
**Performance:** O(log n) lookup + O(1) delete

---

## Database Connection Configuration

### Connection String Format
```
postgresql+asyncpg://user:password@host:port/database?ssl=require
```

### Connection Pool Settings
```python
from sqlmodel import create_engine

engine = create_engine(
    DATABASE_URL,
    echo=False,  # Set to True for SQL query logging in development
    pool_size=10,  # Minimum number of connections
    max_overflow=20,  # Maximum additional connections
    pool_timeout=30,  # Seconds to wait for connection
    pool_recycle=3600,  # Recycle connections after 1 hour
    pool_pre_ping=True,  # Verify connections before using
)
```

---

## Data Retention and Archival

**Phase II Policy:** No archival or soft deletes
- Tasks are permanently deleted when user deletes them
- No audit trail or recovery mechanism

**Future Considerations:**
- Add `deleted_at` column for soft deletes
- Implement archival process for old completed tasks
- Add audit log table for compliance

---

## Validation Checklist

### Schema Completeness
- [x] All columns defined with appropriate types
- [x] Primary key specified
- [x] Indexes designed for query patterns
- [x] Constraints enforce data integrity
- [x] Timestamps track creation and updates
- [x] User isolation enforced

### Performance Optimization
- [x] Indexes cover all query patterns
- [x] Composite indexes ordered correctly (user_id first)
- [x] No full table scans expected
- [x] Connection pooling configured

### Security
- [x] User isolation at query level
- [x] No foreign key to user table (decoupled from auth system)
- [x] Input validation at application layer
- [x] SQL injection prevented by ORM

### Maintainability
- [x] SQLModel provides type safety
- [x] Migration strategy defined
- [x] Rollback plan documented
- [x] Sample data provided for testing

---

## Related Specifications

- `@specs/002-todo-backend/spec.md` - Main backend specification
- `@specs/002-todo-backend/contracts/api-endpoints.md` - API contracts
- `@specs/002-todo-backend/security.md` - Authentication specification
- `@specs/001-todo-frontend/contracts/api-endpoints.md` - Frontend expectations
- `@.specify/memory/constitution.md` - Project principles
