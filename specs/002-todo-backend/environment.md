---
title: Todo App Backend Environment Configuration
type: configuration
status: draft
version: 1.0
created: 2026-01-07
updated: 2026-01-07
owners: backend-team
tags: [environment, configuration, secrets, deployment]
---

# Todo App Backend Environment Configuration

## Overview

This document defines all environment variables, configuration settings, and secrets required for the Todo App backend. Proper configuration is critical for security, database connectivity, and integration with the frontend authentication system.

**Configuration Method:** Environment variables via `.env` files (development) or platform-specific secrets management (production)

**Security Principle:** Never commit secrets to version control

---

## Required Environment Variables

### 1. DATABASE_URL

**Purpose:** PostgreSQL database connection string for Neon Serverless

**Format:**
```
postgresql+asyncpg://[user]:[password]@[host]:[port]/[database]?ssl=require
```

**Example (Development):**
```
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/todoapp?ssl=require
```

**Example (Production - Neon):**
```
DATABASE_URL=postgresql+asyncpg://user:pass@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?ssl=require
```

**Validation Rules:**
- Must start with `postgresql+asyncpg://` (asyncpg driver required)
- Must include `?ssl=require` for production (Neon requirement)
- Must be valid PostgreSQL connection string
- Connection must be testable on application startup

**Error Handling:**
- If missing: Application fails to start with clear error message
- If invalid: Application logs connection error and exits
- If unreachable: Application retries 3 times with exponential backoff, then exits

**Where to Get:**
- **Development:** Local PostgreSQL or Docker container
- **Production:** Neon dashboard → Project → Connection String

---

### 2. BETTER_AUTH_SECRET

**Purpose:** Shared secret for verifying JWT tokens issued by Better Auth (frontend)

**Format:** Base64-encoded string (minimum 32 characters, 256 bits)

**Example:**
```
BETTER_AUTH_SECRET=dGhpc2lzYXZlcnlzZWN1cmVzZWNyZXR0aGF0aXNhdGxlYXN0MzJjaGFycw==
```

**Generation:**
```bash
# Generate secure random secret
openssl rand -base64 32
```

**Validation Rules:**
- Must be at least 32 characters long
- Must be identical to secret used by Better Auth (frontend)
- Must be cryptographically random (not a dictionary word or predictable pattern)
- Must never be committed to version control

**Error Handling:**
- If missing: Application fails to start with error "BETTER_AUTH_SECRET not configured"
- If too short: Application warns and refuses to start
- If mismatch with frontend: All authentication requests fail with 401

**Security Requirements:**
- Rotate every 90 days (recommended)
- Store in secure secrets manager (production)
- Never log or expose in error messages
- Use different secrets for dev/staging/production

**Where to Get:**
- **Development:** Generate with `openssl rand -base64 32` and share with frontend team
- **Production:** Generate and store in platform secrets manager (e.g., Vercel, AWS Secrets Manager)

---

### 3. FRONTEND_URL

**Purpose:** Frontend application URL for CORS configuration

**Format:** Full URL with protocol (http:// or https://)

**Example (Development):**
```
FRONTEND_URL=http://localhost:3000
```

**Example (Production):**
```
FRONTEND_URL=https://app.example.com
```

**Validation Rules:**
- Must be valid URL with protocol
- Must not end with trailing slash
- Must match actual frontend deployment URL

**Error Handling:**
- If missing: Defaults to `http://localhost:3000` (development only)
- If invalid: Application logs warning and uses default
- If mismatch: CORS blocks frontend requests

**Usage:**
- CORS `allow_origins` configuration
- Redirect URLs (future feature)
- Webhook callbacks (future feature)

---

## Optional Environment Variables

### 4. ENVIRONMENT

**Purpose:** Deployment environment identifier

**Format:** String enum

**Valid Values:**
- `development` - Local development
- `staging` - Staging/testing environment
- `production` - Production environment

**Default:** `development`

**Example:**
```
ENVIRONMENT=production
```

**Usage:**
- Enable/disable debug logging
- Configure error reporting verbosity
- Enable/disable development-only features
- Determine security settings (e.g., HTTPS enforcement)

---

### 5. LOG_LEVEL

**Purpose:** Logging verbosity level

**Format:** String enum

**Valid Values:**
- `DEBUG` - Verbose logging (all messages)
- `INFO` - Informational messages
- `WARNING` - Warnings and errors
- `ERROR` - Errors only
- `CRITICAL` - Critical errors only

**Default:** `INFO`

**Example:**
```
LOG_LEVEL=DEBUG
```

**Usage:**
- Development: `DEBUG` for detailed logs
- Production: `INFO` or `WARNING` to reduce noise

---

### 6. PORT

**Purpose:** HTTP server port

**Format:** Integer (1-65535)

**Default:** `8000`

**Example:**
```
PORT=8000
```

**Usage:**
- Uvicorn server listens on this port
- Must match frontend API URL configuration
- Must not conflict with other services

---

### 7. HOST

**Purpose:** HTTP server host binding

**Format:** IP address or hostname

**Default:** `0.0.0.0` (all interfaces)

**Example:**
```
HOST=0.0.0.0
```

**Usage:**
- `0.0.0.0` - Listen on all network interfaces (production)
- `127.0.0.1` - Listen on localhost only (development)

---

### 8. RELOAD

**Purpose:** Enable auto-reload on code changes (development only)

**Format:** Boolean (`true` or `false`)

**Default:** `false`

**Example:**
```
RELOAD=true
```

**Usage:**
- Development: `true` for hot reload
- Production: `false` (never enable in production)

---

### 9. WORKERS

**Purpose:** Number of Uvicorn worker processes

**Format:** Integer (1-N)

**Default:** `1`

**Example:**
```
WORKERS=4
```

**Usage:**
- Development: `1` (single worker for debugging)
- Production: `2-4` (based on CPU cores)

**Calculation:**
```
workers = (2 * cpu_cores) + 1
```

---

### 10. DB_POOL_SIZE

**Purpose:** Database connection pool size

**Format:** Integer (1-N)

**Default:** `10`

**Example:**
```
DB_POOL_SIZE=10
```

**Usage:**
- Minimum number of database connections maintained
- Increase for high-traffic applications
- Must not exceed database connection limit

---

### 11. DB_MAX_OVERFLOW

**Purpose:** Maximum additional database connections beyond pool size

**Format:** Integer (0-N)

**Default:** `20`

**Example:**
```
DB_MAX_OVERFLOW=20
```

**Usage:**
- Allows temporary connection bursts
- Total max connections = `DB_POOL_SIZE + DB_MAX_OVERFLOW`

---

### 12. CORS_ORIGINS

**Purpose:** Comma-separated list of allowed CORS origins (overrides FRONTEND_URL)

**Format:** Comma-separated URLs

**Default:** Value of `FRONTEND_URL`

**Example:**
```
CORS_ORIGINS=http://localhost:3000,https://app.example.com,https://staging.example.com
```

**Usage:**
- Multiple frontend deployments (e.g., staging + production)
- Development + production simultaneously

---

## Environment File Templates

### Development: `.env.local`

```bash
# Database
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/todoapp

# Authentication
BETTER_AUTH_SECRET=dGhpc2lzYWRldmVsb3BtZW50c2VjcmV0Zm9ydGVzdGluZw==

# Frontend
FRONTEND_URL=http://localhost:3000

# Server
ENVIRONMENT=development
PORT=8000
HOST=0.0.0.0
RELOAD=true
WORKERS=1

# Logging
LOG_LEVEL=DEBUG

# Database Pool
DB_POOL_SIZE=5
DB_MAX_OVERFLOW=10
```

---

### Production: `.env.production` (Example - Use Secrets Manager)

```bash
# Database (from Neon)
DATABASE_URL=postgresql+asyncpg://user:pass@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?ssl=require

# Authentication (from secrets manager)
BETTER_AUTH_SECRET=${SECRET_FROM_VAULT}

# Frontend
FRONTEND_URL=https://app.example.com

# Server
ENVIRONMENT=production
PORT=8000
HOST=0.0.0.0
RELOAD=false
WORKERS=4

# Logging
LOG_LEVEL=INFO

# Database Pool
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20
```

---

### Docker: `.env.docker`

```bash
# Database (Docker service)
DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/todoapp

# Authentication
BETTER_AUTH_SECRET=dGhpc2lzYWRvY2tlcmRldmVsb3BtZW50c2VjcmV0

# Frontend (Docker service)
FRONTEND_URL=http://localhost:3000

# Server
ENVIRONMENT=development
PORT=8000
HOST=0.0.0.0
RELOAD=true
WORKERS=1

# Logging
LOG_LEVEL=DEBUG

# Database Pool
DB_POOL_SIZE=5
DB_MAX_OVERFLOW=10
```

---

## Configuration Loading

### Python Implementation

```python
# app/config.py
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.

    Uses Pydantic for validation and type safety.
    """

    # Required settings
    database_url: str
    better_auth_secret: str

    # Optional settings with defaults
    frontend_url: str = "http://localhost:3000"
    environment: str = "development"
    log_level: str = "INFO"
    port: int = 8000
    host: str = "0.0.0.0"
    reload: bool = False
    workers: int = 1
    db_pool_size: int = 10
    db_max_overflow: int = 20
    cors_origins: Optional[str] = None

    class Config:
        env_file = ".env.local"
        env_file_encoding = "utf-8"
        case_sensitive = False

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS origins into list"""
        if self.cors_origins:
            return [origin.strip() for origin in self.cors_origins.split(",")]
        return [self.frontend_url]

    def validate_settings(self):
        """Validate critical settings on startup"""
        # Validate database URL
        if not self.database_url.startswith("postgresql"):
            raise ValueError("DATABASE_URL must be a PostgreSQL connection string")

        # Validate secret length
        if len(self.better_auth_secret) < 32:
            raise ValueError("BETTER_AUTH_SECRET must be at least 32 characters")

        # Validate environment
        if self.environment not in ["development", "staging", "production"]:
            raise ValueError(f"Invalid ENVIRONMENT: {self.environment}")

        # Production checks
        if self.environment == "production":
            if self.reload:
                raise ValueError("RELOAD must be false in production")
            if "localhost" in self.frontend_url:
                raise ValueError("FRONTEND_URL cannot be localhost in production")
            if "ssl=require" not in self.database_url:
                raise ValueError("DATABASE_URL must include ssl=require in production")

# Create global settings instance
settings = Settings()
settings.validate_settings()
```

---

### Usage in Application

```python
# app/main.py
from fastapi import FastAPI
from app.config import settings

app = FastAPI(
    title="Todo App API",
    version="1.0.0",
    debug=(settings.environment == "development")
)

# Configure CORS
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["*"] if settings.environment == "development" else ["Content-Type"],
)

# Configure database
from sqlmodel import create_engine

engine = create_engine(
    settings.database_url,
    echo=(settings.log_level == "DEBUG"),
    pool_size=settings.db_pool_size,
    max_overflow=settings.db_max_overflow,
)
```

---

## Secrets Management

### Development

**Method:** `.env.local` file (gitignored)

**Setup:**
1. Copy `.env.example` to `.env.local`
2. Fill in values (use development credentials)
3. Never commit `.env.local` to version control

**`.gitignore` entries:**
```
.env.local
.env.*.local
.env.production
*.env
```

---

### Production

**Method:** Platform-specific secrets manager

**Recommended Services:**
- **Vercel:** Environment Variables in project settings
- **AWS:** AWS Secrets Manager or Parameter Store
- **Docker:** Docker Secrets or environment variables
- **Kubernetes:** Kubernetes Secrets

**Best Practices:**
1. Never store secrets in code or version control
2. Use different secrets for each environment
3. Rotate secrets regularly (every 90 days)
4. Limit access to secrets (principle of least privilege)
5. Audit secret access and changes
6. Use encryption at rest and in transit

---

### Example: Vercel Deployment

**Setup:**
1. Go to Vercel project settings
2. Navigate to "Environment Variables"
3. Add variables:
   - `DATABASE_URL` (from Neon)
   - `BETTER_AUTH_SECRET` (generated)
   - `FRONTEND_URL` (Vercel deployment URL)
   - `ENVIRONMENT=production`
4. Deploy application

---

### Example: Docker Secrets

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    secrets:
      - database_url
      - better_auth_secret
    environment:
      DATABASE_URL_FILE: /run/secrets/database_url
      BETTER_AUTH_SECRET_FILE: /run/secrets/better_auth_secret
      FRONTEND_URL: http://localhost:3000

secrets:
  database_url:
    file: ./secrets/database_url.txt
  better_auth_secret:
    file: ./secrets/better_auth_secret.txt
```

---

## Environment Validation

### Startup Checks

**Application must validate configuration on startup:**

```python
# app/main.py
from app.config import settings
import sys

@app.on_event("startup")
async def startup_validation():
    """Validate configuration and dependencies on startup"""
    try:
        # Validate settings
        settings.validate_settings()

        # Test database connection
        from app.database import engine
        with engine.connect() as conn:
            conn.execute("SELECT 1")

        print(f"✓ Configuration validated")
        print(f"✓ Database connection successful")
        print(f"✓ Environment: {settings.environment}")
        print(f"✓ Frontend URL: {settings.frontend_url}")

    except Exception as e:
        print(f"✗ Startup validation failed: {e}")
        sys.exit(1)
```

---

### Health Check Endpoint

**Expose health check for monitoring:**

```python
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "environment": settings.environment,
        "version": "1.0.0"
    }

@app.get("/health/db")
async def database_health_check():
    """Database connectivity check"""
    try:
        from app.database import engine
        with engine.connect() as conn:
            conn.execute("SELECT 1")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}
```

---

## Configuration Checklist

### Development Setup
- [ ] Copy `.env.example` to `.env.local`
- [ ] Set `DATABASE_URL` to local PostgreSQL
- [ ] Generate `BETTER_AUTH_SECRET` with `openssl rand -base64 32`
- [ ] Share secret with frontend team
- [ ] Set `FRONTEND_URL=http://localhost:3000`
- [ ] Set `ENVIRONMENT=development`
- [ ] Set `LOG_LEVEL=DEBUG`
- [ ] Set `RELOAD=true`
- [ ] Verify `.env.local` is in `.gitignore`

### Production Deployment
- [ ] Generate new `BETTER_AUTH_SECRET` (different from dev)
- [ ] Store secret in platform secrets manager
- [ ] Get `DATABASE_URL` from Neon dashboard
- [ ] Set `FRONTEND_URL` to production domain
- [ ] Set `ENVIRONMENT=production`
- [ ] Set `LOG_LEVEL=INFO`
- [ ] Set `RELOAD=false`
- [ ] Set `WORKERS` based on CPU cores
- [ ] Verify `ssl=require` in `DATABASE_URL`
- [ ] Test health check endpoints
- [ ] Verify CORS allows production frontend

### Security Checklist
- [ ] No secrets committed to version control
- [ ] Different secrets for dev/staging/production
- [ ] Secrets stored in secure secrets manager
- [ ] Secret rotation schedule established
- [ ] Access to secrets limited to authorized personnel
- [ ] Secrets never logged or exposed in errors
- [ ] `.env.local` in `.gitignore`
- [ ] `.env.example` provided (without actual secrets)

---

## Troubleshooting

### Issue: "DATABASE_URL not set"

**Cause:** Missing environment variable

**Solution:**
1. Check `.env.local` exists
2. Verify `DATABASE_URL` is defined
3. Restart application to reload environment

---

### Issue: "Authentication failed" (401 errors)

**Cause:** `BETTER_AUTH_SECRET` mismatch between frontend and backend

**Solution:**
1. Verify secret is identical in both applications
2. Check for extra whitespace or newlines
3. Regenerate secret and update both applications

---

### Issue: "CORS error" in browser

**Cause:** `FRONTEND_URL` mismatch or CORS misconfiguration

**Solution:**
1. Verify `FRONTEND_URL` matches actual frontend URL
2. Check browser console for specific CORS error
3. Ensure `allow_credentials=True` in CORS config
4. Verify frontend sends requests to correct backend URL

---

### Issue: "Database connection failed"

**Cause:** Invalid `DATABASE_URL` or database unreachable

**Solution:**
1. Verify connection string format
2. Test connection with `psql` or database client
3. Check database is running (Docker: `docker-compose ps`)
4. Verify network connectivity (firewall, VPN)
5. Check Neon dashboard for database status (production)

---

## Related Specifications

- `@specs/002-todo-backend/spec.md` - Main backend specification
- `@specs/002-todo-backend/security.md` - Security and authentication
- `@specs/002-todo-backend/data-model.md` - Database schema
- `@.specify/memory/constitution.md` - Environment variable principles (Section XI)
