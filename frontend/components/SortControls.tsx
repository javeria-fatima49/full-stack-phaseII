/**
 * Sort Controls Component
 *
 * Provides dropdown controls for sorting tasks by field and order.
 * Supports sorting by created_at, title, and updated_at in ascending or descending order.
 *
 * @module components/SortControls
 */

'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TaskSortField, TaskSortOrder } from '@/types/task';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ============================================================================
// Types
// ============================================================================

interface SortControlsProps {
  sortField: TaskSortField;
  sortOrder: TaskSortOrder;
  onSortFieldChange: (field: TaskSortField) => void;
  onSortOrderChange: (order: TaskSortOrder) => void;
}

// ============================================================================
// Constants
// ============================================================================

const SORT_FIELD_OPTIONS: { value: TaskSortField; label: string }[] = [
  { value: 'created_at', label: 'Created Date' },
  { value: 'updated_at', label: 'Updated Date' },
  { value: 'title', label: 'Title' },
];

// ============================================================================
// Component
// ============================================================================

/**
 * Sort controls for task ordering
 */
export function SortControls({
  sortField,
  sortOrder,
  onSortFieldChange,
  onSortOrderChange,
}: SortControlsProps) {
  const toggleSortOrder = () => {
    onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const SortIcon = sortOrder === 'asc' ? ArrowUp : ArrowDown;

  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown
        className="h-4 w-4 text-muted-foreground"
        aria-hidden="true"
      />
      <Select value={sortField} onValueChange={onSortFieldChange}>
        <SelectTrigger className="w-[180px]" aria-label="Sort tasks by field">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {SORT_FIELD_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="icon"
        onClick={toggleSortOrder}
        aria-label={`Sort ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
        title={`Sort ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
      >
        <SortIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}
