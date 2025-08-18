import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { apiClient } from '@/lib/api/client';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'DOG_OWNER' | 'FIELD_OWNER';
  phone?: string;
}

interface LoginData {
  email: string;
  password: string;
}

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';
  const user = session?.user;

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      try {
        const response = await apiClient.post('/auth/register', data);
        return response.data;
      } catch (error: any) {
        // Extract the error message from the backend response
        const errorMessage = error?.response?.data?.message || error?.response?.data?.error || 'Registration failed';
        throw new Error(errorMessage);
      }
    },
    onSuccess: async (response) => {
      if (typeof window !== 'undefined') {
        // Store user and token
        localStorage.setItem('currentUser', JSON.stringify(response.data.user));
        localStorage.setItem('authToken', response.data.token);
        
        // Set token in axios headers
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        // Dispatch custom event to notify AuthContext
        window.dispatchEvent(new Event('authTokenChanged'));
      }
      queryClient.invalidateQueries({ queryKey: ['user'] });
      
      // Sign in with NextAuth to create session
      const result = await signIn('credentials', {
        email: response.data.user.email,
        token: response.data.token,
        redirect: false,
      });
      
      if (result?.ok) {
        router.push('/');
      }
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      try {
        const response = await apiClient.post('/auth/login', data);
        return response.data;
      } catch (error: any) {
        // Extract the error message from the backend response
        const errorMessage = error?.response?.data?.message || error?.response?.data?.error || 'Login failed';
        throw new Error(errorMessage);
      }
    },
    onSuccess: async (response) => {
      if (typeof window !== 'undefined') {
        // Store user and token
        localStorage.setItem('currentUser', JSON.stringify(response.data.user));
        localStorage.setItem('authToken', response.data.token);
        
        // Set token in axios headers
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        // Dispatch custom event to notify AuthContext
        window.dispatchEvent(new Event('authTokenChanged'));
      }
      queryClient.invalidateQueries({ queryKey: ['user'] });
      
      // Sign in with NextAuth to create session
      const result = await signIn('credentials', {
        email: response.data.user.email,
        token: response.data.token,
        redirect: false,
      });
      
      if (result?.ok) {
        // Get the callback URL from query params or default to home
        const callbackUrl = router.query.callbackUrl as string || '/';
        router.push(callbackUrl);
      }
    },
  });

  // Social login
  const socialLogin = async (_provider: 'google' | 'apple') => {
    // Placeholder: direct backend social flow not implemented yet
    console.warn('Social login not implemented for direct backend mode');
  };

  // Logout
  const logout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
    }
    queryClient.clear();
    await signOut({ redirect: false });
    router.push('/login');
  };

  return {
    user: (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('currentUser') || 'null') : null) || user,
    isAuthenticated,
    isLoading,
    register: registerMutation.mutateAsync,
    login: loginMutation.mutateAsync,
    socialLogin,
    logout,
    isRegistering: registerMutation.isPending,
    isLoggingIn: loginMutation.isPending,
    registerError: registerMutation.error,
    loginError: loginMutation.error,
  };
}