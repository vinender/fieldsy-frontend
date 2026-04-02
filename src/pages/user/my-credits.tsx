import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { UserLayout } from '@/components/layout/UserLayout';
import BackButton from '@/components/common/BackButton';
import { MapPin, Clock, Calendar, Gift, AlertCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface SlotCredit {
  id: string;
  totalSlots: number;
  usedSlots: number;
  remainingSlots: number;
  expiresAt: string;
  status: string;
  createdAt: string;
  offer: {
    id: string;
    purchaseSlots: number;
    freeSlots: number;
    validity: string;
    field: {
      id: string;
      name: string;
      fieldId: string;
    };
  };
}

export default function MyCreditsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [credits, setCredits] = useState<SlotCredit[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'used' | 'expired'>('active');

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const token = (session as any)?.accessToken || localStorage.getItem('authToken');
        if (!token) return;

        const res = await fetch(`${API_URL}/offers/my-credits`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setCredits(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch credits:', err);
      } finally {
        setLoading(false);
      }
    };

    if (session) fetchCredits();
  }, [session]);

  const activeCredits = credits.filter(c => c.status === 'active' && c.remainingSlots > 0);
  const usedCredits = credits.filter(c => c.status === 'exhausted' || (c.status === 'active' && c.remainingSlots === 0));
  const expiredCredits = credits.filter(c => c.status === 'expired');

  const displayCredits = activeTab === 'active' ? activeCredits
    : activeTab === 'used' ? usedCredits
    : expiredCredits;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Europe/London'
    });
  };

  const getDaysLeft = (expiresAt: string) => {
    // Use UK timezone for consistent calculation
    const nowUK = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/London' }));
    const expiryUK = new Date(new Date(expiresAt).toLocaleString('en-US', { timeZone: 'Europe/London' }));
    const diff = expiryUK.getTime() - nowUK.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  const getProgressPercent = (used: number, total: number) => {
    return total > 0 ? Math.round((used / total) * 100) : 0;
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FFFCF3]">
          <div className="animate-spin h-8 w-8 border-4 border-[#3A6B22] border-t-transparent rounded-full" />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="min-h-screen bg-[#FFFCF3] mt-32">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <BackButton />

          <div className="flex items-center justify-between mt-6 mb-2">
            <h1 className="text-2xl font-bold text-[#192215]">My Slot Credits</h1>
            <div className="flex items-center gap-2 bg-[#3A6B22]/10 px-4 py-2 rounded-full">
              <Gift className="w-4 h-4 text-[#3A6B22]" />
              <span className="text-sm font-semibold text-[#3A6B22]">
                {activeCredits.reduce((sum, c) => sum + c.remainingSlots, 0)} slots available
              </span>
            </div>
          </div>
          <p className="text-sm text-[#6D6D6D] mb-6">
            Use your purchased slot credits to book fields without paying each time
          </p>

          {/* Tabs */}
          <div className="flex gap-1 bg-white rounded-xl p-1 border border-black/6 mb-6 w-fit">
            {[
              { key: 'active', label: 'Active', count: activeCredits.length },
              { key: 'used', label: 'Used', count: usedCredits.length },
              { key: 'expired', label: 'Expired', count: expiredCredits.length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-[#3A6B22] text-white shadow-sm'
                    : 'text-[#6D6D6D] hover:text-[#192215]'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Credits List */}
          {displayCredits.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-black/6">
              <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-[#6D6D6D] font-medium">
                {activeTab === 'active'
                  ? 'No active slot credits'
                  : activeTab === 'used'
                  ? 'No used credits yet'
                  : 'No expired credits'}
              </p>
              {activeTab === 'active' && (
                <button
                  onClick={() => router.push('/fields')}
                  className="mt-4 px-6 py-2.5 bg-[#3A6B22] text-white text-sm font-semibold rounded-full hover:bg-[#2e5519] transition-colors"
                >
                  Browse Fields
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {displayCredits.map((credit) => {
                const daysLeft = getDaysLeft(credit.expiresAt);
                const progress = getProgressPercent(credit.usedSlots, credit.totalSlots);
                const isExpired = credit.status === 'expired';
                const isExhausted = credit.remainingSlots === 0;

                return (
                  <div
                    key={credit.id}
                    className={`bg-white rounded-2xl border p-5 transition-all ${
                      isExpired || isExhausted
                        ? 'border-black/6 opacity-70'
                        : 'border-black/8 hover:shadow-md'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Left — Field Info & Progress */}
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isExpired ? 'bg-gray-100' : 'bg-[#3A6B22]/10'
                          }`}>
                            <Gift className={`w-5 h-5 ${isExpired ? 'text-gray-400' : 'text-[#3A6B22]'}`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-[#192215] text-base">
                              {credit.offer.field.name}
                            </h3>
                            <p className="text-xs text-[#6D6D6D] mt-0.5">
                              {credit.offer.purchaseSlots} purchased + {credit.offer.freeSlots} free slots
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-[#6D6D6D]">
                              {credit.usedSlots} of {credit.totalSlots} slots used
                            </span>
                            <span className={`font-medium ${
                              isExpired ? 'text-gray-400' : credit.remainingSlots <= 1 ? 'text-amber-600' : 'text-[#3A6B22]'
                            }`}>
                              {credit.remainingSlots} remaining
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isExpired ? 'bg-gray-300' : 'bg-[#3A6B22]'
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Meta Info */}
                        <div className="flex flex-wrap gap-3 text-xs text-[#6D6D6D]">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Purchased {formatDate(credit.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {isExpired
                              ? `Expired ${formatDate(credit.expiresAt)}`
                              : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`
                            }
                          </span>
                          <span className="flex items-center gap-1 text-[#6D6D6D]">
                            Expires: {formatDate(credit.expiresAt)}
                          </span>
                        </div>
                      </div>

                      {/* Right — Status & Action */}
                      <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3">
                        {/* Status Badge */}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          isExpired
                            ? 'bg-gray-100 text-gray-500'
                            : isExhausted
                            ? 'bg-amber-50 text-amber-600 border border-amber-200'
                            : daysLeft <= 3
                            ? 'bg-amber-50 text-amber-600 border border-amber-200'
                            : 'bg-[#3A6B22]/10 text-[#3A6B22]'
                        }`}>
                          {isExpired
                            ? 'Expired'
                            : isExhausted
                            ? 'All Used'
                            : daysLeft <= 3
                            ? `${daysLeft}d left`
                            : 'Active'
                          }
                        </span>

                        {/* Book Now Button */}
                        {!isExpired && !isExhausted && (
                          <button
                            onClick={() => router.push(`/fields/book-field?id=${credit.offer.field.fieldId}`)}
                            className="px-5 py-2 bg-[#3A6B22] text-white text-xs font-semibold rounded-full hover:bg-[#2e5519] transition-colors"
                          >
                            Book Now
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expiry Warning */}
                    {!isExpired && !isExhausted && daysLeft <= 3 && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-black/6">
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                        <p className="text-xs text-amber-600">
                          This credit expires soon. Use your remaining {credit.remainingSlots} slot{credit.remainingSlots > 1 ? 's' : ''} before {formatDate(credit.expiresAt)}.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
