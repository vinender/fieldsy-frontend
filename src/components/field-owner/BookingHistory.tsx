import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useFieldOwnerBookings, useRecentBookings, type Booking } from '@/hooks/queries/useFieldOwnerBookings';
import { BookingHistorySkeleton } from '@/components/skeletons/BookingHistorySkeleton';
import FieldOwnerBookingDetailsModal from '@/components/modal/FieldOwnerBookingDetailsModal';
import EarningsDashboard from './EarningsDashboard';
import { Check } from 'lucide-react';
import { useCancelledBookings } from '@/hooks/queries/useBookingQueries';

// Types are imported from useFieldOwnerBookings hook

export default function BookingHistory() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<'bookings' | 'earnings'>('bookings');
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'completed' | 'cancelled'>('today');
  const [currentPage, setCurrentPage] = useState(1);
  const [cancelledPage, setCancelledPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use React Query hook for regular bookings
  const {
    data,
    isLoading,
    error,
    isError,
    refetch
  } = useFieldOwnerBookings(activeTab === 'cancelled' ? 'today' : activeTab, currentPage, {
    enabled: activeTab !== 'cancelled'
  });

  // Fetch recent bookings for overview
  const {
    data: recentData,
    isLoading: recentLoading
  } = useRecentBookings();

  // Fetch cancelled bookings using React Query
  const {
    data: cancelledBookingsData,
    pagination: cancelledPagination,
    isLoading: cancelledLoading,
    refetch: refetchCancelled
  } = useCancelledBookings(
    { page: cancelledPage, limit: 16 }, // 16 items for 4x4 grid
    { enabled: activeTab === 'cancelled' }
  );

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
    setCancelledPage(1);
  }, [activeTab]);

  // Refetch data every 30 seconds for today's bookings
  useEffect(() => {
    if (activeTab === 'today') {
      const interval = setInterval(() => {
        refetch();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [activeTab, refetch]);

  // Extract data from React Query response
  const bookings = data?.bookings || [];
  const stats = data?.stats || {
    todayBookings: 0,
    totalBookings: 0,
    totalEarnings: 0
  };
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages || 1;

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleSendMessage = (bookingId: string) => {
    // Find the booking to get user details
    const booking = bookings.find(b => b.id === bookingId);
    
    if (booking) {
      // Navigate to messages page with the user ID to open conversation
      router.push(`/user/messages?userId=${booking.userId}`);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="min-h-screen max-w-[1920px] mt-20 mx-auto bg-light pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-10 sm:pb-16 md:pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-20">

        {/* View Toggle */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-dark-green">Field Owner Dashboard</h1>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveView('bookings')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeView === 'bookings'
                  ? 'bg-white text-green shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Bookings
            </button>
            <button
              onClick={() => setActiveView('earnings')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeView === 'earnings'
                  ? 'bg-white text-green shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Earnings & Payouts
            </button>
          </div>
        </div>

        {activeView === 'earnings' ? (
          <EarningsDashboard />
        ) : (
          <>
        {/* Quick Stats Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-dark-green mb-4 sm:mb-6 font-sans">Quick Stats</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {/* Today Bookings Card */}
            <div className="bg-light-green rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 text-white">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-sm sm:text-base mb-1 sm:mb-2 border-b border-b-dotted font-sans">Today Bookings</p>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold font-sans">{stats.todayBookings}</p>
                </div>
                
              </div>
            </div>

            {/* Total Bookings Card */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm sm:text-base text-dark-green/70 mb-1 sm:mb-2 font-sans">Total Bookings</p>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-dark-green font-sans">
                    {stats.totalBookings.toLocaleString()}
                  </p>
                </div>
               
              </div>
            </div>

            {/* Total Earnings Card */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm sm:text-base text-dark-green/70 mb-1 sm:mb-2 font-sans">Total Earnings</p>
                  <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-dark-green font-sans">
                    {formatCurrency(stats.totalEarnings)}
                  </p>
                </div>
               
              </div>
            </div>
          </div>
        </div>
 

        {/* Bookings Tabs */}
        <div className="mb-4 sm:mb-6">
          
          <div className="flex flex-wrap bg-cream w-fit rounded-[50px] gap-2 sm:gap-3 px-2 sm:px-3 py-2">
            <button
              onClick={() => setActiveTab('today')}
              className={`px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm md:text-base font-medium transition-all font-sans ${
                activeTab === 'today'
                  ? 'bg-light-green text-white'
                  : 'bg-cream text-dark-green hover:bg-cream/80'
              }`}
            >
              <span className="hidden sm:inline">Today Bookings</span>
              <span className="sm:hidden">Today</span>
            </button>

            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm md:text-base font-medium transition-all font-sans ${
                activeTab === 'upcoming'
                  ? 'bg-light-green text-white'
                  : 'bg-cream text-dark-green hover:bg-cream/80'
              }`}
            >
              <span className="hidden sm:inline">Upcoming Bookings</span>
              <span className="sm:hidden">Upcoming</span>
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm md:text-base font-medium transition-all font-sans ${
                activeTab === 'completed'
                  ? 'bg-light-green text-white'
                  : 'bg-cream text-dark-green hover:bg-cream/80'
              }`}
            >
              <span className="hidden sm:inline">Completed Bookings</span>
              <span className="sm:hidden">Completed</span>
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm md:text-base font-medium transition-all font-sans ${
                activeTab === 'cancelled'
                  ? 'bg-light-green text-white'
                  : 'bg-cream text-dark-green hover:bg-cream/80'
              }`}
            >
              <span className="hidden sm:inline">Cancelled Bookings</span>
              <span className="sm:hidden">Cancelled</span>
            </button>
          </div>
        </div>


        {/* Bookings Grid - Max 4 cards per row */}
        <div>
          {(activeTab === 'cancelled' ? cancelledLoading : isLoading) ? (
            // Skeleton loader for bookings grid
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-white shadow-md rounded-xl sm:rounded-2xl p-4 sm:p-5 animate-pulse">
                  {/* User Avatar and Name Skeleton */}
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 border-b border-b-gray-200 pb-3 sm:pb-4">
                    <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-gray-200"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  
                  {/* Booking Details Skeleton */}
                  <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                    <div className="flex justify-between items-center">
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                  
                  {/* Action Buttons Skeleton */}
                  <div className="flex gap-2">
                    <div className="flex-1 py-2 px-3 rounded-full bg-gray-200 h-8"></div>
                    <div className="flex-1 py-2 px-3 rounded-full bg-gray-200 h-8"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (activeTab === 'cancelled' ? false : isError) ? (
            <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8">
              <div className="text-center">
                <div className="w-12 sm:w-16 h-12 sm:h-16 bg-red/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <svg className="w-6 sm:w-8 h-6 sm:h-8 text-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm sm:text-base text-red-500font-medium mb-2">
                  {error?.message || 'Failed to fetch bookings'}
                </p>
                <button 
                  onClick={() => refetch()}
                  className="text-sm sm:text-base text-green font-medium hover:underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (activeTab === 'cancelled' ? (!cancelledBookingsData || cancelledBookingsData.length === 0) : bookings.length === 0) ? (
            <div className="bg-white rounded-xl sm:rounded-2xl p-8 sm:p-10 md:p-12">
              <div className="text-center">
                <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <svg className="w-8 sm:w-10 h-8 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-dark-green mb-2 font-sans">
                  No {activeTab} bookings
                </h3>
                <p className="text-sm sm:text-base text-dark-green/70 font-sans mb-3 sm:mb-4">
                  {activeTab === 'today'
                    ? "You don't have any bookings scheduled for today."
                    : activeTab === 'upcoming'
                    ? "You don't have any upcoming bookings."
                    : activeTab === 'cancelled'
                    ? "You don't have any cancelled bookings."
                    : "You don't have any completed bookings."}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 font-sans">
                  Bookings will appear here once customers start booking your field.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {(activeTab === 'cancelled' ? cancelledBookingsData || [] : bookings).map((booking: any) => {
                // Cancelled bookings are already formatted by the backend
                const displayBooking = booking;

                return (
                <div key={displayBooking.id} className="bg-white shadow-md rounded-xl sm:rounded-2xl p-4 sm:p-5 hover:shadow-lg transition-shadow">
                  {/* User Avatar and Name */}
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 border-b border-b-gray-200 pb-3 sm:pb-4">
                    <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {displayBooking.userAvatar ? (
                        <img
                          src={displayBooking.userAvatar}
                          alt={displayBooking.userName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs sm:text-sm font-semibold text-gray-600">
                          {displayBooking.userName.charAt(0)}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-semibold text-dark-green font-sans truncate">
                        {displayBooking.userName}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-dark-green/70 font-sans">
                        {new Date(displayBooking.date).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })} • {displayBooking.time}
                      </p>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-dark-green/70 font-sans">Order ID</span>
                      <p className="text-xs font-medium text-dark-green font-sans">{displayBooking.orderId}</p>
                    </div>
                    {displayBooking.frequency && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-dark-green/70 font-sans">Recurring</span>
                        <p className="text-xs font-medium text-dark-green font-sans">{displayBooking.frequency}</p>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-dark-green/70 font-sans">Dogs</span>
                      <p className="text-xs font-medium text-dark-green font-sans">{displayBooking.dogs}</p>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span className="text-xs text-dark-green/70 font-sans">Amount</span>
                      <p className="text-sm font-bold text-green font-sans">
                        {formatCurrency(displayBooking.amount)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Action Buttons or Status */}
                  <div className="flex gap-2">
                    {activeTab === 'completed' || activeTab === 'cancelled' ? (
                      <>
                        <div className={`flex-1 py-2 px-3 border rounded-full text-xs font-medium font-sans flex items-center justify-center gap-1.5 ${
                          displayBooking.status === 'completed' ? 'bg-green/10 text-green' :
                          displayBooking.status === 'cancelled' ? 'border-red-600 bg-red-100/10 text-red-600' :
                          displayBooking.status === 'refunded' ? 'bg-orange/10 text-orange' :
                          displayBooking.status === 'confirmed' ? 'bg-white text-green border-green' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {displayBooking.status === 'completed' && (
                            <div className="w-4 h-4 rounded-full bg-green flex items-center justify-center flex-shrink-0">
                              <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                            </div>
                          )}
                          <span className={displayBooking.status === 'completed' ? 'font-bold' : ''}>
                            {displayBooking.status.charAt(0).toUpperCase() + displayBooking.status.slice(1)}
                          </span>
                        </div>
                        <button
                          onClick={() => handleViewDetails(displayBooking as Booking)}
                          className="flex-1 py-2 px-3 rounded-full bg-green text-xs text-white font-medium hover:bg-green/90 transition-colors font-sans"
                        >
                          View Details
                        </button>
                      </>
                    ) : (
                      // Today and Upcoming bookings - show both View Details and Send Message
                      <>
                        <button
                          onClick={() => handleViewDetails(displayBooking as Booking)}
                          className="flex-1 py-2 px-3 rounded-full bg-white text-green border border-green text-xs font-medium hover:bg-green/10 transition-colors font-sans"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleSendMessage(displayBooking.id)}
                          className="flex-1 py-2 px-3 rounded-full bg-green text-xs text-white font-medium hover:bg-green/90 transition-colors font-sans"
                        >
                          Send Message
                        </button>
                      </>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {activeTab === 'cancelled' ? (
          // Cancelled bookings pagination
          !cancelledLoading && cancelledBookingsData && cancelledBookingsData.length > 0 && cancelledPagination && cancelledPagination.totalPages > 1 && (
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-2">
              <button
                onClick={() => setCancelledPage(Math.max(1, cancelledPage - 1))}
                disabled={cancelledPage === 1}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base text-dark-green font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cream rounded-full transition-all font-sans"
              >
                Previous
              </button>

              <div className="flex gap-1">
                {[...Array(Math.min(5, cancelledPagination.totalPages))].map((_, index) => {
                  let pageNum;
                  if (cancelledPagination.totalPages <= 5) {
                    pageNum = index + 1;
                  } else if (cancelledPage <= 3) {
                    pageNum = index + 1;
                  } else if (cancelledPage >= cancelledPagination.totalPages - 2) {
                    pageNum = cancelledPagination.totalPages - 4 + index;
                  } else {
                    pageNum = cancelledPage - 2 + index;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCancelledPage(pageNum)}
                      className={`w-8 sm:w-10 h-8 sm:h-10 rounded-full text-xs sm:text-sm md:text-base font-medium transition-all font-sans ${
                        cancelledPage === pageNum
                          ? 'bg-green text-white'
                          : 'bg-white text-dark-green hover:bg-cream'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCancelledPage(Math.min(cancelledPagination.totalPages, cancelledPage + 1))}
                disabled={cancelledPage === cancelledPagination.totalPages}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base text-dark-green font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cream rounded-full transition-all font-sans"
              >
                Next
              </button>
            </div>
          )
        ) : (
          !isLoading && !isError && bookings.length > 0 && totalPages > 1 && (
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-2">
            <button 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base text-dark-green font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cream rounded-full transition-all font-sans"
            >
              Previous
            </button>
            
            <div className="flex gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, index) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = index + 1;
                } else if (currentPage <= 3) {
                  pageNum = index + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + index;
                } else {
                  pageNum = currentPage - 2 + index;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 sm:w-10 h-8 sm:h-10 rounded-full text-xs sm:text-sm md:text-base font-medium transition-all font-sans ${
                      currentPage === pageNum
                        ? 'bg-green text-white'
                        : 'bg-white text-dark-green hover:bg-cream'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button 
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base text-dark-green font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cream rounded-full transition-all font-sans"
            >
              Next
            </button>
          </div>
          )
        )}
        
        {/* Booking Details Modal */}
        <FieldOwnerBookingDetailsModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedBooking(null);
          }}
          booking={selectedBooking}
        />
          </>
        )}
      </div>
    </div>
  );
}