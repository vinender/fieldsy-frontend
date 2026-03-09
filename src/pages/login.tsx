import { useEffect } from "react"
import { useRouter } from "next/router"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { LoginForm } from "@/components/forms/auth/LoginForm"
import { PageWithSkeleton } from "@/components/common/PageWithSkeleton"
import { LoginFormSkeleton } from "@/components/skeletons/PageSkeletons"

export default function LoginPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  // Redirect logged-in users to their role-specific dashboard or callbackUrl
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const role = session.user.role;

      // If role is not yet available, wait for it
      if (!role) return;

      // Check for callbackUrl in query params
      const callbackUrl = router.query.callbackUrl as string;

      // Redirect based on role - ADMIN always goes to admin dashboard
      if (role === 'ADMIN') {
        router.replace('/admin/dashboard');
      } else if (callbackUrl) {
        // If callbackUrl is provided, redirect there after login
        router.replace(callbackUrl);
      } else {
        // All other roles (FIELD_OWNER, DOG_OWNER) redirect to home
        router.replace('/');
      }
    }
  }, [status, session, router])

  useEffect(() => {
    // Log page load for debugging
    console.log('%c[Login Page] Mounted', 'background: #2196F3; color: white; padding: 2px 6px;');
    console.log('%c[Login Page] Current URL:', 'color: #2196F3;', window.location.href);
    console.log('%c[Login Page] Query params:', 'color: #2196F3;', router.query);

    // Check if redirected due to expired session
    if (router.query.expired === 'true') {
      toast.error('Your session has expired. Please login again.')
      // Remove the expired query param
      const { expired, ...rest } = router.query
      router.replace({
        pathname: router.pathname,
        query: rest
      }, undefined, { shallow: true })
    }

    // Check if there's an error from NextAuth (like duplicate account)
    if (router.query.error) {
      const error = router.query.error as string;
      const message = router.query.message as string;

      // Log the error prominently in browser console
      console.error('%c==================== OAUTH ERROR DETECTED ====================', 'background: #f44336; color: white; padding: 4px 8px; font-weight: bold;');
      console.error('%c[Login Page] Error type:', 'color: red; font-weight: bold;', error);
      console.error('%c[Login Page] Error message:', 'color: red;', message || 'No message provided');
      console.error('%c[Login Page] Full query params:', 'color: red;', JSON.stringify(router.query, null, 2));

      // Check for specific error types
      if (error === 'DuplicateAccount' && message) {
        // Decode and display the actual error message
        const decodedMessage = decodeURIComponent(message);
        if (decodedMessage.includes('An account already exists with this email as a')) {
          // Extract the role from the error message for a clearer toast
          const roleMatch = decodedMessage.match(/as a ([^.]+)/);
          const existingRole = roleMatch ? roleMatch[1] : 'different role';
          toast.error(`An account already exists with this email. Each email can only have one account.`);
        } else {
          toast.error(decodedMessage);
        }
      } else if (error.includes('An account already exists with this email as a')) {
        // Fallback: Extract the role from the error message for a clearer toast
        const roleMatch = error.match(/as a ([^.]+)/);
        const existingRole = roleMatch ? roleMatch[1] : 'different role';
        toast.error(`An account already exists with this email. Each email can only have one account.`);
      } else if (error === 'OAuthAccountNotLinked') {
        toast.error('This email is already registered with a different sign-in method.');
      } else if (error === 'AccessDenied') {
        // Check for error message in cookie
        const cookies = document.cookie.split(';');
        const errorCookie = cookies.find(c => c.trim().startsWith('authErrorMessage='));

        if (errorCookie) {
          const errorMessage = decodeURIComponent(errorCookie.split('=')[1]);
          // Clear the cookie
          document.cookie = 'authErrorMessage=; Path=/; Max-Age=0';

          if (errorMessage.includes('An account already exists with this email as a')) {
            const roleMatch = errorMessage.match(/as a ([^.]+)/);
            const existingRole = roleMatch ? roleMatch[1] : 'different role';
            toast.error(`An account already exists with this email. Each email can only have one account.`);
          } else {
            toast.error(errorMessage);
          }
        } else {
          toast.error('Sign in failed. The email may already be registered with a different role.');
        }
      } else if (error === 'Configuration') {
        console.error('%c[Login Page] Configuration error - Provider not properly configured', 'color: orange; font-weight: bold;');
        toast.error('Social login is not configured yet.');
      } else if (error === 'OAuthSignin') {
        // OAuth sign-in error (often redirect URL issue)
        console.error('%c[Login Page] OAuthSignin error - OAuth provider rejected the sign-in request', 'background: orange; color: black; padding: 2px 6px; font-weight: bold;');
        console.error('%c[Login Page] This usually means:', 'color: orange;');
        console.error('%c  - Invalid redirect URL configured in Apple/Google console', 'color: orange;');
        console.error('%c  - Missing or invalid client ID', 'color: orange;');
        console.error('%c  - Provider configuration mismatch', 'color: orange;');
        toast.error('Social Sign In failed. This may be a configuration issue.');
      } else if (error === 'OAuthCallback') {
        // OAuth callback error
        console.error('%c[Login Page] OAuthCallback error - Callback from OAuth provider failed', 'background: orange; color: black; padding: 2px 6px; font-weight: bold;');
        console.error('%c[Login Page] This usually means:', 'color: orange;');
        console.error('%c  - Token verification failed', 'color: orange;');
        console.error('%c  - Backend social-login API call failed', 'color: orange;');
        console.error('%c  - Session creation failed', 'color: orange;');
        toast.error('Sign in callback failed. Please try again.');
      } else if (error === 'OAuthCreateAccount') {
        console.error('%c[Login Page] OAuthCreateAccount error - Could not create user account', 'background: orange; color: black; padding: 2px 6px; font-weight: bold;');
        console.error('%c[Login Page] This usually means:', 'color: orange;');
        console.error('%c  - Email already exists with different provider', 'color: orange;');
        console.error('%c  - Backend user creation failed', 'color: orange;');
        toast.error('Could not create account. This email may already be registered.');
      } else if (error === 'Callback') {
        console.error('%c[Login Page] General Callback error', 'background: orange; color: black; padding: 2px 6px; font-weight: bold;');
        console.error('%c[Login Page] Check network tab for failed API calls', 'color: orange;');
        toast.error('Sign in failed during callback. Please try again.');
      } else if (error.startsWith('AccessDenied:')) {
        // Extract the actual error message from the error string
        const actualMessage = error.substring('AccessDenied:'.length);

        // Check for OTP verification requirement
        if (actualMessage.startsWith('REQUIRES_OTP_VERIFICATION')) {
          const parts = actualMessage.split('|');
          if (parts.length >= 3) {
            const email = parts[1];
            const role = parts[2];
            const cbUrl = router.query.callbackUrl ? `&callbackUrl=${encodeURIComponent(router.query.callbackUrl as string)}` : '';
            router.push(`/verify-otp?email=${encodeURIComponent(email)}&role=${role}&from=social-login${cbUrl}`);
            return; // Skip toast
          }
        }

        toast.error(actualMessage || 'Sign in failed. Please try again.');
      } else {
        console.error('%c[Login Page] Unknown error type:', 'color: red; font-weight: bold;', error);
        toast.error('Sign in failed. Please try again.');
      }

      console.error('%c==================== END OAUTH ERROR ====================', 'background: #f44336; color: white; padding: 4px 8px; font-weight: bold;');

      // Remove the error and message query params
      const { error: _, message: __, ...rest } = router.query
      router.replace({
        pathname: router.pathname,
        query: rest
      }, undefined, { shallow: true })
    }

    // Check for auth error cookies (set by social-login API)
    const cookies = document.cookie.split(';');
    const authErrorCookie = cookies.find(c => c.trim().startsWith('authErrorMessage='));
    if (authErrorCookie && !router.query.error) {
      const errorMessage = decodeURIComponent(authErrorCookie.split('=')[1]);
      console.error('%c[Login Page] Found authErrorMessage cookie:', 'color: orange;', errorMessage);
      // Cookie will be handled by the AccessDenied case above if present
    }

    // Check if social login requires OTP verification
    const requiresOtpVerification = sessionStorage.getItem('requiresOtpVerification')
    const otpEmail = sessionStorage.getItem('otpEmail')
    const otpRole = sessionStorage.getItem('otpRole')
    const otpType = sessionStorage.getItem('otpType')

    if (requiresOtpVerification === 'true' && otpEmail && otpType === 'social-login') {
      // Clear session storage
      sessionStorage.removeItem('requiresOtpVerification')
      sessionStorage.removeItem('otpEmail')
      sessionStorage.removeItem('otpRole')
      sessionStorage.removeItem('otpType')

      // Redirect to OTP verification page
      const cbUrl2 = router.query.callbackUrl ? `&callbackUrl=${encodeURIComponent(router.query.callbackUrl as string)}` : '';
      router.push(`/verify-otp?email=${encodeURIComponent(otpEmail)}&role=${otpRole || 'DOG_OWNER'}&from=social-login${cbUrl2}`)
    }

    // Check if there's a return URL stored in sessionStorage
    const returnUrl = sessionStorage.getItem('returnUrl')
    if (returnUrl && !router.query.callbackUrl) {
      // Add it as callbackUrl for post-login redirect
      router.replace({
        pathname: router.pathname,
        query: { ...router.query, callbackUrl: returnUrl }
      }, undefined, { shallow: true })
      sessionStorage.removeItem('returnUrl')
    }
  }, [router])

  return (
    <PageWithSkeleton skeleton={<LoginFormSkeleton />}>
      <LoginForm />
    </PageWithSkeleton>
  )
}