import { useEffect, useCallback, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { useTokenRefresh } from '@/hooks/useTokenRefresh';
import { isPublicRoute } from '@/utils/auth-routes';

const SESSION_CHECK_INTERVAL = 60000; // Check every minute
const TOKEN_EXPIRY_WARNING_TIME = 300000; // Show warning 5 minutes before expiry

export function SessionMonitor() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const checkIntervalRef = useRef<NodeJS.Timeout>();
  const warningShownRef = useRef(false);
  const { refreshToken } = useTokenRefresh();

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

  const checkTokenExpiry = useCallback(async () => {
    // Skip check if on public routes
    if (isPublicRoute(router.pathname)) {
      return;
    }

    // Get token from various sources
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
      // No token found, user might not be logged in
      return;
    }

    // Parse token to check expiry
    const decoded = parseJWT(token as string);
    if (!decoded || !decoded.exp) {
      return;
    }

    const now = Date.now() / 1000;
    const timeUntilExpiry = (decoded.exp - now) * 1000;

    // Token has expired
    if (timeUntilExpiry <= 0) {
      console.log('Token has expired, redirecting to login...');
      
      // Clear auth data
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('userRole');
      
      // Store current path for return after login
      if (router.pathname !== '/' && router.pathname !== '/login') {
        sessionStorage.setItem('returnUrl', router.pathname);
      }
      
      // Sign out and redirect
      await signOut({ redirect: false });
      toast.error('Your session has expired. Please login again.');
      router.push('/login');
      
      // Clear interval to stop checking
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      return;
    }

    // Show warning if token is about to expire
    if (timeUntilExpiry <= TOKEN_EXPIRY_WARNING_TIME && !warningShownRef.current) {
      warningShownRef.current = true;
      const minutesLeft = Math.ceil(timeUntilExpiry / 60000);
      
      toast.warning(
        `Your session will expire in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}. Please save your work.`,
        {
          duration: 10000,
          action: {
            label: 'Refresh Session',
            onClick: async () => {
              // Attempt to refresh the token
              const success = await refreshToken();
              if (success) {
                toast.success('Session refreshed successfully');
                warningShownRef.current = false;
              } else {
                toast.error('Failed to refresh session. Please login again.');
              }
            }
          }
        }
      );
    }

    // Reset warning flag if token was refreshed
    if (timeUntilExpiry > TOKEN_EXPIRY_WARNING_TIME) {
      warningShownRef.current = false;
    }
  }, [session, router, parseJWT, refreshToken]);

  // Set up periodic token check
  useEffect(() => {
    // Only run on client side, when user is authenticated, and on protected routes
    if (typeof window === 'undefined' || status !== 'authenticated' || isPublicRoute(router.pathname)) {
      return;
    }

    // Initial check
    checkTokenExpiry();

    // Set up interval for periodic checks
    checkIntervalRef.current = setInterval(checkTokenExpiry, SESSION_CHECK_INTERVAL);

    // Also check on focus
    const handleFocus = () => {
      checkTokenExpiry();
    };
    window.addEventListener('focus', handleFocus);

    // Cleanup
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      window.removeEventListener('focus', handleFocus);
    };
  }, [status, checkTokenExpiry, router.pathname]);

  // Listen for storage events (logout from another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken' && !e.newValue) {
        // Auth token was removed, likely logged out from another tab
        signOut({ redirect: false });
        router.push('/login');
        toast.info('You have been logged out.');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [router]);

  return null; // This component doesn't render anything
}