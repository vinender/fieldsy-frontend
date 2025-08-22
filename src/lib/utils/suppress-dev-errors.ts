// Suppress specific development errors in Next.js
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  
  console.error = (...args) => {
    // Check if this is an AxiosError that we're handling
    const errorString = args.join(' ');
    
    // Suppress specific axios errors that are being handled by our mutation hooks
    if (
      errorString.includes('AxiosError') && 
      (errorString.includes('409') || 
       errorString.includes('403') || 
       errorString.includes('401') ||
       errorString.includes('400'))
    ) {
      // Don't log these errors as they're handled by our error handlers
      return;
    }
    
    // Suppress unhandled promise rejection warnings for handled errors
    if (errorString.includes('Unhandled Runtime Error') && errorString.includes('AxiosError')) {
      return;
    }
    
    // Call original console.error for other errors
    originalError.apply(console, args);
  };
}

export {};