import { Play, Apple } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { DownloadAppButton } from "@/components/ui/download-app-button"
import Image from "next/image"
import { useEffect, useState, useRef } from 'react'
import { formatTextWithLineBreaks } from "@/utils/formatText"

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

// Helper function to parse stat value into number and suffix
function parseStatValue(value: string): { number: number; suffix: string } {
  const match = value.match(/^(\d+)(.*)$/);
  if (match) {
    return {
      number: parseInt(match[1], 10),
      suffix: match[2] || ''
    };
  }
  return { number: 0, suffix: value };
}

interface AboutHeroSectionProps {
  data?: {
    sectionTitle: string
    mainTitle: string
    subtitle?: string
    description: string
    buttonText: string
    image: string
    stats: Array<{
      value: string
      label: string
      order: number
    }>
  }
  loading?: boolean
}

export function AboutHeroSection({ data, loading }: AboutHeroSectionProps) {
  // Default data for fallback
  const defaultData = {
    sectionTitle: 'About Us',
    mainTitle: 'Safe, Private Fields Where Every Dog Can Run Free',
    description: 'Fieldsy is the UK\'s marketplace for private dog walking fields. We connect dog owners who need secure, enclosed spaces with landowners who have the land to offer. Whether your dog is reactive, in training, or simply loves to sprint Fieldsy makes it easy to find, book, and enjoy a peaceful off-lead session near you.',
    buttonText: 'Download the App',
    image: 'https://fieldsy-s3.s3.eu-west-2.amazonaws.com/defaults/about/dog2.webp',
    stats: [
      { value: '500+', label: 'Dog Owners Signed Up', order: 1 },
      { value: '200+', label: 'Private Fields Listed', order: 2 },
      { value: '50+', label: 'Towns & Cities Across the UK', order: 3 },
      { value: '100%', label: 'Secure, Fenced Spaces', order: 4 }
    ]
  }

  // Use data from API when available. Don't use fallback image — let it be empty
  // until real data arrives so there's no flash of a wrong image.
  const content = data || { ...defaultData, image: '' }
  const sortedStats = content.stats.sort((a, b) => a.order - b.order)

  // Check for mobile app mode to hide section title
  const [isMobileApp, setIsMobileApp] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const isApp = params.get('mobile') === 'true' ||
        params.get('source') === 'mobile' ||
        params.get('app') === 'true';
      setIsMobileApp(isApp);
    }
  }, []);

  if (loading) {
    return (
      <section className="px-4 sm:px-6 md:px-12 lg:px-16 xl:px-[80px] py-10 sm:py-12 md:py-16 w-full lg:py-20 bg-light-cream">
        <div className="w-full">
          <Skeleton className="h-6 w-24 mb-6 sm:mb-8" />
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-12 w-3/4 mb-8" />
              <Skeleton className="h-24 w-full mb-8" />
              <Skeleton className="h-12 w-40" />
            </div>
            <Skeleton className="h-[300px] sm:h-[400px] lg:h-[500px] w-full rounded-2xl" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mt-12 sm:mt-16 pt-12 sm:pt-16 border-t border-dark-green/20">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-16 w-24 mx-auto mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="px-4 sm:px-6 md:px-12 lg:px-16 xl:px-[80px] py-10 sm:py-12 md:py-16 w-full lg:py-20 bg-light-cream">
      <div className="w-full">
        {!isMobileApp && (
          <h2 className="text-[16px] sm:text-[18px] md:text-[20px] xl:text-[29px] font-[600] text-dark-green">
            {content.sectionTitle}
          </h2>
        )}

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[48px] font-[700] text-dark-green mb-6 sm:mb-8 leading-tight sm:leading-tight md:leading-tight lg:leading-[1.1] xl:leading-[60px]">
              {formatTextWithLineBreaks(content.mainTitle)}
            </h1>

            <p className="text-sm sm:text-base lg:text-[18px] text-dark-green/80 mb-8 sm:mb-10 leading-relaxed sm:leading-relaxed lg:leading-[30px] font-[400]">
              {formatTextWithLineBreaks(content.description)}
            </p>

            <DownloadAppButton />
          </div>

          {/* Right Image — only render when we have an actual image URL to avoid fallback flash */}
          <div className="relative mt-8 lg:mt-0">
            <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl relative h-[300px] sm:h-[400px] lg:h-[500px] bg-gray-100">
              {content?.image ? (
                <Image
                  src={content.image}
                  alt="Dog playing with toy in field"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                />
              ) : null}
            </div>
          </div>

        </div>

        {/* Stats - only show if at least one stat has a meaningful value (> 0) */}
        {(() => {
          const hasMeaningfulStats = sortedStats.some((stat) => {
            const { number } = parseStatValue(stat.value);
            return number > 0;
          });

          if (hasMeaningfulStats) {
            return (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mt-12 sm:mt-16 pt-12 sm:pt-16 border-t border-dark-green/20">
                {sortedStats.map((stat, index) => {
                  const { number, suffix } = parseStatValue(stat.value);
                  return (
                    <div
                      key={index}
                      className={`text-center ${index < sortedStats.length - 1 ? 'border-r border-dark-green/20 pr-4 sm:pr-6 lg:pr-8' : ''
                        } ${index === 1 ? 'border-r-0 md:border-r' : ''}`}
                    >
                      <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[68px] font-[400] text-dark-green mb-1 sm:mb-2 leading-tight xl:leading-[76px]">
                        <AnimatedCounter end={number} suffix={suffix} duration={2000} />
                      </h3>
                      <p className="text-xs sm:text-sm lg:text-[18px] text-dark-green/80 font-[400]">
                        {stat.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            );
          }

          return (
            <div className="mt-12 sm:mt-16 pt-12 sm:pt-16 border-t border-dark-green/20 text-center">
              <p className="text-lg sm:text-xl lg:text-2xl text-dark-green font-[600] leading-relaxed">
                Growing network of verified, private dog fields across the UK
              </p>
            </div>
          );
        })()}

      </div>
    </section>
  )
}