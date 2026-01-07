/**
 * Dashboard Statistics Component
 *
 * Displays task statistics: total, completed, and pending counts.
 * Used on the dashboard to provide an overview of task status.
 *
 * @module components/DashboardStats
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskStats } from '@/types/task';
import { CheckCircle2, Circle, ListTodo } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface DashboardStatsProps {
  stats: TaskStats;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Dashboard statistics display
 */
export function DashboardStats({ stats }: DashboardStatsProps) {
  const statItems = [
    {
      label: 'Total Tasks',
      value: stats.total,
      icon: ListTodo,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: Circle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className="transition-smooth hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.label}
              </CardTitle>
              <div className={`rounded-full p-2 ${item.bgColor}`}>
                <Icon className={`h-4 w-4 ${item.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{item.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {item.value === 1 ? 'task' : 'tasks'}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
