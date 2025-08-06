import { Play, Apple } from "lucide-react"

export function HowItWorksHeroSection() {
  return (
    <>
      <h2 className="text-base font-[400] text-dark-green/80 mb-8">How it works</h2>
      
      {/* Hero Banner */}
      <div 
        className="relative rounded-3xl overflow-hidden mb-16 h-96 md:h-[500px] flex items-center bg-cover bg-center"
        style={{
          backgroundImage: 'url(/how-it-works/dog.png)'
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Content */}
        <div className="relative z-10 px-8 md:px-16 max-w-2xl">
          <h1 className="text-2xl sm:text-3xl md:text-4xl xl:text-[48px] font-[700] text-white mb-6 leading-tight xl:leading-[60px]">
            Getting Started with Fieldsy
          </h1>
          <p className="text-sm sm:text-base xl:text-[18px] text-white/90 mb-8 leading-relaxed xl:leading-[30px] font-[400]">
            Find, book, and enjoy secure dog walking fields—or list your land and start earning, all in just a few simple steps.
          </p>
          <button 
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-white font-[600] bg-green hover:bg-light-green transition-colors"
          >
            Download App
            <Play className="w-5 h-5 fill-white" />
            <Apple className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  )
}