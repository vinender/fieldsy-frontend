import { Plus, Minus } from "lucide-react"
import { useState } from "react"

export function FAQSection() {
  const [openFaq, setOpenFaq] = useState(-1)

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
    <section className="relative py-20 px-6 md:px-20 overflow-hidden" style={{ backgroundColor: '#FAF7F2' }}>
      {/* Background decorative circle */}
      <div 
        className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-0 bg-cream"
        // style={{ backgroundColor: '#D4E4BC', transform: 'translate(30%, -30%)' }}
      />
      
      <div className="mx-auto w-full max-full relative z-10 ">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-stretch">
          {/* Left Section - FAQ */}
          <div className="bg-cream bg-opacity-[30%] rounded-3xl p-10 shadow-lg h-fit">
            <h2 className="text-4xl font-bold text-gray-900 mb-10">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-0">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className={`border-b border-gray-200 ${index === 0 ? 'border-t' : ''} ${openFaq === index ? 'bg-white -mx-6 px-6 rounded-[20px]' : ''} transition-all duration-300`}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                    className="flex items-center justify-between w-full text-left py-6 group"
                  >
                    <span className="font-medium text-gray-900 text-lg pr-4">
                      {faq.question}
                    </span>
                    <div 
                      className={`w-8 h-8 rounded-full ${openFaq === index ? 'bg-light-green' : 'bg-gray-200'} flex items-center justify-center flex-shrink-0 transition-colors`}
                    >
                      {openFaq === index ? (
                        <Minus className="w-5 h-5 text-white" />
                      ) : (
                        <Plus className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                  </button>
                  
                  {openFaq === index && (
                    <div className="pb-6">
                      <p className="text-dark-green leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Section - Dog Image with Background */}
          <div className="relative rounded-3xl p-20 overflow-hidden">
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
                alt="Bernese Mountain Dog"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}