import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

/**
 * Stripe Redirect Bridge Page
 *
 * This page serves as an intermediate redirect for mobile apps since Stripe
 * requires HTTPS URLs for return_url and refresh_url, but mobile apps use
 * custom URL schemes (com.fieldsy.app://).
 *
 * Flow:
 * 1. Stripe redirects here after onboarding: /stripe-redirect?status=success&type=mobile
 * 2. This page detects mobile and redirects to: com.fieldsy.app:///(field-owner)/manage-payouts?status=success
 * 3. Mobile app handles the deep link and updates UI
 */

const StripeRedirectPage = () => {
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { status, type } = router.query;

    // Wait for router to be ready
    if (!router.isReady) return;

    // Validate parameters
    if (!status || (status !== 'success' && status !== 'refresh')) {
      setError('Invalid redirect parameters');
      setRedirecting(false);
      return;
    }

    const isMobile = type === 'mobile';
    alert(JSON.stringify(window));

    
    if (isMobile) {
      // Mobile redirect: Use deep link
      const deepLink = `com.fieldsy.app:///(field-owner)/manage-payouts?status=${status}`;
       
      // Try to open deep link
      window.location.href = deepLink;

      // Show fallback message after a delay in case app didn't open
      setTimeout(() => {
        setRedirecting(false);
      }, 2000);
    } else {
      // Web redirect: Navigate to payouts page
      const webPath = `/field-owner/payouts?${status}=true`;
      router.push(webPath);
    }
  }, [router.isReady, router.query]);

  const handleManualRedirect = () => {
    const { status } = router.query;
    const deepLink = `com.fieldsy.app:///(field-owner)/manage-payouts?status=${status}`;
    window.location.href = deepLink;
  };

  return (
    <>
      <Head>
        <title>Redirecting to Fieldsy - Fieldsy</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className={`min-h-screen bg-gray-50 flex items-center justify-center px-4 ${redirecting ? 'cursor-wait' : ''}`}>
        <div className={`max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center ${redirecting ? 'pointer-events-none' : ''}`}>
          {redirecting ? (
            <>
              <div className="mb-6">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Redirecting to Fieldsy
              </h1>
              <p className="text-gray-600 mb-6">
                Please wait while we redirect you back to the app...
              </p>
            </>
          ) : error ? (
            <>
              <div className="mb-6">
                <svg
                  className="h-16 w-16 text-red-500 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Redirect Error
              </h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Go to Home
              </button>
            </>
          ) : (
            <>
              <div className="mb-6">
                <svg
                  className="h-16 w-16 text-green-500 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Stripe Setup Complete
              </h1>
              <p className="text-gray-600 mb-6">
                If the app didn&apos;t open automatically, tap the button below:
              </p>
              <button
                onClick={handleManualRedirect}
                className="inline-flex items-center px-6 py-3 border border-transparent text-white font-[600] border-green bg-green/50 font-medium rounded-md bg-green-600 hover:bg-green-700 mb-4 w-full justify-center"
              >
                Open Fieldsy App
              </button>
              <p className="text-sm text-gray-500">
                Or{' '}
                <button
                  onClick={() => router.push('/')}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  return to website
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default StripeRedirectPage;
