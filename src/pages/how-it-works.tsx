import { HowItWorksHeroSection } from "@/components/how-it-works/HowItWorksHeroSection"
import { ForDogOwnersSection } from "@/components/how-it-works/ForDogOwnersSection"
import { ForLandownersSection } from "@/components/how-it-works/ForLandownersSection"
import { FAQSectionWithImage } from "@/components/common/FAQSectionWithImage"

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Section 1: For Dog Owners */}
      <section className="px-4 sm:px-6 md:px-12 lg:px-16 xl:px-[80px] py-10 sm:py-12 md:py-16 xl:py-20 bg-light-cream">
        <div className="w-full">
          <HowItWorksHeroSection />
          <ForDogOwnersSection />
        </div>
      </section>

      {/* Section 2: For Landowners */}
      <ForLandownersSection />

      {/* FAQ Section */}
      <FAQSectionWithImage />
    </div>
  )
}