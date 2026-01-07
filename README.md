# Phase II Todo App - Full-Stack Web Application

A modern, full-stack todo application built with Next.js 16, FastAPI, and PostgreSQL. Features JWT authentication, user isolation, responsive design, and comprehensive accessibility support.

## 🎯 Project Overview

This is Phase II of the Todo App project, transforming a console application into a production-ready web application with:

- **Frontend**: Next.js 16 with TypeScript, Tailwind CSS, and shadcn/ui
- **Backend**: FastAPI with SQLModel ORM and JWT authentication
- **Database**: PostgreSQL (Neon Serverless or local)
- **Authentication**: Better Auth with JWT tokens
- **Deployment**: Docker Compose for local development, ready for cloud deployment

## 📋 Features

### User Features
- ✅ User authentication with JWT tokens
- ✅ Create, read, update, and delete tasks
- ✅ Toggle task completion status
- ✅ Filter tasks by status (All, Pending, Completed)
- ✅ Sort tasks by creation date, update date, or title
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Smooth animations and transitions
- ✅ Toast notifications for user feedback
- ✅ Keyboard navigation support
- ✅ Screen reader compatible (WCAG 2.1 AA)

### Technical Features
- ✅ Type-safe TypeScript throughout
- ✅ RESTful API with OpenAPI documentation
- ✅ User isolation at database level
- ✅ SQL injection prevention via ORM
- ✅ Input validation with Zod and Pydantic
- ✅ Error boundaries and comprehensive error handling
- ✅ Connection pooling and health checks
- ✅ Docker containerization
- ✅ Environment-based configuration

## 🏗️ Architecture

```
phaseII/
├── frontend/              # Next.js 16 application
│   ├── app/              # App Router pages
│   ├── components/       # React components
│   ├── lib/              # API client, utilities
│   ├── types/            # TypeScript definitions
│   └── hooks/            # Custom React hooks
│
├── backend/              # FastAPI application
│   ├── app/
│   │   ├── api/         # API routes
│   │   ├── core/        # Auth, utilities
│   │   ├── models/      # SQLModel database models
│   │   └── schemas/     # Pydantic schemas
│   └── tests/           # Backend tests
│
├── specs/                # Feature specifications
│   ├── 001-todo-frontend/
│   └── 002-todo-backend/
│
├── docker-compose.yml    # Full-stack orchestration
└── README.md            # This file
```

## 🚀 Quick Start

### Prerequisites

- **Docker & Docker Compose** (recommended for easiest setup)
- **OR** Node.js 18+, Python 3.11+, PostgreSQL 16+

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd phaseII
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` with your configuration**
   ```bash
   # Generate a secure secret (32+ characters)
   BETTER_AUTH_SECRET=your-secure-secret-key-here-min-32-chars

   # Database credentials
   POSTGRES_PASSWORD=your-secure-password

   # Optional: customize ports
   FRONTEND_PORT=3000
   BACKEND_PORT=8000
   POSTGRES_PORT=5432
   ```

4. **Start all services**
   ```bash
   docker compose up --build
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs
   - Database: localhost:5432

### Option 2: Manual Setup

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   source venv/bin/activate  # Linux/Mac
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your database URL and secrets
   ```

5. **Start backend server**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with API URL and auth secret
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access frontend**
   - Open http://localhost:3000

## 🔧 Configuration

### Environment Variables

#### Shared (Frontend & Backend)
- `BETTER_AUTH_SECRET` - JWT signing secret (32+ characters, must match between frontend and backend)

#### Backend
- `DATABASE_URL` - PostgreSQL connection string (format: `postgresql+asyncpg://user:pass@host:port/db`)
- `FRONTEND_URL` - Frontend URL for CORS (default: `http://localhost:3000`)
- `ENVIRONMENT` - Environment mode (`development` or `production`)
- `LOG_LEVEL` - Logging level (`DEBUG`, `INFO`, `WARNING`, `ERROR`)

#### Frontend
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: `http://localhost:8000/api`)
- `BETTER_AUTH_URL` - Authentication URL (default: `http://localhost:3000`)

### Database Setup

#### Using Neon (Recommended for Production)

1. Create a Neon account at https://neon.tech
2. Create a new project and database
3. Copy the connection string
4. Update `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL=postgresql+asyncpg://user:pass@host.neon.tech/dbname?sslmode=require
   ```

#### Using Local PostgreSQL

1. Install PostgreSQL 16+
2. Create database:
   ```sql
   CREATE DATABASE todo_db;
   ```
3. Update `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/todo_db
   ```

## 📚 API Documentation

### Endpoints

All endpoints require JWT authentication via `auth_token` cookie.

#### Tasks

- `GET /api/tasks` - List all tasks
  - Query params: `status` (all|pending|completed), `sortField` (created_at|updated_at|title), `sortOrder` (asc|desc)
- `GET /api/tasks/{id}` - Get single task
- `POST /api/tasks` - Create new task
  - Body: `{"title": "string", "description": "string"}`
- `PUT /api/tasks/{id}` - Update task
  - Body: `{"title": "string", "description": "string", "completed": boolean}`
- `DELETE /api/tasks/{id}` - Delete task
- `PATCH /api/tasks/{id}/complete` - Toggle completion status

#### Health Checks

- `GET /health` - Application health
- `GET /health/db` - Database connectivity

### Interactive API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Manual Testing

1. Start all services with Docker Compose
2. Open http://localhost:3000
3. Register a new user account
4. Create, edit, and delete tasks
5. Test filtering and sorting
6. Verify user isolation (create second user, ensure tasks are separate)

## 🔒 Security

### Authentication Flow

1. User registers/logs in via Better Auth (frontend)
2. Better Auth issues JWT token stored in httpOnly cookie
3. Frontend automatically includes cookie in all API requests
4. Backend verifies JWT signature on every request
5. User ID extracted from token, never trusted from client

### Security Features

- ✅ JWT signature verification
- ✅ httpOnly cookies (XSS protection)
- ✅ SameSite cookies (CSRF protection)
- ✅ User isolation at database query level
- ✅ SQL injection prevention via ORM
- ✅ Input validation (Zod, Pydantic)
- ✅ CORS with explicit origins
- ✅ No secrets in code (environment variables)
- ✅ Generic error messages (no information disclosure)

## 📦 Deployment

### Docker Deployment

1. **Build images**
   ```bash
   docker compose build
   ```

2. **Push to registry**
   ```bash
   docker tag todo-frontend:latest your-registry/todo-frontend:latest
   docker tag todo-backend:latest your-registry/todo-backend:latest
   docker push your-registry/todo-frontend:latest
   docker push your-registry/todo-backend:latest
   ```

3. **Deploy to cloud platform**
   - AWS ECS/EKS
   - Google Cloud Run
   - Azure Container Instances
   - DigitalOcean App Platform

### Vercel Deployment (Frontend)

```bash
cd frontend
vercel deploy --prod
```

### Railway/Fly.io Deployment (Backend)

```bash
cd backend
railway up  # or fly deploy
```

## 🛠️ Development

### Project Structure

- **Monorepo**: Frontend and backend in same repository
- **Spec-Driven**: All features documented in `specs/` before implementation
- **Type-Safe**: TypeScript (frontend) and Python type hints (backend)
- **Agentic Development**: Built using Claude Code with Spec-Kit Plus

### Code Quality

- **Frontend**: ESLint, TypeScript strict mode, Prettier
- **Backend**: Black, isort, mypy, pylint
- **Testing**: Jest (frontend), pytest (backend)
- **Documentation**: JSDoc, Python docstrings

### Contributing

1. Read specifications in `specs/` directory
2. Follow existing code patterns
3. Write tests for new features
4. Update documentation
5. Submit pull request

## 📖 Documentation

- **Frontend**: `frontend/README.md`
- **Backend**: `backend/README.md`
- **Specifications**: `specs/001-todo-frontend/` and `specs/002-todo-backend/`
- **Constitution**: `.specify/memory/constitution.md`
- **Docker Setup**: `docs/DOCKER_SETUP.md`

## 🐛 Troubleshooting

### Common Issues

**Frontend can't connect to backend**
- Verify backend is running on port 8000
- Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`
- Verify CORS configuration in backend

**Database connection failed**
- Check `DATABASE_URL` format
- Verify PostgreSQL is running
- Check database credentials
- Ensure database exists

**JWT authentication failed**
- Verify `BETTER_AUTH_SECRET` matches between frontend and backend
- Check secret is 32+ characters
- Ensure cookies are enabled in browser

**Docker services won't start**
- Run `docker compose down -v` to clean up
- Check port conflicts (3000, 8000, 5432)
- Verify `.env` file exists and is configured

## 📝 License

This project is part of a hackathon submission and follows the project's license terms.

## 🙏 Acknowledgments

- Built with Claude Code using Spec-Kit Plus methodology
- Follows Spec-Driven Development principles
- Implements Phase II requirements from project constitution

## 📞 Support

For issues and questions:
1. Check documentation in `specs/` directory
2. Review backend/frontend README files
3. Check Docker logs: `docker compose logs -f`
4. Verify environment configuration

---

**Status**: ✅ Production Ready

**Last Updated**: 2026-01-07

**Version**: 1.0.0
