import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
}

export function AuthGuard({ 
  children, 
  requireAuth = true,
  allowedRoles = []
}: AuthGuardProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for our custom auth
    const authToken = localStorage.getItem('authToken');
    const currentUser = localStorage.getItem('currentUser');
    
    if (requireAuth) {
      // Check if user is authenticated
      if (!authToken && !session && status !== 'loading') {
        // Not authenticated, redirect to login
        router.push(`/login?callbackUrl=${encodeURIComponent(router.asPath)}`);
        return;
      }
      
      // Check role requirements if specified
      if (allowedRoles.length > 0 && currentUser) {
        try {
          const user = JSON.parse(currentUser);
          if (!allowedRoles.includes(user.role)) {
            router.push('/unauthorized');
            return;
          }
        } catch (e) {
          console.error('Failed to parse user data:', e);
          router.push('/login');
          return;
        }
      }
    }
    
    setIsAuthorized(true);
    setIsLoading(false);
  }, [requireAuth, allowedRoles, router, session, status]);

  if (isLoading || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}