import { ChevronLeft, ChevronRight, Star } from "lucide-react"

export function TestimonialsSection() {
  return (
    <section className="py-2 px-20 bg-light-cream">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-dark-green">
            What Dog Lovers Are Saying
          </h2>
        </div>

        {/* Testimonial Card */}
        <div className="relative w-full mx-auto">
          {/* Navigation Arrows */}
          <button className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-12 w-12 h-12 bg-green rounded-full flex items-center justify-center hover:bg-dark-green transition-colors">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          
          <button className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-12 w-12 h-12 bg-green rounded-full flex items-center justify-center hover:bg-dark-green transition-colors">
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          {/* Main Testimonial Card */}
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <div className="flex flex-col md:flex-row items-start gap-8">
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-light-green rounded-full flex items-center justify-center">
                  <span className="text-3xl">👨‍🦰</span>
                </div>
              </div>

              {/* Testimonial Content */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl text-light-green">&quot;</div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-6 h-6 text-yellow fill-current" />
                    ))}
                  </div>
                </div>
                
                <p className="text-dark-green text-lg mb-4">
                  Fieldsy has been a game-changer for our daily walks. Finding secure, private fields nearby means our anxious lab can finally enjoy off-lead time without stress. Booking is simple and the app works flawlessly!
                </p>
                
                <div>
                  <p className="font-bold text-dark-green">John Smith</p>
                  <p className="text-dark-green/60 text-sm">Daily Customer</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center mt-8 space-x-2">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <div className="w-3 h-3 bg-green rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  )
} 