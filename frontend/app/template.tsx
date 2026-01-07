/**
 * App Template
 *
 * Wraps all pages with PageTransition for smooth page transitions.
 * This template is automatically applied to all pages in the app directory.
 *
 * @module app/template
 */

'use client';

import { usePathname } from 'next/navigation';
import { PageTransition } from '@/components/PageTransition';

interface TemplateProps {
  children: React.ReactNode;
}

/**
 * Template component that wraps all pages with transitions
 */
export default function Template({ children }: TemplateProps) {
  const pathname = usePathname();

  return (
    <PageTransition pageKey={pathname} variant="fade">
      {children}
    </PageTransition>
  );
}
