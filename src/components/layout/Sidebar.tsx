import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  CalendarCheck,
  CreditCard,
  FileText,
  Users,
  BellRing,
  Settings,
  CheckCircle2,
  X,
} from 'lucide-react';
import { VenueSettings } from '../../types';

export type NavTab =
  | 'dashboard'
  | 'calendar'
  | 'bookings'
  | 'payments'
  | 'contracts'
  | 'clients'
  | 'reminders'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingDepositsCount: number;
  unsignedContractsCount: number;
  settings: VenueSettings;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  pendingDepositsCount,
  unsignedContractsCount,
  settings,
  mobileOpen,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'calendar' as NavTab,
      label: 'Calendar',
      icon: CalendarDays,
    },
    {
      id: 'bookings' as NavTab,
      label: 'Bookings',
      icon: CalendarCheck,
    },
    {
      id: 'payments' as NavTab,
      label: 'Deposits & Stripe',
      icon: CreditCard,
      badge: pendingDepositsCount > 0 ? `${pendingDepositsCount} pending` : undefined,
      badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300',
    },
    {
      id: 'contracts' as NavTab,
      label: 'Contracts',
      icon: FileText,
      badge: unsignedContractsCount > 0 ? `${unsignedContractsCount} unsent` : undefined,
      badgeColor: 'bg-[#E7F0FA] text-[#2E5E99] border border-[#7BA4D0]',
    },
    {
      id: 'clients' as NavTab,
      label: 'Clients',
      icon: Users,
    },
    {
      id: 'reminders' as NavTab,
      label: 'Reminders',
      icon: BellRing,
    },
    {
      id: 'settings' as NavTab,
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-[#7BA4D0]/20 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[#7BA4D0]/15 flex items-center justify-between">
          <div className="overflow-hidden">
            <h1 className="text-base font-bold text-[#0D2440] truncate leading-tight">
              {settings.venueName}
            </h1>
            <p className="text-xs text-slate-700 truncate font-medium">Boutique Venue Manager</p>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#2E5E99] text-white shadow-xs'
                    : 'text-[#0D2440] hover:bg-[#E7F0FA]/70 hover:text-[#2E5E99]'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-700'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md shrink-0 ml-1.5 ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Stripe Connection & Footer Status */}
        <div className="p-3 border-t border-[#7BA4D0]/15">
          <div className="p-3 rounded-xl bg-[#E7F0FA]/60 border border-[#7BA4D0]/25">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-[#0D2440] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Stripe Connected
              </span>
              <span className="text-[10px] uppercase font-bold text-[#2E5E99] bg-[#E7F0FA] px-1.5 py-0.5 rounded border border-[#7BA4D0]/30">
                Test Mode
              </span>
            </div>
            <p className="text-[11px] text-slate-700 leading-tight">
              50% automatic deposit links & instant card capture active.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
