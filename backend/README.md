# Todo App Backend API

FastAPI-based backend service for the Phase II Todo App with JWT authentication, user isolation, and PostgreSQL database.

## Features

- **RESTful API**: 6 endpoints for complete task CRUD operations
- **JWT Authentication**: Verify tokens from Better Auth (frontend)
- **User Isolation**: Each user can only access their own tasks
- **PostgreSQL Database**: Neon Serverless with SQLModel ORM
- **CORS Support**: Configured for frontend integration
- **Input Validation**: Pydantic schemas for all requests/responses
- **Error Handling**: Consistent error responses with proper status codes
- **Health Checks**: `/health` and `/health/db` endpoints

## Technology Stack

- **Framework**: FastAPI 0.109.0
- **ORM**: SQLModel 0.0.14
- **Database**: PostgreSQL (Neon Serverless)
- **Authentication**: python-jose (JWT verification)
- **Server**: Uvicorn (ASGI)
- **Python**: 3.11+

## Project Structure

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
│       └── auth.py          # JWT verification logic
├── tests/
│   ├── __init__.py
│   ├── conftest.py          # Pytest fixtures
│   └── test_tasks.py        # Task endpoint tests
├── requirements.txt
├── Dockerfile
├── .env.example
└── README.md
```

## API Endpoints

All endpoints require JWT authentication via `auth_token` cookie.

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List all tasks (with filtering/sorting) |
| GET | `/api/tasks/{id}` | Get single task by ID |
| POST | `/api/tasks` | Create new task |
| PUT | `/api/tasks/{id}` | Update task |
| DELETE | `/api/tasks/{id}` | Delete task |
| PATCH | `/api/tasks/{id}/complete` | Toggle task completion |

### Health Checks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health status |
| GET | `/health/db` | Database connectivity check |

## Setup Instructions

### Prerequisites

- Python 3.11 or higher
- PostgreSQL database (local or Neon)
- Better Auth secret (shared with frontend)

### 1. Clone Repository

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

```bash
# Copy example file
cp .env.example .env.local

# Edit .env.local with your values
# Required:
# - DATABASE_URL (PostgreSQL connection string)
# - BETTER_AUTH_SECRET (shared with frontend)
# - FRONTEND_URL (for CORS)
```

**Generate BETTER_AUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 5. Run Database Migrations

Database tables are created automatically on first startup.

### 6. Start Development Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Server will start at: `http://localhost:8000`

### 7. Access API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+asyncpg://user:pass@host:5432/db` |
| `BETTER_AUTH_SECRET` | JWT verification secret (32+ chars) | `dGhpc2lzYXZlcnlzZWN1cmVzZWNyZXQ=` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

### Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `ENVIRONMENT` | `development` | Environment name |
| `PORT` | `8000` | Server port |
| `HOST` | `0.0.0.0` | Server host |
| `RELOAD` | `false` | Auto-reload on code changes |
| `WORKERS` | `1` | Number of worker processes |
| `LOG_LEVEL` | `INFO` | Logging level |
| `DB_POOL_SIZE` | `10` | Database connection pool size |
| `DB_MAX_OVERFLOW` | `20` | Max additional connections |

## Docker Deployment

### Build Image

```bash
docker build -t todo-backend .
```

### Run Container

```bash
docker run -d \
  -p 8000:8000 \
  -e DATABASE_URL="postgresql+asyncpg://..." \
  -e BETTER_AUTH_SECRET="..." \
  -e FRONTEND_URL="http://localhost:3000" \
  --name todo-backend \
  todo-backend
```

### Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql+asyncpg://postgres:postgres@db:5432/todoapp
      BETTER_AUTH_SECRET: ${BETTER_AUTH_SECRET}
      FRONTEND_URL: http://localhost:3000
      ENVIRONMENT: development
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: todoapp
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Testing

### Run Tests

```bash
pytest
```

### Run with Coverage

```bash
pytest --cov=app --cov-report=html
```

### Test Endpoints with curl

**List tasks:**
```bash
curl -X GET "http://localhost:8000/api/tasks" \
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
curl -X PUT "http://localhost:8000/api/tasks/<task_id>" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=<jwt_token>" \
  -d '{"title":"Updated title","completed":true}'
```

**Delete task:**
```bash
curl -X DELETE "http://localhost:8000/api/tasks/<task_id>" \
  -H "Cookie: auth_token=<jwt_token>"
```

**Toggle completion:**
```bash
curl -X PATCH "http://localhost:8000/api/tasks/<task_id>/complete" \
  -H "Cookie: auth_token=<jwt_token>"
```

## Security

### Authentication

- All endpoints (except `/health`) require JWT authentication
- JWT tokens verified using `BETTER_AUTH_SECRET`
- Tokens extracted from `auth_token` httpOnly cookie
- User ID extracted from JWT claims, never from request body

### User Isolation

- All database queries filtered by authenticated `user_id`
- Users cannot access other users' tasks
- Ownership verified before all mutations (update/delete)

### Input Validation

- All inputs validated using Pydantic schemas
- SQL injection prevented by SQLModel ORM parameterization
- Field length limits enforced (title: 200 chars, description: 1000 chars)

### CORS

- Explicit origin whitelist (no wildcard in production)
- Credentials (cookies) allowed only for trusted origins
- Methods restricted to required HTTP verbs

## Troubleshooting

### Issue: "DATABASE_URL not set"

**Solution:**
1. Ensure `.env.local` exists
2. Verify `DATABASE_URL` is defined
3. Restart application

### Issue: "Authentication failed" (401 errors)

**Solution:**
1. Verify `BETTER_AUTH_SECRET` matches frontend
2. Check for extra whitespace in secret
3. Ensure JWT token is valid and not expired

### Issue: "CORS error" in browser

**Solution:**
1. Verify `FRONTEND_URL` matches actual frontend URL
2. Check CORS middleware configuration
3. Ensure `allow_credentials=True` is set

### Issue: "Database connection failed"

**Solution:**
1. Verify `DATABASE_URL` format is correct
2. Test connection with `psql` or database client
3. Check database is running (Docker: `docker-compose ps`)
4. Verify network connectivity

## Production Deployment

### Checklist

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

### Recommended Platforms

- **Vercel**: Serverless deployment with environment variables
- **Railway**: Container deployment with PostgreSQL
- **Fly.io**: Global edge deployment
- **AWS ECS**: Container orchestration with RDS
- **Google Cloud Run**: Serverless containers

## Related Documentation

- **Specifications**: `specs/002-todo-backend/spec.md`
- **API Contracts**: `specs/002-todo-backend/contracts/api-endpoints.md`
- **Database Schema**: `specs/002-todo-backend/data-model.md`
- **Security**: `specs/002-todo-backend/security.md`
- **Environment**: `specs/002-todo-backend/environment.md`
- **Constitution**: `.specify/memory/constitution.md`

## License

Phase II Todo App - Hackathon Project

## Support

For issues or questions, refer to the specification documents in `specs/002-todo-backend/`.
