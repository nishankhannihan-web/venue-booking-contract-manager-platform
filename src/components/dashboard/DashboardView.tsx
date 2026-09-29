import React from 'react';
import {
  AlertCircle,
  CalendarCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  FileCheck,
  FileText,
  Link,
  Plus,
  Send,
  Users,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';
import { Booking, VenueSettings } from '../../types';
import { formatCurrency, formatDate, formatTime, getStatusBadgeConfig } from '../../utils/formatters';

interface DashboardViewProps {
  bookings: Booking[];
  settings: VenueSettings;
  onSelectBooking: (booking: Booking) => void;
  onOpenNewBooking: () => void;
  onOpenPaymentModal: (booking: Booking) => void;
  onOpenSignModal: (booking: Booking) => void;
  onCopyPaymentLink: (booking: Booking) => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  bookings,
  settings,
  onSelectBooking,
  onOpenNewBooking,
  onOpenPaymentModal,
  onOpenSignModal,
  onCopyPaymentLink,
  onNavigateTab,
}) => {
  // Compute Key Stats
  const activeBookings = bookings.filter((b) => b.status !== 'cancelled');
  const thisMonthBookings = activeBookings.filter((b) => {
    // Current simulated date is Sep 2026 / Oct 2026
    return b.eventDate.startsWith('2026-09') || b.eventDate.startsWith('2026-10');
  });

  const totalRevenueSecured = activeBookings.reduce((sum, b) => {
    if (b.paymentStatus === 'deposit_paid' || b.paymentStatus === 'paid_in_full') {
      return sum + b.depositAmount;
    }
    return sum;
  }, 0);

  const pendingDeposits = activeBookings.filter(
    (b) => b.status === 'pending_deposit' || b.paymentStatus === 'unpaid'
  );

  const pendingDepositsAmount = pendingDeposits.reduce((sum, b) => sum + b.depositAmount, 0);

  const unsignedContracts = activeBookings.filter(
    (b) => b.contractStatus !== 'signed' && b.status !== 'cancelled'
  );

  const fullyConfirmedCount = activeBookings.filter((b) => b.status === 'confirmed').length;

  // Upcoming upcoming chronological list
  const upcomingChronological = [...activeBookings].sort(
    (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome & Quick Summary Banner */}
      <div className="p-5 sm:p-6 bg-white rounded-2xl border border-[#7BA4D0]/20 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#2E5E99] mb-1">
            <span>{settings.venueName}</span>
            <span aria-hidden="true">·</span>
            <span>Portland, OR</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0D2440] tracking-tight">
            Welcome back, {settings.ownerName}
          </h2>
          <p className="text-sm text-slate-700 mt-1 max-w-2xl leading-relaxed">
            You have{' '}
            <strong className="text-[#0D2440] font-semibold">{upcomingChronological.length} upcoming events</strong> on the
            calendar. Keep deposits locked in via Stripe to prevent last-minute cancellations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigateTab('calendar')}
            className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#0D2440] bg-[#E7F0FA] hover:bg-[#7BA4D0]/20 border border-[#7BA4D0]/30 transition-colors"
          >
            View Calendar
          </button>
          <button
            onClick={onOpenNewBooking}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#2E5E99] hover:bg-[#254b7a] shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Booking</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Revenue Collected */}
        <div className="p-5 bg-white rounded-2xl border border-[#7BA4D0]/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700">Deposits Secured</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#0D2440] tabular-nums">
              {formatCurrency(totalRevenueSecured)}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-700">In bank via Stripe Checkout</p>
        </div>

        {/* Card 2: Pending Deposits */}
        <div className="p-5 bg-white rounded-2xl border border-[#7BA4D0]/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700">Deposits Awaiting Pay</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#0D2440] tabular-nums">
              {formatCurrency(pendingDepositsAmount)}
            </span>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
              {pendingDeposits.length} pending
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-700">Action needed to confirm dates</p>
        </div>

        {/* Card 3: Unsigned Contracts */}
        <div className="p-5 bg-white rounded-2xl border border-[#7BA4D0]/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700">Contracts Pending</span>
            <div className="w-8 h-8 rounded-lg bg-[#E7F0FA] text-[#2E5E99] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#0D2440] tabular-nums">
              {unsignedContracts.length}
            </span>
            <span className="text-xs text-slate-700">agreements</span>
          </div>
          <p className="mt-1 text-xs text-slate-700">Require client e-signature</p>
        </div>

        {/* Card 4: Confirmed Rate */}
        <div className="p-5 bg-white rounded-2xl border border-[#7BA4D0]/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700">Fully Confirmed</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2E5E99] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#0D2440] tabular-nums">
              {fullyConfirmedCount} / {activeBookings.length}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-700">Deposit received + contract signed</p>
        </div>
      </div>

      {/* Action Needed Section (High Priority for Solo Venue Owners) */}
      {(pendingDeposits.length > 0 || unsignedContracts.length > 0) && (
        <section className="bg-white rounded-2xl border border-amber-200/80 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[#0D2440]">
                Action Needed ({pendingDeposits.length + unsignedContracts.length})
              </h3>
            </div>
            <span className="text-xs text-slate-700">Resolve in 1 click to lock in dates</span>
          </div>

          <div className="divide-y divide-slate-100">
            {/* Show pending deposits first */}
            {pendingDeposits.map((booking) => (
              <div
                key={`act-dep-${booking.id}`}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Deposit Due: {formatCurrency(booking.depositAmount)}
                    </span>
                    <span className="text-sm font-semibold text-[#0D2440]">
                      {booking.clientName}
                    </span>
                    <span className="text-xs text-slate-700">·</span>
                    <span className="text-xs text-slate-700">{booking.bookingRef}</span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1">
                    {booking.eventType} on <strong>{formatDate(booking.eventDate)}</strong> ({booking.venueSpaceName})
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onCopyPaymentLink(booking)}
                    title="Copy Stripe payment link to clipboard"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#E7F0FA] text-[#2E5E99] hover:bg-[#7BA4D0]/20 border border-[#7BA4D0]/30 transition-colors"
                  >
                    <Link className="w-3.5 h-3.5" />
                    <span>Copy Stripe Link</span>
                  </button>

                  <button
                    onClick={() => onOpenPaymentModal(booking)}
                    title="Open Stripe payment checkout simulator"
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#2E5E99] text-white hover:bg-[#254b7a] shadow-xs transition-colors"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Collect Deposit</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Show unsigned contracts */}
            {unsignedContracts
              .filter((b) => !pendingDeposits.some((pd) => pd.id === b.id))
              .map((booking) => (
                <div
                  key={`act-con-${booking.id}`}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#2E5E99] bg-[#E7F0FA] px-2 py-0.5 rounded border border-[#7BA4D0]/40">
                        Contract Unsigned
                      </span>
                      <span className="text-sm font-semibold text-[#0D2440]">
                        {booking.clientName}
                      </span>
                      <span className="text-xs text-slate-700">·</span>
                      <span className="text-xs text-slate-700">{booking.bookingRef}</span>
                    </div>
                    <p className="text-xs text-slate-700 mt-1">
                      Deposit was secured! Renter needs to electronically sign agreement.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onOpenSignModal(booking)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#2E5E99] text-white hover:bg-[#254b7a] shadow-xs transition-colors"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Review & E-Sign</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Upcoming Bookings List with 3-Step Tracker */}
      <section className="bg-white rounded-2xl border border-[#7BA4D0]/20 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#0D2440]">
              Upcoming Bookings Timeline
            </h3>
            <p className="text-xs text-slate-700">
              Every booking tracks progress: Created → Deposit Paid → Contract Signed
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('bookings')}
            className="flex items-center gap-1 text-xs font-semibold text-[#2E5E99] hover:underline"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {upcomingChronological.map((booking) => {
            const badge = getStatusBadgeConfig(booking.status);
            const isStep1Done = true;
            const isStep2Done =
              booking.paymentStatus === 'deposit_paid' || booking.paymentStatus === 'paid_in_full';
            const isStep3Done = booking.contractStatus === 'signed';

            return (
              <div
                key={booking.id}
                onClick={() => onSelectBooking(booking)}
                className="group p-4 rounded-xl border border-slate-200 hover:border-[#7BA4D0] hover:bg-[#E7F0FA]/20 transition-all cursor-pointer"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Booking info */}
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#0D2440] font-mono">
                        {booking.bookingRef}
                      </span>
                      <span className="text-xs text-slate-700">·</span>
                      <span className="text-sm font-bold text-[#0D2440] group-hover:text-[#2E5E99] transition-colors truncate">
                        {booking.clientName}
                      </span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${badge.bgColor}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-700 flex-wrap">
                      <span>{booking.venueSpaceName}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {formatDate(booking.eventDate)} ({formatTime(booking.startTime)} - {formatTime(booking.endTime)})
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums font-semibold text-[#0D2440]">
                        {formatCurrency(booking.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Middle / Right: 3-Step Tracker */}
                  <div className="flex items-center gap-2 sm:gap-4 shrink-0 bg-[#E7F0FA]/40 px-3 py-2 rounded-xl border border-[#7BA4D0]/20">
                    {/* Step 1 */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                        ✓
                      </div>
                      <span className="text-slate-700 font-medium">Created</span>
                    </div>

                    <div className={`w-4 sm:w-6 h-0.5 ${isStep2Done ? 'bg-emerald-500' : 'bg-slate-300'}`} />

                    {/* Step 2 */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          isStep2Done
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isStep2Done ? '✓' : '2'}
                      </div>
                      <span
                        className={`font-medium ${
                          isStep2Done ? 'text-slate-700' : 'text-amber-800 font-semibold'
                        }`}
                      >
                        Deposit {isStep2Done ? 'Paid' : 'Due'}
                      </span>
                    </div>

                    <div className={`w-4 sm:w-6 h-0.5 ${isStep3Done ? 'bg-emerald-500' : 'bg-slate-300'}`} />

                    {/* Step 3 */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          isStep3Done
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isStep3Done ? '✓' : '3'}
                      </div>
                      <span
                        className={`font-medium ${
                          isStep3Done ? 'text-slate-700' : 'text-slate-700'
                        }`}
                      >
                        Contract {isStep3Done ? 'Signed' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Venue Spaces Cards */}
      <section className="space-y-3">
        <h3 className="text-base font-bold text-[#0D2440]">Your Venue Spaces</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {settings.spaces.map((space) => (
            <div
              key={space.id}
              className="bg-white rounded-2xl border border-[#7BA4D0]/20 overflow-hidden shadow-xs hover:border-[#7BA4D0] transition-all"
            >
              <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                <img
                  src={space.imageUrl}
                  alt={space.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 right-2.5 bg-[#0D2440]/85 backdrop-blur-xs text-white text-xs font-bold px-2 py-1 rounded-lg">
                  ${space.hourlyRate}/hr
                </div>
              </div>
              <div className="p-4 space-y-1.5">
                <h4 className="text-sm font-bold text-[#0D2440]">{space.name}</h4>
                <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
                  {space.description}
                </p>
                <div className="pt-2 flex items-center justify-between text-xs text-slate-700 border-t border-slate-100">
                  <span>Up to {space.capacity} guests</span>
                  <span>Min {space.minHours} hrs</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
