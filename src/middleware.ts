import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Add custom logic here if needed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        
        // Public paths that don't require authentication
        const publicPaths = [
          "/",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/about",
          "/how-it-works",
          "/faqs",
          "/privacy-policy",
          "/terms-conditions",
        ];
        
        // Check if the path is public
        const isPublicPath = publicPaths.some(publicPath => 
          path === publicPath || path.startsWith(`${publicPath}/`)
        );
        
        if (isPublicPath) {
          return true;
        }
        
        // Protected paths that require authentication
        const protectedPaths = [
          "/dashboard",
          "/profile",
          "/fields/claim-field-form",
          "/bookings",
          "/messages",
          "/settings",
        ];
        
        // Check if the path is protected
        const isProtectedPath = protectedPaths.some(protectedPath => 
          path === protectedPath || path.startsWith(`${protectedPath}/`)
        );
        
        if (isProtectedPath) {
          return !!token;
        }
        
        // Allow all other paths
        return true;
      },
    },
    pages: {
      signIn: "/login",
      error: "/login",
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match only specific protected paths
     */
    "/dashboard/:path*",
    "/profile/:path*",
    "/bookings/:path*",
    "/messages/:path*",
    "/settings/:path*",
  ],
};