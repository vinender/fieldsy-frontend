import { useState } from "react"
import { MapPin, Shield, Clock, DollarSign, Users } from "lucide-react"

const platformCards = [
  {
    id: 'owners',
    image: '/platform-section/img1.png',
    imageAlt: 'Woman with Alaskan Malamute',
    subtitle: 'For Dog Owners:',
    title: 'Find & Book Private Dog Walking Fields in Seconds',
    features: [
      {
        icon: Shield,
        text: 'Stress-free walks for reactive or energetic dogs'
      },
      {
        icon: MapPin,
        text: 'Fully fenced, secure spaces'
      },
      {
        icon: MapPin,
        text: 'GPS-powered search'
      },
      {
        icon: Clock,
        text: 'Instant hourly bookings'
      }
    ]
  },
  {
    id: 'fields',
    image: '/platform-section/img2.png',
    imageAlt: 'Men shaking hands in field',
    subtitle: 'For Field Owners:',
    title: 'Turn Your Land into a Dog\'s Dream & Earn',
    features: [
      {
        icon: DollarSign,
        text: 'Earn passive income while helping pets'
      },
      {
        icon: Users,
        text: 'Host dog owners with full control'
      },
      {
        icon: Clock,
        text: 'Set your availability and pricing'
      },
      {
        icon: MapPin,
        text: 'List your field for free'
      }
    ]
  }
]

export function PlatformSection() {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null)
  const [hoveredImage, setHoveredImage] = useState<string | null>(null)

  return (
    <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 xl:py-[80px] px-4 sm:px-6 md:px-12 lg:px-16 xl:px-20 bg-light-green overflow-hidden">
      <div className="mx-auto w-full max-w-full">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-14 xl:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[44px] xl:text-5xl font-bold text-white leading-tight px-2">
            One Platform, Two Tail-Wagging Experiences
          </h2>
        </div>

        {/* Two Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {platformCards.map((card) => (
            <div 
              key={card.id}
              className="bg-white rounded-3xl bg-[#F8F1D7] bg-opacity-[100%] overflow-hidden shadow-xl cursor-pointer transition-all duration-300 hover:shadow-2xl min-h-[450px] sm:min-h-[500px] md:min-h-[550px] lg:min-h-[600px] xl:min-h-[650px] flex flex-col"
              onMouseEnter={() => setHoveredTab(card.id)}
              onMouseLeave={() => setHoveredTab(null)}
            >
              {/* Image Container - Fixed heights for consistency */}
              <div className="h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] xl:h-[400px] p-2 relative overflow-hidden">
                <img 
                  src={card.image}
                  alt={card.imageAlt}
                  className="w-full h-full rounded-[24px] object-cover"
                />
              </div>
              
              {/* Content - Flexible height */}
              <div className="flex-1 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-[40px] pt-4 pb-6 sm:pt-6 sm:pb-8 lg:pt-8 xl:pt-[32px] lg:pb-8 xl:pb-10 flex flex-col relative">
                <div className="mb-4 lg:mb-6 xl:mb-[16px]">
                  <h3 className="text-base sm:text-[18px] leading-5 sm:leading-[20px] font-[700] text-green mb-2">{card.subtitle}</h3>
                  <h4 className="text-xl sm:text-2xl md:text-[28px] lg:text-[30px] xl:text-[32px] font-[600] w-full sm:w-4/5 md:w-3/4 lg:w-4/5 xl:w-2/3 leading-6 sm:leading-8 md:leading-[36px] lg:leading-[38px] xl:leading-[40px] text-gray-900">
                    {card.title}
                  </h4>
                </div>

                <ul className="space-y-1 sm:space-y-2 lg:space-y-3 xl:space-y-[4px] text-sm sm:text-base lg:text-[17px] xl:text-[18px] leading-6 sm:leading-7 lg:leading-8 xl:leading-[30px] font-[400] flex-grow">
                  {card.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2 text-gray-700">
                      <span className="rounded-full bg-green h-1.5 w-1.5 flex-shrink-0"></span>
                      <span className="text-dark-green">{feature.text}</span>
                    </li>
                  ))}
                </ul>

                <div 
                  className="absolute right-0 bottom-0"
                  onMouseEnter={() => setHoveredImage(card.id)}
                  onMouseLeave={() => setHoveredImage(null)}
                >
                  <img 
                    src={hoveredImage === card.id ? "/platform-section/hover.png" : "/platform-section/wave.png"}
                    alt=""
                    className="h-16 w-16 sm:h-18 sm:w-18 md:h-20 md:w-20 lg:h-22 lg:w-22 xl:h-24 xl:w-24 object-contain transition-all duration-300 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Wave Image at Bottom Right */}
    
    </section>
  )
}