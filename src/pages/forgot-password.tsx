import { useState } from "react"
import { useRouter } from "next/router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { ImageGrid } from "@/components/forms/ImageGrid"

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  async function onSubmit(data: ForgotPasswordFormData) {
    setIsLoading(true)
    try {
      // TODO: Implement API call to send reset email
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulated API call
      
      setIsEmailSent(true)
      toast.success("Reset link sent to your email!")
    } catch {
      toast.error("Failed to send reset email. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Image grid data - different images for variety
  const images = [
    { src: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=300&h=300&fit=crop", alt: "Dogs running" },
    { src: "https://images.unsplash.com/photo-1593134257782-e89567b7718a?w=300&h=300&fit=crop", alt: "Dog in grass" },
    { src: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=300&fit=crop", alt: "Husky portrait" },
    { src: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=300&h=300&fit=crop", alt: "Golden retriever" },
    { src: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=300&h=300&fit=crop", alt: "Dog with owner", isCenter: true },
    { src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop", alt: "Corgi smiling" },
    { src: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=300&h=300&fit=crop", alt: "Dog closeup" },
    { src: "https://images.unsplash.com/photo-1568572933382-74d440642117?w=300&h=300&fit=crop", alt: "Dogs playing" },
    { src: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=300&fit=crop", alt: "Golden retriever puppy" }
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Image Grid */}
      <ImageGrid
        images={images}
        title="Secure Fields, Happy Dogs"
        description="Reset your password and get back to booking the perfect fields for your furry friend's adventures and playtime."
      />

      {/* Right Section - Forgot Password Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 lg:px-16 bg-cream ">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-left mb-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-3xl">🐾</span>
              <h1 className="text-4xl font-bold text-green">
                Fieldsy
              </h1>
            </Link>
          </div>

          {/* Form Content */}
          {!isEmailSent ? (
            <>
              {/* Header Text */}
              <div className="text-left mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Forgot Your Password?
                </h2>
                <p className="text-gray-500 text-base">
                  Enter the email you used to create your account so we can send link to reset your password.
                </p>
              </div>

              {/* Forgot Password Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="Enter your email address"
                    disabled={isLoading}
                    className="h-12"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-[70px] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 mt-6 bg-green"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                  ) : (
                    'Continue'
                  )}
                </button>
              </form>

              {/* Back to Login Link */}
              <div className="text-center mt-8">
                <Link 
                  href="/login" 
                  className="text-gray-600 hover:text-gray-800 font-medium"
                >
                  ← Back to Login
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Success Message */}
              <div className="text-center">
                <div className="w-20 h-20 bg-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Check Your Email
                </h2>
                <p className="text-gray-500 mb-8">
                  We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
                </p>
                
                <button
                  onClick={() => router.push('/login')}
                  className="w-full py-4 rounded-[70px] text-white font-medium hover:opacity-90 transition-opacity bg-green"
                >
                  Back to Login
                </button>
                
                <p className="text-sm text-gray-500 mt-6">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button
                    onClick={() => setIsEmailSent(false)}
                    className="text-green hover:underline font-medium"
                  >
                    try again
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Forgot Password text in top left corner */}
      <div className="absolute top-4 left-4 text-gray-400 text-sm">
        Forgot Password
      </div>
    </div>
  )
}