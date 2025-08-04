
export function AboutSection() {
  return (
    <section className="py-20 px-20 bg-light-cream">
      <div className="mx-auto w-full  ">
        {/* Headline */}
        <div className="text-center mb-16">
          <h2 className="text-[48px]  text-left max-w-[1075px] font-[700] text-dark-green leading-tight">
            At Fieldsy, we believe every dog deserves the freedom to run, sniff, and play safely.
          </h2>
        </div>

        {/* Main Content Blocks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Left Block - Dog Image */}
          <div className="relative w-full">
            <img src='/about/dog2.png' className=" object-contain"/>
            
          </div>

          {/* Middle Block - Text with Dog Icons */}
          <div className="bg-white rounded-[32px] flex flex-col justify-evenly p-8 shadow-xl">
            <p className="text-dark-green font-[600] text-[18px] leading-[30px] mb-6">
              Born out of love for dogs and a need for secure, off-lead spaces, Fieldsy helps you find and book private dog walking fields across the UK—quickly and effortlessly.
            </p>
            <p className="text-dark-green text-[18px] font-[400] leading-[30px] mb-8">
              Whether your pup is reactive, in training, or just loves wide-open spaces, we&apos;re here to make your walks safer, calmer, and more joyful.
            </p>
            
            {/* Dog Profile Pictures */}
            <div className="flex justify-center">
              {[1, 2, 3, 4, 5].map((i, index) => (
                <div
                  key={i}
                  className={`w-12 h-12 bg-light-green rounded-full flex items-center justify-center ${
                    index !== 0 ? '-ml-2' : ''
                  }`}
                >
                  <span className="text-lg">
                    <img src="/about/dog1.png" className="w-full object-contain" />
                  </span>
                </div>
              ))}
            </div>

          </div>

          {/* Right Block - Image and Text */}
          <div className="bg-white rounded-[32px] p-8 shadow-xl">
            <img src='/about/fam.png' className="w-1/2 object-contain"/>  
            <div className=""> 
              <h3 className="text-xl font-bold text-dark-green mb-3">
                Trusted by thousands of dog lovers
              </h3>
              <p className="text-dark-green/80">
                Backed by real reviews, easy bookings, and growing across hundreds of secure fields.
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center border-r">
            <div className="leading-[76px] lg:text-[68px] font-[400] text-dark-green ">500+</div>
            <div className="text-dark-green/80 text-[18px] font-[400]">Early Access Signups</div>
          </div>
          <div className="text-center border-r">
            <div className="leading-[76px] lg:text-[68px] font-[400] text-dark-green ">200+</div>
            <div className="text-dark-green/80 text-[18px] font-[400]">Private Fields Being Onboarded</div>
          </div>
          <div className="text-center border-r">
            <div className="leading-[76px] lg:text-[68px] font-[400] text-dark-green ">50+</div>
            <div className="text-dark-green/80 text-[18px] font-[400]">Cities Covered Across the UK</div>
          </div>
          <div className="text-center ">
            <div className="leading-[76px] lg:text-[68px] font-[400] text-dark-green ">100%</div>
            <div className="text-dark-green/80 text-[18px] font-[400]">Safe, Secure & Fenced Spaces</div>
          </div>
        </div>
      </div>
    </section>
  )
} 