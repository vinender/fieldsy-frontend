import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function UnauthorizedPage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If not logged in, redirect to login
    if (!session) {
      router.push('/login');
    }
  }, [session, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-green mb-4">403</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h2>
          
          <p className="text-gray-600 mb-8">
            Sorry, you don't have permission to access this page.
            {session?.user?.role && (
              <span className="block mt-2">
                Your role: <span className="font-semibold">{session.user.role.replace('_', ' ')}</span>
              </span>
            )}
          </p>
          
          <div className="space-y-4">
            {session?.user?.role === 'DOG_OWNER' && (
              <>
                <Link href="/fields/search">
                  <button className="w-full py-3 px-4 rounded-full bg-green text-white font-medium hover:opacity-90 transition-opacity">
                    Search Fields
                  </button>
                </Link>
                <Link href="/user/my-bookings">
                  <button className="w-full py-3 px-4 rounded-full border-2 border-green text-green font-medium hover:bg-green hover:text-white transition-all">
                    My Bookings
                  </button>
                </Link>
              </>
             )}
            
             {session?.user?.role === 'FIELD_OWNER' && (
              <>
                <Link href="/">
                  <button className="w-full py-3 px-4 rounded-full bg-green text-white font-medium hover:opacity-90 transition-opacity">
                    Field Owner Dashboard
                  </button>
                </Link>
                <Link href="/">
                  <button className="w-full py-3 px-4 rounded-full border-2 border-green text-green font-medium hover:bg-green hover:text-white transition-all">
                    Add New Field
                  </button>
                </Link>
              </>
            )}
            
            <Link href="/">
              <button className="w-full py-3 px-4 rounded-full border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                Go to Homepage      
                
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}