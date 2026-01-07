# Quickstart Guide: Todo App Frontend

**Feature**: Todo App Frontend Interface
**Branch**: `001-todo-frontend`
**Date**: 2026-01-06

## Overview

This guide provides step-by-step instructions for setting up and running the Todo App frontend development environment.

---

## Prerequisites

### Required Software

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher (comes with Node.js)
- **Docker**: v24.x or higher (for containerized development)
- **Docker Compose**: v2.x or higher
- **Git**: v2.x or higher

### Verify Installation

```bash
node --version    # Should be v18.x or higher
npm --version     # Should be v9.x or higher
docker --version  # Should be v24.x or higher
docker compose version  # Should be v2.x or higher
```

---

## Initial Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd phaseII
git checkout 001-todo-frontend
```

### 2. Navigate to Frontend Directory

```bash
cd frontend
```

### 3. Install Dependencies

```bash
npm install
```

**Expected Dependencies**:
- Next.js 16+
- React 18+
- TypeScript 5.x
- Tailwind CSS
- shadcn/ui components
- framer-motion
- Better Auth
- Zod (validation)
- SWR (data fetching)

### 4. Configure Environment Variables

Create `.env.local` file in the `frontend/` directory:

```bash
# Copy example environment file
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Better Auth Configuration
BETTER_AUTH_SECRET=your-secret-key-here-min-32-chars

# Environment
NODE_ENV=development
```

**Important**: Never commit `.env.local` to version control!

---

## Development Workflow

### Option 1: Local Development (Without Docker)

#### Start Development Server

```bash
npm run dev
```

The application will be available at: `http://localhost:3000`

#### Features:
- Hot reload enabled
- Fast refresh for React components
- TypeScript type checking
- Tailwind CSS compilation

#### Verify Setup

Open browser to `http://localhost:3000` and you should see:
- Dashboard page (if authenticated)
- Login page (if not authenticated)

### Option 2: Docker Development (Recommended)

#### Start All Services

From the repository root:

```bash
docker compose up
```

This starts:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- Database: PostgreSQL on port 5432

#### Stop Services

```bash
docker compose down
```

#### Rebuild After Changes

```bash
docker compose up --build
```

---

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Dashboard
│   ├── tasks/              # Task pages
│   └── globals.css         # Global styles
│
├── components/             # React components
│   ├── ui/                 # shadcn/ui components
│   ├── TaskCard.tsx
│   ├── TaskForm.tsx
│   ├── Header.tsx
│   └── ...
│
├── lib/                    # Utilities
│   ├── api.ts              # API client
│   ├── auth.ts             # Auth config
│   └── utils.ts            # Helpers
│
├── types/                  # TypeScript types
│   ├── task.ts
│   ├── api.ts
│   └── ui.ts
│
├── hooks/                  # Custom hooks
│   ├── useAuth.ts
│   └── useTasks.ts
│
├── public/                 # Static assets
├── tests/                  # Test files
├── .env.local              # Environment variables (not committed)
├── .env.example            # Environment template
├── next.config.js          # Next.js config
├── tailwind.config.js      # Tailwind config
├── tsconfig.json           # TypeScript config
└── package.json            # Dependencies
```

---

## Common Tasks

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run E2E tests
npm run test:e2e
```

### Linting and Formatting

```bash
# Run ESLint
npm run lint

# Fix ESLint issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check formatting
npm run format:check
```

### Type Checking

```bash
# Run TypeScript compiler check
npm run type-check
```

### Build for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

### Add shadcn/ui Components

```bash
# Add a new component
npx shadcn-ui@latest add <component-name>

# Example: Add button component
npx shadcn-ui@latest add button
```

---

## Development Guidelines

### Code Style

- Use TypeScript for all files
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful commit messages

### Component Guidelines

1. **Server Components by Default**
   - Use Server Components unless interactivity is needed
   - Mark Client Components with `"use client"` directive

2. **Client Components When Needed**
   - Interactive elements (buttons, forms)
   - Hooks (useState, useEffect, etc.)
   - Browser APIs
   - Event handlers

3. **Component Structure**
   ```typescript
   // components/TaskCard.tsx
   "use client" // Only if needed

   import { Task } from '@/types/task'

   interface TaskCardProps {
     task: Task
     onToggle?: (id: string) => void
   }

   export function TaskCard({ task, onToggle }: TaskCardProps) {
     // Component implementation
   }
   ```

### API Integration

Always use the centralized API client:

```typescript
// Good
import { taskApi } from '@/lib/api'

const tasks = await taskApi.list({ status: 'pending' })
```

```typescript
// Bad - Don't do this
const response = await fetch('/api/tasks')
const tasks = await response.json()
```

### State Management

Use appropriate state management:

```typescript
// Server Component - fetch directly
export default async function TasksPage() {
  const tasks = await taskApi.list()
  return <TaskList tasks={tasks} />
}

// Client Component - use SWR
"use client"
import { useTasks } from '@/hooks/useTasks'

export function TaskList() {
  const { tasks, isLoading, error } = useTasks()
  // ...
}
```

---

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or use different port
PORT=3001 npm run dev
```

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

```bash
# Restart TypeScript server in VS Code
# Command Palette (Cmd/Ctrl + Shift + P)
# > TypeScript: Restart TS Server

# Or rebuild
npm run build
```

### Docker Issues

```bash
# Remove all containers and volumes
docker compose down -v

# Rebuild from scratch
docker compose build --no-cache
docker compose up
```

### Environment Variables Not Loading

1. Ensure `.env.local` exists in `frontend/` directory
2. Restart development server after changing env vars
3. Verify variable names start with `NEXT_PUBLIC_` for client-side access

---

## Testing

### Unit Tests

Test individual components and functions:

```bash
npm test
```

Example test:

```typescript
// components/__tests__/TaskCard.test.tsx
import { render, screen } from '@testing-library/react'
import { TaskCard } from '../TaskCard'

describe('TaskCard', () => {
  it('renders task title', () => {
    const task = {
      id: '1',
      title: 'Test Task',
      completed: false,
      // ...
    }

    render(<TaskCard task={task} />)
    expect(screen.getByText('Test Task')).toBeInTheDocument()
  })
})
```

### Integration Tests

Test component interactions:

```bash
npm run test:integration
```

### E2E Tests

Test complete user flows with Playwright:

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui
```

Example E2E test:

```typescript
// tests/e2e/tasks.spec.ts
import { test, expect } from '@playwright/test'

test('create new task', async ({ page }) => {
  await page.goto('http://localhost:3000')
  await page.click('text=Add Task')
  await page.fill('input[name="title"]', 'New Task')
  await page.click('button:has-text("Save")')
  await expect(page.locator('text=New Task')).toBeVisible()
})
```

---

## Deployment

### Build Production Bundle

```bash
npm run build
```

### Test Production Build Locally

```bash
npm run build
npm start
```

### Docker Production Build

```bash
docker build -t todo-frontend:latest .
docker run -p 3000:3000 todo-frontend:latest
```

---

## Useful Commands Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm test` | Run tests |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Check TypeScript types |
| `npx shadcn-ui@latest add <component>` | Add shadcn/ui component |

---

## Additional Resources

### Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [framer-motion Documentation](https://www.framer.com/motion/)
- [Better Auth Documentation](https://better-auth.com)

### Specification Documents

- [Feature Specification](./spec.md)
- [Implementation Plan](./plan.md)
- [Data Model](./data-model.md)
- [API Contracts](./contracts/api-endpoints.md)

---

## Getting Help

### Common Issues

1. **Authentication not working**: Verify `BETTER_AUTH_SECRET` is set in `.env.local`
2. **API requests failing**: Check `NEXT_PUBLIC_API_URL` points to running backend
3. **Styles not applying**: Restart dev server after Tailwind config changes
4. **Type errors**: Run `npm run type-check` to see all TypeScript errors

### Support

- Check specification documents in `specs/001-todo-frontend/`
- Review constitution at `.specify/memory/constitution.md`
- Consult CLAUDE.md for agent-specific instructions

---

**Status**: ✅ Complete
**Last Updated**: 2026-01-06
