import Link from "next/link"
import { usePublicSettings } from "@/hooks/usePublicSettings"

interface ForLandownersSectionProps {
  hideClaimButton?: boolean;
}

export function ForLandownersSection({ hideClaimButton = false }: ForLandownersSectionProps) {
  const { data: settings } = usePublicSettings();

  const sectionTitle = settings?.landownersSectionTitle || 'How Fieldsy Works for Landowners'
  const sectionDescription = settings?.landownersSectionDescription || "List or claim your field, set your schedule, and start earning it is simple, secure, and flexible."
  const sectionImage = settings?.landownersSectionImage || '/how-it-works/dog.png'

  return (
    <section className="px-4 sm:px-6 md:px-12 lg:px-16 xl:px-[80px] py-10 sm:py-12 md:py-16 xl:py-20 bg-light-green">
      <div className="w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-stretch">
          {/* Left Image */}
          <div
            className="rounded-3xl overflow-hidden shadow-xl h-64 sm:h-80 lg:h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${sectionImage})` }}
            aria-label="Landowner section image"
            role="img"
          />

          {/* Right Content */}
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl xl:text-[48px] font-[700] text-white mb-8 leading-tight xl:leading-[60px]">
              {sectionTitle}
            </h2>

            <p className="text-sm sm:text-base xl:text-[18px] text-white/90 mb-12 leading-relaxed xl:leading-[30px] font-[400]">
              {sectionDescription}
            </p>
            
            {/* Option Cards */}
            <div className="space-y-6  ">
              <div className="hover:bg-cream group bg-white backdrop-blur rounded-2xl p-8 h-full">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-cream group-hover:bg-white">
                    <img src="/how-it-works/field.svg" alt="Map Pin" className="object-contain text-green" />
                  </div>
                  <div className="">
                    <h3 className="text-xl xl:text-[24px] font-[600] text-dark-green mb-3 leading-tight xl:leading-[32px]">
                      Claim Your Existing Listing
                    </h3>
                    <p className="text-sm xl:text-[16px] text-dark-green/80 leading-relaxed xl:leading-[24px] font-[400]">
                      If your land is already listed on Fieldsy, claim it to access your host dashboard. From there you can manage availability, update field details, respond to dog owners, and start earning.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="hover:bg-cream group bg-white backdrop-blur rounded-2xl p-8 h-full">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-cream group-hover:bg-white">
                    <img src="/how-it-works/calender.svg" alt="Calendar" className="object-contain text-green" />
                  </div>
                  <div>
                    <h3 className="text-xl xl:text-[24px] font-[600] text-dark-green mb-3 leading-tight xl:leading-[32px]">
                      List Your Land for Free
                    </h3>
                    <p className="text-sm xl:text-[16px] text-dark-green/80 leading-relaxed xl:leading-[24px] font-[400]">
                      Sign up, add your field details and photos, set your pricing and availability, and start receiving bookings. Everything is managed from your easy-to-use host dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
{!hideClaimButton && (
              <Link
                href="/fields"
                className="inline-flex w-full justify-center mt-8 py-4 rounded-full text-white font-[600] bg-green hover:bg-dark-green transition-colors"
              >
                Claim Your Field
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
