import { useState, useRef, useEffect, useCallback } from 'react'

interface AboutWhoWeAreSectionProps {
  data?: {
    title: string
    description: string
    mainImage?: string
    rightCardImage?: string
    rightCardTitle?: string
    rightCardDescription?: string
    features: Array<{
      icon: string
      title: string
      description: string
      order: number
    }>
  }
  loading?: boolean
}


export function AboutWhoWeAreSection({ data, loading }: AboutWhoWeAreSectionProps) {
  const [rowHeight, setRowHeight] = useState<number | undefined>(undefined);
  const [isWide, setIsWide] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const title = data?.title || 'Who We Are'
  const description = data?.description || "We are a small, passionate team of dog lovers, developers, and outdoor enthusiasts based in the UK. We built Fieldsy because we know first-hand how hard it can be to find a safe, enclosed space for reactive, nervous, or high-energy dogs. Our combined love for technology and animals drives everything we do -- and we will not stop until every dog owner in the UK has a private field within easy reach."
  const mainImage = data?.mainImage || 'https://fieldsy-s3.s3.eu-west-2.amazonaws.com/defaults/about/fam.webp'
  const rightCardImage = data?.rightCardImage || 'https://fieldsy-s3.s3.eu-west-2.amazonaws.com/defaults/about/fam.webp'
  const rightCardTitle = data?.rightCardTitle || 'Loved by Paws and People Alike'
  const rightCardDescription = data?.rightCardDescription || 'From tail wags to five-star reviews -- Fieldsy is the trusted platform where dog owners discover, book, and enjoy safe outdoor spaces with confidence.'

  // >= 1700px: lock row height to middle image's natural aspect ratio
  // < 1700px: let flexbox items-stretch handle equal heights
  const updateHeight = useCallback(() => {
    const wide = window.innerWidth >= 1700
    setIsWide(wide)
    if (wide && imgRef.current && imgRef.current.naturalHeight > 0) {
      setRowHeight(imgRef.current.offsetHeight)
    } else {
      setRowHeight(undefined)
    }
  }, [])

  useEffect(() => {
    updateHeight()
    let timeout: ReturnType<typeof setTimeout>
    const throttledUpdate = () => {
      clearTimeout(timeout)
      timeout = setTimeout(updateHeight, 150)
    }
    window.addEventListener('resize', throttledUpdate)
    return () => {
      clearTimeout(timeout)
      window.removeEventListener('resize', throttledUpdate)
    }
  }, [updateHeight])

  return (
    <section className="px-4 sm:px-6 md:px-12 lg:px-16 xl:px-[80px] py-10 sm:py-12 md:py-16 lg:py-20 bg-light-cream">
      <div className="w-full">
        <div
          className="flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8 lg:gap-12 lg:items-stretch"
          style={rowHeight ? { height: rowHeight } : undefined}
        >
          {/* Left Content */}
          <div className="w-full lg:w-[30%] shadow-xl flex flex-col px-[24px] py-[28px] bg-white rounded-[32px] overflow-hidden">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[24px] font-[700] text-dark-green mb-3 sm:mb-4 md:mb-6 leading-tight sm:leading-[1.3] md:leading-[1.2] lg:leading-[30px]">
              {title}
            </h2>

            <p className="text-sm sm:text-base lg:text-[18px] text-dark-green/80 mb-4 sm:mb-6 md:mb-8 leading-[1.6] sm:leading-[1.7] md:leading-relaxed lg:leading-[30px] font-[400] flex-grow min-h-0 overflow-hidden">
              {description}
            </p>

            <div className="flex -space-x-3 mt-auto flex-shrink-0">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full border-4 border-white overflow-hidden ${
                    i !== 1 ? '-ml-3 sm:-ml-4' : ''
                  }`}
                >
                  <img
                  src={`dog-${i}.png`}
                    // src="https://fieldsy-s3.s3.eu-west-2.amazonaws.com/defaults/about/dog1.webp"
                    alt={`Dog ${i}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Middle Image */}
          <div className="w-full lg:w-[40%] flex items-center justify-center">
            <div className="rounded-3xl overflow-hidden">
              <img
                ref={imgRef}
                src={mainImage}
                alt="Woman playing with dog in field"
                className={isWide ? 'max-w-full h-auto block' : 'w-full h-full object-cover'}
                onLoad={updateHeight}
              />
            </div>
          </div>

          {/* Right Content */}
          <div className="w-full lg:w-[30%] flex flex-col bg-white rounded-2xl shadow-xl p-4 overflow-hidden">
            <div className="flex-1 min-h-0">
              <img
                src={rightCardImage}
                alt="Happy dog in field"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>

            <h3 className="text-lg sm:text-xl md:text-2xl lg:text-[24px] font-[700] text-dark-green mb-2 sm:mb-3 md:mb-4 mt-4 leading-tight sm:leading-[1.3] md:leading-[1.2] lg:leading-[30px] flex-shrink-0">
              {rightCardTitle.split('and').map((part, index) => (
                <span key={index}>
                  {part}
                  {index === 0 && <><br />and</>}
                </span>
              ))}
            </h3>
            <p className="text-sm sm:text-base lg:text-[18px] text-dark-green/80 leading-[1.6] sm:leading-[1.7] md:leading-relaxed lg:leading-[30px] font-[400] flex-shrink-0">
              {rightCardDescription}
            </p>
          </div>

        </div>
      </div>
    </section>
  )
}
