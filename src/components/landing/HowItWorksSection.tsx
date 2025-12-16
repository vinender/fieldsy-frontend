import { useState, useRef, useEffect } from "react"
import Image from "next/image"

export  function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoError, setVideoError] = useState(false)
  
  const steps = [
    {
      icon: "/how-it-works/field.svg",
      title: "Find Fields Near You",
      description: "Easily find trusted, private dog walking fields near you using GPS or postcode search. No more crowded parks—just peaceful, secure spaces tailored for your dog's freedom.",
      image: "/dog.mp4",
      thumbnail: "/how-it-works/dog.webp"
    },
    { 
      icon: "/how-it-works/icon2.svg",
      title: "Select a Time Slots",
      description: "Choose from available time slots that work for your schedule.",
      image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=600&fit=crop"
    },
    {
      icon: "/how-it-works/icon3.svg",
      title: "Check Field Details",
      description: "Review field information, amenities, and safety features.",
      image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=600&fit=crop"
    },
    {
      icon: "/how-it-works/icon4.svg",
      title: "Confirm & Pay Securely",
      description: "Complete your booking with secure payment processing.",
      image: "https://images.unsplash.com/photo-1581888227599-779811939961?w=800&h=600&fit=crop"
    },
    {
      icon: "/how-it-works/icon5.svg",
      title: "Enjoy Off-Lead Freedom",
      description: "Let your dog run, play, and explore in a safe environment.",
      image: "https://images.unsplash.com/photo-1601758124096-1fd661873b95?w=800&h=600&fit=crop"
    }
  ]

  
  // Effect to handle video playback when activeStep changes
  useEffect(() => {
    setVideoError(false); // Reset error state when step changes
    
    // Small delay to ensure video element is mounted
    const timer = setTimeout(() => {
      if (videoRef.current && steps[activeStep].image.endsWith('.mp4')) {
        // Reset and play video
        videoRef.current.currentTime = 0;
        videoRef.current.muted = true; // Ensure muted for autoplay
        
        videoRef.current.play().catch(error => {
          console.log('Video autoplay failed:', error);
          // If still fails, mark as error
          setVideoError(true);
        });
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [activeStep]);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 xl:px-20 bg-light-cream">
      <div className="mx-auto w-full">
        <div className="grid grid-cols-1 h-full  lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Section - Process Steps */}
          <div className="h-full">
            <h2 className="text-5xl font-bold text-dark-green mb-12">
              How Fieldsy Works
            </h2>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div
                  key={index}
                  onMouseEnter={() => setActiveStep(index)}
                  className={`p-6 rounded-2xl transition-all border   shadow-sm duration-300 cursor-pointer ${
                    activeStep === index
                      ? 'bg-cream shadow-lg'
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 group rounded-xl flex items-center justify-center text-2xl transition-all duration-300 ${
                      activeStep === index
                        ? 'text-white '
                        : 'bg-cream'
                    }`}>
                      <Image src={step.icon} alt="Step icon" width={48} height={48} className={`w-full h-full ${index === 0 ? 'p-2 bg-cream' : ' bg-cream'} rounded-xl group-hover:bg-cream object-contain`}/>

                    </div>
                    <div className="flex-1">
                      <h3 className="xl:text-[24px] font-[600] xl:leading-[30px] mb-2 text-dark-green">
                        {step.title}
                      </h3>
                      {activeStep === index && (
                        <p className="text-dark-green text-opacity-[70%] text-[16px] leading-[24px]">
                          {step.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Section - Dynamic Image/Video */}
          <div className="relative h-full">
            <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl ">
              {steps[activeStep].image.endsWith('.mp4') && !videoError ? (
                <video
                  ref={videoRef}
                  key={`video-${activeStep}`}
                  poster={(steps[activeStep] as any).thumbnail || undefined}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  controls={false}
                  className="w-full h-full object-cover"
                  onError={() => {
                    console.log('Video failed to load, falling back to image');
                    setVideoError(true);
                  }}
                  onLoadedData={(e) => {
                    // Ensure video plays when data is loaded
                    const video = e.currentTarget;
                    video.muted = true;
                    video.play().catch(err => {
                      console.log('Autoplay prevented:', err);
                      setVideoError(true);
                    });
                  }}
                >
                  <source src={steps[activeStep].image} type="video/mp4" />
                  {/* Fallback to image if video doesn't load */}
                  {(steps[activeStep] as any).thumbnail && (
                    <Image
                      src={(steps[activeStep] as any).thumbnail}
                      alt={steps[activeStep].title}
                      fill
                      className="object-cover"
                    />
                  )}
                </video>
              ) : (
                <Image
                  src={(steps[activeStep] as any).thumbnail || steps[activeStep].image}
                  alt={steps[activeStep].title}
                  fill
                  className="object-cover transition-opacity duration-500"
                />
              )}
              {/* Overlay gradient for better text visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}