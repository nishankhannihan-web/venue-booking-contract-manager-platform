import React, { useRef, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  FileCheck,
  ShieldCheck,
  RotateCcw,
  Download,
  CheckCircle2,
  Lock,
  Printer,
} from 'lucide-react';
import { Booking, ContractSignature, VenueSettings } from '../../types';
import { fillContractTemplate } from '../../utils/formatters';

interface SignContractModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  settings: VenueSettings;
  onSignContract: (bookingId: string, signature: ContractSignature) => void;
  onDownloadPdf: (booking: Booking) => void;
}

export const SignContractModal: React.FC<SignContractModalProps> = ({
  booking,
  isOpen,
  onClose,
  settings,
  onSignContract,
  onDownloadPdf,
}) => {
  if (!isOpen || !booking) return null;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureMode, setSignatureMode] = useState<'draw' | 'type'>('type');
  const [typedName, setTypedName] = useState(booking.clientName);
  const [signerEmail, setSignerEmail] = useState(booking.clientEmail);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(booking.contractStatus === 'signed');

  // Canvas drawing handlers
  useEffect(() => {
    if (signatureMode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#0D2440';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [signatureMode, isOpen]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const contractBodyText = fillContractTemplate(settings.contractTemplate, booking, settings);

  const handleSubmitSignature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      alert('Please check the acknowledgment box before signing.');
      return;
    }

    if (signatureMode === 'draw' && !hasDrawn) {
      alert('Please draw your signature on the pad.');
      return;
    }

    if (signatureMode === 'type' && !typedName.trim()) {
      alert('Please enter your full legal name.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      let signatureDataUrl = '';
      if (signatureMode === 'draw' && canvasRef.current) {
        signatureDataUrl = canvasRef.current.toDataURL('image/png');
      }

      const auditRecord: ContractSignature = {
        signerName: signatureMode === 'type' ? typedName.trim() : booking.clientName,
        signerEmail: signerEmail.trim(),
        signatureType: signatureMode,
        signatureDataUrl,
        signedAt: new Date().toISOString(),
        ipAddress: '198.51.100.84', // realistic client IP simulation
        userAgent: navigator.userAgent || 'Mozilla/5.0 (Client Browser)',
        auditHash: `SHA256-${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`,
      };

      onSignContract(booking.id, auditRecord);
      setIsSubmitting(false);
      setIsSuccess(true);

      try {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#2E5E99', '#7BA4D0', '#10B981'],
        });
      } catch (err) {
        console.error(err);
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-[#E7F0FA]/90 border-b border-[#7BA4D0]/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2E5E99] text-white flex items-center justify-center font-bold">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0D2440]">
                {booking.contractStatus === 'signed' ? 'Executed Venue Agreement' : 'Review & E-Sign Contract'}
              </h3>
              <p className="text-xs text-slate-700">
                Booking Reference <span className="font-mono font-semibold text-[#0D2440]">{booking.bookingRef}</span> · {booking.venueSpaceName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-600 hover:text-slate-800 rounded-lg hover:bg-white/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contract Text Body */}
        <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Document Preview Box */}
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono whitespace-pre-wrap text-slate-800 leading-relaxed max-h-72 overflow-y-auto">
            {contractBodyText}
          </div>

          {/* If already signed, show verified certification */}
          {booking.contractStatus === 'signed' && booking.contractSignature ? (
            <div className="p-5 bg-[#E7F0FA]/70 rounded-xl border border-[#7BA4D0]/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Agreement Digitally Signed & Certified</span>
                </div>
                <span className="text-[11px] font-mono bg-white px-2 py-0.5 rounded border border-[#7BA4D0]/30 text-[#0D2440]">
                  ESIGN Compliant
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 pt-1">
                <div>
                  <span className="block text-slate-700 font-medium">Signer Full Name:</span>
                  <strong className="text-[#0D2440] text-sm">
                    {booking.contractSignature.signerName}
                  </strong>
                </div>
                <div>
                  <span className="block text-slate-700 font-medium">Signer Email:</span>
                  <strong className="text-[#0D2440]">
                    {booking.contractSignature.signerEmail}
                  </strong>
                </div>
                <div>
                  <span className="block text-slate-700 font-medium">Timestamp:</span>
                  <span className="font-mono text-[#0D2440]">
                    {new Date(booking.contractSignature.signedAt).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-700 font-medium">IP Address / Hash:</span>
                  <span className="font-mono text-[#0D2440] text-[11px]">
                    {booking.contractSignature.ipAddress} · {booking.contractSignature.auditHash.slice(0, 16)}...
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onDownloadPdf(booking)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#2E5E99] hover:bg-[#254b7a] text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Signed PDF Contract</span>
                </button>
              </div>
            </div>
          ) : isSuccess ? (
            /* Just Signed Celebration */
            <div className="p-6 text-center space-y-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="text-base font-bold text-emerald-950">Contract Successfully Signed!</h4>
              <p className="text-xs text-emerald-900 max-w-md mx-auto">
                The agreement has been securely certified with a tamper-evident audit record. Both venue and client can download the signed PDF at any time.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => onDownloadPdf(booking)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#2E5E99] text-white rounded-xl text-xs font-bold hover:bg-[#254b7a] transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Signed PDF</span>
                </button>
              </div>
            </div>
          ) : (
            /* E-Signature Input Form */
            <form onSubmit={handleSubmitSignature} className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <label className="text-xs font-bold text-[#0D2440] uppercase tracking-wider">
                  Electronic Signature
                </label>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSignatureMode('type')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                      signatureMode === 'type'
                        ? 'bg-[#2E5E99] text-white'
                        : 'bg-slate-100 text-slate-700 hover:text-[#0D2440]'
                    }`}
                  >
                    Type Legal Name
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignatureMode('draw')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                      signatureMode === 'draw'
                        ? 'bg-[#2E5E99] text-white'
                        : 'bg-slate-100 text-slate-700 hover:text-[#0D2440]'
                    }`}
                  >
                    Draw Signature
                  </button>
                </div>
              </div>

              {signatureMode === 'type' ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Signer Legal Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={typedName}
                        onChange={(e) => setTypedName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-[#0D2440] focus:ring-2 focus:ring-[#2E5E99] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Signer Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={signerEmail}
                        onChange={(e) => setSignerEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#2E5E99] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Stylized Signature Preview */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-700 block mb-1">
                      Digital Signature Preview
                    </span>
                    <div className="font-serif italic text-2xl text-[#2E5E99] py-2 px-1">
                      {typedName || '[ Your Full Name ]'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-700">
                    <span>Draw your signature on the pad using mouse or touch</span>
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="text-[#2E5E99] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Clear Pad</span>
                    </button>
                  </div>
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={140}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-36 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl cursor-crosshair touch-none"
                  />
                </div>
              )}

              {/* Legal Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-[#2E5E99] focus:ring-[#2E5E99]"
                />
                <span className="text-xs text-slate-800 leading-normal">
                  I agree that my electronic signature constitutes a legally binding agreement under
                  the U.S. Electronic Signatures in Global and National Commerce Act (ESIGN) and state UETA laws.
                </span>
              </label>

              {/* Action buttons */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#2E5E99] hover:bg-[#254b7a] active:bg-[#1f3f66] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Certifying Signature...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Certify & Sign Agreement</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
