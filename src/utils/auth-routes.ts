/**
 * Authentication route utilities
 * Centralized logic for determining public vs protected routes
 */

// Routes that don't require authentication
export const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-otp',
  '/about',
  '/how-it-works',
  '/faqs',
  '/privacy-policy',
  '/terms-conditions',
  '/unauthorized',
  '/fields', // Public field search/listing
];

// Routes that always require authentication
export const PROTECTED_ROUTES = [
  '/user',
  '/field-owner',
  '/admin',
  '/fields/add-field',
  '/fields/book-field',
];

// Routes that require specific roles
export const ROLE_RESTRICTED_ROUTES = {
  ADMIN: ['/admin'],
  FIELD_OWNER: ['/field-owner', '/fields/add-field'],
  USER: ['/user'],
};

/**
 * Check if a given path is a public route
 */
export function isPublicRoute(pathname: string): boolean {
  // Exact match for public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    return true;
  }
  
  // Special cases
  // Allow claiming fields without auth
  if (pathname.startsWith('/fields/claim-field-form')) {
    return true;
  }
  
  // Individual field pages are public (e.g., /fields/123)
  if (pathname.startsWith('/fields/') && pathname.split('/').length === 3) {
    // Check if it's not a protected sub-route
    const isProtectedFieldRoute = PROTECTED_ROUTES.some(route => 
      pathname.startsWith(route)
    );
    return !isProtectedFieldRoute;
  }
  
  return false;
}

/**
 * Check if a given path is a protected route
 */
export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Check if a given path requires a specific role
 */
export function getRequiredRole(pathname: string): string | null {
  if (pathname.startsWith('/admin')) {
    return 'ADMIN';
  }
  
  if (pathname.startsWith('/field-owner') || pathname === '/fields/add-field') {
    return 'FIELD_OWNER';
  }
  
  if (pathname.startsWith('/user')) {
    return 'USER';
  }
  
  return null;
}

/**
 * Check if user has access to a route based on their role
 */
export function hasRoleAccess(pathname: string, userRole: string | null): boolean {
  if (!userRole) return false;
  
  const requiredRole = getRequiredRole(pathname);
  
  if (!requiredRole) {
    // No specific role required
    return true;
  }
  
  // Admin has access to everything
  if (userRole === 'ADMIN') {
    return true;
  }
  
  // Check if user has the required role
  return userRole === requiredRole;
}