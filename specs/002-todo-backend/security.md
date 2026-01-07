---
title: Todo App Backend Security Specification
type: security
status: draft
version: 1.0
created: 2026-01-07
updated: 2026-01-07
owners: backend-team
tags: [security, authentication, jwt, authorization]
---

# Todo App Backend Security Specification

## Overview

This document defines the security architecture for the Todo App backend, focusing on JWT-based authentication, user authorization, and data isolation. The backend verifies JWT tokens issued by Better Auth (frontend) and enforces strict user isolation at the database query level.

**Security Model:** Defense in depth with multiple layers
**Authentication Provider:** Better Auth (frontend)
**Token Type:** JWT (JSON Web Tokens)
**Authorization Model:** User-scoped resource access

---

## Authentication Architecture

### Token Flow

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Browser   │         │   Frontend   │         │   Backend   │
│             │         │ (Better Auth)│         │  (FastAPI)  │
└──────┬──────┘         └──────┬───────┘         └──────┬──────┘
       │                       │                        │
       │  1. Login Request     │                        │
       ├──────────────────────>│                        │
       │                       │                        │
       │                       │  2. Verify Credentials │
       │                       │  (Better Auth logic)   │
       │                       │                        │
       │  3. Set httpOnly      │                        │
       │     Cookie with JWT   │                        │
       │<──────────────────────┤                        │
       │                       │                        │
       │  4. API Request       │                        │
       │     (Cookie auto-sent)│                        │
       ├────────────────────────────────────────────────>│
       │                       │                        │
       │                       │  5. Extract JWT from   │
       │                       │     Cookie             │
       │                       │                        │
       │                       │  6. Verify JWT         │
       │                       │     Signature          │
       │                       │                        │
       │                       │  7. Extract user_id    │
       │                       │     from Claims        │
       │                       │                        │
       │                       │  8. Query DB with      │
       │                       │     user_id Filter     │
       │                       │                        │
       │  9. Response          │                        │
       │<────────────────────────────────────────────────┤
       │                       │                        │
```

---

## JWT Token Specification

### Token Structure

**Standard JWT format:**
```
<header>.<payload>.<signature>
```

**Example Token:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidXNlci0xMjMiLCJleHAiOjE3MDQ2MzYwMDB9.signature
```

---

### Token Header

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Fields:**
- `alg`: Algorithm used for signing (HS256 = HMAC-SHA256)
- `typ`: Token type (always "JWT")

---

### Token Payload (Claims)

**Required Claims:**

| Claim | Type | Description | Example |
|-------|------|-------------|---------|
| `user_id` | string | Unique user identifier | `"user-123"` |
| `exp` | integer | Expiration timestamp (Unix epoch) | `1704636000` |
| `iat` | integer | Issued at timestamp (Unix epoch) | `1704632400` |

**Optional Claims:**

| Claim | Type | Description | Example |
|-------|------|-------------|---------|
| `email` | string | User email address | `"user@example.com"` |
| `name` | string | User display name | `"John Doe"` |

**Example Payload:**
```json
{
  "user_id": "user-123",
  "email": "user@example.com",
  "name": "John Doe",
  "iat": 1704632400,
  "exp": 1704636000
}
```

**Note:** Backend only requires `user_id` claim. Other claims are ignored.

---

### Token Signature

**Algorithm:** HMAC-SHA256 (HS256)
**Secret:** `BETTER_AUTH_SECRET` environment variable
**Process:**
```
signature = HMAC-SHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  BETTER_AUTH_SECRET
)
```

**Security Requirements:**
- Secret must be at least 32 characters (256 bits)
- Secret must be cryptographically random
- Secret must be identical between frontend (Better Auth) and backend (FastAPI)
- Secret must never be committed to version control
- Secret must be rotated periodically (every 90 days recommended)

---

## JWT Verification Implementation

### FastAPI Dependency

```python
from fastapi import Depends, HTTPException, status, Request
from jose import JWTError, jwt
from datetime import datetime
import os

# Configuration
SECRET_KEY = os.getenv("BETTER_AUTH_SECRET")
ALGORITHM = "HS256"

async def get_current_user(request: Request) -> str:
    """
    Extract and verify JWT token from cookie, return user_id.

    Raises:
        HTTPException: 401 if token is missing, invalid, or expired

    Returns:
        str: Authenticated user_id from JWT claims
    """
    # Extract token from cookie
    token = request.cookies.get("auth_token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized"
        )

    try:
        # Verify token signature and decode payload
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        # Extract user_id from claims
        user_id: str = payload.get("user_id")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized"
            )

        # Check expiration (jose library does this automatically, but explicit check for clarity)
        exp = payload.get("exp")
        if exp and datetime.utcnow().timestamp() > exp:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized"
            )

        return user_id

    except JWTError as e:
        # Invalid signature, malformed token, or expired
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized"
        )
```

---

### Usage in Route Handlers

```python
from fastapi import APIRouter, Depends
from typing import List

router = APIRouter(prefix="/api/tasks")

@router.get("/", response_model=List[TaskResponse])
async def list_tasks(
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    List all tasks for authenticated user.

    current_user_id is automatically injected by FastAPI dependency injection.
    If authentication fails, get_current_user raises 401 before this function runs.
    """
    # Query database with user_id filter
    tasks = session.exec(
        select(Task).where(Task.user_id == current_user_id)
    ).all()

    return tasks
```

---

## Authorization and User Isolation

### Principle: User-Scoped Resources

**Rule:** Every database query MUST filter by authenticated `user_id`

**Enforcement Layers:**

1. **Authentication Layer:** Verify JWT and extract `user_id`
2. **Query Layer:** Add `WHERE user_id = ?` to all queries
3. **Validation Layer:** Verify resource ownership before mutations

---

### Query Patterns

#### ✅ Correct: User-Scoped Query

```python
# List tasks
tasks = session.exec(
    select(Task).where(Task.user_id == current_user_id)
).all()

# Get single task
task = session.exec(
    select(Task)
    .where(Task.id == task_id)
    .where(Task.user_id == current_user_id)
).first()
```

#### ❌ Incorrect: Unscoped Query (Security Vulnerability)

```python
# NEVER DO THIS - exposes all users' tasks
tasks = session.exec(select(Task)).all()

# NEVER DO THIS - allows access to other users' tasks
task = session.get(Task, task_id)
```

---

### Ownership Verification

**Before any mutation (update/delete), verify ownership:**

```python
@router.delete("/{id}", status_code=204)
async def delete_task(
    id: UUID,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Fetch task with user_id filter
    task = session.exec(
        select(Task)
        .where(Task.id == id)
        .where(Task.user_id == current_user_id)
    ).first()

    # If not found, return 404 (don't reveal if task exists for other users)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Delete task
    session.delete(task)
    session.commit()

    return None
```

---

## Security Threats and Mitigations

### Threat 1: JWT Token Theft

**Attack Vector:** Attacker steals JWT token via XSS or network interception

**Mitigations:**
1. **httpOnly Cookies:** Token not accessible to JavaScript (prevents XSS theft)
2. **Secure Flag:** Cookie only sent over HTTPS in production
3. **SameSite Flag:** Cookie not sent with cross-site requests (prevents CSRF)
4. **Short Expiration:** Tokens expire after 1 hour (limits damage window)
5. **HTTPS Only:** All production traffic encrypted (prevents network interception)

**Cookie Configuration (Frontend - Better Auth):**
```javascript
{
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 3600 // 1 hour
}
```

---

### Threat 2: Token Replay Attack

**Attack Vector:** Attacker intercepts valid token and reuses it

**Mitigations:**
1. **Expiration:** Tokens expire after 1 hour
2. **HTTPS:** Prevents interception in transit
3. **Token Rotation:** Frontend refreshes token before expiration

**Note:** Phase II does not implement token revocation. Future enhancement: maintain token blacklist in Redis.

---

### Threat 3: Brute Force Token Guessing

**Attack Vector:** Attacker tries to guess valid JWT signatures

**Mitigations:**
1. **Strong Secret:** 256-bit cryptographically random secret
2. **HMAC-SHA256:** Computationally infeasible to forge signatures
3. **Rate Limiting:** (Future) Limit authentication attempts per IP

**Secret Generation:**
```bash
# Generate secure secret
openssl rand -base64 32
```

---

### Threat 4: User Impersonation

**Attack Vector:** Attacker modifies JWT payload to change `user_id`

**Mitigations:**
1. **Signature Verification:** Any payload modification invalidates signature
2. **Backend Validation:** Backend always verifies signature before trusting claims
3. **Never Trust Client Input:** `user_id` always extracted from JWT, never from request body/params

**Example Attack (Fails):**
```
Original Token: {"user_id": "user-123"} + valid_signature
Modified Token: {"user_id": "user-456"} + valid_signature (now invalid)
Backend: Rejects token due to signature mismatch
```

---

### Threat 5: SQL Injection

**Attack Vector:** Attacker injects SQL code via input fields

**Mitigations:**
1. **ORM Parameterization:** SQLModel uses parameterized queries (automatic protection)
2. **Input Validation:** Pydantic validates all inputs before database queries
3. **Type Safety:** UUID type validation prevents injection in path parameters

**Example (Safe):**
```python
# SQLModel generates parameterized query
task = session.exec(
    select(Task).where(Task.title == user_input)
).first()

# Generated SQL (safe):
# SELECT * FROM tasks WHERE title = $1
# Parameters: [user_input]
```

---

### Threat 6: Cross-Site Request Forgery (CSRF)

**Attack Vector:** Attacker tricks user into making unwanted requests

**Mitigations:**
1. **SameSite Cookie:** Cookie not sent with cross-site requests
2. **CORS Policy:** Backend only accepts requests from trusted origins
3. **No State-Changing GET:** All mutations use POST/PUT/PATCH/DELETE

**Note:** Phase II relies on SameSite cookies. Future enhancement: implement CSRF tokens for additional protection.

---

### Threat 7: Information Disclosure

**Attack Vector:** Error messages reveal sensitive information

**Mitigations:**
1. **Generic Error Messages:** Never expose stack traces or internal details in production
2. **Consistent 404 Responses:** Don't reveal if task exists for other users
3. **Logging:** Log detailed errors server-side, return generic messages to client

**Example:**
```python
# ✅ Correct: Generic error message
if not task or task.user_id != current_user_id:
    raise HTTPException(status_code=404, detail="Task not found")

# ❌ Incorrect: Reveals information
if not task:
    raise HTTPException(status_code=404, detail="Task does not exist")
if task.user_id != current_user_id:
    raise HTTPException(status_code=403, detail="Task belongs to another user")
```

---

## Security Configuration

### Environment Variables

**Required:**
- `BETTER_AUTH_SECRET`: Shared secret for JWT verification (256-bit minimum)

**Recommended:**
- `JWT_ALGORITHM`: Algorithm for JWT verification (default: HS256)
- `TOKEN_EXPIRE_MINUTES`: Token expiration time (default: 60)

---

### CORS Configuration

**Development:**
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,  # Required for cookies
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["*"],
)
```

**Production:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL")],  # Explicit origin, no wildcard
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],  # Explicit headers
)
```

**Security Requirements:**
- `allow_credentials=True` required for cookie-based auth
- `allow_origins` must be explicit (no `*` wildcard with credentials)
- `allow_methods` restricted to required methods only
- `allow_headers` restricted in production

---

### Cookie Security (Frontend Configuration)

**Better Auth must set cookies with these flags:**

```javascript
{
  httpOnly: true,        // Not accessible to JavaScript (XSS protection)
  secure: true,          // Only sent over HTTPS (production)
  sameSite: 'lax',       // Not sent with cross-site requests (CSRF protection)
  maxAge: 3600,          // 1 hour expiration
  path: '/',             // Available to all routes
  domain: undefined      // Current domain only
}
```

---

## Security Testing

### Test Cases

#### Test 1: Missing Token
```bash
curl -X GET http://localhost:8000/api/tasks
# Expected: 401 Unauthorized
```

#### Test 2: Invalid Token
```bash
curl -X GET http://localhost:8000/api/tasks \
  -H "Cookie: auth_token=invalid.token.here"
# Expected: 401 Unauthorized
```

#### Test 3: Expired Token
```bash
# Generate token with past expiration
curl -X GET http://localhost:8000/api/tasks \
  -H "Cookie: auth_token=<expired_token>"
# Expected: 401 Unauthorized
```

#### Test 4: Modified Token (User Impersonation Attempt)
```bash
# Modify user_id in token payload
curl -X GET http://localhost:8000/api/tasks \
  -H "Cookie: auth_token=<modified_token>"
# Expected: 401 Unauthorized (signature mismatch)
```

#### Test 5: Access Other User's Task
```bash
# User A tries to access User B's task
curl -X GET http://localhost:8000/api/tasks/<user_b_task_id> \
  -H "Cookie: auth_token=<user_a_token>"
# Expected: 404 Not Found
```

#### Test 6: SQL Injection Attempt
```bash
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=<valid_token>" \
  -d '{"title":"Test'; DROP TABLE tasks;--"}'
# Expected: 201 Created (SQL injection prevented by ORM)
```

---

## Security Monitoring and Logging

### Events to Log

**Authentication Failures:**
```python
logger.warning(
    "Authentication failed",
    extra={
        "ip": request.client.host,
        "user_agent": request.headers.get("user-agent"),
        "timestamp": datetime.utcnow().isoformat(),
        "reason": "invalid_token"
    }
)
```

**Unauthorized Access Attempts:**
```python
logger.warning(
    "Unauthorized access attempt",
    extra={
        "user_id": current_user_id,
        "resource": f"task:{task_id}",
        "action": "delete",
        "timestamp": datetime.utcnow().isoformat()
    }
)
```

**Suspicious Patterns:**
- Multiple failed authentication attempts from same IP
- Attempts to access non-existent resources
- Malformed requests (potential attack probes)

---

## Security Checklist

### Implementation Checklist
- [ ] JWT verification implemented with `python-jose`
- [ ] `BETTER_AUTH_SECRET` loaded from environment (never hardcoded)
- [ ] All routes protected with `Depends(get_current_user)`
- [ ] All queries filter by `user_id`
- [ ] Ownership verified before mutations
- [ ] Generic error messages (no information disclosure)
- [ ] CORS configured with explicit origins
- [ ] httpOnly cookies used for token storage
- [ ] HTTPS enforced in production
- [ ] Security logging implemented

### Testing Checklist
- [ ] Missing token returns 401
- [ ] Invalid token returns 401
- [ ] Expired token returns 401
- [ ] Modified token returns 401
- [ ] User cannot access other user's tasks
- [ ] SQL injection attempts fail safely
- [ ] CORS blocks unauthorized origins
- [ ] Error messages don't reveal sensitive info

### Deployment Checklist
- [ ] `BETTER_AUTH_SECRET` set in production environment
- [ ] Secret is 256-bit cryptographically random
- [ ] HTTPS enabled with valid certificate
- [ ] CORS configured for production domain
- [ ] Security logging enabled
- [ ] Error tracking configured (e.g., Sentry)
- [ ] Rate limiting configured (future)

---

## Future Security Enhancements

### Phase III Considerations

1. **Token Revocation:**
   - Maintain token blacklist in Redis
   - Revoke tokens on logout or password change

2. **Rate Limiting:**
   - Limit authentication attempts per IP
   - Limit API requests per user

3. **CSRF Tokens:**
   - Additional layer beyond SameSite cookies
   - Required for state-changing operations

4. **Audit Logging:**
   - Log all data access and modifications
   - Compliance with data protection regulations

5. **Secret Rotation:**
   - Automated secret rotation every 90 days
   - Graceful handling of old tokens during rotation

6. **Multi-Factor Authentication:**
   - Optional 2FA for sensitive operations
   - Integration with authenticator apps

---

## Related Specifications

- `@specs/002-todo-backend/spec.md` - Main backend specification
- `@specs/002-todo-backend/data-model.md` - Database schema
- `@specs/002-todo-backend/contracts/api-endpoints.md` - API contracts
- `@specs/002-todo-backend/environment.md` - Environment configuration
- `@.specify/memory/constitution.md` - Security principles (Section VII)
