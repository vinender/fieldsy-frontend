import { useState } from "react"
import { useRouter } from "next/router"
import { signIn } from "next-auth/react"
import { useAuth } from "@/hooks/auth/useAuth"
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

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isAppleLoading, setIsAppleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [pendingProvider, setPendingProvider] = useState<'google' | 'apple' | null>(null)
  const { login } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true)
    try {
      await login({ email: data.email, password: data.password })
      toast.success("Login successful!")
      // Don't redirect here - let useAuth handle it with callbackUrl
    } catch (error: any) {
      const errorMessage = error?.message || "Invalid email or password";
      
      // Show specific error messages with suggestions
      if (errorMessage.includes("social login")) {
        toast.error(
          <div>
            <p className="font-semibold">Social login required</p>
            <p className="text-sm mt-1">{errorMessage}</p>
          </div>,
          { duration: 5000 }
        );
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Handle role selection from modal
  async function handleRoleSelection(role: 'DOG_OWNER' | 'FIELD_OWNER') {
    if (!pendingProvider) return;
    
    const isGoogle = pendingProvider === 'google';
    if (isGoogle) {
      setIsGoogleLoading(true);
    } else {
      setIsAppleLoading(true);
    }
    
    try {
      // Store the role in localStorage - simple and works across platforms
      localStorage.setItem('pendingUserRole', role);
      console.log('[LoginForm] Stored role in localStorage:', role);
      
      // Call the social login
      await signIn(pendingProvider, { 
        callbackUrl: '/',
      });
    } catch (error: any) {
      if (error?.message?.includes('OAuthAccountNotLinked')) {
        toast.error('This email is already registered with a different method');
      } else if (error?.message?.includes('Configuration')) {
        toast.info(`${pendingProvider === 'google' ? 'Google' : 'Apple'} login is not configured yet`);
      } else {
        toast.error(`${pendingProvider === 'google' ? 'Google' : 'Apple'} login failed. Please try again.`);
      }
    } finally {
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
      <ImageGrid
        images={images}
        title="Fieldsy Makes Dog Walking Easy"
        description="Find secure fields nearby, book in seconds, and give your dog the off-lead freedom they deserve—all with peace of mind."
      />

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
                className="w-14 h-14 rounded-full bg-green flex items-center justify-center hover:opacity-90 transition-opacity"
                disabled={isGoogleLoading || isLoading}
                onClick={() => {
                  setPendingProvider('google')
                  setShowRoleModal(true)
                }}
              >
                {isGoogleLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <img src="/login/google.png" alt="Google" className="w-12 h-12 object-contain" />
                )}
              </button>
              <span className="text-center flex-1">Login with</span>
              <button
                type="button"
                className="w-14 h-14 rounded-full bg-green flex items-center justify-center hover:opacity-90 transition-opacity"
                disabled={isAppleLoading || isLoading}
                onClick={() => {
                  setPendingProvider('apple')
                  setShowRoleModal(true)
                }}
              >
                {isAppleLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <img src="/login/apple.png" alt="Apple" className="w-12 h-12 object-contain" />
                )}
              </button>
            </div>
          </div>

          {/* Divider */}
            <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-4 text-gray-600 bg-transparent">
                Or continue with email
              </span>
            </div>
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
                disabled={isLoading}
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
                  disabled={isLoading}
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
              disabled={isLoading}
              className="w-full py-4 rounded-full text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 mt-6 bg-green"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center mt-6 text-gray-600">
            Don't have an account?{" "}
            <Link href="/register" className="font-medium hover:underline text-green">
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