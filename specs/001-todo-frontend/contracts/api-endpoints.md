# API Endpoints Documentation

**Feature**: Todo App Frontend Interface
**Branch**: `001-todo-frontend`
**Date**: 2026-01-06

## Overview

This document defines all API endpoints that the frontend will consume. All endpoints require JWT authentication via the `Authorization: Bearer <token>` header (automatically handled by httpOnly cookies).

**Base URL**: `http://localhost:8000` (development) or `${NEXT_PUBLIC_API_URL}` (production)

---

## Authentication

### JWT Token Flow

1. User logs in via Better Auth
2. Better Auth sets httpOnly cookie with JWT token
3. Cookie automatically sent with all API requests
4. Backend validates JWT and extracts `user_id`
5. All responses filtered by authenticated `user_id`

**Authentication Header** (automatic via cookies):
```
Cookie: auth_token=<jwt_token>
```

**401 Response Handling**:
- Frontend redirects to `/login` on 401 status
- User must re-authenticate

---

## Task Endpoints

### 1. List Tasks

**Endpoint**: `GET /api/tasks`

**Description**: Retrieve all tasks for the authenticated user with optional filtering and sorting.

**Query Parameters**:
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| status | string | No | Filter by status: 'all', 'pending', 'completed' | `?status=pending` |
| sortField | string | No | Sort field: 'created_at', 'title', 'updated_at' | `?sortField=title` |
| sortOrder | string | No | Sort order: 'asc', 'desc' | `?sortOrder=asc` |

**Request Example**:
```http
GET /api/tasks?status=pending&sortField=created_at&sortOrder=desc
Cookie: auth_token=<jwt_token>
```

**Success Response** (200 OK):
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

**Error Responses**:
- `401 Unauthorized`: Invalid or expired JWT token
- `500 Internal Server Error`: Server error

---

### 2. Get Task by ID

**Endpoint**: `GET /api/tasks/{id}`

**Description**: Retrieve a single task by ID for the authenticated user.

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | Task ID |

**Request Example**:
```http
GET /api/tasks/550e8400-e29b-41d4-a716-446655440000
Cookie: auth_token=<jwt_token>
```

**Success Response** (200 OK):
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

**Error Responses**:
- `401 Unauthorized`: Invalid or expired JWT token
- `404 Not Found`: Task not found or doesn't belong to user
- `500 Internal Server Error`: Server error

---

### 3. Create Task

**Endpoint**: `POST /api/tasks`

**Description**: Create a new task for the authenticated user.

**Request Body**:
```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive docs for the API"
}
```

**Field Constraints**:
- `title`: Required, 1-200 characters
- `description`: Optional, max 1000 characters

**Request Example**:
```http
POST /api/tasks
Content-Type: application/json
Cookie: auth_token=<jwt_token>

{
  "title": "Complete project documentation",
  "description": "Write comprehensive docs for the API"
}
```

**Success Response** (201 Created):
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

**Error Responses**:
- `400 Bad Request`: Validation error (title missing, too long, etc.)
  ```json
  {
    "detail": {
      "title": ["Title is required"],
      "description": ["Description must be 1000 characters or less"]
    }
  }
  ```
- `401 Unauthorized`: Invalid or expired JWT token
- `500 Internal Server Error`: Server error

---

### 4. Update Task

**Endpoint**: `PUT /api/tasks/{id}`

**Description**: Update an existing task for the authenticated user.

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | Task ID |

**Request Body** (all fields optional):
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "completed": true
}
```

**Request Example**:
```http
PUT /api/tasks/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json
Cookie: auth_token=<jwt_token>

{
  "title": "Updated title",
  "description": "Updated description"
}
```

**Success Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Updated title",
  "description": "Updated description",
  "completed": false,
  "created_at": "2026-01-06T10:00:00Z",
  "updated_at": "2026-01-06T11:30:00Z",
  "user_id": "user-123"
}
```

**Error Responses**:
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Invalid or expired JWT token
- `404 Not Found`: Task not found or doesn't belong to user
- `500 Internal Server Error`: Server error

---

### 5. Delete Task

**Endpoint**: `DELETE /api/tasks/{id}`

**Description**: Delete a task for the authenticated user.

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | Task ID |

**Request Example**:
```http
DELETE /api/tasks/550e8400-e29b-41d4-a716-446655440000
Cookie: auth_token=<jwt_token>
```

**Success Response** (204 No Content):
```
(empty body)
```

**Error Responses**:
- `401 Unauthorized`: Invalid or expired JWT token
- `404 Not Found`: Task not found or doesn't belong to user
- `500 Internal Server Error`: Server error

---

### 6. Toggle Task Completion

**Endpoint**: `PATCH /api/tasks/{id}/complete`

**Description**: Toggle the completion status of a task (pending ↔ completed).

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | Task ID |

**Request Example**:
```http
PATCH /api/tasks/550e8400-e29b-41d4-a716-446655440000/complete
Cookie: auth_token=<jwt_token>
```

**Success Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Complete project documentation",
  "description": "Write comprehensive docs for the API",
  "completed": true,
  "created_at": "2026-01-06T10:00:00Z",
  "updated_at": "2026-01-06T12:00:00Z",
  "user_id": "user-123"
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or expired JWT token
- `404 Not Found`: Task not found or doesn't belong to user
- `500 Internal Server Error`: Server error

---

## Error Response Format

All error responses follow this structure:

**Validation Error** (400):
```json
{
  "detail": {
    "field_name": ["Error message 1", "Error message 2"]
  }
}
```

**Authentication Error** (401):
```json
{
  "detail": "Unauthorized"
}
```

**Not Found Error** (404):
```json
{
  "detail": "Task not found"
}
```

**Server Error** (500):
```json
{
  "detail": "Internal server error"
}
```

---

## Rate Limiting

**Not implemented in Phase II** - All endpoints are unlimited for development.

Future consideration: 100 requests per minute per user.

---

## CORS Configuration

**Development**:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- CORS enabled for localhost origins

**Production**:
- CORS configured for production domain
- Credentials (cookies) allowed

---

## Testing Endpoints

### Using curl

```bash
# List tasks
curl -X GET http://localhost:8000/api/tasks \
  -H "Cookie: auth_token=<jwt_token>"

# Create task
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=<jwt_token>" \
  -d '{"title":"Test task","description":"Test description"}'

# Update task
curl -X PUT http://localhost:8000/api/tasks/<task_id> \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=<jwt_token>" \
  -d '{"title":"Updated title"}'

# Delete task
curl -X DELETE http://localhost:8000/api/tasks/<task_id> \
  -H "Cookie: auth_token=<jwt_token>"

# Toggle completion
curl -X PATCH http://localhost:8000/api/tasks/<task_id>/complete \
  -H "Cookie: auth_token=<jwt_token>"
```

---

## Frontend Integration

See `api-types.ts` for TypeScript interfaces and `lib/api.ts` for implementation.

**Status**: ✅ Complete
