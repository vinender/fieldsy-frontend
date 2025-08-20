"use client"

import React, { useMemo, useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import Link from "next/link"
import { useRouter } from "next/router"
import { signIn } from "next-auth/react"
import { useAuth } from "@/hooks/auth/useAuth"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { RoleSelectionModal } from "@/components/modal/RoleSelectionModal"
import { socialRoleStore } from "@/lib/auth/social-role-store"


const registerSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    phoneCode: z.string().min(1, "Code required"),
    phoneNumber: z
      .string()
      .min(7, "Phone must be at least 7 digits")
      .regex(/^[0-9\s+()-]+$/, "Only digits and +()- allowed"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "At least one uppercase letter")
      .regex(/[a-z]/, "At least one lowercase letter")
      .regex(/[0-9]/, "At least one number"),
    agreeToTerms: z.boolean().refine((v) => v === true, {
      message: "You must accept the terms to continue",
    }),
    role: z.enum(["DOG_OWNER", "FIELD_OWNER"]),
  })

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isAppleLoading, setIsAppleLoading] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [pendingProvider, setPendingProvider] = useState<'google' | 'apple' | null>(null)

  const defaultValues: RegisterFormData = useMemo(
    () => ({
      fullName: "",
      email: "",
      phoneCode: "+44",
      phoneNumber: "",
      password: "",
      agreeToTerms: false,
      role: "DOG_OWNER",
    }),
    []
  )

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues,
    mode: "onBlur",
  })

  const selectedRole = watch("role")
  const { register: registerUser } = useAuth()

  async function onSubmit(values: RegisterFormData) {
    try {
      await registerUser({
        name: values.fullName,
        email: values.email,
        password: values.password,
        role: values.role,
        phone: `${values.phoneCode} ${values.phoneNumber}`,
      })
      toast.success("Account created successfully.")
    } catch (e: any) {
      const errorMessage = e?.message || e?.response?.data?.message || "Registration failed";
      
      // Show specific error messages with suggestions
      if (errorMessage.includes("already registered as")) {
        // Role conflict error
        toast.error(
          <div>
            <p className="font-semibold">Role Conflict</p>
            <p className="text-sm mt-1">{errorMessage}</p>
            <button 
              onClick={() => router.push('/login')}
              className="text-sm text-green underline mt-2"
            >
              Sign in with existing account
            </button>
          </div>,
          { duration: 8000 }
        );
      } else if (errorMessage.includes("Google/Apple")) {
        toast.error(
          <div>
            <p className="font-semibold">Email already registered</p>
            <p className="text-sm mt-1">{errorMessage}</p>
            <button 
              onClick={() => router.push('/login')}
              className="text-sm text-green underline mt-2"
            >
              Go to Login
            </button>
          </div>,
          { duration: 6000 }
        );
      } else if (errorMessage.includes("phone number is already registered")) {
        toast.error(
          <div>
            <p className="font-semibold">Phone number already in use</p>
            <p className="text-sm mt-1">{errorMessage}</p>
            <div className="flex gap-2 mt-2">
              <button 
                onClick={() => router.push('/login')}
                className="text-sm text-green underline"
              >
                Sign in instead
              </button>
              <span className="text-sm text-gray-400">or</span>
              <button 
                onClick={() => router.push('/forgot-password')}
                className="text-sm text-green underline"
              >
                Reset password
              </button>
            </div>
          </div>,
          { duration: 8000 }
        );
      } else if (errorMessage.includes("already exists")) {
        toast.error(
          <div>
            <p className="font-semibold">Account exists</p>
            <p className="text-sm mt-1">{errorMessage}</p>
            <button 
              onClick={() => router.push('/login')}
              className="text-sm text-green underline mt-2"
            >
              Sign in instead
            </button>
          </div>,
          { duration: 6000 }
        );
      } else {
        toast.error(errorMessage);
      }
    }
  }

  // Handle role selection from modal for social login
  async function handleSocialRoleSelection(role: 'DOG_OWNER' | 'FIELD_OWNER') {
    console.log('role selected', role)
    if (!pendingProvider) return;
    
    const isGoogle = pendingProvider === 'google';
    if (isGoogle) {
      setIsGoogleLoading(true);
    } else {
      setIsAppleLoading(true);
    }
    
    try {
      // Store the role in both localStorage (for client) and server storage
      localStorage.setItem('pendingUserRole', role);
      console.log('[RegisterForm] Stored role in localStorage:', role);
      
      // Store on server for NextAuth callback to retrieve
      await fetch('/api/auth/store-pending-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      console.log('[RegisterForm] Stored role on server:', role);
      
      // Call the social login
      const result = await signIn(pendingProvider, { 
        callbackUrl: '/',
      });
      
      if (result?.error) {
        if (result.error.includes('OAuthAccountNotLinked')) {
          toast.error('This email is already registered with a different method');
        } else {
          toast.error(`${pendingProvider === 'google' ? 'Google' : 'Apple'} signup failed. Please try again.`);
        }
      }
    } catch (error: any) {
      console.error('Social login error:', error);
      if (error?.message?.includes('Configuration')) {
        toast.info(`${pendingProvider === 'google' ? 'Google' : 'Apple'} signup is not configured yet`);
      } else {
        toast.error(`${pendingProvider === 'google' ? 'Google' : 'Apple'} signup failed. Please try again.`);
      }
    } finally {
      setShowRoleModal(false);
      setPendingProvider(null);
      setIsGoogleLoading(false);
      setIsAppleLoading(false);
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
      {/* Left - Image Grid like Login */}
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

      {/* Right - Register Form */}
      <div className="w-full lg:w-1/2 h-full">
        <div className="h-full flex items-center justify-center px-6 md:px-8 lg:px-16 py-4 md:py-6 lg:py-8">
          <div className="w-full max-w-md">
            <Link href="/">
            <div className="text-left mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl md:text-3xl">🐾</span>
                <h1 className="text-3xl md:text-4xl font-bold text-green">Fieldsy</h1>
              </div>
            </div>
            </Link>

          <div className="text-left mb-3">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Create your Fieldsy account</h2>
            <p className="text-gray-500 text-sm">Sign up to find and book secure fields near you.</p>
          </div>

          {/* Social Login - Original Design */}
          <div className="mb-3 hidden lg:block">
            <div className="w-full flex items-center justify-between p-1 rounded-[70px] text-white font-medium bg-light-green">
              <button 
                type="button"
                className="w-12 h-12 rounded-full bg-green flex items-center justify-center hover:opacity-90 transition-opacity"
                disabled={isGoogleLoading || isSubmitting}
                onClick={() => {
                  setPendingProvider('google')
                  setShowRoleModal(true)
                }}
              >
                <img src="/login/google.png" alt="Google" className={`w-10 h-10 object-contain ${isGoogleLoading ? 'opacity-50' : ''}`} />
              </button>
              <span className="text-center flex-1 text-sm">Sign up with</span>
              <button 
                type="button"
                className="w-12 h-12 rounded-full bg-green flex items-center justify-center hover:opacity-90 transition-opacity"
                disabled={isAppleLoading || isSubmitting}
                onClick={() => {
                  setPendingProvider('apple')
                  setShowRoleModal(true)
                }}
              >
                <img src="/login/apple.png" alt="Apple" className={`w-10 h-10 object-contain ${isAppleLoading ? 'opacity-50' : ''}`} />
              </button>
            </div>
          </div>

           <div className="relative my-3 hidden lg:block">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
               <span className="px-4 text-gray-600 bg-transparent">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Select Role</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setValue("role", "DOG_OWNER")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-full border-2 text-sm font-medium transition-all ${
                    selectedRole === "DOG_OWNER"
                      ? "bg-green text-white border-green"
                      : "bg-white text-gray-600 border-gray-300 hover:border-green"
                  }`}
                  id="DOG_OWNER"
                >
                  <img 
                    src={selectedRole === "DOG_OWNER" ? '/login/dog-owner.svg' : '/login/dog-owner-black.svg'} 
                    className="w-6 h-6" 
                    alt="Dog Owner"
                  /> Dog Owner
                </button>
                <button
                  type="button"
                  onClick={() => setValue("role", "FIELD_OWNER")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-full border-2 text-sm font-medium transition-all ${
                    selectedRole === "FIELD_OWNER"
                      ? "bg-green text-white border-green"
                      : "bg-white text-gray-600 border-gray-300 hover:border-green"
                  }`}
                  id="FIELD_OWNER"
                >
                  <img 
                    src={selectedRole === "FIELD_OWNER" ? '/login/field-owner-white.svg' : '/login/field-owner.svg'} 
                    className="w-6 h-6" 
                    alt="Field Owner"
                  /> Field Owner
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <Label className="text-gray-700 text-sm">Full Name</Label>
              <Input
                type="text"
                placeholder="Enter full name"
                {...register("fullName")}
                className="w-full px-3 md:px-4 bg-white py-2 md:py-2.5 mt-1 rounded-[76px] border border-gray-300 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/20 shadow-none hover:border-gray-300 autofill:bg-white"
                autoComplete="name"
              />
              <div className="h-5">
                {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName.message}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <Label className="text-gray-700 text-sm">Email Address</Label>
              <Input
                type="email"
                placeholder="Enter email address"
                {...register("email")}
                className="w-full px-3 md:px-4 bg-white py-2 md:py-2.5 mt-1 rounded-[76px] border border-gray-300 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/20 shadow-none hover:border-gray-300 autofill:bg-white"
                autoComplete="email"
              />
              <div className="h-5">
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
              </div>
            </div>

            {/* Phone */}
            <div>
              <Label className="block text-sm font-medium text-gray-700">Phone Number</Label>
                <div className="flex mt-1">
                  
                  <Select
                    {...register("phoneCode")}
                    className="px-4 bg-white py-2 md:py-2.5 rounded-l-[76px] rounded-r-none text-gray-input border border-gray-300 border-r-0 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/20 autofill:bg-white"
                  >
                    <option value="+44">+44</option>
                    <option value="+1">+1</option>
                    <option value="+91">+91</option>
                  </Select>

                  <Input
                    type="tel"
                    placeholder="Enter phone number"
                    {...register("phoneNumber")}
                    className="flex-1 px-3 md:px-4 bg-white py-2 md:py-2.5 rounded-r-[76px] rounded-l-none border border-gray-300 border-l-0 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/20 shadow-none hover:border-gray-300 autofill:bg-white"
                    autoComplete="tel"
                  />
                </div>
                <div className="h-5">
                  {errors.phoneNumber && <p className="text-xs text-red-600 mt-1">{errors.phoneNumber.message}</p>}
                </div>
            </div>

            {/* Password */}
            <div>
              <Label className="text-gray-700 text-sm">Password</Label>
              <div className="relative mt-1">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  {...register("password")}
                  className="w-full px-3 md:px-4 bg-white py-2 md:py-2.5 pr-10 md:pr-12 rounded-[76px] border border-gray-300 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/20 shadow-none hover:border-gray-300 autofill:bg-white"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="h-5">
                {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
              </div>
            </div>

            {/* Terms */}
            <div>
              <div className="flex items-start gap-2">
                <input type="checkbox" id="terms" {...register("agreeToTerms") } className="mt-1 w-4 h-4 text-green rounded border-gray-300 focus:ring-green" />
                <label htmlFor="terms" className="text-xs text-gray-600">
                  By checking the box, you agree to our {" "}
                  <a href="/terms-conditions" className="text-green hover:underline">Terms & Conditions</a> and {" "}
                  <a href="/privacy-policy" className="text-green hover:underline">Privacy Policy</a>.
                </label>
              </div>
              <div className="h-5">
                {errors.agreeToTerms && <p className="text-xs text-red-600 mt-1">{errors.agreeToTerms.message as string}</p>}
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full py-2.5 md:py-3 rounded-full text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 bg-green">
              {isSubmitting ? "Creating account..." : "Sign Up"}
            </button>

            <p className="text-center text-gray-600 text-sm">
              Already have an account? {" "}
              <Link href="/login" className="font-medium hover:underline text-green">Login</Link>
            </p>
          </form>
          </div>
        </div>
      </div>

      {/* Role Selection Modal */}
      <RoleSelectionModal
        isOpen={showRoleModal}
        onClose={() => {
          setShowRoleModal(false);
          setPendingProvider(null);
        }}
        onSelectRole={handleSocialRoleSelection}
        isLoading={isGoogleLoading || isAppleLoading}
      />
    </div>
  )
}