import { useEffect } from "react"
import { useRouter } from "next/router"
import { toast } from "sonner"
import { LoginForm } from "@/components/forms/auth/LoginForm"

export default function LoginPage() {
  const router = useRouter()
  
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
  
  return <LoginForm />
}