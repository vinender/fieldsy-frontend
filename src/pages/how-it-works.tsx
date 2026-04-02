import dynamic from "next/dynamic"
import { HowItWorksHeroSection } from "@/components/how-it-works/HowItWorksHeroSection"
import { LazySection } from "@/components/common/LazySection"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/AuthContext"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"

// Lazy load sections that are below the fold
const ForDogOwnersSection = dynamic(
  () => import("@/components/how-it-works/ForDogOwnersSection").then(mod => ({ default: mod.ForDogOwnersSection })),
  { ssr: false }
)

const ForLandownersSection = dynamic(
  () => import("@/components/how-it-works/ForLandownersSection").then(mod => ({ default: mod.ForLandownersSection })),
  { ssr: false }
)

const FAQSectionWithImage = dynamic(
  () => import("@/components/common/FAQSectionWithImage").then(mod => ({ default: mod.FAQSectionWithImage })),
  { ssr: false }
)

export default function HowItWorksPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Refetch settings on window refocus and tab visibility change
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

  // Determine which sections to show based on user role
  const showDogOwnerSection = !user || user.role !== 'FIELD_OWNER';
  const showLandownerSection = !user || user.role !== 'DOG_OWNER';
  
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section - Always shown for all users */}
      <section className="px-4 sm:px-6 md:px-12 lg:px-16 xl:px-[80px] pt-10 xl:pt-20 bg-light-cream">
        <div className="w-full">
          {/* Hero Section - Always loaded immediately */}
          <HowItWorksHeroSection />
        </div>
      </section>

      {/* Section 1: For Dog Owners */}
      {showDogOwnerSection && (
        <section className="px-4 sm:px-6 md:px-12 lg:px-16 xl:px-[80px] pb-10  bg-light-cream">
          <div className="w-full">
            {/* For Dog Owners - Lazy loaded */}
            <LazySection
              minHeight="400px"
              threshold={0.01}
              rootMargin="500px"
            >
              <ForDogOwnersSection />
            </LazySection>
          </div>
        </section>
      )}

      {/* Section 2: For Landowners - Lazy loaded */}
      {showLandownerSection && (
        <LazySection
          minHeight="500px"
          threshold={0.01}
          rootMargin="500px"
        >
          <ForLandownersSection hideClaimButton={user?.role === 'FIELD_OWNER'} />
        </LazySection>
      )}

      {/* FAQ Section - Lazy loaded */}
      <LazySection
        minHeight="400px"
        threshold={0.01}
        rootMargin="500px"
      >
        <FAQSectionWithImage />
      </LazySection>
    </div>
  )
}