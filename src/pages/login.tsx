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
        toast.error('Social login is not configured yet.');
      } else if (error === 'OAuthSignin') {
        // OAuth sign-in error (often redirect URL issue)
        console.error('[Login] OAuthSignin error - likely redirect URL issue');
        toast.error('Apple Sign In failed. This may be a configuration issue with the redirect URL.');
      } else if (error === 'OAuthCallback') {
        // OAuth callback error
        console.error('[Login] OAuthCallback error');
        toast.error('Sign in callback failed. Please try again.');
      } else if (error === 'OAuthCreateAccount') {
        console.error('[Login] OAuthCreateAccount error');
        toast.error('Could not create account. This email may already be registered.');
      } else if (error === 'Callback') {
        console.error('[Login] General callback error');
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
            router.push(`/verify-otp?email=${encodeURIComponent(email)}&role=${role}&from=social-login`);
            return; // Skip toast
          }
        }

        toast.error(actualMessage || 'Sign in failed. Please try again.');
      } else {
        toast.error('Sign in failed. Please try again.');
      }

      // Remove the error and message query params
      const { error: _, message: __, ...rest } = router.query
      router.replace({
        pathname: router.pathname,
        query: rest
      }, undefined, { shallow: true })
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
      router.push(`/verify-otp?email=${encodeURIComponent(otpEmail)}&role=${otpRole || 'DOG_OWNER'}&from=social-login`)
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