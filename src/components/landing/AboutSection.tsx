import Image from "next/image"
import { usePublicAboutSettings } from '@/hooks/queries/useAboutSettings';
import { useEffect, useState, useRef } from 'react';

// Animated counter component with meter-style animation
function AnimatedCounter({
  end,
  suffix = '',
  duration = 2000
}: {
  end: number;
  suffix?: string;
  duration?: number
}) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          const startTime = performance.now();
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function for smooth deceleration
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentCount = Math.floor(easeOutQuart * end);

            setCount(currentCount);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(end);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return (
    <div ref={ref}>
      {count}{suffix}
    </div>
  );
}

export function AboutSection() {
  const { settings, loading } = usePublicAboutSettings();

  // Use default images as fallbacks
  const dogImage = settings.aboutDogImage || '/about/dog2.png';
  const familyImage = settings.aboutFamilyImage || '/about/fam.png';
  const dogIcons = settings.aboutDogIcons && settings.aboutDogIcons.length > 0 
    ? settings.aboutDogIcons 
    : ['/about/dog1.png', '/about/dog1.png', '/about/dog1.png', '/about/dog1.png', '/about/dog1.png'];

  return (

    <section className="py-10 px-4 sm:py-16 sm:px-6 lg:px-8 xl:py-20 xl:px-20 bg-light-cream">
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
            <Image src={dogImage} alt="Happy dog" fill className="object-cover"/>
          </div>
          
          {/* Container for content blocks - Below image on mobile/medium, beside on large */}
          <div className="flex flex-col md:flex-row w-full xl:flex-1 xl:min-w-[600px] gap-4 sm:gap-6 xl:gap-8"> 
            {/* Middle Block - Text with Dog Icons */}
            <div className="bg-white rounded-2xl sm:rounded-[32px] flex flex-col justify-evenly p-4 sm:p-6 xl:p-8 shadow-xl flex-1 xl:min-w-[280px]">
              <p className="text-dark-green font-[600] text-sm sm:text-base xl:text-[18px] leading-relaxed sm:leading-[28px] xl:leading-[30px] mb-4 xl:mb-6">
                Born out of love for dogs and a need for secure, off-lead spaces, Fieldsy helps you find and book private dog walking fields across the UK—quickly and effortlessly.
              </p>
              <p className="text-dark-green/70 text-sm sm:text-base xl:text-[18px] font-[400] leading-relaxed sm:leading-[28px] xl:leading-[30px] mb-4 sm:mb-6 xl:mb-8">
                {`Whether your pup is reactive, in training, or just loves wide-open spaces, we&apos;re here to make your walks safer, calmer, and more joyful.`}
              </p>

              {/* Dog Profile Pictures */}
                <div className="flex justify-center">
                  {dogIcons?.slice(0, 5).map((icon, index) => (
                    <div
                      key={index}
                      className={`w-12 h-12 sm:w-16 sm:h-16 xl:w-18 xl:h-18 rounded-full overflow-hidden flex items-center justify-center relative ${
                        index !== 0 ? '-ml-4 sm:-ml-6 xl:-ml-6' : ''
                      }`}
                    >
                      <Image src={icon} alt={`Dog ${index + 1}`} fill className="object-cover border-2 border-white rounded-full" />
                    </div>
                  ))}
                </div>

            </div>

          {/* Right Block - Image and Text */}
            <div className="bg-white rounded-2xl sm:rounded-[32px] p-4 sm:p-6 xl:p-8 shadow-xl flex-1 flex flex-col min-h-[400px] sm:min-h-[450px] md:min-h-[500px] xl:min-h-0">
              <div className="relative w-full h-[200px] sm:h-[250px] md:h-[280px] xl:flex-1 mb-4 sm:mb-6 rounded-[16px] sm:rounded-[20px] xl:rounded-[24px] overflow-hidden">
                <Image
                  src={familyImage}
                  alt="Trusted by thousands"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="flex flex-col justify-center space-y-2 sm:space-y-3 xl:space-y-4 py-2">
                <h3 className="text-lg sm:text-xl xl:text-[24px] text-center leading-[26px] sm:leading-[28px] xl:leading-[30px] font-[600] text-dark-green">
                  Trusted by thousands of dog lovers
                </h3>
                <p className="text-sm sm:text-base xl:text-[18px] text-center leading-[22px] sm:leading-[26px] xl:leading-[30px] text-dark-green/70">
                  Backed by real reviews, easy bookings, and growing across hundreds of secure fields.
                </p>
              </div>
            </div>
          </div>


        </div>

        {/* Statistics Section */}
       <div className="grid grid-cols-2  md:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6 xl:gap-8">
          <div className="text-center border-r border-dark-green/20 pr-4 sm:pr-6 xl:pr-8">
            <div className="text-3xl sm:text-4xl md:text-5xl xl:text-[68px] leading-tight sm:leading-[60px] xl:leading-[76px] font-[400] text-dark-green">
              <AnimatedCounter end={500} suffix="+" duration={2000} />
            </div>
            <div className="text-dark-green/70 text-xs sm:text-sm xl:text-[18px] font-[400] mt-1 sm:mt-2">Early Access Signups</div>
          </div>
          <div className="text-center border-r-0 md:border-r border-dark-green/20 pr-0 xl:pr-8">
            <div className="text-3xl sm:text-4xl md:text-5xl xl:text-[68px] leading-tight sm:leading-[60px] xl:leading-[76px] font-[400] text-dark-green">
              <AnimatedCounter end={200} suffix="+" duration={2000} />
            </div>
            <div className="text-dark-green/70 text-xs sm:text-sm xl:text-[18px] font-[400] mt-1 sm:mt-2">Private Fields Being Onboarded</div>
          </div>
          <div className="text-center border-r border-dark-green/20 pr-4 sm:pr-6 xl:pr-8">
            <div className="text-3xl sm:text-4xl md:text-5xl xl:text-[68px] leading-tight sm:leading-[60px] xl:leading-[76px] font-[400] text-dark-green">
              <AnimatedCounter end={50} suffix="+" duration={1500} />
            </div>
            <div className="text-dark-green/70 text-xs sm:text-sm xl:text-[18px] font-[400] mt-1 sm:mt-2">Cities Covered Across the UK</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl md:text-5xl xl:text-[68px] leading-tight sm:leading-[60px] xl:leading-[76px] font-[400] text-dark-green">
              <AnimatedCounter end={100} suffix="%" duration={1800} />
            </div>
            <div className="text-dark-green/70 text-xs sm:text-sm xl:text-[18px] font-[400] mt-1 sm:mt-2">Safe, Secure & Fenced Spaces</div>
          </div>
        </div> 
        
      </div>
    </section>
  )
} 