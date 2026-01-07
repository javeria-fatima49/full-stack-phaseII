/**
 * API Request and Response Types
 *
 * TypeScript interfaces for all API requests and responses.
 * These types ensure type safety when communicating with the backend.
 *
 * @module types/api
 */

import { Task, TaskFilterStatus, TaskSortField, TaskSortOrder } from './task';

// ============================================================================
// Request Types
// ============================================================================

/**
 * Request body for creating a new task
 */
export interface CreateTaskRequest {
  title: string;
  description?: string;
}

/**
 * Request body for updating an existing task
 */
export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  completed?: boolean;
}

/**
 * Query parameters for listing tasks
 */
export interface ListTasksParams {
  status?: TaskFilterStatus;
  sortField?: TaskSortField;
  sortOrder?: TaskSortOrder;
}

// ============================================================================
// Response Types
// ============================================================================

/**
 * Successful response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  status: number;
}

/**
 * Error response from the API
 */
export interface ApiErrorResponse {
  detail: string | Record<string, string[]>;
  status: number;
}

/**
 * Validation error details
 */
export interface ValidationErrorDetail {
  [field: string]: string[];
}

// ============================================================================
// API Client Types
// ============================================================================

/**
 * Options for API requests
 */
export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * API client interface for task operations
 */
export interface TaskApiClient {
  list(params?: ListTasksParams): Promise<Task[]>;
  get(id: string): Promise<Task>;
  create(data: CreateTaskRequest): Promise<Task>;
  update(id: string, data: UpdateTaskRequest): Promise<Task>;
  delete(id: string): Promise<void>;
  toggleComplete(id: string): Promise<Task>;
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
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Validation error (400)
 */
export class ValidationError extends ApiError {
  constructor(message: string, details: Record<string, string[]>) {
    super(HttpStatus.BAD_REQUEST, message, details);
    this.name = 'ValidationError';
  }
}

/**
 * Authentication error (401)
 */
export class AuthenticationError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(HttpStatus.UNAUTHORIZED, message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(HttpStatus.NOT_FOUND, message);
    this.name = 'NotFoundError';
  }
}

/**
 * Server error (500)
 */
export class ServerError extends ApiError {
  constructor(message: string = 'Internal server error') {
    super(HttpStatus.INTERNAL_SERVER_ERROR, message);
    this.name = 'ServerError';
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
  );
}

/**
 * Check if a value is an array of Tasks
 */
export function isTaskArray(value: unknown): value is Task[] {
  return Array.isArray(value) && value.every(isTask);
}

/**
 * Check if an error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Check if an error response has validation details
 */
export function hasValidationDetails(
  error: ApiErrorResponse
): error is ApiErrorResponse & { detail: Record<string, string[]> } {
  return typeof error.detail === 'object' && !Array.isArray(error.detail);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Extract error message from API error response
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred';
}

/**
 * Extract validation errors from API error response
 */
export function getValidationErrors(
  error: unknown
): Record<string, string[]> | null {
  if (error instanceof ValidationError && error.details) {
    return error.details;
  }

  return null;
}
