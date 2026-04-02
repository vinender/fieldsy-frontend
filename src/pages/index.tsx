import dynamic from "next/dynamic"
import { GetStaticProps } from "next"
import { HeroSection } from "@/components/landing/HeroSection"

// Dynamic import — only loaded when user is an authenticated field owner
const FieldOwnerHome = dynamic(
  () => import("@/components/field-owner/FieldOwnerHome"),
  { ssr: false, loading: () => <HomePageSkeleton /> }
)
import { HomePageSkeleton } from "@/components/skeletons/HomePageSkeleton"
import { LazySection } from "@/components/common/LazySection"
import { PageWithSkeleton } from "@/components/common/PageWithSkeleton"
import { HeroSkeleton } from "@/components/skeletons/PageSkeletons"
import { useAuth } from "@/contexts/AuthContext"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { PerformanceMonitor } from "@/utils/performance"
import { useQueryClient } from "@tanstack/react-query"


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



import { usePublicSettings } from "@/hooks/usePublicSettings"
import { BypassComingSoon } from "@/components/landing/BypassComingSoon"

interface HomePageProps {
  settings: any | null;
  faqs: any | null;
}

export default function HomePage({ settings: staticSettings, faqs: staticFaqs }: HomePageProps) {
  const { user, isLoading: authLoading } = useAuth();
  const { data: settings, isLoading: settingsLoading } = usePublicSettings();
  const [mounted, setMounted] = useState(false);
  const queryClient = useQueryClient();

  // For coming-soon check, always prefer client-side settings (which include cookie/IP access check).
  // Only fall back to staticSettings for non-access-related data (bannerText, etc.).
  const resolvedSettings = settings || staticSettings;

  // Use session hook to get authentication status and session data (includes role)
  const { data: session, status } = useSession({
    required: false,
    onUnauthenticated() {
      // Do nothing - we allow unauthenticated access to landing page
    },
  });

  // Get role from either AuthContext user or session (session is faster after login)
  const userRole = user?.role || (session?.user as any)?.role;

  // Prevent hydration mismatch: auth-dependent rendering only after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Refetch data on window refocus and tab visibility change (without page reload)
  useEffect(() => {
    const handleFocus = async () => {
      try {
        // Invalidate React Query cache to force fresh fetch in background
        await queryClient.invalidateQueries({ queryKey: ['publicSettings'] });
      } catch (error) {
        console.error('Error refetching data on focus:', error);
      }
    };

    const handleVisibilityChange = async () => {
      // Fetch fresh data when tab becomes visible
      if (document.visibilityState === 'visible') {
        await handleFocus();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [queryClient]);

  useEffect(() => {
    // Only track performance in development
    if (process.env.NODE_ENV === 'development') {
      if (!authLoading && status !== 'loading') {
        PerformanceMonitor.mark('home-page-interactive');
        PerformanceMonitor.measure('Time to Interactive', 'home-page-start', 'home-page-interactive');
      }
    }
  }, [authLoading, status])


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

  // Before mount, while session loads, or while settings load — show a minimal spinner
  // Prevents hero flash before coming-soon gate and field-owner dashboard flash
  if (!mounted || status === 'loading' || settingsLoading || (status === 'authenticated' && !userRole)) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-light-cream">
        <div className="w-10 h-10 border-4 border-green/30 border-t-green rounded-full animate-spin" />
      </div>
    )
  }

  // Coming Soon gate — only use CLIENT-SIDE settings (which include cookie/IP check).
  if (settings && settings.isLive === false && !settings.hasAccess) {
    return <BypassComingSoon />
  }

  // Show field owner dashboard on index route if authenticated as field owner
  if (status === 'authenticated' && userRole === 'FIELD_OWNER') {
    return <FieldOwnerHome />
  }


  // Otherwise show the regular landing page

  return (
    <PageWithSkeleton skeleton={<HeroSkeleton />}>
      <div className="bg-light-cream overflow-x-hidden">
        {/* Hero Section - Always loaded immediately as it's above the fold */}
        <HeroSection settings={staticSettings} />

        {/* About Section - Lazy loaded with fade animation */}
        <LazySection
          minHeight="500px"
          rootMargin="400px"
          animation="slideUp"
          delay={50}
          fallback={
            <div className="py-20 bg-white">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-20">
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
          rootMargin="400px"
          animation="scale"
          delay={100}
          fallback={
            <div className="py-20 bg-light-cream">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-20">
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
          <HowItWorksSection settings={resolvedSettings} />
        </LazySection>

        {/* Features Section - Lazy loaded with slide animation */}
        <LazySection
          minHeight="500px"
          rootMargin="400px"
          animation="slideUp"
          delay={100}
          fallback={
            <div className="py-20 bg-white">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-20">
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
          rootMargin="400px"
          animation="fade"
          delay={100}
          fallback={
            <div className="py-20 bg-light-cream">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-20">
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
            rootMargin="400px"
            animation="scale"
            delay={100}
            fallback={
              <div className="py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-20">
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
          rootMargin="400px"
          animation="slideUp"
          delay={100}
          fallback={
            <div className="py-20 bg-light-cream">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-20">
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
          <FAQSectionWithImage initialFaqs={staticFaqs} />
        </LazySection>

        {/* Footer */}
        {/* <Footer /> */}
      </div>
    </PageWithSkeleton>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  let settings = null;
  let faqs = null;

  try {
    const [settingsRes, faqsRes] = await Promise.all([
      fetch(`${API}/settings/public`),
      fetch(`${API}/faqs`),
    ]);

    if (settingsRes.ok) {
      const settingsData = await settingsRes.json();
      settings = settingsData?.data || null;
    }

    if (faqsRes.ok) {
      const faqsData = await faqsRes.json();
      faqs = faqsData?.data || null;
    }
  } catch (error) {
    console.error('Error fetching home page data:', error);
  }

  return {
    props: {
      settings,
      faqs,
    },
    // Revalidate every 30 minutes
    revalidate: 1800,
  };
};
