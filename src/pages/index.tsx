"use client"

import dynamic from "next/dynamic"
import { HeroSection } from "@/components/landing/HeroSection"
import FieldOwnerHome from "@/components/field-owner/FieldOwnerHome"
import { HomePageSkeleton } from "@/components/skeletons/HomePageSkeleton"
import { LazySection } from "@/components/common/LazySection"
import { PageWithSkeleton } from "@/components/common/PageWithSkeleton"
import { HeroSkeleton } from "@/components/skeletons/PageSkeletons"
import { useAuth } from "@/contexts/AuthContext"
import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { PerformanceMonitor } from "@/utils/performance"


// Lazy load sections that are below the fold
const AboutSection = dynamic(
  () => import("@/components/landing/AboutSection").then(mod => ({ default: mod.AboutSection })),
  { ssr: false }
)


const HowItWorksSection = dynamic(
  () => import("@/components/landing/HowItWorksSection").then(mod => ({ default: mod.HowItWorksSection })),
  { ssr: false }
)


const FeaturesSection = dynamic(
  () => import("@/components/landing/FeaturesSection").then(mod => ({ default: mod.FeaturesSection })),
  { ssr: false }
)


const PlatformSection = dynamic(
  () => import("@/components/landing/PlatformSection").then(mod => ({ default: mod.PlatformSection })),
  { ssr: false }
)


const TestimonialsSection = dynamic(
  () => import("@/components/landing/TestimonialsSection").then(mod => ({ default: mod.TestimonialsSection })),
  { ssr: false }
)


const FAQSectionWithImage = dynamic(
  () => import("@/components/common/FAQSectionWithImage").then(mod => ({ default: mod.FAQSectionWithImage })),
  { ssr: false }
)


export default function HomePage() {
  const { user, isLoading } = useAuth();
  const { status } = useSession();

  useEffect(() => {
    // Only track performance in development
    if (process.env.NODE_ENV === 'development') {
      if (!isLoading && status !== 'loading') {
        PerformanceMonitor.mark('home-page-interactive');
        PerformanceMonitor.measure('Time to Interactive', 'home-page-start', 'home-page-interactive');
      }
    }
  }, [isLoading, status])
  
  useEffect(() => {
    // Mark the start of page load
    if (process.env.NODE_ENV === 'development') {
      PerformanceMonitor.mark('home-page-start');
    }
    
    return () => {
      // Clean up performance marks when component unmounts
      if (process.env.NODE_ENV === 'development') {
        PerformanceMonitor.clear();
      }
    };
  }, [])

  // Show loading skeleton when loading data
  if (isLoading || status === 'loading') {
    return <HomePageSkeleton />
  }

  // Show field owner dashboard on index route if authenticated as field owner
  if (status === 'authenticated' && user && user.role === 'FIELD_OWNER') {
    return <FieldOwnerHome />
  }

  // Otherwise show the regular landing page
  return (
    <PageWithSkeleton skeleton={<HeroSkeleton />}>
      <div className="bg-light-cream overflow-x-hidden">
        {/* Hero Section - Always loaded immediately as it's above the fold */}
        <HeroSection />

      {/* About Section - Lazy loaded with fade animation */}
      <LazySection 
        minHeight="500px"
        rootMargin="50px"
        animation="slideUp"
        delay={50}
        fallback={
          <div className="py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-20">
              <Skeleton className="h-12 w-64 mx-auto mb-8" />
              <div className="grid md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-48 w-full rounded-2xl" />
                ))}
              </div>
            </div>
          </div>
        }
      >
        <AboutSection />
      </LazySection>

      {/* How It Works Section - Lazy loaded with scale animation */}
      <LazySection 
        minHeight="400px"
        rootMargin="50px"
        animation="scale"
        delay={100}
        fallback={
          <div className="py-20 bg-light-cream">
            <div className="container mx-auto px-4 sm:px-6 lg:px-20">
              <Skeleton className="h-12 w-48 mx-auto mb-8" />
              <div className="grid md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                ))}
              </div>
            </div>
          </div>
        }
      >
        <HowItWorksSection />
      </LazySection>

      {/* Features Section - Lazy loaded with slide animation */}
      <LazySection 
        minHeight="500px"
        rootMargin="50px"
        animation="slideUp"
        delay={100}
        fallback={
          <div className="py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-20">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <Skeleton className="aspect-video rounded-2xl" />
                <div className="space-y-4">
                  <Skeleton className="h-10 w-3/4" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            </div>
          </div>
        }
      >
        <FeaturesSection />
      </LazySection>

      {/* Platform Section - Lazy loaded with fade animation */}
      <LazySection 
        minHeight="500px"
        rootMargin="50px"
        animation="fade"
        delay={100}
        fallback={
          <div className="py-20 bg-light-cream">
            <div className="container mx-auto px-4 sm:px-6 lg:px-20">
              <Skeleton className="h-10 w-72 mx-auto mb-8" />
              <div className="grid md:grid-cols-2 gap-8">
                <Skeleton className="aspect-video rounded-2xl" />
                <Skeleton className="aspect-video rounded-2xl" />
              </div>
            </div>
          </div>
        }
      >
        <PlatformSection />
      </LazySection>

      {/* Testimonials Section - Lazy loaded with scale animation */}
      <div id="testimonials">
        <LazySection 
          minHeight="400px"
          rootMargin="50px"
          animation="scale"
          delay={100}
          fallback={
            <div className="py-20 bg-white">
              <div className="container mx-auto px-4 sm:px-6 lg:px-20">
                <Skeleton className="h-10 w-64 mx-auto mb-8" />
                <div className="grid md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-64 w-full rounded-2xl" />
                  ))}
                </div>
              </div>
            </div>
          }
        >
          <TestimonialsSection />
        </LazySection>
      </div>

      {/* FAQ Section - Lazy loaded with slide up animation */}
      <LazySection 
        minHeight="500px"
        rootMargin="50px"
        animation="slideUp"
        delay={100}
        fallback={
          <div className="py-20 bg-light-cream">
            <div className="container mx-auto px-4 sm:px-6 lg:px-20">
              <Skeleton className="h-10 w-48 mx-auto mb-8" />
              <div className="max-w-3xl mx-auto space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        }
      >
        <FAQSectionWithImage />
      </LazySection>

      {/* Footer */}
      {/* <Footer /> */}
      </div>
    </PageWithSkeleton>
  )
}