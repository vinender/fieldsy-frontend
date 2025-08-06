import { MapPin, Calendar } from "lucide-react"

export function ForLandownersSection() {
  return (
    <section className="px-4 sm:px-6 md:px-12 lg:px-16 xl:px-[80px] py-10 sm:py-12 md:py-16 xl:py-20 bg-light-green">
      <div className="w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Image */}
          <div className="rounded-3xl overflow-hidden shadow-xl">
            <img 
              src="/how-it-works/dog.png"
              alt="Woman with dog sitting on steps"
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Right Content */}
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl xl:text-[48px] font-[700] text-white mb-8 leading-tight xl:leading-[60px]">
              How Fieldsy Works for Landowners
            </h2>
            
            <p className="text-sm sm:text-base xl:text-[18px] text-white/90 mb-12 leading-relaxed xl:leading-[30px] font-[400]">
              List or claim your field, set your schedule, and start earning—it's simple, secure, and flexible.
            </p>
            
            {/* Option Cards */}
            <div className="space-y-6">
              <div className="bg-white/90 backdrop-blur rounded-2xl p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-cream">
                    <MapPin className="w-6 h-6 text-green" />
                  </div>
                  <div>
                    <h3 className="text-xl xl:text-[24px] font-[600] text-dark-green mb-3 leading-tight xl:leading-[32px]">
                      Claim If Already Registered Your Land?
                    </h3>
                    <p className="text-sm xl:text-[16px] text-dark-green/80 leading-relaxed xl:leading-[24px] font-[400]">
                      Claim your field listing to access your dashboard, manage availability, update field details, respond to dog owners, and start earning securely with Fieldsy.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/90 backdrop-blur rounded-2xl p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-cream">
                    <Calendar className="w-6 h-6 text-green" />
                  </div>
                  <div>
                    <h3 className="text-xl xl:text-[24px] font-[600] text-dark-green mb-3 leading-tight xl:leading-[32px]">
                      New to Fieldsy?
                    </h3>
                    <p className="text-sm xl:text-[16px] text-dark-green/80 leading-relaxed xl:leading-[24px] font-[400]">
                      Sign up for free to list your land, control your availability, set pricing, and manage all bookings directly from your easy-to-use dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              className="w-full mt-8 py-4 rounded-full text-white font-[600] bg-green hover:bg-dark-green transition-colors"
            >
              Claim Your Field
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}