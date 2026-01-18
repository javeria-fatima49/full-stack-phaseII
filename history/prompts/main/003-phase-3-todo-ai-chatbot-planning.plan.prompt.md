---
id: 003
title: Phase 3 Todo AI Chatbot Planning
stage: plan
date: 2026-01-16
surface: agent
model: claude-sonnet-4-5-20250929
feature: main
branch: main
user: dell
command: /sp.plan
labels: ["planning", "ai-chatbot", "phase-3", "agents", "mcp-tools", "cohere", "chatkit"]
links:
  spec: specs/main/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/main/spec.md
  - specs/main/plan.md
  - specs/main/research.md
  - specs/main/data-model.md
  - specs/main/quickstart.md
  - specs/main/contracts/chat-api.yaml
  - specs/main/contracts/mcp-tools.yaml
  - CLAUDE.md (updated with new technologies)
tests:
  - none (planning phase)
---

## Prompt

```text
# Phase 3 Execution Plan — Todo AI Chatbot

## Overview

This document defines the **execution roadmap** for Phase 3 after upgrading the project constitution to **v2.0.0**. The goal of Phase 3 is to transform the existing Todo application into a **stateless AI-powered conversational chatbot** using Cohere API, OpenAI Agents SDK, MCP tools, and Neon DB.

---

## Objectives

* Implement backend AI agents as defined in the constitution
* Create stateless MCP tools for task operations
* Expose a conversational API endpoint
* Integrate a frontend chatbot UI
* Ensure security, scalability, and maintainability

---

## Phase 3 Roadmap

### Step 1: Architecture Lock & Commit
[... full Phase 3 execution plan provided by user ...]
```

## Response snapshot

Successfully completed Phase 3 implementation planning for Todo AI Chatbot following Constitution v2.0.0.

**Planning Workflow Executed:**

1. **Setup**: Ran setup-plan.ps1, created specs/main/ directory structure
2. **Context Loading**: Read Constitution v2.0.0, created comprehensive feature specification
3. **Technical Context**: Defined all technical parameters (Python 3.11+, FastAPI, Cohere API, OpenAI Agents SDK, MCP SDK, ChatKit, Next.js 16+, Neon PostgreSQL)
4. **Constitution Check**: ✅ PASS - All 12 constitutional requirements verified and satisfied
5. **Phase 0 - Research**: Generated research.md with 5 technical areas resolved:
   - OpenAI Agents SDK + Cohere integration patterns
   - MCP SDK implementation with stateless tool design
   - OpenAI ChatKit integration for Next.js
   - Conversation context management strategies
   - Natural language understanding prompt engineering
6. **Phase 1 - Design**: Generated complete design artifacts:
   - data-model.md: 3 entities (Task, Conversation, Message) with SQLModel definitions
   - contracts/chat-api.yaml: OpenAPI spec for POST /api/{user_id}/chat
   - contracts/mcp-tools.yaml: 5 MCP tool definitions (add, list, complete, delete, update)
   - quickstart.md: Comprehensive setup and testing guide
7. **Agent Context Update**: Updated CLAUDE.md with new technologies from plan

**Key Decisions Documented:**

- **AI Framework**: OpenAI Agents SDK + Cohere API for NLU
- **MCP Tools**: Official MCP SDK with stateless function design
- **Frontend**: OpenAI ChatKit for conversational UI
- **Context Management**: Full history fetch with truncation (50 messages)
- **NLU Approach**: Prompt engineering with intent recognition

**Architecture Highlights:**

- **Stateless Backend**: All state in Neon PostgreSQL
- **2 AI Agents**: ConversationAgent (context + persistence), TaskManagerAgent (NLU + MCP tools)
- **5 MCP Tools**: Stateless, database-backed task operations
- **1 API Endpoint**: POST /api/{user_id}/chat for conversational interface
- **Database Models**: Task (existing), Conversation (new), Message (new)

**Project Structure Defined:**

- Backend: agents/, mcp/, api/chat.py, models/, schemas/
- Frontend: chat/, components/chat/, ChatKit integration
- Documentation: spec.md, plan.md, research.md, data-model.md, quickstart.md, contracts/

**Constitution Compliance**: ✅ All requirements met, no violations

## Outcome

- ✅ Impact: Complete Phase 3 implementation plan created with all design artifacts. Ready for /sp.tasks to generate implementation tasks.
- 🧪 Tests: N/A (planning phase - no code written yet)
- 📁 Files: Created 7 specification/design files (spec, plan, research, data-model, quickstart, 2 contracts), updated CLAUDE.md
- 🔁 Next prompts: Run /sp.tasks to generate implementation tasks from plan; Begin Phase 2 implementation (database models); Implement AI agents and MCP tools
- 🧠 Reflection: Successfully translated Constitution v2.0.0 and user's Phase 3 execution plan into comprehensive implementation plan. All technical unknowns resolved through research. Design artifacts provide clear blueprint for implementation. Constitution check passed with no violations. Agent context updated with new technologies. Ready for task generation and implementation.

## Evaluation notes (flywheel)

- Failure modes observed: None. Planning workflow completed successfully with all required artifacts generated.
- Graders run and results (PASS/FAIL): Constitution Check: PASS (all 12 requirements met)
- Prompt variant (if applicable): Standard /sp.plan workflow with user-provided Phase 3 execution plan
- Next experiment (smallest change to try): Generate tasks with /sp.tasks, begin implementation with Phase 2 (database models), monitor Cohere API integration for accuracy and rate limits
