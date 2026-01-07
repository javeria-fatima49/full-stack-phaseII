/**
 * Header Component
 *
 * Responsive navigation header with logo and navigation links.
 * Features:
 * - Desktop: Full navigation bar with links
 * - Mobile: Hamburger menu with slide-out navigation
 * - Keyboard navigation support (Tab, Enter, Escape)
 * - ARIA roles and labels for accessibility
 * - Focus management and visible focus styles
 *
 * @module components/Header
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, X, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface NavLink {
  href: string;
  label: string;
  ariaLabel?: string;
}

// ============================================================================
// Constants
// ============================================================================

const NAV_LINKS: NavLink[] = [
  { href: '/', label: 'Dashboard', ariaLabel: 'Go to Dashboard' },
  { href: '/tasks', label: 'Tasks', ariaLabel: 'View all tasks' },
  { href: '/tasks/create', label: 'Create Task', ariaLabel: 'Create a new task' },
];

// ============================================================================
// Component
// ============================================================================

/**
 * Header with responsive navigation
 */
export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // ============================================================================
  // Mobile Menu Handlers
  // ============================================================================

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // ============================================================================
  // Keyboard Navigation
  // ============================================================================

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Close mobile menu on Escape key
      if (event.key === 'Escape' && isMobileMenuOpen) {
        closeMobileMenu();
        // Return focus to menu button
        menuButtonRef.current?.focus();
      }
    };

    // Add event listener when mobile menu is open
    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  // ============================================================================
  // Click Outside Handler
  // ============================================================================

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        !menuButtonRef.current?.contains(event.target as Node)
      ) {
        closeMobileMenu();
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // ============================================================================
  // Close Menu on Route Change
  // ============================================================================

  useEffect(() => {
    closeMobileMenu();
  }, [pathname]);

  // ============================================================================
  // Active Link Check
  // ============================================================================

  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <header
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      role="banner"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo and Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-2 py-1 -ml-2"
          aria-label="Todo App - Go to home page"
        >
          <CheckSquare className="h-6 w-6 text-primary" aria-hidden="true" />
          <span>Todo App</span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden md:flex items-center gap-6"
          role="navigation"
          aria-label="Main navigation"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-3 py-2',
                isActiveLink(link.href)
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
              aria-label={link.ariaLabel}
              aria-current={isActiveLink(link.href) ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <Button
          ref={menuButtonRef}
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
        </Button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          id="mobile-menu"
          className="md:hidden border-t bg-background"
          role="navigation"
          aria-label="Mobile navigation"
        >
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-3 py-2',
                  isActiveLink(link.href)
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground'
                )}
                aria-label={link.ariaLabel}
                aria-current={isActiveLink(link.href) ? 'page' : undefined}
                onClick={closeMobileMenu}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
