import { Play, Apple } from "lucide-react"

export function AboutHeroSection() {
  return (
    <section className="px-4 sm:px-6 md:px-12 lg:px-16 xl:px-[80px] py-10 sm:py-12 md:py-16 w-full lg:py-20 bg-light-cream">
      <div className="w-full">
        <h2 className="text-sm sm:text-base font-[400] text-dark-green/80 mb-6 sm:mb-8">About Us</h2>
        
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[48px] font-[700] text-dark-green mb-6 sm:mb-8 leading-tight sm:leading-tight md:leading-tight lg:leading-[1.1] xl:leading-[60px]">
              Find Safe, Private Dog<br className="hidden sm:block" />
              Walking Fields Near You
            </h1>
            
            <p className="text-sm sm:text-base lg:text-[18px] text-dark-green/80 mb-8 sm:mb-10 leading-relaxed sm:leading-relaxed lg:leading-[30px] font-[400]">
              At Fieldsy, we believe every dog deserves the freedom to run, sniff, and play safely. 
              Born out of love for dogs and a need for secure, off-lead spaces, Fieldsy helps you 
              find and book private dog walking fields across the UK—quickly and effortlessly.
            </p>
              
            <button 
              className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-white font-[600] bg-green hover:bg-light-green transition-colors text-sm sm:text-base"
            >
              Download App
              <Play className="w-5 h-5 fill-white" />
              <Apple className="w-5 h-5" />
            </button>
          </div>
          
          {/* Right Image */}
          <div className="relative mt-8 lg:mt-0">
            <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl">
              <img 
                src="/about/dog2.png"
                alt="Dog playing with toy in field"
                className="w-full h-[300px] sm:h-[400px] lg:h-[500px] object-cover"
              />
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mt-12 sm:mt-16 pt-12 sm:pt-16 border-t border-dark-green/20">
          <div className="text-center border-r border-dark-green/20 pr-4 sm:pr-6 lg:pr-8">
            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[68px] font-[400] text-dark-green mb-1 sm:mb-2 leading-tight xl:leading-[76px]">500+</h3>
            <p className="text-xs sm:text-sm lg:text-[18px] text-dark-green/80 font-[400]">Early Access Signups</p>
          </div>
          <div className="text-center border-r-0 md:border-r border-dark-green/20 pr-0 md:pr-6 lg:pr-8">
            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[68px] font-[400] text-dark-green mb-1 sm:mb-2 leading-tight xl:leading-[76px]">200+</h3>
            <p className="text-xs sm:text-sm lg:text-[18px] text-dark-green/80 font-[400]">Private Fields Being Onboarded</p>
          </div>
          <div className="text-center border-r border-dark-green/20 pr-4 sm:pr-6 lg:pr-8">
            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[68px] font-[400] text-dark-green mb-1 sm:mb-2 leading-tight xl:leading-[76px]">50+</h3>
            <p className="text-xs sm:text-sm lg:text-[18px] text-dark-green/80 font-[400]">Cities Covered Across the UK</p>
          </div>
          <div className="text-center">
            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[68px] font-[400] text-dark-green mb-1 sm:mb-2 leading-tight xl:leading-[76px]">100%</h3>
            <p className="text-xs sm:text-sm lg:text-[18px] text-dark-green/80 font-[400]">Safe, Secure & Fenced Spaces</p>
          </div>
        </div>
      </div>
    </section>
  )
}