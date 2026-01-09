# Quick Setup Guide for Backend

## You have 2 options to run the backend:

### Option 1: Use Docker for Database Only (Recommended)

This is the easiest way - use Docker just for PostgreSQL, run backend manually.

**Step 1: Start PostgreSQL with Docker**
```bash
# From project root
cd "C:\Users\dell\javeria project\phaseII"

# Start only the database service
docker compose up database -d

# Wait 10 seconds for database to be ready
```

**Step 2: Update backend/.env.local**
The file is already configured for this! Just change the secret:
```
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/todo_db
BETTER_AUTH_SECRET=MySecureRandomString123456789012  # Change this!
```

**Step 3: Start backend**
```bash
cd backend
uvicorn app.main:app --reload --port 8001
```

---

### Option 2: Install PostgreSQL Locally

**Step 1: Install PostgreSQL**
- Download from: https://www.postgresql.org/download/windows/
- Install with default settings
- Remember the password you set for 'postgres' user

**Step 2: Create database**
```bash
# Open Command Prompt
psql -U postgres
# Enter your password

# In psql:
CREATE DATABASE todo_db;
\q
```

**Step 3: Update backend/.env.local**
```
DATABASE_URL=postgresql+asyncpg://postgres:YOUR_PASSWORD@localhost:5432/todo_db
BETTER_AUTH_SECRET=MySecureRandomString123456789012  # Change this!
```

**Step 4: Start backend**
```bash
cd backend
uvicorn app.main:app --reload --port 8001
```

---

## Current Status

✅ Backend code is ready
✅ .env.local file created
⏳ Need to configure DATABASE_URL and BETTER_AUTH_SECRET
⏳ Need to start PostgreSQL database
⏳ Need to start backend server

## Next Steps

1. Choose Option 1 or Option 2 above
2. Follow the steps for your chosen option
3. Backend will be available at: http://localhost:8001
4. Test with: http://localhost:8001/health

## Troubleshooting

**Port 8000 blocked?**
- Use port 8001 instead (already doing this!)
- Update frontend to use: http://localhost:8001/api

**Database connection failed?**
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database 'todo_db' exists

**Still getting validation errors?**
- Make sure .env.local file exists in backend/ directory
- Check file has DATABASE_URL and BETTER_AUTH_SECRET
- Restart the backend server
