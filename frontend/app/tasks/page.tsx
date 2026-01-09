/**
 * Task List Page
 *
 * Displays all tasks with filtering and sorting controls.
 * Supports filtering by status (All/Pending/Completed) and sorting by various fields.
 * Implements responsive grid layout and comprehensive state handling.
 *
 * @module app/tasks/page
 */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTasks } from '@/hooks/useTasks';
import { TaskCard } from '@/components/TaskCard';
import { FilterControls } from '@/components/FilterControls';
import { SortControls } from '@/components/SortControls';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorMessage } from '@/components/ErrorMessage';
import { StaggerContainer, StaggerItem } from '@/components/PageTransition';
import { TaskFilterStatus, TaskSortField, TaskSortOrder, filterAndSortTasks } from '@/types/task';
import { DEFAULT_TASK_FILTERS } from '@/types/ui';
import { Plus, ListX } from 'lucide-react';
import { useCallback, useMemo, Suspense } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';

// ============================================================================
// Loading Component
// ============================================================================

function TasksPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col gap-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Controls Skeleton */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-[280px]" />
        </div>

        {/* Task Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Task list page content with filtering and sorting
 */
function TasksPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tasks, isLoading, error, mutate } = useTasks();

  // ============================================================================
  // URL Search Params State
  // ============================================================================

  const filterStatus = (searchParams.get('status') as TaskFilterStatus) || DEFAULT_TASK_FILTERS.status;
  const sortField = (searchParams.get('sortField') as TaskSortField) || DEFAULT_TASK_FILTERS.sortField;
  const sortOrder = (searchParams.get('sortOrder') as TaskSortOrder) || DEFAULT_TASK_FILTERS.sortOrder;

  // ============================================================================
  // Update URL Search Params
  // ============================================================================

  const updateSearchParams = useCallback(
    (updates: Partial<{ status: TaskFilterStatus; sortField: TaskSortField; sortOrder: TaskSortOrder }>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        }
      });

      router.push(`/tasks?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleFilterChange = useCallback(
    (status: TaskFilterStatus) => {
      updateSearchParams({ status });
    },
    [updateSearchParams]
  );

  const handleSortFieldChange = useCallback(
    (field: TaskSortField) => {
      updateSearchParams({ sortField: field });
    },
    [updateSearchParams]
  );

  const handleSortOrderChange = useCallback(
    (order: TaskSortOrder) => {
      updateSearchParams({ sortOrder: order });
    },
    [updateSearchParams]
  );

  const handleClearFilters = useCallback(() => {
    router.push('/tasks');
  }, [router]);

  // ============================================================================
  // Filter and Sort Tasks
  // ============================================================================

  const filteredAndSortedTasks = useMemo(() => {
    if (!tasks) return [];
    return filterAndSortTasks(tasks, filterStatus, sortField, sortOrder);
  }, [tasks, filterStatus, sortField, sortOrder]);

  const hasActiveFilters = filterStatus !== 'all';

  // ============================================================================
  // Navigation Handlers
  // ============================================================================

  const handleTaskClick = useCallback(
    (taskId: string) => {
      router.push(`/tasks/${taskId}`);
    },
    [router]
  );

  const handleCreateTask = useCallback(() => {
    router.push('/tasks/create');
  }, [router]);

  // ============================================================================
  // Loading State
  // ============================================================================

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col gap-6">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Controls Skeleton */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-10 w-[200px]" />
            <Skeleton className="h-10 w-[280px]" />
          </div>

          {/* Task Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // Error State
  // ============================================================================

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <ErrorMessage
          message="Failed to load tasks"
          error={error}
          onRetry={() => mutate()}
          size="lg"
          centered
        />
      </div>
    );
  }

  // ============================================================================
  // Empty State (No Tasks at All)
  // ============================================================================

  if (!tasks || tasks.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <ListX className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-2xl font-semibold text-center">No Tasks Yet</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Get started by creating your first task. Stay organized and track your progress!
          </p>
          <Button onClick={handleCreateTask} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Task
          </Button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // Filtered Empty State (No Tasks Matching Filter)
  // ============================================================================

  if (filteredAndSortedTasks.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-3xl font-bold">My Tasks</h1>
            <Button onClick={handleCreateTask}>
              <Plus className="h-5 w-5 mr-2" />
              Add Task
            </Button>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <FilterControls value={filterStatus} onChange={handleFilterChange} />
            <SortControls
              sortField={sortField}
              sortOrder={sortOrder}
              onSortFieldChange={handleSortFieldChange}
              onSortOrderChange={handleSortOrderChange}
            />
          </div>

          {/* Empty State */}
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <ListX className="h-16 w-16 text-muted-foreground" />
            <h2 className="text-2xl font-semibold text-center">
              No Tasks Found
            </h2>
            <p className="text-muted-foreground text-center max-w-md">
              No tasks match your current filters. Try adjusting your filters or create a new task.
            </p>
            {hasActiveFilters && (
              <Button onClick={handleClearFilters} variant="outline">
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // Success State (Tasks Display)
  // ============================================================================

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Tasks</h1>
            <p className="text-muted-foreground mt-1">
              Showing {filteredAndSortedTasks.length} of {tasks.length} tasks
            </p>
          </div>
          <Button onClick={handleCreateTask}>
            <Plus className="h-5 w-5 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <FilterControls value={filterStatus} onChange={handleFilterChange} />
          <SortControls
            sortField={sortField}
            sortOrder={sortOrder}
            onSortFieldChange={handleSortFieldChange}
            onSortOrderChange={handleSortOrderChange}
          />
        </div>

        {/* Task Grid - Responsive Layout with Stagger Animation */}
        <StaggerContainer>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedTasks.map((task) => (
              <StaggerItem key={task.id}>
                <TaskCard
                  task={task}
                  onClick={() => handleTaskClick(task.id)}
                />
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>
      </div>
    </div>
  );
}

// ============================================================================
// Page Export with Suspense
// ============================================================================

/**
 * Task list page with Suspense boundary
 */
export default function TasksPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<TasksPageSkeleton />}>
        <TasksPageContent />
      </Suspense>
    </ProtectedRoute>
  );
}
