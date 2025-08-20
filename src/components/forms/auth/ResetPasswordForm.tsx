"use client"

import React, { useState, useEffect } from "react"
import { Eye, EyeOff, Lock, CheckCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "At least one uppercase letter")
    .regex(/[a-z]/, "At least one lowercase letter")
    .regex(/[0-9]/, "At least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type ResetPasswordData = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  })
  
  // Debug errors
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("Form validation errors:", errors)
    }
  }, [errors])

  const password = watch("password")

  // Password strength indicators
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasMinLength = password?.length >= 8

  useEffect(() => {
    // For demo purposes, we'll allow the form to work even without a token
    // In production, you would validate the token here
    if (!token) {
      console.log("No token provided, but allowing for demo purposes")
      // Optionally show a warning instead of redirecting
      // toast.warning("Demo mode: No token required")
    }
  }, [token])

  async function onSubmit(values: ResetPasswordData) {
    console.log("Form submitted with values:", values)
    
    try {
      // Validate passwords match
      if (values.password !== values.confirmPassword) {
        throw new Error("Passwords do not match")
      }
      
      // Simulate API call for password reset
      console.log("Resetting password with:", { token, password: values.password })
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // For demo purposes, always succeed
      setIsSuccess(true)
      toast.success("Password reset successfully!")
      
      // Store the new password in localStorage for demo (in production, this would be handled by the backend)
      if (typeof window !== 'undefined') {
        localStorage.setItem('demo_password', values.password)
        console.log("Password saved for demo:", values.password)
      }
      
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (e: any) {
      console.error("Password reset error:", e)
      toast.error(e?.message || "Something went wrong. Please try again.")
    }
  }

  const dogImages = [
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1581888227599-779811939961?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop",
  ]

  return (
    <div className="h-[100svh] overflow-hidden flex" style={{ background: 'linear-gradient(179deg, #FFFCF3 0.83%, #F9F0D7 61.62%)' }}>
      {/* Left - Image Grid */}
      <div className="hidden lg:block w-1/2 h-full">
        <div className="relative w-full h-full">
          <div className="grid grid-cols-3 gap-2 p-4 w-full h-full">
            {dogImages.map((src, idx) => (
              <div key={idx} className="relative overflow-hidden rounded-lg">
                <img src={src} alt={`Dog ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-white/0" />
            <div className="absolute bottom-0 left-0 right-0 h-[700px] bg-gradient-to-t from-white/100 to-transparent" />
          </div>
          <div className="absolute bottom-8 left-8 right-8 z-10">
            <h2 className="font-[800] text-[32px] leading-[58px] mb-3 text-green">Create New Password</h2>
            <p className="text-dark-green/40 font-[400] text-[16px] leading-[24px]">
            Generate a strong and unique password for your account to enhance security measures and protect from unauthorized access.
            </p>
          </div>
        </div>
      </div>

      {/* Right - Reset Password Form */}
      <div className="w-full lg:w-1/2 h-full">
        <div className="h-full flex items-center justify-center px-6 md:px-8 lg:px-16 py-8">
          <div className="w-full max-w-md">
          

            {!isSuccess ? (
              <>
                {/* Header */}
                <div className="text-left mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Forgot Your Password?</h2>
                  <p className="text-gray-500 text-sm">Create a new password for your account</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* New Password */}
                  <div>
                    <Label className="text-gray-700 text-sm font-medium">New Password</Label>
                    <div className="relative mt-1">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        {...register("password")}
                        className="w-full px-4 py-2.5 pl-12 pr-12 bg-white rounded-[76px] border border-gray-300 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/20 autofill:bg-white"
                        autoComplete="new-password"
                      />
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <div className="h-5">
                      {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <Label className="text-gray-700 text-sm font-medium">Confirm Password</Label>
                    <div className="relative mt-1">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        {...register("confirmPassword")}
                        className="w-full px-4 py-2.5 pl-12 pr-12 bg-white rounded-[76px] border border-gray-300 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/20 autofill:bg-white"
                        autoComplete="new-password"
                      />
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <div className="h-5">
                      {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword.message}</p>}
                    </div>
                  </div>

                 

                  <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="w-full py-3 rounded-full text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 bg-green"
                  >
                    {isSubmitting ? "Resetting..." : "submit"}
                  </button>
                </form>

                {/* Back to login */}
                <div className="mt-6 text-center">
                  <Link href="/login" className="text-green hover:underline text-sm">
                    Remember your password? Back to Login
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* Success Message */}
                <div className="text-center">
                  <div className="w-20 h-20 bg-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">Password Reset Successful!</h2>
                  <p className="text-gray-500 mb-8">
                    Your password has been successfully reset. You'll be redirected to the login page in a few seconds.
                  </p>
                  
                  <Link 
                    href="/login" 
                    className="block w-full py-3 rounded-full bg-green text-white font-medium hover:opacity-90 transition-opacity text-center"
                  >
                    Go to Login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}