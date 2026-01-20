---
title: Todo App Backend API
emoji: 🚀
colorFrom: blue
colorTo: green
sdk: docker
pinned: false
app_port: 7860
---

# Todo App Backend - Phase II

FastAPI backend for the Todo App with AI chatbot integration.

## Features
- JWT Authentication
- Task Management API
- AI Chatbot with Cohere
- PostgreSQL Database (Neon)

## Environment Variables Required

Set these in HuggingFace Spaces Settings → Repository secrets:

```
DATABASE_URL=postgresql+asyncpg://neondb_owner:npg_0Oe1uvdXGDAt@ep-super-voice-a42icjpb-pooler.us-east-1.aws.neon.tech/neondb?ssl=require
BETTER_AUTH_SECRET=MySecureRandomString123456789012345678901234567890
COHERE_API_KEY=Z7WHfeKHlCoyryfsI45pTfeWVtYpQllCT7A3qUF6
FRONTEND_URL=https://full-stack-phase-ii-j9ig.vercel.app
CORS_ORIGINS=https://full-stack-phase-ii-j9ig.vercel.app
ENVIRONMENT=production
PORT=7860
HOST=0.0.0.0
RELOAD=false
WORKERS=1
LOG_LEVEL=INFO
```

## API Documentation

Once deployed, visit:
- API Docs: https://javeriafatima-chatbot.hf.space/docs
- Health Check: https://javeriafatima-chatbot.hf.space/health
