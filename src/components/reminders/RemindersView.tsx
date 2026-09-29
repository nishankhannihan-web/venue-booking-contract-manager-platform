import React, { useState } from 'react';
import {
  BellRing,
  CheckCircle2,
  Clock,
  Mail,
  MessageSquare,
  Send,
  User,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { Booking, ReminderItem, VenueSettings } from '../../types';
import { formatDate } from '../../utils/formatters';

interface RemindersViewProps {
  bookings: Booking[];
  settings: VenueSettings;
  onSendReminder: (bookingId: string, reminderId: string) => void;
  onUpdateSettings: (newSettings: VenueSettings) => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  bookings,
  settings,
  onSendReminder,
  onUpdateSettings,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'sent'>('all');
  const [selectedPreviewReminder, setSelectedPreviewReminder] = useState<{
    booking: Booking;
    reminder: ReminderItem;
  } | null>(null);

  // Flatten all reminders with booking details
  const allReminderEntries: Array<{ booking: Booking; reminder: ReminderItem }> = [];
  bookings.forEach((b) => {
    b.reminders.forEach((r) => {
      allReminderEntries.push({ booking: b, reminder: r });
    });
  });

  const filtered = allReminderEntries.filter((item) => {
    if (filter === 'pending') return !item.reminder.sent;
    if (filter === 'sent') return item.reminder.sent;
    return true;
  });

  const pendingCount = allReminderEntries.filter((i) => !i.reminder.sent).length;
  const sentCount = allReminderEntries.filter((i) => i.reminder.sent).length;

  const handleToggleAutomations = (enabled: boolean) => {
    onUpdateSettings({
      ...settings,
      remindersEnabled: enabled,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#7BA4D0]/20 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0D2440]">Automated Reminders & Dispatch</h2>
          <p className="text-xs text-slate-700 mt-1 max-w-xl">
            Reliably notify clients 7 days and 24 hours prior to load-in, prompt for missing deposits/contracts, and receive morning checklists on your phone.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#E7F0FA]/60 p-3 rounded-xl border border-[#7BA4D0]/30 shrink-0">
          <div className="text-right">
            <span className="text-xs font-bold text-[#0D2440] block">Automated Dispatch Engine</span>
            <span className="text-[11px] text-slate-700">
              {settings.remindersEnabled ? 'Active & monitoring dates' : 'Paused'}
            </span>
          </div>
          <button
            onClick={() => handleToggleAutomations(!settings.remindersEnabled)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              settings.remindersEnabled ? 'bg-[#2E5E99]' : 'bg-slate-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                settings.remindersEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Rules Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-[#7BA4D0]/20 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-[#2E5E99] uppercase tracking-wider">
            Rule 1 · 7 Days Prior
          </span>
          <h4 className="text-sm font-bold text-[#0D2440]">Load-in & Balance Reminder</h4>
          <p className="text-xs text-slate-700">
            Automatically sends venue access rules, vendor timing, and reminds of balance due date.
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#7BA4D0]/20 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-[#2E5E99] uppercase tracking-wider">
            Rule 2 · 24 Hours Prior
          </span>
          <h4 className="text-sm font-bold text-[#0D2440]">Keycode & Parking SMS</h4>
          <p className="text-xs text-slate-700">
            Sends client immediate SMS with front door keypad code, elevator access, and street parking.
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#7BA4D0]/20 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-[#2E5E99] uppercase tracking-wider">
            Rule 3 · Morning Of Event
          </span>
          <h4 className="text-sm font-bold text-[#0D2440]">Owner Morning Checklist</h4>
          <p className="text-xs text-slate-700">
            Alerts you (Elena) at 7:00 AM with equipment checklist, coffee prep, and client phone.
          </p>
        </div>
      </div>

      {/* Reminders Dispatch Queue Table */}
      <div className="bg-white rounded-2xl border border-[#7BA4D0]/20 shadow-xs overflow-hidden">
        {/* Table Filters */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-[#E7F0FA] rounded-xl border border-[#7BA4D0]/30">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-[#2E5E99] text-white shadow-xs'
                  : 'text-[#0D2440] hover:text-[#2E5E99]'
              }`}
            >
              All Notifications ({allReminderEntries.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filter === 'pending'
                  ? 'bg-[#2E5E99] text-white shadow-xs'
                  : 'text-[#0D2440] hover:text-[#2E5E99]'
              }`}
            >
              Scheduled ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('sent')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filter === 'sent'
                  ? 'bg-[#2E5E99] text-white shadow-xs'
                  : 'text-[#0D2440] hover:text-[#2E5E99]'
              }`}
            >
              Dispatched ({sentCount})
            </button>
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-700">
              No notifications found matching this status filter.
            </div>
          ) : (
            filtered.map(({ booking, reminder }) => {
              const isSent = reminder.sent;

              return (
                <div
                  key={`${booking.id}-${reminder.id}`}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#E7F0FA]/20 transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#0D2440]">
                        {booking.bookingRef}
                      </span>
                      <span className="text-xs text-slate-700">·</span>
                      <h4 className="text-sm font-bold text-[#0D2440] truncate">
                        {reminder.title}
                      </h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {reminder.channel}
                      </span>
                      {isSent ? (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Dispatched
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Scheduled for {formatDate(reminder.scheduledDate)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-700 flex-wrap">
                      <span>Recipient: {reminder.recipient === 'owner' ? `Venue Owner (${settings.ownerName})` : booking.clientName}</span>
                      <span>·</span>
                      <span>Event: {formatDate(booking.eventDate)} ({booking.venueSpaceName})</span>
                      {isSent && reminder.sentAt && (
                        <>
                          <span>·</span>
                          <span className="text-slate-700">
                            Delivered {new Date(reminder.sentAt).toLocaleString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 justify-between md:justify-end">
                    <button
                      onClick={() => setSelectedPreviewReminder({ booking, reminder })}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#0D2440] rounded-lg text-xs font-semibold transition-colors"
                    >
                      Preview Text
                    </button>

                    {!isSent && (
                      <button
                        onClick={() => onSendReminder(booking.id, reminder.id)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2E5E99] hover:bg-[#254b7a] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Now</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Message Preview Modal */}
      {selectedPreviewReminder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-[#0D2440]">
                  {selectedPreviewReminder.reminder.title}
                </h4>
                <p className="text-[11px] text-slate-700">
                  Via {selectedPreviewReminder.reminder.channel.toUpperCase()} to{' '}
                  {selectedPreviewReminder.reminder.recipient === 'owner'
                    ? settings.ownerEmail
                    : selectedPreviewReminder.booking.clientEmail}
                </p>
              </div>
              <button
                onClick={() => setSelectedPreviewReminder(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 space-y-2 leading-relaxed">
              <p>
                <strong>Subject:</strong> {selectedPreviewReminder.reminder.title} - {settings.venueName}
              </p>
              <p>
                Hello {selectedPreviewReminder.reminder.recipient === 'owner' ? settings.ownerName : selectedPreviewReminder.booking.clientName},
              </p>
              <p>
                This is a quick notification regarding reservation <strong>{selectedPreviewReminder.booking.bookingRef}</strong> on{' '}
                <strong>{formatDate(selectedPreviewReminder.booking.eventDate)}</strong> at {selectedPreviewReminder.booking.venueSpaceName}.
              </p>
              <p>
                Please verify load-in times, parking instructions, and complete any outstanding holding deposit or digital contract prior to arrival.
              </p>
              <p className="text-slate-700 pt-2 border-t border-slate-200">
                — {settings.venueName} Team ({settings.ownerPhone})
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedPreviewReminder(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-xs font-semibold text-[#0D2440] rounded-xl transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
