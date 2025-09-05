import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { CheckCircle } from 'lucide-react';
import { UserLayout } from '@/components/layout/UserLayout';
import Link from 'next/link';

const BookingSuccessPage = () => {
  const router = useRouter();
  const { bookingId } = router.query;
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/bookings/${bookingId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBooking(data.data || data);
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserLayout requireRole="DOG_OWNER">
      <div className="min-h-screen mt-16 xl:mt-24 bg-[#FFFCF3] py-12">
        <div className="container mx-auto px-4 lg:px-20">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
              </div>

              {/* Success Message */}
              <h1 className="text-3xl font-bold text-center text-[#192215] mb-4">
                Booking Confirmed!
              </h1>
              <p className="text-center text-gray-600 mb-8">
                Your field booking has been successfully confirmed. You will receive a confirmation email shortly.
              </p>

              {/* Booking Details */}
              {booking && !loading && (
                <div className="bg-[#F8F1D7] rounded-lg p-6 mb-8">
                  <h2 className="text-xl font-semibold text-[#192215] mb-4">Booking Details</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking ID:</span>
                      <span className="font-medium text-[#192215]">#{booking.id?.slice(-8).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Field:</span>
                      <span className="font-medium text-[#192215]">{booking.field?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium text-[#192215]">
                        {new Date(booking.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium text-[#192215]">{booking.timeSlot || `${booking.startTime} - ${booking.endTime}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Number of Dogs:</span>
                      <span className="font-medium text-[#192215]">{booking.numberOfDogs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Paid:</span>
                      <span className="font-bold text-[#3A6B22] text-lg">${booking.totalPrice?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="bg-[#F8F1D7] rounded-lg p-6 mb-8">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/user/my-bookings" className="flex-1">
                  <button className="w-full bg-[#3A6B22] text-white font-semibold py-3 rounded-full hover:bg-[#2D5A1B] transition-colors">
                    View My Bookings
                  </button>
                </Link>
                <Link href="/fields" className="flex-1">
                  <button className="w-full bg-white border-2 border-[#3A6B22] text-[#3A6B22] font-semibold py-3 rounded-full hover:bg-gray-50 transition-colors">
                    Browse More Fields
                  </button>
                </Link>
              </div>

              {/* Important Information */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Important Information</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Please arrive 5-10 minutes before your scheduled time</li>
                  <li>• Bring waste bags and water for your dog(s)</li>
                  <li>• Ensure your dog(s) are up to date with vaccinations</li>
                  <li>• Follow all field rules and guidelines posted on-site</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};



export default BookingSuccessPage;