import axios from 'axios';
import { getSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

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

// Response interceptor for error handling
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - could trigger logout or token refresh
      console.error('Unauthorized access - token may be expired');
    }
    return Promise.reject(error);
  }
);

export default axiosClient;