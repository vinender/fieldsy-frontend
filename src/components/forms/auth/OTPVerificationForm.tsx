"use client"

import React, { useState, useRef, useEffect } from "react"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useVerifyOtp, useResendOtp, useVerifyPasswordResetOtp } from "@/hooks/mutations/useOtpMutations"
import { signIn } from "next-auth/react"

export default function OTPVerificationForm() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [resendTimer, setResendTimer] = useState(30)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const role = searchParams.get("role") || "DOG_OWNER"
  const from = searchParams.get("from") || "signup" // 'signup', 'login', or 'reset'

  // Use appropriate mutation based on the flow
  const verifyOtpMutation = useVerifyOtp({
    onSuccess: async (result) => {
      // For signup or login flow, log the user in after successful verification
      if ((from === 'signup' || from === 'login') && result.data?.token) {
        // Store token and user data
        localStorage.setItem('token', result.data.token)
        localStorage.setItem('user', JSON.stringify(result.data.user))
        
        // Use NextAuth to establish session with the token
        const signInResult = await signIn('credentials', {
          email: result.data.user.email,
          token: result.data.token,
          redirect: false,
        })
        
        if (signInResult?.ok) {
          // Redirect to home or dashboard
          router.push('/')
        } else {
          toast.error('Failed to establish session. Please try logging in.')
          router.push('/login')
        }
      }
    },
    onError: () => {
      // Clear OTP fields on error
      setOtp(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    }
  })

  const verifyPasswordResetMutation = useVerifyPasswordResetOtp({
    onSuccess: (result) => {
      // Store the OTP in session storage for the reset password page
      const otpCode = otp.join("")
      sessionStorage.setItem('reset_otp', otpCode)
      
      // For password reset, redirect to reset password page
      router.push(`/reset-password?email=${encodeURIComponent(email)}&verified=true`)
    },
    onError: () => {
      // Clear OTP fields on error
      setOtp(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    }
  })

  const resendOtpMutation = useResendOtp({
    onSuccess: () => {
      setResendTimer(30)
      setOtp(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    }
  })

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit if all fields are filled
    if (value && index === 5 && newOtp.every(digit => digit)) {
      handleVerify(newOtp.join(""))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").slice(0, 6)
    
    if (/^\d+$/.test(pastedData)) {
      const newOtp = [...otp]
      pastedData.split("").forEach((digit, index) => {
        if (index < 6) newOtp[index] = digit
      })
      setOtp(newOtp)
      
      // Focus the next empty field or last field
      const nextEmptyIndex = newOtp.findIndex(digit => !digit)
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex]?.focus()
      } else {
        inputRefs.current[5]?.focus()
        // Auto-submit if all fields are filled
        if (newOtp.every(digit => digit)) {
          handleVerify(newOtp.join(""))
        }
      }
    }
  }

  const handleVerify = async (otpCode?: string) => {
    const code = otpCode || otp.join("")
    
    if (code.length !== 6) {
      toast.error("Please enter all 6 digits")
      return
    }

    try {
      // Use appropriate mutation based on flow
      if (from === 'reset') {
        await verifyPasswordResetMutation.mutateAsync({
          email,
          otp: code,
        })
      } else {
        await verifyOtpMutation.mutateAsync({
          email,
          otp: code,
          role,
        })
      }
    } catch (error: any) {
      // Error is already handled by the mutation's onError callback which shows toast
      // Just catch it here to prevent unhandled promise rejection
      console.log('OTP verification error handled by mutation hook')
    }
  }

  const handleResend = async () => {
    try {
      const otpType = from === 'reset' ? 'RESET_PASSWORD' : 'SIGNUP'
      await resendOtpMutation.mutateAsync({
        email,
        type: otpType,
      })
    } catch (error: any) {
      // Error is already handled by the mutation's onError callback which shows toast
      // Just catch it here to prevent unhandled promise rejection
      console.log('Resend OTP error handled by mutation hook')
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
            Find secure fields nearby, book in seconds, and give your dog the off-lead freedom they deserve—all with peace of mind.
            </p>
          </div>
        </div>
      </div>

      {/* Right - OTP Verification Form */}
      <div className="w-full lg:w-1/2 h-full">
        <div className="h-full flex items-center justify-center px-6 md:px-8 lg:px-16 py-8">
          <div className="w-full max-w-md">
             

            {/* Header */}
            <div className="text-left mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                {from === 'reset' ? 'Reset Password Verification' : 'Email Verification'}
              </h2>
              <p className="text-gray-500">
                Enter 6-digit OTP sent to {email || 'your registered email'}.
              </p>
            </div>

            {/* OTP Input */}
            <div className="mb-8">
            <p className="text-gray-700 text-[15px] font-[500] text-left mb-2">
              Enter OTP
              </p>
              <div className="flex gap-2 md:gap-3 text-left justify-start">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => {inputRefs.current[index] = el}}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-[56px] h-[56px] px-[8px] py-[16px] text-center text-xl font-semibold bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green/20 transition-all"
                    disabled={verifyOtpMutation.isLoading || verifyPasswordResetMutation.isLoading}
                  />
                ))}
              </div>
              
              {/* Resend Timer */}
              <p className="text-left text-sm text-gray-600 mt-3">
                {resendTimer > 0 ? (
                  <>Resend OTP in <span className="font-semibold">00:{resendTimer.toString().padStart(2, '0')}s</span></>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={resendOtpMutation.isLoading}
                    className="text-green hover:underline font-medium"
                  >
                    {resendOtpMutation.isLoading ? 'Sending...' : 'Resend OTP'}
                  </button>
                )}
              </p>
            </div>

            {/* Verify Button */}
            <button
              onClick={() => handleVerify()}
              disabled={verifyOtpMutation.isLoading || verifyPasswordResetMutation.isLoading || otp.join("").length !== 6}
              className="w-full py-3 rounded-full text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-90 bg-green mb-6"
            >
              {(verifyOtpMutation.isLoading || verifyPasswordResetMutation.isLoading) ? "Verifying..." : "Verify Email"}
            </button>


            {/* Back to login/signup */}
            <div className="text-center mx-auto">
              {from === 'reset' ? (
                <Link href="/forgot-password" className="inline-flex text-[16px] font-[600] items-center gap-2 text-gray-600 hover:text-gray-800">
                  Change your email? <span className="text-green">Back to Reset</span>
                </Link>
              ) : from === 'login' ? (
                <Link href="/login" className="inline-flex text-[16px] font-[600] items-center gap-2 text-gray-600 hover:text-gray-800">
                  Change your email? <span className="text-green">Back to Login</span>
                </Link>
              ) : (
                <Link href="/register" className="inline-flex text-[16px] font-[600] items-center gap-2 text-gray-600 hover:text-gray-800">
                  Change your email? <span className="text-green">Back to Sign Up</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}