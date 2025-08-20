"use client"

import dynamic from "next/dynamic"
import { HeroSection } from "@/components/landing/HeroSection"
import FieldOwnerHome from "@/components/field-owner/FieldOwnerHome"
import { HomePageSkeleton } from "@/components/skeletons/HomePageSkeleton"
import { LazySection } from "@/components/common/LazySection"
import { useAuth } from "@/contexts/AuthContext"
import { useSession } from "next-auth/react"
import { useEffect, Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { PerformanceMonitor } from "@/utils/performance"

// Lazy load sections that are below the fold
const AboutSection = dynamic(
  () => import("@/components/landing/AboutSection").then(mod => ({ default: mod.AboutSection })),
  {
    loading: () => (
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-20">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    ),
  }
)

const HowItWorksSection = dynamic(
  () => import("@/components/landing/HowItWorksSection").then(mod => ({ default: mod.HowItWorksSection })),
  {
    loading: () => (
      <div className="py-20 bg-light-cream">
        <div className="container mx-auto px-4 sm:px-6 lg:px-20">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    ),
  }
)

const FeaturesSection = dynamic(
  () => import("@/components/landing/FeaturesSection").then(mod => ({ default: mod.FeaturesSection })),
  {
    loading: () => (
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-20">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    ),
  }
)

const PlatformSection = dynamic(
  () => import("@/components/landing/PlatformSection").then(mod => ({ default: mod.PlatformSection })),
  {
    loading: () => (
      <div className="py-20 bg-light-cream">
        <div className="container mx-auto px-4 sm:px-6 lg:px-20">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    ),
  }
)

const TestimonialsSection = dynamic(
  () => import("@/components/landing/TestimonialsSection").then(mod => ({ default: mod.TestimonialsSection })),
  {
    loading: () => (
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-20">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    ),
  }
)

const FAQSection = dynamic(
  () => import("@/components/landing/FAQSection").then(mod => ({ default: mod.FAQSection })),
  {
    loading: () => (
      <div className="py-20 bg-light-cream">
        <div className="container mx-auto px-4 sm:px-6 lg:px-20">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    ),
  }
)


export default function HomePage() {
  const { user, isLoading } = useAuth();
  const { status } = useSession();

  useEffect(() => {
    // Log user data for debugging
    console.log('[HomePage] User data from AuthContext:', user);
    console.log('[HomePage] User role:', user?.role);
    console.log('[HomePage] Session status:', status);
    console.log('[HomePage] Is loading:', isLoading);
    
    // Track page load performance
    if (!isLoading && status !== 'loading') {
      PerformanceMonitor.mark('home-page-interactive');
      PerformanceMonitor.measure('Time to Interactive', 'home-page-start', 'home-page-interactive');
    }
  }, [user, isLoading, status])
  
  useEffect(() => {
    // Mark the start of page load
    PerformanceMonitor.mark('home-page-start');
    
    return () => {
      // Clean up performance marks when component unmounts
      PerformanceMonitor.clear();
    };
  }, [])

  // Show loading skeleton while determining user role
  if (isLoading || status === 'loading') {
    return <HomePageSkeleton />
  }

  // Only show field owner dashboard if authenticated AND user is a field owner
  if (status === 'authenticated' && user && user.role === 'FIELD_OWNER') {
    return <FieldOwnerHome />
  }

  // Otherwise show the regular landing page
  return (
    <div className="bg-light-cream overflow-x-hidden">
      {/* Hero Section - Always loaded immediately as it's above the fold */}
      <HeroSection />

      {/* About Section - Lazy loaded */}
      <LazySection 
        minHeight="500px"
        rootMargin="200px"
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

      {/* How It Works Section - Lazy loaded */}
      <LazySection 
        minHeight="400px"
        rootMargin="200px"
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

      {/* Features Section - Lazy loaded */}
      <LazySection 
        minHeight="500px"
        rootMargin="200px"
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

      {/* Platform Section - Lazy loaded */}
      <LazySection 
        minHeight="500px"
        rootMargin="200px"
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

      {/* Testimonials Section - Lazy loaded */}
      <div id="testimonials">
        <LazySection 
          minHeight="400px"
          rootMargin="200px"
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

      {/* FAQ Section - Lazy loaded */}
      <LazySection 
        minHeight="500px"
        rootMargin="200px"
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
        <FAQSection />
      </LazySection>

      {/* Footer */}
      {/* <Footer /> */}
    </div>
  )
}