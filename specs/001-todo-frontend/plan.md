# Implementation Plan: Todo App Frontend Interface

**Branch**: `001-todo-frontend` | **Date**: 2026-01-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-todo-frontend/spec.md`

## Summary

Build a modern, responsive, and accessible web frontend for the Todo application using Next.js 16+ with App Router. The interface provides dashboard overview, task list with filtering/sorting, task CRUD operations, and smooth animations. All interactions are authenticated via JWT tokens and communicate with a FastAPI backend through a centralized API client. The frontend must be fully responsive (mobile to desktop), keyboard accessible, and meet WCAG 2.1 Level AA standards.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 16+ (App Router)
**Primary Dependencies**:
- Next.js 16+ (React framework with App Router)
- Tailwind CSS (utility-first styling)
- shadcn/ui (component library)
- framer-motion (animations)
- Better Auth (JWT authentication client)

**Storage**: Browser localStorage for JWT token persistence, no local data caching (all data from API)
**Testing**: Jest + React Testing Library for components, Playwright for E2E tests
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge - last 2 versions)
**Project Type**: Web frontend (Next.js application)
**Performance Goals**:
- Initial page load < 3 seconds on 3G
- Task list render < 1 second for 100 tasks
- Animations at 60fps
- 95% of interactions provide feedback < 100ms

**Constraints**:
- Must work on screens 320px to 2560px width
- Keyboard navigation required for all interactive elements
- WCAG 2.1 Level AA compliance mandatory
- No offline functionality (out of scope)

**Scale/Scope**:
- 5 main pages (Dashboard, Task List, Task Detail, Create Task, Edit Task)
- 6 reusable components (TaskCard, TaskForm, Header, Footer, LoadingSpinner, ErrorMessage)
- 6 API client functions (list, get, create, update, delete, toggle complete)
- Support for hundreds of tasks per user

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Initial Check (Before Phase 0)

1. **Spec-Driven Development** (Constitution V)
   - ✅ Feature specification exists at `specs/001-todo-frontend/spec.md`
   - ✅ All requirements traced to spec functional requirements (FR-001 through FR-025)
   - ✅ Implementation will reference spec throughout

2. **Technology Stack** (Constitution III)
   - ✅ Frontend: Next.js 16+ with TypeScript - COMPLIANT
   - ✅ Styling: Tailwind CSS - COMPLIANT
   - ✅ Authentication: Better Auth JWT - COMPLIANT
   - ✅ No backend code in frontend - COMPLIANT

3. **Authentication & Security** (Constitution VII)
   - ✅ JWT tokens sent with every API request via Authorization header
   - ✅ 401 responses trigger redirect to login (FR-016)
   - ✅ No user_id in URLs (extracted from JWT by backend)
   - ✅ Tokens stored securely (not in URLs)

4. **API Rules** (Constitution VIII)
   - ✅ All API calls through centralized client (`/lib/api.ts`)
   - ✅ RESTful conventions followed
   - ✅ Server Components by default, Client Components only when needed
   - ✅ Responsive and accessible UI required

5. **Monorepo Structure** (Constitution IV)
   - ✅ Frontend code in `frontend/` directory
   - ✅ Frontend CLAUDE.md will be created
   - ✅ Specs in `specs/001-todo-frontend/`

6. **Docker Environment** (Constitution IX)
   - ✅ Frontend will run in Docker container on port 3000
   - ✅ Environment variables via `.env.local` (not committed)
   - ✅ Hot reload enabled for development

### ✅ Post-Design Check (After Phase 1)

**Re-evaluation Date**: 2026-01-06

All design decisions from Phase 0 research and Phase 1 design artifacts maintain full compliance:

1. **Technology Decisions** (from research.md):
   - ✅ Better Auth with httpOnly cookies - COMPLIANT (Constitution VII)
   - ✅ shadcn/ui component library - COMPLIANT (Constitution III)
   - ✅ framer-motion for animations - COMPLIANT (Constitution III)
   - ✅ Native fetch API (no axios) - COMPLIANT (Next.js best practices)
   - ✅ Tailwind CSS responsive design - COMPLIANT (Constitution III)
   - ✅ WCAG 2.1 Level AA accessibility - COMPLIANT (Constitution VIII)

2. **Data Model** (from data-model.md):
   - ✅ TypeScript interfaces for all entities - COMPLIANT
   - ✅ Zod validation schemas - COMPLIANT
   - ✅ No backend logic in frontend types - COMPLIANT

3. **API Contracts** (from contracts/):
   - ✅ All endpoints documented - COMPLIANT
   - ✅ JWT authentication via cookies - COMPLIANT (Constitution VII)
   - ✅ RESTful conventions - COMPLIANT (Constitution VIII)
   - ✅ User isolation enforced by backend - COMPLIANT (Constitution VII)

4. **Project Structure** (from plan.md):
   - ✅ Follows Next.js 16 App Router conventions - COMPLIANT
   - ✅ Separates concerns (components, lib, types, hooks) - COMPLIANT
   - ✅ No backend code in frontend directory - COMPLIANT

### ⚠️ Constitution Violations

**NONE** - All design decisions maintain full compliance with constitution requirements.

### 🔍 Research Items (Resolved in Phase 0)

All research items have been resolved in `research.md`:
1. ✅ Better Auth Integration Pattern - Resolved (httpOnly cookies)
2. ✅ shadcn/ui Setup - Resolved (installation steps documented)
3. ✅ framer-motion with App Router - Resolved (Client Component patterns)
4. ✅ JWT Token Management - Resolved (httpOnly cookies, automatic injection)
5. ✅ API Client Architecture - Resolved (native fetch with centralized client)

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-frontend/
├── plan.md              # This file
├── research.md          # Phase 0: Technology research and patterns
├── data-model.md        # Phase 1: Frontend data structures and state
├── quickstart.md        # Phase 1: Setup and development guide
├── contracts/           # Phase 1: API contracts and TypeScript types
│   ├── api-types.ts     # Request/response TypeScript interfaces
│   └── api-endpoints.md # API endpoint documentation
└── tasks.md             # Phase 2: Implementation tasks (created by /sp.tasks)
```

### Source Code (repository root)

```text
frontend/
├── app/                          # Next.js 16 App Router
│   ├── layout.tsx                # Root layout with header/footer
│   ├── page.tsx                  # Dashboard (home page)
│   ├── tasks/
│   │   ├── page.tsx              # Task list page
│   │   ├── create/
│   │   │   └── page.tsx          # Create task page
│   │   └── [id]/
│   │       ├── page.tsx          # Task detail page
│   │       └── edit/
│   │           └── page.tsx      # Edit task page
│   └── globals.css               # Global styles with Tailwind
│
├── components/                   # Reusable components
│   ├── ui/                       # shadcn/ui components
│   ├── TaskCard.tsx              # Task card component
│   ├── TaskForm.tsx              # Task create/edit form
│   ├── Header.tsx                # Navigation header
│   ├── Footer.tsx                # App footer
│   ├── LoadingSpinner.tsx        # Loading indicator
│   └── ErrorMessage.tsx          # Error display with retry
│
├── lib/                          # Utilities and clients
│   ├── api.ts                    # Centralized API client
│   ├── auth.ts                   # Better Auth configuration
│   └── utils.ts                  # Helper functions
│
├── types/                        # TypeScript type definitions
│   ├── task.ts                   # Task entity types
│   └── api.ts                    # API request/response types
│
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts                # Authentication hook
│   └── useTasks.ts               # Task data fetching hook
│
├── public/                       # Static assets
│   └── images/
│
├── tests/                        # Test files
│   ├── components/               # Component tests
│   ├── integration/              # Integration tests
│   └── e2e/                      # Playwright E2E tests
│
├── .env.local                    # Environment variables (not committed)
├── .env.example                  # Environment variable template
├── next.config.js                # Next.js configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies
├── Dockerfile                    # Docker container definition
├── CLAUDE.md                     # Frontend-specific agent instructions
└── README.md                     # Frontend documentation
```

**Structure Decision**: Web application structure (Option 2 from template) with frontend/ directory. This aligns with Constitution IV monorepo structure and separates frontend concerns from backend. The Next.js App Router structure follows Next.js 16 conventions with app/ directory for routes and components/ for reusable UI elements.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations to track** - All constitution requirements are met without exceptions.

---

## Phase 0: Research & Technology Decisions

*This section documents research findings that resolve all "NEEDS CLARIFICATION" items from Technical Context and Constitution Check.*

### Research Tasks

1. **Better Auth Integration with Next.js 16 App Router**
   - Research how to configure Better Auth JWT client
   - Determine Server vs Client Component usage for auth
   - Document token storage and retrieval patterns

2. **shadcn/ui Setup and Configuration**
   - Document installation steps for Next.js 16
   - Identify required components (Button, Card, Input, Dialog, etc.)
   - Configure Tailwind CSS integration

3. **framer-motion Animation Patterns**
   - Research App Router compatibility
   - Document animation patterns for state transitions
   - Identify Client Component requirements for animations

4. **JWT Token Management Strategy**
   - Research secure token storage (httpOnly cookies vs localStorage)
   - Document automatic token injection into API requests
   - Handle token expiration and refresh

5. **API Client Architecture**
   - Research fetch vs axios for API calls
   - Document error handling patterns
   - Design retry mechanism for failed requests

6. **Responsive Design Breakpoints**
   - Document Tailwind CSS breakpoint strategy
   - Research mobile-first vs desktop-first approach
   - Identify hamburger menu implementation

7. **Accessibility Implementation**
   - Research WCAG 2.1 Level AA requirements
   - Document ARIA roles and labels needed
   - Identify keyboard navigation patterns

*Detailed research findings will be documented in `research.md` (created next)*

---

## Phase 1: Design Artifacts

*This section will be populated after Phase 0 research is complete.*

### Data Model

Frontend data structures and state management patterns will be documented in `data-model.md`, including:
- Task entity TypeScript interface
- Filter and sort state types
- UI state types (loading, error, success)
- Form validation schemas

### API Contracts

TypeScript interfaces for all API interactions will be documented in `contracts/`, including:
- Request/response types for each endpoint
- Error response types
- Authentication header structure

### Quickstart Guide

Development setup instructions will be documented in `quickstart.md`, including:
- Environment setup
- Dependency installation
- Running development server
- Running tests

---

## Implementation Phases (High-Level)

*Detailed tasks will be generated by `/sp.tasks` command after planning is complete.*

### Phase 1: Project Setup & Configuration
- Initialize Next.js 16 project with TypeScript
- Configure Tailwind CSS and shadcn/ui
- Set up Better Auth JWT client
- Configure environment variables
- Create Docker configuration

### Phase 2: Core Layout & Navigation
- Implement root layout with header/footer
- Create navigation component
- Implement responsive hamburger menu
- Set up routing structure

### Phase 3: Authentication Integration
- Implement JWT token management
- Create API client with automatic token injection
- Handle 401 responses and redirects
- Create authentication hooks

### Phase 4: Dashboard Page (P1)
- Implement dashboard layout
- Create summary statistics display
- Implement recent tasks list
- Add quick "Add Task" button

### Phase 5: Task List Page (P1)
- Implement task list layout
- Create TaskCard component
- Implement filtering controls
- Implement sorting controls
- Handle empty states

### Phase 6: Task CRUD Operations (P1)
- Implement create task page and form
- Implement edit task page
- Implement task detail page
- Add delete confirmation dialog
- Implement status toggle

### Phase 7: Loading & Error States (P2)
- Create LoadingSpinner component
- Create ErrorMessage component
- Implement skeleton loaders
- Add retry mechanisms

### Phase 8: Animations & Interactions (P3)
- Implement framer-motion animations
- Add hover effects
- Add page transitions
- Implement smooth state changes

### Phase 9: Responsive Design (P2)
- Implement mobile layouts
- Test tablet breakpoints
- Ensure desktop optimization
- Test across screen sizes

### Phase 10: Accessibility (P2)
- Add ARIA roles and labels
- Implement keyboard navigation
- Test with screen readers
- Verify WCAG 2.1 Level AA compliance

### Phase 11: Testing
- Write component unit tests
- Write integration tests
- Write E2E tests with Playwright
- Test across browsers

### Phase 12: Docker & Deployment Prep
- Create Dockerfile
- Configure docker-compose integration
- Test containerized environment
- Document deployment process

---

## Next Steps

1. **Run `/sp.plan` Phase 0**: Generate `research.md` with detailed technology research
2. **Run `/sp.plan` Phase 1**: Generate `data-model.md`, `contracts/`, and `quickstart.md`
3. **Review and approve plan**: Ensure all design decisions align with requirements
4. **Run `/sp.tasks`**: Generate detailed implementation tasks from this plan
5. **Begin implementation**: Execute tasks in priority order

---

## Success Criteria Mapping

This plan addresses all success criteria from the specification:

- **SC-001** (Dashboard load < 2s): Optimized data fetching and Server Components
- **SC-002** (Task creation < 30s): Streamlined form with clear navigation
- **SC-003** (Find task < 10s): Efficient filtering and sorting UI
- **SC-004** (Responsive 320px-2560px): Tailwind CSS responsive design
- **SC-005** (Keyboard navigation): ARIA and semantic HTML throughout
- **SC-006** (Feedback < 100ms): Optimistic UI updates and immediate visual feedback
- **SC-007** (Clear error messages): User-friendly error component with retry
- **SC-008** (60fps animations): framer-motion with performance optimization
- **SC-009** (Mobile usability): Mobile-first responsive design
- **SC-010** (WCAG 2.1 Level AA): Accessibility built-in from start
