# Quickstart Guide: Todo AI Chatbot

**Last Updated**: 2026-01-16
**Feature**: Todo AI Chatbot - Phase 3
**Purpose**: Get the conversational AI chatbot running locally

---

## Prerequisites

Before starting, ensure you have:

- **Python 3.11+** installed
- **Node.js 18+** and npm installed
- **Neon PostgreSQL account** (or local PostgreSQL 16+)
- **Cohere API key** (sign up at https://cohere.com/)
- **Git** for version control

---

## Step 1: Clone and Setup Repository

```bash
# Clone the repository
git clone <repository-url>
cd phaseII

# Verify you're on the main branch
git branch
```

---

## Step 2: Backend Setup

### 2.1 Create Virtual Environment

```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate
```

### 2.2 Install Dependencies

```bash
pip install -r requirements.txt

# Install additional dependencies for Phase 3
pip install cohere openai-agents-sdk mcp-sdk
```

### 2.3 Configure Environment Variables

Create `.env.local` file in `backend/` directory:

```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:password@host.neon.tech/dbname?sslmode=require

# Authentication
BETTER_AUTH_SECRET=your-secure-secret-key-minimum-32-characters-long

# AI Configuration
COHERE_API_KEY=your-cohere-api-key-here

# CORS
FRONTEND_URL=http://localhost:3000

# Environment
ENVIRONMENT=development
LOG_LEVEL=DEBUG
```

**Getting Cohere API Key**:
1. Visit https://cohere.com/
2. Sign up for free account
3. Navigate to API Keys section
4. Copy your API key
5. Paste into `COHERE_API_KEY` in `.env.local`

### 2.4 Run Database Migrations

```bash
# Create new migration for Conversation and Message models
alembic revision --autogenerate -m "Add conversation and message models"

# Apply migrations
alembic upgrade head

# Verify tables created
python -c "from app.core.database import engine; from sqlmodel import SQLModel; print('Database connected successfully')"
```

### 2.5 Start Backend Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Verify Backend**:
- Open http://localhost:8000/docs
- You should see FastAPI Swagger UI
- Check `/health` endpoint returns 200 OK

---

## Step 3: Frontend Setup

### 3.1 Install Dependencies

```bash
# Open new terminal
cd frontend
npm install

# Install ChatKit (if not already in package.json)
npm install @openai/chatkit
```

### 3.2 Configure Environment Variables

Create `.env.local` file in `frontend/` directory:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Authentication
BETTER_AUTH_SECRET=your-secure-secret-key-minimum-32-characters-long
BETTER_AUTH_URL=http://localhost:3000
```

**Important**: `BETTER_AUTH_SECRET` must match the backend value exactly.

### 3.3 Start Frontend Server

```bash
npm run dev
```

**Verify Frontend**:
- Open http://localhost:3000
- You should see the application homepage
- Navigate to `/chat` to see chat interface

---

## Step 4: Test the Chatbot

### 4.1 Register/Login

1. Navigate to http://localhost:3000
2. Click "Sign Up" or "Login"
3. Create a test account or login with existing credentials
4. You should be redirected to the chat interface

### 4.2 Test Natural Language Commands

Try these example commands:

**Create Tasks**:
```
Add buy groceries to my list
Create a task to call mom
Remind me to finish the report
I need to schedule dentist appointment
```

**List Tasks**:
```
Show me my tasks
What do I need to do?
List my pending tasks
Show all tasks
```

**Complete Tasks**:
```
Mark task 1 as complete
I finished buying groceries
Complete the call mom task
Task 3 is done
```

**Update Tasks**:
```
Change task 2 to "buy milk and eggs"
Update task 1 description to "organic groceries"
Rename task 3 to "finish quarterly report"
```

**Delete Tasks**:
```
Delete task 5
Remove the groceries task
Get rid of task 2
```

### 4.3 Verify Conversation Persistence

1. Send a few messages
2. Close the browser tab
3. Reopen http://localhost:3000/chat
4. Verify previous conversation is displayed
5. Continue the conversation with context

---

## Step 5: Verify AI Agent Behavior

### 5.1 Check Backend Logs

In the backend terminal, you should see:

```
INFO: Received chat message from user 123
DEBUG: ConversationAgent fetching history for conversation 456
DEBUG: TaskManagerAgent processing message: "Add buy groceries"
DEBUG: Intent recognized: CREATE
DEBUG: Calling MCP tool: add_task
DEBUG: Tool result: {"task_id": 789, "status": "pending"}
INFO: Response generated: "I've added 'buy groceries' to your task list!"
```

### 5.2 Check Database

```bash
# Connect to Neon database
psql $DATABASE_URL

# Verify conversation created
SELECT * FROM conversation WHERE user_id = 123;

# Verify messages stored
SELECT * FROM message WHERE conversation_id = 456 ORDER BY created_at;

# Verify task created
SELECT * FROM task WHERE user_id = 123;
```

### 5.3 Test Error Handling

Try these scenarios:

**Invalid Commands**:
```
What's the weather?  # Should respond with clarification
asdfghjkl  # Should ask for clarification
```

**Non-existent Tasks**:
```
Complete task 99999  # Should respond with "task not found"
Delete task that doesn't exist  # Should handle gracefully
```

**Ambiguous Commands**:
```
Update task  # Should ask which task
Complete it  # Should ask which task (if no context)
```

---

## Step 6: Development Workflow

### 6.1 Making Changes

**Backend Changes**:
1. Edit files in `backend/app/`
2. Server auto-reloads (uvicorn --reload)
3. Test changes via Swagger UI or frontend

**Frontend Changes**:
1. Edit files in `frontend/`
2. Next.js auto-reloads
3. Test changes in browser

**Database Changes**:
1. Modify models in `backend/app/models/`
2. Generate migration: `alembic revision --autogenerate -m "description"`
3. Apply migration: `alembic upgrade head`

### 6.2 Running Tests

**Backend Tests**:
```bash
cd backend
pytest
pytest tests/test_agents.py -v  # Specific test file
pytest -k "test_add_task"  # Specific test
```

**Frontend Tests**:
```bash
cd frontend
npm test
npm test -- --watch  # Watch mode
```

### 6.3 Debugging

**Backend Debugging**:
- Check logs in terminal
- Use `LOG_LEVEL=DEBUG` for verbose output
- Add breakpoints with `import pdb; pdb.set_trace()`

**Frontend Debugging**:
- Open browser DevTools (F12)
- Check Console for errors
- Check Network tab for API requests
- Use React DevTools extension

**Database Debugging**:
```bash
# View recent messages
psql $DATABASE_URL -c "SELECT * FROM message ORDER BY created_at DESC LIMIT 10;"

# View conversation history
psql $DATABASE_URL -c "SELECT c.id, c.created_at, COUNT(m.id) as message_count FROM conversation c LEFT JOIN message m ON c.id = m.conversation_id GROUP BY c.id;"
```

---

## Step 7: Common Issues and Solutions

### Issue: Backend won't start

**Error**: `ModuleNotFoundError: No module named 'cohere'`

**Solution**:
```bash
pip install cohere openai-agents-sdk mcp-sdk
```

---

### Issue: Database connection failed

**Error**: `sqlalchemy.exc.OperationalError: could not connect to server`

**Solution**:
1. Verify `DATABASE_URL` in `.env.local`
2. Check Neon database is active
3. Ensure connection string includes `?sslmode=require`
4. Test connection: `psql $DATABASE_URL`

---

### Issue: Cohere API errors

**Error**: `CohereAPIError: invalid_api_key`

**Solution**:
1. Verify `COHERE_API_KEY` in `.env.local`
2. Check API key is valid at https://cohere.com/
3. Ensure no extra spaces or quotes in key

---

### Issue: Frontend can't connect to backend

**Error**: `Failed to fetch` or CORS errors

**Solution**:
1. Verify backend is running on port 8000
2. Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`
3. Verify `FRONTEND_URL` in backend `.env.local`
4. Check CORS configuration in `backend/app/main.py`

---

### Issue: JWT authentication failed

**Error**: `401 Unauthorized`

**Solution**:
1. Verify `BETTER_AUTH_SECRET` matches between frontend and backend
2. Check secret is 32+ characters
3. Clear browser cookies and login again
4. Check JWT token in browser DevTools → Application → Cookies

---

### Issue: Conversation not persisting

**Error**: Previous messages not showing after refresh

**Solution**:
1. Check database has Conversation and Message tables
2. Verify migrations ran: `alembic current`
3. Check `conversation_id` is being returned and sent
4. Review Message model in database

---

## Step 8: Next Steps

Once the chatbot is running:

1. **Explore Features**: Try all natural language commands
2. **Review Code**: Understand agent implementation in `backend/app/agents/`
3. **Customize Prompts**: Modify agent prompts for better accuracy
4. **Add Features**: Implement additional user stories from spec.md
5. **Run Tests**: Execute test suite and add new tests
6. **Deploy**: Follow deployment guide for production

---

## Useful Commands Reference

```bash
# Backend
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
pytest
alembic upgrade head

# Frontend
cd frontend
npm run dev
npm test
npm run build

# Database
psql $DATABASE_URL
alembic revision --autogenerate -m "description"
alembic upgrade head
alembic downgrade -1

# Git
git status
git add .
git commit -m "message"
git push
```

---

## Resources

- **Constitution**: `.specify/memory/constitution.md` - Project principles
- **Spec**: `specs/main/spec.md` - Feature requirements
- **Plan**: `specs/main/plan.md` - Implementation plan
- **Data Model**: `specs/main/data-model.md` - Database schema
- **API Contracts**: `specs/main/contracts/` - API specifications
- **Cohere Docs**: https://docs.cohere.com/
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **Next.js Docs**: https://nextjs.org/docs

---

## Support

For issues:
1. Check this quickstart guide
2. Review error messages in logs
3. Check constitution and spec documents
4. Review backend/frontend README files
5. Check database state with psql

---

**Happy Coding! 🚀**
