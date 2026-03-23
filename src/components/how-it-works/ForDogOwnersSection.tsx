import { MapPin, Calendar, FileText, CreditCard, Trees } from "lucide-react"
import { useRouter } from "next/router"

export function ForDogOwnersSection() {
  const router = useRouter();

  return (
    <>
      <div className="flex justify-between items-center mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl xl:text-[48px] font-[700] text-dark-green leading-tight xl:leading-[60px]">
          For Dog Owners
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
        {/* Step 1 */}
        <div className=" flex space-x-4 items-start hover:bg-cream bg-white group rounded-[24px] p-[20px] shadow-sm">
          <div className="w-24 p-1 rounded-xl flex items-center justify-center mb-6 bg-cream group-hover:bg-white">
            <img src="/how-it-works/field.svg" alt="Map Pin" className="object-contain text-green" />
          </div>
          <div> 
            <h3 className="text-xl xl:text-[24px] font-[600] text-dark-green mb-4 leading-tight xl:leading-[32px]">
              Find Fields Near You
            </h3>
            <p className="text-sm xl:text-[16px] text-dark-green/80 leading-relaxed xl:leading-[24px] font-[400]">
              Search by postcode or use GPS to discover private, enclosed dog walking fields close to home. Filter by size, price, or amenities to find your perfect match.
            </p>
          </div>
        </div>
        
        {/* Step 2 */}
        <div className=" flex space-x-4 items-start hover:bg-cream bg-white group rounded-[24px] p-[20px] shadow-sm">
          <div className="w-20 p-2 rounded-xl flex items-center justify-center mb-6 bg-cream group-hover:bg-white">
            <img src="/how-it-works/calender.svg" alt="Calendar" className="object-contain text-green" />
          </div>
          <div> 
            <h3 className="text-xl xl:text-[24px] font-[600] text-dark-green mb-4 leading-tight xl:leading-[32px]">
              Pick a Time Slot
            </h3>
            <p className="text-sm xl:text-[16px] text-dark-green/80 leading-relaxed xl:leading-[24px] font-[400]">
              Choose a convenient slot that fits your routine. Book by the hour and enjoy peaceful, scheduled visits with no interruptions or overlapping bookings.
            </p>
          </div>
        </div>
        
        {/* Step 3 */}
        <div className=" flex space-x-4 items-start hover:bg-cream bg-white group rounded-[24px] p-[20px] shadow-sm">
          <div className="w-20 p-2 rounded-xl flex items-center justify-center mb-6 bg-cream group-hover:bg-white">
            <img src="/how-it-works/note.svg" alt="File Text" className="object-contain text-green" />
          </div>
          <div> 
            <h3 className="text-xl xl:text-[24px] font-[600] text-dark-green mb-4 leading-tight xl:leading-[32px]">
              Review Field Details
            </h3>
            <p className="text-sm xl:text-[16px] text-dark-green/80 leading-relaxed xl:leading-[24px] font-[400]">
              Check fencing type, field size, terrain, water access, parking, photos, and host notes to make sure the field is right for you and your dog.
            </p>
          </div>
        </div>
        
        {/* Step 4 */}
        <div className=" flex space-x-4 items-start hover:bg-cream bg-white group rounded-[24px] p-[20px] shadow-sm">
          <div className="w-20 p-2 rounded-xl flex items-center justify-center mb-6 bg-cream group-hover:bg-white">
            <img src="/how-it-works/calender2.svg" alt="Credit Card" className="object-contain text-green" />
          </div>
          <div> 
            <h3 className="text-xl xl:text-[24px] font-[600] text-dark-green mb-4 leading-tight xl:leading-[32px]">
              Confirm & Pay Securely
            </h3>
            <p className="text-sm xl:text-[16px] text-dark-green/80 leading-relaxed xl:leading-[24px] font-[400]">
              Complete your booking with secure, encrypted payment via Stripe. You will receive instant confirmation by email and push notification.
            </p>
          </div>
        </div>
        
        {/* Step 5 */}
        <div className=" flex space-x-4 items-start hover:bg-cream bg-white group rounded-[24px] p-[20px] shadow-sm ">
          <div className="w-20 p-2 rounded-xl flex items-center justify-center mb-6 bg-cream group-hover:bg-white">
            <img src="/how-it-works/tree.svg" alt="Trees" className="object-contain text-green" />
          </div>
          <div> 
            <h3 className="text-xl xl:text-[24px] font-[600] text-dark-green mb-4 leading-tight xl:leading-[32px]">
              Enjoy Off-Lead Freedom
            </h3>
            <p className="text-sm xl:text-[16px] text-dark-green/80 leading-relaxed xl:leading-[24px] font-[400]">
              Arrive at your booked time, let your dog off the lead, and relax. The entire field is exclusively yours for the duration of your session.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}