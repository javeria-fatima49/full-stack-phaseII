/**
 * Edit Task Page
 *
 * Page for editing an existing task.
 * Fetches task data, pre-populates form, and handles updates.
 *
 * Features:
 * - Fetch existing task data
 * - Pre-populated form with current values
 * - Success toast notification
 * - Redirect to task list after update
 * - Loading and error states
 *
 * @module app/tasks/[id]/edit/page
 */

'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { TaskForm } from '@/components/TaskForm';
import { taskApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { CreateTaskFormData } from '@/lib/validation';
import type { Task } from '@/types/task';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { AnimatedButton } from '@/components/AnimatedButton';
import { Skeleton } from '@/components/ui/skeleton';
import ProtectedRoute from '@/components/ProtectedRoute';

interface EditTaskPageProps {
  params: Promise<{
    id: string;
  }>;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Edit Task Page Component
 *
 * Renders a form for editing an existing task with proper loading,
 * error handling, and success feedback.
 */
export default function EditTaskPage({ params }: EditTaskPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { toast } = useToast();

  const taskId = resolvedParams.id;

  // State
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch task data on mount
   */
  useEffect(() => {
    const fetchTask = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedTask = await taskApi.get(taskId);
        setTask(fetchedTask);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to load task. Please try again.';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  /**
   * Handle task update
   */
  const handleUpdateTask = async (data: CreateTaskFormData) => {
    try {
      // Update task via API
      const updatedTask = await taskApi.update(taskId, data);

      // Show success toast
      toast({
        title: 'Task updated successfully',
        description: `"${updatedTask.title}" has been updated.`,
        variant: 'default',
      });

      // Redirect to task list
      router.push('/tasks');
    } catch (error) {
      // Error is handled by TaskForm component
      throw error;
    }
  };

  /**
   * Handle retry
   */
  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    // Trigger re-fetch by updating a dependency
    taskApi
      .get(taskId)
      .then((fetchedTask) => {
        setTask(fetchedTask);
        setIsLoading(false);
      })
      .catch((err) => {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to load task. Please try again.';
        setError(errorMessage);
        setIsLoading(false);
      });
  };

  // ============================================================================
  // Loading State
  // ============================================================================

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          {/* Header Skeleton */}
          <header className="border-b bg-card">
            <div className="container mx-auto px-4 py-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-4 h-8 w-48" />
              <Skeleton className="mt-2 h-4 w-64" />
            </div>
          </header>

          {/* Form Skeleton */}
          <main className="container mx-auto px-4 py-8">
            <div className="mx-auto max-w-2xl">
              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-32" />
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  // ============================================================================
  // Error State
  // ============================================================================

  if (error || !task) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          {/* Header */}
          <header className="border-b bg-card">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center gap-4">
                <Link
                  href="/tasks"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Back to task list"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Tasks</span>
                </Link>
              </div>
              <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                Edit Task
              </h1>
            </div>
          </header>

          {/* Error Message */}
          <main className="container mx-auto px-4 py-8">
            <div className="mx-auto max-w-2xl">
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
                <h2 className="mt-4 text-lg font-semibold text-destructive">
                  Failed to Load Task
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {error || 'Task not found'}
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <AnimatedButton variant="outline" onClick={() => router.push('/tasks')}>
                    Back to Tasks
                  </AnimatedButton>
                  <AnimatedButton onClick={handleRetry}>
                    <Loader2 className="mr-2 h-4 w-4" />
                    Retry
                  </AnimatedButton>
                </div>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  // ============================================================================
  // Success State
  // ============================================================================

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link
                href="/tasks"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Back to task list"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Tasks</span>
              </Link>
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
              Edit Task
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Update the details of your task below.
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-2xl">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <TaskForm
                initialValues={{
                  title: task.title,
                  description: task.description || '',
                }}
                onSubmit={handleUpdateTask}
                submitLabel="Update Task"
                isEditMode={true}
              />
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
