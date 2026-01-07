/**
 * Dashboard Page
 *
 * Main landing page showing task statistics and recent tasks.
 * Server Component that fetches data and displays overview.
 *
 * @module app/page
 */

'use client';

import { DashboardStats } from '@/components/DashboardStats';
import { RecentTasksList } from '@/components/RecentTasksList';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorMessage } from '@/components/ErrorMessage';
import { useTasks } from '@/hooks/useTasks';
import { calculateTaskStats, getRecentTasks } from '@/types/task';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

// ============================================================================
// Component
// ============================================================================

/**
 * Dashboard page component
 */
export default function DashboardPage() {
  const { tasks, isLoading, error } = useTasks();

  // Loading state
  if (isLoading) {
    return (
      <div className="container-custom py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <div className="p-6 space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <div className="p-6 space-y-3">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container-custom py-8">
        <ErrorMessage
          message="Failed to load dashboard"
          error={error}
          onRetry={() => window.location.reload()}
          size="lg"
          centered
        />
      </div>
    );
  }

  // Calculate statistics
  const stats = calculateTaskStats(tasks || []);
  const recentTasks = getRecentTasks(tasks || [], 5);

  // Empty state (no tasks)
  if (!tasks || tasks.length === 0) {
    return (
      <div className="container-custom py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Welcome to your task management dashboard
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="empty-state py-12">
              <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No tasks yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Get started by creating your first task. Stay organized and track your progress.
              </p>
              <Button asChild size="lg">
                <Link href="/tasks/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Task
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state (with tasks)
  return (
    <div className="container-custom py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Overview of your tasks and progress
          </p>
        </div>
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/tasks/create">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Link>
        </Button>
      </div>

      {/* Statistics */}
      <DashboardStats stats={stats} />

      {/* Recent Tasks */}
      <RecentTasksList tasks={recentTasks} />

      {/* View All Tasks Link */}
      {tasks.length > 5 && (
        <div className="text-center">
          <Button asChild variant="outline">
            <Link href="/tasks">View All Tasks ({tasks.length})</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
