import { Play, Apple } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { DownloadAppButton } from "@/components/ui/download-app-button"
import Image from "next/image"


interface AboutHeroSectionProps {
  data?: {
    sectionTitle: string
    mainTitle: string
    subtitle?: string
    description: string
    buttonText: string
    image: string
    stats: Array<{
      value: string
      label: string
      order: number
    }>
  }
  loading?: boolean
}


export function AboutHeroSection({ data, loading }: AboutHeroSectionProps) {
  // Default data for fallback
  const defaultData = {
    sectionTitle: 'About Us',
    mainTitle: 'All-in-One Platform for Smarter Field Operations',
    description: 'Fieldsy brings every aspect of field operations into a single, easy-to-use platform. From property claims and terrain tracking to team coordination and document management—we help you digitize, streamline, and scale your fieldwork with confidence. No more juggling spreadsheets, paperwork, or disconnected tools. With Fieldsy, everything you need is at your fingertips, wherever the field takes you.',
    buttonText: 'Download App',
    image: '/about/dog2.png',
    stats: [
      { value: '500+', label: 'Early Access Signups', order: 1 },
      { value: '200+', label: 'Private Fields Being Onboarded', order: 2 },
      { value: '50+', label: 'Cities Covered Across the UK', order: 3 },
      { value: '100%', label: 'Safe, Secure & Fenced Spaces', order: 4 }
    ]
  }
  
  const content = data || defaultData
  const sortedStats = content.stats.sort((a, b) => a.order - b.order)


  if (loading) {

    return (
      <section className="px-4 sm:px-6 md:px-12 lg:px-16 xl:px-[80px] py-10 sm:py-12 md:py-16 w-full lg:py-20 bg-light-cream">
       
        <div className="w-full">

          <Skeleton className="h-6 w-24 mb-6 sm:mb-8" />
          
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            <div>
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-12 w-3/4 mb-8" />
              <Skeleton className="h-24 w-full mb-8" />
              <Skeleton className="h-12 w-40" />
            </div>
            
            <Skeleton className="h-[300px] sm:h-[400px] lg:h-[500px] w-full rounded-2xl" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mt-12 sm:mt-16 pt-12 sm:pt-16 border-t border-dark-green/20">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-16 w-24 mx-auto mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>

        </div>

      </section>
    )
  }



  return (
    <section className="px-4 sm:px-6 md:px-12 lg:px-16 xl:px-[80px] py-10 sm:py-12 md:py-16 w-full lg:py-20 bg-light-cream">
      <div className="w-full">
        <h2 className="text-[20px] xl:text-[29px] font-[600] text-dark-green">
          {content.sectionTitle}
        </h2>
        
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[48px] font-[700] text-dark-green mb-6 sm:mb-8 leading-tight sm:leading-tight md:leading-tight lg:leading-[1.1] xl:leading-[60px]">
              {content.mainTitle.split('\n').map((line, index) => (
                <span key={index}>
                  {line}
                  {index < content.mainTitle.split('\n').length - 1 && <br className="hidden sm:block" />}
                </span>
              ))}
            </h1>
            
            <p className="text-sm sm:text-base lg:text-[18px] text-dark-green/80 mb-8 sm:mb-10 leading-relaxed sm:leading-relaxed lg:leading-[30px] font-[400]">
              {content.description}
            </p>

            <DownloadAppButton />
          </div>
          
          {/* Right Image */}
          <div className="relative mt-8 lg:mt-0">
            <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl relative h-[300px] sm:h-[400px] lg:h-[500px]">
              <Image 
                src={content?.image || defaultData?.image}
                alt="Dog playing with toy in field"
                fill
                className="object-cover"
                priority // Since this is above the fold
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
              />
            </div>
          </div>

        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mt-12 sm:mt-16 pt-12 sm:pt-16 border-t border-dark-green/20">
          {sortedStats.map((stat, index) => (
            <div 
              key={index} 
              className={`text-center ${
                index < sortedStats.length - 1 ? 'border-r border-dark-green/20 pr-4 sm:pr-6 lg:pr-8' : ''
              } ${index === 1 ? 'border-r-0 md:border-r' : ''}`}
            >
              <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[68px] font-[400] text-dark-green mb-1 sm:mb-2 leading-tight xl:leading-[76px]">
                {stat.value}
              </h3>
              <p className="text-xs sm:text-sm lg:text-[18px] text-dark-green/80 font-[400]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  )
}