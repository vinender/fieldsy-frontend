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
    <div className="relative py-10 " >
     
      
      {/* Main content card */}
      <section className="relative max-w-[1620px] rounded-[40px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 xl:px-[80px] py-10 sm:py-12 md:py-16 lg:py-20 bg-white overflow-hidden" style={{ boxShadow: '0 -20px 60px -10px rgba(143, 179, 102, 0.6), 0 0 0 0 transparent' }}>
        {/* Inner top glow - subtle light bleeding into the card */}
        <div 
          className="absolute top-0 left-0 right-0 h-24"
          style={{
            background: 'linear-gradient(to bottom, rgba(143, 179, 102, 0.05) 0%, transparent 100%)',
            filter: 'blur(10px)'
          }}
        />
        
        <div className="relative ">
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