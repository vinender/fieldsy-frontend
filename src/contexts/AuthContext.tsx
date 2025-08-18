import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useCurrentUser, useUpdateRole } from '@/hooks';

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
  const router = useRouter();
  
  // Check for token in localStorage as fallback
  const [authToken, setAuthToken] = useState<string | null>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      setAuthToken(token);
      
      // Listen for storage changes
      const handleStorageChange = () => {
        const newToken = localStorage.getItem('authToken');
        console.log('[AuthContext] Storage changed, new token:', newToken);
        setAuthToken(newToken);
        // The token change will trigger a refetch via the useCurrentUser enabled prop
      };
      
      window.addEventListener('storage', handleStorageChange);
      
      // Also listen for custom event when we update localStorage
      window.addEventListener('authTokenChanged', handleStorageChange);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('authTokenChanged', handleStorageChange);
      };
    }
  }, []);
  
  // Use custom hook for fetching user data
  const { 
    data: userData, 
    isLoading: userLoading, 
    refetch: refetchUser 
  } = useCurrentUser({
    enabled: (status === 'authenticated' && !!session?.accessToken) || !!authToken,
  });
  
  // Use custom hook for updating role
  const updateRoleMutation = useUpdateRole();
  
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Update local user state when userData changes
  useEffect(() => {
    console.log('[AuthContext] userData:', userData);
    console.log('[AuthContext] status:', status);
    console.log('[AuthContext] authToken:', authToken);
    
    if (userData) {
      setUser({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        image: userData.image || userData.avatar,
        role: userData.role as 'DOG_OWNER' | 'FIELD_OWNER' | 'ADMIN',
        provider: userData.provider,
      });
      setIsLoading(false);
    } else if (status === 'unauthenticated' && !authToken) {
      // Only clear user if we don't have a token in localStorage
      setUser(null);
      setIsLoading(false);
    } else if (status === 'loading' || userLoading) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [userData, status, userLoading, authToken]);

  // Handle OAuth role update
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email && user) {
      const pendingRole = localStorage.getItem('pendingUserRole');
      
      if (pendingRole && (pendingRole === 'DOG_OWNER' || pendingRole === 'FIELD_OWNER')) {
        if (user.role !== pendingRole) {
          console.log('[AuthContext] Updating role from', user.role, 'to', pendingRole);
          
          updateRoleMutation.mutateAsync({ 
            role: pendingRole,
            userId: user.id
          })
            .then(async () => {
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
  }, [status, session, user, refetchUser, updateRoleMutation]);

  return (
    <AuthContext.Provider value={{ user, isLoading, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}