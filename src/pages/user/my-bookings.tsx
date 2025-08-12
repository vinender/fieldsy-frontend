import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Calendar, 
  Dog,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { BookingDetailsModal } from '@/components/modal/BookingDetailModal';
// import BookingDetailsModal from '@/components/modal/BookingDetailModal';

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
  distance: string;
  time: string;
  date: string;
  dogs: number;
  recurring: string | null;
  status: 'upcoming' | 'completed' | 'cancelled' | 'refunded';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

const BookingHistoryPage = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Upcoming bookings data
  const upcomingBookings: Booking[] = [
    {
      _id: '507f1f77bcf86cd799439011',
      fieldId: '507f1f77bcf86cd799439001',
      userId: '507f1f77bcf86cd799439021',
      name: 'Green Meadows Field',
      duration: '30min',
      price: 18,
      currency: '$',
      image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop',
      features: '6 ft steel mesh, fully enclosed • 1.5 acres • Soft grass + walking path • Flat with gentle slopes',
      location: 'Hampshire SO21, UK',
      distance: '4.8 km away',
      time: 'Wed, 5:00 PM – 6:00 PM',
      date: '10 Jul, 2025',
      dogs: 1,
      recurring: 'Recurring monthly on 10 Aug, 2025',
      status: 'upcoming',
      paymentStatus: 'paid',
      createdAt: '2025-07-01T10:00:00Z',
      updatedAt: '2025-07-01T10:00:00Z'
    },
    {
      _id: '507f1f77bcf86cd799439012',
      fieldId: '507f1f77bcf86cd799439002',
      userId: '507f1f77bcf86cd799439021',
      name: 'Bark & Run Park',
      duration: '30min',
      price: 65,
      currency: '$',
      image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300&fit=crop',
      features: '6 ft steel mesh, fully enclosed • 2.5 acres • Soft grass + walking path • Flat with gentle slopes',
      location: 'Bristol BS3, UK',
      distance: '6.0 km away',
      time: 'Mon, 7:00 AM – 8:00 AM',
      date: '9 Jul, 2025',
      dogs: 4,
      recurring: 'Recurring weekly on every Monday',
      status: 'upcoming',
      paymentStatus: 'paid',
      createdAt: '2025-07-02T10:00:00Z',
      updatedAt: '2025-07-02T10:00:00Z'
    },
    {
      _id: '507f1f77bcf86cd799439013',
      fieldId: '507f1f77bcf86cd799439003',
      userId: '507f1f77bcf86cd799439021',
      name: 'The Woof Woods',
      duration: '1hr',
      price: 60,
      currency: '$',
      image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop',
      features: '6 ft steel mesh, fully enclosed • 1.2 acres • Soft grass + walking path • Flat with gentle slopes',
      location: 'Surrey GU1, UK',
      distance: '2.4 km away',
      time: 'Fri, 9:30 AM – 10:30 AM',
      date: '12 Jul, 2025',
      dogs: 2,
      recurring: 'Recurring Daily',
      status: 'upcoming',
      paymentStatus: 'paid',
      createdAt: '2025-07-03T10:00:00Z',
      updatedAt: '2025-07-03T10:00:00Z'
    }
  ];

  // Previous bookings data
  const previousBookings: Booking[] = [
    {
      _id: '507f1f77bcf86cd799439014',
      fieldId: '507f1f77bcf86cd799439004',
      userId: '507f1f77bcf86cd799439021',
      name: 'Paw Paradise Paddock',
      duration: '30min',
      price: 48,
      currency: '$',
      image: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=400&h=300&fit=crop',
      features: '6 ft steel mesh, fully enclosed • 3.1 acres • Soft grass + walking path • Flat with gentle slopes',
      location: 'Essex CM2, UK',
      distance: '5.7 km away',
      time: 'Sun, 4:00 PM – 5:00 PM',
      date: '6 Jun, 2025',
      dogs: 3,
      recurring: null,
      status: 'completed',
      paymentStatus: 'paid',
      createdAt: '2025-06-01T10:00:00Z',
      updatedAt: '2025-06-06T17:00:00Z'
    },
    {
      _id: '507f1f77bcf86cd799439015',
      fieldId: '507f1f77bcf86cd799439005',
      userId: '507f1f77bcf86cd799439021',
      name: 'Fetch & Field Farm',
      duration: '1hr',
      price: 32,
      currency: '$',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      features: '6 ft steel mesh, fully enclosed • 2.8 acres • Soft grass + walking path • Flat with gentle slopes',
      location: 'Kent TN25, UK',
      distance: '3.1 km away',
      time: 'Tue, 6:00 AM – 7:00 AM',
      date: '14 May, 2025',
      dogs: 2,
      recurring: null,
      status: 'cancelled',
      paymentStatus: 'refunded',
      createdAt: '2025-05-10T10:00:00Z',
      updatedAt: '2025-05-12T10:00:00Z'
    },
    {
      _id: '507f1f77bcf86cd799439016',
      fieldId: '507f1f77bcf86cd799439006',
      userId: '507f1f77bcf86cd799439021',
      name: 'Happy Tails Field',
      duration: '2hr',
      price: 85,
      currency: '$',
      image: 'https://images.unsplash.com/photo-1504826260979-242151ee45b7?w=400&h=300&fit=crop',
      features: '8 ft chain link, secure • 4 acres • Mixed terrain • Hills and flat areas',
      location: 'London SW1, UK',
      distance: '1.2 km away',
      time: 'Sat, 2:00 PM – 4:00 PM',
      date: '20 Apr, 2025',
      dogs: 1,
      recurring: null,
      status: 'refunded',
      paymentStatus: 'refunded',
      createdAt: '2025-04-15T10:00:00Z',
      updatedAt: '2025-04-18T10:00:00Z'
    }
  ];

  // Get bookings based on active tab
  const bookings = activeTab === 'upcoming' ? upcomingBookings : previousBookings;

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      completed: 'bg-green-100 text-green-700  border-green-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
      refunded: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      upcoming: 'bg-blue-100 text-blue-700 border-blue-200'
    };
    
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusStyles[status] || ''}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <div className="flex gap-8 items-center bg-light py-6 border-b border-gray-200 last:border-0">
      {/* Image */}
      <img 
        src={booking.image} 
        alt={booking.name}
        className="w-[174px] h-[140px] rounded-[20px] object-cover flex-shrink-0"
      />
      
      {/* Content */}
      <div className="flex-1">
        {/* Title and Price */}
        <div className="flex items-center gap-2 mb-2.5">
          <h3 className="text-[20px] font-semibold text-[#192215]">{booking.name}</h3>
          <span className="text-[16px] font-semibold text-[#192215]">• {booking.duration}</span>
          <span className="text-[16px] font-semibold text-[#3a6b22]">• {booking.currency}{booking.price}</span>
        </div>

        {/* Features */}
        <p className="text-[16px] font-medium text-[#192215] mb-4">{booking.features}</p>

        {/* Details */}
        <div className="flex flex-wrap gap-6 text-[14px] text-[#8d8d8d] mb-3">
          <div className="flex items-center gap-1">
            <MapPin className="w-[18px] h-[18px]" />
            <span>{booking.location} • {booking.distance}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-[18px] h-[18px]" />
            <span>{booking.time}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-[18px] h-[18px]" />
            <span>{booking.date}</span>
          </div>
          <div className="flex items-center gap-1">
            <Dog className="w-[18px] h-[18px]" />
            <span>{booking.dogs} Dog{booking.dogs > 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Recurring Badge */}
        {booking.recurring && (
          <div className="inline-flex items-center px-4 py-1.5 bg-[#f4ffef] border border-[#3a6b221a] rounded-full">
            <span className="text-[13px] font-bold text-[#3a6b22]">{booking.recurring}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2.5 w-[151px] flex-shrink-0">
        {booking.status === 'upcoming' ? (
          <>
            <button className="w-full py-2 px-2.5 bg-[#fffcf3] border border-[#3a6b22] rounded-full text-[14px] font-bold text-[#3a6b22] hover:bg-[#f8f1d7] transition-colors">
              Cancel Booking
            </button>
            <button 
              onClick={() => handleViewDetails(booking)}
              className="w-full py-2 px-2.5 bg-[#3a6b22] rounded-full text-[14px] font-bold text-white hover:bg-[#2d5319] transition-colors">
              View Details
            </button>
          </>
        ) : (
          <>
            <div className="w-full  text-center">
              {getStatusBadge(booking.status)}
            </div>
            <button 
              onClick={() => handleViewDetails(booking)}
              className="w-full py-2 px-2.5 bg-[#3a6b22] rounded-full text-[14px] font-bold text-white hover:bg-[#2d5319] transition-colors">
              View Details
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-light xl:mt-24 mt-16">
      <div className="max-w-full mx-auto px-20 py-10">
        {/* Page Title with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <button className="w-12 h-12 bg-[#f8f1d7] rounded-full flex items-center justify-center hover:bg-[#efe5bf] transition-colors">
            <ArrowLeft className="w-6 h-6 text-[#192215]" />
          </button>
          <h1 className="text-[29px] font-semibold text-[#192215]">Booking History</h1>
        </div>

        {/* Tabs and Filter */}
        <div className="flex items-center justify-between mb-8">
          {/* Tab Switcher */}
          <div className="inline-flex p-1.5 bg-[#f8f1d7] rounded-full border border-black/3">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-4 py-2.5 rounded-full text-[14px] font-bold transition-all ${
                activeTab === 'upcoming' 
                  ? 'bg-[#8fb366] text-white' 
                  : 'bg-transparent text-[#192215] hover:bg-white/50'
              }`}
            >
              Upcoming Bookings
            </button>
            <button
              onClick={() => setActiveTab('previous')}
              className={`px-4 py-2.5 rounded-full text-[14px] font-bold transition-all ${
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
            className="flex items-center gap-2 px-5 py-3 bg-white border border-black/6 rounded-full hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-6 h-6 text-[#192215]" />
            <span className="text-[14px] font-medium text-[#192215]">Filter</span>
            <ChevronDown className={`w-4 h-4 text-[#192215] transition-transform ${showFilter ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Bookings List */}
        <div className="bg-light rounded-2xl p-6 mb-6">
          {bookings.map((booking) => (
            <BookingCard key={booking._id} booking={booking} />
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-[14px] font-semibold italic text-[#192215]">
            Showing 1-10 of 50
          </p>
          
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/50 transition-colors">
              <ChevronLeft className="w-5 h-5 text-[#192215]" />
            </button>
            
            <button className="w-8 h-8 flex items-center justify-center rounded bg-[#3a6b22] text-white text-sm font-medium">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/50 text-[#192215] text-sm font-medium transition-colors">
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/50 text-[#192215] text-sm font-medium transition-colors">
              3
            </button>
            <span className="text-[#192215]">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/50 text-[#192215] text-sm font-medium transition-colors">
              10
            </button>
            
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/50 transition-colors">
              <ChevronRight className="w-5 h-5 text-[#192215]" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Booking Details Modal */}
      <BookingDetailsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBooking(null);
        }}
        booking={selectedBooking}
      />
    </div>
  );
};

export default BookingHistoryPage;