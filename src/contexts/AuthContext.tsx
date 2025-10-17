import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
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
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  refetchUser: () => {},
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

  // Optimistic auth state from localStorage - loaded synchronously
  const [optimisticUser, setOptimisticUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;

    const storedUser = localStorage.getItem('currentUser');
    const authToken = localStorage.getItem('authToken');

    if (storedUser && authToken) {
      try {
        return JSON.parse(storedUser) as User;
      } catch (error) {
        console.error('[AuthContext] Failed to parse stored user:', error);
        return null;
      }
    }
    return null;
  });

  // Check for token in localStorage as fallback
  const [authToken, setAuthToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      setAuthToken(token);

      // Listen for storage changes
      const handleStorageChange = () => {
        const newToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('currentUser');

        setAuthToken(newToken);

        // Update optimistic user state when localStorage changes
        if (storedUser && newToken) {
          try {
            const parsedUser = JSON.parse(storedUser) as User;
            setOptimisticUser(parsedUser);
            // Also immediately update the user state for instant UI updates
            setUser(parsedUser);
          } catch (error) {
            console.error('[AuthContext] Failed to parse stored user:', error);
            setOptimisticUser(null);
            setUser(null);
          }
        } else {
          setOptimisticUser(null);
          setUser(null);
        }
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
    refetch: refetchUserQuery
  } = useCurrentUser({
    enabled: (status === 'authenticated') || !!authToken,
  });

  // Wrap refetch to match the expected type
  const refetchUser = () => {
    refetchUserQuery();
  };

  // Use custom hook for updating role
  const updateRoleMutation = useUpdateRole();

  const [user, setUser] = useState<User | null>(optimisticUser);
  const [isLoading, setIsLoading] = useState(() => {
    // If we have optimistic user data, we're not loading
    return !optimisticUser;
  });

  // Update local user state when userData changes
  useEffect(() => {
    if (userData) {
      const newUser = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        image: userData.image || userData.avatar,
        role: userData.role as 'DOG_OWNER' | 'FIELD_OWNER' | 'ADMIN',
        provider: userData.provider,
      };

      setUser(newUser);
      setIsLoading(false);

      // Update localStorage to keep optimistic state in sync
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentUser', JSON.stringify(newUser));
      }
    } else if (status === 'unauthenticated' && !authToken) {
      // Only clear user if we don't have a token in localStorage
      setUser(null);
      setOptimisticUser(null);
      setIsLoading(false);

      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('currentUser');
      }
    } else if (status === 'loading' || userLoading) {
      // Only show loading if we don't have optimistic user data
      if (!optimisticUser) {
        setIsLoading(true);
      }
    } else {
      setIsLoading(false);
    }
  }, [userData, status, userLoading, authToken, optimisticUser]);

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