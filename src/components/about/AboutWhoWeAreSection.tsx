export function AboutWhoWeAreSection() {
  return (
    <section className="px-4 sm:px-6 md:px-12 lg:px-16 xl:px-[80px] py-10 sm:py-12 md:py-16 lg:py-20 bg-light-cream">
      <div className="w-full">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8 lg:gap-12 items-stretch">
          {/* Left Content - 30% width */}
          <div className="w-full lg:w-[30%] shadow-xl flex flex-col px-[24px] py-[28px] bg-white rounded-[32px]">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[24px] font-[700] text-dark-green mb-3 sm:mb-4 md:mb-6 leading-tight sm:leading-[1.3] md:leading-[1.2] lg:leading-[30px]">
              Who We Are
            </h2>
            
            <p className="text-sm sm:text-base lg:text-[18px] text-dark-green/80 mb-4 sm:mb-6 md:mb-8 leading-[1.6] sm:leading-[1.7] md:leading-relaxed lg:leading-[30px] font-[400] flex-grow">
              We're a passionate team of dog lovers, developers, and outdoor enthusiasts who understand the 
              challenges of finding safe spaces for reactive, nervous, or energetic dogs. With our combined 
              love for technology and animals, we've built Fieldsy to give every dog the freedom they deserve.
            </p>
            
            {/* Team member avatars */}
            <div className="flex -space-x-3 mt-auto">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full border-4 border-white overflow-hidden ${
                    i !== 1 ? '-ml-3 sm:-ml-4' : ''
                  }`}
                >
                  <img
                    src="/about/dog1.png"
                    alt={`Dog ${i}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Middle Image - 40% width */}
          <div className="w-full lg:w-[40%] flex">
            <div className="rounded-3xl overflow-hidden shadow-xl flex-1 flex">
              <img 
                src="/about/fam.png"
                alt="Woman playing with dog in field"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right Content - 30% width */}
          <div className="w-full lg:w-[30%] flex flex-col bg-white rounded-2xl shadow-xl p-4">
            <div className="space-y-4 mb-8 flex-grow">
              {/* <img 
                src="/about/dog2.png"
                alt="Dog agility training"
                className="rounded-2xl w-full h-[150px] sm:h-[200px] lg:h-[250px] object-cover"
              /> */}
              <img 
                src="/about/fam.png"
                alt="Happy dog in field"
                className="rounded-2xl w-full h-[120px] sm:h-[150px] md:h-[200px] lg:h-[250px] object-cover"
              />
            </div>
            
            <h3 className="text-lg sm:text-xl md:text-2xl lg:text-[32px] font-[700] text-dark-green mb-2 sm:mb-3 md:mb-4 leading-tight sm:leading-[1.3] md:leading-[1.2] lg:leading-[40px]">
              Loved by Paws and<br />People Alike
            </h3>
            <p className="text-sm sm:text-base lg:text-[18px] text-dark-green/80 leading-[1.6] sm:leading-[1.7] md:leading-relaxed lg:leading-[30px] font-[400] mt-auto">
              From tail wags to five-star ratings—Fieldsy is the go-to space for dog 
              lovers to connect, explore, and book safe outdoor spots with ease.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}