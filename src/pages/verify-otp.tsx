import { useEffect } from "react"
import { useRouter } from "next/router"
import { useSession } from "next-auth/react"
import OTPVerificationForm from "@/components/forms/auth/OTPVerificationForm"

export default function VerifyOTPPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  // Redirect logged-in users - use callbackUrl, go back, or to their dashboard
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // If callbackUrl is provided (e.g. from booking flow), redirect there
      const callbackUrl = router.query.callbackUrl as string;
      if (callbackUrl) {
        router.replace(callbackUrl);
        return;
      }

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

  return <OTPVerificationForm />
}
