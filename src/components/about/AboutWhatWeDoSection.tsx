interface AboutWhatWeDoSectionProps {
  data?: {
    title: string
    subtitle?: string
    description: string
    image: string
    features: Array<{
      title: string
      description: string
      order: number
    }>
  }
  loading?: boolean
}

export function AboutWhatWeDoSection({ data, loading }: AboutWhatWeDoSectionProps) {
  // Use data from API or fallback to hardcoded values
  const title = data?.title || 'What We Do'
  const description = data?.description || "Fieldsy brings dog owners and landowners together on one simple platform. Dog owners browse and book secure, private fields. Landowners list their land and earn income. Everyone benefits especially the dogs."
  const features = data?.features?.length ? data.features : [
    { title: 'Browse Fields Near You', description: 'Explore a growing network of private, secure dog walking fields across the UK. Filter by size, amenities, and distance.', order: 1 },
    { title: 'Book Instantly', description: 'Reserve your time slot in a few taps no waiting, no back-and-forth with the host.', order: 2 },
    { title: 'Enjoy Peace of Mind', description: 'Let your dog run free in a fully enclosed, verified space. No unexpected dogs, no distractions.', order: 3 },
    { title: 'List Your Land', description: 'Turn unused or underused land into a steady source of income by hosting dog owners.', order: 4 },
    { title: 'Set Your Own Schedule', description: 'Control exactly when your field is available. Block dates, set opening hours, adjust as you go.', order: 5 },
    { title: 'Get Paid Automatically', description: 'Receive secure payouts directly to your bank account after each completed booking. Powered by Stripe.', order: 6 }
  ]

  return (
    <section className="px-4 sm:px-6 md:px-12 lg:px-16 xl:px-[80px] py-10 sm:py-12 md:py-16 lg:py-20 bg-cream">
      <div className="w-full">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[48px] font-[700] text-center text-dark-green mb-6 sm:mb-8 leading-tight lg:leading-[60px]">
          {title}
        </h2>
        
        <p className="text-sm sm:text-base lg:text-[18px] text-center text-dark-green/80 max-w-5xl mx-auto mb-12 sm:mb-16 leading-relaxed lg:leading-[30px] font-[400]">
          {description}
        </p>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {features.sort((a, b) => a.order - b.order).map((feature, index) => (
            <div key={feature.order || index} className="bg-transparent rounded-2xl p-6 sm:p-8 hover:shadow-lg">
              <div 
                className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl text-white font-[700] text-xl sm:text-[24px] mb-4 sm:mb-6 bg-light-green"
              >
                {String(index + 1).padStart(2, '0')}
              </div>
              <h3 className="text-lg sm:text-xl lg:text-[24px] font-[600] text-dark-green mb-3 sm:mb-4 leading-tight lg:leading-[32px]">
                {feature.title}
              </h3>
              <p className="text-sm lg:text-[16px] text-dark-green/80 leading-relaxed lg:leading-[24px] font-[400]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}