import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';

interface RegisterData {
  name: string;
  email: string;
  password: string;
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
      const response = await axios.post('/api/auth/register', data);
      return response.data;
    },
    onSuccess: async (data) => {
      // Auto-login after registration
      await signIn('credentials', {
        email: data.user.email,
        password: data.password,
        redirect: false,
      });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.push('/');
    },
    onError: (error: any) => {
      console.error('Registration error:', error);
      throw error;
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      
      if (result?.error) {
        throw new Error(result.error);
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.push('/');
    },
    onError: (error: any) => {
      console.error('Login error:', error);
      throw error;
    },
  });

  // Social login
  const socialLogin = async (provider: 'google' | 'apple') => {
    try {
      await signIn(provider, { callbackUrl: '/' });
    } catch (error) {
      console.error(`${provider} login error:`, error);
    }
  };

  // Logout
  const logout = async () => {
    await signOut({ redirect: false });
    queryClient.clear();
    router.push('/login');
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    register: registerMutation.mutate,
    login: loginMutation.mutate,
    socialLogin,
    logout,
    isRegistering: registerMutation.isPending,
    isLoggingIn: loginMutation.isPending,
    registerError: registerMutation.error,
    loginError: loginMutation.error,
  };
}