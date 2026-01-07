/**
 * Filter Controls Component
 *
 * Provides dropdown controls for filtering tasks by status.
 * Supports All, Pending, and Completed filter options.
 *
 * @module components/FilterControls
 */

'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TaskFilterStatus } from '@/types/task';
import { Filter } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface FilterControlsProps {
  value: TaskFilterStatus;
  onChange: (value: TaskFilterStatus) => void;
}

// ============================================================================
// Constants
// ============================================================================

const FILTER_OPTIONS: { value: TaskFilterStatus; label: string }[] = [
  { value: 'all', label: 'All Tasks' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
];

// ============================================================================
// Component
// ============================================================================

/**
 * Filter controls for task status
 */
export function FilterControls({ value, onChange }: FilterControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <Filter className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          className="w-[180px]"
          aria-label="Filter tasks by status"
        >
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          {FILTER_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
