import { Play, Apple } from "lucide-react"
import { DownloadAppButton } from "@/components/ui/download-app-button"

interface AboutWhyFieldsySectionProps {
  data?: {
    title: string
    subtitle?: string
    image?: string
    boxTitle?: string
    boxDescription?: string
    buttonText?: string
    features: Array<{
      icon: string
      title: string
      description: string
      order: number
    }>
  }
  loading?: boolean
}


export function AboutWhyFieldsySection({ data, loading }: AboutWhyFieldsySectionProps) {
  // Use data from API or fallback to hardcoded values
  const title = data?.title || 'Why Fieldsy?'
  const subtitle = data?.subtitle || 'Choosing Fieldsy means choosing peace of mind for you and freedom for your dog.'
  const image = data?.image || '/about/dog2.png'
  const boxTitle = data?.boxTitle || "Let's Build the Future of Field Intelligence"
  const boxDescription = data?.boxDescription || "Fieldsy is more than a tool—it's a platform for innovation and transformation in field operations. We're constantly evolving with feedback, and we're here to help you work smarter on-site, every day."
  const buttonText = data?.buttonText || 'Download App'
  const features = data?.features?.length ? data.features : [
    { icon: 'CheckCircle', title: 'Secure & Private', description: 'Designed with compliance, transparency, and usability in mind', order: 1 },
    { icon: 'MapPin', title: 'Local & Convenient', description: 'Lightweight, mobile-friendly, and easy to use', order: 2 },
    { icon: 'Calendar', title: 'Flexible Booking', description: 'Scalable across teams, projects, and regions', order: 3 },
    { icon: 'Shield', title: 'Trusted Community', description: 'Built for the field, not just the office', order: 4 }
  ]


  return (
    <section className="px-4 sm:px-6 md:px-12 lg:px-16 xl:px-[80px] py-10 sm:py-12 md:py-16 lg:py-20 bg-light-cream">
     
      <div className="w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 lg:items-stretch">

          {/* Left Image */}
          <div className="rounded-2xl sm:rounded-[40px] overflow-hidden mb-8 lg:mb-0 lg:h-full">
            <img
              src={image}
              alt="Dog jumping over agility obstacle"
              className="w-full h-full object-cover"
            />
          </div>


          {/* Right Content */}
          <div className="w-full flex flex-col bg-transparent rounded-2xl h-full space-y-4 justify-between lg:space-y-6 p-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[48px] font-[700] text-dark-green  leading-tight lg:leading-[60px]">
              {title}
            </h2>
            
            <p className="text-sm sm:text-base lg:text-[18px] text-dark-green/80  leading-relaxed lg:leading-[30px] font-[400]">
              {subtitle}
            </p>


            <ul className="space-y-1  ">
              {features.sort((a, b) => a.order - b.order).map((feature, index) => (
                <li key={feature.order || index} className="flex items-start">
                  <span className="text-xl sm:text-2xl mr-3 sm:mr-4 text-light-green">•</span>
                  <span className="text-sm sm:text-base lg:text-[18px] text-dark-green/80 font-[400]">
                    {feature.description || feature.title}
                  </span>
                </li>
              ))}
            </ul> 
            

            <div
              className="hidden xl:flex p-6 sm:p-8 space-x-4 -sm border-l-4 border-l-light-green rounded"
              style={{
                background: "linear-gradient(90deg, rgba(143, 179, 102, 0.20) 0%, rgba(143, 179, 102, 0.00) 100%), white"
              }}
              > 
              <h3 className="text-lg sm:text-xl lg:text-[24px] font-[700] text-dark-green mb-3  leading-tight lg:leading-[32px]">
                {boxTitle}
              </h3>
              <p className="text-sm lg:text-[16px] text-dark-green/80 leading-relaxed lg:leading-[24px] font-[400]">
                {boxDescription}
              </p>
            </div>


            <div className="hidden xl:flex mt-6 sm:mt-8">
              <DownloadAppButton />
            </div>

             

          </div>

       

        </div>
        <div
              className="flex xl:hidden w-full p-6 sm:p-8 -sm border-l-4 border-l-light-green rounded"
              style={{
                background: "linear-gradient(90deg, rgba(143, 179, 102, 0.20) 0%, rgba(143, 179, 102, 0.00) 100%), white"
              }}
              > 
              <h3 className="text-lg sm:text-xl lg:text-[24px] font-[700] text-dark-green mb-3  leading-tight lg:leading-[32px]">
                {boxTitle}
              </h3>
              <p className="text-sm lg:text-[16px] text-dark-green/80 leading-relaxed lg:leading-[24px] font-[400]">
                {boxDescription}
              </p>
            </div>
        <div className="flex xl:hidden mt-6 sm:mt-8">
              <DownloadAppButton />
        </div>
        
      </div>
    </section>
  )
}




