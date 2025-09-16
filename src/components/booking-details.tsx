import React, { useState } from 'react';
import { Search, Bell, Settings, LogOut, ChevronDown, Check, Star, MoreVertical, FileText, Layout, Users, MapPin } from 'lucide-react';

// Reusable Button Component
const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const variants = {
    primary: 'bg-green-500 text-white hover:bg-green-600',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    ghost: 'bg-transparent hover:bg-gray-100'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button 
      className={`rounded-lg font-medium transition-colors ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Reusable Card Component
const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  );
};

// Reusable Badge Component
const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700'
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

// Sidebar Component
const Sidebar = ({ activeItem = 'Fields' }) => {
  const menuItems = [
    { icon: Layout, label: 'Dashboard' },
    { icon: FileText, label: 'Bookings' },
    { icon: MapPin, label: 'Fields', active: true },
    { icon: Users, label: 'Dog Owners' },
    { icon: Settings, label: 'Settings' },
    { icon: LogOut, label: 'Logout' }
  ];
  
  return (
    <div className="w-64 bg-white h-screen border-r border-gray-200">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="bg-green-500 text-white text-xl font-bold px-4 py-2 rounded-lg">
          Fieldsy
        </div>
      </div>
      
      {/* Menu Items */}
      <nav className="p-4">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index}>
              {index === menuItems.length - 1 && <div className="my-4 border-t border-gray-200" />}
              <button
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  item.active 
                    ? 'bg-green-50 text-green-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            </div>
          );
        })}
      </nav>
    </div>
  );
};

// Header Component
const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for something"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
        
        {/* Right Section */}
        <div className="flex items-center gap-6 ml-8">
          {/* Notifications */}
          <button className="relative p-3 bg-gray-50 rounded-full hover:bg-gray-100">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              1
            </span>
          </button>
          
          {/* User Profile */}
          <div className="flex items-center gap-3">
            <img
              src="https://via.placeholder.com/40"
              alt="User"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">Jackson D.</p>
              <p className="text-xs text-gray-500">Manager</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

// Info Card Component
const InfoCard = ({ label, value, className = '' }) => {
  return (
    <div className={className}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
};

// Image Gallery Component
const ImageGallery = ({ images }) => {
  return (
    <div className="grid grid-cols-6 gap-4">
      {images.map((img, index) => (
        <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
          <img 
            src={img} 
            alt={`Field image ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  );
};

// Review Card Component
const ReviewCard = ({ name, date, rating, review, avatar }) => {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <img 
            src={avatar} 
            alt={name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-medium text-gray-900">{name}</p>
            <p className="text-sm text-gray-500">{date}</p>
          </div>
        </div>
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              size={16} 
              className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
            />
          ))}
        </div>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{review}</p>
    </Card>
  );
};

// Table Component
const Table = ({ headers, rows }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            {headers.map((header, index) => (
              <th key={index} className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="py-4 px-4 text-sm text-gray-900">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Main Dashboard Component
export default function FieldDetailsDashboard() {
  const fieldImages = [
    'https://via.placeholder.com/150',
    'https://via.placeholder.com/150',
    'https://via.placeholder.com/150',
    'https://via.placeholder.com/150',
    'https://via.placeholder.com/150',
    'https://via.placeholder.com/150'
  ];
  
  const safetyRules = [
    'Dogs must be under control entering and exiting the space',
    'Make sure the area is safe and secure before bringing your dog in',
    'Never arrive a early or leave after your booking ends (time and more fees apply)',
    'Pick up after your dogs, Leave the spot as it was when you arrived',
    'Always monitor your dog and be in visual contact',
    'Unless otherwise stated, restrooms are not available on site'
  ];
  
  const bookingPolicies = [
    'All bookings must be made at least 24 hours in advance',
    'The minimum booking slot is 1 hour',
    'Free cancellation up to 12 hours before the scheduled start time',
    'Users arriving late will not receive a time extension',
    'If the client does not arrive within 15 minutes of the booking start time, the booking will be marked as non-show and charged in full',
    'Bookings may be subject to blackout list booking nights'
  ];
  
  const earningsData = [
    ['#0008', 'ALEXANDRA', 'Jan 15, 2024 at 3:30 PM', '35', '1', '$84.31', <Badge variant="warning">Pending</Badge>],
    ['#0009', 'ISABELLA', 'Jan 15, 2024 at 10:30 AM', '12', '1', '$91.72', <Badge variant="warning">Pending</Badge>],
    ['#0010', 'SCAREMAH', 'Jan 15, 2024 at 04:15 AM', '41', '3', '$49.48', <Badge>Active</Badge>],
    ['#0011', 'MARWOOD', 'Jan 15, 2024 at 02:30 AM', '21', '2', '$36.97', <Badge>Active</Badge>],
    ['#0012', 'ALEXANDER', 'Jan 15, 2024 at 01:11 AM', '132', '6', '$141.11', <Badge variant="warning">Pending</Badge>],
    ['#0013', 'NIERMANN', 'Jan 15, 2024 at 05:18 AM', '132', '2', '$76.19', <Badge variant="warning">Pending</Badge>]
  ];
  
  const reviews = [
    {
      name: 'Amelia Joseph',
      date: '30 Jun 2025',
      rating: 5,
      avatar: 'https://via.placeholder.com/40',
      review: 'Absolutely love this service! The entire booking process was quick and easy, and the field itself was spotless, fully secure, and ideal for my reactive dog who needs space away from other pets. It gave us both peace of mind and a truly enjoyable walk.'
    },
    {
      name: 'Natalia Pérez',
      date: '29 Jun 2025',
      rating: 5,
      avatar: 'https://via.placeholder.com/40',
      review: 'So convenient and easy to use! I found a secure field just 5 minutes from home, and it made all the difference. My two dogs had plenty of space to run off-lead without distractions, and I could relax knowing they were safe. Fieldsy really takes the stress out of our daily walks!'
    },
    {
      name: 'Carlos Sánchez',
      date: '12 Jun 2025',
      rating: 5,
      avatar: 'https://via.placeholder.com/40',
      review: 'Booking through Fieldsy was incredibly simple and hassle-free. Within minutes, I found a fully fenced field nearby and secured a time slot that fit my schedule. The space was clean, private, and completely secure, giving my pup the freedom to run, explore, and play safely off-lead.'
    }
  ];
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Page Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Fields Detail</h1>
            
            {/* Field Overview */}
            <Card className="p-5 mb-6">
              <h2 className="text-sm text-gray-500 mb-4">Field Overview</h2>
              <div className="grid grid-cols-5 gap-8">
                <InfoCard label="Name" value="Green Meadows Field" />
                <InfoCard label="Area" value="40,689" />
                <InfoCard label="Field Count" value="40,689" />
                <InfoCard label="Dog Area" value="40,689" />
                <InfoCard label="Max" value="HP Category: 55" />
              </div>
              <div className="grid grid-cols-3 gap-8 mt-6">
                <InfoCard label="Nearby Parking" value="1.5 acres" />
                <InfoCard label="Available Parking Slots" value="40,689" />
                <InfoCard label="Max Booking Time" value="40,689" />
              </div>
              <div className="grid grid-cols-3 gap-8 mt-6">
                <InfoCard label="Minimum Booking Hours" value="4" />
                <InfoCard label="Maximum Occupancy" value="40,689" />
                <InfoCard label="Amenities" value="40,689" />
              </div>
            </Card>
            
            {/* Field Owner Info */}
            <Card className="p-5 mb-6">
              <h2 className="text-sm text-gray-500 mb-4">Field Owner Info</h2>
              <div className="flex items-center gap-20">
                <div className="flex items-center gap-4">
                  <img 
                    src="https://via.placeholder.com/46" 
                    alt="Owner"
                    className="w-12 h-12 rounded-lg"
                  />
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="text-lg font-semibold">Alex Smith</p>
                  </div>
                </div>
                <InfoCard label="Email" value="alexsmith@gmail.com" />
                <InfoCard label="Contact" value="+1 (212) 555-5555" />
                <InfoCard label="Registered Since" value="1" />
                <InfoCard label="Total Booking Time" value="Active" />
              </div>
            </Card>
            
            {/* Field Images */}
            <Card className="p-5 mb-6">
              <h2 className="text-sm text-gray-500 mb-4">Field Images</h2>
              <ImageGallery images={fieldImages} />
            </Card>
            
            {/* Description */}
            <Card className="p-5 mb-6">
              <h2 className="text-sm text-gray-500 mb-4">Description</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                A peaceful, green field ideal for off-leash play and zoomies. Fully fenced, with drinking water, shaded rest spots, and safe access. 
                Perfect for morning walks or weekend meetups. Show more
              </p>
            </Card>
            
            {/* Community Safety Rules */}
            <Card className="p-5 mb-6">
              <h2 className="text-sm text-gray-500 mb-4">Community safety rules</h2>
              <div className="space-y-4">
                {safetyRules.map((rule, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{rule}</p>
                  </div>
                ))}
              </div>
            </Card>
            
            {/* Booking Policies */}
            <Card className="p-5 mb-6">
              <h2 className="text-sm text-gray-500 mb-4">Booking Policies</h2>
              <div className="space-y-4">
                {bookingPolicies.map((policy, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{policy}</p>
                  </div>
                ))}
              </div>
            </Card>
            
            {/* Earnings History */}
            <Card className="mb-6">
              <div className="p-5 flex justify-between items-center border-b border-gray-200">
                <h2 className="text-lg font-semibold">Earnings History</h2>
                <p className="text-sm text-gray-500">Total Earnings $2,345.00</p>
              </div>
              <Table 
                headers={['', 'Client Name', 'Date/Time', 'Count', 'Time', 'Amount', 'Status']}
                rows={earningsData}
              />
            </Card>
            
            {/* Reviews & Ratings */}
            <Card className="p-5 mb-6">
              <h2 className="text-lg font-semibold mb-4">Over 135 results with an average of 4.5 star reviews</h2>
              
              {/* Rating Overview */}
              <div className="flex gap-8 mb-8">
                <div className="flex flex-col items-center">
                  <p className="text-sm text-gray-500 mb-2">Reviews</p>
                  <p className="text-3xl font-bold">4.5</p>
                  <div className="flex gap-1 my-2">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={16} 
                        className={i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">273 Reviews</p>
                </div>
                
                <div className="flex-1">
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <div key={stars} className="flex items-center gap-3 mb-2">
                      <span className="text-sm text-gray-600 w-12">{stars} Star</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-400"
                          style={{
                            width: stars === 5 ? '100%' : 
                                   stars === 4 ? '80%' : 
                                   stars === 3 ? '60%' : 
                                   stars === 2 ? '40%' : '20%'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Review Cards */}
              <div className="space-y-4">
                {reviews.map((review, index) => (
                  <ReviewCard key={index} {...review} />
                ))}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}