import { Play, Apple } from "lucide-react"

export function AboutWhyFieldsySection() {
  return (
    <section className="px-4 sm:px-6 md:px-12 lg:px-16 xl:px-[80px] py-10 sm:py-12 md:py-16 lg:py-20 bg-light-cream">
      <div className="w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Image */}
          <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl mb-8 lg:mb-0">
            <img 
              src="/about/dog2.png"
              alt="Dog jumping over agility obstacle"
              className="w-full h-[300px] sm:h-[400px] lg:h-[500px] object-cover"
            />
          </div>
          
          {/* Right Content */}
          <div className="w-full bg-">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[48px] font-[700] text-dark-green mb-6 sm:mb-8 leading-tight lg:leading-[60px]">
              Why Fieldsy?
            </h2>
            
            <p className="text-sm sm:text-base lg:text-[18px] text-dark-green/80 mb-6 sm:mb-8 leading-relaxed lg:leading-[30px] font-[400]">
              Choosing Fieldsy means choosing peace of mind for you and freedom 
              for your dog.
            </p>
            
            <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-12">
              <li className="flex items-start">
                <span className="text-xl sm:text-2xl mr-3 sm:mr-4 text-light-green">•</span>
                <span className="text-sm sm:text-base lg:text-[18px] text-dark-green/80 font-[400]">100% secure, fully-fenced fields verified by our team</span>
              </li>
              <li className="flex items-start">
                <span className="text-xl sm:text-2xl mr-3 sm:mr-4 text-light-green">•</span>
                <span className="text-sm sm:text-base lg:text-[18px] text-dark-green/80 font-[400]">Easy booking system - find and reserve in minutes</span>
              </li>
              <li className="flex items-start">
                <span className="text-xl sm:text-2xl mr-3 sm:mr-4 text-light-green">•</span>
                <span className="text-sm sm:text-base lg:text-[18px] text-dark-green/80 font-[400]">Trusted by thousands of dog owners across the UK</span>
              </li>
              <li className="flex items-start">
                <span className="text-xl sm:text-2xl mr-3 sm:mr-4 text-light-green">•</span>
                <span className="text-sm sm:text-base lg:text-[18px] text-dark-green/80 font-[400]">Perfect for reactive, nervous, or energetic dogs</span>
              </li>
            </ul>
            
            <div
              className="p-6 sm:p-8 shadow-sm border-l-4 border-l-light-green"
              style={{
                background: "linear-gradient(90deg, rgba(143, 179, 102, 0.20) 0%, rgba(143, 179, 102, 0.00) 100%), white"
              }}
            > 
              <h3 className="text-lg sm:text-xl lg:text-[24px] font-[700] text-dark-green mb-3 sm:mb-4 leading-tight lg:leading-[32px]">
                Let's Build the Future of Field Intelligence
              </h3>
              <p className="text-sm lg:text-[16px] text-dark-green/80 mb-4 sm:mb-6 leading-relaxed lg:leading-[24px] font-[400]">
                Fieldsy is more than a tool—it's a platform for innovation and transformation in field operations. We're constantly evolving with feedback, and we’re here to help you work smarter on-site, every day.
              </p>
            </div>

            
            <button 
              className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-white font-[600] bg-green hover:bg-light-green transition-colors mt-6 sm:mt-8 text-sm sm:text-base"
            >
              Download App
              <Play className="w-5 h-5 fill-white" />
              <Apple className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}