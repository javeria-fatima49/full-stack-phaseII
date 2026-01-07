---
id: 001
title: Initial Phase II Constitution Ratification
stage: constitution
date: 2026-01-06
surface: agent
model: claude-sonnet-4-5
feature: none
branch: main
user: muntaha-fatima
command: /sp.constitution
labels: ["constitution", "initialization", "phase-ii", "governance"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - N/A (constitution document)
---

## Prompt

# Hackathon Todo App – Phase II Constitution

## I. Purpose
This project transforms a console-based Todo application into a modern,
full-stack, multi-user web application using a strict
spec-driven and agentic development workflow.

All development is performed by Claude Code using Spec-Kit Plus.
Manual coding is not permitted.

---

## II. Project Phase
**Phase II: Full-Stack Web Application**

Focus areas:
- Web-based user interface
- RESTful API
- Persistent database storage
- Secure multi-user authentication

---

## III. Technology Stack

### Frontend
- Next.js 16+ (App Router)
- TypeScript
- Tailwind CSS
- Better Auth (authentication)

### Backend
- Python FastAPI
- SQLModel ORM
- JWT-based authentication

### Database
- Neon Serverless PostgreSQL

### Development Methodology
- Spec-Kit Plus
- Claude Code (Agentic Dev Stack)

---

## IV. Monorepo Structure
phaseII/
├── .spec-kit/
│ └── config.yaml
├── specs/
│ ├── overview.md
│ ├── features/
│ ├── api/
│ ├── database/
│ └── ui/
├── frontend/
│ └── CLAUDE.md
├── backend/
│ └── CLAUDE.md
├── CLAUDE.md
└── README.md

---

## V. Spec-Driven Development Rules

1. **Specifications are the single source of truth**
2. No feature may be implemented without a corresponding spec
3. Specs must be read before planning or implementation
4. Specs are referenced using `@specs/path/file.md`
5. Any change in behavior requires a spec update first

---

## VI. Agentic Development Workflow

Claude Code must strictly follow these steps:

1. Read the relevant specifications
2. Generate an implementation plan
3. Break the plan into focused executable tasks
4. Implement incrementally
5. Validate against acceptance criteria

Skipping any step is not allowed.

---

## VII. Authentication & Security Model

- Authentication is handled on the frontend using **Better Auth**
- Better Auth issues **JWT tokens** upon successful login
- JWT tokens must be sent with every API request:

Authorization: Bearer <token>

- Backend verifies JWT using a shared secret
- User identity is extracted from JWT claims, not trusted from URL parameters
- All database queries MUST be filtered by authenticated user ID
- Unauthorized requests return `401 Unauthorized`

---

## VIII. API & Implementation Rules

### API Rules
- All backend routes must be under `/api/`
- RESTful conventions must be followed
- Each user can only access their own resources

### Backend Rules
- FastAPI is the only backend framework
- SQLModel must be used for all database operations
- Errors are handled using HTTPException
- No frontend logic in backend code

### Frontend Rules
- Use Server Components by default
- Client Components only when required
- All API requests go through a centralized API client
- JWT token is attached automatically to each request
- UI must be responsive and accessible

---

## IX. Dockerized Local Development Environment

Local development MUST use Docker to ensure consistency
across all environments.

### Requirements
- Root-level `docker-compose.yml`
- Services:
  - Frontend: Next.js development server
  - Backend: FastAPI with hot reload enabled
  - Database: PostgreSQL
- Port mapping:
  - Frontend: `3000`
  - Backend: `8000`
  - Database: `5432`
- Environment variables managed via `.env.local` files
- `.env.local` files must NOT be committed

### Rationale
Docker eliminates "works on my machine" issues,
ensures reproducibility, and simplifies onboarding
for reviewers and collaborators.

---

## X. AI Sub-Agents and Skills Integration

Multiple AI sub-agents and reusable skills MAY be used
under the following conditions:

### Rules
1. Each sub-agent must have a clear and narrow responsibility
   (e.g., spec writing, planning, implementation, testing)
2. Sub-agents MUST read this constitution and relevant specs first
3. Sub-agents must NOT bypass specification or planning phases
4. Sub-agents may only operate within their assigned scope
5. All sub-agents and reusable skills must be documented

### Documentation
- Sub-agents and skills should be documented in:
  - `CLAUDE.md`, or
  - `agents-and-skills.md`

### Rationale
Specialized agents improve efficiency while preserving
architectural discipline and spec compliance.

---

## XI. Environment Variables & Secrets

Required environment variables:
- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `NEXT_PUBLIC_API_URL`

Secrets must never be hardcoded
and must be injected via environment configuration.

---

## XII. Quality & Judging Criteria

Claude Code must ensure:
- Strict spec compliance
- Secure authentication and user isolation
- Clear frontend/backend separation
- Production-quality code

Judging emphasizes:
- Process
- Specs
- Prompts
- Iterations

Not just final output.

---

## XIII. Final Rule

If a feature or behavior is not explicitly defined in specs,
it must not be implemented.

**Specs first. Code second. Always.**

## Response snapshot

Constitution successfully updated from template to version 1.0.0.

**Key Actions Taken:**
1. Replaced all template placeholders with concrete Phase II project values
2. Converted "should" language to explicit MUST/MAY requirements for clarity
3. Added comprehensive Sync Impact Report as HTML comment
4. Verified alignment with existing spec, plan, and tasks templates
5. Established semantic versioning governance with clear amendment procedures

**Constitution Structure:**
- 13 numbered sections covering purpose, technology stack, development rules, security model, and quality criteria
- Governance section with amendment procedures and version history
- All principles are declarative, testable, and enforceable

**Version Metadata:**
- Version: 1.0.0 (initial ratification)
- Ratified: 2026-01-06
- Last Amended: 2026-01-06

## Outcome

- ✅ Impact: Initial constitution ratified, establishing governance framework for Phase II full-stack web application development
- 🧪 Tests: N/A (governance document)
- 📁 Files: Created/updated .specify/memory/constitution.md (276 lines)
- 🔁 Next prompts: Begin feature specification with /sp.specify, or review project structure and initialize development environment
- 🧠 Reflection: Constitution provides clear, enforceable rules for spec-driven development with explicit MUST/MAY requirements. Docker requirement ensures reproducibility. JWT authentication model clearly defined. Ready for feature development to begin.

## Evaluation notes (flywheel)

- Failure modes observed: None - template successfully converted to concrete constitution
- Graders run and results (PASS/FAIL): PASS - All placeholders replaced, no bracketed tokens remaining, semantic versioning established, templates verified for alignment
- Prompt variant (if applicable): N/A (initial constitution)
- Next experiment (smallest change to try): Monitor first feature specification process to validate constitution rules are sufficient and clear
