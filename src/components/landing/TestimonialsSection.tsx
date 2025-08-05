import { useState } from "react"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"

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
    <section className="py-20 px-6 md:px-20" style={{ backgroundColor: '#FAF7F2' }}>
      <div className="mx-auto w-full px-[118px] py-[120px]">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-[48px] leading-[56px] font-[700] text-dark-green">
            What Dog Lovers Are Saying
          </h2>
        </div>
        
        {/* Testimonial Card */}
        <div className="relative w-full mx-auto px-16">
          {/* Navigation Arrows */}
          <button 
            onClick={prevSlide}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
            style={{ backgroundColor: '#8FB653' }}
          >
           <img src='/testimonial/left.png' className="w-full h-full object-contain"/>
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
            style={{ backgroundColor: '#8FB653' }}
          >
            {/* <ChevronRight className="w-6 h-6 text-white" /> */}
            <img src='/testimonial/right.png' className="w-full h-full object-contain"/>
          </button>
          
          {/* Main Testimonial Card */}
          <div className="bg-white rounded-3xl p-10 shadow-lg">
            <div className="flex flex-col md:flex-row items-start gap-8">
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                <div className="w-[263px] h-[263px] rounded-3xl overflow-hidden bg-gray-100">
                  <img 
                    src={`https://images.unsplash.com/photo-${currentSlide % 2 === 0 ? '1507003211169-0a1dd7228f2d' : '1633332755192-727a05c4013d'}?w=400&h=400&fit=crop`}
                    alt={currentTestimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Testimonial Content */}
              <div className="flex-1   w-full">
                <div className="flex items-start justify-between gap-6 mb-6">
                  <img src='/testimonial/quotes.png' className='w-10 h-10 object-contain'/>
                  {/* <div className="text-6xl leading-none" style={{ color: '#8FB653' }}>"</div> */}
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className="w-5 h-5 fill-current" 
                        style={{ color: '#FFD700' }}
                      />
                    ))}
                  </div>
                </div>
                
                <p className="text-dark-green font-[400] xl:h-[120px] leading-[40px] text-[24px] mb-6">
                  {currentTestimonial.text}
                </p>
                
                <div>
                  <p className="font-bold text-gray-900 text-lg">{currentTestimonial.name}</p>
                  <p className="text-gray-500">{currentTestimonial.role}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Pagination Dots */}
          <div className="flex justify-center mt-10 space-x-3">
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