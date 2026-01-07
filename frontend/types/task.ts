/**
 * Task Entity Types
 *
 * Core TypeScript interfaces for Task entities and related enums.
 * These types represent the domain model for tasks in the frontend.
 *
 * @module types/task
 */

// ============================================================================
// Task Entity
// ============================================================================

/**
 * Task entity representing a user's todo item
 */
export interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
  user_id: string;
}

// ============================================================================
// Task Status
// ============================================================================

/**
 * Task completion status
 */
export type TaskStatus = 'pending' | 'completed';

/**
 * Task filter options (includes 'all' for showing all tasks)
 */
export type TaskFilterStatus = 'all' | 'pending' | 'completed';

// ============================================================================
// Task Sorting
// ============================================================================

/**
 * Fields that can be used for sorting tasks
 */
export type TaskSortField = 'created_at' | 'title' | 'updated_at';

/**
 * Sort order direction
 */
export type TaskSortOrder = 'asc' | 'desc';

/**
 * Complete sort configuration
 */
export interface TaskSort {
  field: TaskSortField;
  order: TaskSortOrder;
}

// ============================================================================
// Task Statistics
// ============================================================================

/**
 * Task statistics for dashboard display
 */
export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get task status from completed boolean
 */
export function getTaskStatus(task: Task): TaskStatus {
  return task.completed ? 'completed' : 'pending';
}

/**
 * Check if task matches filter status
 */
export function matchesFilterStatus(
  task: Task,
  filterStatus: TaskFilterStatus
): boolean {
  if (filterStatus === 'all') return true;
  return getTaskStatus(task) === filterStatus;
}

/**
 * Calculate task statistics from task array
 */
export function calculateTaskStats(tasks: Task[]): TaskStats {
  const completed = tasks.filter((task) => task.completed).length;
  return {
    total: tasks.length,
    completed,
    pending: tasks.length - completed,
  };
}

/**
 * Sort tasks by specified field and order
 */
export function sortTasks(
  tasks: Task[],
  sortField: TaskSortField,
  sortOrder: TaskSortOrder
): Task[] {
  const sorted = [...tasks].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortField) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'created_at':
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
        break;
      case 'updated_at':
        aValue = new Date(a.updated_at).getTime();
        bValue = new Date(b.updated_at).getTime();
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return sorted;
}

/**
 * Filter and sort tasks
 */
export function filterAndSortTasks(
  tasks: Task[],
  filterStatus: TaskFilterStatus,
  sortField: TaskSortField,
  sortOrder: TaskSortOrder
): Task[] {
  const filtered = tasks.filter((task) =>
    matchesFilterStatus(task, filterStatus)
  );
  return sortTasks(filtered, sortField, sortOrder);
}

/**
 * Get most recent tasks (limited by count)
 */
export function getRecentTasks(tasks: Task[], count: number = 5): Task[] {
  return sortTasks(tasks, 'created_at', 'desc').slice(0, count);
}
