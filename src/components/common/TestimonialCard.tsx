import React, { useState } from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Testimonial {
  id: number | string;
  name: string;
  role: string;
  text: string;
  rating: number;
  avatar?: string;
  image?: string;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  showExpandButton?: boolean;
  className?: string;
}

export function TestimonialCard({
  testimonial,
  isExpanded = false,
  onToggleExpand,
  showExpandButton = true,
  className
}: TestimonialCardProps) {
  return (
    <div className={cn("bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16 shadow-lg", className)}>
      <div className="flex flex-col lg:flex-row items-start gap-6 sm:gap-8 lg:gap-10 xl:gap-12">
        {/* Profile Picture */}
        <div className="flex-shrink-0 mx-auto lg:mx-0">
          <div className="w-32 h-32 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 xl:w-[263px] xl:h-[263px] rounded-2xl sm:rounded-3xl overflow-hidden bg-gray-100 relative">
            {testimonial.image ? (
              <Image
                src={testimonial.image}
                alt={testimonial.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">
                {testimonial.avatar || '👤'}
              </div>
            )}
          </div>
        </div>

        {/* Testimonial Content */}
        <div className="flex-1 w-full">
          <div className="flex items-start justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
            <Image
              src="/testimonial/quotes.png"
              alt="Quotes"
              width={40}
              height={40}
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
            />
            <div className="flex gap-1 mt-1 sm:mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "w-4 h-4 sm:w-5 sm:h-5",
                    star <= testimonial.rating
                      ? "fill-current text-yellow"
                      : "fill-current text-gray-300"
                  )}
                />
              ))}
            </div>
          </div>

          <div className="mb-4 sm:mb-6">
            <p
              className={cn(
                "text-dark-green font-normal text-base sm:text-lg md:text-xl lg:text-[22px] xl:text-[24px] transition-all",
                "leading-7 sm:leading-8 lg:leading-9 xl:leading-[44px]",
                isExpanded
                  ? ""
                  : "line-clamp-3 sm:line-clamp-3 lg:line-clamp-2"
              )}
            >
              {testimonial.text}
            </p>

            {showExpandButton && testimonial.text.length > 150 && (
              <button
                onClick={onToggleExpand}
                className="text-green hover:text-dark-green font-medium text-sm sm:text-base mt-2 transition-colors"
              >
                {isExpanded ? 'Read less' : 'Read more'}
              </button>
            )}
          </div>

          <div>
            <p className="font-bold text-gray-900 text-base sm:text-lg">{testimonial.name}</p>
            <p className="text-gray-500 text-sm sm:text-base">{testimonial.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  initialSlide?: number;
}

export function TestimonialCarousel({ testimonials, initialSlide = 0 }: TestimonialCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(initialSlide);
  const [expandedSlides, setExpandedSlides] = useState<number[]>([]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const toggleExpand = (index: number) => {
    setExpandedSlides((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const currentTestimonial = testimonials[currentSlide];

  return (
    <div className="relative w-full mx-auto px-14 sm:px-16 md:px-20 lg:px-24">
      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 z-10 bg-light-green"
        aria-label="Previous testimonial"
      >
        <Image
          src="/testimonial/left.png"
          alt="Previous"
          width={48}
          height={48}
          className="w-full h-full object-contain"
        />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 z-10 bg-light-green"
        aria-label="Next testimonial"
      >
        <Image
          src="/testimonial/right.png"
          alt="Next"
          width={48}
          height={48}
          className="w-full h-full object-contain"
        />
      </button>

      {/* Main Testimonial Card */}
      <TestimonialCard
        testimonial={currentTestimonial}
        isExpanded={expandedSlides.includes(currentSlide)}
        onToggleExpand={() => toggleExpand(currentSlide)}
        className="mx-auto max-w-5xl"
      />

      {/* Pagination Dots */}
      <div className="flex justify-center mt-6 sm:mt-8 md:mt-10 space-x-2 sm:space-x-3">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={cn(
              'transition-all duration-300 rounded-full',
              index === currentSlide ? 'w-8 h-2 bg-green' : 'w-2 h-2 bg-gray-300'
            )}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
