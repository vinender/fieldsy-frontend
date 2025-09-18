import { useState } from "react"
import { Plus, Minus } from "lucide-react"
import { useFAQs } from "@/hooks/queries/useFAQQueries"

interface FAQItem {
  question: string
  answer: string
}

// Default FAQs to show during SSR/initial render
const defaultFaqs: FAQItem[] = [
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

interface FAQSectionProps {
  title?: string
  showContactSupport?: boolean
}

export function FAQSection({ 
  title = "Frequently Asked Questions", 
  showContactSupport = true 
}: FAQSectionProps) {
  const [openFaq, setOpenFaq] = useState<number>(-1)
  const { faqs: dynamicFAQs, loading } = useFAQs()
  
  // Convert dynamic FAQs to FAQItem format - limit to 6 items for the section
  // Use default FAQs if no dynamic FAQs available
  const faqs: FAQItem[] = dynamicFAQs.length > 0 
    ? dynamicFAQs.slice(0, 6).map(faq => ({
        question: faq.question,
        answer: faq.answer
      }))
    : defaultFaqs

  return (
    <section className="px-4 sm:px-6 md:px-12 lg:px-16 xl:px-[80px] py-10 sm:py-12 md:py-16 lg:py-20 bg-white">
      <div className="w-full">
        {/* Header */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[48px] font-[700] text-center text-dark-green mb-6 sm:mb-8 md:mb-12 lg:mb-16 leading-tight sm:leading-[1.3] md:leading-[1.2] lg:leading-[60px]">
          {title}
        </h2>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto space-y-4">
          {loading ? (
            // Loading skeleton
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-light-cream rounded-2xl p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                </div>
              ))}
            </div>
          ) : (
            // Always show FAQs (either dynamic or default)
            faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-light-cream rounded-2xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                className="flex items-center justify-between w-full text-left p-6 hover:bg-cream/50 transition-colors"
              >
                <h3 className="text-base xl:text-[18px] font-[600] text-dark-green pr-4 leading-relaxed xl:leading-[28px]">
                  {faq.question}
                </h3>
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    openFaq === index 
                      ? 'bg-green' 
                      : 'bg-gray-200'
                  }`}
                >
                  {openFaq === index ? (
                    <Minus className="w-5 h-5 text-white" />
                  ) : (
                    <Plus className="w-5 h-5 text-gray-600" />
                  )}
                </div>
              </button>
              
              {openFaq === index && (
                <div className="px-6 pb-6">
                  <p className="text-sm xl:text-[16px] text-dark-green/80 leading-relaxed xl:leading-[24px] font-[400]">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))
          )}
        </div>

        {/* Contact Support */}
        {showContactSupport && (
          <div className="mt-12 sm:mt-16 text-center">
            <p className="text-dark-green/80 mb-4 text-base xl:text-[18px] font-[400]">
              Can't find what you're looking for?
            </p>
            <button 
              className="px-8 py-3 rounded-full text-white font-[600] bg-green hover:bg-light-green transition-colors"
            >
              Contact Support
            </button>
          </div>
        )}
      </div>
    </section>
  )
}