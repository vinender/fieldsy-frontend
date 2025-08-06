import { Plus, Minus } from "lucide-react"
import { useState } from "react"

const defaultFaqs = [
  {
    question: "How do I book a field?",
    answer: "Simply search by postcode or use your location, choose a field and time slot, and confirm your booking through our secure checkout. You'll receive instant confirmation via email and in the app."
  },
  {
    question: "How do I know what amenities are available?",
    answer: "Each field listing includes detailed information about available amenities such as water access, parking, shelter, agility equipment, and more. You can view all amenities in the field details section before booking."
  },
  {
    question: "Can I cancel or reschedule my booking?",
    answer: "Yes, you can cancel or reschedule your booking up to 24 hours before your scheduled time through the app or website. Cancellations made within 24 hours may be subject to our cancellation policy."
  },
  {
    question: "Is it safe for all dog breeds?",
    answer: "All our fields are fully fenced and secure, making them safe for dogs of all breeds and sizes. Field listings include fence height and type information to help you choose the most suitable space for your dog."
  },
  {
    question: "What is your refund policy?",
    answer: "Full refunds are available for cancellations made at least 24 hours before your booking. Cancellations within 24 hours may receive a partial refund or credit for future bookings, depending on circumstances."
  },
  {
    question: "How do I access the field after booking?",
    answer: "After booking, you'll receive detailed access instructions including the exact location, gate codes (if applicable), and any specific entry instructions. This information is also available in your booking confirmation within the app."
  }
]

interface FAQItem {
  question: string
  answer: string
}

interface FAQSectionWithImageProps {
  faqs?: FAQItem[]
  title?: string
}

export function FAQSectionWithImage({ 
  faqs = defaultFaqs,
  title = "Frequently Asked Questions"
}: FAQSectionWithImageProps) {
  const [openFaq, setOpenFaq] = useState<number>(-1)

  return (
    <section className="relative px-4 sm:px-6 md:px-12 lg:px-16 xl:px-[80px] py-10 sm:py-12 md:py-16 lg:py-20 overflow-hidden bg-light-cream max-w-full">
      {/* Background decorative circle */}
      <div 
        className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-0 bg-cream"
      />
      
      <div className="w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-stretch">
          {/* Left Section - FAQ */}
          <div className="bg-cream bg-opacity-[30%] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-lg h-fit">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[48px] font-[700] text-dark-green mb-6 sm:mb-8 lg:mb-10 leading-tight sm:leading-[1.3] md:leading-[1.2] lg:leading-[60px]">
              {title}
            </h2>
            
            <div className="space-y-0">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className={`border-b border-dark-green/20 ${index === 0 ? 'border-t' : ''} ${openFaq === index ? 'bg-white -mx-6 px-6 rounded-[20px]' : ''} transition-all duration-300`}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                    className="flex items-center justify-between w-full text-left py-5 sm:py-6 group"
                  >
                    <span className="font-[600] text-dark-green text-base xl:text-[18px] pr-4 leading-relaxed xl:leading-[28px]">
                      {faq.question}
                    </span>
                    <div 
                      className={`w-8 h-8 rounded-full ${openFaq === index ? 'bg-green' : 'bg-gray-200'} flex items-center justify-center flex-shrink-0 transition-colors`}
                    >
                      {openFaq === index ? (
                        <Minus className="w-5 h-5 text-white" />
                      ) : (
                        <Plus className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                  </button>
                  
                  {openFaq === index && (
                    <div className="pb-5 sm:pb-6">
                      <p className="text-sm xl:text-[16px] text-dark-green/80 leading-relaxed xl:leading-[24px] font-[400]">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Section - Dog Image with Background */}
          <div className="relative rounded-3xl p-10 sm:p-16 lg:p-20 overflow-hidden min-h-[400px] lg:min-h-[600px]">
            {/* Background Image */}
            <div className="absolute inset-0">
              <img 
                src="/faq/dog-bg.png"
                alt="Background"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Dog Image */}
            <div className="relative h-full flex items-center justify-center">
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