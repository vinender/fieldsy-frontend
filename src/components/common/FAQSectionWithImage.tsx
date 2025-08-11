import { FAQList, defaultFaqs, type FAQItem } from "@/components/common/FAQList"

interface FAQSectionWithImageProps {
  faqs?: FAQItem[]
  title?: string
}

export function FAQSectionWithImage({ faqs = defaultFaqs, title = "Frequently Asked Questions" }: FAQSectionWithImageProps) {

  return (
    <section className="relative px-4 sm:px-6 md:px-12 lg:px-16 xl:px-[80px] py-10 sm:py-12 md:py-16 lg:py-20 overflow-hidden bg-light-cream max-w-full">
      {/* Background decorative circle */}
      <div 
        className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-0 bg-cream"
      />
      
      <div className="w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* Left Section - FAQ */}
          <FAQList faqs={faqs} title={title} />

          {/* Right Section - Dog Image with Background */}
          <div className="relative rounded-3xl overflow-hidden h-[400px] lg:h-[600px] xl:h-[700px] lg:self-start">
            {/* Background Image */}
            <div className="absolute inset-0">
              <img 
                src="/faq/dog-bg.png"
                alt="Background"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Dog Image */}
            <div className="absolute inset-0 p-10 sm:p-16 lg:p-20 flex items-center justify-center">
              <img 
                src="/faq/dog.png"
                alt="Happy dog"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}