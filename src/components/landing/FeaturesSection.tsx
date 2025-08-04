import { Shield, Smartphone, MapPin, Calendar, Users, Smartphone as Phone } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FeaturesSection() {
  const features = [
    {
      icon: Shield,
      title: "Private & Secure Spaces",
      description: "All fields are fully enclosed for safe, stress-free visits."
    },
    {
      icon: Smartphone,
      title: "Effortless Booking",
      description: "Search, select, and reserve in just a few taps anytime, anywhere."
    },
    {
      icon: MapPin,
      title: "GPS-Powered Discovery",
      description: "Find nearby dog fields instantly using your location or postcode."
    },
    {
      icon: Calendar,
      title: "Flexible Scheduling",
      description: "Book by the hour, on your time—no rigid rules or waiting lists."
    },
    {
      icon: Users,
      title: "Trusted Community",
      description: "Built by dog lovers, for dog lovers—backed by real users and local field owners."
    },
    {
      icon: Phone,
      title: "Two Apps, One Mission",
      description: "Connecting paws with places whether you walk or host."
    }
  ]

  return (
    <section className="py-20 px-20 bg-light-cream">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16">
          <h2 className="text-4xl font-bold text-dark-green mb-6 lg:mb-0">
            Why Choose Fieldsy?
          </h2>
          
          {/* Download App Button */}
          <div className="flex items-center gap-4">
            <Button className="bg-green hover:bg-dark-green text-white px-6">
              Download App
            </Button>
            <div className="flex gap-2">
              <div className="w-8 h-8 bg-green rounded flex items-center justify-center">
                <span className="text-white text-xs">▶</span>
              </div>
              <div className="w-8 h-8 bg-green rounded flex items-center justify-center">
                <span className="text-white text-xs">🍎</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-light-green rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-green" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-dark-green mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-dark-green/80">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 