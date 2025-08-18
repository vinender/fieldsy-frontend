"use client"

import { HeroSection } from "@/components/landing/HeroSection"
import { AboutSection } from "@/components/landing/AboutSection"
import { HowItWorksSection } from "@/components/landing/HowItWorksSection"
import { FeaturesSection } from "@/components/landing/FeaturesSection"
import { PlatformSection } from "@/components/landing/PlatformSection"
import { TestimonialsSection } from "@/components/landing/TestimonialsSection"
import { FAQSection } from "@/components/landing/FAQSection"
import { Footer } from "@/components/landing/Footer"
import FieldOwnerHome from "@/components/field-owner/FieldOwnerHome"
import PageLoader from "@/components/common/PageLoader"
import { useAuth } from "@/contexts/AuthContext"
import { useSession } from "next-auth/react"
import { useEffect } from "react"


export default function HomePage() {
  const { user, isLoading } = useAuth();
  const { status } = useSession();

  useEffect(() => {
    // Log user data for debugging
    console.log('[HomePage] User data from AuthContext:', user);
    console.log('[HomePage] User role:', user?.role);
    console.log('[HomePage] Session status:', status);
    console.log('[HomePage] Is loading:', isLoading);
  }, [user, isLoading, status])

  // Show loading spinner while determining user role
  if (isLoading || status === 'loading') {
    return <PageLoader />
  }

  // Only show field owner dashboard if authenticated AND user is a field owner
  if (status === 'authenticated' && user && user.role === 'FIELD_OWNER') {
    return <FieldOwnerHome />
  }

  // Otherwise show the regular landing page
  return (
    <div className="bg-light-cream overflow-x-hidden">
      {/* Hero Section */}
      <HeroSection />

      {/* About Section */}
      <AboutSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Platform Section */}
      <PlatformSection />

      {/* Testimonials Section */}
      <div id="testimonials">
        <TestimonialsSection />
      </div>

      {/* FAQ Section */}
      <FAQSection />

      {/* Footer */}
      {/* <Footer /> */}
    </div>
  )
}