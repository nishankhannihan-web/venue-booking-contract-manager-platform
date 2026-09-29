import React from 'react';
import { Menu, Plus, Search } from 'lucide-react';
import { NavTab } from './Sidebar';

interface TopBarProps {
  currentTab: NavTab;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenNewBooking: () => void;
  onToggleMobileMenu: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  searchQuery,
  onSearchChange,
  onOpenNewBooking,
  onToggleMobileMenu,
}) => {
  const getTabTitle = (tab: NavTab): { title: string; subtitle: string } => {
    switch (tab) {
      case 'dashboard':
        return { title: 'Dashboard', subtitle: 'Overview & Action Items' };
      case 'calendar':
        return { title: 'Booking Calendar', subtitle: 'Availability & Event Schedule' };
      case 'bookings':
        return { title: 'All Bookings', subtitle: 'Manage reservations, deposits & contracts' };
      case 'payments':
        return { title: 'Deposits & Stripe', subtitle: 'Payment links & transaction history' };
      case 'contracts':
        return { title: 'Contracts & E-Sign', subtitle: 'Agreements, audit trails & templates' };
      case 'clients':
        return { title: 'Client Directory', subtitle: 'Past clients & repeat booking history' };
      case 'reminders':
        return { title: 'Reminders & Notifications', subtitle: 'Automated email & SMS dispatch' };
      case 'settings':
        return { title: 'Venue Settings', subtitle: 'Branding, pricing rules & Stripe setup' };
    }
  };

  const { title, subtitle } = getTabTitle(currentTab);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-[#7BA4D0]/20 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 -ml-1 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-[#E7F0FA] lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h2 className="text-lg font-bold text-[#0D2440] truncate tracking-tight">{title}</h2>
          <p className="text-xs text-slate-700 hidden sm:block truncate">{subtitle}</p>
        </div>
      </div>

      {/* Middle: Search input */}
      <div className="flex-1 max-w-md mx-2 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search client, booking ref, event..."
            className="w-full pl-9 pr-4 py-2 bg-[#E7F0FA]/50 border border-[#7BA4D0]/30 rounded-xl text-xs sm:text-sm text-[#0D2440] placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#2E5E99] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Right: Primary action */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onOpenNewBooking}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2E5E99] hover:bg-[#254b7a] active:bg-[#1f3f66] text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow-sm transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Booking</span>
        </button>
      </div>
    </header>
  );
};
