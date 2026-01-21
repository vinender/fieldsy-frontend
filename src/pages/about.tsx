import React, { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { GetStaticProps } from "next"
import { useRouter } from "next/router"
import { AboutHeroSection } from "@/components/about/AboutHeroSection"
import { LazySection } from "@/components/common/LazySection"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
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
  const router = useRouter()
  const [isMobileApp, setIsMobileApp] = useState(false);

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

      {/* About Us Label */}
      {/* <div className="px-4 sm:px-6 md:px-12 lg:px-16 xl:px-[80px]">
        <h1 className="text-[29px] font-semibold text-dark-green mt-5">
          About us
        </h1>
      </div> */}

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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/about-page`)
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