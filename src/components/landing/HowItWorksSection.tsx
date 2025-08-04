import { MapPin, Calendar, FileText, CheckCircle, Heart } from "lucide-react"

export function HowItWorksSection() {
  const steps = [
    {
      icon: MapPin,
      title: "Find Fields Near You",
      description: "Easily find trusted, private dog walking fields near you using GPS or postcode search. No more crowded parks—just peaceful, secure spaces tailored for your dog's freedom.",
      highlighted: true
    },
    {
      icon: Calendar,
      title: "Select a Time Slot",
      description: "Choose from available time slots that work for your schedule."
    },
    {
      icon: FileText,
      title: "Check Field Details",
      description: "Review field information, amenities, and safety features."
    },
    {
      icon: CheckCircle,
      title: "Confirm & Pay Securely",
      description: "Complete your booking with secure payment processing."
    },
    {
      icon: Heart,
      title: "Enjoy Off-Lead Freedom",
      description: "Let your dog run, play, and explore in a safe environment."
    }
  ]

  return (
    <section className="py-20 px-20 bg-light-cream">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Section - Process Steps */}
          <div>
            <h2 className="text-4xl font-bold text-dark-green mb-12">
              How Fieldsy Works
            </h2>
            
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div 
                  key={index}
                  className={`p-6 rounded-2xl ${
                    step.highlighted 
                      ? 'bg-light-green shadow-xl' 
                      : 'bg-white shadow-lg'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      step.highlighted 
                        ? 'bg-green text-white' 
                        : 'bg-light-green text-white'
                    }`}>
                      <step.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold mb-2 ${
                        step.highlighted 
                          ? 'text-white' 
                          : 'text-dark-green'
                      }`}>
                        {step.title}
                      </h3>
                      <p className={`${
                        step.highlighted 
                          ? 'text-white/90' 
                          : 'text-dark-green/80'
                      }`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Section - Puppy Image */}
          <div className="relative">
            <div className="bg-cream rounded-3xl overflow-hidden shadow-2xl h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="w-40 h-40 bg-light-green rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-6xl">🐕</span>
                </div>
                <p className="text-dark-green text-xl font-medium">Labrador Puppy</p>
                <p className="text-dark-green/60 text-sm">Playing in outdoor setting</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 