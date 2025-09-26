import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Pre-compile path sets for O(1) lookup performance
const PUBLIC_PATHS = new Set([
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-otp",
  "/about",
  "/how-it-works",
  "/faqs",
  "/privacy-policy",
  "/terms-conditions",
  "/unauthorized",
]);

const PUBLIC_PATH_PREFIXES = [
  "/fields", // Public field listing
  "/api/public", // Public API routes
];

const PROTECTED_PATH_PREFIXES = [
  "/user",
  "/field-owner",
  "/admin",
  "/fields/add-field",
  "/fields/book-field",
];

// Cache for path checks to avoid repeated computations
const pathCache = new Map<string, boolean>();

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Early return for static assets and API routes (except auth)
  if (path.startsWith('/_next/') || path.startsWith('/api/') && !path.startsWith('/api/auth')) {
    return NextResponse.next();
  }
  
  // Check cache first
  const cachedPublic = pathCache.get(`public:${path}`);
  if (cachedPublic !== undefined) {
    if (cachedPublic) return NextResponse.next();
  }
  
  // Fast path check for public routes
  const isPublicPath = PUBLIC_PATHS.has(path) || 
    PUBLIC_PATH_PREFIXES.some(prefix => path.startsWith(prefix));
  
  if (isPublicPath) {
    pathCache.set(`public:${path}`, true);
    return NextResponse.next();
  }
  
  // Check if path is protected
  const isProtectedPath = PROTECTED_PATH_PREFIXES.some(prefix => path.startsWith(prefix));
  
  if (isProtectedPath) {
    try {
      // Get the token
      const token = await getToken({ 
        req: request, 
        secret: process.env.NEXTAUTH_SECRET 
      });
      
      // If no token, redirect to login
      if (!token) {
        const url = new URL('/login', request.url);
        url.searchParams.set('callbackUrl', path);
        // Use temporary redirect (307) in development, permanent (308) in production
        return NextResponse.redirect(url, { 
          status: process.env.NODE_ENV === 'production' ? 308 : 307 
        });
      }
      
      // Check if token has exp claim and if it's expired
      const tokenData = token as any;
      if (tokenData.exp) {
        const now = Math.floor(Date.now() / 1000);
        if (now >= tokenData.exp) {
          // Token has expired
          console.log('Token expired in middleware, redirecting to login');
          const url = new URL('/login', request.url);
          url.searchParams.set('callbackUrl', path);
          url.searchParams.set('expired', 'true');
          
          // Clear the session cookie
          const response = NextResponse.redirect(url);
          response.cookies.delete('next-auth.session-token');
          response.cookies.delete('__Secure-next-auth.session-token');
          return response;
        }
      }
      
      // Check role-based access
      const userRole = tokenData.role || tokenData.user?.role;
      
      // Admin routes
      if (path.startsWith('/admin') && userRole !== 'ADMIN') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      
      // Field owner routes
      if (path.startsWith('/field-owner')) {
        if (userRole !== 'FIELD_OWNER' && userRole !== 'ADMIN') {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
      }
      
      // Field creation route - only for field owners
      if (path === '/fields/add-field') {
        if (userRole !== 'FIELD_OWNER' && userRole !== 'ADMIN') {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
      }
    } catch (error) {
      console.error('Error checking authentication in middleware:', error);
      // On error, redirect to login
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', path);
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) except api/auth which needs middleware
     * - _next/static (static files)
     * - _next/image (image optimization files)  
     * - favicon.ico (favicon file)
     * - Files with extensions (images, fonts, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|otf)).*)',
  ],
};