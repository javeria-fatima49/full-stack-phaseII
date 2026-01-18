---
id: 002
title: Update constitution to Todo AI Chatbot
stage: constitution
date: 2026-01-16
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: main
user: dell
command: /sp.constitution
labels: ["constitution", "architecture", "ai-chatbot", "major-version", "agents", "mcp-tools"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - none
---

## Prompt

```text
# CONSTITUTION.md

# Todo AI Chatbot - Project Constitution

## 1. Project Overview
The Todo AI Chatbot is an AI-powered assistant that allows users to **manage their tasks** (todos) through natural language commands. The system uses:

- **Frontend:** OpenAI ChatKit for conversational interface
- **Backend:** Python FastAPI, handling AI logic, conversation flow, and API endpoints
- **AI Framework:** OpenAI Agents SDK integrated with **Cohere API** for natural language understanding
- **MCP Server:** Official MCP SDK to expose task operations as stateless tools
- **Database:** Neon Serverless PostgreSQL via SQLModel ORM
- **Authentication:** Better Auth

The backend is **stateless**, persisting all conversation and task data to the database. The chatbot interprets user commands, performs task operations via MCP tools, and sends responses to the frontend.

---

## 2. Chatbot Overview
The chatbot is the **user-facing interface** built with ChatKit:

- Receives user messages through a text input
- Sends messages to the backend API (`/api/{user_id}/chat`)
- Displays AI assistant responses to the user

**Chatbot Behavior:**

- All natural language understanding is handled by **backend agents**
- Chatbot itself contains **no AI logic**
- Frontend communicates with **TaskManagerAgent** and **ConversationAgent** on the backend for all operations

---

## 3. Agents
The project uses AI agents for backend task handling and conversation management.

**Agents (High-Level Reference):**

- **TaskManagerAgent** → Interprets natural language commands and maps them to MCP tools (add, list, update, delete, complete tasks) using **OpenAI Agents SDK + Cohere API**.
- **ConversationAgent** → Manages conversation context, fetches history from the database, coordinates responses from TaskManagerAgent, and persists chat messages in Neon PostgreSQL.

> Note: Skills and detailed logic will be implemented during development. Agents are referenced here for awareness.

---

## 4. MCP Tools Specification

| Tool | Purpose | Parameters | Returns |
|------|--------|-----------|--------|
| add_task | Create a new task | `user_id`, `title`, `description` (optional) | `task_id`, `status`, `title` |
| list_tasks | Retrieve tasks | `user_id`, `status` (all/pending/completed) | Array of task objects |
| complete_task | Mark task complete | `user_id`, `task_id` | `task_id`, `status`, `title` |
| delete_task | Remove a task | `user_id`, `task_id` | `task_id`, `status`, `title` |
| update_task | Update task details | `user_id`, `task_id`, `title` (optional), `description` (optional) | `task_id`, `status`, `title` |

> MCP tools are **stateless**; all state is persisted in the database.

---

## 5. Database Models

### 5.1 Task
- `user_id`, `id`, `title`, `description`, `completed`, `created_at`, `updated_at`

### 5.2 Conversation
- `user_id`, `id`, `created_at`, `updated_at`

### 5.3 Message
- `user_id`, `id`, `conversation_id`, `role` (user/assistant), `content`, `created_at`

---

## 6. API Endpoint

**POST** `/api/{user_id}/chat`

**Request:**
```json
{
  "conversation_id": integer,  // optional
  "message": "User message here"
}
```

**Response:**
```json
{
  "conversation_id": integer,
  "response": "AI assistant's message",
  "tool_calls": [ ... ]
}
```

## 7. Conversation Flow (Stateless)

1. User sends message → /api/{user_id}/chat via ChatKit
2. ConversationAgent fetches conversation history from Neon DB
3. User message saved in DB
4. TaskManagerAgent interprets message using OpenAI Agents SDK + Cohere API → invokes MCP tools
5. MCP tools perform operations on DB
6. TaskManagerAgent generates friendly response
7. Response and tool_calls stored in DB and returned to frontend

## 8. Frontend

- OpenAI ChatKit interface
- Sends user input to backend endpoint
- Displays AI assistant responses
- Frontend contains no AI logic; backend agents handle all intelligence
- Domain allowlist required for production deployment

## 9. Key Principles

- Stateless server: Any backend instance can handle requests
- Scalable & resilient: Conversation and task data persists in Neon
- Assistant: Cohere API via OpenAI Agents SDK
- MCP tools: Stateless, database-backed operations
- Conversation history: Stored in DB, fetched per request

## 10. Deployment

- Backend: Deployed on Vercel
- Frontend: Deployed on Vercel
- Database: Neon Serverless PostgreSQL
- Authentication: Better Auth

## 11. Constraints

- No local state on backend
- All conversation and task data persisted in Neon
- MCP tools are stateless
- Agents use OpenAI Agents SDK + Cohere API
- Frontend uses OpenAI ChatKit

## 12. Success Criteria

- User can manage tasks via natural language
- Conversation history persists across sessions
- Backend is stateless and scalable
- MCP tools correctly map to database operations
- Frontend displays AI responses correctly

## 13. Out of Scope

- Multi-user collaboration
- Task sharing
- Reminders/notifications
- Advanced task filtering (tags, priorities)

## 14. Future Enhancements

- Task prioritization
- Recurring tasks
- Task categories/tags
- Reminders
- Multi-user collaboration

## 15. References

- OpenAI Agents SDK
- Cohere API
- MCP SDK
- Neon PostgreSQL
- Better Auth
- OpenAI ChatKit
```

## Response snapshot

Updated project constitution from version 1.0.0 to 2.0.0 with complete architectural redefinition:

**Major Changes:**
- Project redefined from "Hackathon Todo App" to "Todo AI Chatbot"
- Architecture changed from traditional web app to AI agent-based conversational system
- Added agent specifications: TaskManagerAgent (NLU + MCP tool mapping) and ConversationAgent (context + persistence)
- Added MCP tools specification for stateless task operations (add_task, list_tasks, complete_task, delete_task, update_task)
- Technology stack updated: Added OpenAI ChatKit, Cohere API, OpenAI Agents SDK, MCP SDK
- API paradigm shifted from RESTful CRUD to conversational endpoint `/api/{user_id}/chat`
- Database models expanded: Added Conversation and Message entities for chat persistence
- Frontend changed from full Next.js app to ChatKit interface with no AI logic
- Defined stateless backend principles with database-backed conversation history

**Sync Impact Report Generated:**
- Templates verified for compatibility (spec, plan, tasks templates remain compatible)
- Follow-up items identified: README.md and CLAUDE.md should be reviewed for alignment

**Governance:**
- Version: 2.0.0 (MAJOR bump due to backward-incompatible architectural changes)
- Ratified: 2026-01-06
- Last Amended: 2026-01-16
- Revision history table updated with v2.0.0 entry

## Outcome

- ✅ Impact: Constitution completely redefined to reflect AI chatbot architecture with agents, MCP tools, and conversational interface. MAJOR version bump (1.0.0 → 2.0.0) due to fundamental architectural changes.
- 🧪 Tests: N/A (documentation update)
- 📁 Files: Updated .specify/memory/constitution.md with new architecture, added Sync Impact Report, updated version metadata and revision history
- 🔁 Next prompts: Consider updating README.md to reflect AI chatbot architecture; verify CLAUDE.md SDD rules align with stateless agent architecture; document agent implementation details if needed
- 🧠 Reflection: Successfully captured complete architectural pivot from traditional web app to AI agent-based system. All key components documented: agents, MCP tools, conversation flow, database models, and stateless principles. Templates remain compatible due to user story organization approach.

## Evaluation notes (flywheel)

- Failure modes observed: None. Constitution update completed successfully with proper version increment, Sync Impact Report, and governance metadata.
- Graders run and results (PASS/FAIL): N/A (documentation task)
- Prompt variant (if applicable): Standard /sp.constitution command with full constitution content provided
- Next experiment (smallest change to try): Monitor whether README.md and CLAUDE.md updates are needed based on actual implementation work; consider creating separate agent specification documents if agent logic becomes complex
