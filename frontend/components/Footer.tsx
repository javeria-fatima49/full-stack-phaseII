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
      className="w-full border-t border-slate-800 bg-slate-900"
      role="contentinfo"
    >
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          {/* Brand and Copyright */}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <CheckSquare className="h-4 w-4 text-cyan-400" aria-hidden="true" />
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
              className="text-gray-400 hover:text-cyan-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-md px-2 py-1"
              aria-label="Go to home page"
            >
              Home
            </Link>
            <Link
              href="/tasks"
              className="text-gray-400 hover:text-cyan-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-md px-2 py-1"
              aria-label="View all tasks"
            >
              Tasks
            </Link>
          </nav>
        </div>

        {/* Additional Info */}
        <div className="mt-4 text-center text-xs text-gray-500">
          <p>
            Built with Next.js, React, and TypeScript. Powered by shadcn/ui.
          </p>
        </div>
      </div>
    </footer>
  );
}
