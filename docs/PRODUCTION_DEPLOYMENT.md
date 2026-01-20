# Production Deployment Guide

## Overview

This guide covers deploying the Todo App to production:
- **Frontend**: Vercel (https://full-stack-phase-ii-j9ig.vercel.app/)
- **Backend**: HuggingFace Spaces (https://javeriafatima-chatbot.hf.space/)
- **Database**: Neon PostgreSQL

---

## Backend Deployment (HuggingFace Spaces)

### 1. Prerequisites
- HuggingFace account
- Repository pushed to HuggingFace Spaces
- Neon PostgreSQL database created

### 2. HuggingFace Spaces Setup

1. **Create a new Space**:
   - Go to https://huggingface.co/spaces
   - Click "Create new Space"
   - Name: `javeriafatima-chatbot`
   - SDK: Docker
   - Visibility: Public or Private

2. **Configure Repository**:
   - Push your backend code to the Space repository
   - Ensure `Dockerfile` is in the root of the backend directory
   - Add `README_HF.md` as the Space README

3. **Set Environment Variables**:
   Go to Settings → Repository secrets and add:

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

4. **Deploy**:
   - Push changes to trigger automatic deployment
   - Monitor build logs in the Space dashboard
   - Wait for "Running" status

5. **Verify Deployment**:
   - Visit: https://javeriafatima-chatbot.hf.space/health
   - Check API docs: https://javeriafatima-chatbot.hf.space/docs

---

## Frontend Deployment (Vercel)

### 1. Prerequisites
- Vercel account
- GitHub repository connected to Vercel

### 2. Vercel Setup

1. **Import Project**:
   - Go to https://vercel.com/dashboard
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Select the `frontend` directory as root

2. **Configure Build Settings**:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Set Environment Variables**:
   Go to Project Settings → Environment Variables and add:

   ```
   NEXT_PUBLIC_API_URL=https://javeriafatima-chatbot.hf.space
   NEXT_PUBLIC_BETTER_AUTH_URL=https://full-stack-phase-ii-j9ig.vercel.app
   ```

   **Important**: Add these for all environments (Production, Preview, Development)

4. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete
   - Vercel will provide a URL: https://full-stack-phase-ii-j9ig.vercel.app/

5. **Verify Deployment**:
   - Visit: https://full-stack-phase-ii-j9ig.vercel.app/
   - Test login/signup functionality
   - Test task creation and management
   - Test AI chatbot

---

## Database Setup (Neon PostgreSQL)

### Current Configuration
- Host: `ep-super-voice-a42icjpb-pooler.us-east-1.aws.neon.tech`
- Database: `neondb`
- User: `neondb_owner`
- SSL: Required

### Verify Connection
The backend automatically creates tables on startup. Check logs for:
```
✓ Configuration validated
✓ Database connection successful
✓ Environment: production
```

---

## CORS Configuration

### Backend CORS Settings
The backend is configured to allow requests from:
- `https://full-stack-phase-ii-j9ig.vercel.app`

### Verify CORS
1. Open browser DevTools → Network tab
2. Make a request from frontend to backend
3. Check response headers for:
   ```
   Access-Control-Allow-Origin: https://full-stack-phase-ii-j9ig.vercel.app
   Access-Control-Allow-Credentials: true
   ```

---

## API Routing

### Frontend → Backend Flow

1. **Frontend makes request**:
   ```javascript
   fetch('/api/tasks')  // Relative URL
   ```

2. **Next.js rewrites to backend**:
   ```
   /api/tasks → https://javeriafatima-chatbot.hf.space/api/tasks
   ```

3. **Backend processes request**:
   ```
   FastAPI router: /api/tasks
   ```

### Endpoint Structure

**Authentication**:
- POST `/api/auth/signup` - Register new user
- POST `/api/auth/signin` - Login user
- POST `/api/auth/signout` - Logout user
- GET `/api/auth/me` - Get current user

**Tasks**:
- GET `/api/tasks` - List all tasks
- POST `/api/tasks` - Create task
- GET `/api/tasks/{id}` - Get task by ID
- PUT `/api/tasks/{id}` - Update task
- DELETE `/api/tasks/{id}` - Delete task
- PATCH `/api/tasks/{id}/complete` - Toggle task completion

**Chat**:
- POST `/api/{user_id}/chat` - Send chat message
- GET `/api/{user_id}/conversations/{conversation_id}` - Get conversation history

---

## Troubleshooting

### Backend Issues

**Problem**: 500 Internal Server Error
- Check HuggingFace Spaces logs
- Verify all environment variables are set
- Check database connection

**Problem**: CORS errors
- Verify `FRONTEND_URL` and `CORS_ORIGINS` are correct
- Check browser console for specific CORS error
- Ensure credentials are included in requests

**Problem**: Database connection failed
- Verify `DATABASE_URL` includes `?ssl=require`
- Check Neon dashboard for database status
- Verify IP allowlist (if configured)

### Frontend Issues

**Problem**: API requests fail with 404
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check Next.js rewrites in `next.config.js`
- Verify backend is running

**Problem**: Authentication not working
- Verify `BETTER_AUTH_SECRET` matches on frontend and backend
- Check cookies are being set (DevTools → Application → Cookies)
- Verify `credentials: 'include'` in fetch requests

**Problem**: Chat not working
- Check user ID is being passed correctly
- Verify Cohere API key is set
- Check backend logs for errors

---

## Monitoring

### Backend Health Check
```bash
curl https://javeriafatima-chatbot.hf.space/health
```

Expected response:
```json
{
  "status": "healthy",
  "environment": "production",
  "version": "1.0.0"
}
```

### Database Health Check
```bash
curl https://javeriafatima-chatbot.hf.space/health/db
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected"
}
```

---

## Security Checklist

- [ ] `BETTER_AUTH_SECRET` is at least 32 characters
- [ ] Database connection uses SSL (`?ssl=require`)
- [ ] CORS origins are explicitly set (no wildcards)
- [ ] Environment variables are stored as secrets (not in code)
- [ ] API keys are not exposed in frontend code
- [ ] HTTPS is enforced on all endpoints
- [ ] Rate limiting is configured (if needed)

---

## Rollback Procedure

### Backend Rollback
1. Go to HuggingFace Spaces → Settings
2. Click "Restart Space"
3. Or revert to previous commit in repository

### Frontend Rollback
1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

---

## Support

- Backend API Docs: https://javeriafatima-chatbot.hf.space/docs
- Frontend: https://full-stack-phase-ii-j9ig.vercel.app/
- Issues: Check logs in respective platforms
