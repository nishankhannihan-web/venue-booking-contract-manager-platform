import React, { useState } from 'react';
import { X, Calendar, Clock, User, Mail, Phone, DollarSign, Check, Building2 } from 'lucide-react';
import { Booking, Client, VenueSettings, VenueSpace } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  settings: VenueSettings;
  preselectedDate?: string;
  onCreateBooking: (newBooking: Omit<Booking, 'id' | 'bookingRef' | 'createdAt' | 'updatedAt' | 'reminders'>) => void;
}

export const NewBookingModal: React.FC<NewBookingModalProps> = ({
  isOpen,
  onClose,
  clients,
  settings,
  preselectedDate,
  onCreateBooking,
}) => {
  if (!isOpen) return null;

  // Selected space (default to first space)
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>(settings.spaces[0]?.id || 'space_daylight');

  // Client Selection / Entry Mode
  const [clientMode, setClientMode] = useState<'existing' | 'new'>('new');
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');

  // New Client Fields
  const [clientName, setClientName] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientCompany, setClientCompany] = useState<string>('');

  // Event Details
  const [eventType, setEventType] = useState<string>('Daylight Photoshoot');
  const [eventDate, setEventDate] = useState<string>(preselectedDate || '2026-10-18');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('15:00');
  const [guestCount, setGuestCount] = useState<number>(15);

  // Pricing
  const [cleaningFee, setCleaningFee] = useState<number>(150);
  const [addOnsAmount, setAddOnsAmount] = useState<number>(50);
  const [depositPercentage, setDepositPercentage] = useState<number>(settings.defaultDepositPercentage || 50);
  const [notes, setNotes] = useState<string>('');

  const selectedSpace = settings.spaces.find((s) => s.id === selectedSpaceId) || settings.spaces[0];

  // Calculate duration in hours
  const calculateDuration = (): number => {
    try {
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      const diffHours = (endMinutes - startMinutes) / 60;
      return diffHours > 0 ? diffHours : 4;
    } catch {
      return 4;
    }
  };

  const durationHours = calculateDuration();
  const rentalBaseAmount = selectedSpace.hourlyRate * durationHours;
  const totalAmount = rentalBaseAmount + Number(cleaningFee) + Number(addOnsAmount);
  const depositAmount = Math.round((totalAmount * (depositPercentage / 100)) * 100) / 100;
  const balanceDue = totalAmount - depositAmount;

  // Handle client selection change
  const handleClientSelectChange = (id: string) => {
    setSelectedClientId(id);
    const existing = clients.find((c) => c.id === id);
    if (existing) {
      setClientName(existing.name);
      setClientEmail(existing.email);
      setClientPhone(existing.phone);
      setClientCompany(existing.company || '');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalClientId = selectedClientId;
    let finalClientName = clientName.trim();
    let finalClientEmail = clientEmail.trim();
    let finalClientPhone = clientPhone.trim();
    let finalClientCompany = clientCompany.trim();

    if (clientMode === 'existing') {
      const ex = clients.find((c) => c.id === selectedClientId);
      if (ex) {
        finalClientId = ex.id;
        finalClientName = ex.name;
        finalClientEmail = ex.email;
        finalClientPhone = ex.phone;
        finalClientCompany = ex.company || '';
      }
    }

    if (!finalClientName || !finalClientEmail || !eventDate) {
      alert('Please enter client name, email, and event date.');
      return;
    }

    onCreateBooking({
      clientId: finalClientId || `cli_${Date.now()}`,
      clientName: finalClientName,
      clientEmail: finalClientEmail,
      clientPhone: finalClientPhone,
      clientCompany: finalClientCompany,
      venueSpaceId: selectedSpace.id,
      venueSpaceName: selectedSpace.name,
      eventType,
      eventDate,
      startTime,
      endTime,
      durationHours,
      guestCount,
      baseRate: selectedSpace.hourlyRate,
      cleaningFee,
      addOnsAmount,
      totalAmount,
      depositPercentage,
      depositAmount,
      balanceDue,
      status: 'pending_deposit',
      paymentStatus: 'unpaid',
      contractStatus: 'sent',
      contractSentAt: new Date().toISOString(),
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-[#7BA4D0]/30 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-[#E7F0FA]/80 border-b border-[#7BA4D0]/20 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#0D2440]">Create New Booking</h3>
            <p className="text-xs text-slate-700">Quickly reserve space, generate contract & deposit link</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-600 hover:text-slate-800 rounded-lg hover:bg-white/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Venue Space Selector Cards */}
          <div>
            <label className="block text-xs font-bold text-[#0D2440] uppercase tracking-wider mb-2">
              1. Select Venue Space / Package
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {settings.spaces.map((space) => {
                const isSelected = selectedSpaceId === space.id;
                return (
                  <button
                    key={space.id}
                    type="button"
                    onClick={() => setSelectedSpaceId(space.id)}
                    className={`p-3 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? 'border-[#2E5E99] bg-[#E7F0FA]/50 ring-2 ring-[#2E5E99]/30'
                        : 'border-slate-200 hover:border-[#7BA4D0] bg-white'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#2E5E99] text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                    <h5 className="text-xs font-bold text-[#0D2440] truncate pr-4">{space.name}</h5>
                    <p className="text-xs font-bold text-[#2E5E99] mt-1 tabular-nums">
                      ${space.hourlyRate}/hr
                    </p>
                    <p className="text-[11px] text-slate-700 mt-0.5">Cap: {space.capacity} guests</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Client Details Section */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#0D2440] uppercase tracking-wider">
                2. Client Contact Information
              </label>
              {clients.length > 0 && (
                <div className="flex items-center text-xs gap-2">
                  <button
                    type="button"
                    onClick={() => setClientMode('new')}
                    className={`px-2 py-0.5 rounded ${
                      clientMode === 'new' ? 'font-bold text-[#2E5E99] bg-[#E7F0FA]' : 'text-slate-700'
                    }`}
                  >
                    + New Client
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => {
                      setClientMode('existing');
                      if (clients[0]) handleClientSelectChange(clients[0].id);
                    }}
                    className={`px-2 py-0.5 rounded ${
                      clientMode === 'existing' ? 'font-bold text-[#2E5E99] bg-[#E7F0FA]' : 'text-slate-700'
                    }`}
                  >
                    Select Past Client
                  </button>
                </div>
              )}
            </div>

            {clientMode === 'existing' ? (
              <div>
                <select
                  value={selectedClientId}
                  onChange={(e) => handleClientSelectChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-[#0D2440] focus:ring-2 focus:ring-[#2E5E99] focus:outline-none"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email}) {c.company ? `— ${c.company}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Client Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#2E5E99] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="sarah@example.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#2E5E99] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="(503) 555-0199"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#2E5E99] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Company / Organization (Optional)
                  </label>
                  <input
                    type="text"
                    value={clientCompany}
                    onChange={(e) => setClientCompany(e.target.value)}
                    placeholder="e.g. Jenkins Studio & Co."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#2E5E99] focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Date & Time Section */}
          <div className="space-y-3 pt-1">
            <label className="block text-xs font-bold text-[#0D2440] uppercase tracking-wider">
              3. Event Schedule & Purpose
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Event Date *
                </label>
                <input
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#2E5E99] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Start Time *
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#2E5E99] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  End Time *
                </label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#2E5E99] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Event Type / Purpose
                </label>
                <input
                  type="text"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  placeholder="e.g. Editorial Fashion Shoot, Wedding Reception"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#2E5E99] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Expected Guest / Crew Count
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedSpace.capacity}
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#2E5E99] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Deposit Breakdown */}
          <div className="bg-[#E7F0FA]/60 rounded-xl p-4 border border-[#7BA4D0]/30 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#0D2440] uppercase tracking-wider">
                4. Pricing & Deposit Calculation
              </label>
              <span className="text-xs font-semibold text-[#2E5E99]">
                {durationHours} Hours Duration
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Cleaning & Prep Fee ($)
                </label>
                <input
                  type="number"
                  min="0"
                  value={cleaningFee}
                  onChange={(e) => setCleaningFee(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Add-Ons / Equipment ($)
                </label>
                <input
                  type="number"
                  min="0"
                  value={addOnsAmount}
                  onChange={(e) => setAddOnsAmount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Deposit Required (%)
                </label>
                <select
                  value={depositPercentage}
                  onChange={(e) => setDepositPercentage(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none"
                >
                  <option value="25">25% Holding Deposit</option>
                  <option value="33">33% Holding Deposit</option>
                  <option value="50">50% Standard Holding Deposit</option>
                  <option value="100">100% Full Payment Upfront</option>
                </select>
              </div>
            </div>

            {/* Calculated summary bar */}
            <div className="pt-2 border-t border-[#7BA4D0]/20 flex items-center justify-between text-xs sm:text-sm">
              <div>
                <span className="text-slate-700">Total Rental: </span>
                <strong className="text-[#0D2440] font-bold tabular-nums">
                  {formatCurrency(totalAmount)}
                </strong>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-700">Deposit Due Today:</span>
                <strong className="text-emerald-700 font-bold tabular-nums text-base">
                  {formatCurrency(depositAmount)}
                </strong>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Internal Venue Notes / Special Requests
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Needs early load-in, requested extra garment racks..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2E5E99] focus:outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 bg-[#2E5E99] hover:bg-[#254b7a] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center"
            >
              <span>Confirm & Generate Booking</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
