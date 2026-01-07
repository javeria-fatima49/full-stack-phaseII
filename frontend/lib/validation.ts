/**
 * Form Validation Schemas
 *
 * Zod schemas for validating form inputs.
 * These schemas ensure data integrity before sending to the API.
 *
 * @module lib/validation
 */

import { z } from 'zod';

// ============================================================================
// Task Validation Schemas
// ============================================================================

/**
 * Schema for creating a new task
 */
export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less')
    .trim(),
  description: z
    .string()
    .max(1000, 'Description must be 1000 characters or less')
    .trim()
    .optional()
    .or(z.literal('')),
});

/**
 * Schema for updating an existing task
 */
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
    .trim()
    .optional()
    .or(z.literal('')),
  completed: z.boolean().optional(),
});

/**
 * Schema for task filters
 */
export const taskFiltersSchema = z.object({
  status: z.enum(['all', 'pending', 'completed']).default('all'),
  sortField: z.enum(['created_at', 'title', 'updated_at']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ============================================================================
// Type Inference
// ============================================================================

/**
 * Inferred type for create task form data
 */
export type CreateTaskFormData = z.infer<typeof createTaskSchema>;

/**
 * Inferred type for update task form data
 */
export type UpdateTaskFormData = z.infer<typeof updateTaskSchema>;

/**
 * Inferred type for task filters
 */
export type TaskFiltersFormData = z.infer<typeof taskFiltersSchema>;

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate create task data
 */
export function validateCreateTask(data: unknown) {
  return createTaskSchema.safeParse(data);
}

/**
 * Validate update task data
 */
export function validateUpdateTask(data: unknown) {
  return updateTaskSchema.safeParse(data);
}

/**
 * Validate task filters
 */
export function validateTaskFilters(data: unknown) {
  return taskFiltersSchema.safeParse(data);
}

/**
 * Format Zod errors for display
 */
export function formatZodErrors(
  errors: z.ZodError
): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};

  errors.errors.forEach((error) => {
    const path = error.path.join('.');
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(error.message);
  });

  return formatted;
}

/**
 * Get first error message for a field
 */
export function getFieldError(
  errors: Record<string, string[]> | null,
  field: string
): string | null {
  if (!errors || !errors[field] || errors[field].length === 0) {
    return null;
  }
  return errors[field][0];
}
