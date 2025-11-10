import { useEffect } from "react"
import { useRouter } from "next/router"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import RegisterForm from "@/components/forms/auth/RegisterForm"

export default function SignUpPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  // Redirect logged-in users - go back or to their dashboard
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Check if there's history to go back to
      if (window.history.length > 1 && document.referrer) {
        // Go back to previous page
        router.back();
      } else {
        // No history, redirect to role-specific dashboard
        const role = session.user.role;
        let redirectPath = '/';

        if (role === 'ADMIN') {
          redirectPath = '/admin/dashboard';
        } else if (role === 'FIELD_OWNER') {
          redirectPath = '/field-owner/my-fields';
        } else if (role === 'DOG_OWNER') {
          redirectPath = '/user/my-bookings';
        }

        router.replace(redirectPath);
      }
      return;
    }
  }, [status, session, router])

  useEffect(() => {
    // Check if there's an error from NextAuth (like duplicate account)
    if (router.query.error) {
      const error = router.query.error as string;

      // Check for specific error types
      if (error.includes('An account already exists with this email as a')) {
        // Extract the role from the error message for a clearer toast
        const roleMatch = error.match(/as a ([^.]+)/);
        const existingRole = roleMatch ? roleMatch[1] : 'different role';
        toast.error(`An account already exists with this email. Each email can only have one account.`);
      } else if (error === 'OAuthAccountNotLinked') {
        toast.error('This email is already registered with a different sign-up method.');
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
          toast.error('Sign up failed. The email may already be registered with a different role.');
        }
      } else if (error === 'Configuration') {
        toast.error('Social sign-up is not configured yet.');
      } else {
        toast.error('Sign up failed. Please try again.');
      }

      // Remove the error query param
      const { error: _, ...rest } = router.query
      router.replace({
        pathname: router.pathname,
        query: rest
      }, undefined, { shallow: true })
    }
  }, [router])

  return <RegisterForm />
}
