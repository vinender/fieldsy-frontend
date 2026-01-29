"use client"

import React from "react"
import { Mail, ArrowLeft } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRequestPasswordReset } from "@/hooks/mutations/useOtpMutations"

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email"),
})

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>

// Prevent leading whitespace in inputs
const preventLeadingWhitespace = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const input = e.currentTarget;
  // Prevent space at the start of input or when input is empty
  if (e.key === ' ' && (input.value === '' || input.selectionStart === 0)) {
    e.preventDefault();
  }
};

export default function ForgotPasswordForm() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  // Use the password reset mutation hook
  const requestPasswordResetMutation = useRequestPasswordReset({
    onSuccess: (data, variables) => {
      // Redirect to OTP verification page for password reset
      router.push(`/verify-otp?email=${encodeURIComponent(variables.email)}&from=reset`)
    }
  })

  async function onSubmit(values: ForgotPasswordData) {
    try {
      await requestPasswordResetMutation.mutateAsync({
        email: values.email
      })
    } catch (error: any) {
      // Error is already handled by the mutation's onError callback
      // Suppress the error to prevent Next.js error overlay
      const statusCode = error?.statusCode || error?.response?.status;

      // Log only unexpected errors in development
      if (process.env.NODE_ENV === 'development' && statusCode !== 404) {
        console.log('Password reset error:', error);
      }

      // Don't rethrow - error is already shown in toast by mutation hook
      return;
    }
  }

  return (
    <div className="h-[100svh] overflow-hidden flex" style={{ background: 'linear-gradient(179deg, #FFFCF3 0.83%, #F9F0D7 61.62%)' }}>
      {/* Left - Background Image (Same as Login) */}
      <div className="hidden lg:block relative w-[50%] h-screen">
        <Image
          src="/login/loginbg.jpg"
          alt="Forgot Password Background"
          fill
          className="object-cover"
          priority
        />

        <div className="absolute bottom-0 pb-20 left-0 text-left w-full flex items-center p-6">
          <div className="w-full max-w-full text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-green">
              Fieldsy Makes Dog Walking Easy
            </h1>
            <p className="text-gray-text text-[16px] leading-[24px] font-[400] mt-2">
              Find secure fields nearby, book in seconds, and give your dog the
              off-lead freedom they deserve—all with peace of mind.
            </p>
          </div>
        </div>
      </div>

      {/* Right - Forgot Password Form */}
      <div className="w-full lg:w-1/2 h-full">
        <div className="h-full flex items-center justify-center px-6 md:px-8 lg:px-16 py-8">
          <div className="w-full max-w-md">
            {/* Logo */}
            {/* <div className="text-left mb-8">
              <div className="flex items-center gap-2">
                <span className="text-3xl">🐾</span>
                <h1 className="text-4xl font-bold text-green">Fieldsy</h1>
              </div>
            </div> */}

            {/* Header */}
            <div className="text-left mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Forgot Password?</h2>
              <p className="text-gray-500">
              Enter the email you used to create your account so we can send you link for reset your password.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label className="text-gray-700 text-sm font-medium">Email Address</Label>
                <div className="relative mt-2">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    {...register("email")}
                    onKeyDown={preventLeadingWhitespace}
                    className="w-full px-4 py-3 pl-12 bg-white rounded-[76px] border border-gray-300 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/20 autofill:bg-white"
                    autoComplete="email"
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <div className="h-5">
                  {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={requestPasswordResetMutation.isLoading} 
                className="w-full py-3 rounded-full text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 bg-green"
              >
                {requestPasswordResetMutation.isLoading ? "Sending..." : "Continue"}
              </button>
            </form>

            {/* Back to login */}
            <div className="mt-8 text-[15px] font-[600] text-gray-700 text-center">
            Remember your password?
              <Link href="/login" className="inline-flex text-gray-700 items-center gap-2   hover:text-gray-800">
                {/* <ArrowLeft className="w-4 h-4" /> */}
                 <span className="text-green ml-1">Back to Login</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}