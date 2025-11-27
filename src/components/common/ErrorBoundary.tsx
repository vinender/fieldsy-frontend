import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * ErrorBoundary component that catches JavaScript errors anywhere in the child
 * component tree and displays a fallback UI instead of crashing the whole app.
 *
 * This prevents Next.js Fast Refresh from triggering full page reloads on
 * recoverable errors.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development only
    if (process.env.NODE_ENV === 'development') {
      console.log('ErrorBoundary caught error:', error.message);
    }
    // You can also log the error to an error reporting service here
  }

  render() {
    if (this.state.hasError) {
      // Return custom fallback UI if provided, otherwise render children anyway
      // This prevents the error from propagating and causing a reload
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // In development, try to render children anyway to allow Fast Refresh to recover
      if (process.env.NODE_ENV === 'development') {
        // Reset error state after a short delay to allow recovery
        setTimeout(() => {
          this.setState({ hasError: false, error: undefined });
        }, 100);
        return this.props.children;
      }

      // In production, show a minimal error state
      return null;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
