import { Shield, Smartphone, MapPin, Calendar, Users, Smartphone as Phone } from "lucide-react"
import { Button } from "@/components/ui/button"


export function FeaturesSection() {
  const features = [
    {
      icon: "features/icon1.png",
      title: "Private & Secure Spaces",
      description: "All fields are fully enclosed for safe, stress-free visits."
    },
    {
      icon: "features/icon2.png",
      title: "Effortless Booking",
      description: "Search, select, and reserve in just a few taps anytime, anywhere."
    },
    {
      icon: "features/icon3.png",
      title: "GPS-Powered Discovery",
      description: "Find nearby dog fields instantly using your location or postcode."
    },
    {
      icon: "features/icon4.png",
      title: "Flexible Scheduling",
      description: "Book by the hour, on your time—no rigid rules or waiting lists."
    },
    {
      icon: "features/icon5.png",
      title: "Trusted Community",
      description: "Built by dog lovers, for dog lovers—backed by real users and local field owners."
    },
    {
      icon: "features/icon6.png",
      title: "Two Apps, One Mission",
      description: "Connecting paws with places whether you walk or host."
    }
  ]
 
  return (
    <section className="py-20 px-8 lg:px-20 bg-white ">
      <div className="mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start border-b pb-[24px] lg:items-center mb-16">
          <h2 className="text-5xl font-bold text-[#1F3A1F]   mb-6 lg:mb-0">
            Why Choose Fieldsy?
          </h2>
          
          {/* Download App Button */}
          <div className="">
          <img src='/features/download.png' className="w-full h-full object-contain"/>


          </div>
           {/* <button className="bg-[#7CB342] hover:bg-[#689F38] text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center gap-3 transition-colors shadow-lg">
            Download App
            <div className="flex gap-2 ml-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.9 17.39c-.26-.8-1.01-1.39-1.9-1.39h-1v-3a1 1 0 0 0-1-1H8v-2h2a1 1 0 0 0 1-1V7h2a2 2 0 0 0 2-2v-.41c2.93 1.18 5 4.05 5 7.41 0 2.08-.8 3.97-2.1 5.39M11 19.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.22.21-1.79L9 15v1a2 2 0 0 0 2 2m1-16A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2Z"/>
                </svg>
              </div>
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11Z"/>
                </svg>
              </div>
            </div>
          </button> */}
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="group">
              <div className="flex flex-col items-start gap-4">
                <div className="w-12 h-12 bg-[#E8F5E8] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#7CB342] transition-colors">
                  <span className="text-2xl group-hover:text-white transition-colors text-[#7CB342]">
                    {/* {feature.icon} */}
                    <img src={feature.icon} className="object-contain w-full h-full"/>
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