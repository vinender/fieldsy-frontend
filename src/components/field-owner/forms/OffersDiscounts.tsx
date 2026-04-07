import React, { useState, useMemo } from 'react';
import { X, Plus, Clock, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface Offer {
  id: string;
  purchaseSlots: string;
  freeSlots: string;
  validity: '1 Week' | '1 Month';
  enabled: boolean;
}

interface Discount {
  id: string;
  value: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  enabled: boolean;
}

interface OffersDiscountsProps {
  formData: any;
  setFormData: (updater: any) => void;
  validationErrors?: Record<string, string>;
  onSkip?: () => void;
  fieldId?: string | null;
}

function formatDiscountValidity(d: Discount) {
  const fmtDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  const fmtTime = (timeStr: string) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
  };
  return `Validity: ${fmtDate(d.startDate)}, ${fmtTime(d.startTime)} - ${fmtDate(d.endDate)}, ${fmtTime(d.endTime)}`;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function OffersDiscounts({ formData, setFormData, validationErrors = {}, onSkip, fieldId }: OffersDiscountsProps) {
  const [activeTab, setActiveTab] = useState<'offers' | 'discounts'>('offers');

  // Offers state
  const [showAddOfferForm, setShowAddOfferForm] = useState(!formData.offers?.length);
  const [newOffer, setNewOffer] = useState<Omit<Offer, 'id' | 'enabled'>>({
    purchaseSlots: '',
    freeSlots: '',
    validity: '1 Week',
  });

  // Discounts state
  const [showAddDiscountForm, setShowAddDiscountForm] = useState(!formData.discounts?.length);
  const [newDiscount, setNewDiscount] = useState({
    value: '',
    startTime: '',
    endTime: '',
  });
  const [discountError, setDiscountError] = useState('');
  // Multi-date selection for new discounts
  const [selectedDates, setSelectedDates] = useState<string[]>([]); // YYYY-MM-DD strings
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const offers: Offer[] = formData.offers || [];
  const discounts: Discount[] = formData.discounts || [];

  // Field operating hours — discount times must fall within this window
  const fieldStartTime: string = formData.startTime || '';
  const fieldEndTime: string = formData.endTime || '';

  const formatTimeLabel = (t: string) => {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    if (isNaN(h)) return t;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hr = h % 12 || 12;
    return `${hr}:${(m || 0).toString().padStart(2, '0')} ${ampm}`;
  };

  // --- Offers handlers ---
  const updateOffers = (updatedOffers: Offer[]) => {
    setFormData((prev: any) => ({ ...prev, offers: updatedOffers }));
  };

  const getAuthToken = () => {
    if (typeof window !== 'undefined') return localStorage.getItem('authToken');
    return null;
  };

  const handleAddOffer = async () => {
    if (!newOffer.purchaseSlots || !newOffer.freeSlots) return;

    if (fieldId) {
      try {
        const token = getAuthToken();
        const res = await fetch(`${API_URL}/offers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            fieldId,
            purchaseSlots: parseInt(newOffer.purchaseSlots),
            freeSlots: parseInt(newOffer.freeSlots),
            validity: newOffer.validity,
          }),
        });
        const data = await res.json();
        if (data.success) {
          updateOffers([...offers, { ...data.data, purchaseSlots: String(data.data.purchaseSlots), freeSlots: String(data.data.freeSlots) }]);
          setNewOffer({ purchaseSlots: '', freeSlots: '', validity: '1 Week' });
          return;
        } else {
          console.error('[OffersDiscounts] Failed to create offer:', data.message);
        }
      } catch (err) {
        console.error('[OffersDiscounts] Error creating offer:', err);
      }
    } else {
      console.warn('[OffersDiscounts] No fieldId available, saving offer locally only');
    }

    const offer: Offer = { id: Date.now().toString(), ...newOffer, enabled: true };
    updateOffers([...offers, offer]);
    setNewOffer({ purchaseSlots: '', freeSlots: '', validity: '1 Week' });
  };

  const handleToggleOffer = async (id: string) => {
    if (fieldId) {
      try {
        const token = getAuthToken();
        await fetch(`${API_URL}/offers/${id}/toggle`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}` },
        });
      } catch { /* continue with local update */ }
    }
    updateOffers(offers.map((o) => (o.id === id ? { ...o, enabled: !o.enabled } : o)));
  };

  const handleRemoveOffer = async (id: string) => {
    if (fieldId) {
      try {
        const token = getAuthToken();
        await fetch(`${API_URL}/offers/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });
      } catch { /* continue with local removal */ }
    }
    updateOffers(offers.filter((o) => o.id !== id));
  };

  // --- Discounts handlers ---
  const updateDiscounts = (updatedDiscounts: Discount[]) => {
    setFormData((prev: any) => ({ ...prev, discounts: updatedDiscounts }));
  };

  // Validate one (date, time-range) pair against value rules and existing discounts
  const validateDiscountForDate = (
    dateStr: string,
    nd: { value: string; startTime: string; endTime: string }
  ): string | null => {
    const newStart = new Date(`${dateStr}T${nd.startTime}`);
    const newEnd = new Date(`${dateStr}T${nd.endTime}`);

    if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
      return 'Invalid date or time format.';
    }

    const now = new Date();
    if (newStart < now) {
      return `Start time for ${dateStr} cannot be in the past.`;
    }

    if (newEnd <= newStart) {
      return 'End time must be after start time.';
    }

    const val = parseInt(nd.value);
    if (isNaN(val) || val <= 0 || val > 100) {
      return 'Discount value must be between 1 and 100. Zero is not allowed.';
    }

    // Discount time window must fall within the field's operating hours
    if (fieldStartTime && fieldEndTime) {
      const toMin = (t: string) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + (m || 0);
      };
      const fStart = toMin(fieldStartTime);
      const fEnd = toMin(fieldEndTime);
      const dStart = toMin(nd.startTime);
      const dEnd = toMin(nd.endTime);
      if (dStart < fStart || dEnd > fEnd) {
        return `Discount time must be between the field's operating hours (${formatTimeLabel(fieldStartTime)} – ${formatTimeLabel(fieldEndTime)}).`;
      }
    }

    for (const existing of discounts) {
      if (!existing.enabled) continue;
      const exStart = new Date(`${existing.startDate.split('T')[0]}T${existing.startTime}`);
      const exEnd = new Date(`${existing.endDate.split('T')[0]}T${existing.endTime}`);

      // Two ranges overlap if one starts before the other ends AND vice versa
      if (newStart < exEnd && newEnd > exStart) {
        return `Discount on ${dateStr} overlaps with an existing ${existing.value}% discount (${formatDiscountValidity(existing)}).`;
      }
    }

    return null;
  };

  const handleAddDiscount = async () => {
    if (!newDiscount.value || !newDiscount.startTime || !newDiscount.endTime) return;
    if (selectedDates.length === 0) {
      setDiscountError('Please select at least one date from the calendar.');
      return;
    }

    // Validate every selected date before saving any
    for (const d of selectedDates) {
      const err = validateDiscountForDate(d, newDiscount);
      if (err) {
        setDiscountError(err);
        return;
      }
    }
    setDiscountError('');

    const createdDiscounts: Discount[] = [];

    for (const dateStr of selectedDates) {
      if (fieldId) {
        try {
          const token = getAuthToken();
          const res = await fetch(`${API_URL}/discounts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
              fieldId,
              value: parseInt(newDiscount.value),
              startDate: dateStr,
              startTime: newDiscount.startTime,
              endDate: dateStr,
              endTime: newDiscount.endTime,
            }),
          });
          const data = await res.json();
          if (data.success) {
            createdDiscounts.push({ ...data.data, value: String(data.data.value) });
            continue;
          } else {
            setDiscountError(data.message || `Failed to create discount for ${dateStr}.`);
            // Still commit the ones already created so the user doesn't lose progress
            if (createdDiscounts.length > 0) updateDiscounts([...discounts, ...createdDiscounts]);
            return;
          }
        } catch (err) {
          console.error('[OffersDiscounts] Error creating discount:', err);
          setDiscountError(`Failed to create discount for ${dateStr}. Please try again.`);
          if (createdDiscounts.length > 0) updateDiscounts([...discounts, ...createdDiscounts]);
          return;
        }
      } else {
        // Local-only fallback
        createdDiscounts.push({
          id: `${Date.now()}-${dateStr}`,
          value: newDiscount.value,
          startDate: dateStr,
          startTime: newDiscount.startTime,
          endDate: dateStr,
          endTime: newDiscount.endTime,
          enabled: true,
        });
      }
    }

    if (createdDiscounts.length > 0) {
      updateDiscounts([...discounts, ...createdDiscounts]);
    }
    setNewDiscount({ value: '', startTime: '', endTime: '' });
    setSelectedDates([]);
    setDiscountError('');
  };

  const handleToggleDiscount = async (id: string) => {
    if (fieldId) {
      try {
        const token = getAuthToken();
        await fetch(`${API_URL}/discounts/${id}/toggle`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}` },
        });
      } catch { /* continue with local update */ }
    }
    updateDiscounts(discounts.map((d) => (d.id === id ? { ...d, enabled: !d.enabled } : d)));
  };

  // --- Calendar helpers (Mon-first weeks) ---
  const toIsoDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const calendarGrid = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    // Mon=0..Sun=6
    const offset = (firstOfMonth.getDay() + 6) % 7;
    const start = new Date(year, month, 1 - offset);
    // 6 weeks * 7 days = 42 cells
    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      days.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
    }
    return days;
  }, [calendarMonth]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Map of YYYY-MM-DD -> max enabled discount % for badges on the calendar
  const discountByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of discounts) {
      if (!d.enabled) continue;
      const key = (d.startDate || '').split('T')[0];
      if (!key) continue;
      const val = parseInt(String(d.value));
      if (isNaN(val)) continue;
      const existing = map.get(key);
      if (existing === undefined || val > existing) map.set(key, val);
    }
    return map;
  }, [discounts]);

  const toggleDateSelection = (dateStr: string) => {
    setSelectedDates((prev) =>
      prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr]
    );
  };

  const goPrevMonth = () =>
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
  const goNextMonth = () =>
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));

  const monthLabel = calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const weekDayLabels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const handleRemoveDiscount = async (id: string) => {
    if (fieldId) {
      try {
        const token = getAuthToken();
        await fetch(`${API_URL}/discounts/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });
      } catch { /* continue with local removal */ }
    }
    updateDiscounts(discounts.filter((d) => d.id !== id));
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <div className="flex items-start justify-between w-full">
        <div>
          <h2 className="text-lg font-bold text-dark-green mb-1">
            Set Offers & Discounts
          </h2>
          <p className="text-sm text-[#6D6D6D]">
            Create and manage special deals to attract more bookings and boost sales
          </p>
        </div>
        {onSkip && (
          <button
            onClick={onSkip}
            className="text-[15px] font-semibold text-[#3A6B22] hover:text-[#2e5519] transition-colors whitespace-nowrap"
          >
            Skip
          </button>
        )}
      </div>

      {/* Offers / Discounts Toggle */}
      <div className="bg-[#F8F1D7] border border-[rgba(0,0,0,0.03)] rounded-[50px] p-1.5 inline-flex w-fit">
        <button
          onClick={() => setActiveTab('offers')}
          className={`px-4 py-2.5 rounded-[30px] text-sm font-bold transition-colors ${
            activeTab === 'offers'
              ? 'bg-[#8FB366] text-white'
              : 'text-[#192215]'
          }`}
        >
          Offers
        </button>
        <button
          onClick={() => setActiveTab('discounts')}
          className={`px-4 py-2.5 rounded-[30px] text-sm font-bold transition-colors ${
            activeTab === 'discounts'
              ? 'bg-[#8FB366] text-white'
              : 'text-[#192215]'
          }`}
        >
          Discounts
        </button>
      </div>

      {/* ==================== OFFERS TAB ==================== */}
      {activeTab === 'offers' && (
        <div className="flex flex-col gap-6">
          {/* Existing Offers List */}
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-[rgba(143,179,102,0.1)] border border-[#8FB366] rounded-xl shadow-[0px_0px_4px_0px_rgba(0,0,0,0.1)] p-4 flex items-center gap-4"
            >
              <div className="flex-1">
                <p className="text-lg font-semibold text-[#192215]">
                  {offer.purchaseSlots} Slots + {offer.freeSlots} FREE Slot{parseInt(offer.freeSlots) > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-[#6D6D6D]">{offer.validity}</p>
              </div>
              <button
                onClick={() => handleToggleOffer(offer.id)}
                className={`w-10 h-6 rounded-full relative transition-colors ${
                  offer.enabled ? 'bg-[#3A6B22]' : 'bg-gray-300'
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform shadow ${offer.enabled ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
              <button
                onClick={() => handleRemoveOffer(offer.id)}
                className="w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          ))}

          {/* Add Offer Form */}
          {showAddOfferForm && (
            <div className="bg-white border border-[#E3E3E3] rounded-xl shadow-[0px_0px_4px_0px_rgba(0,0,0,0.1)] p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-[#323232]">Add Offer</h3>
                <button onClick={() => setShowAddOfferForm(false)} className="w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center">
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-2.5">
                    <label className="text-[15px] font-medium text-[#192215]">Purchase Slots</label>
                    <input
                      type="number"
                      min="1"
                      value={newOffer.purchaseSlots}
                      onChange={(e) => setNewOffer({ ...newOffer, purchaseSlots: e.target.value })}
                      placeholder="Number of slots user needs to buy"
                      className="h-14 bg-white border border-[#E3E3E3] rounded-[76px] px-4 py-2 text-[15px] font-medium text-[#192215] placeholder:text-[#8D8D8D] focus:outline-none focus:border-[#3A6B22]"
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-2.5">
                    <label className="text-[15px] font-medium text-[#192215]">Free Slots</label>
                    <input
                      type="number"
                      min="1"
                      value={newOffer.freeSlots}
                      onChange={(e) => setNewOffer({ ...newOffer, freeSlots: e.target.value })}
                      placeholder="Number of bonus slots given"
                      className="h-14 bg-white border border-[#E3E3E3] rounded-[76px] px-4 py-2 text-[15px] font-medium text-[#192215] placeholder:text-[#8D8D8D] focus:outline-none focus:border-[#3A6B22]"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2.5">
                  <label className="text-[15px] font-medium text-[#192215]">Offer Validity</label>
                  <div className="flex gap-3 w-[376px]">
                    <button
                      onClick={() => setNewOffer({ ...newOffer, validity: '1 Week' })}
                      className={`flex-1 h-14 rounded-[76px] px-4 text-[15px] font-medium transition-colors ${
                        newOffer.validity === '1 Week'
                          ? 'bg-[#8FB366] text-white'
                          : 'bg-white border border-[#E3E3E3] text-[#8D8D8D]'
                      }`}
                    >
                      1 Week
                    </button>
                    <button
                      onClick={() => setNewOffer({ ...newOffer, validity: '1 Month' })}
                      className={`flex-1 h-14 rounded-[76px] px-4 text-[15px] font-medium transition-colors ${
                        newOffer.validity === '1 Month'
                          ? 'bg-[#8FB366] text-white'
                          : 'bg-white border border-[#E3E3E3] text-[#8D8D8D]'
                      }`}
                    >
                      1 Month
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleAddOffer}
                  disabled={!newOffer.purchaseSlots || !newOffer.freeSlots}
                  className="bg-[#3A6B22] text-white text-base font-semibold h-14 w-[202px] rounded-[50px] hover:bg-[#2e5519] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {/* Add More Button */}
          <button
            onClick={() => setShowAddOfferForm(true)}
            className="flex items-center gap-2 text-[#3A6B22] font-bold text-[15px] hover:opacity-80"
          >
            <Plus className="w-6 h-6" />
            <span>Add More</span>
          </button>
        </div>
      )}

      {/* ==================== DISCOUNTS TAB ==================== */}
      {activeTab === 'discounts' && (
        <div className="flex flex-col gap-6">
          {/* Existing Discounts List */}
          {discounts.map((discount) => (
            <div
              key={discount.id}
              className="bg-[rgba(143,179,102,0.1)] border border-[#8FB366] rounded-xl shadow-[0px_0px_4px_0px_rgba(0,0,0,0.1)] p-4 flex items-center gap-4"
            >
              <div className="flex-1">
                <p className="text-lg font-semibold text-[#192215]">
                  {discount.value}% Off
                </p>
                <p className="text-sm text-[#6D6D6D]">
                  {formatDiscountValidity(discount)}
                </p>
              </div>
              <button
                onClick={() => handleToggleDiscount(discount.id)}
                className={`w-10 h-6 rounded-full relative transition-colors ${
                  discount.enabled ? 'bg-[#3A6B22]' : 'bg-gray-300'
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform shadow ${discount.enabled ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
              <button
                onClick={() => handleRemoveDiscount(discount.id)}
                className="w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          ))}

          {/* Choose Date Calendar (multi-select) */}
          <div className="flex flex-col gap-2 w-full">
            <label className="text-[15px] font-semibold text-[#192215]">Choose Date</label>
            <div className="bg-white border border-[#E3E3E3] rounded-xl p-3 flex flex-col gap-1.5 w-full">
              {/* Month header */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={goPrevMonth}
                  className="w-6 h-6 flex items-center justify-center text-[#192215] hover:bg-gray-100 rounded-full"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <p className="text-[13px] font-bold text-[#192215]">{monthLabel}</p>
                <button
                  type="button"
                  onClick={goNextMonth}
                  className="w-6 h-6 flex items-center justify-center text-[#192215] hover:bg-gray-100 rounded-full"
                  aria-label="Next month"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="border-t border-gray-200" />

              {/* Day labels */}
              <div className="grid grid-cols-7 gap-0.5">
                {weekDayLabels.map((d) => (
                  <div
                    key={d}
                    className="text-center text-[11px] text-[#8A8A8C] opacity-60"
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-5">
                {calendarGrid.map((d, idx) => {
                  const iso = toIsoDate(d);
                  const inMonth = d.getMonth() === calendarMonth.getMonth();
                  const isPast = d < today;
                  const isSelected = selectedDates.includes(iso);
                  const existingPct = discountByDate.get(iso);
                  const disabled = !inMonth || isPast;

                  return (
                    <div
                      key={idx}
                      className="h-8 flex items-center justify-center"
                    >
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => toggleDateSelection(iso)}
                        className={`relative w-12 h-12 flex flex-col items-center justify-center rounded-full text-[12px] transition-colors ${
                          isSelected
                            ? 'bg-[#3A6B22] text-white font-bold'
                            : disabled
                            ? 'text-[#8A8A8C] opacity-50 cursor-not-allowed'
                            : 'text-[#292A2E] hover:bg-gray-100'
                        }`}
                      >
                        <span>{d.getDate()}</span>
                        {existingPct !== undefined && !isSelected && (
                          <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 bg-[#F8F1D7] border border-[#FFBD00] text-[#3A6B22] text-[6px] font-bold rounded-[2px] px-0.5 leading-none py-px whitespace-nowrap">
                            {existingPct}% Off
                          </span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            {selectedDates.length > 0 && (
              <p className="text-[11px] text-[#6D6D6D]">
                {selectedDates.length} date{selectedDates.length > 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          {/* Add Discount Form */}
          {showAddDiscountForm && (
            <div className="bg-white border border-[#E3E3E3] rounded-xl shadow-[0px_0px_4px_0px_rgba(0,0,0,0.1)] p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-[#323232]">Add Discount</h3>
                <button onClick={() => setShowAddDiscountForm(false)} className="w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center">
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>

              {/* Discount Value + Start Time + End Time */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[15px] font-medium text-[#192215]">Discount Value (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="1"
                    value={newDiscount.value}
                    onChange={(e) => {
                      const raw = e.target.value;
                      // Allow empty (so user can clear and retype)
                      if (raw === '') {
                        setNewDiscount({ ...newDiscount, value: '' });
                        return;
                      }
                      const num = parseInt(raw, 10);
                      // Reject 0, negatives, and >100; clamp to 1..100
                      if (isNaN(num) || num < 1) return;
                      if (num > 100) {
                        setNewDiscount({ ...newDiscount, value: '100' });
                        return;
                      }
                      setNewDiscount({ ...newDiscount, value: String(num) });
                    }}
                    onKeyDown={(e) => {
                      // Block typing characters that would produce a non-positive value
                      if (['-', '+', 'e', 'E', '.'].includes(e.key)) e.preventDefault();
                    }}
                    placeholder="Enter discount value (1-100)"
                    className="h-14 bg-white border border-[#E3E3E3] rounded-[76px] px-4 py-2 text-[15px] font-medium text-[#192215] placeholder:text-[#8D8D8D] focus:outline-none focus:border-[#3A6B22]"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[15px] font-medium text-[#192215]">Start Time</label>
                  <div className="relative">
                    <input
                      type="time"
                      value={newDiscount.startTime}
                      min={fieldStartTime || undefined}
                      max={fieldEndTime || undefined}
                      onChange={(e) => setNewDiscount({ ...newDiscount, startTime: e.target.value })}
                      className="h-14 w-full bg-white border border-[#E3E3E3] rounded-[76px] px-4 py-2 text-[15px] font-medium text-[#192215] placeholder:text-[#8D8D8D] focus:outline-none focus:border-[#3A6B22] appearance-none"
                    />
                    <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8D8D8D] pointer-events-none" />
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[15px] font-medium text-[#192215]">End Time</label>
                  <div className="relative">
                    <input
                      type="time"
                      value={newDiscount.endTime}
                      min={fieldStartTime || undefined}
                      max={fieldEndTime || undefined}
                      onChange={(e) => setNewDiscount({ ...newDiscount, endTime: e.target.value })}
                      className="h-14 w-full bg-white border border-[#E3E3E3] rounded-[76px] px-4 py-2 text-[15px] font-medium text-[#192215] placeholder:text-[#8D8D8D] focus:outline-none focus:border-[#3A6B22] appearance-none"
                    />
                    <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8D8D8D] pointer-events-none" />
                  </div>
                </div>
              </div>

              {fieldStartTime && fieldEndTime && (
                <p className="text-xs text-[#6D6D6D]">
                  Discount times must fall within the field's operating hours: {formatTimeLabel(fieldStartTime)} – {formatTimeLabel(fieldEndTime)}.
                </p>
              )}

              {/* Validation Error */}
              {discountError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{discountError}</p>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleAddDiscount}
                  disabled={!newDiscount.value || !newDiscount.startTime || !newDiscount.endTime || selectedDates.length === 0}
                  className="bg-[#3A6B22] text-white text-base font-semibold h-14 w-[202px] rounded-[50px] hover:bg-[#2e5519] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {/* Add More Button */}
          <button
            onClick={() => setShowAddDiscountForm(true)}
            className="flex items-center gap-2 text-[#3A6B22] font-bold text-[15px] hover:opacity-80"
          >
            <Plus className="w-6 h-6" />
            <span>Add More</span>
          </button>
        </div>
      )}
    </div>
  );
}
