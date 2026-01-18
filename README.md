# Todo AI Chatbot - Natural Language Task Management

An AI-powered conversational assistant that allows users to manage their tasks through natural language commands. Built with OpenAI ChatKit, FastAPI, and Neon PostgreSQL.

## 🎯 Project Overview

The Todo AI Chatbot is an intelligent task management system that understands natural language and provides a conversational interface for managing todos. The system features:

- **Frontend**: OpenAI ChatKit for conversational interface
- **Backend**: Python FastAPI with AI agents for natural language understanding
- **AI Framework**: OpenAI Agents SDK integrated with Cohere API
- **MCP Server**: Official MCP SDK exposing stateless task operations
- **Database**: Neon Serverless PostgreSQL via SQLModel ORM
- **Authentication**: Better Auth with JWT tokens
- **Deployment**: Vercel (frontend & backend), Neon (database)

## 📋 Features

### User Features
- ✅ Natural language task management ("Add buy groceries to my list")
- ✅ Conversational interface with context awareness
- ✅ Create, read, update, and delete tasks via chat
- ✅ Toggle task completion through conversation
- ✅ List tasks with natural queries ("Show me my pending tasks")
- ✅ Persistent conversation history across sessions
- ✅ User authentication with JWT tokens
- ✅ Multi-user support with complete user isolation

### Technical Features
- ✅ Stateless backend architecture (any instance can handle requests)
- ✅ AI agents for natural language understanding (Cohere API)
- ✅ MCP tools for stateless task operations
- ✅ Conversation history persistence in database
- ✅ Type-safe Python backend with SQLModel ORM
- ✅ RESTful conversational API endpoint
- ✅ User isolation at database level
- ✅ SQL injection prevention via ORM
- ✅ Comprehensive error handling
- ✅ Environment-based configuration

## 🏗️ Architecture

### System Overview

```
User → ChatKit Interface → Backend API → AI Agents → MCP Tools → Database
                                ↓
                         Conversation History
```

### Components

1. **Frontend (OpenAI ChatKit)**
   - Conversational UI with text input
   - Displays AI assistant responses
   - No AI logic (all intelligence in backend)
   - Sends messages to `/api/{user_id}/chat`

2. **Backend (FastAPI)**
   - **ConversationAgent**: Manages conversation context, fetches history, persists messages
   - **TaskManagerAgent**: Interprets natural language, maps to MCP tools (OpenAI Agents SDK + Cohere API)
   - Stateless design (all state in database)
   - JWT authentication and user isolation

3. **MCP Tools (Stateless)**
   - `add_task`: Create new task
   - `list_tasks`: Retrieve tasks (all/pending/completed)
   - `complete_task`: Mark task complete
   - `delete_task`: Remove task
   - `update_task`: Update task details

4. **Database (Neon PostgreSQL)**
   - **Task**: user_id, id, title, description, completed, timestamps
   - **Conversation**: user_id, id, timestamps
   - **Message**: user_id, id, conversation_id, role, content, created_at

### Project Structure

```
phaseII/
├── frontend/              # OpenAI ChatKit application
│   ├── app/              # Chat interface
│   ├── components/       # UI components
│   ├── lib/              # API client
│   └── types/            # TypeScript definitions
│
├── backend/              # FastAPI application
│   ├── app/
│   │   ├── agents/       # AI agents (TaskManager, Conversation)
│   │   ├── api/          # API routes
│   │   ├── core/         # Auth, utilities
│   │   ├── models/       # SQLModel database models
│   │   ├── mcp/          # MCP tools
│   │   └── schemas/      # Pydantic schemas
│   └── tests/            # Backend tests
│
├── specs/                # Feature specifications
├── .specify/             # Spec-Kit Plus templates
├── history/              # Prompt History Records & ADRs
└── README.md            # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** (for frontend)
- **Python 3.11+** (for backend)
- **Neon PostgreSQL account** (or local PostgreSQL 16+)
- **Cohere API key** (for AI agents)
- **OpenAI Agents SDK** (installed via pip)

### Backend Setup

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
   ```

   Edit `.env.local`:
   ```bash
   DATABASE_URL=postgresql+asyncpg://user:pass@host.neon.tech/dbname?sslmode=require
   BETTER_AUTH_SECRET=your-secure-secret-key-here-min-32-chars
   COHERE_API_KEY=your-cohere-api-key
   FRONTEND_URL=http://localhost:3000
   ```

5. **Start backend server**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

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
   ```

   Edit `.env.local`:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   BETTER_AUTH_SECRET=your-secure-secret-key-here-min-32-chars
   BETTER_AUTH_URL=http://localhost:3000
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access application**
   - Open http://localhost:3000
   - Register/login to start chatting
   - Try: "Add buy groceries to my list"

## 🔧 Configuration

### Environment Variables

#### Backend
- `DATABASE_URL` - Neon PostgreSQL connection string
- `BETTER_AUTH_SECRET` - JWT signing secret (32+ characters, must match frontend)
- `COHERE_API_KEY` - Cohere API key for AI agents
- `FRONTEND_URL` - Frontend URL for CORS (default: `http://localhost:3000`)
- `ENVIRONMENT` - Environment mode (`development` or `production`)
- `LOG_LEVEL` - Logging level (`DEBUG`, `INFO`, `WARNING`, `ERROR`)

#### Frontend
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: `http://localhost:8000/api`)
- `BETTER_AUTH_SECRET` - JWT signing secret (must match backend)
- `BETTER_AUTH_URL` - Authentication URL (default: `http://localhost:3000`)

### Database Setup (Neon)

1. Create a Neon account at https://neon.tech
2. Create a new project and database
3. Copy the connection string
4. Update `DATABASE_URL` in backend `.env.local`:
   ```
   DATABASE_URL=postgresql+asyncpg://user:pass@host.neon.tech/dbname?sslmode=require
   ```

## 📚 API Documentation

### Conversational Endpoint

**POST** `/api/{user_id}/chat`

Handles conversational task management through natural language.

**Request:**
```json
{
  "conversation_id": 123,  // optional, omit for new conversation
  "message": "Add buy groceries to my list"
}
```

**Response:**
```json
{
  "conversation_id": 123,
  "response": "I've added 'buy groceries' to your task list!",
  "tool_calls": [
    {
      "tool": "add_task",
      "parameters": {"title": "buy groceries"},
      "result": {"task_id": 456, "status": "pending"}
    }
  ]
}
```

### Example Conversations

**Creating tasks:**
- "Add buy groceries to my list"
- "Create a task to call mom"
- "Remind me to finish the report"

**Listing tasks:**
- "Show me my tasks"
- "What do I need to do?"
- "List my pending tasks"

**Completing tasks:**
- "Mark task 3 as complete"
- "I finished buying groceries"
- "Complete the call mom task"

**Updating tasks:**
- "Change task 2 to 'buy milk and eggs'"
- "Update the report task description"

**Deleting tasks:**
- "Delete task 5"
- "Remove the groceries task"

### Health Checks

- `GET /health` - Application health
- `GET /health/db` - Database connectivity

## 🤖 AI Agents

### TaskManagerAgent

Interprets natural language commands and maps them to MCP tool operations.

**Capabilities:**
- Understands task creation intents
- Extracts task details from natural language
- Maps user requests to appropriate MCP tools
- Generates friendly conversational responses

**Technology:** OpenAI Agents SDK + Cohere API

### ConversationAgent

Manages conversation context and persistence.

**Responsibilities:**
- Fetches conversation history from database
- Coordinates with TaskManagerAgent
- Persists user and assistant messages
- Maintains conversation state across requests

## 🔒 Security

### Authentication Flow

1. User registers/logs in via Better Auth (frontend)
2. Better Auth issues JWT token stored in httpOnly cookie
3. Frontend includes cookie in all API requests
4. Backend verifies JWT signature on every request
5. User ID extracted from token (never trusted from URL)

### Security Features

- ✅ JWT signature verification
- ✅ httpOnly cookies (XSS protection)
- ✅ SameSite cookies (CSRF protection)
- ✅ User isolation at database query level
- ✅ SQL injection prevention via ORM
- ✅ Input validation (Pydantic)
- ✅ CORS with explicit origins
- ✅ No secrets in code (environment variables)
- ✅ Stateless backend (no session storage)

## 📦 Deployment

### Vercel Deployment

**Frontend:**
```bash
cd frontend
vercel deploy --prod
```

**Backend:**
```bash
cd backend
vercel deploy --prod
```

**Environment Variables:**
- Configure all environment variables in Vercel dashboard
- Ensure `BETTER_AUTH_SECRET` matches between frontend and backend
- Set `DATABASE_URL` to Neon connection string
- Add `COHERE_API_KEY` for AI agents

### Database (Neon)

- Already serverless and production-ready
- No additional deployment needed
- Ensure connection string uses SSL (`?sslmode=require`)

## 🛠️ Development

### Development Methodology

- **Spec-Driven Development**: All features documented in `specs/` before implementation
- **Agentic Development**: Built using Claude Code with Spec-Kit Plus
- **Constitution-Based**: Governed by `.specify/memory/constitution.md`
- **Stateless Architecture**: Any backend instance can handle any request

### Code Quality

- **Backend**: Black, isort, mypy, pylint, type hints
- **Frontend**: ESLint, TypeScript strict mode, Prettier
- **Testing**: pytest (backend), Jest (frontend)
- **Documentation**: Python docstrings, JSDoc

### Contributing

1. Read project constitution: `.specify/memory/constitution.md`
2. Review specifications in `specs/` directory
3. Follow Spec-Driven Development workflow
4. Write tests for new features
5. Update documentation
6. Submit pull request

## 📖 Documentation

- **Constitution**: `.specify/memory/constitution.md` - Project principles and architecture
- **Specifications**: `specs/` - Feature specifications and plans
- **Prompt History**: `history/prompts/` - Development history records
- **ADRs**: `history/adr/` - Architectural decision records
- **Frontend**: `frontend/README.md` - Frontend-specific documentation
- **Backend**: `backend/README.md` - Backend-specific documentation

## 🐛 Troubleshooting

### Common Issues

**Frontend can't connect to backend**
- Verify backend is running on port 8000
- Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`
- Verify CORS configuration in backend

**Database connection failed**
- Check `DATABASE_URL` format (must use `postgresql+asyncpg://`)
- Verify Neon database is active
- Ensure connection string includes `?sslmode=require`

**JWT authentication failed**
- Verify `BETTER_AUTH_SECRET` matches between frontend and backend
- Check secret is 32+ characters
- Ensure cookies are enabled in browser

**AI agent errors**
- Verify `COHERE_API_KEY` is set correctly
- Check Cohere API quota and rate limits
- Review backend logs for agent errors

**Conversation not persisting**
- Verify database connection is working
- Check that `conversation_id` is being returned and sent
- Review Message and Conversation models in database

## 🚫 Out of Scope

The following features are explicitly out of scope for the current version:

- Multi-user collaboration on tasks
- Task sharing between users
- Reminders and notifications
- Advanced task filtering (tags, priorities, categories)
- Recurring tasks
- Task attachments or file uploads

## 🔮 Future Enhancements

Planned features for future versions:

- Task prioritization (high, medium, low)
- Recurring tasks (daily, weekly, monthly)
- Task categories and tags
- Push notifications and reminders
- Multi-user collaboration
- Task sharing and delegation
- Voice input support
- Mobile app (iOS/Android)

## 📝 License

This project follows the project's license terms.

## 🙏 Acknowledgments

- Built with Claude Code using Spec-Kit Plus methodology
- Follows Spec-Driven Development principles
- Implements Todo AI Chatbot architecture from project constitution v2.0.0
- Powered by OpenAI Agents SDK and Cohere API

## 📞 Support

For issues and questions:
1. Check project constitution: `.specify/memory/constitution.md`
2. Review specifications in `specs/` directory
3. Check backend/frontend README files
4. Review conversation logs for debugging
5. Verify environment configuration

---

**Status**: 🚧 In Development

**Architecture Version**: 2.0.0 (Todo AI Chatbot)

**Last Updated**: 2026-01-16

**Constitution**: `.specify/memory/constitution.md` v2.0.0
