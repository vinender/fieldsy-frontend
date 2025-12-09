import { FAQList, type FAQItem, defaultFaqs } from "@/components/common/FAQList"
import { useFAQs } from "@/hooks/queries/useFAQQueries"

interface FAQSectionWithImageProps {
  title?: string
}

export function FAQSectionWithImage({ title = "Frequently Asked Questions" }: FAQSectionWithImageProps) {
  const { faqs: dynamicFAQs, loading } = useFAQs()
  
  // Convert dynamic FAQs to FAQItem format - show first 6 for the homepage
  // Use default FAQs if no dynamic FAQs available
  const faqs: FAQItem[] = dynamicFAQs.length > 0
    ? dynamicFAQs.slice(0, 6).map(faq => ({
        question: faq.question,
        answer: faq.answer
      }))
    : defaultFaqs.slice(0, 6)

  return (
    <section className="relative px-4 sm:px-6 md:px-12 lg:px-16 xl:px-[80px] py-10 sm:py-12 md:py-16 lg:py-20 overflow-hidden bg-cream max-w-full">
      
      <div className="w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Section - FAQ */}
          <div className="order-2 lg:order-1">
            <FAQList faqs={faqs} title={title} loading={loading} />
          </div>

          {/* Right Section - Dog Image with Green Card */}
          <div className="relative order-1 lg:order-2 flex flex-col items-center justify-center pt-6 sm:pt-8 md:pt-10 px-4 sm:px-0">

            {/* Background Blob - Positioned absolutely behind the content */}
            <div className="absolute inset-0 flex items-center justify-center -z-10 translate-y-[-5%] sm:translate-y-[-10%] scale-100 sm:scale-110">
              <img
                src="/faq/dog-bg.png"
                alt="Background shape"
                className="w-[90%] sm:w-full h-full object-contain opacity-70 sm:opacity-80"
              />
            </div>

            {/* Dog Image - Z-index higher to sit on top of the card edge */}
            <div className="relative z-20 w-[140px] xs:w-[160px] sm:w-[200px] md:w-[220px] lg:w-[260px] -mb-4 xs:-mb-6 sm:-mb-8 md:-mb-6 lg:-mb-2">
              <img
                src='/faq-dog.png'
                alt="Happy dog"
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>

            {/* Green App Download Card */}
            <div className="relative z-10 w-full max-w-[340px] xs:max-w-[380px] sm:max-w-[420px] md:max-w-[460px] lg:max-w-[500px] bg-[#8FB366] rounded-[20px] sm:rounded-[24px] lg:rounded-[26px] p-6 pt-8 xs:p-7 xs:pt-10 sm:p-8 sm:pt-12 md:p-10 md:pt-14 text-center shadow-xl">
              <h2 className="text-white text-2xl xs:text-[26px] sm:text-3xl md:text-4xl font-bold leading-tight mb-5 sm:mb-6 md:mb-8">
                Download The <br />
                Fieldsy App Today!
              </h2>

              <div className="flex  xs:flex-row items-center justify-center gap-3 sm:gap-4">
                 {/* Google Play Button */}
                 <button className="transition-transform hover:scale-105 active:scale-95 w-full xs:w-auto">
                    <img
                      src="/android.svg"
                      alt="Get it on Google Play"
                      className="h-11 xs:h-12 sm:h-13 md:h-14 object-contain mx-auto"
                    />
                 </button>

                 {/* App Store Button */}
                 <button className="transition-transform hover:scale-105 active:scale-95 w-full xs:w-auto">
                    <img
                      src="/ios.svg"
                      alt="Download on the App Store"
                      className="h-11 xs:h-12 sm:h-13 md:h-14 object-contain mx-auto"
                    />
                 </button>
              </div>
            </div>

          </div>
          
        </div>
      </div>
    </section>
  )
}