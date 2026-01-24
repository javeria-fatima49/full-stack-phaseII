/**
 * Tasks Hook
 *
 * Custom React hook for fetching and managing task data using SWR.
 * Provides optimistic updates, automatic revalidation, and error handling.
 *
 * @module hooks/useTasks
 */

'use client';

import useSWR, { mutate } from 'swr';
import { taskApi } from '@/lib/api';
import { Task, TaskFilterStatus, TaskSortField, TaskSortOrder } from '@/types/task';

// ============================================================================
// Types
// ============================================================================

interface UseTasksOptions {
  status?: TaskFilterStatus;
  sortField?: TaskSortField;
  sortOrder?: TaskSortOrder;
}

interface UseTasksReturn {
  tasks: Task[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => Promise<void>;
  createTask: (title: string, description?: string) => Promise<Task>;
  updateTask: (id: string, data: { title?: string; description?: string; completed?: boolean }) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<Task>;
}

interface UseSingleTaskReturn {
  task: Task | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => Promise<void>;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook for fetching and managing multiple tasks
 */
export function useTasks(options: UseTasksOptions = {}): UseTasksReturn {
  const { status = 'all', sortField = 'created_at', sortOrder = 'desc' } = options;

  // Build cache key from options
  const cacheKey = `/tasks/?status=${status}&sortField=${sortField}&sortOrder=${sortOrder}`;

  // Fetch tasks with SWR
  const { data, error, mutate: swrMutate } = useSWR<Task[]>(
    cacheKey,
    () => taskApi.list({ status, sortField, sortOrder }),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    }
  );

  /**
   * Create a new task with optimistic update
   */
  const createTask = async (title: string, description?: string): Promise<Task> => {
    const newTask = await taskApi.create({ title, description });

    // Revalidate all task lists
    await mutate((key) => typeof key === 'string' && key.startsWith('/tasks/'));

    return newTask;
  };

  /**
   * Update a task with optimistic update
   */
  const updateTask = async (
    id: string,
    data: { title?: string; description?: string; completed?: boolean }
  ): Promise<Task> => {
    const updatedTask = await taskApi.update(id, data);

    // Revalidate all task lists and the specific task
    await Promise.all([
      mutate((key) => typeof key === 'string' && key.startsWith('/tasks/')),
      mutate(`/tasks/${id}/`),
    ]);

    return updatedTask;
  };

  /**
   * Delete a task with optimistic update
   */
  const deleteTask = async (id: string): Promise<void> => {
    await taskApi.delete(id);

    // Revalidate all task lists
    await mutate((key) => typeof key === 'string' && key.startsWith('/tasks/'));
  };

  /**
   * Toggle task completion status with optimistic update
   */
  const toggleComplete = async (id: string): Promise<Task> => {
    // Optimistic update
    if (data) {
      const optimisticData = data.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      );
      swrMutate(optimisticData, false);
    }

    try {
      const updatedTask = await taskApi.toggleComplete(id);

      // Revalidate all task lists and the specific task
      await Promise.all([
        mutate((key) => typeof key === 'string' && key.startsWith('/tasks/')),
        mutate(`/tasks/${id}/`),
      ]);

      return updatedTask;
    } catch (error) {
      // Revert optimistic update on error
      swrMutate();
      throw error;
    }
  };

  return {
    tasks: data,
    isLoading: !error && !data,
    error,
    mutate: async () => { await swrMutate(); },
    createTask,
    updateTask,
    deleteTask,
    toggleComplete,
  };
}

/**
 * Hook for fetching a single task by ID
 */
export function useTask(id: string | null): UseSingleTaskReturn {
  const cacheKey = id ? `/tasks/${id}/` : null;

  const { data, error, mutate } = useSWR<Task>(
    cacheKey,
    () => (id ? taskApi.get(id) : Promise.reject(new Error('No task ID provided'))),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    }
  );

  return {
    task: data,
    isLoading: !error && !data && id !== null,
    error,
    mutate: async () => { await mutate(); },
  };
}
