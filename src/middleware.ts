import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Public paths that don't require authentication
  const publicPaths = [
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
    "/fields", // Public field listing and search
    "/fields/claim-field-form", // Allow claiming fields without auth
  ];
  
  // Protected paths that require authentication
  const protectedPaths = [
    "/user",
    "/field-owner",
    "/admin",
    "/fields/add-field",
    "/fields/book-field",
  ];
  
  // Check if the path is public
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || (publicPath !== "/" && path.startsWith(`${publicPath}/`))
  );
  
  // If public path, allow access
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // Check if path is protected
  const isProtectedPath = protectedPaths.some(protectedPath =>
    path.startsWith(protectedPath)
  );
  
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
        return NextResponse.redirect(url);
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