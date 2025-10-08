import { Play, Apple } from "lucide-react"
import { DownloadAppButton } from "@/components/ui/download-app-button"

export function HowItWorksHeroSection() {
  return (
    <>
      <h2 className=" text-[20px] xl:text-[29px] font-[600] text-dark-green mt-20 mb-8">How it works</h2>
      
      {/* Hero Banner */}
      <div 
        className="relative rounded-3xl overflow-hidden mb-16 h-96 md:h-[500px] flex items-end bg-cover bg-center"
        style={{
          objectFit: 'cover',
          backgroundImage: 'url(/how-it-works/dog.png)'
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Content */}
        <div className="relative z-10 px-8 md:px-16 pb-8 md:pb-12 max-w-4xl">
          <h1 className="text-2xl sm:text-3xl md:text-4xl xl:text-[48px] font-[700] text-white mb- leading-tight xl:leading-[60px]">
            Getting Started with Fieldsy
          </h1>
          <p className="text-sm sm:text-base xl:text-[18px] text-white/90 mb-8 leading-relaxed xl:leading-[30px] font-[400]">
            Find, book, and enjoy secure dog walking fields—or list your land and start earning, all in just a few simple steps.
          </p>
          <DownloadAppButton />
        </div>
      </div>
    </>
  )
}