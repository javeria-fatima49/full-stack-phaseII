/**
 * Footer Component
 *
 * Application footer with app information and links.
 * Features:
 * - App name and version
 * - Copyright information
 * - Responsive layout
 * - Semantic HTML structure
 * - Accessible with proper ARIA roles
 *
 * @module components/Footer
 */

import Link from 'next/link';
import { CheckSquare } from 'lucide-react';

// ============================================================================
// Component
// ============================================================================

/**
 * Footer with app information
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="w-full border-t bg-background"
      role="contentinfo"
    >
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          {/* Brand and Copyright */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckSquare className="h-4 w-4 text-primary" aria-hidden="true" />
            <span>
              © {currentYear} Todo App. All rights reserved.
            </span>
          </div>

          {/* Footer Links */}
          <nav
            className="flex items-center gap-4 text-sm"
            role="navigation"
            aria-label="Footer navigation"
          >
            <Link
              href="/"
              className="text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-2 py-1"
              aria-label="Go to home page"
            >
              Home
            </Link>
            <Link
              href="/tasks"
              className="text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-2 py-1"
              aria-label="View all tasks"
            >
              Tasks
            </Link>
          </nav>
        </div>

        {/* Additional Info */}
        <div className="mt-4 text-center text-xs text-muted-foreground">
          <p>
            Built with Next.js, React, and TypeScript. Powered by shadcn/ui.
          </p>
        </div>
      </div>
    </footer>
  );
}
