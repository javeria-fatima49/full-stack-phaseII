# Docker Setup Guide

## T102: Docker Compose Configuration

This guide explains how to use Docker Compose to run the entire Todo App stack (frontend, backend, and database).

---

## Prerequisites

- **Docker**: v24.x or higher
- **Docker Compose**: v2.x or higher

Verify installation:
```bash
docker --version
docker compose version
```

---

## Quick Start

### 1. Configure Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and update the following:
```env
# Change these in production!
JWT_SECRET=your-secret-key-min-32-characters-long
BETTER_AUTH_SECRET=your-secret-key-here-min-32-chars
POSTGRES_PASSWORD=secure-password-here
```

### 2. Start All Services

```bash
docker compose up
```

This starts:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **Database**: PostgreSQL on port 5432

### 3. Verify Services

Check that all services are running:
```bash
docker compose ps
```

Expected output:
```
NAME              STATUS    PORTS
todo-frontend     Up        0.0.0.0:3000->3000/tcp
todo-backend      Up        0.0.0.0:8000->8000/tcp
todo-database     Up        0.0.0.0:5432->5432/tcp
```

### 4. View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f frontend
docker compose logs -f backend
docker compose logs -f database
```

### 5. Stop Services

```bash
# Stop services (keeps data)
docker compose down

# Stop and remove volumes (deletes data)
docker compose down -v
```

---

## Docker Compose Services

### Frontend Service

**Image**: Node.js 18 Alpine
**Port**: 3000
**Volumes**:
- `./frontend:/app` - Source code (hot reload)
- `/app/node_modules` - Dependencies
- `/app/.next` - Build cache

**Environment Variables**:
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `BETTER_AUTH_SECRET` - Authentication secret
- `NODE_ENV` - Environment (development/production)

**Health Check**: HTTP GET to http://localhost:3000

### Backend Service

**Image**: Python 3.11 Alpine
**Port**: 8000
**Volumes**:
- `./backend:/app` - Source code (hot reload)
- `backend_cache` - Python cache

**Environment Variables**:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `CORS_ORIGINS` - Allowed CORS origins
- `ENVIRONMENT` - Environment (development/production)

**Health Check**: HTTP GET to http://localhost:8000/health

**Dependencies**: Waits for database to be healthy

### Database Service

**Image**: PostgreSQL 16 Alpine
**Port**: 5432
**Volumes**:
- `postgres_data` - Database data (persistent)
- `./backend/init.sql` - Initialization script

**Environment Variables**:
- `POSTGRES_DB` - Database name
- `POSTGRES_USER` - Database user
- `POSTGRES_PASSWORD` - Database password

**Health Check**: `pg_isready` command

---

## Common Commands

### Development

```bash
# Start services in background
docker compose up -d

# Rebuild services
docker compose up --build

# Restart specific service
docker compose restart frontend

# Execute command in container
docker compose exec frontend npm run lint
docker compose exec backend python manage.py migrate
```

### Debugging

```bash
# View service logs
docker compose logs -f frontend

# Access container shell
docker compose exec frontend sh
docker compose exec backend sh
docker compose exec database psql -U postgres -d todo_db

# Inspect service
docker compose ps
docker compose top frontend
```

### Cleanup

```bash
# Stop and remove containers
docker compose down

# Remove containers and volumes
docker compose down -v

# Remove containers, volumes, and images
docker compose down -v --rmi all

# Prune unused Docker resources
docker system prune -a
```

---

## Production Deployment

### 1. Update Environment Variables

Create production `.env` file:
```env
NODE_ENV=production
ENVIRONMENT=production
DEBUG=false
API_RELOAD=false

# Use strong secrets!
JWT_SECRET=<generate-strong-secret>
BETTER_AUTH_SECRET=<generate-strong-secret>
POSTGRES_PASSWORD=<generate-strong-password>

# Update URLs for production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
BETTER_AUTH_URL=https://yourdomain.com
```

### 2. Build Production Images

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml build
```

### 3. Start Production Services

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 4. Enable HTTPS

Use a reverse proxy (Nginx, Traefik, Caddy) for HTTPS:

```yaml
# docker-compose.prod.yml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend
```

---

## Troubleshooting

### Port Already in Use

**Problem**: Port 3000 or 8000 is already in use

**Solution**: Change ports in `.env`:
```env
FRONTEND_PORT=3001
BACKEND_PORT=8001
```

### Database Connection Failed

**Problem**: Backend can't connect to database

**Solution**:
1. Check database is healthy: `docker compose ps`
2. View database logs: `docker compose logs database`
3. Verify DATABASE_URL in backend environment
4. Wait for database initialization (may take 30-60 seconds)

### Frontend Can't Reach Backend

**Problem**: API requests fail with CORS or network errors

**Solution**:
1. Verify `NEXT_PUBLIC_API_URL` is set correctly
2. Check backend is running: `curl http://localhost:8000/health`
3. Verify CORS_ORIGINS includes frontend URL
4. Check Docker network: `docker network inspect todo-network`

### Hot Reload Not Working

**Problem**: Code changes don't trigger reload

**Solution**:
1. Verify volumes are mounted correctly
2. Check file permissions
3. Restart service: `docker compose restart frontend`
4. On Windows, ensure WSL2 is used for Docker

### Out of Disk Space

**Problem**: Docker runs out of disk space

**Solution**:
```bash
# Remove unused containers, images, volumes
docker system prune -a --volumes

# Check disk usage
docker system df
```

### Permission Errors

**Problem**: Permission denied errors in containers

**Solution**:
```bash
# Fix ownership (Linux/macOS)
sudo chown -R $USER:$USER ./frontend ./backend

# Or run as root (not recommended)
docker compose exec -u root frontend sh
```

---

## Network Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Docker Network                       │
│                     (todo-network)                       │
│                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────┐ │
│  │   Frontend   │───▶│   Backend    │───▶│ Database │ │
│  │   (Next.js)  │    │  (FastAPI)   │    │(Postgres)│ │
│  │   Port 3000  │    │   Port 8000  │    │ Port 5432│ │
│  └──────────────┘    └──────────────┘    └──────────┘ │
│         │                    │                   │      │
└─────────┼────────────────────┼───────────────────┼──────┘
          │                    │                   │
          ▼                    ▼                   ▼
    Host: 3000           Host: 8000          Host: 5432
```

**Service Communication**:
- Frontend → Backend: `http://backend:8000` (internal) or `http://localhost:8000` (external)
- Backend → Database: `postgresql://database:5432/todo_db`
- Browser → Frontend: `http://localhost:3000`
- Browser → Backend: `http://localhost:8000`

---

## Volume Management

### Named Volumes

- `postgres_data`: Database files (persistent)
- `backend_cache`: Python cache files
- `frontend_cache`: Next.js build cache

### Backup Database

```bash
# Export database
docker compose exec database pg_dump -U postgres todo_db > backup.sql

# Import database
docker compose exec -T database psql -U postgres todo_db < backup.sql
```

### Clear Caches

```bash
# Remove all volumes
docker compose down -v

# Remove specific volume
docker volume rm todo_postgres_data
```

---

## Performance Optimization

### Development

- Use volume mounts for hot reload
- Enable caching for faster rebuilds
- Limit resource usage in Docker Desktop settings

### Production

- Use multi-stage builds to reduce image size
- Enable BuildKit for faster builds
- Use production-optimized base images
- Implement health checks for reliability
- Set resource limits (CPU, memory)

```yaml
# Resource limits example
services:
  frontend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

---

## Security Best Practices

1. **Secrets Management**
   - Never commit `.env` to version control
   - Use Docker secrets in production
   - Rotate secrets regularly

2. **Network Security**
   - Use internal networks for service communication
   - Expose only necessary ports
   - Implement rate limiting

3. **Image Security**
   - Use official base images
   - Scan images for vulnerabilities
   - Keep images updated

4. **Access Control**
   - Run containers as non-root user
   - Use read-only file systems where possible
   - Implement least privilege principle

---

## Monitoring and Logging

### View Logs

```bash
# All services
docker compose logs -f

# Specific service with timestamps
docker compose logs -f --timestamps frontend

# Last 100 lines
docker compose logs --tail=100 backend
```

### Monitor Resources

```bash
# Real-time stats
docker stats

# Specific container
docker stats todo-frontend
```

### Health Checks

```bash
# Check service health
docker compose ps

# Inspect health status
docker inspect --format='{{.State.Health.Status}}' todo-frontend
```

---

## Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Docker Security](https://docs.docker.com/engine/security/)
- [Dockerfile Reference](https://docs.docker.com/engine/reference/builder/)

---

## Status

**Implementation**: ✅ Complete
**Testing**: Ready for testing
**Production**: Requires production-specific configuration

**Files Created**:
- `docker-compose.yml` - Main compose configuration
- `.env.example` - Environment variable template
- `docs/DOCKER_SETUP.md` - This documentation
