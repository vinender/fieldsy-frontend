"use client"

import React, { useState, useRef, useEffect } from "react"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useVerifyOtp, useResendOtp, useVerifyPasswordResetOtp, useVerifySocialLoginOtp } from "@/hooks/mutations/useOtpMutations"
import { signIn } from "next-auth/react"

export default function OTPVerificationForm() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [resendTimer, setResendTimer] = useState(30)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const role = searchParams.get("role") || "DOG_OWNER"
  const from = searchParams.get("from") || "signup" // 'signup', 'login', 'reset', or 'social-login'

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
      // Store the reset token in session storage for the reset password page
      if (result.data?.resetToken) {
        sessionStorage.setItem('reset_token', result.data.resetToken)
        sessionStorage.setItem('reset_email', email)
      }

      // For password reset, redirect to reset password page
      router.push(`/reset-password?email=${encodeURIComponent(email)}&verified=true`)
    },
    onError: () => {
      // Clear OTP fields on error
      setOtp(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    }
  })

  const verifySocialLoginOtpMutation = useVerifySocialLoginOtp({
    onSuccess: async (result) => {
      // For social login flow, log the user in after successful verification
      if (result.data?.token) {
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
      } else if (from === 'social-login') {
        await verifySocialLoginOtpMutation.mutateAsync({
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
      let otpType: 'SIGNUP' | 'RESET_PASSWORD' | 'EMAIL_VERIFICATION' = 'SIGNUP'
      if (from === 'reset') {
        otpType = 'RESET_PASSWORD'
      } else if (from === 'social-login') {
        otpType = 'SIGNUP' // Use SIGNUP type for social login OTP as well
      }

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

  return (
    <div className="h-[100svh] overflow-hidden flex" style={{ background: 'linear-gradient(179deg, #FFFCF3 0.83%, #F9F0D7 61.62%)' }}>
      {/* Left - Background Image (Same as Login) */}
      <div className="hidden lg:block relative w-[50%] h-screen">
        <Image
          src="/login/loginbg.jpg"
          alt="OTP Verification Background"
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

      {/* Right - OTP Verification Form */}
      <div className="w-full lg:w-1/2 h-full">
        <div className="h-full flex items-center justify-center px-6 md:px-8 lg:px-16 py-8">
          <div className="w-full max-w-md">
             

            {/* Header */}
            <div className="text-left mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                {from === 'reset' ? 'Reset Password Verification' : from === 'social-login' ? 'Verify Your Email' : 'Email Verification'}
              </h2>
              <p className="text-gray-500">
                {from === 'social-login'
                  ? `Please verify your email to complete your registration. We've sent a 6-digit code to ${email}.`
                  : `Enter 6-digit OTP sent to ${email || 'your registered email'}.`}
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
                    className="w-[56px] h-[56px] px-[8px] py-[16px] text-center text-xl font-semibold bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-green/20 transition-all"
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
                <Link href="/sign-up" className="inline-flex text-[16px] font-[600] items-center gap-2 text-gray-600 hover:text-gray-800">
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