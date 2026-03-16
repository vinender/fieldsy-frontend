import React, { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { GetStaticProps } from "next"
import { useRouter } from "next/router"
import { AboutHeroSection } from "@/components/about/AboutHeroSection"
import { LazySection } from "@/components/common/LazySection"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useAboutPage } from "@/hooks/api/useAboutPage"


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


export default function AboutPage({ aboutData: staticAboutData }: AboutPageProps) {
  const router = useRouter()
  const [isMobileApp, setIsMobileApp] = useState(false);

  // Client-side fetch — always shows latest data from DB
  const { data: liveAboutData } = useAboutPage();

  // Prefer live client-side data, fall back to ISR static data
  const aboutData = liveAboutData || staticAboutData;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const isApp = params.get('mobile') === 'true' ||
        params.get('source') === 'mobile' ||
        params.get('app') === 'true';
      setIsMobileApp(isApp);
    }
  }, []);

  return (
    <div className={cn(
      "min-h-screen overflow-x-hidden",
      isMobileApp ? "pt-0" : "pt-20"
    )}>



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
    // Fetch about page data at build time — serves as initial data until client-side fetch completes
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/about-page`)
    const aboutData = await response.json()

    return {
      props: {
        aboutData: aboutData.data || null,
      },
      // Revalidate every 5 minutes — client-side useAboutPage() ensures fresh data on mount
      revalidate: 300,
    }
  } catch (error) {
    console.error('Error fetching about page data:', error)
    return {
      props: {
        aboutData: null,
      },
      revalidate: 60,
    }
  }
}
