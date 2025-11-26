import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useCurrentUser } from '@/hooks';

interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  googleImage?: string | null;
  profileImage?: string | null;
  avatar?: string | null;
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

  const syncAuthFromStorage = useCallback(() => {
    if (typeof window === 'undefined') return;

    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('currentUser');

    setAuthToken(storedToken);

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        setOptimisticUser(parsedUser);
        setUser((prev) => prev ?? parsedUser);
        setIsLoading(false);
      } catch (error) {
        console.error('[AuthContext] Failed to parse stored user during sync:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    syncAuthFromStorage();

    const handleStorageChange = () => {
      const newToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('currentUser');

      setAuthToken(newToken);

      if (storedUser && newToken) {
        try {
          const parsedUser = JSON.parse(storedUser) as User;
          setOptimisticUser(parsedUser);
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
    window.addEventListener('authTokenChanged', handleStorageChange);
    window.addEventListener('focus', syncAuthFromStorage);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncAuthFromStorage();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authTokenChanged', handleStorageChange);
      window.removeEventListener('focus', syncAuthFromStorage);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [syncAuthFromStorage]);

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

  const [user, setUser] = useState<User | null>(optimisticUser);
  const [isLoading, setIsLoading] = useState(() => {
    // If we have optimistic user data, we're not loading
    return !optimisticUser;
  });

  // Update local user state when userData changes
  useEffect(() => {
    if (!user && authToken) {
      syncAuthFromStorage();
    }
  }, [user, authToken, syncAuthFromStorage]);

  useEffect(() => {
    if (userData) {
      const newUser = {
        id: userData?.id,
        email: userData?.email,
        name: userData?.name,
        image: userData?.image || userData?.googleImage || userData?.avatar,
        googleImage: userData?.googleImage || null,
        profileImage: userData?.profileImage || null,
        avatar: userData?.avatar || null,
        role: userData?.role as 'DOG_OWNER' | 'FIELD_OWNER' | 'ADMIN',
        provider: userData?.provider,
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

  // Clean up pending role after successful authentication
  // Note: Role updates for OAuth are handled during the social login flow,
  // so we just need to clean up the localStorage flag here
  useEffect(() => {
    if (status === 'authenticated' && user) {
      const pendingRole = localStorage.getItem('pendingUserRole');

      if (pendingRole) {
        console.log('[AuthContext] User authenticated, clearing pendingUserRole from localStorage');
        // Remove the pending role flag since authentication is complete
        // The role was already set during the OAuth flow
        localStorage.removeItem('pendingUserRole');
      }
    }
  }, [status, user]);

  return (
    <AuthContext.Provider value={{ user, isLoading, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}
