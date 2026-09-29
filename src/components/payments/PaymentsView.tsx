import React, { useState } from 'react';
import {
  CreditCard,
  DollarSign,
  CheckCircle2,
  Clock,
  Link,
  Receipt,
  FileDown,
  ExternalLink,
  ShieldCheck,
  Search,
  Filter,
  Check,
} from 'lucide-react';
import { Booking, VenueSettings } from '../../types';
import { formatCurrency, formatDate, getStatusBadgeConfig } from '../../utils/formatters';

interface PaymentsViewProps {
  bookings: Booking[];
  settings: VenueSettings;
  onOpenPaymentModal: (booking: Booking) => void;
  onCopyPaymentLink: (booking: Booking) => void;
  onDownloadReceipt: (booking: Booking) => void;
  onUpdateSettings: (newSettings: VenueSettings) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  bookings,
  settings,
  onOpenPaymentModal,
  onCopyPaymentLink,
  onDownloadReceipt,
  onUpdateSettings,
}) => {
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Compute stats
  const totalDepositsCollected = bookings.reduce((sum, b) => {
    if (b.paymentStatus === 'deposit_paid' || b.paymentStatus === 'paid_in_full') {
      return sum + b.depositAmount;
    }
    return sum;
  }, 0);

  const pendingDeposits = bookings.filter((b) => b.paymentStatus === 'unpaid' && b.status !== 'cancelled');
  const pendingAmount = pendingDeposits.reduce((sum, b) => sum + b.depositAmount, 0);

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'paid' && b.paymentStatus !== 'deposit_paid' && b.paymentStatus !== 'paid_in_full') return false;
    if (filter === 'pending' && (b.paymentStatus !== 'unpaid' || b.status === 'cancelled')) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        b.clientName.toLowerCase().includes(q) ||
        b.bookingRef.toLowerCase().includes(q) ||
        b.clientEmail.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleCopyLink = (booking: Booking) => {
    onCopyPaymentLink(booking);
    setCopiedId(booking.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDepositPercentageChange = (newPct: number) => {
    onUpdateSettings({
      ...settings,
      defaultDepositPercentage: newPct,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Stripe Account & Setup Banner */}
      <div className="bg-white rounded-2xl border border-[#7BA4D0]/20 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#2E5E99] text-white flex items-center justify-center font-bold text-sm shrink-0">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#0D2440]">
                Stripe Payments Integration
              </h3>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Active & Connected
              </span>
            </div>
            <p className="text-xs text-slate-700 mt-1 max-w-xl">
              Connected to Account <span className="font-mono text-[#0D2440] font-semibold">{settings.stripeAccountId}</span>.
              Deposits payout automatically to your connected business checking account within 48 hours.
            </p>
          </div>
        </div>

        {/* Deposit Policy Quick Selector */}
        <div className="flex items-center gap-2 bg-[#E7F0FA]/60 p-2.5 rounded-xl border border-[#7BA4D0]/30 shrink-0">
          <span className="text-xs font-semibold text-[#0D2440] whitespace-nowrap">Default Deposit:</span>
          <div className="flex items-center gap-1">
            {[25, 33, 50, 100].map((pct) => (
              <button
                key={pct}
                onClick={() => handleDepositPercentageChange(pct)}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  settings.defaultDepositPercentage === pct
                    ? 'bg-[#2E5E99] text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:text-[#0D2440] border border-slate-200'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top 3 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-[#7BA4D0]/20 shadow-xs">
          <span className="text-xs font-medium text-slate-700">Total Deposits Collected</span>
          <div className="mt-2 text-2xl font-bold text-emerald-700 tabular-nums">
            {formatCurrency(totalDepositsCollected)}
          </div>
          <p className="mt-1 text-xs text-slate-700">Paid upfront via Stripe</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#7BA4D0]/20 shadow-xs">
          <span className="text-xs font-medium text-slate-700">Pending Holding Deposits</span>
          <div className="mt-2 text-2xl font-bold text-amber-800 tabular-nums">
            {formatCurrency(pendingAmount)}
          </div>
          <p className="mt-1 text-xs text-slate-700">{pendingDeposits.length} clients awaiting payment</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#7BA4D0]/20 shadow-xs">
          <span className="text-xs font-medium text-slate-700">Estimated No-Show Savings</span>
          <div className="mt-2 text-2xl font-bold text-[#0D2440] tabular-nums">
            98.5%
          </div>
          <p className="mt-1 text-xs text-slate-700">Upfront deposits virtually eliminate no-shows</p>
        </div>
      </div>

      {/* Transactions & Deposit Requests Table */}
      <div className="bg-white rounded-2xl border border-[#7BA4D0]/20 shadow-xs overflow-hidden">
        {/* Table Filters & Search */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-[#E7F0FA] rounded-xl border border-[#7BA4D0]/30">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-[#2E5E99] text-white shadow-xs'
                  : 'text-[#0D2440] hover:text-[#2E5E99]'
              }`}
            >
              All Transactions ({bookings.length})
            </button>
            <button
              onClick={() => setFilter('paid')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filter === 'paid'
                  ? 'bg-[#2E5E99] text-white shadow-xs'
                  : 'text-[#0D2440] hover:text-[#2E5E99]'
              }`}
            >
              Paid Deposits
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filter === 'pending'
                  ? 'bg-[#2E5E99] text-white shadow-xs'
                  : 'text-[#0D2440] hover:text-[#2E5E99]'
              }`}
            >
              Pending Pay ({pendingDeposits.length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#E7F0FA]/40 border border-[#7BA4D0]/30 rounded-xl text-xs text-[#0D2440] focus:ring-2 focus:ring-[#2E5E99] focus:outline-none"
            />
          </div>
        </div>

        {/* Data Rows */}
        <div className="divide-y divide-slate-100">
          {filteredBookings.length === 0 ? (
            <div className="p-12 text-center text-slate-700 text-xs">
              No transactions match this filter criteria.
            </div>
          ) : (
            filteredBookings.map((b) => {
              const isPaid =
                b.paymentStatus === 'deposit_paid' || b.paymentStatus === 'paid_in_full';

              return (
                <div
                  key={b.id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#E7F0FA]/20 transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#0D2440]">
                        {b.bookingRef}
                      </span>
                      <span className="text-xs text-slate-700">·</span>
                      <h4 className="text-sm font-bold text-[#0D2440] truncate">{b.clientName}</h4>
                      {isPaid ? (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Deposit Paid
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Awaiting Deposit
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-700 flex-wrap">
                      <span>{b.venueSpaceName}</span>
                      <span>·</span>
                      <span>Event Date: {formatDate(b.eventDate)}</span>
                      {isPaid && b.paymentMethod && (
                        <>
                          <span>·</span>
                          <span className="text-[#0D2440] font-medium">{b.paymentMethod}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end">
                    <div className="text-left md:text-right">
                      <div className="text-xs text-slate-700">
                        Deposit Due ({b.depositPercentage}%)
                      </div>
                      <div className="text-base font-bold text-[#0D2440] tabular-nums">
                        {formatCurrency(b.depositAmount)}
                      </div>
                      <div className="text-[11px] text-slate-700">
                        Total fee: {formatCurrency(b.totalAmount)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {isPaid ? (
                        <button
                          onClick={() => onDownloadReceipt(b)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E7F0FA] text-[#2E5E99] hover:bg-[#7BA4D0]/20 rounded-lg text-xs font-semibold border border-[#7BA4D0]/40 transition-colors"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Receipt PDF</span>
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleCopyLink(b)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#0D2440] rounded-lg text-xs font-semibold transition-colors"
                          >
                            {copiedId === b.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Link className="w-3.5 h-3.5 text-slate-600" />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => onOpenPaymentModal(b)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2E5E99] hover:bg-[#254b7a] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Simulate Pay</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
