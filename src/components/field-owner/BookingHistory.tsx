import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { BookingHistorySkeleton } from '@/components/skeletons/BookingHistorySkeleton';

interface Booking {
  id: string;
  userName: string;
  userAvatar?: string;
  time: string;
  orderId: string;
  status: 'recurring' | 'upcoming' | 'completed';
  frequency?: string;
  dogs: number;
  amount: number;
  date?: string;
}

interface Stats {
  todayBookings: number;
  totalBookings: number;
  totalEarnings: number;
}

export default function BookingHistory() {
  const router = useRouter();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'previous'>('today');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<Stats>({
    todayBookings: 0,
    totalBookings: 0,
    totalEarnings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    // Reset page when tab changes
    setCurrentPage(1);
  }, [activeTab]);

  useEffect(() => {
    fetchBookings();
  }, [activeTab, currentPage, session]);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get token from session or localStorage
      let token = session?.accessToken;
      
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

      // Build query params with pagination
      const params = new URLSearchParams();
      params.append('status', activeTab);
      params.append('page', currentPage.toString());
      params.append('limit', '10');

      // Fetch bookings from API
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api'}/fields/owner/bookings?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
        if (data.stats) {
          setStats(data.stats);
        }
        // Update pagination info
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setTotalResults(data.pagination.total || 0);
        }
      } else if (response.status === 404) {
        setBookings([]);
        setError('No bookings found');
      } else if (response.status === 401) {
        setError('Session expired. Please login again');
        router.push('/login');
      } else {
        setError('Failed to fetch bookings. Please try again.');
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Network error. Please check your connection.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (bookingId: string) => {
    // Navigate to booking details page
    console.log('View details for booking:', bookingId);
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

  if (loading && bookings.length === 0) {
    return <BookingHistorySkeleton />;
  }

  return (
    <div className="min-h-screen bg-light pt-32 pb-20">
      <div className="container mx-auto px-20">

        {/* Quick Stats Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-dark-green mb-6 font-sans">Quick Stats</h2>
          
          <div className="grid grid-cols-3 gap-6">
            {/* Today Bookings Card */}
            <div className="bg-green rounded-2xl p-6 text-white">
              <p className="text-base mb-2 font-sans">Today Bookings</p>
              <p className="text-4xl font-bold font-sans">{stats.todayBookings}</p>
            </div>

            {/* Total Bookings Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <p className="text-base text-gray-text mb-2 font-sans">Total Bookings</p>
              <p className="text-4xl font-bold text-dark-green font-sans">
                {stats.totalBookings.toLocaleString()}
              </p>
            </div>

            {/* Total Earnings Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <p className="text-base text-gray-text mb-2 font-sans">Total Earnings</p>
              <p className="text-4xl font-bold text-dark-green font-sans">
                {formatCurrency(stats.totalEarnings)}
              </p>
            </div>
          </div>
        </div>

        {/* Bookings Tabs */}
        <div className="mb-6">
          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab('today')}
              className={`px-6 py-2.5 rounded-full font-medium transition-all font-sans ${
                activeTab === 'today'
                  ? 'bg-green text-white'
                  : 'bg-cream text-dark-green hover:bg-cream/80'
              }`}
            >
              Today Bookings
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-6 py-2.5 rounded-full font-medium transition-all font-sans ${
                activeTab === 'upcoming'
                  ? 'bg-green text-white'
                  : 'bg-cream text-dark-green hover:bg-cream/80'
              }`}
            >
              Upcoming Bookings
            </button>
            <button
              onClick={() => setActiveTab('previous')}
              className={`px-6 py-2.5 rounded-full font-medium transition-all font-sans ${
                activeTab === 'previous'
                  ? 'bg-green text-white'
                  : 'bg-cream text-dark-green hover:bg-cream/80'
              }`}
            >
              Previous Bookings
            </button>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-2xl p-8">
              <div className="flex flex-col items-center justify-center">
                <p className="text-gray-text font-sans">Loading bookings...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-red font-medium mb-2">{error}</p>
                <button 
                  onClick={fetchBookings}
                  className="text-green font-medium hover:underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-white rounded-2xl p-12">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-dark-green mb-2 font-sans">
                  No {activeTab} bookings
                </h3>
                <p className="text-gray-text font-sans mb-4">
                  {activeTab === 'today' 
                    ? "You don't have any bookings scheduled for today."
                    : activeTab === 'upcoming'
                    ? "You don't have any upcoming bookings."
                    : "You don't have any previous bookings."}
                </p>
                <p className="text-sm text-gray-500 font-sans">
                  Bookings will appear here once customers start booking your field.
                </p>
              </div>
            </div>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-2xl p-6">
                <div className="flex items-start justify-between">
                  {/* Left Section - User Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {booking.userAvatar ? (
                        <img 
                          src={booking.userAvatar} 
                          alt={booking.userName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-semibold text-gray-600">
                          {booking.userName.charAt(0)}
                        </span>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-dark-green font-sans">
                        {booking.userName}
                      </h3>
                      <p className="text-sm text-gray-text font-sans">{booking.time}</p>
                      
                      <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                        <div>
                          <span className="text-gray-text font-sans">Order ID</span>
                          <p className="font-medium text-dark-green font-sans">{booking.orderId}</p>
                        </div>
                        <div>
                          <span className="text-gray-text font-sans">Recurring booking</span>
                          <p className="font-medium text-dark-green font-sans">{booking.frequency}</p>
                        </div>
                        <div>
                          <span className="text-gray-text font-sans">Number of dogs</span>
                          <p className="font-medium text-dark-green font-sans">{booking.dogs}</p>
                        </div>
                        <div>
                          <span className="text-gray-text font-sans">Order Amount</span>
                          <p className="font-medium text-dark-green font-sans">
                            {formatCurrency(booking.amount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Order Info & Actions */}
                  <div className="text-right">
                    <p className="text-sm font-medium text-dark-green mb-6 font-sans">
                      Order ID {booking.orderId}
                    </p>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleViewDetails(booking.id)}
                        className="px-6 py-2.5 rounded-full border border-gray-300 text-dark-green font-medium hover:bg-gray-50 transition-colors font-sans"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleSendMessage(booking.id)}
                        className="px-6 py-2.5 rounded-full bg-green text-white font-medium hover:bg-green/90 transition-colors font-sans"
                      >
                        Send Message
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && !error && bookings.length > 0 && totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <button 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-dark-green font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cream rounded-full transition-all font-sans"
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
                    className={`w-10 h-10 rounded-full font-medium transition-all font-sans ${
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
              className="px-4 py-2 text-dark-green font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cream rounded-full transition-all font-sans"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}