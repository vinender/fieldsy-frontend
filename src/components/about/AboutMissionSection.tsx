interface AboutMissionSectionProps {
  data?: {
    title: string
    description: string
    buttonText?: string
    image?: string
  }
  loading?: boolean
}

export function AboutMissionSection({ data, loading }: AboutMissionSectionProps) {
  // Use data from API or fallback to hardcoded values
  const title = data?.title || 'Our Mission'
  const description = data?.description || "At Fieldsy, we are on a mission to give every dog the freedom to explore off-lead -- safely. We connect dog owners with private, fully enclosed fields across the UK, making it simple to find, book, and enjoy peaceful walks away from busy parks, unpredictable dogs, and crowded spaces. Because every dog deserves room to run, and every owner deserves peace of mind."

  return (
    <div className="relative pt-20 pb-10 px-4 sm:px-6 md:px-12 lg:px-16 xl:px-[80px]">
      {/* Top glow effect - positioned above the card, spreading upward */}
      <div className="absolute left-1/2 -translate-x-1/2 top-4 w-[60%] max-w-[800px] h-20 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse 100% 100% at 50% 100%, rgba(143, 179, 102, 0.8) 0%, rgba(143, 179, 102, 0.5) 30%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />

      {/* Main content card - full width within padding */}
      <section className="relative w-full rounded-[24px] sm:rounded-[32px] lg:rounded-[40px] px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 py-10 sm:py-12 md:py-16 lg:py-20 bg-white z-10">
        <div className="relative max-w-full mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[48px] font-[700] text-center text-dark-green mb-6 sm:mb-8 md:mb-10 lg:mb-12 leading-tight sm:leading-[1.3] md:leading-[1.2] lg:leading-[60px]">
            {title}
          </h2>

          <p className="text-base sm:text-lg  md:text-2xl lg:text-[32px] text-center text-dark-green/80 leading-relaxed sm:leading-[1.6] md:leading-[1.5] lg:leading-[46px] font-[400]"
             dangerouslySetInnerHTML={{
               __html: description.replace(
                 'every dog the freedom to explore off-lead -- safely',
                 '<span class="font-[600] text-green">every dog the freedom to explore off-lead -- safely</span>'
               )
             }}
          />
        </div>
      </section>
      
    </div>
  )
}