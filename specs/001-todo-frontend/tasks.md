# Tasks: Todo App Frontend Interface

**Input**: Design documents from `/specs/001-todo-frontend/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are NOT included in this task list as they were not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `frontend/` directory with Next.js App Router structure
- **App Router**: `frontend/app/` for pages and layouts
- **Components**: `frontend/components/` for reusable UI
- **Types**: `frontend/types/` for TypeScript definitions
- **Lib**: `frontend/lib/` for utilities and API client

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create frontend directory structure per plan.md (app/, components/, lib/, types/, hooks/, public/, tests/)
- [ ] T002 Initialize Next.js 16 project with TypeScript in frontend/ directory
- [ ] T003 [P] Install core dependencies: next@16, react@18, typescript@5, tailwind@3, zod@3, swr@2
- [ ] T004 [P] Configure Tailwind CSS in frontend/tailwind.config.js with mobile-first breakpoints
- [ ] T005 [P] Configure TypeScript in frontend/tsconfig.json with strict mode and path aliases
- [ ] T006 [P] Initialize shadcn/ui with default theme in frontend/components/ui/
- [ ] T007 [P] Install shadcn/ui components: button, card, input, label, dialog, dropdown-menu, skeleton, toast
- [ ] T008 [P] Install framer-motion for animations in frontend/
- [ ] T009 [P] Install Better Auth for JWT authentication in frontend/
- [ ] T010 [P] Create .env.example with NEXT_PUBLIC_API_URL and BETTER_AUTH_SECRET in frontend/
- [ ] T011 [P] Create .env.local from .env.example (not committed) in frontend/
- [ ] T012 [P] Configure Next.js in frontend/next.config.js with API proxy and environment variables
- [ ] T013 [P] Create frontend/CLAUDE.md with frontend-specific development instructions
- [ ] T014 [P] Create frontend/README.md with setup and development guide
- [ ] T015 [P] Create Dockerfile for frontend container with hot reload on port 3000

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T016 [P] Create Task entity types in frontend/types/task.ts (Task, TaskStatus, TaskSortField, TaskSortOrder)
- [ ] T017 [P] Create API request/response types in frontend/types/api.ts (CreateTaskRequest, UpdateTaskRequest, ListTasksParams)
- [ ] T018 [P] Create UI state types in frontend/types/ui.ts (LoadingState, AsyncState, TaskFilters)
- [ ] T019 [P] Create form validation schemas in frontend/lib/validation.ts using Zod (createTaskSchema, updateTaskSchema)
- [ ] T020 Create centralized API client in frontend/lib/api.ts with fetch wrapper and error handling
- [ ] T021 Implement taskApi functions in frontend/lib/api.ts (list, get, create, update, delete, toggleComplete)
- [ ] T022 [P] Configure Better Auth in frontend/lib/auth.ts with httpOnly cookies and JWT settings
- [ ] T023 [P] Create useAuth hook in frontend/hooks/useAuth.ts for authentication state and operations
- [ ] T024 [P] Create useTasks hook in frontend/hooks/useTasks.ts using SWR for task data fetching
- [ ] T025 [P] Create utility functions in frontend/lib/utils.ts (cn for className merging, date formatters)
- [ ] T026 Create global styles in frontend/app/globals.css with Tailwind directives and custom CSS variables
- [ ] T027 Create root layout in frontend/app/layout.tsx with HTML structure and metadata

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View and Manage Task Dashboard (Priority: P1) 🎯 MVP

**Goal**: Display dashboard with task statistics (total, completed, pending) and 5 most recent tasks with quick "Add Task" button

**Independent Test**: Login as user with existing tasks, verify summary statistics display correctly (Total: X, Completed: Y, Pending: Z), see 5 most recent tasks, click "Add Task" button navigates to create page

### Implementation for User Story 1

- [ ] T028 [P] [US1] Create DashboardStats component in frontend/components/DashboardStats.tsx to display total/completed/pending counts
- [ ] T029 [P] [US1] Create RecentTasksList component in frontend/components/RecentTasksList.tsx to display 5 most recent tasks
- [ ] T030 [P] [US1] Create basic TaskCard component in frontend/components/TaskCard.tsx (title, status, date only - no interactions yet)
- [ ] T031 [US1] Implement dashboard page in frontend/app/page.tsx as Server Component fetching tasks and calculating stats
- [ ] T032 [US1] Add "Add Task" button to dashboard in frontend/app/page.tsx linking to /tasks/create
- [ ] T033 [US1] Add empty state message to dashboard for users with no tasks in frontend/app/page.tsx
- [ ] T034 [US1] Style dashboard layout with responsive grid in frontend/app/page.tsx using Tailwind CSS

**Checkpoint**: At this point, User Story 1 should be fully functional - dashboard displays stats and recent tasks

---

## Phase 4: User Story 2 - Browse and Filter Task List (Priority: P1)

**Goal**: Display all tasks with filtering (All/Pending/Completed) and sorting (created_at/title/updated_at) controls

**Independent Test**: Create multiple tasks with different statuses, navigate to /tasks, verify filtering shows correct subset, verify sorting reorders tasks correctly

### Implementation for User Story 2

- [ ] T035 [P] [US2] Create FilterControls component in frontend/components/FilterControls.tsx with status dropdown (All/Pending/Completed)
- [ ] T036 [P] [US2] Create SortControls component in frontend/components/SortControls.tsx with sort field and order dropdowns
- [ ] T037 [US2] Enhance TaskCard component in frontend/components/TaskCard.tsx to be clickable and navigate to detail page
- [ ] T038 [US2] Implement task list page in frontend/app/tasks/page.tsx as Client Component with filter/sort state
- [ ] T039 [US2] Integrate FilterControls and SortControls in frontend/app/tasks/page.tsx with URL search params
- [ ] T040 [US2] Implement task grid layout in frontend/app/tasks/page.tsx (1 col mobile, 2 col tablet, 3 col desktop)
- [ ] T041 [US2] Add empty state for no tasks matching filter in frontend/app/tasks/page.tsx with "Clear filters" button
- [ ] T042 [US2] Add loading skeleton for task list in frontend/app/tasks/page.tsx using shadcn/ui Skeleton

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - can view dashboard and browse/filter tasks

---

## Phase 5: User Story 3 - Create and Edit Tasks (Priority: P1)

**Goal**: Allow users to create new tasks and edit existing tasks with form validation

**Independent Test**: Navigate to /tasks/create, enter title and description, save and verify task appears in list; edit existing task, modify fields, save and verify changes persist

### Implementation for User Story 3

- [ ] T043 [P] [US3] Create TaskForm component in frontend/components/TaskForm.tsx with title and description fields
- [ ] T044 [US3] Implement form validation in TaskForm using Zod schemas from frontend/lib/validation.ts
- [ ] T045 [US3] Add form error display in TaskForm for validation errors (title required, length limits)
- [ ] T046 [US3] Add form submission handling in TaskForm with loading state and error handling
- [ ] T047 [P] [US3] Implement create task page in frontend/app/tasks/create/page.tsx using TaskForm component
- [ ] T048 [P] [US3] Implement edit task page in frontend/app/tasks/[id]/edit/page.tsx using TaskForm with pre-filled data
- [ ] T049 [US3] Add Cancel button to TaskForm that navigates back to previous page
- [ ] T050 [US3] Add success toast notification after task creation/update using shadcn/ui Toast
- [ ] T051 [US3] Implement redirect to task list after successful create/update in frontend/app/tasks/create/page.tsx and edit/page.tsx

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently - full CRUD for tasks

---

## Phase 6: User Story 4 - View Task Details and Manage Status (Priority: P2)

**Goal**: Display full task details with actions to toggle completion, edit, and delete

**Independent Test**: Navigate to task detail page, verify all fields display, click "Mark Complete" and verify status changes, click "Delete" with confirmation and verify task removed

### Implementation for User Story 4

- [ ] T052 [P] [US4] Create TaskActions component in frontend/components/TaskActions.tsx with Edit, Delete, Toggle Complete buttons
- [ ] T053 [P] [US4] Create DeleteConfirmDialog component in frontend/components/DeleteConfirmDialog.tsx using shadcn/ui Dialog
- [ ] T054 [US4] Implement task detail page in frontend/app/tasks/[id]/page.tsx displaying all task fields
- [ ] T055 [US4] Integrate TaskActions component in task detail page with action handlers
- [ ] T056 [US4] Implement toggle complete handler in task detail page calling taskApi.toggleComplete
- [ ] T057 [US4] Implement delete handler in task detail page with confirmation dialog
- [ ] T058 [US4] Add visual feedback for status changes in task detail page (checkmark animation)
- [ ] T059 [US4] Add redirect to task list after successful delete in frontend/app/tasks/[id]/page.tsx
- [ ] T060 [US4] Add error handling for 404 (task not found) in frontend/app/tasks/[id]/page.tsx

**Checkpoint**: At this point, User Stories 1-4 should all work independently - full task management with details

---

## Phase 7: User Story 5 - Navigate Application with Responsive Interface (Priority: P2)

**Goal**: Implement responsive navigation with hamburger menu on mobile and full nav on desktop, ensure keyboard accessibility

**Independent Test**: Access app on mobile device and verify hamburger menu works, access on desktop and verify full nav bar, use Tab key to navigate and verify logical focus order

### Implementation for User Story 5

- [ ] T061 [P] [US5] Create Header component in frontend/components/Header.tsx with logo and navigation links
- [ ] T062 [P] [US5] Create Footer component in frontend/components/Footer.tsx with app info
- [ ] T063 [US5] Implement responsive navigation in Header with hamburger menu for mobile (hidden md:flex pattern)
- [ ] T064 [US5] Add mobile menu state and toggle in Header component using useState
- [ ] T065 [US5] Integrate Header and Footer in root layout frontend/app/layout.tsx
- [ ] T066 [US5] Add keyboard navigation support to Header (Tab, Enter, Escape for menu)
- [ ] T067 [US5] Add ARIA roles and labels to Header navigation (nav, button, menu)
- [ ] T068 [US5] Test responsive breakpoints (320px, 768px, 1024px, 1536px) and adjust spacing
- [ ] T069 [US5] Add focus visible styles for all interactive elements in frontend/app/globals.css
- [ ] T070 [US5] Verify WCAG 2.1 Level AA color contrast for all text and interactive elements

**Checkpoint**: At this point, User Stories 1-5 should all work independently - full responsive navigation

---

## Phase 8: User Story 6 - Experience Smooth Interactions and Feedback (Priority: P3)

**Goal**: Add animations, loading states, and error handling with retry mechanisms

**Independent Test**: Perform various actions and verify loading indicators appear, success states animate smoothly, errors display with retry button

### Implementation for User Story 6

- [ ] T071 [P] [US6] Create LoadingSpinner component in frontend/components/LoadingSpinner.tsx with framer-motion fade animation
- [ ] T072 [P] [US6] Create ErrorMessage component in frontend/components/ErrorMessage.tsx with retry button and slide animation
- [ ] T073 [P] [US6] Create PageTransition wrapper in frontend/components/PageTransition.tsx with framer-motion page transitions
- [ ] T074 [US6] Add loading states to all API calls in useTasks hook using SWR loading state
- [ ] T075 [US6] Replace static loading text with LoadingSpinner component in all pages
- [ ] T076 [US6] Add error states with ErrorMessage component to all pages with retry handlers
- [ ] T077 [US6] Add hover animations to TaskCard using framer-motion whileHover (scale: 1.02)
- [ ] T078 [US6] Add tap animations to buttons using framer-motion whileTap (scale: 0.98)
- [ ] T079 [US6] Add staggered list animations to task list using framer-motion variants
- [ ] T080 [US6] Add success checkmark animation to task completion toggle using framer-motion
- [ ] T081 [US6] Wrap pages with PageTransition component for smooth page changes
- [ ] T082 [US6] Add skeleton loaders to dashboard and task list using shadcn/ui Skeleton
- [ ] T083 [US6] Implement optimistic UI updates for task toggle (update UI before API response)
- [ ] T084 [US6] Add toast notifications for all success/error states using shadcn/ui Toast

**Checkpoint**: All user stories should now be independently functional with polished interactions

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T085 [P] Add loading state prevention for duplicate form submissions in TaskForm component
- [ ] T086 [P] Add 401 redirect to login page in API client error handler in frontend/lib/api.ts
- [ ] T087 [P] Implement API request retry mechanism (3 attempts with exponential backoff) in frontend/lib/api.ts
- [ ] T088 [P] Add proper TypeScript error types and type guards in frontend/types/api.ts
- [ ] T089 [P] Add meta tags for SEO in root layout frontend/app/layout.tsx
- [ ] T090 [P] Add favicon and app icons in frontend/public/
- [ ] T091 [P] Optimize images and assets in frontend/public/
- [ ] T092 [P] Add proper error boundaries for React error handling in root layout
- [ ] T093 [P] Verify all components use semantic HTML (button, nav, main, article)
- [ ] T094 [P] Run Lighthouse accessibility audit and fix any issues
- [ ] T095 [P] Test keyboard navigation flow across all pages
- [ ] T096 [P] Test with screen reader (NVDA/JAWS/VoiceOver) and fix issues
- [ ] T097 [P] Verify color contrast meets WCAG AA standards using axe DevTools
- [ ] T098 [P] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] T099 [P] Test on multiple screen sizes (mobile, tablet, desktop)
- [ ] T100 [P] Update frontend/README.md with final setup instructions
- [ ] T101 Validate quickstart.md instructions by following them step-by-step
- [ ] T102 Create docker-compose.yml in repository root for frontend + backend + database services

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3 → US4 → US5 → US6)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Uses TaskCard from US1 but can implement independently
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - Integrates with layout but independently testable
- **User Story 6 (P3)**: Can start after Foundational (Phase 2) - Enhances all stories but independently testable

### Within Each User Story

- Components before pages (reusable components used by pages)
- Basic components before enhanced components (TaskCard basic in US1, enhanced in US2)
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003-T015)
- All Foundational tasks marked [P] can run in parallel (T016-T027)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Components within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members
- All Polish tasks marked [P] can run in parallel (T085-T100)

---

## Parallel Example: User Story 1

```bash
# Launch all components for User Story 1 together:
Task T028: "Create DashboardStats component in frontend/components/DashboardStats.tsx"
Task T029: "Create RecentTasksList component in frontend/components/RecentTasksList.tsx"
Task T030: "Create basic TaskCard component in frontend/components/TaskCard.tsx"

# Then implement the page that uses them:
Task T031: "Implement dashboard page in frontend/app/page.tsx"
```

---

## Parallel Example: User Story 3

```bash
# Create and edit pages can be worked on in parallel:
Task T047: "Implement create task page in frontend/app/tasks/create/page.tsx"
Task T048: "Implement edit task page in frontend/app/tasks/[id]/edit/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T015)
2. Complete Phase 2: Foundational (T016-T027) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T028-T034)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Login as user with tasks
   - Verify dashboard shows correct stats
   - Verify 5 most recent tasks display
   - Verify "Add Task" button navigates correctly
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (T028-T034) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (T035-T042) → Test independently → Deploy/Demo
4. Add User Story 3 (T043-T051) → Test independently → Deploy/Demo
5. Add User Story 4 (T052-T060) → Test independently → Deploy/Demo
6. Add User Story 5 (T061-T070) → Test independently → Deploy/Demo
7. Add User Story 6 (T071-T084) → Test independently → Deploy/Demo
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T027)
2. Once Foundational is done:
   - Developer A: User Story 1 (T028-T034)
   - Developer B: User Story 2 (T035-T042)
   - Developer C: User Story 3 (T043-T051)
3. Stories complete and integrate independently
4. Continue with remaining stories in priority order

---

## Task Summary

**Total Tasks**: 102
- **Setup (Phase 1)**: 15 tasks (T001-T015)
- **Foundational (Phase 2)**: 12 tasks (T016-T027)
- **User Story 1 (P1)**: 7 tasks (T028-T034) 🎯 MVP
- **User Story 2 (P1)**: 8 tasks (T035-T042)
- **User Story 3 (P1)**: 9 tasks (T043-T051)
- **User Story 4 (P2)**: 9 tasks (T052-T060)
- **User Story 5 (P2)**: 10 tasks (T061-T070)
- **User Story 6 (P3)**: 14 tasks (T071-T084)
- **Polish (Phase 9)**: 18 tasks (T085-T102)

**Parallel Opportunities**: 47 tasks marked [P] can run in parallel within their phase

**MVP Scope**: Setup + Foundational + User Story 1 = 34 tasks

**Independent Test Criteria**:
- US1: Dashboard displays stats and recent tasks correctly
- US2: Task list filters and sorts correctly
- US3: Can create and edit tasks with validation
- US4: Can view details and manage task status
- US5: Responsive navigation works on all devices
- US6: Smooth animations and error handling throughout

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests are NOT included as they were not requested in the specification
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All file paths are absolute from repository root (frontend/ directory)
