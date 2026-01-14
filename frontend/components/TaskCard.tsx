/**
 * Task Card Component
 *
 * Displays a task in card format with title, status, and creation date.
 * Enhanced with framer-motion hover and tap animations.
 *
 * @module components/TaskCard
 */

'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Task } from '@/types/task';
import { formatDate } from '@/lib/utils';
import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskActions } from './TaskActions';
import { useTasks } from '@/hooks/useTasks';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

// ============================================================================
// Types
// ============================================================================

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  onEdit?: (id: string) => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Task card display with framer-motion animations
 */
export function TaskCard({ task, onClick, onEdit }: TaskCardProps) {
  const router = useRouter();
  const { toggleComplete, deleteTask } = useTasks();
  const { toast } = useToast();
  const [isActionLoading, setIsActionLoading] = useState(false);

  const StatusIcon = task.completed ? CheckCircle2 : Circle;
  const statusColor = task.completed ? 'text-green-600' : 'text-orange-600';
  const statusBgColor = task.completed ? 'bg-green-50' : 'bg-orange-50';

  // Wrap Card in motion.div for animations
  const CardWrapper = onClick ? motion.div : 'div';

  const handleToggleComplete = async () => {
    setIsActionLoading(true);
    try {
      await toggleComplete(task.id);
      toast({
        title: task.completed ? 'Task marked as pending' : 'Task completed',
        description: `"${task.title}" has been updated.`,
      });
    } catch (error) {
      toast({
        title: 'Failed to update task',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsActionLoading(true);
    try {
      await deleteTask(task.id);
      toast({
        title: 'Task deleted successfully',
        description: `"${task.title}" has been removed.`,
      });
    } catch (error) {
      toast({
        title: 'Failed to delete task',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(task.id);
    } else {
      router.push(`/tasks/${task.id}/edit`);
    }
  };

  return (
    <CardWrapper
      {...(onClick && {
        whileHover: { scale: 1.02, y: -4 },
        whileTap: { scale: 0.98 },
        transition: { duration: 0.2, ease: 'easeOut' },
      })}
    >
      <Card
        className={cn(
          'h-full transition-shadow duration-200 hover-card',
          onClick && 'cursor-pointer hover:shadow-lg'
        )}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {task.title}
            </CardTitle>
            <motion.div
              className={`rounded-full p-1.5 ${statusBgColor} flex-shrink-0`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <StatusIcon className={`h-4 w-4 ${statusColor}`} />
            </motion.div>
          </div>
        </CardHeader>
        <CardContent>
          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {task.description}
            </p>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="font-medium">
                {task.completed ? 'Completed' : 'Pending'}
              </span>
            </span>
            <span>Created {formatDate(task.created_at)}</span>
          </div>

          {/* Task Actions */}
          <div className="pt-3 border-t mt-3">
            <TaskActions
              isCompleted={task.completed}
              isLoading={isActionLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleComplete={handleToggleComplete}
            />
          </div>
        </CardContent>
      </Card>
    </CardWrapper>
  );
}
