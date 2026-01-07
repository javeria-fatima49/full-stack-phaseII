# Data Model: Todo App Frontend

**Feature**: Todo App Frontend Interface
**Branch**: `001-todo-frontend`
**Date**: 2026-01-06

## Overview

This document defines the TypeScript data structures, state management patterns, and validation schemas for the Todo App frontend. All types are derived from the feature specification requirements.

---

## Core Entities

### Task Entity

Represents a user's todo item with all associated metadata.

```typescript
// types/task.ts

export interface Task {
  id: string
  title: string
  description: string | null
  completed: boolean
  created_at: string // ISO 8601 timestamp
  updated_at: string // ISO 8601 timestamp
  user_id: string
}

export type TaskStatus = 'pending' | 'completed' | 'all'

export type TaskSortField = 'created_at' | 'title' | 'updated_at'

export type TaskSortOrder = 'asc' | 'desc'
```

**Field Constraints** (from FR-007):
- `title`: Required, 1-200 characters
- `description`: Optional, max 1000 characters
- `completed`: Boolean, defaults to false
- Timestamps: ISO 8601 format (e.g., "2026-01-06T12:00:00Z")

---

## Form Data Types

### Create Task Input

Data structure for creating a new task.

```typescript
// types/task.ts

export interface CreateTaskInput {
  title: string
  description?: string
}

export interface CreateTaskFormData {
  title: string
  description: string
}
```

### Update Task Input

Data structure for updating an existing task.

```typescript
// types/task.ts

export interface UpdateTaskInput {
  title?: string
  description?: string
  completed?: boolean
}

export interface UpdateTaskFormData {
  title: string
  description: string
  completed: boolean
}
```

---

## UI State Types

### Loading States

Represents the loading state of async operations.

```typescript
// types/ui.ts

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface AsyncState<T> {
  data: T | null
  status: LoadingState
  error: string | null
}

// Example usage
export type TaskListState = AsyncState<Task[]>
export type TaskDetailState = AsyncState<Task>
```

### Filter and Sort State

Represents user's current filter and sort selections.

```typescript
// types/ui.ts

export interface TaskFilters {
  status: TaskStatus
  sortField: TaskSortField
  sortOrder: TaskSortOrder
}

export const DEFAULT_FILTERS: TaskFilters = {
  status: 'all',
  sortField: 'created_at',
  sortOrder: 'desc'
}
```

### Pagination State

For future pagination support (currently out of scope but structure defined).

```typescript
// types/ui.ts

export interface PaginationState {
  page: number
  pageSize: number
  total: number
  hasMore: boolean
}
```

---

## Form Validation Schemas

### Task Form Validation

Using Zod for runtime validation (recommended for Next.js forms).

```typescript
// lib/validation.ts

import { z } from 'zod'

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less')
    .trim(),
  description: z
    .string()
    .max(1000, 'Description must be 1000 characters or less')
    .optional()
    .default('')
})

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less')
    .trim()
    .optional(),
  description: z
    .string()
    .max(1000, 'Description must be 1000 characters or less')
    .optional(),
  completed: z.boolean().optional()
})

export type CreateTaskFormValues = z.infer<typeof createTaskSchema>
export type UpdateTaskFormValues = z.infer<typeof updateTaskSchema>
```

**Validation Rules** (from FR-007, FR-008):
- Title: Required, 1-200 characters, trimmed
- Description: Optional, max 1000 characters
- Real-time validation on input
- Display clear error messages

---

## Component State Patterns

### TaskCard Component State

```typescript
// components/TaskCard.tsx

interface TaskCardProps {
  task: Task
  onToggleComplete: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

interface TaskCardState {
  isToggling: boolean
  isDeleting: boolean
  error: string | null
}
```

### TaskForm Component State

```typescript
// components/TaskForm.tsx

interface TaskFormProps {
  mode: 'create' | 'edit'
  initialData?: Task
  onSubmit: (data: CreateTaskInput | UpdateTaskInput) => Promise<void>
  onCancel: () => void
}

interface TaskFormState {
  formData: CreateTaskFormData | UpdateTaskFormData
  errors: Record<string, string>
  isSubmitting: boolean
  submitError: string | null
}
```

### Dashboard State

```typescript
// app/page.tsx

interface DashboardState {
  stats: {
    total: number
    completed: number
    pending: number
  }
  recentTasks: Task[]
  isLoading: boolean
  error: string | null
}
```

### Task List State

```typescript
// app/tasks/page.tsx

interface TaskListState {
  tasks: Task[]
  filters: TaskFilters
  isLoading: boolean
  error: string | null
}
```

---

## State Management Strategy

### Client-Side State

For this application, we'll use React hooks for state management (no Redux/Zustand needed due to simple state requirements).

**State Location**:
- **Component-local state**: UI interactions (hover, focus, form inputs)
- **URL state**: Filters and sort (via searchParams)
- **Server state**: Task data (via React Query or SWR)

**Recommended Pattern**:
```typescript
// hooks/useTasks.ts
import useSWR from 'swr'
import { taskApi } from '@/lib/api'

export function useTasks(filters?: TaskFilters) {
  const { data, error, isLoading, mutate } = useSWR(
    ['/api/tasks', filters],
    () => taskApi.list(filters)
  )

  return {
    tasks: data ?? [],
    isLoading,
    error: error?.message ?? null,
    refresh: mutate
  }
}

export function useTask(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/tasks/${id}`,
    () => taskApi.get(id)
  )

  return {
    task: data ?? null,
    isLoading,
    error: error?.message ?? null,
    refresh: mutate
  }
}
```

### Server-Side State

Server Components can fetch data directly without client-side state:

```typescript
// app/page.tsx (Server Component)
import { taskApi } from '@/lib/api'

export default async function DashboardPage() {
  const tasks = await taskApi.list({ sortField: 'created_at', sortOrder: 'desc' })
  const recentTasks = tasks.slice(0, 5)

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length
  }

  return <Dashboard stats={stats} recentTasks={recentTasks} />
}
```

---

## Error Handling Types

### API Error Types

```typescript
// types/api.ts

export interface ApiError {
  status: number
  message: string
  details?: Record<string, string[]>
}

export interface ValidationError extends ApiError {
  status: 400
  details: Record<string, string[]>
}

export interface AuthError extends ApiError {
  status: 401
  message: 'Unauthorized'
}

export interface NotFoundError extends ApiError {
  status: 404
  message: string
}

export interface ServerError extends ApiError {
  status: 500
  message: string
}
```

### Error Display Types

```typescript
// types/ui.ts

export interface ErrorMessageProps {
  title?: string
  message: string
  onRetry?: () => void
  variant?: 'error' | 'warning' | 'info'
}
```

---

## Authentication State

### User Session

```typescript
// types/auth.ts

export interface User {
  id: string
  email: string
  name: string | null
}

export interface Session {
  user: User
  expiresAt: string
}

export interface AuthState {
  session: Session | null
  isLoading: boolean
  error: string | null
}
```

---

## Utility Types

### Common UI Types

```typescript
// types/ui.ts

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning'
  onConfirm: () => void
  onCancel: () => void
}
```

---

## Type Guards

Utility functions for type checking at runtime.

```typescript
// lib/type-guards.ts

export function isTask(value: unknown): value is Task {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'title' in value &&
    'completed' in value
  )
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'message' in error
  )
}
```

---

## Summary

### Type Organization

```
types/
├── task.ts       # Task entity and related types
├── api.ts        # API request/response types
├── auth.ts       # Authentication types
└── ui.ts         # UI state and component types
```

### Key Patterns

1. **Strict typing**: All data structures have explicit TypeScript interfaces
2. **Validation**: Zod schemas for runtime validation
3. **State management**: React hooks + SWR for server state
4. **Error handling**: Typed error objects with status codes
5. **Type guards**: Runtime type checking for API responses

### Dependencies Required

```json
{
  "dependencies": {
    "zod": "^3.22.4",
    "swr": "^2.2.4"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.3"
  }
}
```

---

**Status**: ✅ Complete
**Next**: Create API contracts in `contracts/` directory
