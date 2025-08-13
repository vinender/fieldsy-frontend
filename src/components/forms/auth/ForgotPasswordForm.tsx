"use client"

import React from "react"
import { Mail, ArrowLeft } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email"),
})

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: ForgotPasswordData) {
    try {
      // Simulate API call for email verification
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Store email for OTP page
      const emailParam = encodeURIComponent(values.email)
      
      toast.success("Verification code sent to your email!")
      
      // Redirect to OTP verification page
      window.location.href = `/verify-otp?email=${emailParam}`
    } catch (e: any) {
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
            <h2 className="font-[800] text-[32px] leading-[58px] mb-3 text-green">Fieldsy Makes Dog Walking Easy</h2>
            <p className="text-dark-green/40 font-[400] text-[16px] leading-[24px]">
            Find secure fields nearby, book in seconds, and give your dog the off-lead freedom they deserve—all with peace of mind.            </p>
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
                disabled={isSubmitting} 
                className="w-full py-3 rounded-full text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 bg-green"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  "Continue"
                )}
              </button>
            </form>

            {/* Back to login */}
            <div className="mt-8 text-[15px] font-[600] text-center">
              <Link href="/login" className="inline-flex text-gray-700 items-center gap-2  hover:underline">
                {/* <ArrowLeft className="w-4 h-4" /> */}
                Remember your password? <span className="text-green">Back to Login</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}