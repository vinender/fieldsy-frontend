import { ArrowRight, MapPin, Shield, Clock, DollarSign, Users } from "lucide-react"

export function PlatformSection() {
  return (
    <section className="py-20 px-20 bg-light-green">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            One Platform, Two Tail-Wagging Experiences
          </h2>
        </div>

        {/* Two Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Card - For Dog Owners */}
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <div className="bg-cream rounded-xl h-48 mb-6 flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 bg-light-green rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-4xl">👩‍🦰</span>
                </div>
                <p className="text-dark-green text-sm">Woman with Alaskan Malamute</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium text-green mb-2">For Dog Owners:</h3>
              <h4 className="text-2xl font-bold text-dark-green mb-4">
                Find & Book Private Dog Walking Fields in Seconds
              </h4>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-dark-green/80">
                <Shield className="w-5 h-5 text-green mr-3" />
                Stress-free walks for reactive or energetic dogs
              </li>
              <li className="flex items-center text-dark-green/80">
                <MapPin className="w-5 h-5 text-green mr-3" />
                Fully fenced, secure spaces
              </li>
              <li className="flex items-center text-dark-green/80">
                <MapPin className="w-5 h-5 text-green mr-3" />
                GPS-powered search
              </li>
              <li className="flex items-center text-dark-green/80">
                <Clock className="w-5 h-5 text-green mr-3" />
                Instant hourly bookings
              </li>
            </ul>

            <div className="flex justify-end">
              <div className="w-12 h-12 bg-light-green rounded-full flex items-center justify-center">
                <ArrowRight className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Right Card - For Field Owners */}
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <div className="bg-cream rounded-xl h-48 mb-6 flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 bg-light-green rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-4xl">🤝</span>
                </div>
                <p className="text-dark-green text-sm">Two men shaking hands</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium text-green mb-2">For Field Owners:</h3>
              <h4 className="text-2xl font-bold text-dark-green mb-4">
                Turn Your Land into a Dog&apos;s Dream & Earn
              </h4>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-dark-green/80">
                <DollarSign className="w-5 h-5 text-green mr-3" />
                Earn passive income while helping pets
              </li>
              <li className="flex items-center text-dark-green/80">
                <Users className="w-5 h-5 text-green mr-3" />
                Host dog owners with full control
              </li>
              <li className="flex items-center text-dark-green/80">
                <Clock className="w-5 h-5 text-green mr-3" />
                Set your availability and pricing
              </li>
              <li className="flex items-center text-dark-green/80">
                <MapPin className="w-5 h-5 text-green mr-3" />
                List your field for free
              </li>
            </ul>

            <div className="flex justify-end">
              <div className="w-12 h-12 bg-light-green rounded-full flex items-center justify-center">
                <ArrowRight className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 