import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useFieldOwnerBookings, useRecentBookings, type Booking } from '@/hooks/queries/useFieldOwnerBookings';
import FieldOwnerBookingDetailsModal from '@/components/modal/FieldOwnerBookingDetailsModal';
import { Check } from 'lucide-react';
import { 
  StatsCardsSkeleton, 
  BookingTabsSkeleton,
  EarningsDashboardSkeleton 
} from '@/components/skeletons/FieldOwnerSkeletons';

// Lazy load the earnings dashboard
const EarningsDashboard = dynamic(
  () => import('./EarningsDashboard'),
  {
    loading: () => <EarningsDashboardSkeleton />,
    ssr: false
  }
);

// Stats cards component - loads first
const StatsCards = ({ stats }: { stats: any }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-text text-sm">Total Bookings</p>
            <p className="text-2xl font-bold text-dark-green mt-1">{stats?.totalBookings || 0}</p>
          </div>
          <div className="w-10 h-10 bg-green/10 rounded-full flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="#3a6b22" strokeWidth="2"/>
              <path d="M3 9H21" stroke="#3a6b22" strokeWidth="2"/>
              <path d="M9 3V21" stroke="#3a6b22" strokeWidth="2"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-text text-sm">Active Bookings</p>
            <p className="text-2xl font-bold text-dark-green mt-1">{stats?.activeBookings || 0}</p>
          </div>
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#2563EB" strokeWidth="2"/>
              <path d="M12 6V12L16 14" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-text text-sm">Completed Today</p>
            <p className="text-2xl font-bold text-dark-green mt-1">{stats?.completedToday || 0}</p>
          </div>
          <div className="w-10 h-10 bg-green/10 rounded-full flex items-center justify-center">
            <Check className="w-5 h-5 text-green" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-text text-sm">Revenue Today</p>
            <p className="text-2xl font-bold text-dark-green mt-1">${stats?.revenueToday || 0}</p>
          </div>
          <div className="w-10 h-10 bg-green/10 rounded-full flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2V22" stroke="#3a6b22" strokeWidth="2" strokeLinecap="round"/>
              <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="#3a6b22" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

// Booking tabs component
const BookingTabs = ({ activeTab, onTabChange, data, isLoading, currentPage, onPageChange, onBookingClick }: any) => {
  const bookings = data?.bookings || [];
  const totalPages = data?.pagination?.totalPages || 1;

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="flex border-b border-gray-200">
        {[
          { id: 'today', label: "Today's Bookings" },
          { id: 'upcoming', label: 'Upcoming Bookings' },
          { id: 'previous', label: 'Previous Bookings' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as any)}
            className={`px-6 py-4 font-medium text-sm transition-colors ${
              activeTab === tab.id
                ? 'text-green border-b-2 border-green'
                : 'text-gray-text hover:text-dark-green'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {isLoading ? (
          <BookingTabsSkeleton />
        ) : bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 11H15M21 11C21 16.5228 16.5228 21 11 21C5.47715 21 1 16.5228 1 11C1 5.47715 5.47715 1 11 1C16.5228 1 21 5.47715 21 11Z" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-gray-500">No bookings found</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {bookings.map((booking: Booking) => (
                <div
                  key={booking.id}
                  onClick={() => onBookingClick(booking)}
                  className="border border-gray-200 rounded-lg p-4 hover:border-green hover:bg-green/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-dark-green">
                      {booking.userName || 'Guest User'}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'CONFIRMED' ? 'bg-green/10 text-green' :
                      booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      booking.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-text">Date</p>
                      <p className="text-dark-green font-medium">
                        {new Date(booking.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-text">Time</p>
                      <p className="text-dark-green font-medium">
                        {booking.startTime} - {booking.endTime}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-text">Dogs</p>
                      <p className="text-dark-green font-medium">{booking.numberOfDogs}</p>
                    </div>
                    <div>
                      <p className="text-gray-text">Amount</p>
                      <p className="text-dark-green font-medium">${booking.totalAmount}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                
                <span className="px-4 py-1 text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default function BookingHistoryProgressive() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<'bookings' | 'earnings'>('bookings');
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'previous'>('today');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statsLoaded, setStatsLoaded] = useState(false);

  // Use React Query hook
  const { 
    data, 
    isLoading, 
    error, 
    isError,
    refetch 
  } = useFieldOwnerBookings(activeTab, currentPage);

  // Fetch recent bookings for overview
  const {
    data: recentData,
    isLoading: recentLoading
  } = useRecentBookings();

  // Calculate stats from data
  const stats = React.useMemo(() => {
    if (!data) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayBookings = data.bookings?.filter((b: Booking) => {
      const bookingDate = new Date(b.date);
      bookingDate.setHours(0, 0, 0, 0);
      return bookingDate.getTime() === today.getTime();
    }) || [];

    const completedToday = todayBookings.filter((b: Booking) => b.status === 'COMPLETED').length;
    const revenueToday = todayBookings.reduce((sum: number, b: Booking) => sum + b.totalAmount, 0);

    return {
      totalBookings: data.summary?.total || 0,
      activeBookings: data.summary?.confirmed || 0,
      completedToday,
      revenueToday: revenueToday.toFixed(2)
    };
  }, [data]);

  // Load stats after a delay to show progressive loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setStatsLoaded(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Refetch data every 30 seconds for today's bookings
  useEffect(() => {
    if (activeTab === 'today') {
      const interval = setInterval(() => {
        refetch();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [activeTab, refetch]);

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleAddField = () => {
    router.push('/field-owner?edit=true');
  };

  return (
    <div className="min-h-screen bg-light py-4 sm:py-6 lg:py-8 mt-20 sm:mt-24 lg:mt-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-20">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:shadow-md transition-shadow"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h1 className="text-2xl lg:text-3xl font-bold text-dark-green">Field Dashboard</h1>
          </div>
          
          <button
            onClick={handleAddField}
            className="px-4 py-2 bg-green text-white rounded-full hover:bg-green/90 transition-colors text-sm font-medium"
          >
            Edit Field Details
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveView('bookings')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              activeView === 'bookings'
                ? 'bg-green text-white'
                : 'bg-white text-gray-text hover:bg-gray-50'
            }`}
          >
            Bookings Overview
          </button>
          <button
            onClick={() => setActiveView('earnings')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              activeView === 'earnings'
                ? 'bg-green text-white'
                : 'bg-white text-gray-text hover:bg-gray-50'
            }`}
          >
            Earnings Dashboard
          </button>
        </div>

        {activeView === 'bookings' ? (
          <>
            {/* Stats Cards - Load progressively */}
            {statsLoaded && stats ? (
              <StatsCards stats={stats} />
            ) : (
              <StatsCardsSkeleton />
            )}

            {/* Booking Tabs - Load after stats */}
            <BookingTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              data={data}
              isLoading={isLoading}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onBookingClick={handleBookingClick}
            />
          </>
        ) : (
          <Suspense fallback={<EarningsDashboardSkeleton />}>
            <EarningsDashboard />
          </Suspense>
        )}

        {/* Booking Details Modal */}
        {selectedBooking && (
          <FieldOwnerBookingDetailsModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedBooking(null);
            }}
            booking={selectedBooking}
            onRefresh={refetch}
          />
        )}
      </div>
    </div>
  );
}