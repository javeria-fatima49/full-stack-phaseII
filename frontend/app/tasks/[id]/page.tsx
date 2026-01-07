/**
 * Task Detail Page
 *
 * Displays full task details with actions to toggle completion, edit, and delete.
 * Implements comprehensive state handling, error handling, and visual feedback.
 *
 * @page
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, CheckCircle2, Circle } from 'lucide-react';
import Link from 'next/link';

import { Task } from '@/types/task';
import { taskApi } from '@/lib/api';
import { NotFoundError } from '@/types/api';
import { TaskActions } from '@/components/TaskActions';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { useToast } from '@/hooks/use-toast';

interface TaskDetailPageProps {
  params: {
    id: string;
  };
}

/**
 * TaskDetailPage displays full task details with management actions
 */
export default function TaskDetailPage({ params }: TaskDetailPageProps) {
  const router = useRouter();
  const { toast } = useToast();

  // State management
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isTogglingComplete, setIsTogglingComplete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);

  // Fetch task data
  useEffect(() => {
    async function fetchTask() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await taskApi.get(params.id);
        setTask(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load task'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchTask();
  }, [params.id]);

  // Handler: Navigate to edit page
  const handleEdit = () => {
    router.push(`/tasks/${params.id}/edit`);
  };

  // Handler: Show delete confirmation dialog
  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  // Handler: Close delete confirmation dialog
  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };

  // Handler: Confirm and execute delete (T057, T059)
  const handleDeleteConfirm = async () => {
    if (!task) return;

    try {
      setIsDeleting(true);
      await taskApi.delete(params.id);

      // Show success toast
      toast({
        title: 'Task deleted successfully',
        description: `"${task.title}" has been removed from your task list.`,
      });

      // Redirect to task list after successful delete (T059)
      router.push('/tasks');
    } catch (err) {
      setIsDeleting(false);
      setShowDeleteDialog(false);

      // Show error toast
      toast({
        title: 'Failed to delete task',
        description: err instanceof Error ? err.message : 'An error occurred while deleting the task.',
        variant: 'destructive',
      });
    }
  };

  // Handler: Toggle task completion status (T056, T058)
  const handleToggleComplete = async () => {
    if (!task) return;

    try {
      setIsTogglingComplete(true);

      // Call API to toggle completion
      const updatedTask = await taskApi.toggleComplete(params.id);

      // Update local state
      setTask(updatedTask);

      // Show checkmark animation for completion (T058)
      if (updatedTask.completed) {
        setShowCheckmark(true);
        setTimeout(() => setShowCheckmark(false), 1000);
      }

      // Show success toast
      toast({
        title: updatedTask.completed ? 'Task completed' : 'Task marked as pending',
        description: `"${updatedTask.title}" has been updated.`,
      });
    } catch (err) {
      // Show error toast
      toast({
        title: 'Failed to update task',
        description: err instanceof Error ? err.message : 'An error occurred while updating the task.',
        variant: 'destructive',
      });
    } finally {
      setIsTogglingComplete(false);
    }
  };

  // Handler: Retry loading task
  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    taskApi
      .get(params.id)
      .then((data) => {
        setTask(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error('Failed to load task'));
        setIsLoading(false);
      });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <LoadingSpinner size="lg" message="Loading task details..." centered />
      </div>
    );
  }

  // Error state with 404 handling (T060)
  if (error) {
    const is404 = error instanceof NotFoundError;

    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <Link
            href="/tasks"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tasks
          </Link>
        </div>
        <ErrorMessage
          message={is404 ? 'Task Not Found' : 'Error Loading Task'}
          error={is404 ? { message: 'The task you are looking for does not exist or has been deleted.' } : error}
          onRetry={is404 ? undefined : handleRetry}
          size="lg"
          centered
        />
        {is404 && (
          <div className="flex justify-center mt-6">
            <Button onClick={() => router.push('/tasks')} variant="default">
              Go to Task List
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Success state - display task details
  if (!task) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Back to Tasks Link */}
      <div className="mb-6">
        <Link
          href="/tasks"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tasks
        </Link>
      </div>

      {/* Task Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-3xl font-bold flex items-center gap-3">
              {/* Status Icon with Animation */}
              <div className="relative">
                {task.completed ? (
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                ) : (
                  <Circle className="h-8 w-8 text-muted-foreground" />
                )}

                {/* Checkmark Animation (T058) */}
                <AnimatePresence>
                  {showCheckmark && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1.5, opacity: 1 }}
                      exit={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
                {task.title}
              </span>
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Task Description */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Description
            </h3>
            {task.description ? (
              <p className="text-base whitespace-pre-wrap">{task.description}</p>
            ) : (
              <p className="text-muted-foreground italic">No description provided</p>
            )}
          </div>

          {/* Task Metadata */}
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                Created: <span className="text-foreground">{formatDate(task.created_at)}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                Updated: <span className="text-foreground">{formatDate(task.updated_at)}</span>
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                task.completed
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}
            >
              {task.completed ? 'Completed' : 'Pending'}
            </span>
          </div>

          {/* Task Actions (T055) */}
          <div className="pt-4 border-t">
            <TaskActions
              isCompleted={task.completed}
              isLoading={isTogglingComplete || isDeleting}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onToggleComplete={handleToggleComplete}
            />
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={showDeleteDialog}
        taskTitle={task.title}
        isDeleting={isDeleting}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
