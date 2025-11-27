// Suppress specific development errors in Next.js
// This module runs after initial hydration to avoid interfering with Fast Refresh
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Helper to check if error should be suppressed
  const shouldSuppressError = (errorString: string): boolean => {
    // Suppress axios errors handled by mutation hooks
    if (
      errorString.includes('AxiosError') &&
      (errorString.includes('409') ||
        errorString.includes('403') ||
        errorString.includes('401') ||
        errorString.includes('400'))
    ) {
      return true;
    }

    // Suppress unhandled promise rejection warnings for handled errors
    if (errorString.includes('Unhandled Runtime Error') && errorString.includes('AxiosError')) {
      return true;
    }

    // Suppress Next.js image optimization errors
    if (
      errorString.includes('The requested resource') &&
      errorString.includes("isn't a valid image")
    ) {
      return true;
    }

    // Suppress image errors
    if (
      errorString.includes('received null') ||
      errorString.includes('Failed to load') ||
      errorString.includes('Image is missing')
    ) {
      return true;
    }

    // Suppress stylesheet errors
    if (
      errorString.includes('Unable to locate stylesheet') ||
      errorString.includes('.next/static/css') ||
      errorString.includes('pages/_app.css')
    ) {
      return true;
    }

    // Suppress webpack hot-update 404 errors
    if (
      errorString.includes('webpack.hot-update.json') ||
      errorString.includes('hot-update.json 404')
    ) {
      return true;
    }

    // Suppress next-auth client fetch errors
    if (
      errorString.includes('[next-auth]') ||
      errorString.includes('CLIENT_FETCH_ERROR') ||
      errorString.includes('next-auth.js.org/errors') ||
      errorString.includes('/api/auth/session') ||
      (errorString.includes('NetworkError') && errorString.includes('fetch'))
    ) {
      return true;
    }

    // Suppress URL constructor errors
    if (
      errorString.includes('URL constructor') ||
      errorString.includes('is not a valid URL')
    ) {
      return true;
    }

    // Suppress hydration errors that shouldn't cause reload
    if (
      errorString.includes('Hydration failed') ||
      errorString.includes('hydration mismatch') ||
      errorString.includes('server-rendered HTML') ||
      errorString.includes('Text content does not match')
    ) {
      return true;
    }

    // Suppress socket.io connection errors
    if (
      errorString.includes('socket.io') ||
      errorString.includes('WebSocket') ||
      errorString.includes('ECONNREFUSED')
    ) {
      return true;
    }

    return false;
  };

  // Override console methods immediately but carefully
  const originalError = console.error;
  const originalWarn = console.warn;

  // Suppress console.error messages
  console.error = (...args) => {
    const errorString = args.map(a => String(a)).join(' ');
    if (shouldSuppressError(errorString)) {
      return;
    }
    originalError.apply(console, args);
  };

  // Suppress console.warn messages
  console.warn = (...args) => {
    const warnString = args.map(a => String(a)).join(' ');

    // Suppress stylesheet warnings
    if (
      warnString.includes('Unable to locate stylesheet') ||
      warnString.includes('.next/static/css')
    ) {
      return;
    }

    // Suppress Next.js Image warnings
    if (
      (warnString.includes('Image with src') && warnString.includes('sizes')) ||
      warnString.includes('Please add it to improve page performance')
    ) {
      return;
    }

    // Suppress Fast Refresh full reload warnings (informational only)
    if (warnString.includes('Fast Refresh had to perform a full reload')) {
      return;
    }

    // Suppress hydration warnings
    if (
      warnString.includes('Hydration') ||
      warnString.includes('hydration') ||
      warnString.includes('server-rendered')
    ) {
      return;
    }

    originalWarn.apply(console, args);
  };

  // Prevent window errors from triggering Next.js error overlay
  window.addEventListener(
    'error',
    function (event) {
      const messageString = String(event.message || '');
      const filenameString = String(event.filename || '');

      // Check if this is an error we want to suppress
      if (
        messageString.includes('next-auth') ||
        messageString.includes('CLIENT_FETCH_ERROR') ||
        messageString.includes('/api/auth/session') ||
        messageString.includes('stylesheet') ||
        messageString.includes("isn't a valid image") ||
        messageString.includes('URL constructor') ||
        messageString.includes('hot-update') ||
        messageString.includes('Hydration') ||
        messageString.includes('hydration') ||
        messageString.includes('socket') ||
        messageString.includes('WebSocket') ||
        // Suppress errors from node_modules
        filenameString.includes('node_modules') ||
        // Suppress errors from Next.js internals
        filenameString.includes('_next')
      ) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    },
    true
  ); // Use capture phase

  // Handle unhandled promise rejections
  window.addEventListener(
    'unhandledrejection',
    function (event) {
      const reason = String(event.reason || '');

      if (
        reason.includes('next-auth') ||
        reason.includes('CLIENT_FETCH_ERROR') ||
        reason.includes('NetworkError') ||
        reason.includes('/api/auth/session') ||
        reason.includes('stylesheet') ||
        reason.includes("isn't a valid image") ||
        reason.includes('URL constructor') ||
        reason.includes('hot-update') ||
        reason.includes('socket') ||
        reason.includes('WebSocket') ||
        reason.includes('AxiosError') ||
        reason.includes('Hydration')
      ) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    },
    true
  ); // Use capture phase

  // Monkey-patch Next.js error recovery to prevent full page reloads
  // This intercepts the Next.js Fast Refresh error reporting
  if (typeof (window as any).__NEXT_DATA__ !== 'undefined') {
    const originalOnError = (window as any).onerror;
    (window as any).onerror = function (
      message: string,
      source: string,
      lineno: number,
      colno: number,
      error: Error
    ) {
      const messageStr = String(message || '');
      const sourceStr = String(source || '');

      // Suppress specific errors that shouldn't trigger reload
      if (
        messageStr.includes('Hydration') ||
        messageStr.includes('hydration') ||
        messageStr.includes('socket') ||
        messageStr.includes('next-auth') ||
        sourceStr.includes('node_modules') ||
        sourceStr.includes('_next')
      ) {
        return true; // Prevent default error handling
      }

      if (originalOnError) {
        return originalOnError(message, source, lineno, colno, error);
      }
      return false;
    };
  }
}

export {};
