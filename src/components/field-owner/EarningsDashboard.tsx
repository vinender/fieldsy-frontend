import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Download,
  Calendar,
  ArrowUp,
  ArrowDown,
  Info
} from 'lucide-react';
import axios from '@/lib/api/axios-client';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useEarningsSummary } from '@/hooks/usePayouts';

interface EarningsData {
  totalEarnings: number;
  pendingPayouts: number;
  completedPayouts: number;
  upcomingPayouts: number;
  todayEarnings: number;
  weekEarnings: number;
  monthEarnings: number;
  yearEarnings: number;
  recentPayouts: any[];
  upcomingEarnings: any[];
  fieldEarnings: any[];
  hasStripeAccount: boolean;
  stripeAccountComplete: boolean;
}

export default function EarningsDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [showPayoutHistory, setShowPayoutHistory] = useState(false);
  
  // Use the same hook as payouts page for total earnings
  const { data: summaryData } = useEarningsSummary('all');

  useEffect(() => {
    fetchEarningsData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchEarningsData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchEarningsData = async () => {
    try {
      const response = await axios.get('/earnings/dashboard');
      setEarnings(response.data.data);
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPeriodEarnings = () => {
    if (!earnings) return 0;
    switch (selectedPeriod) {
      case 'today': return earnings.todayEarnings;
      case 'week': return earnings.weekEarnings;
      case 'month': return earnings.monthEarnings;
      case 'year': return earnings.yearEarnings;
      default: return earnings.monthEarnings;
    }
  };

  const getEarningsChange = () => {
    if (!earnings) return 0;
    // Calculate percentage change (mock data - should come from API)
    return 12.5; // Placeholder
  };

  const exportPayoutHistory = async () => {
    try {
      const response = await axios.get('/earnings/export', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payouts_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting payout history:', error);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-32 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!earnings) {
    return <div>Failed to load earnings data</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stripe Account Alert */}
      {!earnings.hasStripeAccount && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Set up your payment account</h3>
            <p className="text-sm text-gray-600 mb-2">
              Complete your Stripe account setup to receive automatic payouts for your bookings.
            </p>
            <button
              onClick={() => router.push('/field-owner/payouts')}
              className="text-sm font-medium text-yellow-700 hover:text-yellow-800"
            >
              Complete Setup →
            </button>
          </div>
        </div>
      )}

      {!earnings.stripeAccountComplete && earnings.hasStripeAccount && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Complete your payment verification</h3>
            <p className="text-sm text-gray-600 mb-2">
              Your Stripe account needs additional verification to enable payouts.
            </p>
            <button
              onClick={() => router.push('/field-owner/payouts')}
              className="text-sm font-medium text-blue-700 hover:text-blue-800"
            >
              Complete Verification →
            </button>
          </div>
        </div>
      )}

      {/* Main Earnings Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Earnings Card - Using same data as payouts page */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-green-500" />
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Lifetime</span>
          </div>
          <p className="text-2xl font-bold mb-1 text-gray-900">
            {formatCurrency(summaryData?.totalEarnings || earnings?.totalEarnings || 0)}
          </p>
          <p className="text-sm text-gray-600">Total Earnings (Successful Payouts)</p>
        </div>

        {/* Completed Payouts Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Paid</span>
          </div>
          <p className="text-2xl font-bold mb-1 text-gray-900">{formatCurrency(earnings.completedPayouts)}</p>
          <p className="text-sm text-gray-600">Completed Payouts</p>
        </div>

        {/* Pending Payouts Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-yellow-500" />
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Processing</span>
          </div>
          <p className="text-2xl font-bold mb-1 text-gray-900">{formatCurrency(earnings.pendingPayouts)}</p>
          <p className="text-sm text-gray-600">Pending Payouts</p>
        </div>

        {/* Upcoming Payouts Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8 text-blue-500" />
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Scheduled</span>
          </div>
          <p className="text-2xl font-bold mb-1 text-gray-900">{formatCurrency(earnings.upcomingPayouts)}</p>
          <p className="text-sm text-gray-600">Upcoming Payouts</p>
          <p className="text-xs text-gray-500 mt-1">After cancellation window</p>
        </div>
      </div>

      {/* Earnings Trend */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Earnings Trend</h3>
          <div className="flex gap-2">
            {(['today', 'week', 'month', 'year'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  selectedPeriod === period
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(getPeriodEarnings())}</p>
            <div className="flex items-center gap-2 mt-2">
              {getEarningsChange() > 0 ? (
                <ArrowUp className="w-4 h-4 text-green-500" />
              ) : (
                <ArrowDown className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${getEarningsChange() > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(getEarningsChange())}%
              </span>
              <span className="text-sm text-gray-500">vs previous {selectedPeriod}</span>
            </div>
          </div>
          <TrendingUp className="w-24 h-24 text-gray-200" />
        </div>
      </div>

      {/* Upcoming Earnings (Bookings in Cancellation Window) */}
      {earnings.upcomingEarnings.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Earnings</h3>
            <span className="text-sm text-gray-500">Payouts after cancellation window</span>
          </div>
          <div className="space-y-3">
            {earnings.upcomingEarnings.slice(0, 5).map((earning, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{formatCurrency(earning.amount)}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(earning.bookingDate).toLocaleDateString()} at {earning.bookingTime}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-blue-600">
                    {earning.hoursUntilPayout}h until payout
                  </p>
                  <p className="text-xs text-gray-500">
                    Available: {new Date(earning.payoutAvailableAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Payouts */}
      {earnings.recentPayouts.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Payouts</h3>
            <button
              onClick={exportPayoutHistory}
              className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700"
            >
              <Download className="w-4 h-4" />
              Export History
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Date</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Amount</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Bookings</th>
                </tr>
              </thead>
              <tbody>
                {earnings.recentPayouts.map((payout) => (
                  <tr key={payout.id} className="border-b border-gray-100">
                    <td className="py-3 px-2 text-sm text-gray-600">
                      {new Date(payout.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-2 text-sm font-medium text-gray-900">
                      {formatCurrency(payout.amount)}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        payout.status === 'paid' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {payout.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-600">
                      {payout.bookings.length} booking{payout.bookings.length !== 1 ? 's' : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={() => router.push('/field-owner/payouts')}
            className="mt-4 w-full py-2 text-center text-sm font-medium text-green-600 hover:text-green-700"
          >
            View All Payouts →
          </button>
        </div>
      )}

      {/* Field Performance */}
      {earnings.fieldEarnings.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Field Performance</h3>
          <div className="space-y-3">
            {earnings.fieldEarnings.map((field) => (
              <div key={field.fieldId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{field.fieldName}</p>
                  <p className="text-sm text-gray-600">{field.totalBookings} bookings</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(field.totalEarnings)}</p>
                  <p className="text-sm text-gray-500">Avg: {formatCurrency(field.averageEarning)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}