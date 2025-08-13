import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Link from 'next/link';
import { MapPin, DollarSign, Calendar, Users, Plus, Settings, TrendingUp, Clock } from 'lucide-react';

export default function FieldOwnerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated or not a field owner
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
    } else if (session.user.role !== 'FIELD_OWNER' && session.user.role !== 'ADMIN') {
      router.push('/unauthorized');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session || (session.user.role !== 'FIELD_OWNER' && session.user.role !== 'ADMIN')) {
    return null;
  }

  // Mock data for demonstration
  const stats = {
    totalFields: 3,
    activeBookings: 7,
    monthlyRevenue: 2450,
    totalReviews: 24,
    averageRating: 4.8,
    occupancyRate: 68,
  };

  const recentBookings = [
    { id: 1, fieldName: 'Sunny Meadow Field', customerName: 'John Smith', date: '2025-08-15', time: '10:00 - 12:00', status: 'confirmed', amount: 45 },
    { id: 2, fieldName: 'Riverside Park', customerName: 'Emma Wilson', date: '2025-08-15', time: '14:00 - 16:00', status: 'pending', amount: 60 },
    { id: 3, fieldName: 'Green Valley Field', customerName: 'Michael Brown', date: '2025-08-16', time: '09:00 - 11:00', status: 'confirmed', amount: 50 },
  ];

  const myFields = [
    { id: 1, name: 'Sunny Meadow Field', location: 'Manchester', status: 'active', bookingsToday: 3, rating: 4.9 },
    { id: 2, name: 'Riverside Park', location: 'Liverpool', status: 'active', bookingsToday: 2, rating: 4.7 },
    { id: 3, name: 'Green Valley Field', location: 'Leeds', status: 'inactive', bookingsToday: 0, rating: 4.8 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Field Owner Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {session.user.name || 'Field Owner'}!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Fields</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalFields}</p>
              </div>
              <MapPin className="h-10 w-10 text-green opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeBookings}</p>
              </div>
              <Calendar className="h-10 w-10 text-blue-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">£{stats.monthlyRevenue}</p>
              </div>
              <DollarSign className="h-10 w-10 text-yellow-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating} ⭐</p>
              </div>
              <TrendingUp className="h-10 w-10 text-purple-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/field-owner">
            <div className="bg-green text-white rounded-lg shadow p-6 hover:opacity-90 transition-opacity cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Add New Field</h3>
                  <p className="text-sm opacity-90 mt-1">List a new field for dog owners</p>
                </div>
                <Plus className="h-8 w-8" />
              </div>
            </div>
          </Link>

          <Link href="/fields/manage">
            <div className="bg-blue-600 text-white rounded-lg shadow p-6 hover:opacity-90 transition-opacity cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Manage Fields</h3>
                  <p className="text-sm opacity-90 mt-1">Edit your existing fields</p>
                </div>
                <Settings className="h-8 w-8" />
              </div>
            </div>
          </Link>

          <Link href="/bookings/calendar">
            <div className="bg-purple-600 text-white rounded-lg shadow p-6 hover:opacity-90 transition-opacity cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">View Calendar</h3>
                  <p className="text-sm opacity-90 mt-1">Check upcoming bookings</p>
                </div>
                <Calendar className="h-8 w-8" />
              </div>
            </div>
          </Link>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Fields */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">My Fields</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {myFields.map((field) => (
                  <div key={field.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{field.name}</h3>
                      <p className="text-sm text-gray-600">{field.location}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          field.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {field.status}
                        </span>
                        <span className="text-xs text-gray-600">
                          {field.bookingsToday} bookings today
                        </span>
                        <span className="text-xs text-gray-600">
                          ⭐ {field.rating}
                        </span>
                      </div>
                    </div>
                    <Link href={`/fields/edit/${field.id}`}>
                      <button className="text-green hover:text-green-700">
                        <Settings className="h-5 w-5" />
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
              <Link href="/fields/manage">
                <button className="w-full mt-4 py-2 text-center text-green font-medium hover:text-green-700">
                  View All Fields →
                </button>
              </Link>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{booking.fieldName}</h3>
                        <p className="text-sm text-gray-600">{booking.customerName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-600">
                            {booking.date} • {booking.time}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">£{booking.amount}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          booking.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/user/my-bookings">
                <button className="w-full mt-4 py-2 text-center text-green font-medium hover:text-green-700">
                  View All Bookings →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}