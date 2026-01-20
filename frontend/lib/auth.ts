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
// Token Storage
// ============================================================================

const TOKEN_KEY = 'access_token';

/**
 * Store JWT token in localStorage
 */
export function storeToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

/**
 * Retrieve JWT token from localStorage
 */
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

/**
 * Remove JWT token from localStorage
 */
export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
}

// ============================================================================
// API Base URL
// ============================================================================

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api').replace(/\/$/, '');

// ============================================================================
// Authentication API
// ============================================================================

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    // Construct the full URL for auth endpoints
    const url = new URL('/api/auth/signin', API_BASE_URL).toString();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(errorData.detail || 'Login failed');
    }

    const data = await response.json();

    // Store the token if present in the response
    if (data.access_token) {
      storeToken(data.access_token);
    }

    // Return user data in expected format
    return {
      user: {
        id: data.user?.id || data.id || '',
        email: data.user?.email || data.email || '',
        name: data.user?.name || data.name || '',
      },
      token: data.access_token
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
    // Construct the full URL for auth endpoints
    const url = new URL('/api/auth/signup', API_BASE_URL).toString();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(errorData.detail || 'Registration failed');
    }

    const data = await response.json();

    // Store the token if present in the response
    if (data.access_token) {
      storeToken(data.access_token);
    }

    // Return user data in expected format
    return {
      user: {
        id: data.user?.id || data.id || '',
        email: data.user?.email || data.email || '',
        name: data.user?.name || data.name || '',
      },
      token: data.access_token
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
    // Clear the stored token
    removeToken();
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
    const token = getToken();
    if (!token) {
      return null;
    }

    // Construct the full URL for auth endpoints
    const url = new URL('/api/auth/me', API_BASE_URL).toString();

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // If unauthorized, remove the invalid token
      if (response.status === 401) {
        removeToken();
      }
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
  const token = getToken();
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
    };
  }
  return {};
}

// ============================================================================
// Export
// ============================================================================

export type { Session, AuthResponse };
