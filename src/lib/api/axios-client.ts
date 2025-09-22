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

// Request interceptor to add auth token
axiosClient.interceptors.request.use(
  async (config) => {
    // Get session for auth token
    const session = await getSession();
    
    // Try multiple possible token locations
    let token = null;
    
    // 1. Check session.accessToken
    if (session?.accessToken) {
      token = session.accessToken;
    } 
    // 2. Check session.user.token
    else if ((session?.user as any)?.token) {
      token = (session.user as any).token;
    }
    // 3. Check session.token
    else if ((session as any)?.token) {
      token = (session as any).token;
    }
    // 4. Fallback to localStorage authToken
    else {
      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        token = authToken;
      } else {
        // 5. Check currentUser in localStorage (legacy)
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            if (user.token) {
              token = user.token;
            }
          } catch (e) {
            console.error('Failed to parse stored user:', e);
          }
        }
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Keep track of whether we're already redirecting to avoid multiple redirects
let isRedirecting = false;

// Response interceptor for error handling
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
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