import { useState } from "react"
import { Plus, Minus } from "lucide-react"

export interface FAQItem {
  question: string
  answer: string
}

export const defaultFaqs: FAQItem[] = [
  {
    question: "How do I book a field?",
    answer:
      "Simply search by postcode or use your location, choose a field and time slot, and confirm your booking through our secure checkout. You'll receive instant confirmation via email and in the app.",
  },
  {
    question: "How do I know what amenities are available?",
    answer:
      "Each field listing includes detailed information about available amenities such as water access, parking, shelter, agility equipment, and more. You can view all amenities in the field details section before booking.",
  },
  {
    question: "Can I cancel or reschedule my booking?",
    answer:
      "Yes, you can cancel your booking up to the cancellation window (default 24 hours) before your scheduled time for a full refund. Rescheduling is allowed up to 3 times per booking, within the same cancellation window. For recurring bookings, rescheduling is not available once any booking in the subscription has been completed, and the recurring interval cannot be changed.",
  },
  {
    question: "Is it safe for all dog breeds?",
    answer:
      "All our fields are fully fenced and secure, making them safe for dogs of all breeds and sizes. Field listings include fence height and type information to help you choose the most suitable space for your dog.",
  },
  {
    question: "What is your refund policy?",
    answer:
      "Full refunds are available for cancellations made at least 24 hours before your booking. Cancellations within 24 hours may receive a partial refund or credit for future bookings, depending on circumstances.",
  },
  {
    question: "How do I access the field after booking?",
    answer:
      "After booking, you'll receive detailed access instructions including the exact location, gate codes (if applicable), and any specific entry instructions. This information is also available in your booking confirmation within the app.",
  },
]

interface FAQListProps {
  faqs?: FAQItem[]
  title?: string
  hideTitle?: boolean
  variant?: "default" | "plain"
  loading?: boolean
}

export function FAQList({ faqs = defaultFaqs, title = "Frequently Asked Questions", hideTitle = false, variant = "default", loading = false }: FAQListProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number>(-1)

  const isPlain = variant === "plain"

  const wrapperClass = isPlain
    ? "rounded-[40px] bg-light-cream p-[32px]"
    : "bg-light-cream/80 bg-opacity-[30%] border  rounded-3xl p-6 sm:p-8 lg:p-10 shadow-lg"
  
  // Use default FAQs if no FAQs provided and not loading
  // This helps prevent hydration mismatches
  const displayFaqs = loading ? [] : (faqs.length > 0 ? faqs : defaultFaqs)

  return (
    <div className={wrapperClass}>
      {!hideTitle && (
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[48px] font-[700] text-dark-green mb-6 sm:mb-8 lg:mb-10 leading-tight sm:leading-[1.3] md:leading-[1.2] lg:leading-[60px]">
          {title}
        </h2>
      )}

      <div className="space-y-0">
        {loading ? (
          // Loading skeleton
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={`${isPlain ? "bg-white" : "bg-white/50"} rounded-2xl p-6 animate-pulse`}>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          // FAQ items - always show displayFaqs (which defaults to defaultFaqs if empty)
          displayFaqs.map((faq, index) => (
          <div
            key={index}
            className={
              isPlain
                ? `bg-white rounded-[40px] overflow-hidden ${index !== displayFaqs.length - 1 ? 'mb-4' : ''} ${openFaqIndex === index ? "border-yellow-300" : "border-transparent"}`
                : `transition-all duration-300 ${index !== displayFaqs.length - 1 ? 'mb-0' : ''}`
            }
          >
            {openFaqIndex === index ? (
              <div className={isPlain ? "rounded-[40px]  shadow-2xl border" : "bg-white rounded-[20px] border p-6"}>
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? -1 : index)}
                  className={isPlain ? "flex items-center justify-between w-full text-left p-6 transition-colors" : "flex items-center justify-between w-full text-left  mb-4 group"}
                >
                  <span className="font-[600] text-dark-green text-base xl:text-[18px] pr-4 leading-relaxed xl:leading-[28px]">
                    {faq.question}
                  </span>
                  <div
                    className={
                      isPlain
                        ? `w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors border bg-light-green border-light-green`
                        : `w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors bg-light-green`
                    }
                  >
                    <Minus className="w-5 h-5 text-white" />
                  </div>
                </button>

                <div className={isPlain ? "px-6 pb-6" : ""}>
                  <p className="text-sm xl:text-[16px] text-dark-green/80 leading-relaxed xl:leading-[24px] font-[400]">{faq.answer}</p>
                </div>
              </div>
            ) : (
              <div className={isPlain ? "" : "px-6"}>
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? -1 : index)}
                  className={isPlain ? "flex items-center justify-between w-full text-left p-6 hover:bg-gray-50 transition-colors" : "flex items-center justify-between w-full text-left py-5 sm:py-6 group"}
                >
                  <span className="font-[600] text-dark-green text-base xl:text-[18px] pr-4 leading-relaxed xl:leading-[28px]">
                    {faq.question}
                  </span>
                  <div
                    className={
                      isPlain
                        ? `w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors border bg-transparent border-light-green`
                        : `w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors text-light-green fill-light-green border-2 border-light-green bg-transparent`
                    }
                  >
                    <Plus className="w-5 h-5 text-light-green" />
                  </div>
                </button>
              </div>
            )}
          </div>
        ))
        )}
      </div>
    </div>
  )
}


