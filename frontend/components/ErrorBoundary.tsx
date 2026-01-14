/**
 * ErrorBoundary Component
 *
 * React error boundary to catch JavaScript errors in the component tree.
 * Displays a fallback UI when an error occurs and logs error details.
 *
 * Features:
 * - Catches errors in child components
 * - Displays user-friendly error message
 * - Provides retry mechanism
 * - Logs errors for debugging
 * - Prevents entire app crash
 *
 * @module components/ErrorBoundary
 */

'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { AnimatedButton } from '@/components/AnimatedButton';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// ============================================================================
// Types
// ============================================================================

interface ErrorBoundaryProps {
  /**
   * Child components to wrap
   */
  children: ReactNode;
  /**
   * Fallback UI to display when error occurs
   */
  fallback?: ReactNode;
  /**
   * Callback when error occurs
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /**
   * Custom error message
   */
  errorMessage?: string;
}

interface ErrorBoundaryState {
  /**
   * Whether an error has occurred
   */
  hasError: boolean;
  /**
   * The error that occurred
   */
  error: Error | null;
  /**
   * Additional error information
   */
  errorInfo: ErrorInfo | null;
}

// ============================================================================
// Component
// ============================================================================

/**
 * ErrorBoundary component for catching React errors
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 * ```
 *
 * @example
 * ```tsx
 * <ErrorBoundary
 *   fallback={<CustomErrorUI />}
 *   onError={(error, errorInfo) => logError(error, errorInfo)}
 * >
 *   <App />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Update state when error is caught
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Log error details
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Error info:', errorInfo);
    }

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you would send error to logging service
    // Example: logErrorToService(error, errorInfo);
  }

  /**
   * Reset error state and retry
   */
  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  /**
   * Reload the page
   */
  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, errorMessage } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-destructive/10 p-3">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-xl">Something went wrong</CardTitle>
                  <CardDescription>
                    {errorMessage || 'An unexpected error occurred. Please try again.'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Error details (development only) */}
              {process.env.NODE_ENV === 'development' && error && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Error Details:</p>
                  <div className="rounded-md bg-muted p-3">
                    <p className="text-sm font-mono text-destructive">{error.toString()}</p>
                  </div>
                  {errorInfo && (
                    <details className="text-sm">
                      <summary className="cursor-pointer font-medium text-muted-foreground hover:text-foreground">
                        Component Stack
                      </summary>
                      <pre className="mt-2 overflow-auto rounded-md bg-muted p-3 text-xs">
                        {errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* User-friendly message */}
              <div className="rounded-md bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  We apologize for the inconvenience. You can try the following:
                </p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  <li>Click "Try Again" to retry the operation</li>
                  <li>Reload the page to start fresh</li>
                  <li>Contact support if the problem persists</li>
                </ul>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-2 sm:flex-row">
              <AnimatedButton
                onClick={this.handleReset}
                variant="default"
                className="w-full sm:w-auto"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </AnimatedButton>
              <AnimatedButton
                onClick={this.handleReload}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Reload Page
              </AnimatedButton>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return children;
  }
}

// ============================================================================
// Functional Wrapper (for hooks support)
// ============================================================================

/**
 * Functional wrapper for ErrorBoundary with hooks support
 */
export function ErrorBoundaryWrapper({
  children,
  ...props
}: ErrorBoundaryProps): JSX.Element {
  return <ErrorBoundary {...props}>{children}</ErrorBoundary>;
}

// ============================================================================
// Page-Level Error Boundary
// ============================================================================

/**
 * Page-level error boundary with custom styling
 */
export function PageErrorBoundary({ children }: { children: ReactNode }): JSX.Element {
  return (
    <ErrorBoundary
      errorMessage="This page encountered an error. Please try refreshing."
      onError={(error, errorInfo) => {
        // Log to error tracking service in production
        console.error('Page error:', error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

// ============================================================================
// Component-Level Error Boundary
// ============================================================================

/**
 * Component-level error boundary for isolated error handling
 */
export function ComponentErrorBoundary({
  children,
  componentName,
}: {
  children: ReactNode;
  componentName?: string;
}): JSX.Element {
  return (
    <ErrorBoundary
      fallback={
        <div className="rounded-md border border-destructive/20 bg-destructive/5 p-4">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <p>
              {componentName
                ? `The ${componentName} component failed to load.`
                : 'This component failed to load.'}
            </p>
          </div>
        </div>
      }
      onError={(error, errorInfo) => {
        console.error(`Component error (${componentName}):`, error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
