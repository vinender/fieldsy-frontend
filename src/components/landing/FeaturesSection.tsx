import { Shield, Smartphone, MapPin, Calendar, Users, Smartphone as Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DownloadAppButton } from "@/components/ui/download-app-button"
import Image from "next/image"


export function FeaturesSection() {
  const features = [
    {
      icon: "/features/icon1.png",
      title: "Private & Secure Spaces",
      description: "All fields are fully enclosed for safe, stress-free visits."
    },
    {
      icon: "/features/icon2.png",
      title: "Effortless Booking",
      description: "Search, select, and reserve in just a few taps anytime, anywhere."
    },
    {
      icon: "/features/icon3.png",
      title: "GPS-Powered Discovery",
      description: "Find nearby dog fields instantly using your location or postcode."
    },
    {
      icon: "/features/icon4.png",
      title: "Flexible Scheduling",
      description: "Book by the hour, on your time—no rigid rules or waiting lists."
    },
    {
      icon: "/features/icon5.png",
      title: "Trusted Community",
      description: "Built by dog lovers, for dog lovers—backed by real users and local field owners."
    },
    {
      icon: "/features/icon6.png",
      title: "Two Apps, One Mission",
      description: "Connecting paws with places whether you walk or host."
    }
  ]
 
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 xl:px-20 bg-white ">
      <div className="mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between border-b pb-[24px] mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:whitespace-nowrap font-bold text-[#1F3A1F] mb-6 lg:mb-0">
            Why Choose Fieldsy?
          </h2>

          {/* Download App Button */}
          <div className="flex items-start lg:items-center justify-start lg:justify-end w-auto lg:w-auto">
           <DownloadAppButton />
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="group">
              <div className="flex flex-col items-start gap-4">
                <div className="w-16 h-16  rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#7CB342] transition-colors relative">
                  <span className="text-2xl ">
                    {/* {feature.icon} */}
                    <Image src={feature.icon} alt="Feature icon" fill className="object-contain  p-2"/>
                  </span>
                </div>
                <div>
                  <h3 className="xl:text-[24px] leading-[30px] font-[600] text-[#1F3A1F] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-dark-green opacity-[70%] font-[400] text-[18px] leading-[30px]">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}