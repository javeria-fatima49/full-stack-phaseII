---
title: Todo App Backend API Contracts
type: api
status: draft
version: 1.0
created: 2026-01-07
updated: 2026-01-07
owners: backend-team
tags: [api, contracts, endpoints, fastapi]
---

# Todo App Backend API Contracts

## Overview

This document provides detailed API endpoint specifications for the FastAPI backend. All endpoints require JWT authentication via cookies and enforce user isolation. These contracts match exactly what the frontend expects as defined in `@specs/001-todo-frontend/contracts/api-endpoints.md`.

**Base URL:** `http://localhost:8000` (development) or production domain
**Authentication:** JWT token in `auth_token` cookie
**Content-Type:** `application/json`

---

## Authentication Flow

### JWT Token Extraction
1. FastAPI dependency extracts `auth_token` from request cookies
2. Token verified using `BETTER_AUTH_SECRET`
3. `user_id` extracted from token claims
4. `user_id` attached to request context
5. All database queries filtered by `user_id`

### Authentication Failure
- **Status Code:** 401 Unauthorized
- **Response Body:** `{"detail": "Unauthorized"}`
- **Frontend Action:** Redirect to `/login`

---

## Endpoint Specifications

### 1. List Tasks

**Endpoint:** `GET /api/tasks`

**Description:** Retrieve all tasks for the authenticated user with optional filtering and sorting.

**Authentication:** Required (JWT in cookie)

**Query Parameters:**

| Parameter | Type | Required | Default | Valid Values | Description |
|-----------|------|----------|---------|--------------|-------------|
| `status` | string | No | `"all"` | `"all"`, `"pending"`, `"completed"` | Filter by completion status |
| `sortField` | string | No | `"created_at"` | `"created_at"`, `"title"`, `"updated_at"` | Field to sort by |
| `sortOrder` | string | No | `"desc"` | `"asc"`, `"desc"` | Sort direction |

**Request Example:**
```http
GET /api/tasks?status=pending&sortField=created_at&sortOrder=desc HTTP/1.1
Host: localhost:8000
Cookie: auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200 OK):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Complete project documentation",
    "description": "Write comprehensive docs for the API",
    "completed": false,
    "created_at": "2026-01-06T10:00:00Z",
    "updated_at": "2026-01-06T10:00:00Z",
    "user_id": "user-123"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Review pull requests",
    "description": null,
    "completed": false,
    "created_at": "2026-01-05T15:30:00Z",
    "updated_at": "2026-01-05T15:30:00Z",
    "user_id": "user-123"
  }
]
```

**Empty Response (200 OK):**
```json
[]
```

**Error Responses:**

| Status Code | Condition | Response Body |
|-------------|-----------|---------------|
| 401 | Missing or invalid JWT token | `{"detail": "Unauthorized"}` |
| 500 | Server error | `{"detail": "Internal server error"}` |

**Implementation Notes:**
- Default sorting: most recent first (`created_at DESC`)
- Status filter: `"all"` returns all tasks, `"pending"` returns `completed=false`, `"completed"` returns `completed=true`
- Always filter by authenticated `user_id`
- Return empty array if user has no tasks (not 404)

---

### 2. Get Task by ID

**Endpoint:** `GET /api/tasks/{id}`

**Description:** Retrieve a single task by ID for the authenticated user.

**Authentication:** Required (JWT in cookie)

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | Task identifier |

**Request Example:**
```http
GET /api/tasks/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Host: localhost:8000
Cookie: auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Complete project documentation",
  "description": "Write comprehensive docs for the API",
  "completed": false,
  "created_at": "2026-01-06T10:00:00Z",
  "updated_at": "2026-01-06T10:00:00Z",
  "user_id": "user-123"
}
```

**Error Responses:**

| Status Code | Condition | Response Body |
|-------------|-----------|---------------|
| 401 | Missing or invalid JWT token | `{"detail": "Unauthorized"}` |
| 404 | Task not found or belongs to another user | `{"detail": "Task not found"}` |
| 422 | Invalid UUID format | `{"detail": [{"loc": ["path", "id"], "msg": "value is not a valid uuid", "type": "type_error.uuid"}]}` |
| 500 | Server error | `{"detail": "Internal server error"}` |

**Implementation Notes:**
- Query must include `WHERE id = ? AND user_id = ?`
- Return 404 if task doesn't exist OR belongs to different user (don't reveal existence)
- FastAPI automatically validates UUID format

---

### 3. Create Task

**Endpoint:** `POST /api/tasks`

**Description:** Create a new task for the authenticated user.

**Authentication:** Required (JWT in cookie)

**Request Headers:**
```
Content-Type: application/json
Cookie: auth_token=<jwt_token>
```

**Request Body Schema:**

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `title` | string | Yes | 1-200 characters | Task title |
| `description` | string | No | Max 1000 characters | Task description |

**Request Example:**
```http
POST /api/tasks HTTP/1.1
Host: localhost:8000
Content-Type: application/json
Cookie: auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "title": "Complete project documentation",
  "description": "Write comprehensive docs for the API"
}
```

**Success Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Complete project documentation",
  "description": "Write comprehensive docs for the API",
  "completed": false,
  "created_at": "2026-01-07T10:00:00Z",
  "updated_at": "2026-01-07T10:00:00Z",
  "user_id": "user-123"
}
```

**Error Responses:**

| Status Code | Condition | Response Body |
|-------------|-----------|---------------|
| 400 | Validation error | See validation error format below |
| 401 | Missing or invalid JWT token | `{"detail": "Unauthorized"}` |
| 500 | Server error | `{"detail": "Internal server error"}` |

**Validation Error Response (400 Bad Request):**
```json
{
  "detail": {
    "title": ["Title is required"],
    "description": ["Description must be 1000 characters or less"]
  }
}
```

**Validation Rules:**
- `title`: Required, non-empty, 1-200 characters
- `description`: Optional, max 1000 characters if provided
- `completed`: Not accepted in request (always defaults to `false`)
- `user_id`: Extracted from JWT, never from request body

**Implementation Notes:**
- Generate UUID for `id`
- Set `user_id` from JWT claims (never trust client input)
- Set `completed = false` by default
- Set `created_at` and `updated_at` to current UTC timestamp
- Return 201 status code with created resource

---

### 4. Update Task

**Endpoint:** `PUT /api/tasks/{id}`

**Description:** Update an existing task for the authenticated user. Supports partial updates (only provided fields are updated).

**Authentication:** Required (JWT in cookie)

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | Task identifier |

**Request Headers:**
```
Content-Type: application/json
Cookie: auth_token=<jwt_token>
```

**Request Body Schema (all fields optional):**

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `title` | string | No | 1-200 characters | Updated task title |
| `description` | string | No | Max 1000 characters | Updated task description |
| `completed` | boolean | No | true or false | Updated completion status |

**Request Example:**
```http
PUT /api/tasks/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Host: localhost:8000
Content-Type: application/json
Cookie: auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "title": "Updated title",
  "description": "Updated description"
}
```

**Success Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Updated title",
  "description": "Updated description",
  "completed": false,
  "created_at": "2026-01-06T10:00:00Z",
  "updated_at": "2026-01-07T11:30:00Z",
  "user_id": "user-123"
}
```

**Error Responses:**

| Status Code | Condition | Response Body |
|-------------|-----------|---------------|
| 400 | Validation error | See validation error format |
| 401 | Missing or invalid JWT token | `{"detail": "Unauthorized"}` |
| 404 | Task not found or belongs to another user | `{"detail": "Task not found"}` |
| 422 | Invalid UUID format | `{"detail": [{"loc": ["path", "id"], "msg": "value is not a valid uuid", "type": "type_error.uuid"}]}` |
| 500 | Server error | `{"detail": "Internal server error"}` |

**Implementation Notes:**
- Verify task exists and belongs to authenticated user
- Update only fields provided in request body (partial update)
- Always update `updated_at` to current UTC timestamp
- `created_at` never changes
- `user_id` never changes (cannot transfer task to another user)
- Return updated task object

---

### 5. Delete Task

**Endpoint:** `DELETE /api/tasks/{id}`

**Description:** Permanently delete a task for the authenticated user.

**Authentication:** Required (JWT in cookie)

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | Task identifier |

**Request Example:**
```http
DELETE /api/tasks/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Host: localhost:8000
Cookie: auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (204 No Content):**
```
(empty body)
```

**Error Responses:**

| Status Code | Condition | Response Body |
|-------------|-----------|---------------|
| 401 | Missing or invalid JWT token | `{"detail": "Unauthorized"}` |
| 404 | Task not found or belongs to another user | `{"detail": "Task not found"}` |
| 422 | Invalid UUID format | `{"detail": [{"loc": ["path", "id"], "msg": "value is not a valid uuid", "type": "type_error.uuid"}]}` |
| 500 | Server error | `{"detail": "Internal server error"}` |

**Implementation Notes:**
- Verify task exists and belongs to authenticated user
- Perform hard delete (permanent removal from database)
- Return 204 status code with no response body
- No recovery mechanism (future: implement soft delete with `deleted_at`)

---

### 6. Toggle Task Completion

**Endpoint:** `PATCH /api/tasks/{id}/complete`

**Description:** Toggle the completion status of a task (pending ↔ completed).

**Authentication:** Required (JWT in cookie)

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | Task identifier |

**Request Example:**
```http
PATCH /api/tasks/550e8400-e29b-41d4-a716-446655440000/complete HTTP/1.1
Host: localhost:8000
Cookie: auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Complete project documentation",
  "description": "Write comprehensive docs for the API",
  "completed": true,
  "created_at": "2026-01-06T10:00:00Z",
  "updated_at": "2026-01-07T12:00:00Z",
  "user_id": "user-123"
}
```

**Error Responses:**

| Status Code | Condition | Response Body |
|-------------|-----------|---------------|
| 401 | Missing or invalid JWT token | `{"detail": "Unauthorized"}` |
| 404 | Task not found or belongs to another user | `{"detail": "Task not found"}` |
| 422 | Invalid UUID format | `{"detail": [{"loc": ["path", "id"], "msg": "value is not a valid uuid", "type": "type_error.uuid"}]}` |
| 500 | Server error | `{"detail": "Internal server error"}` |

**Implementation Notes:**
- Verify task exists and belongs to authenticated user
- Toggle `completed` field: `false` → `true` or `true` → `false`
- Update `updated_at` to current UTC timestamp
- Return updated task object
- Idempotent: calling twice returns to original state

---

## Request/Response Schemas

### Task Response Schema

**All endpoints return tasks in this format:**

```typescript
{
  id: string;              // UUID format
  title: string;           // 1-200 characters
  description: string | null;  // Max 1000 characters or null
  completed: boolean;      // true or false
  created_at: string;      // ISO 8601 timestamp (UTC)
  updated_at: string;      // ISO 8601 timestamp (UTC)
  user_id: string;         // User identifier from JWT
}
```

**Example:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Complete project documentation",
  "description": "Write comprehensive docs for the API",
  "completed": false,
  "created_at": "2026-01-07T10:00:00Z",
  "updated_at": "2026-01-07T10:00:00Z",
  "user_id": "user-123"
}
```

---

### Create Task Request Schema

```typescript
{
  title: string;           // Required, 1-200 characters
  description?: string;    // Optional, max 1000 characters
}
```

**Example:**
```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive docs for the API"
}
```

---

### Update Task Request Schema

```typescript
{
  title?: string;          // Optional, 1-200 characters
  description?: string;    // Optional, max 1000 characters
  completed?: boolean;     // Optional, true or false
}
```

**Example:**
```json
{
  "title": "Updated title",
  "completed": true
}
```

---

## Error Response Formats

### Validation Error (400 Bad Request)

**Structure:**
```json
{
  "detail": {
    "field_name": ["Error message 1", "Error message 2"]
  }
}
```

**Example:**
```json
{
  "detail": {
    "title": ["Title is required", "Title must be between 1 and 200 characters"],
    "description": ["Description must be 1000 characters or less"]
  }
}
```

---

### Authentication Error (401 Unauthorized)

**Structure:**
```json
{
  "detail": "Unauthorized"
}
```

**Triggers:**
- Missing `auth_token` cookie
- Invalid JWT signature
- Expired JWT token
- Malformed JWT token

---

### Not Found Error (404 Not Found)

**Structure:**
```json
{
  "detail": "Task not found"
}
```

**Triggers:**
- Task ID does not exist in database
- Task exists but belongs to different user (don't reveal this)

---

### Validation Error (422 Unprocessable Entity)

**Structure:**
```json
{
  "detail": [
    {
      "loc": ["path", "id"],
      "msg": "value is not a valid uuid",
      "type": "type_error.uuid"
    }
  ]
}
```

**Triggers:**
- Invalid UUID format in path parameter
- Invalid data type in request body

---

### Server Error (500 Internal Server Error)

**Structure:**
```json
{
  "detail": "Internal server error"
}
```

**Triggers:**
- Database connection failure
- Unexpected exceptions
- ORM errors

**Note:** Never expose stack traces or sensitive details in production

---

## FastAPI Route Definitions

### Route Structure

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List, Optional
from uuid import UUID

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

@router.get("/", response_model=List[TaskResponse], status_code=200)
async def list_tasks(
    status: Optional[str] = "all",
    sortField: Optional[str] = "created_at",
    sortOrder: Optional[str] = "desc",
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """List all tasks for authenticated user with filtering and sorting"""
    pass

@router.get("/{id}", response_model=TaskResponse, status_code=200)
async def get_task(
    id: UUID,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get a single task by ID"""
    pass

@router.post("/", response_model=TaskResponse, status_code=201)
async def create_task(
    task: TaskCreate,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Create a new task"""
    pass

@router.put("/{id}", response_model=TaskResponse, status_code=200)
async def update_task(
    id: UUID,
    task: TaskUpdate,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update an existing task"""
    pass

@router.delete("/{id}", status_code=204)
async def delete_task(
    id: UUID,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Delete a task"""
    pass

@router.patch("/{id}/complete", response_model=TaskResponse, status_code=200)
async def toggle_task_completion(
    id: UUID,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Toggle task completion status"""
    pass
```

---

## Testing Endpoints

### Using curl

**List tasks:**
```bash
curl -X GET "http://localhost:8000/api/tasks?status=pending&sortField=created_at&sortOrder=desc" \
  -H "Cookie: auth_token=<jwt_token>"
```

**Get task:**
```bash
curl -X GET "http://localhost:8000/api/tasks/550e8400-e29b-41d4-a716-446655440000" \
  -H "Cookie: auth_token=<jwt_token>"
```

**Create task:**
```bash
curl -X POST "http://localhost:8000/api/tasks" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=<jwt_token>" \
  -d '{"title":"Test task","description":"Test description"}'
```

**Update task:**
```bash
curl -X PUT "http://localhost:8000/api/tasks/550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=<jwt_token>" \
  -d '{"title":"Updated title","completed":true}'
```

**Delete task:**
```bash
curl -X DELETE "http://localhost:8000/api/tasks/550e8400-e29b-41d4-a716-446655440000" \
  -H "Cookie: auth_token=<jwt_token>"
```

**Toggle completion:**
```bash
curl -X PATCH "http://localhost:8000/api/tasks/550e8400-e29b-41d4-a716-446655440000/complete" \
  -H "Cookie: auth_token=<jwt_token>"
```

---

## Validation Checklist

### API Contract Completeness
- [x] All 6 endpoints documented with full details
- [x] Request/response schemas defined
- [x] All query parameters specified with defaults
- [x] All path parameters specified with types
- [x] All error responses documented with status codes
- [x] Authentication requirements clearly stated
- [x] Examples provided for all endpoints

### Frontend Compatibility
- [x] Endpoint paths match frontend expectations exactly
- [x] HTTP methods match frontend expectations
- [x] Response formats match frontend TypeScript interfaces
- [x] Error formats match frontend error handling
- [x] Query parameters match frontend API client

### Implementation Readiness
- [x] FastAPI route structure provided
- [x] Dependency injection pattern defined
- [x] Status codes specified for all responses
- [x] Validation rules clearly stated
- [x] Testing examples provided

---

## Related Specifications

- `@specs/002-todo-backend/spec.md` - Main backend specification
- `@specs/002-todo-backend/data-model.md` - Database schema
- `@specs/002-todo-backend/security.md` - JWT authentication
- `@specs/001-todo-frontend/contracts/api-endpoints.md` - Frontend expectations
- `@.specify/memory/constitution.md` - Project principles
