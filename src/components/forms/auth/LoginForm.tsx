import { useState } from "react"
import { useResponsiveRouter } from "@/hooks/useResponsiveRouter"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageGrid } from "@/components/forms/ImageGrid"
import { RoleSelectionModal } from "@/components/modal/RoleSelectionModal"
import Link from "next/link"
import Image from "next/image"
import { useLoginWithOtpCheck } from "@/hooks/mutations/useOtpMutations"
import { useStorePendingRole } from "@/hooks/mutations/useAuthMutations"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFormData = z.infer<typeof loginSchema>

// Prevent leading whitespace in inputs
const preventLeadingWhitespace = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const input = e.currentTarget;
  // Prevent space at the start of input or when input is empty
  if (e.key === ' ' && (input.value === '' || input.selectionStart === 0)) {
    e.preventDefault();
  }
};

export function LoginForm() {
  const router = useResponsiveRouter()
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isAppleLoading, setIsAppleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [pendingProvider, setPendingProvider] = useState<'google' | 'apple' | null>(null)

  // Use mutation for storing pending role
  const storePendingRoleMutation = useStorePendingRole()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  // Use the OTP login mutation hook
  const loginWithOtpCheckMutation = useLoginWithOtpCheck({
    onSuccess: async (result, variables) => {
      // Store token and user data
      if (result.data?.token) {
        localStorage.setItem('authToken', result.data.token);
        localStorage.setItem('currentUser', JSON.stringify(result.data.user));
      }

      // Login successful, use NextAuth for session management
      const signInResult = await signIn('credentials', {
        email: variables.email,
        token: result.data.token,
        redirect: false,
      });

      if (signInResult?.ok) {
        // Get the user's role from the login response
        const userRole = result.data?.user?.role;

        // Check for callback URL first (for protected route redirects)
        const callbackUrl = router.query.callbackUrl as string;

        // If there's a specific callback URL (not just '/'), use it
        if (callbackUrl && callbackUrl !== '/') {
          router.push(callbackUrl);
        } else {
          // Otherwise, redirect based on role
          let redirectPath = '/';
          if (userRole === 'ADMIN') {
            redirectPath = '/admin/dashboard';
          } else if (userRole === 'FIELD_OWNER') {
            redirectPath = '/field-owner/my-fields';
          } else if (userRole === 'DOG_OWNER') {
            redirectPath = '/user/my-bookings';
          }
          router.push(redirectPath);
        }
      } else {
        toast.error('Session creation failed. Please try again.');
      }
    }
    // NOTE: We intentionally DON'T override onError here
    // The mutation hook already handles error toast display
    // We handle special cases (like email verification redirect) in the catch block below
  });

  async function onSubmit(data: LoginFormData) {
    try {
      // Trim whitespace from inputs
      const trimmedEmail = data.email.trim();
      const trimmedPassword = data.password.trim();

      // Use the mutation to login with OTP check
      // Don't send role - the backend will return the user's role from database
      await loginWithOtpCheckMutation.mutateAsync({
        email: trimmedEmail,
        password: trimmedPassword,
      });
    } catch (error: any) {
      // The mutation hook's onError already displays toast messages for errors
      // Here we only handle special cases that require navigation
      const response = error?.response;

      // Check if email verification is required and redirect
      if (response?.status === 403 && response?.data?.data?.requiresVerification) {
        const email = response.data.data.email;
        const role = response.data.data.role;
        // Redirect to OTP verification page
        router.push(`/verify-otp?email=${encodeURIComponent(email)}&role=${role}&from=login`);
      }
      // All other errors are already shown as toast by the mutation hook
    }
  }

  // Handle role selection from modal
  async function handleRoleSelection(role: 'DOG_OWNER' | 'FIELD_OWNER') {
    console.log('[LoginForm] Starting social sign in - Provider:', pendingProvider, 'Role:', role);

    if (!pendingProvider) {
      console.error('[LoginForm] No pending provider set');
      return;
    }

    const isGoogle = pendingProvider === 'google';
    if (isGoogle) {
      setIsGoogleLoading(true);
    } else {
      setIsAppleLoading(true);
    }

    try {
      // Store the role for the callback to use
      localStorage.setItem('pendingUserRole', role);
      await storePendingRoleMutation.mutateAsync({ role });
      console.log('[LoginForm] Role stored, calling signIn for:', pendingProvider);

      // Use default redirect: true - let NextAuth handle the OAuth flow
      // Errors will come back as query params on the login page
      await signIn(pendingProvider, {
        callbackUrl: '/',
      });
      // Note: This won't return - browser will redirect to OAuth provider
    } catch (error: any) {
      console.error('[LoginForm] Sign in error:', error?.message);
      toast.error(`${isGoogle ? 'Google' : 'Apple'} login failed. Please try again.`);
      setShowRoleModal(false);
      setPendingProvider(null);
      setIsGoogleLoading(false);
      setIsAppleLoading(false);
    }
  }

  // Image grid data - center image (index 4) is special
  const images = [
    { src: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop", alt: "White fluffy dog" },
    { src: "https://images.unsplash.com/photo-1601758124096-1fd661873b95?w=300&h=300&fit=crop", alt: "Dog in field" },
    { src: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=300&fit=crop", alt: "Golden retriever puppies" },
    { src: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=300&h=300&fit=crop", alt: "Woman with white dog" },
    { src: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300&h=300&fit=crop", alt: "Happy dog", isCenter: true },
    { src: "https://images.unsplash.com/photo-1594149929911-78975a43d4f5?w=300&h=300&fit=crop", alt: "Woman with dog in field" },
    { src: "https://images.unsplash.com/photo-1591769225440-811ad7d6eab3?w=300&h=300&fit=crop", alt: "Happy dog closeup" },
    { src: "https://images.unsplash.com/photo-1560807707-8cc77767d783?w=300&h=300&fit=crop", alt: "Dogs playing" },
    { src: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=300&h=300&fit=crop", alt: "Dog in nature" }
  ]

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(179deg, #FFFCF3 0.83%, #F9F0D7 61.62%)' }}>
      {/* Left Section - Image Grid */}
      {/* <ImageGrid
        images={images}
        title="Fieldsy Makes Dog Walking Easy"
        description="Find secure fields nearby, book in seconds, and give your dog the off-lead freedom they deserve—all with peace of mind."
      /> */}
     <div className="hidden lg:block relative w-[50%] h-screen">
      <Image
        src="/login/loginbg.jpg"
        alt="Login Background"
        fill
        className="object-cover"
        priority
      />

      <div className="absolute bottom-0 pb-20 left-0 text-left w-full flex items-  p-6 ">
        <div className="w-full max-w-full text-left text-left ">
          <h1 className="text-3xl md:text-4xl font-bold text-green">
            Fieldsy Makes Dog Walking Easy
          </h1>
          <p className="text-gray-text text-[16px] leading-[24px] font-[400]  mt-2">
            Find secure fields nearby, book in seconds, and give your dog the
            off-lead freedom they deserve—all with peace of mind.
          </p>
        </div>
      </div>
    </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 lg:px-16">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/">
            <div className="text-left mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl md:text-3xl">🐾</span>
                <h1 className="text-3xl md:text-4xl font-bold text-green">Fieldsy</h1>
              </div>
            </div>
            </Link>

          {/* Welcome Text */}
          <div className="text-left mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Welcome Back to Fieldsy!
            </h2>
            <p className="text-gray-500 text-base">
              Use the same method that you created your account with.
            </p>
          </div>

          {/* Social Login Button - Original Design */}
          <div className="mb-6">
            <div className="w-full flex items-center justify-between p-1 rounded-[70px] text-white font-medium bg-light-green">
              <button
                type="button"
                className="w-14 h-14 rounded-full bg-green flex items-center justify-center hover:opacity-90 transition-opacity relative"
                disabled={isGoogleLoading || loginWithOtpCheckMutation.isLoading}
                onClick={() => {
                  setPendingProvider('google')
                  setShowRoleModal(true)
                }}
              >
                <Image src="/login/google.png" alt="Google" width={48} height={48} className={`object-contain ${isGoogleLoading ? 'opacity-50' : ''}`} />
              </button>
              <span className="text-center flex-1">Login with</span>
              <button
                type="button"
                className="w-14 h-14 rounded-full bg-green flex items-center justify-center hover:opacity-90 transition-opacity relative"
                disabled={isAppleLoading || loginWithOtpCheckMutation.isLoading}
                onClick={() => {
                  setPendingProvider('apple')
                  setShowRoleModal(true)
                }}
              >
                <Image src="/login/apple.png" alt="Apple" width={48} height={48} className={`object-contain ${isAppleLoading ? 'opacity-50' : ''}`} />
              </button>
            </div>
          </div>

        {/* Divider */}
        <div className="flex items-center my-8">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="mx-4 text-gray-600 text-sm whitespace-nowrap">
            Or continue with email
          </span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>



          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="Enter email address"
                disabled={loginWithOtpCheckMutation.isLoading}
                onKeyDown={preventLeadingWhitespace}
                className="h-12 border-gray-300 focus:border-green focus:ring-green/20"
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="Enter password"
                  disabled={loginWithOtpCheckMutation.isLoading}
                  onKeyDown={preventLeadingWhitespace}
                  className="h-12 pr-12 border-gray-300  focus:border-green focus:ring-green/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
              <div className="text-right mt-2">
                <Link href="/forgot-password" className="text-sm text-green hover:text-light-green">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginWithOtpCheckMutation.isLoading}
              className="w-full py-4 rounded-full text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 mt-6 bg-green"
            >
              {loginWithOtpCheckMutation.isLoading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center mt-6 text-gray-600">
            Don't have an account?{" "}
            <Link href="/sign-up" className="font-medium hover:underline text-green">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Login text in top left corner */}
      <div className="absolute top-4 left-4 text-gray-400 text-sm">
        Login
      </div>

      {/* Role Selection Modal */}
      <RoleSelectionModal
        isOpen={showRoleModal}
        onClose={() => {
          setShowRoleModal(false);
          setPendingProvider(null);
        }}
        onSelectRole={handleRoleSelection}
        isLoading={isGoogleLoading || isAppleLoading}
      />
    </div>
  )
}