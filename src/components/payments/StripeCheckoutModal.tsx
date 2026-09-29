import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  CreditCard,
  Lock,
  ShieldCheck,
  X,
  ArrowRight,
  Receipt,
  Building2,
} from 'lucide-react';
import { Booking, VenueSettings } from '../../types';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';

interface StripeCheckoutModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  settings: VenueSettings;
  onPaymentSuccess: (bookingId: string, details: { transactionId: string; paymentMethod: string }) => void;
  onDownloadReceipt: (booking: Booking) => void;
}

export const StripeCheckoutModal: React.FC<StripeCheckoutModalProps> = ({
  booking,
  isOpen,
  onClose,
  settings,
  onPaymentSuccess,
  onDownloadReceipt,
}) => {
  if (!isOpen || !booking) return null;

  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [cardholderName, setCardholderName] = useState(booking.clientName);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSimulatePayment = () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);

      // Trigger confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#2E5E99', '#7BA4D0', '#10B981', '#F59E0B'],
        });
      } catch (err) {
        console.error('Confetti error', err);
      }

      const txId = `pi_3P${Math.random().toString(36).substring(2, 9)}Dep`;
      const pMethod = `Visa ending in 4242 (Stripe Elements)`;

      onPaymentSuccess(booking.id, {
        transactionId: txId,
        paymentMethod: pMethod,
      });
    }, 1100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Stripe Brand Header Bar */}
        <div className="px-6 py-4 bg-[#0D2440] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#2E5E99] flex items-center justify-center font-bold text-xs text-white">
              S
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#7BA4D0]">
                <Lock className="w-3 h-3 text-[#7BA4D0]" />
                <span>Stripe Secure Checkout</span>
              </div>
              <h3 className="text-sm font-bold text-white leading-tight">
                {settings.venueName}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          /* Payment Success State */
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <h4 className="text-xl font-bold text-[#0D2440]">Deposit Payment Received!</h4>
              <p className="text-xs text-slate-700 max-w-sm mx-auto">
                {formatCurrency(booking.depositAmount)} has been authorized and captured via Stripe.
                Your venue booking date is now secured.
              </p>
            </div>

            <div className="p-4 bg-[#E7F0FA]/60 rounded-xl border border-[#7BA4D0]/30 text-xs text-left space-y-1.5 font-medium">
              <div className="flex justify-between text-slate-700">
                <span>Renter:</span>
                <span className="font-bold text-[#0D2440]">{booking.clientName}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Event Date:</span>
                <span className="text-[#0D2440]">{formatDate(booking.eventDate)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Reserved Space:</span>
                <span className="text-[#0D2440]">{booking.venueSpaceName}</span>
              </div>
              <div className="flex justify-between text-slate-700 pt-1 border-t border-slate-200">
                <span>Amount Paid:</span>
                <span className="font-bold text-emerald-700 tabular-nums">
                  {formatCurrency(booking.depositAmount)} USD
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={() => onDownloadReceipt(booking)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E7F0FA] text-[#2E5E99] hover:bg-[#7BA4D0]/20 rounded-xl text-xs font-bold border border-[#7BA4D0]/40 transition-colors"
              >
                <Receipt className="w-4 h-4" />
                <span>Download Official Receipt</span>
              </button>

              <button
                onClick={onClose}
                className="w-full px-4 py-2.5 bg-[#2E5E99] hover:bg-[#254b7a] text-white rounded-xl text-xs font-bold transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* Payment Form */
          <div className="p-6 space-y-5">
            {/* Amount Banner */}
            <div className="p-4 bg-[#E7F0FA]/50 rounded-xl border border-[#7BA4D0]/20 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-700 block">Holding Deposit Required ({booking.depositPercentage}%)</span>
                <span className="text-2xl font-bold text-[#0D2440] tabular-nums">
                  {formatCurrency(booking.depositAmount)}
                </span>
              </div>
              <div className="text-right text-xs">
                <span className="text-slate-700 block">Total Rental</span>
                <span className="font-bold text-[#0D2440] tabular-nums">
                  {formatCurrency(booking.totalAmount)}
                </span>
              </div>
            </div>

            {/* Quick 1-Click Pay simulation */}
            <div>
              <button
                type="button"
                onClick={handleSimulatePayment}
                disabled={isProcessing}
                className="w-full py-2.5 px-4 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <span className="font-bold">Pay with</span>
                <span className="font-bold tracking-tight"> Pay / G Pay</span>
              </button>
              <div className="relative my-3 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <span className="relative bg-white px-2 text-[11px] text-slate-700">
                  Or pay with card
                </span>
              </div>
            </div>

            {/* Credit Card inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Card Information
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-[#2E5E99] focus:outline-none"
                  />
                  <CreditCard className="w-4 h-4 text-slate-600 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Expiration
                  </label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-[#2E5E99] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">CVC</label>
                  <input
                    type="text"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-[#2E5E99] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#2E5E99] focus:outline-none"
                />
              </div>
            </div>

            {/* Test card info helper */}
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-700 flex items-center justify-between">
              <span>Test Mode: Uses simulated Stripe authorization</span>
              <span className="font-mono font-semibold text-[#2E5E99]">4242 •••• 4242</span>
            </div>

            {/* Pay Button */}
            <button
              type="button"
              onClick={handleSimulatePayment}
              disabled={isProcessing}
              className="w-full py-3 px-4 bg-[#2E5E99] hover:bg-[#254b7a] active:bg-[#1f3f66] text-white rounded-xl text-sm font-bold shadow-xs hover:shadow transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authorizing via Stripe...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay Deposit {formatCurrency(booking.depositAmount)}</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>256-bit encrypted. Card data never touches host server.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
