/**
 * Authentication Hook
 *
 * Custom React hook for managing authentication state and operations.
 * Provides access to current user, sign in/out functions, and loading states.
 *
 * @module hooks/useAuth
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  getSession,
} from '@/lib/auth';

// ============================================================================
// Types
// ============================================================================

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
}

interface UseAuthReturn extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook for managing authentication state
 */
export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  /**
   * Load current session
   */
  const loadSession = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const session = await getSession();

      if (session?.user) {
        setState({
          user: {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
          },
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
      } else {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: null,
        });
      }
    } catch (error) {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: error instanceof Error ? error : new Error('Failed to load session'),
      });
    }
  }, []);

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        await authSignIn(email, password);
        await loadSession();
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error : new Error('Sign in failed'),
        }));
        throw error;
      }
    },
    [loadSession]
  );

  /**
   * Sign up with email and password
   */
  const signUp = useCallback(
    async (email: string, password: string, name?: string) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        await authSignUp(email, password, name);
        await loadSession();
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error : new Error('Sign up failed'),
        }));
        throw error;
      }
    },
    [loadSession]
  );

  /**
   * Sign out current user
   */
  const signOut = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      await authSignOut();

      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Sign out failed'),
      }));
      throw error;
    }
  }, []);

  /**
   * Refresh session
   */
  const refreshSession = useCallback(async () => {
    await loadSession();
  }, [loadSession]);

  // Load session on mount
  useEffect(() => {
    loadSession();
  }, [loadSession]);

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    refreshSession,
  };
}
