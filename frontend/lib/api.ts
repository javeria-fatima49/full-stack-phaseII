/**
 * Centralized API Client
 *
 * Provides a unified interface for making HTTP requests to the backend API.
 * Handles authentication via cookies (Better Auth), error handling, and request/response transformation.
 *
 * @module lib/api
 */

import { Task } from '@/types/task';
import {
  CreateTaskRequest,
  UpdateTaskRequest,
  ListTasksParams,
  ApiRequestOptions,
  TaskApiClient,
  ApiError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  ServerError,
  HttpStatus,
  isTask,
  isTaskArray,
} from '@/types/api';
import {
  ChatRequest,
  ChatResponse,
  ConversationHistoryResponse,
} from '@/types/chat';

// ============================================================================
// Configuration
// ============================================================================

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api').replace(/\/$/, '') + '/';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const RETRY_BACKOFF_MULTIPLIER = 2;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Build URL with query parameters
 */
function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  // Remove leading slash to make path relative, so it appends to base URL
  const relativePath = path.startsWith('/') ? path.substring(1) : path;
  const url = new URL(relativePath, API_BASE_URL);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable
 */
function isRetryableError(status: number): boolean {
  return status >= 500 || status === 429; // Server errors or rate limiting
}

// ============================================================================
// API Client
// ============================================================================

/**
 * Make an HTTP request with retry logic
 * Authentication is handled automatically via cookies set by Better Auth
 */
async function request<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;
  const url = buildUrl(path, params);

  let lastError: Error | null = null;
  let retryCount = 0;

  while (retryCount <= MAX_RETRIES) {
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          'Content-Type': 'application/json',
          // Include credentials (cookies) for authentication
          ...fetchOptions.headers,
        },
        // Include credentials to send cookies with requests
        credentials: 'include',
      });

      // Handle successful responses
      if (response.ok) {
        // No content responses (204)
        if (response.status === HttpStatus.NO_CONTENT) {
          return undefined as T;
        }

        const data = await response.json();
        return data;
      }

      // Handle error responses
      const errorData = await response.json().catch(() => ({
        detail: response.statusText,
      }));

      // Check if we should retry
      if (isRetryableError(response.status) && retryCount < MAX_RETRIES) {
        const delay = RETRY_DELAY * Math.pow(RETRY_BACKOFF_MULTIPLIER, retryCount);
        await sleep(delay);
        retryCount++;
        continue;
      }

      // Throw appropriate error based on status code
      switch (response.status) {
        case HttpStatus.UNAUTHORIZED:
          // T086: Redirect to login page on 401
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          throw new AuthenticationError(errorData.detail || 'Unauthorized');

        case HttpStatus.BAD_REQUEST:
          if (typeof errorData.detail === 'object') {
            throw new ValidationError('Validation failed', errorData.detail);
          }
          throw new ApiError(response.status, errorData.detail || 'Bad request');

        case HttpStatus.NOT_FOUND:
          throw new NotFoundError(errorData.detail || 'Resource not found');

        case HttpStatus.INTERNAL_SERVER_ERROR:
          throw new ServerError(errorData.detail || 'Internal server error');

        default:
          throw new ApiError(
            response.status,
            errorData.detail || `Request failed with status ${response.status}`
          );
      }
    } catch (error) {
      // Network errors or other exceptions
      if (error instanceof ApiError) {
        throw error;
      }

      lastError = error instanceof Error ? error : new Error('Unknown error');

      // Retry on network errors
      if (retryCount < MAX_RETRIES) {
        const delay = RETRY_DELAY * Math.pow(RETRY_BACKOFF_MULTIPLIER, retryCount);
        await sleep(delay);
        retryCount++;
        continue;
      }

      throw lastError;
    }
  }

  throw lastError || new Error('Request failed after retries');
}

/**
 * GET request
 */
async function get<T>(path: string, options?: ApiRequestOptions): Promise<T> {
  return request<T>(path, { ...options, method: 'GET' });
}

/**
 * POST request
 */
async function post<T>(
  path: string,
  data?: unknown,
  options?: ApiRequestOptions
): Promise<T> {
  return request<T>(path, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT request
 */
async function put<T>(
  path: string,
  data?: unknown,
  options?: ApiRequestOptions
): Promise<T> {
  return request<T>(path, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PATCH request
 */
async function patch<T>(
  path: string,
  data?: unknown,
  options?: ApiRequestOptions
): Promise<T> {
  return request<T>(path, {
    ...options,
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE request
 */
async function del<T>(path: string, options?: ApiRequestOptions): Promise<T> {
  return request<T>(path, { ...options, method: 'DELETE' });
}

// ============================================================================
// Task API Client
// ============================================================================

/**
 * Task API operations
 */
export const taskApi: TaskApiClient = {
  /**
   * List all tasks for the authenticated user
   */
  async list(params?: ListTasksParams): Promise<Task[]> {
    const queryParams: Record<string, string | undefined> = {};

    if (params?.status && params.status !== 'all') {
      queryParams.status = params.status;
    }
    if (params?.sortField) {
      queryParams.sort_field = params.sortField;
    }
    if (params?.sortOrder) {
      queryParams.sort_order = params.sortOrder;
    }

    const data = await get<Task[]>('/tasks', { params: queryParams });

    if (!isTaskArray(data)) {
      throw new Error('Invalid response: expected array of tasks');
    }

    return data;
  },

  /**
   * Get a single task by ID
   */
  async get(id: string): Promise<Task> {
    const data = await get<Task>(`/tasks/${id}`);

    if (!isTask(data)) {
      throw new Error('Invalid response: expected task object');
    }

    return data;
  },

  /**
   * Create a new task
   */
  async create(data: CreateTaskRequest): Promise<Task> {
    const task = await post<Task>('/tasks', data);

    if (!isTask(task)) {
      throw new Error('Invalid response: expected task object');
    }

    return task;
  },

  /**
   * Update an existing task
   */
  async update(id: string, data: UpdateTaskRequest): Promise<Task> {
    const task = await put<Task>(`/tasks/${id}`, data);

    if (!isTask(task)) {
      throw new Error('Invalid response: expected task object');
    }

    return task;
  },

  /**
   * Delete a task
   */
  async delete(id: string): Promise<void> {
    await del<void>(`/tasks/${id}`);
  },

  /**
   * Toggle task completion status
   */
  async toggleComplete(id: string): Promise<Task> {
    const task = await patch<Task>(`/tasks/${id}/complete`);

    if (!isTask(task)) {
      throw new Error('Invalid response: expected task object');
    }

    return task;
  },
};

// ============================================================================
// Chat API Client
// ============================================================================

/**
 * Chat API operations for AI chatbot
 */
export const chatApi = {
  /**
   * Send a message to the AI chatbot
   */
  async sendMessage(userId: string, data: ChatRequest): Promise<ChatResponse> {
    return post<ChatResponse>(`/${userId}/chat`, data);
  },

  /**
   * Get conversation history
   */
  async getConversationHistory(
    userId: string,
    conversationId: string
  ): Promise<ConversationHistoryResponse> {
    return get<ConversationHistoryResponse>(
      `/${userId}/conversations/${conversationId}`
    );
  },
};

// ============================================================================
// Export API Client
// ============================================================================

export const apiClient = {
  get,
  post,
  put,
  patch,
  delete: del,
};

export { API_BASE_URL };
