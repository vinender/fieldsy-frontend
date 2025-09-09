import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Calendar, 
  Dog,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check
} from 'lucide-react';
import { BookingDetailsModal } from '@/components/modal/BookingDetailModal';
import { CancelBookingModal } from '@/components/modal/CancelBookingModal';
import { RescheduleBookingModal } from '@/components/modal/RescheduleBookingModal';
import BookingFilter from '@/components/bookings/booking-filter';
import { UserLayout } from '@/components/layout/UserLayout';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useCancelBooking, useRescheduleBooking } from '@/hooks/useBookingApi';
import { formatAmenities } from '@/utils/formatters';
import { calculateDistance, formatDistance } from '@/utils/location';
import { toast } from 'sonner';


// MongoDB Document Structure for Bookings
interface Booking {
  _id: string;
  fieldId: string;
  userId: string;
  name: string;
  duration: string;
  price: number;
  currency: string;
  image: string;
  features: string;
  location: string;
  distance: string | null;
  time: string;
  date: string;
  rawDate?: string; // Raw ISO date for calculations
  startTime?: string; // Raw start time
  endTime?: string; // Raw end time
  dogs: number;
  recurring: string | null;
  status: 'upcoming' | 'completed' | 'cancelled' | 'refunded';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  createdAt: string;
  updatedAt: string;
  field?: any; // Full field data
  averageRating?: number; // Field's average rating
}


const BookingHistoryPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const cancelBookingMutation = useCancelBooking();
  const rescheduleBookingMutation = useRescheduleBooking();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [bookingToReschedule, setBookingToReschedule] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const [appliedFilters, setAppliedFilters] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  
  // Helper function to convert time string to minutes
  const timeToMinutes = (time: string): number => {
    // Handle different time formats
    if (time.includes(':')) {
      // Format like "14:00" or "2:00PM"
      let [hourStr, rest] = time.split(':');
      let hour = parseInt(hourStr);
      let minutes = 0;  
      
      if (rest) {
        // Extract minutes and check for AM/PM
        const match = rest.match(/(\d+)([AP]M)?/i);
        if (match) {
          minutes = parseInt(match[1]);
          if (match[2]) {
            const period = match[2].toUpperCase();
            if (period === 'PM' && hour !== 12) hour += 12;
            if (period === 'AM' && hour === 12) hour = 0;
          }
        }
      }
      
      return hour * 60 + minutes;
    } else {
      // Format like "8:00AM" or "12:00PM"
      const match = time.match(/(\d+):?(\d*)([AP]M)/i);
      if (match) {
        let hour = parseInt(match[1]);
        const minutes = parseInt(match[2] || '0');
        const period = match[3].toUpperCase();
        
        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
        
        return hour * 60 + minutes;
      }
    }
    
    return 0;
  };

  useEffect(() => {
    // Reset page when tab changes
    if (activeTab) {
      setPage(1);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchBookings();
  }, [activeTab, page, session, userLocation]);
  
  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied or unavailable');
          // User location not available, distance won't be shown
        }
      );
    }
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get token from session or localStorage
      let token = (session as any)?.accessToken;
      
      if (!token) {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          token = user.token;
        }
      }

      if (!token) {
        setError('Please login to view bookings');
        setLoading(false);
        return;
      }

      // Prepare query params - include CANCELLED in both tabs
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '10');
      if (activeTab === 'previous') {
        // Include both COMPLETED and CANCELLED bookings with past dates
        params.append('status', 'COMPLETED,CANCELLED');
        params.append('includeExpired', 'true');
      } else if (activeTab === 'upcoming') {
        // Include both CONFIRMED and CANCELLED bookings with future dates
        params.append('status', 'CONFIRMED,CANCELLED');
        params.append('includeFuture', 'true');
      } else {
        params.append('status', 'PENDING');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api'}/bookings/my-bookings?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const bookingData = data.data || [];
        
        // Transform backend data to match frontend interface
        const transformedBookings = bookingData.map((booking: any) => {
          // Calculate the actual price if totalPrice is missing or 0
          let calculatedPrice = booking.totalPrice || 0;
          
          if ((!calculatedPrice || calculatedPrice === 0) && booking.field?.pricePerHour) {
            // Calculate based on duration and number of dogs
            const startTime = booking.startTime;
            const endTime = booking.endTime;
            const startMinutes = timeToMinutes(startTime);
            const endMinutes = timeToMinutes(endTime);
            const durationHours = (endMinutes - startMinutes) / 60;
            const numberOfDogs = booking.numberOfDogs || 1;
            
            if (booking.field?.bookingDuration === '30min') {
              const duration30MinBlocks = durationHours * 2;
              calculatedPrice = booking.field.pricePerHour * duration30MinBlocks * numberOfDogs;
            } else {
              calculatedPrice = booking.field.pricePerHour * durationHours * numberOfDogs;
            }
          }
          
          // Calculate distance if user location and field location are available
          let distance = null;
          if (userLocation && booking.field) {
            const fieldLat = booking.field.latitude || booking.field.location?.lat;
            const fieldLng = booking.field.longitude || booking.field.location?.lng;
            
            if (fieldLat && fieldLng) {
              const distanceInMiles = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                fieldLat,
                fieldLng
              );
              distance = formatDistance(distanceInMiles);
            }
          }
          
          return {
            _id: booking.id,
            fieldId: booking.fieldId,
            userId: booking.userId,
            name: booking.field?.name || 'Field',
            duration: booking.field?.bookingDuration === '30min' ? '30min' : '1hr',
            price: calculatedPrice || booking.totalPrice || 0,
            currency: '$',
            image: booking.field?.images?.[0] || '/fields/field-placeholder.jpg',
            features: booking.field?.amenities ? formatAmenities(booking.field.amenities).join(' • ') : booking.field?.description || 'Field description',
            location: booking.field?.address ? `${booking.field.address}, ${booking.field.city}, ${booking.field.state}` : 'Location',
            distance: distance,
            time: booking.timeSlot || `${booking.startTime} – ${booking.endTime}`,
            date: new Date(booking.date).toLocaleDateString('en-GB', { 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric' 
            }),
            rawDate: booking.date, // Keep raw date for calculations
            startTime: booking.startTime, // Keep raw start time
            endTime: booking.endTime, // Keep raw end time
            dogs: booking.numberOfDogs || 1,
            recurring: booking.repeatBooking && booking.repeatBooking !== 'none' ? `Recurring ${booking.repeatBooking}` : null,
            status: booking.status.toLowerCase() === 'confirmed' ? 'upcoming' : booking.status.toLowerCase() as any,
            paymentStatus: booking.paymentStatus?.toLowerCase() || 'paid',
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt,
            // Include field data for modal
            field: booking.field,
            averageRating: booking.field?.averageRating || 0
          };
        });
        
        setBookings(transformedBookings);
        
        // Set pagination info
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || Math.ceil(data.pagination.total / data.pagination.limit));
          setTotalBookings(data.pagination.total || 0);
        }
      } else if (response.status === 401) {
        setError('Session expired. Please login again');
        router.push('/login');
      } else {
        setError('Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

 
  // Use actual bookings from API only
  const displayBookings = bookings;

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleCancelClick = (booking: Booking) => {
    setBookingToCancel(booking);
    setIsCancelModalOpen(true);
  };

  const handleRescheduleClick = (booking: Booking) => {
    setBookingToReschedule(booking);
    setIsRescheduleModalOpen(true);
  };

  const handleApplyFilter = (filters: any) => {
    setAppliedFilters(filters);
    // You can implement the actual filtering logic here
    // For now, just close the modal and log the filters
    console.log('Applied filters:', filters);
    setShowFilter(false);
    // Refetch bookings with filters
    fetchBookings();
  };


  const handleCancelBooking = async (bookingId: string, reason: string) => {
    cancelBookingMutation.mutate(
      { bookingId, reason },
      {
        onSuccess: (data) => {
          // Show success message with refund status
          const refundResult = data.data.refundResult;
          let message = 'Booking cancelled successfully.';
          
          if (refundResult && refundResult.success) {
            message = `Booking cancelled successfully. Refund of $${refundResult.refundAmount?.toFixed(2) || '0.00'} has been initiated and will be credited to your account within 5-7 business days.`;
          } else if (data.data.isRefundEligible) {
            message = 'Booking cancelled successfully. Your refund will be processed within 5-7 business days.'
          } else {
            message = 'Booking cancelled successfully. This booking was not eligible for a refund as it was cancelled less than 24 hours before the scheduled time.';
          }
          
          toast.success(message, {
            duration: 7000,
            position: 'top-center',
          });
          
          // Update the booking status locally immediately
          setBookings(prevBookings => 
            prevBookings.map(booking => 
              booking._id === bookingId 
                ? { ...booking, status: 'cancelled' as const }
                : booking
            )
          );
          
          setIsCancelModalOpen(false);
          setBookingToCancel(null);
          
          // Also refresh from server to ensure consistency
          setTimeout(() => {
            fetchBookings();
          }, 500);
        },
        onError: (error: any) => {
          const errorMessage = error.response?.data?.message || 'Failed to cancel booking';
          toast.error(errorMessage, {
            position: 'top-center',
          });
        }
      }
    );
  };

  const handleRescheduleBooking = async (bookingId: string, date: string, startTime: string, endTime: string) => {
    rescheduleBookingMutation.mutate(
      { bookingId, date, startTime, endTime },
      {
        onSuccess: () => {
          toast.success('Booking rescheduled successfully!', {
            position: 'top-center',
          });
          
          setIsRescheduleModalOpen(false);
          setBookingToReschedule(null);
          
          // Refresh bookings to show updated data
          setTimeout(() => {
            fetchBookings();
          }, 500);
        },
        onError: (error: any) => {
          const errorMessage = error.response?.data?.message || 'Failed to reschedule booking';
          toast.error(errorMessage, {
            position: 'top-center',
          });
        }
      }
    );
  };


  const BookingCard = ({ booking }: { booking: Booking }) => {
    // Calculate if booking can be cancelled (24 hours before booking time)
    const canCancel = () => {
      if (booking.status !== 'upcoming') return false;
      
      const now = new Date();
      const bookingDateTime = new Date(booking.rawDate || booking.date);
      
      // Parse the start time and add it to the booking date
      if (booking.startTime) {
        const [time, period] = booking.startTime.split(/(?=[AP]M)/);
        const [hours, minutes] = time.split(':').map(Number);
        let hour = hours;
        
        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
        
        bookingDateTime.setHours(hour, minutes || 0, 0, 0);
      }
      
      // Calculate hours until booking
      const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      return hoursUntilBooking >= 24;
    };
    
    const isCancellable = canCancel();
    const getTimeUntilBooking = () => {
      const now = new Date();
      const bookingDateTime = new Date(booking.rawDate || booking.date);
      
      if (booking.startTime) {
        const [time, period] = booking.startTime.split(/(?=[AP]M)/);
        const [hours, minutes] = time.split(':').map(Number);
        let hour = hours;
        
        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
        
        bookingDateTime.setHours(hour, minutes || 0, 0, 0);
      }
      
      const hoursUntilBooking = Math.floor((bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60));
      return hoursUntilBooking;
    };

    console.log('booking',booking);
    
    return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-start sm:items-center bg-light py-4 sm:py-6 border-b border-gray-200 last:border-0">
      {/* Image */}
      <img 
        src={booking.image} 
        alt={booking.name}
        className="w-full sm:w-[174px] h-[200px] sm:h-[140px] rounded-[20px] object-cover flex-shrink-0"
      />
      
      {/* Content */}
      <div className="flex-1 border-b pb-10 w-full">
        {/* Title and Price */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2.5">
          <h3 className="text-[18px] sm:text-[20px] font-semibold text-[#192215]">{booking.name}</h3>
          <div className="flex items-center gap-2">
            <span className="text-[14px] sm:text-[16px] font-semibold text-[#192215]">• {booking.duration}</span>
            <span className="text-[14px] sm:text-[16px] font-semibold text-[#3a6b22]">• {booking.currency}{booking.price}</span>
          </div>
        </div>

        {/* Features - Hidden on mobile, shown on larger screens */}
        <p className="hidden sm:block text-[16px] font-medium text-[#192215] mb-4 line-clamp-2">{booking.features}</p>

        {/* Details */}
        <div className="flex flex-wrap gap-3 sm:gap-6 text-[12px] sm:text-[14px] text-[#8d8d8d] mb-3">
          <div className="flex items-center gap-1">
            <MapPin className="w-[16px] sm:w-[18px] fill-black text-black h-[16px] sm:h-[18px]" />
            <span className="line-clamp-1">
              {booking.location}
              {booking.distance && ` • ${booking.distance}`}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <img src="/bookings/clock.svg" className="w-[16px] sm:w-[18px] fill text-black h-[16px] sm:h-[18px]" />
            <span>{booking.time}</span>
          </div>
          <div className="flex items-center gap-1">
            <img src="/bookings/availability.svg" className="w-[16px] sm:w-[18px] h-[16px] sm:h-[18px]" />
            <span>{booking.date}</span>
          </div>
          <div className="flex items-center gap-1">
            <img src="/bookings/pet.svg" className="w-[16px] sm:w-[18px] h-[16px] sm:h-[18px]" />
            <span>{booking.dogs} Dog{booking.dogs > 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Recurring Badge */}
        {booking.recurring && (
          <div className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-1.5 bg-[#f4ffef] border border-[#3a6b221a] rounded-full">
            <span className="text-[11px] sm:text-[13px] font-bold text-[#3a6b22]">{booking.recurring}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 w-full sm:w-[180px] flex-shrink-0">
        {booking.status === 'upcoming' ? (
          <>
            <div className="flex flex-row gap-2">
              <button 
                onClick={() => isCancellable ? handleRescheduleClick(booking) : null}
                disabled={!isCancellable}
                className={`flex-1 py-2 px-2 border rounded-full text-[11px] sm:text-[13px] font-bold transition-colors ${
                  isCancellable
                    ? 'bg-[#e8f5ff] border-[#0066cc] text-[#0066cc] hover:bg-[#d4ecff] cursor-pointer'
                    : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                }`}
                title={!isCancellable ? `Cannot reschedule within 24 hours of booking (${getTimeUntilBooking()} hours remaining)` : 'Reschedule booking'}>
                Reschedule
              </button>
              <button 
                onClick={() => isCancellable ? handleCancelClick(booking) : null}
                disabled={!isCancellable}
                className={`flex-1 py-2 px-2 border-2 rounded-full text-[11px] sm:text-[13px] font-bold transition-colors ${
                  isCancellable
                    ? 'bg-white border-red-500 text-red-500 hover:bg-red-50 cursor-pointer'
                    : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                }`}
                title={!isCancellable ? `Cannot cancel within 24 hours of booking (${getTimeUntilBooking()} hours remaining)` : 'Cancel booking'}>
                Cancel
              </button>
            </div>
            <button 
              onClick={() => handleViewDetails(booking)}
              className="w-full py-2 px-2.5 bg-[#3a6b22] rounded-full text-[12px] sm:text-[14px] font-bold text-white hover:bg-[#2d5319] transition-colors">
             View Details
            </button>
          </>
        ) : booking.status === 'cancelled' ? (
          <>
            <div className="flex-1 sm:w-full py-2 px-2.5 bg-white border  border-red-600 rounded-full text-[12px] sm:text-[14px] font-bold outline-red text-red flex items-center justify-center cursor-not-allowed">
              Cancelled
            </div>
            <button 
              onClick={() => handleViewDetails(booking)}
              className="flex-1 sm:w-full py-2 px-2.5 bg-[#3a6b22] rounded-full text-[12px] sm:text-[14px] font-bold text-white hover:bg-[#2d5319] transition-colors">
              View Details
            </button>
          </>
        ) : (
          <>
            <div className={`flex-1 sm:w-full py-2 px-2.5 rounded-full text-[12px] sm:text-[14px] font-bold flex items-center justify-center ${
              booking.status === 'completed' 
                ? 'bg-white border border-green text-green' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              <Check className="w-[18px] h-[18px] mr-2 bg-green text-white rounded-sm p-0.5" />
              {booking.status === 'completed' ? 'Completed' : 
               booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </div>
            <button 
              onClick={() => handleViewDetails(booking)}
              className="flex-1 sm:w-full py-2 px-2.5 bg-[#3a6b22] rounded-full text-[12px] sm:text-[14px] font-bold text-white hover:bg-[#2d5319] transition-colors">
              View Details
            </button>
          </>
        )}
      </div>
    </div>
    );
  };

  return (
    <UserLayout>
      <div className="min-h-screen bg-light xl:mt-24 mt-16">
        <div className="max-w-full mx-auto px-4 sm:px-8 lg:px-20 py-6 sm:py-10">
        {/* Page Title with Back Button */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <button className="w-10 h-10 sm:w-12 sm:h-12 bg-[#f8f1d7] rounded-full flex items-center justify-center hover:bg-[#efe5bf] transition-colors">
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-[#192215]" />
          </button>
          <h1 className="text-[24px] sm:text-[29px] font-semibold text-[#192215]">Booking History</h1>
        </div>

        {/* Tabs and Filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          {/* Tab Switcher */}
          <div className="inline-flex p-1 sm:p-1.5 bg-[#f8f1d7] rounded-full border border-black/3 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-[12px] sm:text-[14px] font-bold transition-all whitespace-nowrap ${
                activeTab === 'upcoming' 
                  ? 'bg-[#8fb366] text-white' 
                  : 'bg-transparent text-[#192215] hover:bg-white/50'
              }`}
            >
              Upcoming Bookings
            </button>
            <button
              onClick={() => setActiveTab('previous')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-[12px] sm:text-[14px] font-bold transition-all whitespace-nowrap ${
                activeTab === 'previous' 
                  ? 'bg-[#8fb366] text-white' 
                  : 'bg-transparent text-[#192215] hover:bg-white/50'
              }`}
            >
              Previous Bookings
            </button>
          </div>

          {/* Filter Button */}
          <button 
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-white border border-black/6 rounded-full hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-5 h-5 sm:w-6 sm:h-6 text-[#192215]" />
            <span className="text-[12px] sm:text-[14px] font-medium text-[#192215]">Filter</span>
            <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 text-[#192215] transition-transform ${showFilter ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Bookings List */}
        <div className="bg-light rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <p className="text-gray-600">Loading bookings...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-500 font-medium mb-2">{error}</p>
              <button 
                onClick={fetchBookings}
                className="text-[#3A6B22] font-medium hover:underline"
              >
                Try Again
              </button>
            </div>
          ) : displayBookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#0B0B0B] mb-2">
                No {activeTab} bookings
              </h3>
              <p className="text-gray-600 mb-4">
                {activeTab === 'upcoming' 
                  ? "You don't have any upcoming bookings."
                  : "You don't have any previous bookings."}
              </p>
              <button 
                onClick={() => router.push('/fields')}
                className="bg-[#3A6B22] text-white px-6 py-2 rounded-full font-medium hover:bg-[#2e5519] transition"
              >
                Find Fields
              </button>
            </div>
          ) : (
            displayBookings.map((booking) => (
              <BookingCard key={booking._id} booking={booking} />
            ))
          )}
        </div>  

        {/* Pagination */}
        {!loading && !error && displayBookings.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[12px] sm:text-[14px] font-semibold italic text-[#192215] text-center sm:text-left">
              Showing {(page - 1) * 10 + 1}-{Math.min(page * 10, totalBookings)} of {totalBookings}
            </p>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/50 transition-colors disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5 text-[#192215]" />
              </button>
              
              {[...Array(Math.min(5, totalPages))].map((_, index) => {
                const pageNum = index + 1;
                return (
                  <button 
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors ${
                      pageNum === page 
                        ? 'bg-[#3a6b22] text-white' 
                        : 'hover:bg-white/50 text-[#192215]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              {totalPages > 5 && (
                <>
                  <span className="text-[#192215]">...</span>
                  <button 
                    onClick={() => setPage(totalPages)}
                    className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/50 text-[#192215] text-sm font-medium transition-colors"
                  >
                    {totalPages}
                  </button>
                </>
              )}
              
              <button 
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/50 transition-colors disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5 text-[#192215]" />
              </button>
              
            </div>
          </div>
        )}
      </div>
      
      {/* Booking Details Modal */}
      <BookingDetailsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBooking(null);
        }}
        booking={selectedBooking}
        onCancel={handleCancelClick}
        onReschedule={handleRescheduleClick}
      />
      
      {/* Cancel Booking Modal */}
      {bookingToCancel && (
        <CancelBookingModal
          isOpen={isCancelModalOpen}
          onClose={() => {
            setIsCancelModalOpen(false);
            setBookingToCancel(null);
          }}
          booking={bookingToCancel}
          onConfirm={handleCancelBooking}
        />
      )}

      {/* Reschedule Booking Modal */}
      {bookingToReschedule && (
        <RescheduleBookingModal
          isOpen={isRescheduleModalOpen}
          onClose={() => {
            setIsRescheduleModalOpen(false);
            setBookingToReschedule(null);
          }}
          booking={bookingToReschedule}
          onConfirm={handleRescheduleBooking}
        />
      )}

      {/* Booking Filter Modal */}
      <BookingFilter
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        onApplyFilter={handleApplyFilter}
      />
    </div>
    </UserLayout>
  );
};

export default BookingHistoryPage;