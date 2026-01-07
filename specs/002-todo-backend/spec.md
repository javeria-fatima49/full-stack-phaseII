---
title: Todo App Backend API Service
type: feature
status: draft
version: 1.0
created: 2026-01-07
updated: 2026-01-07
owners: backend-team
tags: [backend, fastapi, api, authentication, database]
---

# Todo App Backend API Service

## Overview

This specification defines the FastAPI-based backend service for the Phase II Todo App. The backend provides a RESTful API for task management with JWT-based authentication, user isolation, and persistent storage using PostgreSQL with SQLModel ORM.

The backend serves as the data layer and business logic tier, exposing endpoints that the Next.js frontend consumes. All operations are scoped to authenticated users, ensuring complete data isolation between users.

**Key Responsibilities:**
- Authenticate and authorize API requests using JWT tokens
- Provide CRUD operations for user tasks
- Enforce user isolation at the database query level
- Validate all input data and return structured error responses
- Maintain data consistency and integrity
- Enable CORS for frontend communication

**Integration Points:**
- Frontend: Next.js application at `http://localhost:3000` (dev) or production domain
- Authentication: Better Auth (frontend) issues JWT tokens; backend verifies them
- Database: Neon Serverless PostgreSQL via SQLModel ORM
- Related Specs: `@specs/001-todo-frontend/contracts/api-endpoints.md`

---

## User Stories

### US-1: API Authentication
**As a** backend service
**I want to** verify JWT tokens on every request
**So that** only authenticated users can access their data

**Priority:** P0 (Critical)

**Acceptance Criteria:**
- [ ] Extract JWT token from `Cookie: auth_token=<token>` header
- [ ] Verify token signature using `BETTER_AUTH_SECRET`
- [ ] Extract `user_id` from token claims
- [ ] Return `401 Unauthorized` for missing, invalid, or expired tokens
- [ ] Attach `user_id` to request context for downstream use

---

### US-2: List User Tasks
**As a** backend service
**I want to** retrieve all tasks for an authenticated user with filtering and sorting
**So that** the frontend can display tasks according to user preferences

**Priority:** P0 (Critical)

**Acceptance Criteria:**
- [ ] Accept query parameters: `status` (all/pending/completed), `sortField` (created_at/title/updated_at), `sortOrder` (asc/desc)
- [ ] Filter tasks by authenticated `user_id` automatically
- [ ] Apply status filter if provided (default: all)
- [ ] Sort results by specified field and order (default: created_at desc)
- [ ] Return array of task objects with all fields
- [ ] Return empty array `[]` if user has no tasks
- [ ] Return `401` if unauthenticated

---

### US-3: Retrieve Single Task
**As a** backend service
**I want to** fetch a specific task by ID for the authenticated user
**So that** the frontend can display task details

**Priority:** P0 (Critical)

**Acceptance Criteria:**
- [ ] Accept UUID task ID as path parameter
- [ ] Verify task belongs to authenticated user
- [ ] Return task object with all fields if found and owned by user
- [ ] Return `404 Not Found` if task doesn't exist or belongs to another user
- [ ] Return `401` if unauthenticated

---

### US-4: Create New Task
**As a** backend service
**I want to** create a new task for the authenticated user
**So that** users can add tasks to their list

**Priority:** P0 (Critical)

**Acceptance Criteria:**
- [ ] Accept JSON body with `title` (required) and `description` (optional)
- [ ] Validate `title`: 1-200 characters, non-empty
- [ ] Validate `description`: max 1000 characters if provided
- [ ] Generate UUID for new task
- [ ] Set `user_id` to authenticated user (never trust client input)
- [ ] Set `completed` to `false` by default
- [ ] Set `created_at` and `updated_at` to current timestamp
- [ ] Return created task with `201 Created` status
- [ ] Return `400 Bad Request` with validation errors if invalid
- [ ] Return `401` if unauthenticated

---

### US-5: Update Existing Task
**As a** backend service
**I want to** update task fields for the authenticated user
**So that** users can modify their tasks

**Priority:** P0 (Critical)

**Acceptance Criteria:**
- [ ] Accept UUID task ID as path parameter
- [ ] Accept JSON body with optional fields: `title`, `description`, `completed`
- [ ] Verify task belongs to authenticated user
- [ ] Validate `title` if provided: 1-200 characters
- [ ] Validate `description` if provided: max 1000 characters
- [ ] Update only provided fields (partial update)
- [ ] Update `updated_at` to current timestamp
- [ ] Return updated task with `200 OK` status
- [ ] Return `404 Not Found` if task doesn't exist or belongs to another user
- [ ] Return `400 Bad Request` with validation errors if invalid
- [ ] Return `401` if unauthenticated

---

### US-6: Delete Task
**As a** backend service
**I want to** permanently delete a task for the authenticated user
**So that** users can remove tasks from their list

**Priority:** P0 (Critical)

**Acceptance Criteria:**
- [ ] Accept UUID task ID as path parameter
- [ ] Verify task belongs to authenticated user
- [ ] Delete task from database (hard delete)
- [ ] Return `204 No Content` on successful deletion
- [ ] Return `404 Not Found` if task doesn't exist or belongs to another user
- [ ] Return `401` if unauthenticated

---

### US-7: Toggle Task Completion
**As a** backend service
**I want to** toggle a task's completion status
**So that** users can mark tasks as done or pending with a single action

**Priority:** P0 (Critical)

**Acceptance Criteria:**
- [ ] Accept UUID task ID as path parameter
- [ ] Verify task belongs to authenticated user
- [ ] Toggle `completed` field: `false` → `true` or `true` → `false`
- [ ] Update `updated_at` to current timestamp
- [ ] Return updated task with `200 OK` status
- [ ] Return `404 Not Found` if task doesn't exist or belongs to another user
- [ ] Return `401` if unauthenticated

---

## Technical Architecture

### Framework and Libraries
- **FastAPI**: Web framework for building APIs
- **SQLModel**: ORM for database operations (combines SQLAlchemy + Pydantic)
- **Pydantic**: Data validation and serialization
- **python-jose**: JWT token verification
- **uvicorn**: ASGI server for running FastAPI
- **asyncpg**: Async PostgreSQL driver

### Project Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration and environment variables
│   ├── database.py          # Database connection and session management
│   ├── models/
│   │   ├── __init__.py
│   │   └── task.py          # SQLModel Task model
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── task.py          # Pydantic request/response schemas
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py          # Dependency injection (auth, db session)
│   │   └── routes/
│   │       ├── __init__.py
│   │       └── tasks.py     # Task endpoints
│   └── core/
│       ├── __init__.py
│       ├── auth.py          # JWT verification logic
│       └── exceptions.py    # Custom exception handlers
├── tests/
│   ├── __init__.py
│   ├── conftest.py          # Pytest fixtures
│   └── test_tasks.py        # Task endpoint tests
├── requirements.txt
├── Dockerfile
└── .env.example
```

### Request Flow
1. **Request arrives** at FastAPI endpoint
2. **CORS middleware** validates origin
3. **Authentication dependency** extracts and verifies JWT from cookie
4. **User ID extracted** from JWT claims and attached to request
5. **Route handler** processes request with user context
6. **Database query** filtered by `user_id` automatically
7. **Response serialized** using Pydantic schemas
8. **Response returned** with appropriate status code

---

## Dependencies

### External Dependencies
- **Frontend Application**: `@specs/001-todo-frontend/contracts/api-endpoints.md`
  - Expects specific endpoint paths, methods, and response formats
  - Sends JWT tokens via httpOnly cookies
  - Handles 401 responses by redirecting to login

- **Better Auth (Frontend)**: JWT token issuer
  - Issues JWT tokens with `user_id` claim
  - Uses shared secret (`BETTER_AUTH_SECRET`) for signing
  - Sets httpOnly cookies automatically

- **Neon PostgreSQL**: Database service
  - Provides `DATABASE_URL` connection string
  - Serverless PostgreSQL with connection pooling
  - Supports async operations via asyncpg

### Internal Dependencies
- **Database Schema**: `@specs/002-todo-backend/data-model.md`
- **Authentication Specification**: `@specs/002-todo-backend/security.md`
- **Environment Configuration**: `@specs/002-todo-backend/environment.md`
- **API Contracts**: `@specs/002-todo-backend/contracts/api-endpoints.md`

### Constitution Compliance
- **Spec-Driven Development**: `@.specify/memory/constitution.md` Section V
- **Authentication Model**: `@.specify/memory/constitution.md` Section VII
- **API Rules**: `@.specify/memory/constitution.md` Section VIII
- **Technology Stack**: `@.specify/memory/constitution.md` Section III

---

## Non-Functional Requirements

### Performance
- **Response Time**:
  - p95 latency < 200ms for all endpoints
  - p99 latency < 500ms for all endpoints
- **Throughput**: Support 100 requests/second per instance
- **Database Queries**:
  - All queries must use indexes (no full table scans)
  - Connection pooling enabled (min: 5, max: 20 connections)
- **Startup Time**: Application ready in < 5 seconds

### Security
- **Authentication**:
  - JWT verification on every protected endpoint
  - Token expiration enforced (reject expired tokens)
  - Secure secret management (never hardcode secrets)
- **Authorization**:
  - User isolation enforced at database query level
  - No user can access another user's tasks
  - User ID extracted from JWT, never from request body/params
- **Input Validation**:
  - All inputs validated using Pydantic schemas
  - SQL injection prevented by ORM parameterization
  - XSS prevention via proper content-type headers
- **CORS**:
  - Whitelist specific origins (no wildcard in production)
  - Credentials (cookies) allowed only for trusted origins

### Reliability
- **Error Handling**:
  - All exceptions caught and converted to appropriate HTTP responses
  - Internal errors logged with correlation IDs
  - No stack traces exposed to clients in production
- **Database Resilience**:
  - Connection retry logic (3 attempts with exponential backoff)
  - Graceful degradation if database unavailable
  - Health check endpoint for monitoring
- **Data Integrity**:
  - Foreign key constraints enforced
  - Transactions used for multi-step operations
  - Unique constraints on task IDs

### Observability
- **Logging**:
  - Structured JSON logs with timestamp, level, message, context
  - Log all authentication failures
  - Log all 4xx and 5xx responses
- **Metrics**:
  - Request count by endpoint and status code
  - Response time histograms
  - Database connection pool utilization
- **Health Checks**:
  - `/health` endpoint returns 200 if service is healthy
  - `/health/db` endpoint checks database connectivity

### Scalability
- **Horizontal Scaling**: Stateless design allows multiple instances
- **Database Connection Pooling**: Efficient connection reuse
- **Async Operations**: Non-blocking I/O for concurrent requests

---

## Error Handling Strategy

### Error Categories

#### 1. Authentication Errors (401 Unauthorized)
**Triggers:**
- Missing `auth_token` cookie
- Invalid JWT signature
- Expired JWT token
- Malformed JWT token

**Response Format:**
```json
{
  "detail": "Unauthorized"
}
```

**Handling:**
- Log authentication failure with user IP and timestamp
- Return 401 status code
- Frontend redirects to login page

---

#### 2. Validation Errors (400 Bad Request)
**Triggers:**
- Missing required fields (e.g., `title` in create request)
- Field exceeds max length (e.g., `title` > 200 chars)
- Invalid field type (e.g., `completed` is not boolean)
- Invalid UUID format for task ID

**Response Format:**
```json
{
  "detail": {
    "title": ["Title is required"],
    "description": ["Description must be 1000 characters or less"]
  }
}
```

**Handling:**
- Validate using Pydantic schemas
- Return all validation errors in single response
- Log validation failures for monitoring

---

#### 3. Not Found Errors (404 Not Found)
**Triggers:**
- Task ID does not exist in database
- Task exists but belongs to different user
- Invalid endpoint path

**Response Format:**
```json
{
  "detail": "Task not found"
}
```

**Handling:**
- Query database with user_id filter
- Return 404 if no results (don't reveal if task exists for other users)
- Log access attempts to non-existent resources

---

#### 4. Server Errors (500 Internal Server Error)
**Triggers:**
- Database connection failure
- Unexpected exceptions in business logic
- ORM errors

**Response Format:**
```json
{
  "detail": "Internal server error"
}
```

**Handling:**
- Log full exception with stack trace and correlation ID
- Return generic error message (no sensitive details)
- Alert on-call engineer if error rate exceeds threshold

---

### Error Handling Implementation

**Exception Handlers:**
```python
# Custom exception handler for HTTPException
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

# Custom exception handler for validation errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    errors = {}
    for error in exc.errors():
        field = error["loc"][-1]
        message = error["msg"]
        if field not in errors:
            errors[field] = []
        errors[field].append(message)
    return JSONResponse(
        status_code=400,
        content={"detail": errors}
    )

# Catch-all exception handler
@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )
```

---

## CORS Configuration

### Development Environment
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["*"],
)
```

### Production Environment
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL")],  # e.g., https://app.example.com
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)
```

**Requirements:**
- `allow_credentials=True` required for cookie-based authentication
- `allow_origins` must be explicit (no wildcard `*` with credentials)
- `allow_methods` restricted to required HTTP methods only
- `allow_headers` restricted in production for security

---

## Edge Cases and Error Scenarios

### Edge Case 1: Concurrent Task Updates
**Scenario:** Two requests update the same task simultaneously

**Handling:**
- Use database-level locking or optimistic concurrency control
- Last write wins (acceptable for this use case)
- `updated_at` timestamp reflects most recent update

---

### Edge Case 2: Empty Task List
**Scenario:** User has no tasks (new user or deleted all tasks)

**Handling:**
- Return empty array `[]` with `200 OK` status
- Frontend displays "No tasks yet" message

---

### Edge Case 3: Invalid UUID Format
**Scenario:** Client sends malformed UUID in path parameter

**Handling:**
- FastAPI path validation catches invalid UUIDs
- Return `422 Unprocessable Entity` with validation error
- Log malformed request for security monitoring

---

### Edge Case 4: Database Connection Lost
**Scenario:** Database becomes unavailable during request

**Handling:**
- Retry connection 3 times with exponential backoff
- If all retries fail, return `503 Service Unavailable`
- Log database connectivity issues
- Health check endpoint reports unhealthy status

---

### Edge Case 5: JWT Token Expired Mid-Session
**Scenario:** User's token expires while using the application

**Handling:**
- Return `401 Unauthorized` on next request
- Frontend detects 401 and redirects to login
- User re-authenticates and receives new token

---

### Edge Case 6: Extremely Long Input Strings
**Scenario:** Client sends title > 200 chars or description > 1000 chars

**Handling:**
- Pydantic validation rejects before database query
- Return `400 Bad Request` with specific field errors
- No database write attempted

---

### Edge Case 7: SQL Injection Attempt
**Scenario:** Client sends malicious SQL in input fields

**Handling:**
- SQLModel ORM uses parameterized queries (automatic protection)
- Input treated as data, never executed as SQL
- Log suspicious patterns for security analysis

---

## Open Questions

None - all requirements are clearly defined in frontend API contracts and constitution.

---

## Validation Checklist

### Specification Completeness
- [x] All user stories have testable acceptance criteria
- [x] Error cases documented with specific status codes
- [x] Examples provided for all endpoints (see contracts/api-endpoints.md)
- [x] Cross-references use correct `@specs/...` notation
- [x] Aligns with constitution principles
- [x] File path follows project conventions
- [x] Front matter is complete and accurate

### Implementation Readiness
- [x] All API endpoints match frontend expectations exactly
- [x] Database schema defined (see data-model.md)
- [x] Authentication strategy specified (see security.md)
- [x] Environment variables documented (see environment.md)
- [x] Error handling strategy is comprehensive
- [x] CORS configuration is secure and functional
- [x] Non-functional requirements are measurable

### Testability
- [x] Each acceptance criterion can be tested with automated tests
- [x] Error scenarios can be simulated in tests
- [x] Edge cases have clear expected behaviors
- [x] Integration points are well-defined

---

## Next Steps

1. **Review Specification**: Ensure all stakeholders agree on requirements
2. **Create Implementation Plan**: Use `spec-planner` agent to generate `plan.md`
3. **Generate Tasks**: Use `task-generator` agent to create `tasks.md`
4. **Implement Backend**: Follow tasks in dependency order
5. **Write Tests**: Create automated tests for all acceptance criteria
6. **Integration Testing**: Verify frontend-backend integration
7. **Deploy**: Set up production environment with proper secrets

---

## Related Specifications

- `@specs/001-todo-frontend/contracts/api-endpoints.md` - Frontend API expectations
- `@specs/002-todo-backend/data-model.md` - Database schema
- `@specs/002-todo-backend/contracts/api-endpoints.md` - Detailed API contracts
- `@specs/002-todo-backend/security.md` - JWT authentication specification
- `@specs/002-todo-backend/environment.md` - Environment configuration
- `@.specify/memory/constitution.md` - Project principles and rules
