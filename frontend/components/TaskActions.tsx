/**
 * TaskActions Component
 *
 * Action buttons for task management: Edit, Delete, and Toggle Complete.
 * Enhanced with framer-motion tap animations for better user feedback.
 *
 * @component
 */

'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Check, X } from 'lucide-react';

interface TaskActionsProps {
  /** Whether the task is currently completed */
  isCompleted: boolean;
  /** Whether an action is currently in progress */
  isLoading?: boolean;
  /** Handler for edit button click */
  onEdit: () => void;
  /** Handler for delete button click */
  onDelete: () => void;
  /** Handler for toggle complete button click */
  onToggleComplete: () => void;
}

/**
 * TaskActions component displays action buttons for task management
 */
export function TaskActions({
  isCompleted,
  isLoading = false,
  onEdit,
  onDelete,
  onToggleComplete,
}: TaskActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {/* Toggle Complete Button with Tap Animation */}
      <motion.div
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.1 }}
        className="flex-1 sm:flex-none"
      >
        <Button
          onClick={onToggleComplete}
          disabled={isLoading}
          variant={isCompleted ? 'outline' : 'default'}
          className="w-full"
          aria-label={isCompleted ? 'Mark as pending' : 'Mark as complete'}
        >
          {isCompleted ? (
            <>
              <X className="mr-2 h-4 w-4" />
              Mark Pending
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Mark Complete
            </>
          )}
        </Button>
      </motion.div>

      {/* Edit Button with Tap Animation */}
      <motion.div
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.1 }}
        className="flex-1 sm:flex-none"
      >
        <Button
          onClick={onEdit}
          disabled={isLoading}
          variant="outline"
          className="w-full"
          aria-label="Edit task"
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </motion.div>

      {/* Delete Button with Tap Animation */}
      <motion.div
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.1 }}
        className="flex-1 sm:flex-none"
      >
        <Button
          onClick={onDelete}
          disabled={isLoading}
          variant="destructive"
          className="w-full"
          aria-label="Delete task"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </motion.div>
    </div>
  );
}
