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
  const description = data?.description || "At Fieldsy, we're on a mission to create safe, accessible spaces where every dog can enjoy off-lead freedom. We connect dog owners with private, secure fields across the UK—making it easy to find, book, and enjoy peaceful walks away from busy parks and crowded spaces."

  return (
    <div className="relative overflow-hidden">
      {/* Background light source - creates the scattered light effect */}
      <div 
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-[1%] h-10"
        style={{
          background: 'radial-gradient(ellipse at center top, rgba(143, 179, 102, 0.25) 0%, rgba(143, 179, 102, 0.15) 25%, rgba(143, 179, 102, 0.05) 50%, transparent 70%)',
          filter: 'blur(10px)',
          transform: 'translateX(-50%) translateY(-50%)'
        }}
      />
      
      {/* Light scatter rays - simulating light diffraction */}
      <div 
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[10%] h-10"
        style={{
          background: 'conic-gradient(from 180deg at 50% 0%, transparent 0deg, rgba(143, 179, 102, 0.1) 45deg, transparent 90deg, rgba(143, 179, 102, 0.1) 135deg, transparent 180deg, rgba(143, 179, 102, 0.1) 225deg, transparent 270deg, rgba(143, 179, 102, 0.1) 315deg, transparent 360deg)',
          filter: 'blur(60px)',
          opacity: 0.6
        }}
      />
      
      {/* Edge glow - light wrapping around the card edges */}
      <div 
        className="absolute -top-4 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] h-32"
        style={{
          background: 'linear-gradient(to bottom, rgba(143, 179, 102, 0.3) 0%, rgba(143, 179, 102, 0.1) 40%, transparent 100%)',
          filter: 'blur(20px)',
          borderRadius: '24px 24px 0 0'
        }}
      />
      
      {/* Soft ambient glow */}
      <div 
        className="absolute -top-16 left-0 right-0 h-48"
        style={{
          background: 'linear-gradient(180deg, rgba(212, 228, 188, 0.3) 0%, rgba(143, 179, 102, 0.1) 30%, transparent 60%)',
          filter: 'blur(40px)'
        }}
      />
      
      {/* Main content card */}
      <section className="relative px-4 sm:px-6 md:px-12 lg:px-16 xl:px-[80px] py-10 sm:py-12 md:py-16 lg:py-20 bg-white overflow-hidden rounded-t-3xl shadow-xl">
        {/* Inner top glow - subtle light bleeding into the card */}
        <div 
          className="absolute top-0 left-0 right-0 h-24"
          style={{
            background: 'linear-gradient(to bottom, rgba(143, 179, 102, 0.05) 0%, transparent 100%)',
            filter: 'blur(10px)'
          }}
        />
        
        <div className="relative w-full">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[48px] font-[700] text-center text-dark-green mb-6 sm:mb-8 md:mb-10 lg:mb-12 leading-tight sm:leading-[1.3] md:leading-[1.2] lg:leading-[60px]">
            {title}
          </h2>
          
          <p className="text-base sm:text-lg md:text-2xl lg:text-[32px] text-center text-dark-green/80 max-w-6xl mx-auto leading-relaxed sm:leading-[1.6] md:leading-[1.5] lg:leading-[46px] font-[400]" 
             dangerouslySetInnerHTML={{ 
               __html: description.replace(
                 'every dog can enjoy off-lead freedom', 
                 '<span class="font-[600] text-green">every dog can enjoy off-lead freedom</span>'
               )
             }}
          />
        </div>
      </section>
    </div>
  )
}