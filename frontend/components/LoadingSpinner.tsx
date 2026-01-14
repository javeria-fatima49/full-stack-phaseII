/**
 * Loading Spinner Component
 *
 * Animated loading spinner with framer-motion fade animation.
 * Used throughout the application to indicate loading states.
 *
 * @module components/LoadingSpinner
 */

'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface LoadingSpinnerProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Optional message to display below spinner */
  message?: string;
  /** Additional CSS classes */
  className?: string;
  /** Center the spinner in its container */
  centered?: boolean;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Loading spinner with fade animation
 */
export function LoadingSpinner({
  size = 'md',
  message,
  className,
  centered = false,
}: LoadingSpinnerProps) {
  // Size mappings
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        centered && 'min-h-[200px]',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={message || 'Loading'}
    >
      <Loader2
        className={cn(
          'animate-spin text-cyan-400',
          sizeClasses[size]
        )}
        aria-hidden="true"
      />
      {message && (
        <p className={cn('text-gray-400', textSizeClasses[size])}>
          {message}
        </p>
      )}
      <span className="sr-only">{message || 'Loading...'}</span>
    </motion.div>
  );
}

/**
 * Full page loading spinner
 */
export function LoadingPage({ message }: { message?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-slate-900">
      <LoadingSpinner size="lg" message={message} />
    </div>
  );
}

/**
 * Inline loading spinner (for buttons, etc.)
 */
export function LoadingInline({ className }: { className?: string }) {
  return (
    <Loader2
      className={cn('animate-spin h-4 w-4 text-cyan-400', className)}
      aria-hidden="true"
    />
  );
}
