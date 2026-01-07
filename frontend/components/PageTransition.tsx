/**
 * Page Transition Component
 *
 * Wrapper component for smooth page transitions using framer-motion.
 * Provides fade and slide animations between page navigations.
 *
 * @module components/PageTransition
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

// ============================================================================
// Types
// ============================================================================

interface PageTransitionProps {
  children: ReactNode;
  /** Unique key for the page (usually pathname) */
  pageKey?: string;
  /** Animation variant */
  variant?: 'fade' | 'slide' | 'scale';
}

// ============================================================================
// Animation Variants
// ============================================================================

const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const slideVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

const scaleVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

const variants = {
  fade: fadeVariants,
  slide: slideVariants,
  scale: scaleVariants,
};

// ============================================================================
// Component
// ============================================================================

/**
 * Page transition wrapper with framer-motion animations
 */
export function PageTransition({
  children,
  pageKey,
  variant = 'fade',
}: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants[variant]}
        transition={{
          duration: 0.3,
          ease: 'easeInOut',
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Stagger children animation wrapper
 */
export function StaggerContainer({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Stagger item (use inside StaggerContainer)
 */
export function StaggerItem({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
