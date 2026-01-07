---
id: 001
title: Backend Specification Creation
stage: spec
date: 2026-01-07
surface: agent
model: claude-sonnet-4-5
feature: 002-todo-backend
branch: 001-todo-frontend
user: dell
command: spec-writer
labels: ["backend", "fastapi", "specification", "api", "database", "security"]
links:
  spec: specs/002-todo-backend/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-todo-backend/spec.md
  - specs/002-todo-backend/data-model.md
  - specs/002-todo-backend/contracts/api-endpoints.md
  - specs/002-todo-backend/security.md
  - specs/002-todo-backend/environment.md
tests:
  - None (specification phase)
---

## Prompt

Create comprehensive backend specifications for the Phase II Todo App FastAPI backend.

Context:
- Frontend is complete and expects specific API endpoints (see specs/001-todo-frontend/contracts/api-endpoints.md)
- Backend must use FastAPI with Python
- Database: SQLModel ORM with Neon Serverless PostgreSQL
- Authentication: JWT tokens from Better Auth (frontend handles auth, backend verifies tokens)
- User isolation: Each user can only access their own tasks

Requirements:
1. Read the frontend API contracts at specs/001-todo-frontend/contracts/api-endpoints.md
2. Read the constitution at .specify/memory/constitution.md
3. Create backend specification that includes:
   - API endpoint definitions (routes, methods, request/response schemas)
   - Database models using SQLModel
   - JWT authentication verification strategy
   - User isolation implementation
   - Error handling specifications
   - Environment variables needed
   - CORS configuration

Create the specification in specs/002-todo-backend/ directory with:
- spec.md (main specification)
- data-model.md (database schema)
- contracts/api-endpoints.md (API contract details)
- Any other supporting documentation

Ensure the backend API matches exactly what the frontend expects.

## Response snapshot

Created comprehensive backend specifications across 5 files totaling ~91KB of documentation:

**1. spec.md (19.4KB)** - Main backend specification
- 7 user stories with P0 priority and testable acceptance criteria
- Technical architecture with FastAPI, SQLModel, and project structure
- Dependencies and integration points with frontend
- Non-functional requirements (performance, security, reliability, observability)
- Comprehensive error handling strategy (401, 400, 404, 500)
- CORS configuration for dev and production
- 7 edge cases with handling strategies
- Validation checklist and next steps

**2. data-model.md (15.6KB)** - Database schema specification
- Complete `tasks` table definition with 7 columns
- SQLModel model implementation with type safety
- 4 composite indexes for query optimization
- Data integrity rules and constraints
- Migration strategy with Alembic
- Zero-downtime deployment requirements
- 6 query patterns with performance analysis
- Connection pool configuration
- Sample seed data for development

**3. contracts/api-endpoints.md (19.2KB)** - API contracts
- All 6 endpoints fully documented:
  - GET /api/tasks (list with filtering/sorting)
  - GET /api/tasks/{id} (single task)
  - POST /api/tasks (create)
  - PUT /api/tasks/{id} (update)
  - DELETE /api/tasks/{id} (delete)
  - PATCH /api/tasks/{id}/complete (toggle)
- Request/response schemas with TypeScript types
- Complete error response formats (400, 401, 404, 422, 500)
- FastAPI route structure with dependency injection
- curl examples for testing all endpoints

**4. security.md (19.5KB)** - Security specification
- JWT token flow diagram and architecture
- Token structure (header, payload, signature)
- JWT verification implementation with python-jose
- User isolation enforcement at query level
- 7 security threats with mitigations:
  - Token theft (httpOnly cookies, HTTPS)
  - Token replay (expiration, rotation)
  - Brute force (strong secret, rate limiting)
  - User impersonation (signature verification)
  - SQL injection (ORM parameterization)
  - CSRF (SameSite cookies)
  - Information disclosure (generic errors)
- CORS and cookie security configuration
- Security testing test cases
- Monitoring and logging requirements

**5. environment.md (17.5KB)** - Environment configuration
- 3 required variables: DATABASE_URL, BETTER_AUTH_SECRET, FRONTEND_URL
- 9 optional variables with defaults
- Environment file templates for dev/prod/docker
- Pydantic-based configuration loading with validation
- Secrets management best practices
- Startup validation and health check endpoints
- Troubleshooting guide for common issues

**Key Design Decisions:**
- User isolation enforced at database query level (WHERE user_id = ?)
- JWT verification via dependency injection pattern
- Hard deletes (no soft delete in Phase II)
- Composite indexes for efficient filtering and sorting
- Generic 404 responses (don't reveal task existence)
- httpOnly cookies for XSS protection
- Explicit CORS origins (no wildcards with credentials)

**Constitution Compliance:**
- Spec-Driven Development (Section V): All specs created before implementation
- Authentication Model (Section VII): JWT verification with shared secret
- API Rules (Section VIII): RESTful conventions, user isolation, FastAPI only
- Technology Stack (Section III): FastAPI, SQLModel, PostgreSQL as specified

## Outcome

- ✅ Impact: Complete backend specification ready for implementation planning
- 🧪 Tests: No tests yet (specification phase) - acceptance criteria defined for future testing
- 📁 Files: 5 specification files created in specs/002-todo-backend/
- 🔁 Next prompts:
  1. Review specifications for completeness and accuracy
  2. Run spec-planner agent to create implementation plan (plan.md)
  3. Run task-generator agent to create actionable tasks (tasks.md)
  4. Begin backend implementation following tasks
- 🧠 Reflection: Specifications are comprehensive and match frontend expectations exactly. All 6 API endpoints documented with complete request/response schemas, error handling, and security requirements. Database schema optimized with composite indexes for query patterns. JWT authentication strategy clearly defined with security mitigations. Ready for implementation phase.

## Evaluation notes (flywheel)

- Failure modes observed: None - specifications created successfully
- Graders run and results (PASS/FAIL):
  - Completeness: PASS (all user stories have acceptance criteria)
  - Frontend compatibility: PASS (API contracts match frontend expectations)
  - Security: PASS (JWT verification, user isolation, CORS configured)
  - Constitution compliance: PASS (follows all relevant sections)
- Prompt variant (if applicable): Standard specification creation workflow
- Next experiment (smallest change to try): Proceed to planning phase with spec-planner agent
