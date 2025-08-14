import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axiosClient from '@/lib/api/axios-client';

interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: 'DOG_OWNER' | 'FIELD_OWNER' | 'ADMIN';
  provider?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  refetchUser: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchUserData = useCallback(async () => {
    if (!session?.accessToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await axiosClient.get('/auth/me');
      console.log('[AuthContext] Fetched user data:', response.data.data);
      setUser({
        id: response.data.data.id,
        email: response.data.data.email,
        name: response.data.data.name,
        image: response.data.data.image,
        role: response.data.data.role,
        provider: response.data.data.provider,
      });
    } catch (error: any) {
      console.error('[AuthContext] Error fetching user data:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [session?.accessToken]);

  const refetchUser = useCallback(async () => {
    setIsLoading(true);
    await fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (status === 'authenticated' && session) {
      fetchUserData();
    } else {
      setUser(null);
      setIsLoading(false);
    }
  }, [status, session, fetchUserData]);

  // Handle OAuth role update
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email && user) {
      const pendingRole = localStorage.getItem('pendingUserRole');
      
      if (pendingRole && (pendingRole === 'DOG_OWNER' || pendingRole === 'FIELD_OWNER')) {
        if (user.role !== pendingRole) {
          console.log('[AuthContext] Updating role from', user.role, 'to', pendingRole);
          
          axiosClient.patch('/auth/update-role', { 
            email: user.email, 
            role: pendingRole 
          })
            .then(async (response) => {
              console.log('[AuthContext] Role updated successfully');
              localStorage.removeItem('pendingUserRole');
              await refetchUser();
            })
            .catch((error) => {
              console.error('[AuthContext] Error updating role:', error);
              localStorage.removeItem('pendingUserRole');
            });
        } else {
          localStorage.removeItem('pendingUserRole');
        }
      }
    }
  }, [status, session, user, refetchUser]);

  return (
    <AuthContext.Provider value={{ user, isLoading, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}