/**
 * TaskForm Component
 *
 * Reusable form component for creating and editing tasks.
 * Handles validation, error display, loading states, and form submission.
 *
 * Features:
 * - Title and description fields with validation
 * - Zod schema validation with error display
 * - Loading state during submission
 * - Cancel button with navigation
 * - Support for both create and edit modes
 *
 * @module components/TaskForm
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatedButton } from '@/components/AnimatedButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  createTaskSchema,
  type CreateTaskFormData,
  formatZodErrors,
  getFieldError,
} from '@/lib/validation';
import { Loader2 } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface TaskFormProps {
  /**
   * Initial values for the form (used in edit mode)
   */
  initialValues?: {
    title: string;
    description?: string;
  };
  /**
   * Form submission handler
   * @param data - Validated form data
   * @returns Promise that resolves when submission is complete
   */
  onSubmit: (data: CreateTaskFormData) => Promise<void>;
  /**
   * Submit button text
   * @default "Create Task"
   */
  submitLabel?: string;
  /**
   * Whether the form is in edit mode
   * @default false
   */
  isEditMode?: boolean;
}

// ============================================================================
// Component
// ============================================================================

/**
 * TaskForm component for creating and editing tasks
 *
 * @example
 * ```tsx
 * // Create mode
 * <TaskForm
 *   onSubmit={handleCreate}
 *   submitLabel="Create Task"
 * />
 *
 * // Edit mode
 * <TaskForm
 *   initialValues={{ title: 'Task', description: 'Description' }}
 *   onSubmit={handleUpdate}
 *   submitLabel="Update Task"
 *   isEditMode
 * />
 * ```
 */
export function TaskForm({
  initialValues,
  onSubmit,
  submitLabel = 'Create Task',
  isEditMode = false,
}: TaskFormProps) {
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState(initialValues?.title || '');
  const [description, setDescription] = useState(
    initialValues?.description || ''
  );

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Reset errors
    setErrors(null);
    setSubmitError(null);

    // Validate form data
    const formData = {
      title: title.trim(),
      description: description.trim() || undefined,
    };

    const validation = createTaskSchema.safeParse(formData);

    if (!validation.success) {
      // Display validation errors
      setErrors(formatZodErrors(validation.error));
      return;
    }

    // Submit form
    setIsSubmitting(true);

    try {
      await onSubmit(validation.data);
      // Success handling (toast and redirect) is done by parent component
    } catch (error) {
      // Display submission error
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred. Please try again.';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle cancel button click
   */
  const handleCancel = () => {
    router.back();
  };

  // Get field-specific errors
  const titleError = getFieldError(errors, 'title');
  const descriptionError = getFieldError(errors, 'description');

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Title Field */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title"
          disabled={isSubmitting}
          aria-required="true"
          aria-invalid={!!titleError}
          aria-describedby={titleError ? 'title-error' : undefined}
          className={titleError ? 'border-destructive hover-input' : 'hover-input'}
          maxLength={200}
        />
        {titleError && (
          <p
            id="title-error"
            className="text-sm text-destructive"
            role="alert"
          >
            {titleError}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {title.length}/200 characters
        </p>
      </div>

      {/* Description Field */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          Description
        </Label>
        <Textarea
          id="description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter task description (optional)"
          disabled={isSubmitting}
          aria-invalid={!!descriptionError}
          aria-describedby={descriptionError ? 'description-error' : undefined}
          className={descriptionError ? 'border-destructive hover-input' : 'hover-input'}
          rows={5}
          maxLength={1000}
        />
        {descriptionError && (
          <p
            id="description-error"
            className="text-sm text-destructive"
            role="alert"
          >
            {descriptionError}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {description.length}/1000 characters
        </p>
      </div>

      {/* Submit Error */}
      {submitError && (
        <div
          className="rounded-md bg-destructive/10 p-4 text-sm text-destructive"
          role="alert"
        >
          {submitError}
        </div>
      )}

      {/* Form Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <AnimatedButton
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          Cancel
        </AnimatedButton>
        <AnimatedButton
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditMode ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            submitLabel
          )}
        </AnimatedButton>
      </div>
    </form>
  );
}
