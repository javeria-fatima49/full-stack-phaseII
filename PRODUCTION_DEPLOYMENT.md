# Production Deployment Guide - Phase II Todo App

This guide provides step-by-step instructions for deploying the Todo App to production environments.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Configuration](#environment-configuration)
3. [Database Setup (Neon)](#database-setup-neon)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Docker Deployment](#docker-deployment)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Monitoring and Maintenance](#monitoring-and-maintenance)

---

## Pre-Deployment Checklist

Before deploying to production, ensure:

- [ ] All tests pass locally (see TESTING_GUIDE.md)
- [ ] No console errors or warnings
- [ ] Build succeeds without errors
- [ ] Environment variables documented
- [ ] Secrets generated and secured
- [ ] Database backup strategy in place
- [ ] Monitoring and logging configured
- [ ] SSL certificates obtained
- [ ] Domain names configured
- [ ] CORS origins updated for production

---

## Environment Configuration

### Required Environment Variables

#### Backend (.env or platform environment)

```bash
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql+asyncpg://user:pass@host.neon.tech/dbname?sslmode=require

# Authentication (MUST match frontend)
BETTER_AUTH_SECRET=<generate-new-32+-char-secret>

# CORS (production frontend URL)
FRONTEND_URL=https://your-frontend-domain.com
CORS_ORIGINS=https://your-frontend-domain.com

# Server Configuration
ENVIRONMENT=production
LOG_LEVEL=WARNING
HOST=0.0.0.0
PORT=8000
RELOAD=false
WORKERS=4

# Database Pool (adjust based on load)
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=40
```

#### Frontend (.env.production or platform environment)

```bash
# Backend API URL (production backend)
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api

# Authentication (MUST match backend)
BETTER_AUTH_SECRET=<same-secret-as-backend>
BETTER_AUTH_URL=https://your-frontend-domain.com

# Environment
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### Generating Secure Secrets

```bash
# Generate BETTER_AUTH_SECRET (32+ characters)
# Linux/Mac:
openssl rand -base64 32

# Windows PowerShell:
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})

# Python:
python -c "import secrets; print(secrets.token_urlsafe(32))"

# IMPORTANT: Use the SAME secret for both frontend and backend!
```

---

## Database Setup (Neon)

### 1. Create Neon Account

1. Go to https://neon.tech
2. Sign up for free account
3. Create new project: "todo-app-production"

### 2. Create Database

1. In Neon dashboard, create new database: `todo_db`
2. Note the connection string
3. Ensure SSL is enabled (required for production)

### 3. Get Connection String

```
Format: postgresql+asyncpg://user:password@host.neon.tech/dbname?sslmode=require

Example:
postgresql+asyncpg://myuser:mypass@ep-cool-name-123456.us-east-2.aws.neon.tech/todo_db?sslmode=require
```

### 4. Database Migration

The backend automatically creates tables on startup via `create_db_and_tables()`.

For production, consider using Alembic for migrations:

```bash
# Install Alembic
pip install alembic

# Initialize Alembic
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Initial schema"

# Apply migration
alembic upgrade head
```

### 5. Database Backup

Neon provides automatic backups. Configure:
- Backup frequency: Daily
- Retention period: 7 days minimum
- Point-in-time recovery: Enable

---

## Backend Deployment

### Option 1: Railway

#### Setup

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Create new project:
   ```bash
   cd backend
   railway init
   ```

4. Set environment variables:
   ```bash
   railway variables set DATABASE_URL="postgresql+asyncpg://..."
   railway variables set BETTER_AUTH_SECRET="your-secret"
   railway variables set FRONTEND_URL="https://your-frontend.vercel.app"
   railway variables set ENVIRONMENT="production"
   railway variables set LOG_LEVEL="WARNING"
   ```

5. Deploy:
   ```bash
   railway up
   ```

6. Get deployment URL:
   ```bash
   railway domain
   ```

#### Configuration

Create `railway.json` in backend directory:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 4",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

### Option 2: Fly.io

#### Setup

1. Install Fly CLI:
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex

   # Linux/Mac
   curl -L https://fly.io/install.sh | sh
   ```

2. Login:
   ```bash
   fly auth login
   ```

3. Launch app:
   ```bash
   cd backend
   fly launch
   ```

4. Set secrets:
   ```bash
   fly secrets set DATABASE_URL="postgresql+asyncpg://..."
   fly secrets set BETTER_AUTH_SECRET="your-secret"
   fly secrets set FRONTEND_URL="https://your-frontend.vercel.app"
   fly secrets set ENVIRONMENT="production"
   ```

5. Deploy:
   ```bash
   fly deploy
   ```

#### Configuration

Create `fly.toml` in backend directory:

```toml
app = "todo-backend"
primary_region = "iad"

[build]
  dockerfile = "Dockerfile"

[env]
  PORT = "8000"
  ENVIRONMENT = "production"
  LOG_LEVEL = "WARNING"

[http_service]
  internal_port = 8000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 1
  processes = ["app"]

[[http_service.checks]]
  grace_period = "10s"
  interval = "30s"
  method = "GET"
  timeout = "5s"
  path = "/health"

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 512
```

---

### Option 3: Docker on VPS

#### Setup

1. Provision VPS (DigitalOcean, Linode, AWS EC2, etc.)
2. Install Docker and Docker Compose
3. Clone repository
4. Create production `.env` file
5. Build and run:

```bash
# Build image
docker build -t todo-backend:latest ./backend

# Run container
docker run -d \
  --name todo-backend \
  --restart unless-stopped \
  -p 8000:8000 \
  -e DATABASE_URL="postgresql+asyncpg://..." \
  -e BETTER_AUTH_SECRET="your-secret" \
  -e FRONTEND_URL="https://your-frontend.com" \
  -e ENVIRONMENT="production" \
  -e LOG_LEVEL="WARNING" \
  todo-backend:latest
```

#### Nginx Reverse Proxy

Create `/etc/nginx/sites-available/todo-backend`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/todo-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

Install SSL with Let's Encrypt:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

---

## Frontend Deployment

### Option 1: Vercel (Recommended)

#### Setup

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   cd frontend
   vercel --prod
   ```

4. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_API_URL`: https://your-backend.railway.app/api
   - `BETTER_AUTH_SECRET`: (same as backend)
   - `BETTER_AUTH_URL`: https://your-frontend.vercel.app

#### Configuration

Create `vercel.json` in frontend directory:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_API_URL": "@next_public_api_url",
    "BETTER_AUTH_SECRET": "@better_auth_secret",
    "BETTER_AUTH_URL": "@better_auth_url"
  }
}
```

---

### Option 2: Netlify

#### Setup

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Login:
   ```bash
   netlify login
   ```

3. Initialize:
   ```bash
   cd frontend
   netlify init
   ```

4. Deploy:
   ```bash
   netlify deploy --prod
   ```

5. Set environment variables in Netlify dashboard

#### Configuration

Create `netlify.toml` in frontend directory:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "18"
```

---

### Option 3: Docker on VPS

```bash
# Build image
docker build -t todo-frontend:latest ./frontend

# Run container
docker run -d \
  --name todo-frontend \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL="https://api.yourdomain.com/api" \
  -e BETTER_AUTH_SECRET="your-secret" \
  -e BETTER_AUTH_URL="https://yourdomain.com" \
  -e NODE_ENV="production" \
  todo-frontend:latest
```

Configure Nginx reverse proxy similar to backend.

---

## Docker Deployment (Full Stack)

### Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.9'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    environment:
      DATABASE_URL: ${DATABASE_URL}
      BETTER_AUTH_SECRET: ${BETTER_AUTH_SECRET}
      FRONTEND_URL: ${FRONTEND_URL}
      ENVIRONMENT: production
      LOG_LEVEL: WARNING
      WORKERS: 4
    ports:
      - "8000:8000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - todo-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
    restart: always
    environment:
      BETTER_AUTH_SECRET: ${BETTER_AUTH_SECRET}
      BETTER_AUTH_URL: ${BETTER_AUTH_URL}
      NODE_ENV: production
    ports:
      - "3000:3000"
    depends_on:
      - backend
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - todo-network

networks:
  todo-network:
    driver: bridge
```

Deploy:

```bash
# Create production .env
cp .env.example .env.production
# Edit .env.production with production values

# Deploy
docker compose -f docker-compose.prod.yml --env-file .env.production up -d

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Stop
docker compose -f docker-compose.prod.yml down
```

---

## Post-Deployment Verification

### 1. Health Checks

```bash
# Backend health
curl https://api.yourdomain.com/health
# Expected: {"status": "healthy", "environment": "production"}

# Database health
curl https://api.yourdomain.com/health/db
# Expected: {"status": "healthy", "database": "connected"}

# Frontend health
curl https://yourdomain.com
# Expected: 200 OK with HTML
```

### 2. API Testing

```bash
# Test signup
curl -X POST https://api.yourdomain.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test"}'

# Test signin
curl -X POST https://api.yourdomain.com/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Test protected endpoint
curl https://api.yourdomain.com/api/tasks \
  -H "Authorization: Bearer <token>"
```

### 3. Frontend Testing

1. Open https://yourdomain.com
2. Register new user
3. Create task
4. Verify all features work
5. Test on mobile device
6. Test on different browsers

### 4. SSL/HTTPS Verification

```bash
# Check SSL certificate
curl -vI https://yourdomain.com 2>&1 | grep -i ssl

# Test SSL rating
# Visit: https://www.ssllabs.com/ssltest/
# Enter your domain
# Target: A or A+ rating
```

### 5. Performance Testing

```bash
# Run Lighthouse audit
# Chrome DevTools > Lighthouse > Generate Report
# Target scores:
# - Performance: > 90
# - Accessibility: > 95
# - Best Practices: > 90
# - SEO: > 90
```

---

## Monitoring and Maintenance

### 1. Logging

#### Backend Logging

Configure structured logging in production:

```python
# app/main.py
import logging
from logging.handlers import RotatingFileHandler

if settings.environment == "production":
    handler = RotatingFileHandler(
        "logs/app.log",
        maxBytes=10485760,  # 10MB
        backupCount=10
    )
    handler.setFormatter(logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    ))
    logging.getLogger().addHandler(handler)
```

#### Frontend Logging

Use Vercel Analytics or similar:

```bash
# Install Vercel Analytics
npm install @vercel/analytics

# Add to app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 2. Error Tracking

#### Sentry Integration

```bash
# Install Sentry
npm install @sentry/nextjs  # Frontend
pip install sentry-sdk[fastapi]  # Backend

# Configure Sentry
# Frontend: sentry.client.config.js
# Backend: app/main.py
```

### 3. Uptime Monitoring

Use services like:
- UptimeRobot (free)
- Pingdom
- StatusCake
- Better Uptime

Configure alerts for:
- API downtime
- Frontend downtime
- Database connectivity issues
- High error rates

### 4. Database Monitoring

Monitor:
- Connection pool usage
- Query performance
- Database size
- Slow queries

Neon provides built-in monitoring dashboard.

### 5. Backup Strategy

#### Database Backups

```bash
# Manual backup (Neon)
# Use Neon dashboard to create backup

# Automated backups
# Configure in Neon settings:
# - Daily backups
# - 7-day retention
# - Point-in-time recovery
```

#### Application Backups

```bash
# Backup environment variables
# Store securely in password manager or secrets vault

# Backup Docker images
docker save todo-backend:latest | gzip > todo-backend-backup.tar.gz
docker save todo-frontend:latest | gzip > todo-frontend-backup.tar.gz
```

### 6. Security Updates

Regular maintenance:
- [ ] Update dependencies monthly
- [ ] Review security advisories
- [ ] Rotate secrets quarterly
- [ ] Review access logs
- [ ] Update SSL certificates (auto with Let's Encrypt)
- [ ] Review CORS configuration
- [ ] Audit user permissions

---

## Rollback Procedure

If deployment fails or issues arise:

### 1. Quick Rollback (Vercel/Railway)

```bash
# Vercel
vercel rollback

# Railway
railway rollback
```

### 2. Docker Rollback

```bash
# Stop current containers
docker compose -f docker-compose.prod.yml down

# Pull previous image
docker pull todo-backend:previous
docker pull todo-frontend:previous

# Start with previous images
docker compose -f docker-compose.prod.yml up -d
```

### 3. Database Rollback

```bash
# Restore from Neon backup
# Use Neon dashboard to restore to previous point in time
```

---

## Troubleshooting

### Common Production Issues

**CORS Errors**:
- Verify FRONTEND_URL in backend matches actual frontend domain
- Check CORS_ORIGINS includes production frontend URL
- Ensure HTTPS is used (not HTTP)

**Authentication Failures**:
- Verify BETTER_AUTH_SECRET matches between frontend and backend
- Check JWT token expiration (30 days default)
- Verify cookies are set with correct domain

**Database Connection Issues**:
- Verify DATABASE_URL includes `?sslmode=require`
- Check Neon database is active (not paused)
- Verify connection pool settings
- Check database credentials

**Performance Issues**:
- Increase WORKERS count for backend
- Optimize database queries
- Add database indexes
- Enable CDN for frontend
- Implement caching

---

## Cost Estimation

### Free Tier (Development/Testing)

- **Neon**: Free tier (0.5 GB storage, 100 hours compute)
- **Vercel**: Free tier (100 GB bandwidth)
- **Railway**: $5/month credit (free trial)
- **Total**: ~$0-5/month

### Production (Low Traffic)

- **Neon**: Pro plan ($19/month)
- **Vercel**: Pro plan ($20/month)
- **Railway**: ~$10-20/month
- **Total**: ~$50-60/month

### Production (High Traffic)

- **Neon**: Scale plan ($69/month)
- **Vercel**: Pro plan ($20/month)
- **Railway**: ~$50-100/month
- **Monitoring**: ~$10-20/month
- **Total**: ~$150-200/month

---

## Security Checklist

- [ ] HTTPS enabled on all domains
- [ ] SSL certificates valid and auto-renewing
- [ ] BETTER_AUTH_SECRET is strong (32+ characters)
- [ ] Database uses SSL connection
- [ ] CORS configured with explicit origins (no wildcards)
- [ ] Environment variables secured (not in code)
- [ ] Secrets rotated regularly
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (ORM)
- [ ] XSS prevention (httpOnly cookies)
- [ ] CSRF protection (SameSite cookies)
- [ ] Error messages don't leak sensitive info
- [ ] Logging doesn't include passwords/tokens
- [ ] Database backups enabled
- [ ] Monitoring and alerting configured

---

## Support and Resources

- **Neon Documentation**: https://neon.tech/docs
- **Vercel Documentation**: https://vercel.com/docs
- **Railway Documentation**: https://docs.railway.app
- **Fly.io Documentation**: https://fly.io/docs
- **FastAPI Deployment**: https://fastapi.tiangolo.com/deployment/
- **Next.js Deployment**: https://nextjs.org/docs/deployment

---

**Last Updated**: 2026-01-07
**Version**: 1.0.0
