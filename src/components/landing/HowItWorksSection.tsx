import { useState } from "react"

export  function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0)
  
  const steps = [
    {
      icon: "/how-it-works/icon1.png",
      title: "Find Fields Near You",
      description: "Easily find trusted, private dog walking fields near you using GPS or postcode search. No more crowded parks—just peaceful, secure spaces tailored for your dog's freedom.",
      image: "/how-it-works/dog.png"
    },
    {
      icon: "/how-it-works/icon2.png",
      title: "Select a Time Slot",
      description: "Choose from available time slots that work for your schedule.",
      image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=600&fit=crop"
    },
    {
      icon: "/how-it-works/icon3.png",
      title: "Check Field Details",
      description: "Review field information, amenities, and safety features.",
      image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=600&fit=crop"
    },
    {
      icon: "/how-it-works/icon4.png",
      title: "Confirm & Pay Securely",
      description: "Complete your booking with secure payment processing.",
      image: "https://images.unsplash.com/photo-1581888227599-779811939961?w=800&h=600&fit=crop"
    },
    {
      icon: "/how-it-works/icon5.png",
      title: "Enjoy Off-Lead Freedom",
      description: "Let your dog run, play, and explore in a safe environment.",
      image: "https://images.unsplash.com/photo-1601758124096-1fd661873b95?w=800&h=600&fit=crop"
    }
  ]

  return (
    <section className="py-20 px-8 lg:px-20  bg-light-cream">
      <div className="mx-auto w-full">
        <div className="grid grid-cols-1 h-full  lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Section - Process Steps */}
          <div className="h-full">
            <h2 className="text-5xl font-bold text-dark-green mb-12">
              How Fieldsy Works
            </h2>
            <div className="space-y-4 ">
              {steps.map((step, index) => (
                <div
                  key={index}
                  onMouseEnter={() => setActiveStep(index)}
                  className={`p-6 rounded-2xl transition-all border  shadow-sm duration-300 cursor-pointer ${
                    activeStep === index
                      ? 'bg-cream shadow-lg'
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-300 ${
                      activeStep === index
                        ? 'bg-[#4A7C59] text-white shadow-md'
                        : 'bg-cream'
                    }`}>
                      <img src={step.icon} className='w-full h-full object-contain'/>
                       
                    </div>
                    <div className="flex-1">
                      <h3 className="xl:text-[24px] font-[600] xl:leading-[30px] mb-2 text-dark-green">
                        {step.title}
                      </h3>
                      {activeStep === index && (
                        <p className="text-dark-green text-opacity-[70%] text-[16px] leading-[24px]">
                          {step.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Section - Dynamic Image */}
          <div className="relative h-full">
            <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src={steps[activeStep].image}
                alt={steps[activeStep].title}
                className="w-full h-full object-cover transition-opacity duration-500"
              />
              {/* Overlay gradient for better text visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}