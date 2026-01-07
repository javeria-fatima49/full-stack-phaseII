/**
 * Animated Button Component
 *
 * Wrapper around shadcn/ui Button with framer-motion tap animations.
 * Provides consistent tap feedback across the application.
 *
 * @module components/AnimatedButton
 */

'use client';

import { motion } from 'framer-motion';
import { Button, ButtonProps } from '@/components/ui/button';
import { forwardRef } from 'react';

// ============================================================================
// Component
// ============================================================================

/**
 * Button with tap animation
 */
export const AnimatedButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    return (
      <motion.div
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.1, ease: 'easeInOut' }}
        style={{ display: 'inline-block' }}
      >
        <Button ref={ref} {...props} />
      </motion.div>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';
