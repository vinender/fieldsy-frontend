import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
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
  
  // Check if the path is public
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || (publicPath !== "/" && path.startsWith(`${publicPath}/`))
  );
  
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // For protected routes, we'll let the page handle auth check
  // This prevents the redirect loop with NextAuth
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