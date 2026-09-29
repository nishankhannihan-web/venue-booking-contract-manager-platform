import React, { useState } from 'react';
import {
  CalendarCheck,
  CreditCard,
  FileCheck,
  FileDown,
  Link,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { Booking, BookingStatus, VenueSettings } from '../../types';
import { formatCurrency, formatDate, formatTime, getStatusBadgeConfig } from '../../utils/formatters';

interface BookingsListViewProps {
  bookings: Booking[];
  settings: VenueSettings;
  searchQuery: string;
  onSelectBooking: (booking: Booking) => void;
  onOpenNewBooking: () => void;
  onOpenPaymentModal: (booking: Booking) => void;
  onOpenSignModal: (booking: Booking) => void;
  onCopyPaymentLink: (booking: Booking) => void;
  onDownloadContractPdf: (booking: Booking) => void;
  onCancelBooking: (booking: Booking) => void;
}

type FilterTab = 'all' | 'pending_deposit' | 'deposit_paid' | 'confirmed' | 'cancelled';

export const BookingsListView: React.FC<BookingsListViewProps> = ({
  bookings,
  settings,
  searchQuery,
  onSelectBooking,
  onOpenNewBooking,
  onOpenPaymentModal,
  onOpenSignModal,
  onCopyPaymentLink,
  onDownloadContractPdf,
  onCancelBooking,
}) => {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [actionMenuBookingId, setActionMenuBookingId] = useState<string | null>(null);

  const filtered = bookings.filter((b) => {
    // Tab filter
    if (activeTab === 'pending_deposit' && b.status !== 'pending_deposit') return false;
    if (activeTab === 'deposit_paid' && b.status !== 'deposit_paid') return false;
    if (activeTab === 'confirmed' && b.status !== 'confirmed') return false;
    if (activeTab === 'cancelled' && b.status !== 'cancelled') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        b.clientName.toLowerCase().includes(q) ||
        b.clientEmail.toLowerCase().includes(q) ||
        b.bookingRef.toLowerCase().includes(q) ||
        b.eventType.toLowerCase().includes(q) ||
        b.venueSpaceName.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Top Controls Header */}
      <div className="bg-white rounded-2xl border border-[#7BA4D0]/20 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Segmented Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-[#E7F0FA] rounded-xl border border-[#7BA4D0]/30 overflow-x-auto">
          {[
            { id: 'all' as FilterTab, label: 'All Bookings', count: bookings.length },
            {
              id: 'pending_deposit' as FilterTab,
              label: 'Deposit Pending',
              count: bookings.filter((b) => b.status === 'pending_deposit').length,
            },
            {
              id: 'deposit_paid' as FilterTab,
              label: 'Deposit Paid',
              count: bookings.filter((b) => b.status === 'deposit_paid').length,
            },
            {
              id: 'confirmed' as FilterTab,
              label: 'Fully Confirmed',
              count: bookings.filter((b) => b.status === 'confirmed').length,
            },
            {
              id: 'cancelled' as FilterTab,
              label: 'Cancelled',
              count: bookings.filter((b) => b.status === 'cancelled').length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-[#2E5E99] text-white shadow-xs'
                  : 'text-[#0D2440] hover:text-[#2E5E99]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Create Booking Button */}
        <button
          onClick={onOpenNewBooking}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#2E5E99] hover:bg-[#254b7a] shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Booking</span>
        </button>
      </div>

      {/* Bookings Card List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#7BA4D0]/20 p-12 text-center shadow-xs">
            <CalendarCheck className="w-10 h-10 mx-auto text-slate-600 mb-3" />
            <h3 className="text-base font-bold text-[#0D2440]">No bookings found</h3>
            <p className="text-xs text-slate-700 mt-1 max-w-sm mx-auto">
              There are no reservations matching this filter. Create a new booking or clear search.
            </p>
            <button
              onClick={onOpenNewBooking}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#2E5E99] text-white rounded-xl text-xs font-semibold hover:bg-[#254b7a] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Booking</span>
            </button>
          </div>
        ) : (
          filtered.map((booking) => {
            const badge = getStatusBadgeConfig(booking.status);
            const isMenuOpen = actionMenuBookingId === booking.id;

            return (
              <div
                key={booking.id}
                className="bg-white rounded-2xl border border-[#7BA4D0]/20 p-4 sm:p-5 shadow-xs hover:border-[#7BA4D0] transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Info */}
                  <div
                    onClick={() => onSelectBooking(booking)}
                    className="cursor-pointer space-y-1.5 flex-1 min-w-0"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#0D2440] font-mono">
                        {booking.bookingRef}
                      </span>
                      <span className="text-xs text-slate-700">·</span>
                      <h4 className="text-sm sm:text-base font-bold text-[#0D2440] hover:text-[#2E5E99] transition-colors">
                        {booking.clientName}
                      </h4>
                      {booking.clientCompany && (
                        <span className="text-xs text-slate-700">({booking.clientCompany})</span>
                      )}
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${badge.bgColor}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-700 flex-wrap">
                      <span className="font-semibold text-[#0D2440]">{booking.venueSpaceName}</span>
                      <span>·</span>
                      <span>
                        {formatDate(booking.eventDate)} ({formatTime(booking.startTime)} -{' '}
                        {formatTime(booking.endTime)})
                      </span>
                      <span>·</span>
                      <span>{booking.guestCount} guests</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs pt-1">
                      <span className="text-slate-700">
                        Total Fee:{' '}
                        <strong className="text-[#0D2440] font-semibold tabular-nums">
                          {formatCurrency(booking.totalAmount)}
                        </strong>
                      </span>
                      <span className="text-slate-700">
                        Deposit ({booking.depositPercentage}%):{' '}
                        <strong
                          className={`font-semibold tabular-nums ${
                            booking.paymentStatus === 'deposit_paid'
                              ? 'text-emerald-700'
                              : 'text-amber-800'
                          }`}
                        >
                          {formatCurrency(booking.depositAmount)} (
                          {booking.paymentStatus === 'deposit_paid' ? 'Paid' : 'Unpaid'})
                        </strong>
                      </span>
                      <span className="text-slate-700">
                        Contract:{' '}
                        <strong
                          className={`font-semibold ${
                            booking.contractStatus === 'signed'
                              ? 'text-emerald-700'
                              : 'text-[#2E5E99]'
                          }`}
                        >
                          {booking.contractStatus === 'signed' ? 'Signed & Verified' : 'Awaiting Sign'}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 justify-between lg:justify-end">
                    {/* Primary quick action depending on status */}
                    {booking.paymentStatus === 'unpaid' && (
                      <button
                        onClick={() => onOpenPaymentModal(booking)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#2E5E99] text-white hover:bg-[#254b7a] shadow-xs transition-colors"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Pay Deposit</span>
                      </button>
                    )}

                    {booking.paymentStatus === 'deposit_paid' && booking.contractStatus !== 'signed' && (
                      <button
                        onClick={() => onOpenSignModal(booking)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#2E5E99] text-white hover:bg-[#254b7a] shadow-xs transition-colors"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Sign Contract</span>
                      </button>
                    )}

                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => onDownloadContractPdf(booking)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#E7F0FA] text-[#2E5E99] hover:bg-[#7BA4D0]/20 border border-[#7BA4D0]/40 transition-colors"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </button>
                    )}

                    {/* View Details Button */}
                    <button
                      onClick={() => onSelectBooking(booking)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-[#0D2440] hover:bg-slate-200 transition-colors"
                    >
                      Details
                    </button>

                    {/* Dropdown menu trigger */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setActionMenuBookingId(isMenuOpen ? null : booking.id)
                        }
                        className="p-1.5 text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-20 text-xs">
                          <button
                            onClick={() => {
                              onCopyPaymentLink(booking);
                              setActionMenuBookingId(null);
                            }}
                            className="w-full text-left px-3.5 py-2 hover:bg-[#E7F0FA] text-[#0D2440] flex items-center gap-2"
                          >
                            <Link className="w-3.5 h-3.5 text-slate-600" />
                            <span>Copy Stripe Link</span>
                          </button>

                          <button
                            onClick={() => {
                              onOpenSignModal(booking);
                              setActionMenuBookingId(null);
                            }}
                            className="w-full text-left px-3.5 py-2 hover:bg-[#E7F0FA] text-[#0D2440] flex items-center gap-2"
                          >
                            <FileCheck className="w-3.5 h-3.5 text-slate-600" />
                            <span>E-Sign Contract</span>
                          </button>

                          <button
                            onClick={() => {
                              onDownloadContractPdf(booking);
                              setActionMenuBookingId(null);
                            }}
                            className="w-full text-left px-3.5 py-2 hover:bg-[#E7F0FA] text-[#0D2440] flex items-center gap-2"
                          >
                            <FileDown className="w-3.5 h-3.5 text-slate-600" />
                            <span>Download PDF</span>
                          </button>

                          {booking.status !== 'cancelled' && (
                            <button
                              onClick={() => {
                                onCancelBooking(booking);
                                setActionMenuBookingId(null);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 border-t border-slate-100"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Cancel Booking</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
