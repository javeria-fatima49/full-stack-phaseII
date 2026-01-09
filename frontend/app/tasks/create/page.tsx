/**
 * Create Task Page
 *
 * Page for creating a new task.
 * Uses TaskForm component with API integration and success handling.
 *
 * Features:
 * - Task creation form with validation
 * - Success toast notification
 * - Redirect to task list after creation
 * - Error handling
 *
 * @module app/tasks/create/page
 */

'use client';

import { useRouter } from 'next/navigation';
import { TaskForm } from '@/components/TaskForm';
import { taskApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { CreateTaskFormData } from '@/lib/validation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';

// ============================================================================
// Component
// ============================================================================

/**
 * Create Task Page Component
 *
 * Renders a form for creating a new task with proper error handling
 * and success feedback.
 */
export default function CreateTaskPage() {
  const router = useRouter();
  const { toast } = useToast();

  /**
   * Handle task creation
   */
  const handleCreateTask = async (data: CreateTaskFormData) => {
    try {
      // Create task via API
      const newTask = await taskApi.create(data);

      // Show success toast
      toast({
        title: 'Task created successfully',
        description: `"${newTask.title}" has been added to your task list.`,
        variant: 'default',
      });

      // Redirect to task list
      router.push('/tasks');
    } catch (error) {
      // Error is handled by TaskForm component
      throw error;
    }
  };

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
              Create New Task
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Add a new task to your list. Fill in the details below.
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-2xl">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <TaskForm
                onSubmit={handleCreateTask}
                submitLabel="Create Task"
                isEditMode={false}
              />
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
