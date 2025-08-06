import { AboutHeroSection } from "@/components/about/AboutHeroSection"
import { AboutMissionSection } from "@/components/about/AboutMissionSection"
import { AboutWhoWeAreSection } from "@/components/about/AboutWhoWeAreSection"
import { AboutWhatWeDoSection } from "@/components/about/AboutWhatWeDoSection"
import { AboutWhyFieldsySection } from "@/components/about/AboutWhyFieldsySection"
import { FAQSectionWithImage } from "@/components/common/FAQSectionWithImage"

export default function AboutPage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <AboutHeroSection />
      <AboutMissionSection />
      <AboutWhoWeAreSection />
      <AboutWhatWeDoSection />
      <AboutWhyFieldsySection />
      <FAQSectionWithImage />
    </div>
  )
}