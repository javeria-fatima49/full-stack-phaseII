/**
 * API Type Definitions
 *
 * TypeScript interfaces for all API requests and responses.
 * These types ensure type safety when communicating with the backend.
 *
 * @module types/api
 */

// ============================================================================
// Task Types
// ============================================================================

/**
 * Task entity returned from the API
 */
export interface Task {
  id: string
  title: string
  description: string | null
  completed: boolean
  created_at: string // ISO 8601 timestamp
  updated_at: string // ISO 8601 timestamp
  user_id: string
}

/**
 * Request body for creating a new task
 */
export interface CreateTaskRequest {
  title: string
  description?: string
}

/**
 * Request body for updating an existing task
 */
export interface UpdateTaskRequest {
  title?: string
  description?: string
  completed?: boolean
}

/**
 * Query parameters for listing tasks
 */
export interface ListTasksParams {
  status?: 'all' | 'pending' | 'completed'
  sortField?: 'created_at' | 'title' | 'updated_at'
  sortOrder?: 'asc' | 'desc'
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Successful response wrapper
 */
export interface ApiResponse<T> {
  data: T
  status: number
}

/**
 * Error response from the API
 */
export interface ApiErrorResponse {
  detail: string | Record<string, string[]>
  status: number
}

/**
 * Validation error details
 */
export interface ValidationErrorDetail {
  [field: string]: string[]
}

// ============================================================================
// API Client Types
// ============================================================================

/**
 * Options for API requests
 */
export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

/**
 * API client interface
 */
export interface TaskApiClient {
  /**
   * List all tasks for the authenticated user
   */
  list(params?: ListTasksParams): Promise<Task[]>

  /**
   * Get a single task by ID
   */
  get(id: string): Promise<Task>

  /**
   * Create a new task
   */
  create(data: CreateTaskRequest): Promise<Task>

  /**
   * Update an existing task
   */
  update(id: string, data: UpdateTaskRequest): Promise<Task>

  /**
   * Delete a task
   */
  delete(id: string): Promise<void>

  /**
   * Toggle task completion status
   */
  toggleComplete(id: string): Promise<Task>
}

// ============================================================================
// HTTP Status Codes
// ============================================================================

export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

// ============================================================================
// Custom Error Classes
// ============================================================================

/**
 * Base API error class
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: Record<string, string[]>
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Validation error (400)
 */
export class ValidationError extends ApiError {
  constructor(message: string, details: Record<string, string[]>) {
    super(HttpStatus.BAD_REQUEST, message, details)
    this.name = 'ValidationError'
  }
}

/**
 * Authentication error (401)
 */
export class AuthenticationError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(HttpStatus.UNAUTHORIZED, message)
    this.name = 'AuthenticationError'
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(HttpStatus.NOT_FOUND, message)
    this.name = 'NotFoundError'
  }
}

/**
 * Server error (500)
 */
export class ServerError extends ApiError {
  constructor(message: string = 'Internal server error') {
    super(HttpStatus.INTERNAL_SERVER_ERROR, message)
    this.name = 'ServerError'
  }
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if a value is a Task
 */
export function isTask(value: unknown): value is Task {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof (value as Task).id === 'string' &&
    'title' in value &&
    typeof (value as Task).title === 'string' &&
    'completed' in value &&
    typeof (value as Task).completed === 'boolean' &&
    'created_at' in value &&
    typeof (value as Task).created_at === 'string' &&
    'updated_at' in value &&
    typeof (value as Task).updated_at === 'string'
  )
}

/**
 * Check if a value is an array of Tasks
 */
export function isTaskArray(value: unknown): value is Task[] {
  return Array.isArray(value) && value.every(isTask)
}

/**
 * Check if an error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

/**
 * Check if an error response has validation details
 */
export function hasValidationDetails(
  error: ApiErrorResponse
): error is ApiErrorResponse & { detail: Record<string, string[]> } {
  return typeof error.detail === 'object' && !Array.isArray(error.detail)
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Extract error message from API error response
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'An unknown error occurred'
}

/**
 * Extract validation errors from API error response
 */
export function getValidationErrors(
  error: unknown
): Record<string, string[]> | null {
  if (error instanceof ValidationError && error.details) {
    return error.details
  }

  return null
}

// ============================================================================
// Example Usage
// ============================================================================

/*
// Import types
import { Task, CreateTaskRequest, ApiError } from '@/types/api'

// Use in API client
async function createTask(data: CreateTaskRequest): Promise<Task> {
  try {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new ApiError(response.status, 'Failed to create task')
    }

    const task = await response.json()

    if (!isTask(task)) {
      throw new Error('Invalid task response')
    }

    return task
  } catch (error) {
    console.error(getErrorMessage(error))
    throw error
  }
}

// Use in component
import { Task } from '@/types/api'

interface TaskCardProps {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  return (
    <div>
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      <span>{task.completed ? 'Completed' : 'Pending'}</span>
    </div>
  )
}
*/
