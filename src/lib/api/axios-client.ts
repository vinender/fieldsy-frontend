import axios from 'axios';
import { getSession, signOut } from 'next-auth/react';
import Router from 'next/router';
import { isPublicRoute } from '@/utils/auth-routes';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cache the session token to avoid calling getSession() on every request
let cachedToken: string | null = null;
let tokenCacheTime = 0;
const TOKEN_CACHE_TTL = 60 * 1000; // 1 minute

// Call this when logging in to set the token immediately
export function setAxiosAuthToken(token: string | null) {
  cachedToken = token;
  tokenCacheTime = Date.now();
}

// Call this on logout to clear immediately
export function clearAxiosAuthToken() {
  cachedToken = null;
  tokenCacheTime = 0;
}

// Request interceptor to add auth token
axiosClient.interceptors.request.use(
  async (config) => {
    let token: string | null = null;

    // 1. Use cached token if fresh (avoids getSession() call)
    if (cachedToken && (Date.now() - tokenCacheTime) < TOKEN_CACHE_TTL) {
      token = cachedToken;
    }

    // 2. Check localStorage as fast fallback
    if (!token && typeof window !== 'undefined') {
      token = localStorage.getItem('authToken');
    }

    // 3. Last resort: get from NextAuth session (async, slower)
    if (!token) {
      try {
        const session = await getSession();
        if (session?.accessToken) {
          token = session.accessToken as string;
        } else if ((session?.user as any)?.token) {
          token = (session.user as any).token;
        } else if ((session as any)?.token) {
          token = (session as any).token;
        }
        // Cache it for next request
        if (token) {
          cachedToken = token;
          tokenCacheTime = Date.now();
        }
      } catch (e) {
        // Session fetch failed, continue without token
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Keep track of whether we're already redirecting to avoid multiple redirects
let isRedirecting = false;

// Response interceptor for error handling
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Check if this is a password change request
      const requestUrl = error.config?.url || '';
      const isPasswordChangeRequest = requestUrl.includes('/change-password');

      // Skip logout for password change requests - let the mutation handle the error
      if (isPasswordChangeRequest) {
        console.log('401 on password change request, keeping session active');
        return Promise.reject(error);
      }

      // Handle unauthorized - token expired or invalid
      const currentPath = Router.pathname;

      // Skip redirect for public routes
      if (isPublicRoute(currentPath)) {
        console.log('401 on public route, skipping redirect');
        return Promise.reject(error);
      }

      console.error('Unauthorized access - token may be expired');

      // Avoid multiple redirects
      if (!isRedirecting) {
        isRedirecting = true;

        // Clear all auth data
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userRole');

        // Sign out from NextAuth
        try {
          await signOut({ redirect: false });
        } catch (e) {
          console.error('Error signing out:', e);
        }

        // Get current path for redirect after login
        const returnUrl = currentPath !== '/login' ? currentPath : '/';

        // Store return URL for post-login redirect
        if (returnUrl !== '/' && returnUrl !== '/login' && !isPublicRoute(returnUrl)) {
          sessionStorage.setItem('returnUrl', returnUrl);
        }

        // Show notification if not already on login page
        if (currentPath !== '/login') {
          // Import toast dynamically to avoid SSR issues
          const { toast } = await import('sonner');
          toast.error('Your session has expired. Please login again.');

          // Redirect to login page
          Router.push('/login');
        }

        // Reset flag after a delay
        setTimeout(() => {
          isRedirecting = false;
        }, 1000);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
