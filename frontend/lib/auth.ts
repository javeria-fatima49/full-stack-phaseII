/**
 * Authentication Module
 *
 * Handles JWT authentication with the backend API.
 * Manages token storage, session persistence, and authentication state.
 *
 * @module lib/auth
 */

// ============================================================================
// Configuration
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// ============================================================================
// Types
// ============================================================================

interface User {
  id: string;
  email: string;
  name?: string;
}

interface Session {
  user: User;
  token: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

// ============================================================================
// Token Management
// ============================================================================

/**
 * Get authentication token from localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Set authentication token in localStorage
 */
function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Remove authentication token from localStorage
 */
function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Get user data from localStorage
 */
function getUserData(): User | null {
  if (typeof window === 'undefined') return null;
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
}

/**
 * Set user data in localStorage
 */
function setUserData(user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Remove user data from localStorage
 */
function removeUserData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_KEY);
}

// ============================================================================
// Authentication API
// ============================================================================

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Sign in failed' }));
    throw new Error(error.detail || 'Sign in failed');
  }

  const data: AuthResponse = await response.json();

  // Store token and user data
  setAuthToken(data.token);
  setUserData(data.user);

  return data;
}

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string, name?: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, name }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Sign up failed' }));
    throw new Error(error.detail || 'Sign up failed');
  }

  const data: AuthResponse = await response.json();

  // Store token and user data
  setAuthToken(data.token);
  setUserData(data.user);

  return data;
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  removeAuthToken();
  removeUserData();
}

/**
 * Get current user session
 */
export async function getSession(): Promise<Session | null> {
  const token = getAuthToken();
  const user = getUserData();

  if (!token || !user) {
    return null;
  }

  return { user, token };
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

// ============================================================================
// API Request Headers
// ============================================================================

/**
 * Get authorization headers for API requests
 */
export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

// ============================================================================
// Export
// ============================================================================

export { API_BASE_URL };
export type { User, Session, AuthResponse };
