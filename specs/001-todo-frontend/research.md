# Research: Todo App Frontend Technology Decisions

**Feature**: Todo App Frontend Interface
**Branch**: `001-todo-frontend`
**Date**: 2026-01-06
**Status**: Complete

## Overview

This document captures research findings for technology integration patterns and best practices for the Todo App frontend. All research items from the implementation plan have been investigated and decisions documented.

---

## 1. Better Auth Integration with Next.js 16 App Router

### Research Question
How to integrate Better Auth JWT client in Next.js 16 App Router, considering Server vs Client Component architecture?

### Findings

**Better Auth Overview**:
- Better Auth is a modern authentication library for TypeScript/JavaScript
- Provides JWT token management out of the box
- Supports Next.js App Router with both Server and Client Components

**Integration Pattern**:
1. **Server Components**: Use for initial auth checks and protected routes
2. **Client Components**: Required for interactive auth UI (login forms, logout buttons)
3. **Middleware**: Use Next.js middleware for route protection

**Token Storage**:
- Better Auth can use httpOnly cookies (recommended for security)
- Alternatively, can use localStorage for SPA-style apps
- For this project: Use httpOnly cookies to prevent XSS attacks

**Implementation Approach**:
```typescript
// lib/auth.ts - Better Auth configuration
import { betterAuth } from "better-auth"

export const auth = betterAuth({
  jwt: {
    secret: process.env.BETTER_AUTH_SECRET!,
    expiresIn: "7d"
  },
  cookies: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
  }
})

// Server Component usage
import { auth } from "@/lib/auth"

export default async function ProtectedPage() {
  const session = await auth.getSession()
  if (!session) redirect("/login")
  // ... render protected content
}

// Client Component usage
"use client"
import { useAuth } from "@/hooks/useAuth"

export function LogoutButton() {
  const { logout } = useAuth()
  return <button onClick={logout}>Logout</button>
}
```

### Decision
- Use Better Auth with httpOnly cookies for secure token storage
- Server Components for route protection and initial data fetching
- Client Components only for interactive auth UI elements
- Create custom `useAuth` hook for client-side auth operations

---

## 2. shadcn/ui Setup and Configuration

### Research Question
How to install and configure shadcn/ui for Next.js 16 with Tailwind CSS?

### Findings

**shadcn/ui Overview**:
- Component library built on Radix UI primitives
- Fully customizable with Tailwind CSS
- Components are copied into your project (not npm package)
- Excellent accessibility out of the box

**Installation Steps**:
```bash
# 1. Initialize shadcn/ui
npx shadcn-ui@latest init

# 2. Add required components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add toast
```

**Configuration** (components.json):
```json
{
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

**Required Components for Todo App**:
- Button: Primary actions (Save, Delete, Add Task)
- Card: TaskCard component wrapper
- Input: Form fields (title, description)
- Label: Form labels
- Dialog: Delete confirmation, modals
- Dropdown Menu: Filter/sort controls
- Skeleton: Loading placeholders
- Toast: Success/error notifications

### Decision
- Use shadcn/ui with default theme and slate base color
- Enable RSC (React Server Components) support
- Use CSS variables for theming flexibility
- Install only required components to minimize bundle size

---

## 3. framer-motion Animation Patterns

### Research Question
How to use framer-motion with Next.js App Router, considering Server/Client Component architecture?

### Findings

**framer-motion Compatibility**:
- framer-motion requires Client Components (uses React hooks)
- Cannot be used directly in Server Components
- Need to wrap animated components with "use client" directive

**Animation Patterns for Todo App**:

1. **Page Transitions**:
```typescript
"use client"
import { motion } from "framer-motion"

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}
```

2. **State Transitions** (Loading → Success → Error):
```typescript
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.2 }}
>
  {isLoading ? <Skeleton /> : <TaskList />}
</motion.div>
```

3. **Hover Effects**:
```typescript
<motion.div
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: "spring", stiffness: 400 }}
>
  <TaskCard />
</motion.div>
```

4. **List Animations**:
```typescript
<motion.div
  variants={{
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }}
  initial="hidden"
  animate="show"
>
  {tasks.map(task => (
    <motion.div
      key={task.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
    >
      <TaskCard task={task} />
    </motion.div>
  ))}
</motion.div>
```

**Performance Considerations**:
- Use `layout` prop for smooth layout animations
- Avoid animating expensive properties (use transform and opacity)
- Use `will-change` CSS property sparingly
- Implement `AnimatePresence` for exit animations

### Decision
- Create wrapper components for common animation patterns
- Use Client Components for all animated elements
- Implement staggered animations for task lists
- Use spring animations for interactive elements (hover, tap)
- Keep animations under 300ms for responsiveness

---

## 4. JWT Token Management Strategy

### Research Question
How to securely store JWT tokens and automatically inject them into API requests?

### Findings

**Storage Options Comparison**:

| Method | Security | XSS Risk | CSRF Risk | Best For |
|--------|----------|----------|-----------|----------|
| httpOnly Cookie | High | Protected | Vulnerable | Server-rendered apps |
| localStorage | Medium | Vulnerable | Protected | SPAs with CSP |
| sessionStorage | Medium | Vulnerable | Protected | Single-tab apps |
| Memory only | High | Protected | Protected | High-security apps |

**Recommendation for This Project**:
- Use httpOnly cookies (set by Better Auth)
- Cookies automatically sent with requests to same domain
- No manual token injection needed for same-origin requests

**Cross-Origin API Requests**:
If backend is on different domain:
```typescript
// lib/api.ts
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    ...options,
    credentials: 'include', // Send cookies cross-origin
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (response.status === 401) {
    // Token expired, redirect to login
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }

  return response
}
```

**Token Refresh Strategy**:
- Better Auth handles token refresh automatically
- Implement retry logic for 401 responses
- Redirect to login only after refresh fails

### Decision
- Use httpOnly cookies for token storage (Better Auth default)
- Enable `credentials: 'include'` for cross-origin requests
- Implement automatic redirect to login on 401 responses
- No manual token extraction/injection needed (handled by cookies)

---

## 5. API Client Architecture

### Research Question
What's the optimal pattern for a centralized API client with JWT in App Router?

### Findings

**fetch vs axios**:
- Next.js recommends native `fetch` API
- fetch is built into Next.js with automatic caching
- axios adds 13KB to bundle size
- fetch supports Server Components natively

**API Client Pattern**:
```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Send cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    if (response.status === 401) {
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      throw new ApiError(401, 'Unauthorized')
    }

    const error = await response.json().catch(() => ({ message: 'Unknown error' }))
    throw new ApiError(response.status, error.message)
  }

  return response.json()
}

// Task API functions
export const taskApi = {
  list: (filters?: { status?: string; sort?: string }) => {
    const params = new URLSearchParams(filters as any)
    return apiRequest<Task[]>(`/api/tasks?${params}`)
  },

  get: (id: string) =>
    apiRequest<Task>(`/api/tasks/${id}`),

  create: (data: CreateTaskInput) =>
    apiRequest<Task>(`/api/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateTaskInput) =>
    apiRequest<Task>(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<void>(`/api/tasks/${id}`, {
      method: 'DELETE',
    }),

  toggleComplete: (id: string) =>
    apiRequest<Task>(`/api/tasks/${id}/complete`, {
      method: 'PATCH',
    }),
}
```

**Error Handling Pattern**:
- Custom `ApiError` class with status code
- Automatic 401 handling with redirect
- Graceful error message extraction
- Type-safe response handling

**Retry Mechanism**:
```typescript
async function apiRequestWithRetry<T>(
  endpoint: string,
  options: RequestInit = {},
  maxRetries = 3
): Promise<T> {
  let lastError: Error

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiRequest<T>(endpoint, options)
    } catch (error) {
      lastError = error as Error
      if (error instanceof ApiError && error.status === 401) {
        throw error // Don't retry auth errors
      }
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
      }
    }
  }

  throw lastError!
}
```

### Decision
- Use native `fetch` API (no axios)
- Centralized API client in `lib/api.ts`
- Custom `ApiError` class for type-safe error handling
- Automatic 401 redirect to login
- Optional retry mechanism for network errors
- Type-safe API functions with TypeScript generics

---

## 6. Responsive Design Breakpoints

### Research Question
What breakpoint strategy should we use with Tailwind CSS?

### Findings

**Tailwind CSS Default Breakpoints**:
```javascript
{
  'sm': '640px',   // Small devices (landscape phones)
  'md': '768px',   // Medium devices (tablets)
  'lg': '1024px',  // Large devices (desktops)
  'xl': '1280px',  // Extra large devices
  '2xl': '1536px'  // 2X Extra large devices
}
```

**Mobile-First Approach**:
- Tailwind uses mobile-first by default
- Base styles apply to all screen sizes
- Breakpoint prefixes apply styles at that size and above

**Responsive Strategy for Todo App**:

1. **Mobile (< 640px)**:
   - Single column layout
   - Hamburger menu
   - Full-width cards
   - Stacked form fields

2. **Tablet (640px - 1024px)**:
   - Two-column grid for task cards
   - Collapsible sidebar
   - Side-by-side form fields

3. **Desktop (> 1024px)**:
   - Three-column grid for task cards
   - Persistent sidebar
   - Optimized spacing

**Example Implementation**:
```typescript
<div className="
  grid
  grid-cols-1
  sm:grid-cols-2
  lg:grid-cols-3
  gap-4
  p-4
  sm:p-6
  lg:p-8
">
  {tasks.map(task => <TaskCard key={task.id} task={task} />)}
</div>
```

**Hamburger Menu Pattern**:
```typescript
"use client"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header>
      {/* Desktop nav - hidden on mobile */}
      <nav className="hidden md:flex gap-4">
        <Link href="/">Dashboard</Link>
        <Link href="/tasks">Tasks</Link>
      </nav>

      {/* Mobile hamburger */}
      <button
        className="md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      {/* Mobile menu */}
      {isOpen && (
        <nav className="md:hidden">
          <Link href="/">Dashboard</Link>
          <Link href="/tasks">Tasks</Link>
        </nav>
      )}
    </header>
  )
}
```

### Decision
- Use Tailwind's default breakpoints (no customization needed)
- Mobile-first approach (base styles for mobile, breakpoints for larger)
- Responsive grid: 1 column (mobile) → 2 columns (tablet) → 3 columns (desktop)
- Hamburger menu for mobile, persistent nav for desktop
- Consistent spacing scale: p-4 (mobile) → p-6 (tablet) → p-8 (desktop)

---

## 7. Accessibility Implementation

### Research Question
How to implement WCAG 2.1 Level AA compliance?

### Findings

**WCAG 2.1 Level AA Requirements**:

1. **Perceivable**:
   - Color contrast ratio ≥ 4.5:1 for normal text
   - Color contrast ratio ≥ 3:1 for large text
   - Text resizable up to 200% without loss of functionality
   - No information conveyed by color alone

2. **Operable**:
   - All functionality available via keyboard
   - No keyboard traps
   - Skip navigation links
   - Focus visible on all interactive elements
   - Sufficient time for interactions

3. **Understandable**:
   - Clear error messages
   - Consistent navigation
   - Input assistance (labels, instructions)
   - Error prevention for destructive actions

4. **Robust**:
   - Valid HTML
   - ARIA roles and properties
   - Compatible with assistive technologies

**Implementation Checklist**:

✅ **Semantic HTML**:
```typescript
// Good
<button onClick={handleClick}>Submit</button>
<nav><Link href="/tasks">Tasks</Link></nav>

// Bad
<div onClick={handleClick}>Submit</div>
<div><a href="/tasks">Tasks</a></div>
```

✅ **ARIA Roles and Labels**:
```typescript
<button
  aria-label="Delete task"
  aria-describedby="delete-description"
>
  <TrashIcon />
</button>
<span id="delete-description" className="sr-only">
  This action cannot be undone
</span>
```

✅ **Keyboard Navigation**:
```typescript
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick()
    }
  }}
>
  Custom Button
</div>
```

✅ **Focus Management**:
```typescript
"use client"
import { useEffect, useRef } from "react"

export function Dialog({ isOpen }: { isOpen: boolean }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus()
    }
  }, [isOpen])

  return (
    <div role="dialog" aria-modal="true">
      <button ref={closeButtonRef}>Close</button>
    </div>
  )
}
```

✅ **Color Contrast** (Tailwind CSS):
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // WCAG AA compliant color palette
        primary: {
          DEFAULT: '#2563eb', // 4.5:1 on white
          dark: '#1e40af',    // 7:1 on white
        },
        error: {
          DEFAULT: '#dc2626', // 4.5:1 on white
        }
      }
    }
  }
}
```

✅ **Screen Reader Support**:
```typescript
// Loading state
<div role="status" aria-live="polite">
  {isLoading ? "Loading tasks..." : `${tasks.length} tasks loaded`}
</div>

// Error state
<div role="alert" aria-live="assertive">
  {error && `Error: ${error.message}`}
</div>
```

**Testing Tools**:
- axe DevTools (browser extension)
- WAVE (Web Accessibility Evaluation Tool)
- Lighthouse accessibility audit
- Screen reader testing (NVDA, JAWS, VoiceOver)

### Decision
- Use semantic HTML throughout (button, nav, main, article, etc.)
- Add ARIA labels to all icon-only buttons
- Implement focus management for modals and dialogs
- Use Tailwind colors with verified WCAG AA contrast ratios
- Add skip navigation link for keyboard users
- Test with axe DevTools and screen readers before deployment
- Implement aria-live regions for dynamic content updates

---

## Summary of Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| Authentication | Better Auth with httpOnly cookies | Security (XSS protection), automatic token management |
| UI Components | shadcn/ui with default theme | Accessibility built-in, customizable, no bundle bloat |
| Animations | framer-motion with Client Components | Smooth animations, spring physics, good DX |
| Token Storage | httpOnly cookies | Most secure, prevents XSS attacks |
| API Client | Native fetch with centralized client | Next.js optimized, no extra dependencies |
| Responsive Design | Tailwind mobile-first, default breakpoints | Industry standard, proven approach |
| Accessibility | WCAG 2.1 Level AA compliance | Required by spec, semantic HTML + ARIA |

---

## Next Steps

1. Create `data-model.md` with TypeScript interfaces
2. Create `contracts/` directory with API type definitions
3. Create `quickstart.md` with setup instructions
4. Update agent context with technology decisions
5. Generate implementation tasks with `/sp.tasks`

---

**Research Status**: ✅ Complete
**All clarifications resolved**: Yes
**Ready for Phase 1 design**: Yes
