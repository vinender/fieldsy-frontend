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
      "Yes, you can cancel or reschedule your booking up to 24 hours before your scheduled time through the app or website. Cancellations made within 24 hours may be subject to our cancellation policy.",
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
}

export function FAQList({ faqs = defaultFaqs, title = "Frequently Asked Questions", hideTitle = false, variant = "default" }: FAQListProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number>(-1)

  const isPlain = variant === "plain"

  const wrapperClass = isPlain
    ? ""
    : "bg-cream bg-opacity-[30%] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-lg"

  return (
    <div className={wrapperClass}>
      {!hideTitle && (
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[48px] font-[700] text-dark-green mb-6 sm:mb-8 lg:mb-10 leading-tight sm:leading-[1.3] md:leading-[1.2] lg:leading-[60px]">
          {title}
        </h2>
      )}

      <div className="space-y-0">
        {faqs.map((faq, index) => (
          <div key={index}
            className={
              isPlain
                ? `bg-white rounded-2xl overflow-hidden shadow-sm mb-4 border ${openFaqIndex === index ? "border-yellow-300" : "border-transparent"}`
                : ` ${openFaqIndex === index ? "bg-white  px-6 py-4   rounded-[20px]" : ""} transition-all px-6  duration-300`
            }
          >
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
                    ? `w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors border ${
                        openFaqIndex === index
                          ? "bg-light-green border-light-green"
                          : "bg-transparent border-light-green"
                      }`
                    : `w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                        openFaqIndex === index ? "bg-green" : "bg-gray-200"
                      }`
                }
              >
                {openFaqIndex === index ? (
                  <Minus className={`w-5 h-5 ${isPlain ? "text-white" : "text-white"}`} />
                ) : (
                  <Plus className={`w-5 h-5 ${isPlain ? "text-light-green" : "text-gray-600"}`} />
                )}
              </div>
            </button>

            {openFaqIndex === index && (
              <div className={isPlain ? "px-6 pb-6" : "pb-5 sm:pb-6"}>
                <p className="text-sm xl:text-[16px] text-dark-green/80 leading-relaxed xl:leading-[24px] font-[400]">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}


