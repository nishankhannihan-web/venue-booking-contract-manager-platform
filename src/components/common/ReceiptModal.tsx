import React from 'react';
import { X, Printer, Download, CheckCircle2, Building2 } from 'lucide-react';
import { Booking, VenueSettings } from '../../types';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';

interface ReceiptModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  settings: VenueSettings;
  onDownloadPdf: (booking: Booking) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  booking,
  isOpen,
  onClose,
  settings,
  onDownloadPdf,
}) => {
  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 bg-[#E7F0FA]/80 border-b border-[#7BA4D0]/20 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#2E5E99] bg-white px-2 py-0.5 rounded border border-[#7BA4D0]/30">
              REC-{booking.bookingRef}
            </span>
            <span className="text-xs font-bold text-[#0D2440]">Payment Receipt</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-6 sm:p-8 space-y-6 bg-white">
          <div className="flex justify-between items-start border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-lg font-bold text-[#0D2440]">{settings.venueName}</h3>
              <p className="text-xs text-slate-700">{settings.address}, {settings.cityStateZip}</p>
              <p className="text-xs text-slate-700">{settings.ownerPhone} · {settings.ownerEmail}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mb-1">
                PAID IN FULL
              </span>
              <p className="text-xs text-slate-700">Receipt Ref: REC-{booking.bookingRef}</p>
              <p className="text-xs text-slate-700">
                {booking.depositPaidAt ? new Date(booking.depositPaidAt).toLocaleDateString() : 'Paid'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-bold text-slate-700 uppercase tracking-wider block text-[10px]">
                Billed To
              </span>
              <strong className="text-[#0D2440] text-sm block mt-0.5">{booking.clientName}</strong>
              <span className="text-slate-700 block">{booking.clientEmail}</span>
              <span className="text-slate-700 block">{booking.clientPhone}</span>
            </div>

            <div>
              <span className="font-bold text-slate-700 uppercase tracking-wider block text-[10px]">
                Reservation Details
              </span>
              <strong className="text-[#0D2440] block mt-0.5">{booking.venueSpaceName}</strong>
              <span className="text-slate-700 block">
                {formatDate(booking.eventDate)} ({formatTime(booking.startTime)} - {formatTime(booking.endTime)})
              </span>
              <span className="text-slate-700 block">Purpose: {booking.eventType}</span>
            </div>
          </div>

          {/* Line items table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <div className="bg-[#E7F0FA]/60 px-4 py-2 font-bold text-[#0D2440] flex justify-between">
              <span>Item & Description</span>
              <span>Amount</span>
            </div>
            <div className="divide-y divide-slate-100 p-4 space-y-2">
              <div className="flex justify-between text-slate-800">
                <div>
                  <span className="font-semibold block">Securing Holding Deposit ({booking.depositPercentage}%)</span>
                  <span className="text-[11px] text-slate-700">
                    Applied towards total rental of {formatCurrency(booking.totalAmount)}
                  </span>
                </div>
                <strong className="tabular-nums font-bold text-[#0D2440]">
                  {formatCurrency(booking.depositAmount)}
                </strong>
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between font-bold text-sm text-[#0D2440]">
                <span>Total Deposit Paid:</span>
                <span className="tabular-nums text-emerald-700">
                  {formatCurrency(booking.depositAmount)} USD
                </span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Remaining Event Balance:</span>
                <span className="tabular-nums font-semibold text-[#0D2440]">
                  {formatCurrency(booking.balanceDue)} USD (Due 7 days prior)
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method Footnote */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-700 flex justify-between">
            <span>Payment Method: {booking.paymentMethod || 'Visa •••• 4242 (Stripe)'}</span>
            <span className="font-mono text-[10px]">Auth: {booking.depositTransactionId || 'pi_confirmed'}</span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between no-print">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-[#0D2440] rounded-xl text-xs font-semibold hover:bg-slate-100 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onDownloadPdf(booking)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#2E5E99] hover:bg-[#254b7a] text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF Receipt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
