import dynamic from "next/dynamic"
import { GetStaticProps } from "next"
import { AboutHeroSection } from "@/components/about/AboutHeroSection"
import { LazySection } from "@/components/common/LazySection"
import { Skeleton } from "@/components/ui/skeleton"
import axiosClient from "@/lib/api/axios-client"

// Lazy load sections that are below the fold
const AboutMissionSection = dynamic(
  () => import("@/components/about/AboutMissionSection").then(mod => ({ default: mod.AboutMissionSection })),
  { ssr: false }
)

const AboutWhoWeAreSection = dynamic(
  () => import("@/components/about/AboutWhoWeAreSection").then(mod => ({ default: mod.AboutWhoWeAreSection })),
  { ssr: false }
)

const AboutWhatWeDoSection = dynamic(
  () => import("@/components/about/AboutWhatWeDoSection").then(mod => ({ default: mod.AboutWhatWeDoSection })),
  { ssr: false }
)

const AboutWhyFieldsySection = dynamic(
  () => import("@/components/about/AboutWhyFieldsySection").then(mod => ({ default: mod.AboutWhyFieldsySection })),
  { ssr: false }
)

const FAQSectionWithImage = dynamic(
  () => import("@/components/common/FAQSectionWithImage").then(mod => ({ default: mod.FAQSectionWithImage })),
  { ssr: false }
)

interface AboutPageProps {
  aboutData?: any
}

export default function AboutPage({ aboutData }: AboutPageProps) {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section - Always loaded immediately as it's above the fold */}
      <AboutHeroSection data={aboutData?.heroSection} loading={false} />
      
      {/* Mission Section - Lazy loaded with intersection observer */}
      <LazySection 
        minHeight="400px"
        threshold={0.1}
        rootMargin="100px"
      >
        <AboutMissionSection data={aboutData?.missionSection} loading={false} />
      </LazySection>

      {/* Who We Are Section - Lazy loaded */}
      <LazySection 
        minHeight="500px"
        threshold={0.1}
        rootMargin="100px"
      >
        <AboutWhoWeAreSection data={aboutData?.whoWeAreSection} loading={false} />
      </LazySection>

      {/* What We Do Section - Lazy loaded */}
      <LazySection 
        minHeight="400px"
        threshold={0.1}
        rootMargin="100px"
      >
        <AboutWhatWeDoSection data={aboutData?.whatWeDoSection} loading={false} />
      </LazySection>

      {/* Why Fieldsy Section - Lazy loaded */}
      <LazySection 
        minHeight="400px"
        threshold={0.1}
        rootMargin="100px"
      >
        <AboutWhyFieldsySection data={aboutData?.whyFieldsySection} loading={false} />
      </LazySection>

      {/* FAQ Section - Lazy loaded */}
      <LazySection 
        minHeight="500px"
        threshold={0.1}
        rootMargin="100px"
      >
        <FAQSectionWithImage />
      </LazySection>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    // Fetch about page data at build time
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/about-page`)
    const aboutData = await response.json()

    return {
      props: {
        aboutData: aboutData.data || null,
      },
      // Revalidate every hour (ISR - Incremental Static Regeneration)
      revalidate: 3600,
    }
  } catch (error) {
    console.error('Error fetching about page data:', error)
    return {
      props: {
        aboutData: null,
      },
      // Try again in 60 seconds if there was an error
      revalidate: 60,
    }
  }
}