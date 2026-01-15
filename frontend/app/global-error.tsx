'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-slate-900 text-gray-100">
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <div className="w-full max-w-lg rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
            <h2 className="text-lg font-semibold text-destructive">Something went wrong!</h2>
            <p className="mt-2 text-sm text-muted-foreground">{error.message || 'An unexpected error occurred.'}</p>
            <button
              onClick={() => reset()}
              className="mt-4 rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}