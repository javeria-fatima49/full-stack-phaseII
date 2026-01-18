# Tasks: Todo AI Chatbot - Phase 3

**Input**: Design documents from `/specs/main/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/, research.md, quickstart.md

**Tests**: Tests are NOT requested in the specification, so no test tasks are included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/app/`, `frontend/app/`, `frontend/components/`
- Paths shown below follow web application structure from plan.md

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Environment configuration and dependency installation

- [x] T001 Verify backend/.env.local has COHERE_API_KEY configured
- [x] T002 Verify backend/.env.local has DATABASE_URL for Neon PostgreSQL
- [x] T003 Verify backend/.env.local has BETTER_AUTH_SECRET (32+ characters)
- [ ] T004 Install Cohere SDK in backend: `pip install cohere`
- [ ] T005 Install OpenAI Agents SDK in backend: `pip install openai-agents-sdk`
- [ ] T006 Install MCP SDK in backend: `pip install mcp-sdk`
- [ ] T007 Install OpenAI ChatKit in frontend: `npm install @openai/chatkit`
- [ ] T008 Verify FastAPI server starts without errors: `uvicorn app.main:app --reload`
- [ ] T009 Verify SQLModel connects to Neon DB successfully

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Models (US6 - Conversation Persistence Foundation)

- [ ] T010 [P] Create Conversation model in backend/app/models/conversation.py
- [ ] T011 [P] Create Message model with MessageRole enum in backend/app/models/message.py
- [ ] T012 [P] Update backend/app/models/__init__.py to export Conversation and Message
- [ ] T013 Create Alembic migration for Conversation table: `alembic revision --autogenerate -m "Add conversation table"`
- [ ] T014 Create Alembic migration for Message table: `alembic revision --autogenerate -m "Add message table"`
- [ ] T015 Run database migrations: `alembic upgrade head`
- [ ] T016 Verify Conversation and Message tables exist in Neon database

### Environment Configuration

- [ ] T017 Add COHERE_API_KEY to backend/app/core/config.py settings
- [ ] T018 Update backend/app/core/config.py to validate required environment variables

### MCP Tools (Stateless Functions)

- [ ] T019 [P] Create MCP tool definition for add_task in backend/app/mcp/tools.py
- [ ] T020 [P] Create MCP tool definition for list_tasks in backend/app/mcp/tools.py
- [ ] T021 [P] Create MCP tool definition for complete_task in backend/app/mcp/tools.py
- [ ] T022 [P] Create MCP tool definition for update_task in backend/app/mcp/tools.py
- [ ] T023 [P] Create MCP tool definition for delete_task in backend/app/mcp/tools.py
- [ ] T024 [P] Implement add_task handler in backend/app/mcp/handlers.py
- [ ] T025 [P] Implement list_tasks handler in backend/app/mcp/handlers.py
- [ ] T026 [P] Implement complete_task handler in backend/app/mcp/handlers.py
- [ ] T027 [P] Implement update_task handler in backend/app/mcp/handlers.py
- [ ] T028 [P] Implement delete_task handler in backend/app/mcp/handlers.py
- [ ] T029 Create MCP tool registry in backend/app/mcp/__init__.py

### AI Agents Infrastructure

- [ ] T030 Create TaskManagerAgent class in backend/app/agents/task_manager_agent.py
- [ ] T031 Configure Cohere API client in TaskManagerAgent
- [ ] T032 Implement intent recognition logic in TaskManagerAgent (CREATE, LIST, COMPLETE, UPDATE, DELETE)
- [ ] T033 Implement MCP tool selection logic in TaskManagerAgent
- [ ] T034 Implement response generation in TaskManagerAgent
- [ ] T035 Create ConversationAgent class in backend/app/agents/conversation_agent.py
- [ ] T036 Implement conversation history fetching in ConversationAgent
- [ ] T037 Implement message persistence in ConversationAgent
- [ ] T038 Implement context building for TaskManagerAgent in ConversationAgent
- [ ] T039 Implement agent coordination logic in ConversationAgent
- [ ] T040 Add error handling for Cohere API failures in TaskManagerAgent
- [ ] T041 Add fallback responses for agent errors in ConversationAgent

### API Schemas

- [ ] T042 [P] Create ChatRequest schema in backend/app/schemas/chat.py
- [ ] T043 [P] Create ChatResponse schema in backend/app/schemas/chat.py
- [ ] T044 [P] Create ToolCall schema in backend/app/schemas/chat.py
- [ ] T045 Update backend/app/schemas/__init__.py to export chat schemas

### Chat API Endpoint

- [ ] T046 Create POST /api/{user_id}/chat endpoint in backend/app/api/chat.py
- [ ] T047 Add JWT verification dependency in chat endpoint
- [ ] T048 Implement conversation creation logic (if conversation_id not provided)
- [ ] T049 Integrate ConversationAgent with chat endpoint
- [ ] T050 Implement response formatting in chat endpoint
- [ ] T051 Add error handling for invalid requests in chat endpoint
- [ ] T052 Register chat route in backend/app/main.py

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 + User Story 2 - Core Task Management (Priority: P1) 🎯 MVP

**Goal**: Users can create tasks via natural language and view their task list through conversational interface

**Independent Test**: User can type "Add buy groceries" and see confirmation, then type "Show my tasks" and see the task listed

### Frontend Chatbot Widget (UI Only)

- [ ] T053 [P] [US1] Create floating chatbot button component in frontend/components/chat/ChatButton.tsx
- [ ] T054 [P] [US1] Create chatbot panel component in frontend/components/chat/ChatPanel.tsx
- [ ] T055 [US1] Implement open/close toggle behavior in ChatButton
- [ ] T056 [US1] Add close/minimize button to ChatPanel
- [ ] T057 [US1] Ensure responsive behavior (desktop & mobile) in ChatPanel
- [ ] T058 [US1] Style chatbot button (bottom-right corner, circular)

### ChatKit Integration

- [ ] T059 [US1] Create ChatInterface component in frontend/components/chat/ChatInterface.tsx
- [ ] T060 [US1] Embed OpenAI ChatKit inside ChatPanel
- [ ] T061 [US1] Configure ChatKit with domain allowlist key
- [ ] T062 [US1] Create MessageList component in frontend/components/chat/MessageList.tsx
- [ ] T063 [US1] Create MessageInput component in frontend/components/chat/MessageInput.tsx
- [ ] T064 [US1] Implement auto-scroll behavior in MessageList
- [ ] T065 [US1] Add loading/typing indicator in ChatInterface

### API Client Integration

- [ ] T066 [P] [US1] Add chat types to frontend/lib/types.ts (ChatRequest, ChatResponse)
- [ ] T067 [US1] Add sendChatMessage function to frontend/lib/api-client.ts
- [ ] T068 [US1] Implement JWT token inclusion in chat API requests
- [ ] T069 [US1] Add error handling for failed chat requests in api-client.ts
- [ ] T070 [US1] Connect MessageInput to sendChatMessage in ChatInterface

### Chat Page

- [ ] T071 [US1] Create chat page in frontend/app/chat/page.tsx
- [ ] T072 [US1] Integrate ChatInterface into chat page
- [ ] T073 [US1] Fetch conversation history on page mount
- [ ] T074 [US1] Display conversation history in MessageList
- [ ] T075 [US1] Handle conversation_id state management

### Task Creation Integration (US1)

- [ ] T076 [US1] Verify TaskManagerAgent recognizes "add task" intent
- [ ] T077 [US1] Verify TaskManagerAgent extracts task title from natural language
- [ ] T078 [US1] Verify TaskManagerAgent calls add_task MCP tool
- [ ] T079 [US1] Verify ConversationAgent persists user message to database
- [ ] T080 [US1] Verify ConversationAgent persists assistant response to database
- [ ] T081 [US1] Test end-to-end: "Add buy groceries" creates task and returns confirmation

### Task Listing Integration (US2)

- [ ] T082 [US2] Verify TaskManagerAgent recognizes "list tasks" intent
- [ ] T083 [US2] Verify TaskManagerAgent calls list_tasks MCP tool
- [ ] T084 [US2] Verify TaskManagerAgent formats task list in response
- [ ] T085 [US2] Test end-to-end: "Show my tasks" returns formatted task list
- [ ] T086 [US2] Test edge case: "Show my tasks" with no tasks returns friendly message

**Checkpoint**: At this point, User Stories 1 and 2 should be fully functional and testable independently

---

## Phase 4: User Story 3 - Task Completion (Priority: P2)

**Goal**: Users can mark tasks as complete through natural language

**Independent Test**: User can type "Complete task 3" or "I finished buying groceries" and task status updates

### Implementation for User Story 3

- [ ] T087 [US3] Verify TaskManagerAgent recognizes "complete task" intent
- [ ] T088 [US3] Implement task ID extraction from natural language in TaskManagerAgent
- [ ] T089 [US3] Implement task title matching logic in TaskManagerAgent
- [ ] T090 [US3] Verify TaskManagerAgent calls complete_task MCP tool
- [ ] T091 [US3] Add confirmation response generation for task completion
- [ ] T092 [US3] Test end-to-end: "Complete task 5" marks task complete
- [ ] T093 [US3] Test end-to-end: "I finished buying groceries" completes matching task
- [ ] T094 [US3] Test error case: "Complete task 999" returns task not found message

**Checkpoint**: At this point, User Story 3 should work independently

---

## Phase 5: User Story 4 - Task Updates (Priority: P3)

**Goal**: Users can update task details through natural language

**Independent Test**: User can type "Change task 2 to 'buy milk and eggs'" and task title updates

### Implementation for User Story 4

- [ ] T095 [US4] Verify TaskManagerAgent recognizes "update task" intent
- [ ] T096 [US4] Implement new title extraction from natural language in TaskManagerAgent
- [ ] T097 [US4] Implement description extraction from natural language in TaskManagerAgent
- [ ] T098 [US4] Verify TaskManagerAgent calls update_task MCP tool
- [ ] T099 [US4] Add confirmation response generation for task updates
- [ ] T100 [US4] Test end-to-end: "Update task 2 to 'new title'" updates task
- [ ] T101 [US4] Test end-to-end: "Add description to task 3: details" updates description
- [ ] T102 [US4] Test error case: "Update task 999" returns task not found message

**Checkpoint**: At this point, User Story 4 should work independently

---

## Phase 6: User Story 5 - Task Deletion (Priority: P3)

**Goal**: Users can delete tasks through natural language

**Independent Test**: User can type "Delete task 5" and task is removed from list

### Implementation for User Story 5

- [ ] T103 [US5] Verify TaskManagerAgent recognizes "delete task" intent
- [ ] T104 [US5] Implement task identification for deletion in TaskManagerAgent
- [ ] T105 [US5] Verify TaskManagerAgent calls delete_task MCP tool
- [ ] T106 [US5] Add confirmation response generation for task deletion
- [ ] T107 [US5] Test end-to-end: "Delete task 5" removes task
- [ ] T108 [US5] Test end-to-end: "Remove the groceries task" deletes matching task
- [ ] T109 [US5] Test error case: "Delete task 999" returns task not found message

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T110 [P] Add comprehensive logging to ConversationAgent
- [ ] T111 [P] Add comprehensive logging to TaskManagerAgent
- [ ] T112 [P] Add request tracing with correlation IDs in chat endpoint
- [ ] T113 [P] Implement rate limiting for Cohere API calls
- [ ] T114 [P] Add conversation context window management (50 message limit)
- [ ] T115 [P] Optimize database queries with proper indexes
- [ ] T116 [P] Add error boundary to ChatInterface component
- [ ] T117 [P] Improve error messages for better user experience
- [ ] T118 [P] Add loading states for all async operations
- [ ] T119 Verify quickstart.md instructions work end-to-end
- [ ] T120 Update README.md with Phase 3 implementation status

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories (but naturally pairs with US1)
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 6 (P1)**: Implemented in Foundational phase - Required by all other stories

### Within Each Phase

- **Setup**: All tasks can run in parallel
- **Foundational**: Tasks marked [P] can run in parallel within their subsections
- **User Stories**: Each story is independent after foundation complete
- **Polish**: All tasks marked [P] can run in parallel

### Parallel Opportunities

- All Setup tasks (T001-T009) can run in parallel
- Database model creation (T010-T012) can run in parallel
- MCP tool definitions (T019-T023) can run in parallel
- MCP tool handlers (T024-T028) can run in parallel
- API schemas (T042-T044) can run in parallel
- Frontend components within a story can often run in parallel
- All Polish tasks marked [P] can run in parallel

---

## Parallel Example: Foundational Phase

```bash
# Launch all database models together:
Task: "Create Conversation model in backend/app/models/conversation.py"
Task: "Create Message model in backend/app/models/message.py"
Task: "Update backend/app/models/__init__.py"

# Launch all MCP tool definitions together:
Task: "Create MCP tool definition for add_task"
Task: "Create MCP tool definition for list_tasks"
Task: "Create MCP tool definition for complete_task"
Task: "Create MCP tool definition for update_task"
Task: "Create MCP tool definition for delete_task"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Stories 1 + 2 (Create and List tasks)
4. **STOP and VALIDATE**: Test US1 and US2 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Stories 1 + 2 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 3 → Test independently → Deploy/Demo
4. Add User Story 4 → Test independently → Deploy/Demo
5. Add User Story 5 → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Stories 1 + 2 (tightly coupled)
   - Developer B: User Story 3
   - Developer C: User Story 4
   - Developer D: User Story 5
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Tests are NOT included as they were not requested in the specification

---

## Task Summary

**Total Tasks**: 120
**Setup Phase**: 9 tasks
**Foundational Phase**: 43 tasks (BLOCKING)
**User Story 1 + 2 (P1 MVP)**: 34 tasks
**User Story 3 (P2)**: 8 tasks
**User Story 4 (P3)**: 8 tasks
**User Story 5 (P3)**: 7 tasks
**Polish Phase**: 11 tasks

**Parallel Opportunities**: 45+ tasks can run in parallel within their phases
**MVP Scope**: Phases 1, 2, and 3 (86 tasks total)
**Independent Test Criteria**: Each user story has clear acceptance criteria from spec.md
