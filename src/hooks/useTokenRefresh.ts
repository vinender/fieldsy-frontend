import { useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axiosClient from '@/lib/api/axios-client';
import { isPublicRoute } from '@/utils/auth-routes';

const TOKEN_REFRESH_THRESHOLD = 300000; // 5 minutes before expiry
const REFRESH_CHECK_INTERVAL = 60000; // Check every minute

export function useTokenRefresh() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();
  const lastRefreshRef = useRef<number>(0);

  const parseJWT = useCallback((token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return null;
    }
  }, []);

  const refreshToken = useCallback(async () => {
    // Prevent multiple simultaneous refresh attempts
    const now = Date.now();
    if (now - lastRefreshRef.current < 10000) {
      console.log('Skipping refresh, recently attempted');
      return;
    }
    lastRefreshRef.current = now;

    try {
      console.log('Attempting to refresh token...');
      
      // Call backend refresh endpoint
      const response = await axiosClient.post('/auth/refresh-token', {}, {
        // Don't retry on failure
        validateStatus: (status) => status < 500
      });

      if (response.status === 200 && response.data.token) {
        // Update local storage
        localStorage.setItem('authToken', response.data.token);
        
        // Update session if using NextAuth
        if (update) {
          await update({
            ...session,
            accessToken: response.data.token,
            user: {
              ...session?.user,
              token: response.data.token
            }
          });
        }

        console.log('Token refreshed successfully');
        return true;
      } else {
        console.error('Failed to refresh token:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }, [session, update]);

  const scheduleTokenRefresh = useCallback(async () => {
    // Skip if on public route
    if (isPublicRoute(router.pathname)) {
      return;
    }
    
    // Get current token
    let token = null;
    
    if (session?.accessToken) {
      token = session.accessToken;
    } else if ((session?.user as any)?.token) {
      token = (session.user as any).token;
    } else if ((session as any)?.token) {
      token = (session as any).token;
    } else {
      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        token = authToken;
      }
    }

    if (!token) {
      return;
    }

    // Parse token to get expiry
    const decoded = parseJWT(token as string);
    if (!decoded || !decoded.exp) {
      return;
    }

    const now = Date.now() / 1000;
    const timeUntilExpiry = (decoded.exp - now) * 1000;

    // Clear existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // Schedule refresh before token expires
    if (timeUntilExpiry > TOKEN_REFRESH_THRESHOLD) {
      const refreshIn = timeUntilExpiry - TOKEN_REFRESH_THRESHOLD;
      console.log(`Scheduling token refresh in ${Math.round(refreshIn / 60000)} minutes`);
      
      refreshTimeoutRef.current = setTimeout(async () => {
        const success = await refreshToken();
        if (success) {
          // Schedule next refresh
          scheduleTokenRefresh();
        }
      }, refreshIn);
    } else if (timeUntilExpiry > 0) {
      // Token is about to expire, refresh immediately
      console.log('Token expiring soon, refreshing immediately');
      const success = await refreshToken();
      if (success) {
        scheduleTokenRefresh();
      }
    }
  }, [session, parseJWT, refreshToken, router.pathname]);

  // Set up automatic token refresh
  useEffect(() => {
    if (typeof window === 'undefined' || isPublicRoute(router.pathname)) {
      return;
    }

    // Initial schedule
    scheduleTokenRefresh();

    // Also check periodically in case token was updated elsewhere
    const checkInterval = setInterval(() => {
      scheduleTokenRefresh();
    }, REFRESH_CHECK_INTERVAL);

    // Refresh on window focus
    const handleFocus = () => {
      scheduleTokenRefresh();
    };
    window.addEventListener('focus', handleFocus);

    // Cleanup
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      clearInterval(checkInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [scheduleTokenRefresh, router.pathname]);

  return { refreshToken };
}