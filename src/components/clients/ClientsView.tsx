import React, { useState } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  Building2,
  CalendarCheck,
  DollarSign,
  Plus,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Booking, Client, VenueSettings } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface ClientsViewProps {
  clients: Client[];
  bookings: Booking[];
  settings: VenueSettings;
  onSelectBooking: (booking: Booking) => void;
  onOpenNewBookingForClient: (client: Client) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  bookings,
  settings,
  onSelectBooking,
  onOpenNewBookingForClient,
}) => {
  const [search, setSearch] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(clients[0]?.id || null);

  const filteredClients = clients.filter((c) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.company && c.company.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const selectedClient = clients.find((c) => c.id === selectedClientId) || clients[0];
  const clientBookings = selectedClient
    ? bookings.filter(
        (b) =>
          b.clientId === selectedClient.id ||
          b.clientEmail.toLowerCase() === selectedClient.email.toLowerCase()
      )
    : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-[#7BA4D0]/20 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0D2440]">Client Directory</h2>
          <p className="text-xs text-slate-700 mt-1 max-w-xl">
            Keep track of corporate clients, photographers, event planners, and repeat renters with their booking history and lifetime spend.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients by name, email, brand..."
            className="w-full pl-9 pr-3 py-2 bg-[#E7F0FA]/40 border border-[#7BA4D0]/30 rounded-xl text-xs sm:text-sm text-[#0D2440] focus:ring-2 focus:ring-[#2E5E99] focus:outline-none"
          />
        </div>
      </div>

      {/* 2-Column Layout: Clients List on Left, Selected Client Details & Bookings on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Client List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#7BA4D0]/20 shadow-xs divide-y divide-slate-100 overflow-hidden">
          <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
            <span>{filteredClients.length} Clients Found</span>
            <span>Lifetime Spend</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {filteredClients.map((client) => {
              const isSelected = selectedClient?.id === client.id;
              return (
                <button
                  key={client.id}
                  onClick={() => setSelectedClientId(client.id)}
                  className={`w-full text-left p-4 transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#E7F0FA]/70 border-l-4 border-l-[#2E5E99]'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <h4 className="text-sm font-bold text-[#0D2440] truncate">{client.name}</h4>
                    {client.company && (
                      <p className="text-xs text-slate-700 truncate">{client.company}</p>
                    )}
                    <p className="text-xs text-slate-700 truncate">{client.email}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-[#0D2440] tabular-nums block">
                      {formatCurrency(client.totalSpent)}
                    </span>
                    <span className="text-[11px] text-[#2E5E99] font-semibold bg-[#E7F0FA] px-1.5 py-0.5 rounded border border-[#7BA4D0]/30">
                      {client.totalBookings} {client.totalBookings === 1 ? 'booking' : 'bookings'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Client Profile & Booking History (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedClient ? (
            <div className="bg-white rounded-2xl border border-[#7BA4D0]/20 p-6 shadow-xs space-y-6">
              {/* Profile Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-[#0D2440]">{selectedClient.name}</h3>
                    {selectedClient.company && (
                      <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {selectedClient.company}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-700 mt-1 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-600" />
                      {selectedClient.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-600" />
                      {selectedClient.phone || 'No phone'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenNewBookingForClient(selectedClient)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-[#2E5E99] hover:bg-[#254b7a] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Book This Client</span>
                </button>
              </div>

              {/* Notes if any */}
              {selectedClient.notes && (
                <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/60 text-xs">
                  <span className="font-bold text-amber-900 block mb-0.5">Client Notes & Preferences:</span>
                  <p className="text-amber-950 leading-relaxed">{selectedClient.notes}</p>
                </div>
              )}

              {/* Booking History for this client */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#0D2440] uppercase tracking-wider">
                  Reservation History ({clientBookings.length})
                </h4>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {clientBookings.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-700">
                      No active bookings recorded for this client.
                    </div>
                  ) : (
                    clientBookings.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => onSelectBooking(b)}
                        className="p-3.5 hover:bg-[#E7F0FA]/30 flex items-center justify-between gap-3 cursor-pointer transition-colors text-xs"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#0D2440]">{b.bookingRef}</span>
                            <span className="font-semibold text-[#0D2440] truncate">{b.eventType}</span>
                          </div>
                          <p className="text-slate-700">
                            {formatDate(b.eventDate)} ({b.venueSpaceName})
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-bold text-[#0D2440] block tabular-nums">
                            {formatCurrency(b.totalAmount)}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-semibold">
                            {b.paymentStatus === 'deposit_paid' ? 'Deposit Paid' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#7BA4D0]/20 p-12 text-center text-xs text-slate-700">
              Select a client to view their booking history.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
