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
      
      <div className="mx-auto w-full max-w-7xl relative z-10 ">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left Section - FAQ */}
          <div className={`rounded-3xl p-10 shadow-lg transition-colors duration-300 ${openFaq !== -1 ? 'bg-white' : 'bg-cream'}`}>
            <h2 className="text-4xl font-bold text-gray-900 mb-10">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-0">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className={`border-b  border-gray-200 ${index === 0 ? 'border-t' : ''}`}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                    className="flex items-center justify-between w-full text-left py-6 group"
                  >
                    <span className="font-medium text-gray-900 text-lg pr-4">
                      {faq.question}
                    </span>
                    <div 
                      className={`w-8 h-8 rounded-full ${openFaq === index ? 'bg-light-green' : '#E5E5E5' } flex items-center justify-center flex-shrink-0 transition-colors`}
                         
                    >
                      {openFaq === index ? (
                        <Minus className="w-5 h-5 text-white" />
                      ) : (
                        <Plus className="w-6 h-6 text-light-green border border-light-green rounded-full border-2 " />
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

          {/* Right Section - Mobile App Promotion */}
          <div className="relative">
            {/* Background Blob */}
            <div className="absolute -top-20 -right-20 w-96 h-96 pointer-events-none">
              <svg viewBox="0 0 400 400" className="w-full h-full">
                <path 
                  d="M 150 50 Q 250 20, 320 80 T 350 200 Q 380 280, 300 330 T 150 350 Q 50 320, 30 230 T 80 100 Q 100 60, 150 50"
                  fill="#D4E4BC"
                  opacity="0.3"
                />
              </svg>
            </div>
            
            {/* Dog Image */}
            <div className="absolute left-40 z-20">
              <img 
                src="/faq/dog.png"
                alt="Bernese Mountain Dog"
                className="w-full h-full object-contain object-top"
                // style={{ 
                //   clipPath: 'ellipse(50% 40% at 50% 50%)',
                // }}
              />
            </div>

            {/* App Download Banner */}
            
          </div>
        </div>
      </div>
    </section>
  )
}