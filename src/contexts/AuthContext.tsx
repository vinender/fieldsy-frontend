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
  return useContext(AuthContext);
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  // Optimistic auth state from localStorage - initialized as null to prevent hydration mismatch
  const [optimisticUser, setOptimisticUser] = useState<User | null>(null);

  // Check for token in localStorage as fallback - initialized as null to prevent hydration mismatch
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Load auth state from localStorage after hydration
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedUser = localStorage.getItem('currentUser');
    const storedToken = localStorage.getItem('authToken');

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        setOptimisticUser(parsedUser);
        setAuthToken(storedToken);
        // Also set the user immediately from localStorage
        setUser(parsedUser);
        setIsLoading(false);
      } catch (error) {
        console.error('[AuthContext] Failed to parse stored user:', error);
        setIsLoading(false);
      }
    } else if (storedToken) {
      setAuthToken(storedToken);
    } else {
      // No stored auth, stop loading
      setIsLoading(false);
    }
  }, []);

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

    // Only sync on cross-tab storage changes and explicit auth events
    // Do NOT sync on focus/visibility — that causes stale user flashes
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

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authTokenChanged', handleStorageChange);
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

  // Initialize user and loading state with consistent values for SSR/hydration
  // We always start with null/true and sync from localStorage via useEffect
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Update local user state when userData changes
  useEffect(() => {
    if (!user && authToken) {
      syncAuthFromStorage();
    }
  }, [user, authToken, syncAuthFromStorage]);

  useEffect(() => {
    if (userData) {
      // Don't use fallback for image - keep image and googleImage separate
      // ProfileAvatar component will handle the fallback priority correctly
      // This prevents overwriting an uploaded image with googleImage when image is null
      const newUser = {
        id: userData?.id,
        email: userData?.email,
        name: userData?.name,
        image: userData?.image || null, // User's uploaded image only, no fallback
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
    } else if (status === 'unauthenticated') {
      // Always clear user when session is unauthenticated - don't check authToken
      // as the state variable may lag behind localStorage being cleared
      setUser(null);
      setOptimisticUser(null);
      setAuthToken(null);
      setIsLoading(false);

      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
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
