/**
 * Recent Tasks List Component
 *
 * Displays the 5 most recent tasks on the dashboard.
 * Shows empty state if no tasks exist.
 *
 * @module components/RecentTasksList
 */

'use client';

import { Task } from '@/types/task';
import { TaskCard } from './TaskCard';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface RecentTasksListProps {
  tasks: Task[];
}

// ============================================================================
// Component
// ============================================================================

/**
 * Recent tasks list display
 */
export function RecentTasksList({ tasks }: RecentTasksListProps) {
  const router = useRouter();

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="empty-state py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No tasks yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first task to get started
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">Recent Tasks</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => router.push(`/tasks/${task.id}`)}
            onEdit={(taskId) => router.push(`/tasks/${taskId}/edit`)}
          />
        ))}
      </div>
    </div>
  );
}
