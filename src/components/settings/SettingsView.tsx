import React, { useState } from 'react';
import {
  Save,
  Check,
  Building2,
  CreditCard,
  FileText,
  ShieldCheck,
  Download,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import { VenueSettings, Booking, Client } from '../../types';

interface SettingsViewProps {
  settings: VenueSettings;
  bookings: Booking[];
  clients: Client[];
  onUpdateSettings: (newSettings: VenueSettings) => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  bookings,
  clients,
  onUpdateSettings,
  onResetData,
}) => {
  const [form, setForm] = useState<VenueSettings>(settings);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(form);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleExportData = () => {
    const data = {
      venueSettings: form,
      bookings,
      clients,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AtelierVenue_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-[#7BA4D0]/20 p-5 sm:p-6 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0D2440]">Venue & Account Settings</h2>
          <p className="text-xs text-slate-700 mt-1">
            Configure your studio branding, Stripe account credentials, default deposit rules, and compliance data.
          </p>
        </div>

        {isSaved && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>Settings Saved!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Venue Profile & Branding */}
        <div className="bg-white rounded-2xl border border-[#7BA4D0]/20 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-[#2E5E99]" />
            <h3 className="text-base font-bold text-[#0D2440]">Venue Profile & Contact</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Venue Business Name *
              </label>
              <input
                type="text"
                required
                value={form.venueName}
                onChange={(e) => setForm({ ...form, venueName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#2E5E99] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Owner / Manager Full Name *
              </label>
              <input
                type="text"
                required
                value={form.ownerName}
                onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#2E5E99] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Owner Notification Email *
              </label>
              <input
                type="email"
                required
                value={form.ownerEmail}
                onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#2E5E99] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Public Studio Phone *
              </label>
              <input
                type="text"
                required
                value={form.ownerPhone}
                onChange={(e) => setForm({ ...form, ownerPhone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#2E5E99] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Physical Venue Street Address
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#2E5E99] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                City, State, Zip
              </label>
              <input
                type="text"
                value={form.cityStateZip}
                onChange={(e) => setForm({ ...form, cityStateZip: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#2E5E99] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Website URL
              </label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#2E5E99] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. Stripe Connection & Deposit Rules */}
        <div className="bg-white rounded-2xl border border-[#7BA4D0]/20 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <CreditCard className="w-5 h-5 text-[#2E5E99]" />
            <h3 className="text-base font-bold text-[#0D2440]">Stripe & Deposit Rules</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Required Holding Deposit (%)
              </label>
              <select
                value={form.defaultDepositPercentage}
                onChange={(e) =>
                  setForm({ ...form, defaultDepositPercentage: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-[#2E5E99] focus:outline-none"
              >
                <option value="25">25% Deposit</option>
                <option value="33">33% Deposit</option>
                <option value="50">50% Standard Deposit</option>
                <option value="100">100% Full Payment Required</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Connected Stripe Account ID
              </label>
              <input
                type="text"
                value={form.stripeAccountId}
                onChange={(e) => setForm({ ...form, stripeAccountId: e.target.value })}
                className="w-full px-3 py-2 font-mono border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#2E5E99] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-xs font-bold text-[#0D2440] block">Stripe Test Mode Simulation</span>
                <span className="text-[11px] text-slate-700">
                  Allows testing deposit checkout flows without real card charges.
                </span>
              </div>
              <input
                type="checkbox"
                checked={form.stripeTestMode}
                onChange={(e) => setForm({ ...form, stripeTestMode: e.target.checked })}
                className="w-4 h-4 rounded text-[#2E5E99] focus:ring-[#2E5E99]"
              />
            </div>
          </div>
        </div>

        {/* 3. Venue Spaces Catalog */}
        <div className="bg-white rounded-2xl border border-[#7BA4D0]/20 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-[#0D2440]">Configured Venue Spaces</h3>
            <span className="text-xs text-slate-700">{form.spaces.length} Spaces Active</span>
          </div>

          <div className="space-y-3">
            {form.spaces.map((sp, idx) => (
              <div
                key={sp.id}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[#0D2440]">{sp.name}</h4>
                  <p className="text-xs text-slate-700 max-w-lg">{sp.description}</p>
                  <p className="text-[11px] text-slate-700">Capacity: {sp.capacity} people · Min hours: {sp.minHours}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-slate-700">Rate:</span>
                  <div className="flex items-center">
                    <span className="text-xs text-slate-700 mr-1">$</span>
                    <input
                      type="number"
                      value={sp.hourlyRate}
                      onChange={(e) => {
                        const newSpaces = [...form.spaces];
                        newSpaces[idx].hourlyRate = Number(e.target.value);
                        setForm({ ...form, spaces: newSpaces });
                      }}
                      className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-[#0D2440] tabular-nums"
                    />
                    <span className="text-xs text-slate-700 ml-1">/hr</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Privacy, Compliance & Data Export */}
        <div className="bg-white rounded-2xl border border-[#7BA4D0]/20 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-[#0D2440]">Data Privacy & Backup</h3>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed">
            Client contact info and signed contract audit records are stored securely in browser storage.
            Raw credit card information is processed directly by Stripe Checkout and never handled by this server, fulfilling PCI-DSS SAQ-A requirements.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExportData}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#E7F0FA] hover:bg-[#7BA4D0]/20 text-[#2E5E99] rounded-xl text-xs font-bold border border-[#7BA4D0]/40 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export All Bookings & Client Data (JSON)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (confirm('Are you sure you want to restore default sample bookings and settings?')) {
                  onResetData();
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset to Sample Data</span>
            </button>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-[#2E5E99] hover:bg-[#254b7a] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save All Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
};
