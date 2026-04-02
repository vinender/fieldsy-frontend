import { MapPin, Calendar, FileText, CreditCard, Trees } from "lucide-react"
import { useRouter } from "next/router"
import { usePublicSettings } from "@/hooks/usePublicSettings"
import { formatTextWithLineBreaks } from "@/utils/formatText"

interface Step {
  icon?: string;
  title: string;
  description: string;
  order?: number;
}

const DEFAULT_STEPS: Step[] = [
  {
    title: 'Find Fields Near You',
    description: 'Search by postcode or use GPS to discover private, enclosed dog walking fields close to home. Filter by size, price, or amenities to find your perfect match.',
    order: 1
  },
  {
    title: 'Pick a Time Slot',
    description: 'Choose a convenient slot that fits your routine. Book by the hour and enjoy peaceful, scheduled visits with no interruptions or overlapping bookings.',
    order: 2
  },
  {
    title: 'Review Field Details',
    description: 'Check fencing type, field size, terrain, water access, parking, photos, and host notes to make sure the field is right for you and your dog.',
    order: 3
  },
  {
    title: 'Confirm & Pay Securely',
    description: 'Complete your booking with secure, encrypted payment via Stripe. You will receive instant confirmation by email and push notification.',
    order: 4
  },
  {
    title: 'Enjoy Off-Lead Freedom',
    description: 'Arrive at your booked time, let your dog off the lead, and relax. The entire field is exclusively yours for the duration of your session.',
    order: 5
  }
];

export function ForDogOwnersSection() {
  const router = useRouter();
  const { data: settings } = usePublicSettings()

  const sectionTitle = settings?.forDogOwnersSectionTitle || 'For Dog Owners'
  const steps = (settings?.forDogOwnersSteps && settings.forDogOwnersSteps.length > 0) ? settings.forDogOwnersSteps : DEFAULT_STEPS

  return (
    <>
      <div className="flex justify-between items-center mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl xl:text-[48px] font-[700] text-dark-green leading-tight xl:leading-[60px] whitespace-pre-wrap break-words">
          {sectionTitle}
        </h2>
        <button 
        onClick={()=>router.push('/fields')}
        className="px-[60px]  py-[10px] rounded-full text-white font-[600] bg-green hover:bg-light-green transition-colors"
        >
          Find & Book a Field
        </button>
      </div>

      {/* Steps Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
        {steps.map((step: Step, index: number) => (
          <div key={index} className=" flex space-x-4 items-start hover:bg-cream bg-white group rounded-[24px] p-[20px] shadow-sm">
            {step.icon && (
              <div className="w-20 p-2 rounded-xl flex items-center justify-center mb-6 bg-cream group-hover:bg-white">
                <img src={step.icon} alt={step.title} className="object-contain text-green" />
              </div>
            )}
            <div>
              <h3 className="text-xl xl:text-[24px] font-[600] text-dark-green mb-4 leading-tight xl:leading-[32px]">
                {formatTextWithLineBreaks(step.title)}
              </h3>
              <p className="text-sm xl:text-[16px] text-dark-green/80 leading-relaxed xl:leading-[24px] font-[400]">
                {formatTextWithLineBreaks(step.description)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}