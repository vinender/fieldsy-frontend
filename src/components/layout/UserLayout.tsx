import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import GreenSpinner from '../common/GreenSpinner';

interface UserLayoutProps {
  children: React.ReactNode;
  requireRole?: 'DOG_OWNER' | 'FIELD_OWNER' | 'ADMIN';
}

export function UserLayout({ children, requireRole }: UserLayoutProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait for NextAuth to determine session status
    if (status === 'loading') {
      return;
    }

    // Check if user is authenticated via NextAuth or localStorage
    const authToken = localStorage.getItem('authToken');
    const currentUser = localStorage.getItem('currentUser');

    // If no role is required, allow access to everyone
    if (!requireRole) {
      setIsAuthenticated(true);
      setIsLoading(false);
      return;
    }

    // Role is required, check authentication
    if (!authToken && !session && status !== 'loading') {
      // Not authenticated but role is required, redirect to login
      router.push(`/login?callbackUrl=${encodeURIComponent(router.asPath)}`);
      return;
    }

    // If we have a session or authToken, we're authenticated
    if (session || authToken) {
      // Check role if required
      if (requireRole) {
        let userRole = null;
        
        // Try to get role from session first
        if (session?.user?.role) {
          userRole = session.user.role;
        } else if (currentUser) {
          // Fallback to localStorage
          try {
            const user = JSON.parse(currentUser);
            userRole = user.role;
          } catch (error) {
            console.error('Failed to parse user data:', error);
          }
        }
        
        if (userRole && userRole !== requireRole && userRole !== 'ADMIN') {
          router.push('/unauthorized');
          return;
        }
      }
      
      setIsAuthenticated(true);
      setIsLoading(false);
    }
  }, [router, requireRole, session, status]);

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
       <GreenSpinner/>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}