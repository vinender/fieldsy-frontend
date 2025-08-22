import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useFieldOwnerBookings, type Booking } from '@/hooks/queries/useFieldOwnerBookings';
import { BookingHistorySkeleton } from '@/components/skeletons/BookingHistorySkeleton';
import FieldOwnerBookingDetailsModal from '@/components/modal/FieldOwnerBookingDetailsModal';

// Types are imported from useFieldOwnerBookings hook

export default function BookingHistory() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'previous'>('today');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use React Query hook
  const { 
    data, 
    isLoading, 
    error, 
    isError,
    refetch 
  } = useFieldOwnerBookings(activeTab, currentPage);

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
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
    // Open message modal or navigate to messages
    console.log('Send message for booking:', bookingId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="min-h-screen max-w-[1920px] mt-20 mx-auto bg-light pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-10 sm:pb-16 md:pb-20">
      <div className="container mx-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20">

        {/* Quick Stats Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-dark-green mb-4 sm:mb-6 font-sans">Quick Stats</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {/* Today Bookings Card */}
            <div className="bg-light-green rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 text-white">
              <p className="text-sm sm:text-base mb-1 sm:mb-2 border-b border-b-dotted font-sans">Today Bookings</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold font-sans">{stats.todayBookings}</p>
            </div>

            {/* Total Bookings Card */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-gray-200">
              <p className="text-sm sm:text-base text-dark-green/70 mb-1 sm:mb-2 font-sans">Total Bookings</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-dark-green font-sans">
                {stats.totalBookings.toLocaleString()}
              </p>
            </div>

            {/* Total Earnings Card */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-gray-200">
              <p className="text-sm sm:text-base text-dark-green/70 mb-1 sm:mb-2 font-sans">Total Earnings</p>
              <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-dark-green font-sans">
                {formatCurrency(stats.totalEarnings)}
              </p>
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
              onClick={() => setActiveTab('previous')}
              className={`px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm md:text-base font-medium transition-all font-sans ${
                activeTab === 'previous'
                  ? 'bg-light-green text-white'
                  : 'bg-cream text-dark-green hover:bg-cream/80'
              }`}
            >
              <span className="hidden sm:inline">Previous Bookings</span>
              <span className="sm:hidden">Previous</span>
            </button>
          </div>
        </div>


        {/* Bookings Grid - Max 4 cards per row */}
        <div>
          {isLoading ? (
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
          ) : isError ? (
            <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8">
              <div className="text-center">
                <div className="w-12 sm:w-16 h-12 sm:h-16 bg-red/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <svg className="w-6 sm:w-8 h-6 sm:h-8 text-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm sm:text-base text-red font-medium mb-2">
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
          ) : bookings.length === 0 ? (
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
                    : "You don't have any previous bookings."}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 font-sans">
                  Bookings will appear here once customers start booking your field.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="bg-white shadow-md rounded-xl sm:rounded-2xl p-4 sm:p-5 hover:shadow-lg transition-shadow">
                  {/* User Avatar and Name */}
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 border-b border-b-gray-200 pb-3 sm:pb-4">
                    <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {booking.userAvatar ? (
                        <img 
                          src={booking.userAvatar} 
                          alt={booking.userName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs sm:text-sm font-semibold text-gray-600">
                          {booking.userName.charAt(0)}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-semibold text-dark-green font-sans truncate">
                        {booking.userName}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-dark-green/70 font-sans">{booking.time}</p>
                    </div>
                  </div>  
                  
                  {/* Booking Details */}
                  <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-dark-green/70 font-sans">Order ID</span>
                      <p className="text-xs font-medium text-dark-green font-sans">{booking.orderId}</p>
                    </div>
                    {booking.frequency && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-dark-green/70 font-sans">Recurring</span>
                        <p className="text-xs font-medium text-dark-green font-sans">{booking.frequency}</p>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-dark-green/70 font-sans">Dogs</span>
                      <p className="text-xs font-medium text-dark-green font-sans">{booking.dogs}</p>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span className="text-xs text-dark-green/70 font-sans">Amount</span>
                      <p className="text-sm font-bold text-green font-sans">
                        {formatCurrency(booking.amount)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Action Buttons or Status */}
                  <div className="flex gap-2">
                    {activeTab === 'previous' ? (
                      <>
                        <div className={`flex-1 py-2 px-3 border rounded-full text-center text-xs font-medium font-sans ${
                          booking.status === 'completed' ? 'bg-green/10 text-green' :
                          booking.status === 'cancelled' ? 'bg-red/10 text-red' :
                          booking.status === 'refunded' ? 'bg-orange/10 text-orange' :
                          booking.status === 'confirmed' ? 'bg-blue/10 text-blue' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </div>
                        <button
                          onClick={() => handleSendMessage(booking.id)}
                          className="flex-1 py-2 px-3 rounded-full bg-green text-xs text-white font-medium hover:bg-green/90 transition-colors font-sans"
                        >
                          Send Message
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleViewDetails(booking)}
                          className="flex-1 py-2 px-3 rounded-full border border-gray-300 text-xs text-dark-green font-medium hover:bg-gray-50 transition-colors font-sans"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleSendMessage(booking.id)}
                          className="flex-1 py-2 px-3 rounded-full bg-green text-xs text-white font-medium hover:bg-green/90 transition-colors font-sans"
                        >
                          Send Message
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && !isError && bookings.length > 0 && totalPages > 1 && (
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
        )}
      </div>
      
      {/* Booking Details Modal */}
      <FieldOwnerBookingDetailsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBooking(null);
        }}
        booking={selectedBooking}
      />
    </div>
  );
}