import { Play, Apple } from "lucide-react"
import { DownloadAppButton } from "@/components/ui/download-app-button"
import { useRef, useEffect, useState } from "react"

export function HowItWorksHeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoError, setVideoError] = useState(false)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true
      videoRef.current.play().catch(error => {
        console.log('Video autoplay failed:', error)
        setVideoError(true)
      })
    }
  }, [])

  return (
    <>
      <h2 className=" text-[20px] xl:text-[29px] font-[600] text-dark-green mt-20 mb-8">How it works</h2>

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden mb-16 h-96 md:h-[500px] flex items-end">
        {/* Video Background */}
        {!videoError ? (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster="/how-it-works/dog.png"
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setVideoError(true)}
          >
            <source src={`${process.env.NEXT_PUBLIC_S3_BASE_URL}/videos/dog.mp4`} type="video/mp4" />
          </video>
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(/how-it-works/dog.png)' }}
          />
        )}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Content */}
        <div className="relative z-10 px-8 md:px-16 pb-8 md:pb-12 max-w-4xl">
          <h1 className="text-2xl sm:text-3xl md:text-4xl xl:text-[48px] font-[700] text-white mb- leading-tight xl:leading-[60px]">
            Getting Started with Fieldsy
          </h1>
          <p className="text-sm sm:text-base xl:text-[18px] text-white/90 mb-8 leading-relaxed xl:leading-[30px] font-[400]">
            Find, book, and enjoy secure dog walking fields -- or list your land and start earning. It takes just a few simple steps.
          </p>
          <DownloadAppButton />
        </div>
      </div>
    </>
  )
}