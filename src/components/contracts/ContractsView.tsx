import React, { useState } from 'react';
import {
  FileText,
  FileCheck,
  FileDown,
  Edit3,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  Send,
  Eye,
  Save,
} from 'lucide-react';
import { Booking, VenueSettings } from '../../types';
import { formatDate, formatTime } from '../../utils/formatters';

interface ContractsViewProps {
  bookings: Booking[];
  settings: VenueSettings;
  onOpenSignModal: (booking: Booking) => void;
  onDownloadPdf: (booking: Booking) => void;
  onUpdateSettings: (newSettings: VenueSettings) => void;
}

export const ContractsView: React.FC<ContractsViewProps> = ({
  bookings,
  settings,
  onOpenSignModal,
  onDownloadPdf,
  onUpdateSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'agreements' | 'template'>('agreements');
  const [templateText, setTemplateText] = useState(settings.contractTemplate);
  const [cancellationText, setCancellationText] = useState(settings.cancellationPolicy);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Compute contract stats
  const signedCount = bookings.filter((b) => b.contractStatus === 'signed').length;
  const pendingCount = bookings.filter(
    (b) => b.contractStatus !== 'signed' && b.status !== 'cancelled'
  ).length;

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      contractTemplate: templateText,
      cancellationPolicy: cancellationText,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Mode Switcher */}
      <div className="bg-white rounded-2xl border border-[#7BA4D0]/20 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0D2440]">Contracts & E-Signatures</h2>
          <p className="text-xs text-slate-700 mt-1 max-w-xl">
            Auto-generate customized PDF agreements for every reservation, collect legally binding digital signatures, and preserve audit records.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-[#E7F0FA] rounded-xl border border-[#7BA4D0]/30 shrink-0">
          <button
            onClick={() => setActiveTab('agreements')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'agreements'
                ? 'bg-[#2E5E99] text-white shadow-xs'
                : 'text-[#0D2440] hover:text-[#2E5E99]'
            }`}
          >
            All Agreements ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('template')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'template'
                ? 'bg-[#2E5E99] text-white shadow-xs'
                : 'text-[#0D2440] hover:text-[#2E5E99]'
            }`}
          >
            Contract Template Editor
          </button>
        </div>
      </div>

      {activeTab === 'agreements' ? (
        /* Contracts List View */
        <div className="space-y-4">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-xl border border-[#7BA4D0]/20 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-700 block">Signed & Certified Agreements</span>
                <span className="text-2xl font-bold text-emerald-700 tabular-nums">
                  {signedCount}
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#7BA4D0]/20 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-700 block">Awaiting Client E-Signature</span>
                <span className="text-2xl font-bold text-[#2E5E99] tabular-nums">
                  {pendingCount}
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#E7F0FA] text-[#2E5E99] flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* List of Contracts */}
          <div className="bg-white rounded-2xl border border-[#7BA4D0]/20 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {bookings.map((b) => {
              const isSigned = b.contractStatus === 'signed';

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
                      {isSigned ? (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Signed & Certified
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-[#2E5E99] bg-[#E7F0FA] px-2 py-0.5 rounded border border-[#7BA4D0]/40">
                          Signature Pending
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-700 flex-wrap">
                      <span>{b.venueSpaceName}</span>
                      <span>·</span>
                      <span>Event: {formatDate(b.eventDate)}</span>
                      {isSigned && b.contractSignature && (
                        <>
                          <span>·</span>
                          <span className="text-[#0D2440] font-mono text-[11px]">
                            Signed: {new Date(b.contractSignature.signedAt).toLocaleDateString()} ({b.contractSignature.signerName})
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 justify-between md:justify-end">
                    <button
                      onClick={() => onOpenSignModal(b)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-[#0D2440] hover:bg-slate-100 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-600" />
                      <span>{isSigned ? 'View Audit Record' : 'Review & Sign'}</span>
                    </button>

                    <button
                      onClick={() => onDownloadPdf(b)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#2E5E99] text-white hover:bg-[#254b7a] shadow-xs transition-colors"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Contract Template Editor */
        <form onSubmit={handleSaveTemplate} className="bg-white rounded-2xl border border-[#7BA4D0]/20 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-[#0D2440]">Master Contract Template</h3>
              <p className="text-xs text-slate-700">
                Variables like <code className="bg-slate-100 px-1 py-0.5 rounded text-[#2E5E99] font-mono">{'{{client_name}}'}</code>,{' '}
                <code className="bg-slate-100 px-1 py-0.5 rounded text-[#2E5E99] font-mono">{'{{event_date}}'}</code>,{' '}
                <code className="bg-slate-100 px-1 py-0.5 rounded text-[#2E5E99] font-mono">{'{{total_amount}}'}</code> will be dynamically populated.
              </p>
            </div>

            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Template Saved</span>
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0D2440] uppercase tracking-wider mb-1.5">
              Cancellation & Rescheduling Policy (Clause 5)
            </label>
            <textarea
              rows={3}
              value={cancellationText}
              onChange={(e) => setCancellationText(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-[#2E5E99] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0D2440] uppercase tracking-wider mb-1.5">
              Agreement Body Content
            </label>
            <textarea
              rows={16}
              value={templateText}
              onChange={(e) => setTemplateText(e.target.value)}
              className="w-full p-3 font-mono text-xs text-slate-800 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#2E5E99] focus:outline-none leading-relaxed"
            />
          </div>

          <div className="pt-2 flex items-center justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-[#2E5E99] hover:bg-[#254b7a] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Master Template</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
