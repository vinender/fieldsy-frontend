import { MapPin, Calendar, FileText, CreditCard, Trees } from "lucide-react"

export function ForDogOwnersSection() {
  return (
    <>
      <div className="flex justify-between items-center mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl xl:text-[48px] font-[700] text-dark-green leading-tight xl:leading-[60px]">
          For Dog Owners
        </h2>
        <button 
          className="px-[8px]  py-[10px] rounded-full text-white font-[600] bg-green hover:bg-light-green transition-colors"
        >
          Find & Book Field
        </button>
      </div>
      
      {/* Steps Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
        {/* Step 1 */}
        <div className="hover:bg-cream bg-white group rounded-[24px] p-[20px] shadow-sm">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-cream group-hover:bg-white">
            <img src="/how-it-works/field.svg" alt="Map Pin" className="object-contain text-green" />
          </div>
          <h3 className="text-xl xl:text-[24px] font-[600] text-dark-green mb-4 leading-tight xl:leading-[32px]">
            Find Fields Near You
          </h3>
          <p className="text-sm xl:text-[16px] text-dark-green/80 leading-relaxed xl:leading-[24px] font-[400]">
            Easily find trusted, private dog walking fields near you using GPS or postcode search. No more crowded parks—just peaceful, secure spaces tailored for your dog's freedom.
          </p>
        </div>
        
        {/* Step 2 */}
        <div className="hover:bg-cream bg-white group rounded-[24px] p-[20px] shadow-sm">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-cream group-hover:bg-white">
            <img src="/how-it-works/calender.svg" alt="Calendar" className="object-contain text-green" />
          </div>
          <h3 className="text-xl xl:text-[24px] font-[600] text-dark-green mb-4 leading-tight xl:leading-[32px]">
            Select a Time Slot
          </h3>
          <p className="text-sm xl:text-[16px] text-dark-green/80 leading-relaxed xl:leading-[24px] font-[400]">
            Choose a convenient time that fits your routine. Book by the hour and enjoy peaceful, scheduled visits without interruptions or overlapping users.
          </p>
        </div>
        
        {/* Step 3 */}
        <div className="hover:bg-cream bg-white group rounded-[24px] p-[20px] shadow-sm">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-cream group-hover:bg-white">
            <img src="/how-it-works/note.svg" alt="File Text" className="object-contain text-green" />
          </div>
          <h3 className="text-xl xl:text-[24px] font-[600] text-dark-green mb-4 leading-tight xl:leading-[32px]">
            Check Field Details
          </h3>
          <p className="text-sm xl:text-[16px] text-dark-green/80 leading-relaxed xl:leading-[24px] font-[400]">
            View detailed information including fencing, field size, terrain, water access, parking, photos, and more to ensure a perfect visit for your dog.
          </p>
        </div>
        
        {/* Step 4 */}
        <div className="hover:bg-cream bg-white group rounded-[24px] p-[20px] shadow-sm">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-cream group-hover:bg-white">
            <img src="/how-it-works/calender2.svg" alt="Credit Card" className="object-contain text-green" />
          </div>
          <h3 className="text-xl xl:text-[24px] font-[600] text-dark-green mb-4 leading-tight xl:leading-[32px]">
            Confirm & Pay Securely
          </h3>
          <p className="text-sm xl:text-[16px] text-dark-green/80 leading-relaxed xl:leading-[24px] font-[400]">
            Complete your booking using our trusted, encrypted payment system. You'll receive instant confirmation and peace of mind for every visit.
          </p>
        </div>
        
        {/* Step 5 */}
        <div className="hover:bg-cream bg-white group rounded-[24px] p-[20px] shadow-sm lg:col-span-2">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-cream group-hover:bg-white">
            <img src="/how-it-works/tree.svg" alt="Trees" className="object-contain text-green" />
          </div>
          <h3 className="text-xl xl:text-[24px] font-[600] text-dark-green mb-4 leading-tight xl:leading-[32px]">
            Enjoy Off-Lead Freedom
          </h3>
          <p className="text-sm xl:text-[16px] text-dark-green/80 leading-relaxed xl:leading-[24px] font-[400]">
            Let your dog run, sniff, and explore in complete privacy. Safe, enclosed fields provide the perfect space for worry-free off-lead adventures.
          </p>
        </div>
      </div>
    </>
  )
}