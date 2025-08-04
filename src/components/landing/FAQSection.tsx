import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

export function FAQSection() {
  const [openFaq, setOpenFaq] = useState(0)

  const faqs = [
    {
      question: "How do I book a field?",
      answer: "Simply search by postcode or use your location, choose a field and time slot, and confirm your booking through our secure checkout. You'll receive instant confirmation via email and in the app."
    },
    {
      question: "How do I know what amenities are available?",
      answer: "Each field listing includes detailed information about available amenities, safety features, and field specifications."
    },
    {
      question: "Can I cancel or reschedule my booking?",
      answer: "Yes, you can cancel or reschedule your booking up to 24 hours before your scheduled time through the app or website."
    },
    {
      question: "Is it safe for all dog breeds?",
      answer: "All our fields are fully fenced and secure, making them safe for dogs of all breeds and sizes."
    }
  ]

  return (
    <section className="py-20 px-20 bg-light-cream">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Section - FAQ */}
          <div className="bg-cream rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-dark-green mb-8">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-xl p-6">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <span className="font-semibold text-dark-green">
                      {faq.question}
                    </span>
                    {openFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-green" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-green" />
                    )}
                  </button>
                  
                  {openFaq === index && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-dark-green/80">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Section - Mobile App Promotion */}
          <div className="relative">
            {/* Dog Image */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8 z-10">
              <div className="w-32 h-32 bg-light-green rounded-full flex items-center justify-center">
                <span className="text-4xl">🐕</span>
              </div>
            </div>

            {/* App Download Banner */}
            <div className="bg-green rounded-2xl p-8 mt-16 text-center">
              <h3 className="text-2xl font-bold text-white mb-6">
                Download The Fieldsy App Today!
              </h3>
              
              <div className="flex flex-col gap-3">
                <button className="flex items-center justify-center bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors">
                  <span className="text-sm font-medium">GET IT ON Google Play</span>
                </button>
                <button className="flex items-center justify-center bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors">
                  <span className="text-sm font-medium">Download on the App Store</span>
                </button>
              </div>
            </div>

            {/* Decorative Blobs */}
            <div className="absolute top-20 right-8 w-16 h-16 bg-light-green rounded-full opacity-30"></div>
            <div className="absolute bottom-20 left-8 w-12 h-12 bg-light-green rounded-full opacity-30"></div>
          </div>
        </div>
      </div>
    </section>
  )
} 