/**
 * Error Message Component
 *
 * Displays error messages with retry button and slide animation.
 * Used throughout the application for error state handling.
 *
 * @module components/ErrorMessage
 */

'use client';

import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { AnimatedButton } from '@/components/AnimatedButton';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface ErrorMessageProps {
  /** Error message to display */
  message?: string;
  /** Error object (will extract message if provided) */
  error?: Error | { message: string } | null;
  /** Retry callback function */
  onRetry?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Center the error message in its container */
  centered?: boolean;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Error message with retry button and slide animation
 */
export function ErrorMessage({
  message,
  error,
  onRetry,
  className,
  size = 'md',
  centered = false,
}: ErrorMessageProps) {
  // Extract error message
  const errorMessage = message || error?.message || 'An unexpected error occurred';

  // Size mappings
  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const buttonSizeVariants = {
    sm: 'sm' as const,
    md: 'default' as const,
    lg: 'lg' as const,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'flex flex-col items-center justify-center gap-4 p-6 rounded-lg border border-destructive/20 bg-destructive/5',
        centered && 'min-h-[200px]',
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center gap-3">
        <AlertCircle
          className={cn('text-destructive flex-shrink-0', iconSizeClasses[size])}
          aria-hidden="true"
        />
        <p className={cn('text-destructive font-medium', textSizeClasses[size])}>
          {errorMessage}
        </p>
      </div>

      {onRetry && (
        <AnimatedButton
          onClick={onRetry}
          variant="outline"
          size={buttonSizeVariants[size]}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </AnimatedButton>
      )}
    </motion.div>
  );
}

/**
 * Inline error message (for forms, etc.)
 */
export function ErrorInline({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <motion.p
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className={cn('text-sm text-destructive flex items-center gap-2', className)}
      role="alert"
    >
      <AlertCircle className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
      {message}
    </motion.p>
  );
}

/**
 * Full page error message
 */
export function ErrorPage({
  message,
  error,
  onRetry,
}: {
  message?: string;
  error?: Error | { message: string } | null;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <ErrorMessage
        message={message}
        error={error}
        onRetry={onRetry}
        size="lg"
        centered
      />
    </div>
  );
}
