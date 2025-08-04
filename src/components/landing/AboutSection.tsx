
export function AboutSection() {
  return (
    <section className="py-20 px-20 bg-light-cream">
      <div className="mx-auto w-full  ">
        {/* Headline */}
        <div className="text-center mb-16">
          <h2 className="text-[48px]  text-left mx-w-[1075px] font-[700] text-dark-green leading-tight">
            At Fieldsy, we believe every dog deserves the freedom to run, sniff, and play safely.
          </h2>
        </div>

        {/* Main Content Blocks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Left Block - Dog Image */}
          <div className="relative">
            <img src='/about/dog2.png' className="w-full object-contain"/>
            {/* <div className="bg-cream rounded-2xl overflow-hidden shadow-xl h-80 flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 bg-light-green rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-4xl">🐕</span>
                </div>
                <p className="text-dark-green text-lg font-medium">Beagle with Blue Ball</p>
                <p className="text-dark-green/60 text-sm">Happy dog in grassy setting</p>
              </div>
            </div> */}
          </div>

          {/* Middle Block - Text with Dog Icons */}
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <p className="text-dark-green font-bold text-lg mb-6">
              Born out of love for dogs and a need for secure, off-lead spaces, Fieldsy helps you find and book private dog walking fields across the UK—quickly and effortlessly.
            </p>
            <p className="text-dark-green text-lg mb-8">
              Whether your pup is reactive, in training, or just loves wide-open spaces, we&apos;re here to make your walks safer, calmer, and more joyful.
            </p>
            
            {/* Dog Profile Pictures */}
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-12 h-12 bg-light-green rounded-full flex items-center justify-center">
                  <span className="text-lg"><img src='/about/dog1.png' className="w-full object-contain"/></span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Block - Image and Text */}
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <img src='/about/fam.png' className="w-1/2 object-contain"/>
            {/* <div className="bg-cream rounded-xl h-48 mb-6 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-light-green rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-3xl">👥</span>
                </div>
                <p className="text-dark-green text-sm">People with Labrador</p>
              </div>
            </div> */}
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
            <div className="text-4xl font-bold text-green mb-2">500+</div>
            <div className="text-dark-green/80">Early Access Signups</div>
          </div>
          <div className="text-center border-r">
            <div className="text-4xl font-bold text-green mb-2">200+</div>
            <div className="text-dark-green/80">Private Fields Being Onboarded</div>
          </div>
          <div className="text-center border-r">
            <div className="text-4xl font-bold text-green mb-2">50+</div>
            <div className="text-dark-green/80">Cities Covered Across the UK</div>
          </div>
          <div className="text-center ">
            <div className="text-4xl font-bold text-green mb-2">100%</div>
            <div className="text-dark-green/80">Safe, Secure & Fenced Spaces</div>
          </div>
        </div>
      </div>
    </section>
  )
} 