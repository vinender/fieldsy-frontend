import { useState } from "react"
import { Search } from "lucide-react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { FAQList, type FAQItem } from "@/components/common/FAQList"

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("")
  // FAQ accordion state is managed inside FAQList

  const faqs: FAQItem[] = [
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
    },
    {
      question: "Can I leave a review after my visit?",
      answer: "Yes! We encourage all users to leave reviews after their visits. You can rate your experience and leave feedback through the app or website within 7 days of your visit. Your reviews help other dog owners and field owners improve their services."
    },
    {
      question: "Are all fields fully fenced and secure?",
      answer: "Yes, all fields listed on Fieldsy are required to be fully enclosed with secure fencing. We verify fencing details during the onboarding process, and field owners must maintain these safety standards."
    },
    {
      question: "Can I bring more than one dog?",
      answer: "Yes, you can bring multiple dogs to most fields. The maximum number of dogs allowed varies by field and is clearly stated in each listing. Some fields may charge an additional fee for extra dogs."
    }
  ]

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white overflow-x-hidden pt-24">
        <div className="px-4 sm:px-6 md:px-12 lg:px-16 xl:px-[80px] py-10 sm:py-12 md:py-16 xl:py-20">
          <div className="w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
              <h1 className="text-2xl sm:text-3xl md:text-4xl xl:text-[48px] font-[700] text-dark-green leading-tight sm:leading-[1.3] md:leading-[1.2] xl:leading-[60px]">
                Frequently Asked Questions
              </h1>
              
              {/* Search Bar */}
              <div className="relative w-full md:w-96 ml-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 bg-white focus:outline-none focus:border-green focus:ring-2 focus:ring-light-green/20 transition-all"
                />
              </div>
            </div>

            <FAQList faqs={filteredFaqs} hideTitle variant="plain" />

            {/* No results message */}
            {filteredFaqs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-dark-green/60 text-base xl:text-[18px] font-[400]">
                  No questions found matching "{searchQuery}". Try a different search term.
                </p>
              </div>
            )}

            {/* Contact Support */}
            <div className="mt-16 text-center">
              <p className="text-dark-green/80 mb-4 text-base xl:text-[18px] font-[400]">
                Can't find what you're looking for?
              </p>
              <button 
                className="px-8 py-3 rounded-full text-white font-[600] bg-green hover:bg-light-green transition-colors"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}