/**
 * Authentication Module
 *
 * Handles authentication with the backend API.
 * Manages session persistence and authentication state.
 *
 * @module lib/auth
 */

// ============================================================================
// Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  name?: string;
}

interface Session {
  user: User;
  token?: string;
}

interface AuthResponse {
  user: User;
  token?: string;
}



// ============================================================================
// Authentication API
// ============================================================================

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for session management
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(errorData.detail || 'Login failed');
    }

    const data = await response.json();

    // Return user data in expected format
    return {
      user: {
        id: data.user?.id || data.id || '',
        email: data.user?.email || data.email || '',
        name: data.user?.name || data.name || '',
      }
    };
  } catch (error) {
    console.error('Sign in error:', error);
    throw new Error('Sign in failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string, name?: string): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for session management
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(errorData.detail || 'Registration failed');
    }

    const data = await response.json();

    // Return user data in expected format
    return {
      user: {
        id: data.user?.id || data.id || '',
        email: data.user?.email || data.email || '',
        name: data.user?.name || data.name || '',
      }
    };
  } catch (error) {
    console.error('Sign up error:', error);
    throw new Error('Sign up failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  try {
    await fetch('/api/auth/signout', {
      method: 'POST',
      credentials: 'include', // Include cookies for session management
    });
  } catch (error) {
    console.error('Sign out error:', error);
    // Still clear local state even if backend request fails
  }
}

/**
 * Get current user session
 */
export async function getSession(): Promise<Session | null> {
  try {
    const response = await fetch('/api/auth/me', {
      credentials: 'include', // Include cookies for session management
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data) {
      return null;
    }

    return {
      user: {
        id: data.id,
        email: data.email,
        name: data.name,
      }
    };
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session?.user;
}

// ============================================================================
// API Request Headers
// ============================================================================

/**
 * Get authorization headers for API requests
 */
export function getAuthHeaders(): Record<string, string> {
  // Authentication is handled via cookies, so no additional headers needed
  return {};
}

// ============================================================================
// Export
// ============================================================================

export type { Session, AuthResponse };
