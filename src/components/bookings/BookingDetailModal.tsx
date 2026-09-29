import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  Mail,
  Phone,
  CreditCard,
  FileText,
  FileCheck,
  FileDown,
  Link,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Send,
  Building2,
  ExternalLink,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { Booking, VenueSettings } from '../../types';
import { formatCurrency, formatDate, formatTime, getStatusBadgeConfig } from '../../utils/formatters';

interface BookingDetailModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  settings: VenueSettings;
  onOpenPaymentModal: (booking: Booking) => void;
  onOpenSignModal: (booking: Booking) => void;
  onCopyPaymentLink: (booking: Booking) => void;
  onDownloadContractPdf: (booking: Booking) => void;
  onDownloadReceiptPdf: (booking: Booking) => void;
  onSendReminder: (bookingId: string, reminderId: string) => void;
  onCancelBooking: (booking: Booking) => void;
}

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  booking,
  isOpen,
  onClose,
  settings,
  onOpenPaymentModal,
  onOpenSignModal,
  onCopyPaymentLink,
  onDownloadContractPdf,
  onDownloadReceiptPdf,
  onSendReminder,
  onCancelBooking,
}) => {
  if (!isOpen || !booking) return null;

  const badge = getStatusBadgeConfig(booking.status);
  const isDepositPaid =
    booking.paymentStatus === 'deposit_paid' || booking.paymentStatus === 'paid_in_full';
  const isContractSigned = booking.contractStatus === 'signed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-[#7BA4D0]/30 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-[#E7F0FA]/80 border-b border-[#7BA4D0]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold bg-[#2E5E99] text-white px-2.5 py-1 rounded-lg">
              {booking.bookingRef}
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#0D2440] leading-tight">
                {booking.clientName}
              </h3>
              <p className="text-xs text-slate-700">{booking.eventType}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${badge.bgColor}`}>
              {badge.label}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-600 hover:text-slate-800 rounded-lg hover:bg-white/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* 3-Step Milestone Tracker */}
          <div className="p-4 bg-[#E7F0FA]/40 rounded-xl border border-[#7BA4D0]/20">
            <div className="text-xs font-bold text-[#0D2440] uppercase tracking-wider mb-3">
              Booking Progress
            </div>
            <div className="grid grid-cols-3 gap-2">
              {/* Step 1: Created */}
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>
                  <span className="text-xs font-bold text-[#0D2440]">1. Booking Created</span>
                </div>
                <p className="text-[11px] text-slate-700 mt-1">
                  {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'Active'}
                </p>
              </div>

              {/* Step 2: Deposit Paid */}
              <div
                className={`p-3 rounded-lg border ${
                  isDepositPaid
                    ? 'bg-white border-slate-200'
                    : 'bg-amber-50/60 border-amber-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs ${
                      isDepositPaid
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isDepositPaid ? '✓' : '2'}
                  </div>
                  <span className="text-xs font-bold text-[#0D2440]">2. Deposit Paid</span>
                </div>
                <p className="text-[11px] text-slate-700 mt-1 truncate">
                  {isDepositPaid ? `${formatCurrency(booking.depositAmount)} via Stripe` : 'Pending payment'}
                </p>
              </div>

              {/* Step 3: Contract Signed */}
              <div
                className={`p-3 rounded-lg border ${
                  isContractSigned
                    ? 'bg-white border-slate-200'
                    : 'bg-blue-50/50 border-[#7BA4D0]/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs ${
                      isContractSigned
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-[#E7F0FA] text-[#2E5E99]'
                    }`}
                  >
                    {isContractSigned ? '✓' : '3'}
                  </div>
                  <span className="text-xs font-bold text-[#0D2440]">3. Contract Signed</span>
                </div>
                <p className="text-[11px] text-slate-700 mt-1 truncate">
                  {isContractSigned ? 'Verified digital e-sign' : 'Awaiting signature'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons Row */}
          <div className="flex flex-wrap items-center gap-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            {/* Copy Stripe Link */}
            <button
              onClick={() => onCopyPaymentLink(booking)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#7BA4D0]/40 text-[#2E5E99] hover:bg-[#E7F0FA] transition-colors"
            >
              <Link className="w-3.5 h-3.5" />
              <span>Copy Stripe Link</span>
            </button>

            {/* Collect Deposit / Pay */}
            {!isDepositPaid && (
              <button
                onClick={() => onOpenPaymentModal(booking)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#2E5E99] text-white hover:bg-[#254b7a] shadow-xs transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Simulate Stripe Checkout</span>
              </button>
            )}

            {/* View / Sign Contract */}
            <button
              onClick={() => onOpenSignModal(booking)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-[#0D2440] hover:bg-slate-100 transition-colors"
            >
              <FileCheck className="w-3.5 h-3.5 text-slate-600" />
              <span>{isContractSigned ? 'View Signed Contract' : 'Review & E-Sign Contract'}</span>
            </button>

            {/* Download Contract PDF */}
            <button
              onClick={() => onDownloadContractPdf(booking)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-[#0D2440] hover:bg-slate-100 transition-colors"
            >
              <FileDown className="w-3.5 h-3.5 text-slate-600" />
              <span>Download Contract PDF</span>
            </button>

            {/* Download Payment Receipt */}
            {isDepositPaid && (
              <button
                onClick={() => onDownloadReceiptPdf(booking)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 transition-colors"
              >
                <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                <span>Download Receipt PDF</span>
              </button>
            )}
          </div>

          {/* 2-Column Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Event & Venue Space */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-[#0D2440] uppercase tracking-wider">
                Event & Space Information
              </h4>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-700 block text-[11px]">Venue Space</span>
                    <strong className="text-[#0D2440] font-semibold text-sm">
                      {booking.venueSpaceName}
                    </strong>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-700 block text-[11px]">Date & Schedule</span>
                    <span className="text-[#0D2440] font-semibold">
                      {formatDate(booking.eventDate)} ({formatTime(booking.startTime)} -{' '}
                      {formatTime(booking.endTime)})
                    </span>
                    <span className="text-slate-700 block text-[11px] mt-0.5">
                      Duration: {booking.durationHours} hours
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <User className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-700 block text-[11px]">Renter / Client</span>
                    <strong className="text-[#0D2440] font-semibold text-sm">
                      {booking.clientName}
                    </strong>
                    {booking.clientCompany && (
                      <span className="text-slate-700 block text-xs">
                        Company: {booking.clientCompany}
                      </span>
                    )}
                    <span className="text-slate-700 block text-xs">{booking.clientEmail}</span>
                    <span className="text-slate-700 block text-xs">{booking.clientPhone}</span>
                  </div>
                </div>

                {booking.notes && (
                  <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/60 mt-2">
                    <span className="text-[11px] font-bold text-amber-900 block mb-0.5">
                      Internal Notes:
                    </span>
                    <p className="text-xs text-amber-950 leading-relaxed">{booking.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Financial Breakdown & Stripe Status */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-[#0D2440] uppercase tracking-wider">
                Financials & Stripe Deposit
              </h4>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-700">
                  <span>
                    Base Hourly ({booking.durationHours} hrs @ ${booking.baseRate}/hr):
                  </span>
                  <span className="tabular-nums font-semibold text-[#0D2440]">
                    {formatCurrency(booking.baseRate * booking.durationHours)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-700">
                  <span>Cleaning & Prep Fee:</span>
                  <span className="tabular-nums font-semibold text-[#0D2440]">
                    {formatCurrency(booking.cleaningFee)}
                  </span>
                </div>

                {booking.addOnsAmount > 0 && (
                  <div className="flex items-center justify-between text-slate-700">
                    <span>Add-ons / Equipment:</span>
                    <span className="tabular-nums font-semibold text-[#0D2440]">
                      {formatCurrency(booking.addOnsAmount)}
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm">
                  <span className="font-bold text-[#0D2440]">Total Event Fee:</span>
                  <strong className="font-bold text-[#0D2440] tabular-nums">
                    {formatCurrency(booking.totalAmount)}
                  </strong>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200">
                  <div>
                    <span className="font-bold text-[#0D2440] block">
                      Required Deposit ({booking.depositPercentage}%):
                    </span>
                    <span className="text-[11px] text-slate-700">
                      {isDepositPaid ? 'Payment Confirmed' : 'Awaiting payment from client'}
                    </span>
                  </div>
                  <strong
                    className={`text-base font-bold tabular-nums ${
                      isDepositPaid ? 'text-emerald-700' : 'text-amber-800'
                    }`}
                  >
                    {formatCurrency(booking.depositAmount)}
                  </strong>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-700 pt-1">
                  <span>Remaining Balance Due (7 days prior):</span>
                  <span className="tabular-nums font-semibold text-[#0D2440]">
                    {formatCurrency(booking.balanceDue)}
                  </span>
                </div>
              </div>

              {/* Stripe Payment Method & Transaction ID if paid */}
              {isDepositPaid && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Deposit Captured via Stripe</span>
                  </div>
                  <p className="text-[11px] text-emerald-950">
                    Method: {booking.paymentMethod || 'Credit Card'}
                  </p>
                  <p className="text-[10px] text-emerald-900 font-mono">
                    Stripe Ref: {booking.depositTransactionId}
                  </p>
                  <p className="text-[10px] text-emerald-900">
                    Timestamp:{' '}
                    {booking.depositPaidAt
                      ? new Date(booking.depositPaidAt).toLocaleString()
                      : 'Recently'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Tamper-Evident Contract Signature Record */}
          {isContractSigned && booking.contractSignature && (
            <div className="p-4 bg-white rounded-xl border border-[#7BA4D0]/30 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#2E5E99]" />
                <h5 className="text-xs font-bold text-[#0D2440]">
                  Legally Binding E-Signature & Audit Trail
                </h5>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 pt-1">
                <div>
                  <span className="block text-[11px] text-slate-700">Digital Signer:</span>
                  <strong className="text-[#0D2440] font-semibold">
                    {booking.contractSignature.signerName} ({booking.contractSignature.signerEmail})
                  </strong>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-700">Execution Timestamp:</span>
                  <span className="font-mono text-[11px] text-[#0D2440]">
                    {new Date(booking.contractSignature.signedAt).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-700">Signer IP Address:</span>
                  <span className="font-mono text-[11px] text-[#0D2440]">
                    {booking.contractSignature.ipAddress}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-700">Cryptographic Audit Hash:</span>
                  <span className="font-mono text-[10px] text-slate-600 truncate block">
                    {booking.contractSignature.auditHash}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Reminders & Notifications for this Booking */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-[#0D2440] uppercase tracking-wider">
              Automated Reminders & Notifications
            </h4>
            <div className="divide-y divide-slate-100 bg-white rounded-xl border border-slate-200">
              {booking.reminders.map((rem) => (
                <div
                  key={rem.id}
                  className="p-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        rem.sent ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    />
                    <div className="truncate">
                      <span className="font-semibold text-[#0D2440]">{rem.title}</span>
                      <span className="text-[11px] text-slate-700 block">
                        Channel: {rem.channel.toUpperCase()} · Recipient: {rem.recipient}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {rem.sent ? (
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Dispatched
                      </span>
                    ) : (
                      <button
                        onClick={() => onSendReminder(booking.id, rem.id)}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-[#2E5E99] bg-[#E7F0FA] hover:bg-[#7BA4D0]/20 rounded border border-[#7BA4D0]/30 transition-colors"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send Now</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div>
            {booking.status !== 'cancelled' && (
              <button
                onClick={() => onCancelBooking(booking)}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors flex items-center gap-1"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancel Booking</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-xs font-semibold text-[#0D2440] rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
