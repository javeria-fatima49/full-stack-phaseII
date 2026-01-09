/**
 * Header Component
 *
 * Simple header with logo only.
 * Navigation has been moved to the Navbar component.
 *
 * @module components/Header
 */

'use client';

import Link from 'next/link';
import { CheckSquare } from 'lucide-react';

// ============================================================================
// Component
// ============================================================================

/**
 * Simple header with logo
 */
export function Header() {
  return (
    <header
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      role="banner"
    >
      <div className="container mx-auto flex h-16 items-center justify-start px-4">
        {/* Logo and Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-2 py-1 -ml-2"
          aria-label="Todo App - Go to home page"
        >
          <CheckSquare className="h-6 w-6 text-primary" aria-hidden="true" />
          <span>Todo App</span>
        </Link>
      </div>
    </header>
  );
}
