// Suppress specific development errors in Next.js
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  const originalWarn = console.warn;

  // Suppress console.error messages
  console.error = (...args) => {
    const errorString = args.join(' ');

    // Suppress axios errors handled by mutation hooks
    if (
      errorString.includes('AxiosError') &&
      (errorString.includes('409') ||
        errorString.includes('403') ||
        errorString.includes('401') ||
        errorString.includes('400'))
    ) {
      return;
    }

    // Suppress unhandled promise rejection warnings for handled errors
    if (errorString.includes('Unhandled Runtime Error') && errorString.includes('AxiosError')) {
      return;
    }

    // Suppress Next.js image optimization errors
    if (
      errorString.includes('The requested resource') &&
      errorString.includes("isn't a valid image")
    ) {
      return;
    }

    // Suppress image errors
    if (
      errorString.includes('received null') ||
      errorString.includes('Failed to load') ||
      errorString.includes('Image is missing')
    ) {
      return;
    }

    // Suppress stylesheet errors
    if (
      errorString.includes('Unable to locate stylesheet') ||
      errorString.includes('.next/static/css') ||
      errorString.includes('pages/_app.css')
    ) {
      return;
    }

    // Suppress next-auth client fetch errors - THIS IS KEY FOR PREVENTING RELOADS
    if (
      errorString.includes('[next-auth]') ||
      errorString.includes('CLIENT_FETCH_ERROR') ||
      errorString.includes('next-auth.js.org/errors') ||
      errorString.includes('/api/auth/session') ||
      (errorString.includes('NetworkError') && errorString.includes('fetch'))
    ) {
      return;
    }

    // Suppress URL constructor errors
    if (
      errorString.includes('URL constructor') ||
      errorString.includes('is not a valid URL')
    ) {
      return;
    }

    // Call original console.error for other errors
    originalError.apply(console, args);
  };

  // Suppress console.warn messages
  console.warn = (...args) => {
    const warnString = args.join(' ');

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

    // Call original console.warn for other warnings
    originalWarn.apply(console, args);
  };

  // Prevent window errors from triggering reloads
  const originalOnError = window.onerror;
  window.onerror = function (message, source, lineno, colno, error) {
    const messageString = String(message);

    // Suppress next-auth errors
    if (
      messageString.includes('next-auth') ||
      messageString.includes('CLIENT_FETCH_ERROR') ||
      messageString.includes('/api/auth/session')
    ) {
      return true; // Prevent default error handling (which can cause reload)
    }

    // Suppress stylesheet and image errors
    if (
      messageString.includes('stylesheet') ||
      messageString.includes("isn't a valid image") ||
      messageString.includes('URL constructor')
    ) {
      return true;
    }

    if (originalOnError) {
      return originalOnError.call(window, message, source, lineno, colno, error);
    }
    return false;
  };

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', function (event) {
    const reason = String(event.reason);

    // Suppress next-auth errors
    if (
      reason.includes('next-auth') ||
      reason.includes('CLIENT_FETCH_ERROR') ||
      reason.includes('NetworkError') ||
      reason.includes('/api/auth/session')
    ) {
      event.preventDefault();
      return;
    }

    // Suppress stylesheet/image errors
    if (
      reason.includes('stylesheet') ||
      reason.includes("isn't a valid image") ||
      reason.includes('URL constructor')
    ) {
      event.preventDefault();
      return;
    }
  });
}

export {};
