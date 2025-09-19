import { AboutHeroSection } from "@/components/about/AboutHeroSection"
import { AboutMissionSection } from "@/components/about/AboutMissionSection"
import { AboutWhoWeAreSection } from "@/components/about/AboutWhoWeAreSection"
import { AboutWhatWeDoSection } from "@/components/about/AboutWhatWeDoSection"
import { AboutWhyFieldsySection } from "@/components/about/AboutWhyFieldsySection"
import { FAQSectionWithImage } from "@/components/common/FAQSectionWithImage"
import { useAboutPage } from "@/hooks/api/useAboutPage"

export default function AboutPage() {
  const { data, isLoading } = useAboutPage()

  return (
    <div className="min-h-screen overflow-x-hidden">
      <AboutHeroSection data={data?.heroSection} loading={isLoading} />
      <AboutMissionSection data={data?.missionSection} loading={isLoading} />
      <AboutWhoWeAreSection data={data?.whoWeAreSection} loading={isLoading} />
      <AboutWhatWeDoSection data={data?.whatWeDoSection} loading={isLoading} />
      <AboutWhyFieldsySection data={data?.whyFieldsySection} loading={isLoading} />
      <FAQSectionWithImage />
    </div>
  )
}