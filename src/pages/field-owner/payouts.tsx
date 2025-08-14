import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { UserLayout } from '@/components/layout/UserLayout';
import { ArrowLeft, DollarSign, Calendar, Download, Filter, ChevronDown } from 'lucide-react';

interface Payout {
  id: string;
  amount: number;
  status: 'completed' | 'pending' | 'processing';
  date: string;
  method: string;
  reference: string;
  bookingsCount: number;
}

export default function PayoutHistory() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<'all' | 'completed' | 'pending'>('all');
  
  // Mock data - replace with API call
  const mockPayouts: Payout[] = [
    {
      id: '1',
      amount: 1250.00,
      status: 'completed',
      date: '2025-01-10',
      method: 'Bank Transfer',
      reference: 'PAY-2025-001',
      bookingsCount: 15
    },
    {
      id: '2',
      amount: 850.00,
      status: 'processing',
      date: '2025-01-15',
      method: 'Bank Transfer',
      reference: 'PAY-2025-002',
      bookingsCount: 10
    },
    {
      id: '3',
      amount: 2100.00,
      status: 'completed',
      date: '2024-12-28',
      method: 'Bank Transfer',
      reference: 'PAY-2024-089',
      bookingsCount: 25
    }
  ];

  const filteredPayouts = activeFilter === 'all' 
    ? mockPayouts 
    : mockPayouts.filter(p => p.status === activeFilter);

  const totalEarnings = mockPayouts
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = mockPayouts
    .filter(p => p.status === 'pending' || p.status === 'processing')
    .reduce((sum, p) => sum + p.amount, 0);

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-700 border-green-200',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      processing: 'bg-blue-100 text-blue-700 border-blue-200'
    };
    
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <UserLayout requireRole="FIELD_OWNER">
      <div className="min-h-screen bg-light pt-32 pb-20">
        <div className="container mx-auto px-20">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.back()}
                className="w-12 h-12 bg-cream rounded-full flex items-center justify-center hover:bg-cream/80 transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-dark-green" />
              </button>
              <h1 className="text-3xl font-semibold text-dark-green font-sans">Payout History</h1>
            </div>
            <button className="px-6 py-2.5 bg-green text-white rounded-full font-medium hover:bg-green/90 transition-colors font-sans flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green/10 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green" />
                </div>
                <p className="text-gray-text font-sans">Total Earnings</p>
              </div>
              <p className="text-3xl font-bold text-dark-green font-sans">
                £{totalEarnings.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-yellow-600" />
                </div>
                <p className="text-gray-text font-sans">Pending Payouts</p>
              </div>
              <p className="text-3xl font-bold text-dark-green font-sans">
                £{pendingAmount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-gray-text font-sans">Next Payout</p>
              </div>
              <p className="text-3xl font-bold text-dark-green font-sans">15 Jan</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-6 py-2.5 rounded-full font-medium transition-all font-sans ${
                activeFilter === 'all'
                  ? 'bg-green text-white'
                  : 'bg-cream text-dark-green hover:bg-cream/80'
              }`}
            >
              All Payouts
            </button>
            <button
              onClick={() => setActiveFilter('completed')}
              className={`px-6 py-2.5 rounded-full font-medium transition-all font-sans ${
                activeFilter === 'completed'
                  ? 'bg-green text-white'
                  : 'bg-cream text-dark-green hover:bg-cream/80'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setActiveFilter('pending')}
              className={`px-6 py-2.5 rounded-full font-medium transition-all font-sans ${
                activeFilter === 'pending'
                  ? 'bg-green text-white'
                  : 'bg-cream text-dark-green hover:bg-cream/80'
              }`}
            >
              Pending
            </button>
          </div>

          {/* Payouts List */}
          <div className="bg-white rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-text">Reference</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-text">Date</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-text">Bookings</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-text">Amount</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-text">Method</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-text">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-text">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayouts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-text">
                      No payouts found
                    </td>
                  </tr>
                ) : (
                  filteredPayouts.map((payout) => (
                    <tr key={payout.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-dark-green">
                        {payout.reference}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-text">
                        {new Date(payout.date).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-text">
                        {payout.bookingsCount} bookings
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-dark-green">
                        £{payout.amount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-text">
                        {payout.method}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(payout.status)}
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-green font-medium hover:underline text-sm">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination (if needed) */}
          {filteredPayouts.length > 0 && (
            <div className="mt-6 flex justify-center">
              <p className="text-sm text-gray-text">
                Showing 1-{filteredPayouts.length} of {filteredPayouts.length} payouts
              </p>
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}