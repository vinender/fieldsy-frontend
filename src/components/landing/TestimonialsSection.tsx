import { useState } from "react"
import { Star } from "lucide-react"

export function TestimonialsSection() {
  const [currentSlide, setCurrentSlide] = useState(1) // Starting at slide 2 (index 1)
  
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Dog Owner",
      text: "Perfect for my reactive rescue! The secure fields give us the freedom we never had before. Worth every penny.",
      rating: 5,
      avatar: "👩‍🦰"
    },
    {
      id: 2,
      name: "John Smith",
      role: "Daily Customer",
      text: "Fieldsy has been a game-changer for our daily walks. Finding secure, private fields nearby means our anxious lab can finally enjoy off-lead time without stress. Booking is simple and the app works flawlessly!",
      rating: 5,
      avatar: "👨‍💼"
    },
    {
      id: 3,
      name: "Emma Wilson",
      role: "Field Owner",
      text: "Started listing my unused paddock last month and already earning steady income. Love helping local dog owners!",
      rating: 5,
      avatar: "👩"
    },
    {
      id: 4,
      name: "Mike Chen",
      role: "Weekend User",
      text: "Great app! My energetic border collie finally has space to run freely. The booking process is super easy.",
      rating: 5,
      avatar: "👨"
    }
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const currentTestimonial = testimonials[currentSlide]

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32" style={{ backgroundColor: '#FAF7F2' }}>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[44px] xl:text-[48px] leading-tight sm:leading-10 md:leading-[48px] lg:leading-[52px] xl:leading-[56px] font-bold text-dark-green">
            What Dog Lovers Are Saying
          </h2>
        </div>
        
        {/* Testimonial Card */}
        <div className="relative w-full mx-auto px-14 sm:px-16 md:px-20 lg:px-24">
          {/* Navigation Arrows */}
          <button 
            onClick={prevSlide}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 z-10"
            style={{ backgroundColor: '#8FB653' }}
          >
           <img src='/testimonial/left.png' className="w-full h-full object-contain"/>
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 z-10"
            style={{ backgroundColor: '#8FB653' }}
          >
            {/* <ChevronRight className="w-6 h-6 text-white" /> */}
            <img src='/testimonial/right.png' className="w-full h-full object-contain"/>
          </button>
          
          {/* Main Testimonial Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16 shadow-lg mx-auto max-w-5xl">
            <div className="flex flex-col lg:flex-row items-start gap-6 sm:gap-8 lg:gap-10 xl:gap-12">
              {/* Profile Picture */}
              <div className="flex-shrink-0 mx-auto lg:mx-0">
                <div className="w-32 h-32 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 xl:w-[263px] xl:h-[263px] rounded-2xl sm:rounded-3xl overflow-hidden bg-gray-100">
                  <img 
                    src={`https://images.unsplash.com/photo-${currentSlide % 2 === 0 ? '1507003211169-0a1dd7228f2d' : '1633332755192-727a05c4013d'}?w=400&h=400&fit=crop`}
                    alt={currentTestimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Testimonial Content */}
              <div className="flex-1 w-full">
                <div className="flex items-start justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <img src='/testimonial/quotes.png' className='w-8 h-8 sm:w-10 sm:h-10 object-contain'/>
                  {/* <div className="text-6xl leading-none" style={{ color: '#8FB653' }}>"</div> */}
                  <div className="flex gap-1 mt-1 sm:mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className="w-4 h-4 sm:w-5 sm:h-5 fill-current" 
                        style={{ color: '#FFD700' }}
                      />
                    ))}
                  </div>
                </div>
                
                <p className="text-dark-green font-normal min-h-[80px] sm:min-h-[100px] lg:min-h-[110px] xl:min-h-[120px] leading-6 sm:leading-8 lg:leading-9 xl:leading-[40px] text-base sm:text-lg md:text-xl lg:text-[22px] xl:text-[24px] mb-4 sm:mb-6">
                  {currentTestimonial.text}
                </p>
                
                <div>
                  <p className="font-bold text-gray-900 text-base sm:text-lg">{currentTestimonial.name}</p>
                  <p className="text-gray-500 text-sm sm:text-base">{currentTestimonial.role}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Pagination Dots */}
          <div className="flex justify-center mt-6 sm:mt-8 md:mt-10 space-x-2 sm:space-x-3">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`transition-all duration-300 ${
                  index === currentSlide 
                    ? 'w-8 h-2 rounded-full' 
                    : 'w-2 h-2 rounded-full'
                }`}
                style={{ 
                  backgroundColor: index === currentSlide ? '#4A7C59' : '#D3D3D3'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}