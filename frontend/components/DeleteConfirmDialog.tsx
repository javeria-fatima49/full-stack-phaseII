/**
 * DeleteConfirmDialog Component
 *
 * Confirmation dialog for deleting a task.
 * Uses shadcn/ui Dialog component to show a modal confirmation.
 *
 * @component
 */

'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Task title to display in confirmation message */
  taskTitle: string;
  /** Whether delete operation is in progress */
  isDeleting?: boolean;
  /** Handler for dialog close */
  onClose: () => void;
  /** Handler for delete confirmation */
  onConfirm: () => void;
}

/**
 * DeleteConfirmDialog displays a confirmation dialog before deleting a task
 */
export function DeleteConfirmDialog({
  open,
  taskTitle,
  isDeleting = false,
  onClose,
  onConfirm,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <DialogTitle>Delete Task</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-foreground">
              &quot;{taskTitle}&quot;
            </span>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
