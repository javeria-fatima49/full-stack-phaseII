# Implementation Plan: Todo AI Chatbot - Phase 3

**Branch**: `main` | **Date**: 2026-01-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/main/spec.md`

## Summary

Transform the existing Todo application into a stateless AI-powered conversational chatbot. Users will manage tasks through natural language commands processed by backend AI agents (ConversationAgent and TaskManagerAgent) using Cohere API via OpenAI Agents SDK. The system exposes stateless MCP tools for task operations and persists all conversation and task data in Neon PostgreSQL. Frontend uses OpenAI ChatKit for conversational UI with no AI logic.

## Technical Context

**Language/Version**: Python 3.11+ (backend), TypeScript/Node.js 18+ (frontend)
**Primary Dependencies**: FastAPI, OpenAI Agents SDK, Cohere API, MCP SDK, SQLModel, Neon PostgreSQL, OpenAI ChatKit, Next.js 16+, Better Auth
**Storage**: Neon Serverless PostgreSQL (Task, Conversation, Message models)
**Testing**: pytest (backend), Jest (frontend)
**Target Platform**: Vercel (frontend & backend), Neon (database)
**Project Type**: web (frontend + backend)
**Performance Goals**: <2s p95 latency for chat responses, 90%+ NLU accuracy, handle 100+ concurrent users
**Constraints**: Stateless backend (no session storage), Cohere API rate limits, <200ms p95 for MCP tool execution
**Scale/Scope**: Multi-user system, conversation history persistence, 5 MCP tools, 2 AI agents, 1 conversational API endpoint

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Compliance Verification

✅ **Stateless Backend**: All conversation and task data persisted in Neon DB
✅ **MCP Tools**: Stateless, database-backed operations (no shared memory)
✅ **AI Agents**: OpenAI Agents SDK + Cohere API as specified
✅ **Frontend**: OpenAI ChatKit with no AI logic
✅ **Authentication**: Better Auth with JWT tokens
✅ **User Isolation**: Database queries filtered by user_id from JWT
✅ **API Endpoint**: POST /api/{user_id}/chat as specified
✅ **Database Models**: Task, Conversation, Message as defined in constitution
✅ **Conversation History**: Stored in DB, fetched per request

### Constitution Requirements Met

1. **Project Overview (Section 1)**: ✅ Implements AI-powered assistant with specified tech stack
2. **Chatbot Overview (Section 2)**: ✅ ChatKit interface, no AI logic in frontend
3. **Agents (Section 3)**: ✅ TaskManagerAgent and ConversationAgent as specified
4. **MCP Tools (Section 4)**: ✅ All 5 tools (add, list, complete, delete, update)
5. **Database Models (Section 5)**: ✅ Task, Conversation, Message models
6. **API Endpoint (Section 6)**: ✅ POST /api/{user_id}/chat with specified request/response
7. **Conversation Flow (Section 7)**: ✅ Stateless flow with DB persistence
8. **Frontend (Section 8)**: ✅ ChatKit interface, no AI logic
9. **Key Principles (Section 9)**: ✅ Stateless, scalable, Cohere API, MCP tools
10. **Deployment (Section 10)**: ✅ Vercel (frontend & backend), Neon (database)
11. **Constraints (Section 11)**: ✅ No local state, stateless MCP tools, agents use OpenAI SDK + Cohere
12. **Success Criteria (Section 12)**: ✅ Natural language task management, persistent history, stateless backend

**GATE STATUS**: ✅ PASS - All constitutional requirements satisfied

## Project Structure

### Documentation (this feature)

```text
specs/main/
├── plan.md              # This file (/sp.plan command output)
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   ├── chat-api.yaml    # OpenAPI spec for /api/{user_id}/chat
│   └── mcp-tools.yaml   # MCP tool definitions
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── conversation_agent.py    # ConversationAgent implementation
│   │   └── task_manager_agent.py    # TaskManagerAgent implementation
│   ├── mcp/
│   │   ├── __init__.py
│   │   ├── tools.py                 # MCP tool definitions
│   │   └── handlers.py              # MCP tool implementations
│   ├── api/
│   │   ├── __init__.py
│   │   ├── chat.py                  # POST /api/{user_id}/chat endpoint
│   │   └── deps.py                  # Dependencies (JWT verification, DB session)
│   ├── models/
│   │   ├── __init__.py
│   │   ├── task.py                  # Task model (existing)
│   │   ├── conversation.py          # Conversation model (new)
│   │   └── message.py               # Message model (new)
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── chat.py                  # ChatRequest, ChatResponse schemas
│   │   └── mcp.py                   # MCP tool schemas
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py                # Environment config (add COHERE_API_KEY)
│   │   ├── auth.py                  # JWT verification (existing)
│   │   └── database.py              # DB connection (existing)
│   └── main.py                      # FastAPI app (add chat route)
└── tests/
    ├── test_agents.py               # Agent tests
    ├── test_mcp_tools.py            # MCP tool tests
    └── test_chat_api.py             # Chat endpoint tests

frontend/
├── app/
│   ├── chat/
│   │   └── page.tsx                 # Chat interface page (new)
│   └── layout.tsx                   # Root layout (existing)
├── components/
│   ├── chat/
│   │   ├── ChatInterface.tsx        # ChatKit integration (new)
│   │   ├── MessageList.tsx          # Message display (new)
│   │   └── MessageInput.tsx         # Input component (new)
│   └── ui/                          # Existing UI components
├── lib/
│   ├── api-client.ts                # API client (add chat endpoint)
│   └── types.ts                     # TypeScript types (add chat types)
└── tests/
    └── chat.test.tsx                # Chat component tests
```

**Structure Decision**: Web application structure (Option 2) with separate backend and frontend directories. Backend contains AI agents, MCP tools, and conversational API. Frontend contains ChatKit integration with no AI logic. This structure supports the stateless architecture where backend handles all intelligence and frontend is purely presentational.

## Complexity Tracking

> **No violations detected** - All implementation aligns with Constitution v2.0.0

---

## Phase 0: Research & Unknowns Resolution

### Research Tasks

1. **OpenAI Agents SDK + Cohere Integration**
   - How to configure OpenAI Agents SDK to use Cohere API as model provider
   - Best practices for agent prompt engineering with Cohere
   - Error handling for Cohere API failures

2. **MCP SDK Implementation**
   - How to define MCP tools using official MCP SDK
   - Tool registration and invocation patterns
   - Stateless tool design patterns

3. **OpenAI ChatKit Integration**
   - ChatKit setup and configuration for Next.js
   - Message rendering and conversation history display
   - Authentication integration with Better Auth

4. **Conversation Context Management**
   - How to fetch and format conversation history for agent context
   - Context window management for long conversations
   - Efficient database queries for conversation retrieval

5. **Natural Language Understanding Patterns**
   - Prompt templates for task intent recognition
   - Entity extraction from natural language (task titles, descriptions)
   - Clarification strategies for ambiguous commands

### Research Output Location

All research findings will be documented in `specs/main/research.md`

---

## Phase 1: Design & Contracts

### Data Model Design

**Location**: `specs/main/data-model.md`

**Entities to Define**:
1. Task (existing, verify compatibility)
2. Conversation (new)
3. Message (new)
4. Agent state (if needed for debugging)

### API Contracts

**Location**: `specs/main/contracts/`

**Contracts to Generate**:
1. `chat-api.yaml` - OpenAPI spec for POST /api/{user_id}/chat
2. `mcp-tools.yaml` - MCP tool definitions (add_task, list_tasks, complete_task, delete_task, update_task)

### Quickstart Guide

**Location**: `specs/main/quickstart.md`

**Content**:
- Setup instructions for Cohere API key
- Environment variable configuration
- Running backend with AI agents
- Testing conversational interface
- Example natural language commands

---

## Implementation Phases (Post-Planning)

### Phase 2: Foundation (Backend)

1. Add Conversation and Message models to database
2. Configure Cohere API client
3. Set up OpenAI Agents SDK with Cohere provider
4. Implement MCP tool definitions using MCP SDK

### Phase 3: AI Agents

1. Implement TaskManagerAgent (NLU + MCP tool invocation)
2. Implement ConversationAgent (context management + persistence)
3. Add agent error handling and fallback responses

### Phase 4: Conversational API

1. Implement POST /api/{user_id}/chat endpoint
2. Add JWT verification and user isolation
3. Integrate agents with API endpoint
4. Add conversation history retrieval

### Phase 5: Frontend Integration

1. Set up OpenAI ChatKit in Next.js
2. Implement chat interface page
3. Connect to /api/{user_id}/chat endpoint
4. Add loading states and error handling

### Phase 6: Testing & Validation

1. Unit tests for MCP tools
2. Integration tests for agents
3. End-to-end tests for conversational flow
4. Manual testing with various natural language commands

### Phase 7: Deployment

1. Deploy backend to Vercel with Cohere API key
2. Deploy frontend to Vercel
3. Verify Neon database connectivity
4. Production smoke tests

---

## Risk Mitigation

### Risk 1: Cohere API Rate Limits
- **Mitigation**: Implement rate limiting, request queuing, fallback responses
- **Monitoring**: Track API usage, set up alerts for approaching limits

### Risk 2: NLU Accuracy
- **Mitigation**: Comprehensive prompt engineering, clarification prompts, user feedback
- **Monitoring**: Log misunderstood commands, track intent recognition accuracy

### Risk 3: Conversation Context Loss
- **Mitigation**: Context window management, conversation summarization
- **Monitoring**: Track conversation length, test long conversations

### Risk 4: Stateless Architecture Debugging
- **Mitigation**: Comprehensive logging, request tracing, correlation IDs
- **Monitoring**: Centralized logging, distributed tracing

---

## Success Metrics

- ✅ All 6 user stories implemented and tested
- ✅ 90%+ natural language intent recognition accuracy
- ✅ <2s p95 latency for chat responses
- ✅ 100% conversation history persistence reliability
- ✅ Stateless backend verified (load balancer tests pass)
- ✅ Zero user data leakage (security tests pass)
- ✅ Graceful handling of Cohere API failures

---

## Next Steps

1. Execute Phase 0: Research (generate research.md)
2. Execute Phase 1: Design (generate data-model.md, contracts/, quickstart.md)
3. Update agent context with new technologies
4. Run /sp.tasks to generate implementation tasks
5. Begin implementation following task order
