import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Pre-compile path sets for O(1) lookup performance
const PUBLIC_PATHS = new Set([
  "/",
  "/about",
  "/how-it-works",
  "/faqs",
  "/privacy-policy",
  "/terms-conditions",
  "/unauthorized",
]);

// Auth pages that logged-in users should not access
const AUTH_ONLY_PATHS = new Set([
  "/login",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/verify-otp",
]);

const PUBLIC_PATH_PREFIXES = [
  "/fields/book-field", // Book field page - allows unauthorized users to browse slots
  "/fields", // Public field listing
  "/api/public", // Public API routes
];

const PROTECTED_PATH_PREFIXES = [
  "/user",
  "/field-owner",
  "/admin",
  "/fields/add-field",
  // Note: /fields/book-field is intentionally NOT protected
  // Unauthorized users can browse and select time slots
  // Login prompt is shown when they click "Continue" button
];

// Cache for path checks to avoid repeated computations
// Note: Cache is disabled in development to ensure changes take effect immediately
const pathCache = new Map<string, boolean>();

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Clear cache in development to ensure middleware changes take effect
  if (process.env.NODE_ENV === 'development') {
    pathCache.clear();
  }

  // Early return for static assets and API routes (except auth)
  if (path.startsWith('/_next/') || path.startsWith('/api/') && !path.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Live Site Check
  const hostname = request.headers.get('host') || '';
  const isTargetHost = hostname === 'fieldsy.co.uk' || hostname === 'www.fieldsy.co.uk' || hostname.includes('localhost:3000');

  if (isTargetHost && !path.startsWith('/api/') && !path.startsWith('/_next/') && !path.includes('.')) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const settingsRes = await fetch(`${apiUrl}/settings/public`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': request.headers.get('x-forwarded-for') || '',
        },
      });

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        const isLive = settingsData.data?.isLive;
        const hasAccess = settingsData.data?.hasAccess;

        // If site is not live and IP is not whitelisted
        if (isLive === false && !hasAccess) {
          // If the user is NOT already on the index page, redirect them to it
          if (path !== '/') {
            return NextResponse.redirect(new URL('/', request.url));
          }
        }
      }
    } catch (error) {
      console.error('Middleware live check failed:', error);
    }
  }

  // Get the token for auth checks - Fetch early to handle role-based blocking on public routes
  let token;
  try {
    token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });
  } catch (error) {
    console.error('Error getting token in middleware:', error);
    token = null;
  }

  const tokenData = token as any;
  const userRole = tokenData?.role || tokenData?.user?.role;

  // BLOCK FIELD OWNERS FROM CONSUMER ROUTES
  // Field owners should not access public booking/search pages
  if (userRole === 'FIELD_OWNER') {
    if (path.startsWith('/fields')) {
      // Allowed paths for Field Owners within /fields
      // claim-field-form is for claiming fields
      // add-field is theoretically for adding fields (if used)
      const isAllowedPath = path.startsWith('/fields/claim-field-form') ||
        path === '/fields/add-field';

      if (!isAllowedPath) {
        // Redirect to dashboard
        return NextResponse.redirect(new URL('/field-owner/my-fields', request.url));
      }
    }
  }

  // EXPLICIT EARLY RETURN: Allow book-field page without ANY authentication checks for non-field owners
  // This ensures unauthenticated users (and Dog Owners) can access
  if (path.startsWith('/fields/book-field')) {
    return NextResponse.next();
  }

  // Payment page protection - Strictly for Authenticated Users (Dog Owners/Admin)
  // Field Owners are already blocked by the rule above
  if (path.startsWith('/fields/payment')) {
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', path);
      return NextResponse.redirect(url);
    }
  }

  // Check if this is an auth-only page (login, signup, etc.)
  const isAuthOnlyPath = AUTH_ONLY_PATHS.has(path);

  // If user is logged in and trying to access auth-only pages, redirect them
  if (isAuthOnlyPath && token) {
    // Get referer to check where the user came from
    const referer = request.headers.get('referer');
    let redirectPath = '/';

    // If there's a referer from the same origin, redirect back to it
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        const requestUrl = new URL(request.url);

        // Check if referer is from the same origin and not an auth page
        if (refererUrl.origin === requestUrl.origin) {
          const refererPath = refererUrl.pathname;
          // Don't redirect back to another auth page
          if (!AUTH_ONLY_PATHS.has(refererPath)) {
            redirectPath = refererPath;
          } else {
            // Redirect to role-specific dashboard if coming from auth page
            if (userRole === 'ADMIN') {
              redirectPath = '/admin/dashboard';
            } else if (userRole === 'FIELD_OWNER') {
              redirectPath = '/field-owner/my-fields';
            } else if (userRole === 'DOG_OWNER') {
              redirectPath = '/user/my-bookings';
            }
          }
        } else {
          // External referer, go to dashboard
          if (userRole === 'ADMIN') {
            redirectPath = '/admin/dashboard';
          } else if (userRole === 'FIELD_OWNER') {
            redirectPath = '/field-owner/my-fields';
          } else if (userRole === 'DOG_OWNER') {
            redirectPath = '/user/my-bookings';
          }
        }
      } catch (e) {
        // Invalid referer URL, use default dashboard
        if (userRole === 'ADMIN') {
          redirectPath = '/admin/dashboard';
        } else if (userRole === 'FIELD_OWNER') {
          redirectPath = '/field-owner/my-fields';
        } else if (userRole === 'DOG_OWNER') {
          redirectPath = '/user/my-bookings';
        }
      }
    } else {
      // No referer, redirect to dashboard
      if (userRole === 'ADMIN') {
        redirectPath = '/admin/dashboard';
      } else if (userRole === 'FIELD_OWNER') {
        redirectPath = '/field-owner/my-fields';
      } else if (userRole === 'DOG_OWNER') {
        redirectPath = '/user/my-bookings';
      }
    }

    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // Check cache first for public paths
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

    // Role checks already performed via tokenData variable above, but needed for specific logic below

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

    // User/Dog Owner routes
    if (path.startsWith('/user')) {
      // Shared routes that Field Owners can access
      const isSharedRoute =
        path.startsWith('/user/profile') ||
        path.startsWith('/user/messages');

      if (isSharedRoute) {
        // Shared routes accessible by DOG_OWNER, FIELD_OWNER, and ADMIN
        if (userRole !== 'DOG_OWNER' && userRole !== 'FIELD_OWNER' && userRole !== 'ADMIN') {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
      } else {
        // Pure Dog Owner routes (my-bookings, saved-fields, etc)
        // Strictly for DOG_OWNER and ADMIN
        if (userRole !== 'DOG_OWNER' && userRole !== 'ADMIN') {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
      }
    }

    // Field creation route - only for field owners
    if (path === '/fields/add-field') {
      if (userRole !== 'FIELD_OWNER' && userRole !== 'ADMIN') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
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