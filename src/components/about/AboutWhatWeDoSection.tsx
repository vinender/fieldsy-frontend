export function AboutWhatWeDoSection() {
  return (
    <section className="px-4 sm:px-6 md:px-12 lg:px-16 xl:px-[80px] py-10 sm:py-12 md:py-16 lg:py-20 bg-cream">
      <div className="w-full">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[48px] font-[700] text-center text-dark-green mb-6 sm:mb-8 leading-tight lg:leading-[60px]">
          What We Do
        </h2>
        
        <p className="text-sm sm:text-base lg:text-[18px] text-center text-dark-green/80 max-w-5xl mx-auto mb-12 sm:mb-16 leading-relaxed lg:leading-[30px] font-[400]">
          At Fieldsy, we make it simple for dog owners to find and book secure fields, while helping 
          landowners earn from their unused spaces. Our platform connects both sides seamlessly.
        </p>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <div key={num} className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
              <div 
                className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl text-white font-[700] text-xl sm:text-[24px] mb-4 sm:mb-6 bg-light-green"
              >
                {String(num).padStart(2, '0')}
              </div>
              <h3 className="text-lg sm:text-xl lg:text-[24px] font-[600] text-dark-green mb-3 sm:mb-4 leading-tight lg:leading-[32px]">
                {num === 1 ? 'Find Available Fields' : num === 2 ? 'Book Instantly' : num === 3 ? 'Secure Payment' : num === 4 ? 'Check-In Easily' : num === 5 ? 'Leave Reviews' : 'List Your Field'}
              </h3>
              <p className="text-sm lg:text-[16px] text-dark-green/80 leading-relaxed lg:leading-[24px] font-[400]">
                {num === 1 ? 'Search nearby secure dog fields with real-time availability.' : num === 2 ? 'Reserve your slot with just a few taps - no calls needed.' : num === 3 ? 'Safe, encrypted payments through our trusted platform.' : num === 4 ? 'Get directions and access codes sent to your phone.' : num === 5 ? 'Share your experience and help other dog owners.' : 'Turn your unused land into income by listing with us.'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}