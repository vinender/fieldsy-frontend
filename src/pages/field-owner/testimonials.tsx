import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { UserLayout } from '@/components/layout/UserLayout';
import { useAuth } from '@/contexts/AuthContext';
import { TestimonialCarousel, Testimonial } from '@/components/common/TestimonialCard';

export default function TestimonialsPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not a field owner
    if (user && user.role !== 'FIELD_OWNER') {
      router.push('/');
    }
  }, [user, router]);

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Dog Owner",
      text: "Perfect for my reactive rescue! The secure fields give us the freedom we never had before. Worth every penny.",
      rating: 5,
      avatar: "👩‍🦰",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
    },
    {
      id: 2,
      name: "John Smith",
      role: "Daily Customer",
      text: "Fieldsy has been a game-changer for our daily walks. Finding secure, private fields nearby means our anxious lab can finally enjoy off-lead time without stress. Booking is simple and the app works flawlessly!",
      rating: 5,
      avatar: "👨‍💼",
      image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop"
    },
    {
      id: 3,
      name: "Emma Wilson",
      role: "Field Owner",
      text: "Started listing my unused paddock last month and already earning steady income. Love helping local dog owners!",
      rating: 5,
      avatar: "👩",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"
    },
    {
      id: 4,
      name: "Mike Chen",
      role: "Weekend User",
      text: "Great app! My energetic border collie finally has space to run freely. The booking process is super easy.",
      rating: 5,
      avatar: "👨",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop"
    },
    {
      id: 5,
      name: "Lucy Anderson",
      role: "Professional Dog Trainer",
      text: "As a professional dog trainer, I need reliable, secure spaces for my sessions. Fieldsy provides exactly that. The variety of field sizes and terrains means I can find the perfect match for each training scenario. The owners are responsive and the facilities are always well-maintained.",
      rating: 5,
      avatar: "👩‍💼",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop"
    },
    {
      id: 6,
      name: "David Thompson",
      role: "Field Owner & Farmer",
      text: "I have 3 fields listed on Fieldsy and it's been brilliant for generating extra income from land that would otherwise sit unused. The platform handles everything smoothly, from bookings to payments. Great support team too!",
      rating: 5,
      avatar: "👨‍🌾",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop"
    }
  ];

  if (user && user.role !== 'FIELD_OWNER') {
    return null;
  }

  return (
    <UserLayout>
      <div className="min-h-screen bg-light py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 mt-20 sm:mt-24 lg:mt-28">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          {/* Page Header */}
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[48px] xl:text-[56px] leading-tight font-bold text-dark-green mb-4">
              What Our Community Says
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Real stories from dog owners and field owners who are part of the Fieldsy community
            </p>
          </div>

          {/* Testimonial Carousel */}
          <TestimonialCarousel testimonials={testimonials} initialSlide={1} />

          {/* Additional Info Section */}
          <div className="mt-12 sm:mt-16 md:mt-20 bg-white rounded-2xl p-6 sm:p-8 md:p-10 shadow-md">
            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-green mb-2">500+</div>
                <p className="text-gray-600">Happy Dog Owners</p>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-green mb-2">150+</div>
                <p className="text-gray-600">Secure Fields</p>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-green mb-2">4.9★</div>
                <p className="text-gray-600">Average Rating</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-12 sm:mt-16 text-center">
            <h3 className="text-2xl sm:text-3xl font-bold text-dark-green mb-4">
              Want to share your experience?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              We love hearing from our community! Your feedback helps us improve and inspires others to join Fieldsy.
            </p>
            <button
              onClick={() => router.push('/field-owner/my-listing')}
              className="px-8 py-3 bg-green text-white rounded-full font-semibold hover:opacity-90 transition-opacity"
            >
              View Your Listing
            </button>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}

// Force SSR for this authenticated page - prevents _next/data routing issues
export async function getServerSideProps() {
  return {
    props: {},
  };
}
