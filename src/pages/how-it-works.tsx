import dynamic from "next/dynamic"
import { HowItWorksHeroSection } from "@/components/how-it-works/HowItWorksHeroSection"
import { LazySection } from "@/components/common/LazySection"
import { Skeleton } from "@/components/ui/skeleton"

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
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Section 1: For Dog Owners */}
      <section className="px-4 sm:px-6 md:px-12 lg:px-16 xl:px-[80px] py-10 sm:py-12 md:py-16 xl:py-20 bg-light-cream">
        <div className="w-full">
          {/* Hero Section - Always loaded immediately */}
          <HowItWorksHeroSection />
          
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

      {/* Section 2: For Landowners - Lazy loaded */}
      <LazySection 
        minHeight="500px"
        threshold={0.01}
        rootMargin="500px"
      >
        <ForLandownersSection />
      </LazySection>

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