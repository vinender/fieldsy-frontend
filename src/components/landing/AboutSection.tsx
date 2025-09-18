
import { usePublicAboutSettings } from '@/hooks/queries/useAboutSettings';

export function AboutSection() {
  const { settings, loading } = usePublicAboutSettings();

  // Use default images as fallbacks
  const dogImage = settings.aboutDogImage || '/about/dog2.png';
  const familyImage = settings.aboutFamilyImage || '/about/fam.png';
  const dogIcons = settings.aboutDogIcons && settings.aboutDogIcons.length > 0 
    ? settings.aboutDogIcons 
    : ['/about/dog1.png', '/about/dog1.png', '/about/dog1.png', '/about/dog1.png', '/about/dog1.png'];

  return (

    <section className="py-10 px-4 sm:py-16 sm:px-8 xl:py-20 xl:px-20 bg-light-cream">
      <div className="mx-auto w-full  ">
        {/* Headline */}
        <div className="text-center mb-8 sm:mb-12 xl:mb-16">
          <h2 className="text-2xl sm:text-[32px] md:text-[42px] xl:text-[48px] text-center xl:text-left max-w-[1075px] font-[700] text-dark-green leading-[40px] md:leading-[50px] xl:leading-[56px]">
            {settings.aboutTitle}
          </h2>
        </div>

        {/* Main Content Blocks */}
        <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 xl:gap-8 mb-8 sm:mb-12 xl:mb-16">
          {/* Dog Image - Full width on mobile/medium, 44% on large */}
          <div className="relative w-full xl:w-[44%] xl:flex-shrink xl:flex-grow-0 xl:min-w-[200px] h-[300px] sm:h-[400px] md:h-[450px] xl:h-auto rounded-2xl overflow-hidden">
            <img src={dogImage} alt="Happy dog" className="object-cover w-full h-full"/>
          </div>
          
          {/* Container for content blocks - Below image on mobile/medium, beside on large */}
          <div className="flex flex-col md:flex-row w-full xl:flex-1 xl:min-w-[600px] gap-4 sm:gap-6 xl:gap-8"> 
            {/* Middle Block - Text with Dog Icons */}
            <div className="bg-white rounded-2xl sm:rounded-[32px] flex flex-col justify-evenly p-4 sm:p-6 xl:p-8 shadow-xl flex-1 xl:min-w-[280px]">
              <p className="text-dark-green font-[600] text-sm sm:text-base xl:text-[18px] leading-relaxed sm:leading-[28px] xl:leading-[30px] mb-4 xl:mb-6">
                Born out of love for dogs and a need for secure, off-lead spaces, Fieldsy helps you find and book private dog walking fields across the UK—quickly and effortlessly.
              </p>
              <p className="text-dark-green/70 text-sm sm:text-base xl:text-[18px] font-[400] leading-relaxed sm:leading-[28px] xl:leading-[30px] mb-4 sm:mb-6 xl:mb-8">
                Whether your pup is reactive, in training, or just loves wide-open spaces, we&apos;re here to make your walks safer, calmer, and more joyful.
              </p>

              {/* Dog Profile Pictures */}
                <div className="flex justify-center">
                  {dogIcons.slice(0, 5).map((icon, index) => (
                    <div
                      key={index}
                      className={`w-12 h-12 sm:w-16 sm:h-16 xl:w-20 xl:h-20 rounded-full overflow-hidden flex items-center justify-center ${
                        index !== 0 ? '-ml-4 sm:-ml-6 xl:-ml-8' : ''
                      }`}
                    >
                      <img src={icon} alt={`Dog ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>

            </div>

          {/* Right Block - Image and Text */}
            <div className="bg-white rounded-2xl sm:rounded-[32px] p-4 sm:p-6 xl:p-8 shadow-xl flex-1  flex flex-col h-full ">
              <div className="w-full h-[50%] xl:h-[80%]  flex items-center justify-center"> 
                <img src={familyImage} alt="Trusted by thousands" className="object-cover rounded-[24px] w-full h-full"/> 
              </div>
              <div className="h-full xl:h-3/5 flex space-y-5 flex-col justify-center"> 
                <h3 className="text-lg sm:text-xl xl:text-[24px] text-center leading-[26px] sm:leading-[28px] xl:leading-[30px] font-[600] text-dark-green mb-2 sm:mb-3">
                  Trusted by thousands of dog lovers
                </h3>
                <p className="text-sm sm:text-[18px] text-center leading-[30px] text-dark-green/70">
                  Backed by real reviews, easy bookings, and growing across hundreds of secure fields.
                </p>
              </div>
            </div>
          </div>


        </div>

        {/* Statistics Section */}
       <div className="grid grid-cols-2  md:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6 xl:gap-8">
          <div className="text-center border-r border-dark-green/20 pr-4 sm:pr-6 xl:pr-8">
            <div className="text-3xl sm:text-4xl md:text-5xl xl:text-[68px] leading-tight sm:leading-[60px] xl:leading-[76px] font-[400] text-dark-green">500+</div>
            <div className="text-dark-green/70 text-xs sm:text-sm xl:text-[18px] font-[400] mt-1 sm:mt-2">Early Access Signups</div>
          </div>
          <div className="text-center border-r-0 md:border-r border-dark-green/20 pr-0 xl:pr-8">
            <div className="text-3xl sm:text-4xl md:text-5xl xl:text-[68px] leading-tight sm:leading-[60px] xl:leading-[76px] font-[400] text-dark-green">200+</div>
            <div className="text-dark-green/70 text-xs sm:text-sm xl:text-[18px] font-[400] mt-1 sm:mt-2">Private Fields Being Onboarded</div>
          </div>
          <div className="text-center border-r border-dark-green/20 pr-4 sm:pr-6 xl:pr-8">
            <div className="text-3xl sm:text-4xl md:text-5xl xl:text-[68px] leading-tight sm:leading-[60px] xl:leading-[76px] font-[400] text-dark-green">50+</div>
            <div className="text-dark-green/70 text-xs sm:text-sm xl:text-[18px] font-[400] mt-1 sm:mt-2">Cities Covered Across the UK</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl md:text-5xl xl:text-[68px] leading-tight sm:leading-[60px] xl:leading-[76px] font-[400] text-dark-green">100%</div>
            <div className="text-dark-green/70 text-xs sm:text-sm xl:text-[18px] font-[400] mt-1 sm:mt-2">Safe, Secure & Fenced Spaces</div>
          </div>
        </div> 
        
      </div>
    </section>
  )
} 