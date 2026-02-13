import { useState } from "react"
import { Plus, Minus } from "lucide-react"

export interface FAQItem {
  question: string
  answer: string
}

const defaultFaqs: FAQItem[] = [
  {
    question: "How do I book a field?",
    answer: "Simply search by postcode or use your location, choose a field and time slot, and confirm your booking through our secure checkout. You'll receive instant confirmation via email and in the app.",
  },
  {
    question: "How do I know what amenities are available?",
    answer: "Each field listing includes detailed information about available amenities such as water access, parking, shelter, agility equipment, and more. You can view all amenities in the field details section before booking.",
  },
  {
    question: "Can I cancel or reschedule my booking?",
    answer: "Yes, you can cancel or reschedule your booking up to 12 hours before your scheduled time. Cancellations made within 12 hours may be subject to our cancellation policy. Rescheduling is unlimited - you can reschedule as many times as you like up to 12 hours before. For recurring bookings, rescheduling is not available once any booking in the subscription has been completed.",
  },
  {
    question: "Is it safe for all dog breeds?",
    answer: "All our fields are fully fenced and secure, making them safe for dogs of all breeds and sizes. Field listings include fence height and type information to help you choose the most suitable space for your dog.",
  },
  {
    question: "What is your refund policy?",
    answer: "Full refunds are available for cancellations made at least 12 hours before your booking. Cancellations within 12 hours may receive a partial refund or credit for future bookings, depending on circumstances.",
  },
  {
    question: "How do I access the field after booking?",
    answer: "After booking, you'll receive detailed access instructions including the exact location, gate codes (if applicable), and any specific entry instructions. This information is also available in your booking confirmation within the app.",
  },
]

interface FAQPageListProps {
  faqs?: FAQItem[]
  loading?: boolean
}

export function FAQPageList({ faqs = [], loading = false }: FAQPageListProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number>(-1)

  // Use provided FAQs or fall back to default FAQs
  const displayFaqs = loading ? [] : (faqs.length > 0 ? faqs : defaultFaqs)

  return (
    <div className="rounded-[40px] bg-white  p-[32px]">
      <div className="space-y-0">
        {loading ? (
          // Loading skeleton
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          // FAQ items
          displayFaqs.map((faq, index) => (
            <div
              key={index}
              className={`bg-white rounded-[40px] overflow-hidden ${
                index !== displayFaqs.length - 1 ? 'mb-4' : ''
              }`}
            >
              {openFaqIndex === index ? (
                <div className="rounded-[40px] shadow-xl border">
                  <button
                    onClick={() => setOpenFaqIndex(-1)}
                    className="flex items-center justify-between w-full text-left p-6 transition-colors"
                  >
                    <span className="font-[600] text-dark-green text-base xl:text-[18px] pr-4 leading-relaxed xl:leading-[28px]">
                      {faq.question}
                    </span>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors border bg-light-green border-light-green">
                      <Minus className="w-5 h-5 text-white" />
                    </div>
                  </button>

                  <div className="px-6 pb-6">
                    <p className="text-sm xl:text-[16px] text-dark-green/80 leading-relaxed xl:leading-[24px] font-[400]">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setOpenFaqIndex(index)}
                  className="flex items-center justify-between w-full text-left p-6 hover:bg-gray-50 transition-colors"
                >
                  <span className="font-[600] text-dark-green text-base xl:text-[18px] pr-4 leading-relaxed xl:leading-[28px]">
                    {faq.question}
                  </span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors border bg-transparent border-light-green">
                    <Plus className="w-5 h-5 text-light-green" />
                  </div>
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
