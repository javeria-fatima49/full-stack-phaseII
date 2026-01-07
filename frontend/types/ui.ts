/**
 * UI State Types
 *
 * TypeScript interfaces for managing UI state in components.
 * These types help track loading, error, and data states.
 *
 * @module types/ui
 */

import { TaskFilterStatus, TaskSortField, TaskSortOrder } from './task';

// ============================================================================
// Loading State
// ============================================================================

/**
 * Loading state for async operations
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Async state with data and error
 */
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

// ============================================================================
// Task Filters
// ============================================================================

/**
 * Task filter and sort configuration
 */
export interface TaskFilters {
  status: TaskFilterStatus;
  sortField: TaskSortField;
  sortOrder: TaskSortOrder;
}

/**
 * Default task filters
 */
export const DEFAULT_TASK_FILTERS: TaskFilters = {
  status: 'all',
  sortField: 'created_at',
  sortOrder: 'desc',
};

// ============================================================================
// Form State
// ============================================================================

/**
 * Form submission state
 */
export interface FormState {
  isSubmitting: boolean;
  errors: Record<string, string[]> | null;
  submitError: string | null;
}

/**
 * Initial form state
 */
export const INITIAL_FORM_STATE: FormState = {
  isSubmitting: false,
  errors: null,
  submitError: null,
};

// ============================================================================
// Modal State
// ============================================================================

/**
 * Modal/Dialog state
 */
export interface ModalState {
  isOpen: boolean;
  data?: unknown;
}

// ============================================================================
// Toast Notification
// ============================================================================

/**
 * Toast notification type
 */
export type ToastType = 'success' | 'error' | 'info' | 'warning';

/**
 * Toast notification
 */
export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

// ============================================================================
// Pagination State
// ============================================================================

/**
 * Pagination configuration
 */
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

/**
 * Calculate pagination info
 */
export function getPaginationInfo(state: PaginationState) {
  const totalPages = Math.ceil(state.total / state.pageSize);
  const hasNextPage = state.page < totalPages;
  const hasPreviousPage = state.page > 1;

  return {
    totalPages,
    hasNextPage,
    hasPreviousPage,
    startIndex: (state.page - 1) * state.pageSize,
    endIndex: Math.min(state.page * state.pageSize, state.total),
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create initial async state
 */
export function createAsyncState<T>(data: T | null = null): AsyncState<T> {
  return {
    data,
    loading: false,
    error: null,
  };
}

/**
 * Update async state to loading
 */
export function setLoading<T>(state: AsyncState<T>): AsyncState<T> {
  return {
    ...state,
    loading: true,
    error: null,
  };
}

/**
 * Update async state to success
 */
export function setSuccess<T>(_state: AsyncState<T>, data: T): AsyncState<T> {
  return {
    data,
    loading: false,
    error: null,
  };
}

/**
 * Update async state to error
 */
export function setError<T>(state: AsyncState<T>, error: Error): AsyncState<T> {
  return {
    ...state,
    loading: false,
    error,
  };
}
