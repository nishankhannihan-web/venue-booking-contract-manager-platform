import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { DashboardView } from './components/dashboard/DashboardView';
import { CalendarView } from './components/calendar/CalendarView';
import { BookingsListView } from './components/bookings/BookingsListView';
import { NewBookingModal } from './components/bookings/NewBookingModal';
import { BookingDetailModal } from './components/bookings/BookingDetailModal';
import { PaymentsView } from './components/payments/PaymentsView';
import { StripeCheckoutModal } from './components/payments/StripeCheckoutModal';
import { ContractsView } from './components/contracts/ContractsView';
import { SignContractModal } from './components/contracts/SignContractModal';
import { ClientsView } from './components/clients/ClientsView';
import { RemindersView } from './components/reminders/RemindersView';
import { SettingsView } from './components/settings/SettingsView';
import { ReceiptModal } from './components/common/ReceiptModal';
import { ConfirmDialog } from './components/common/ConfirmDialog';
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { Booking, Client, ContractSignature, VenueSettings } from './types';
import { storageService } from './services/storageService';
import { pdfService } from './services/pdfService';

export default function App() {
  const [settings, setSettings] = useState<VenueSettings>(storageService.getSettings());
  const [bookings, setBookings] = useState<Booking[]>(storageService.getBookings());
  const [clients, setClients] = useState<Client[]>(storageService.getClients());

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals state
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [newBookingPreDate, setNewBookingPreDate] = useState<string | undefined>(undefined);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [paymentBooking, setPaymentBooking] = useState<Booking | null>(null);
  const [signBooking, setSignBooking] = useState<Booking | null>(null);
  const [receiptBooking, setReceiptBooking] = useState<Booking | null>(null);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync state helpers
  const refreshData = () => {
    setBookings(storageService.getBookings());
    setClients(storageService.getClients());
    setSettings(storageService.getSettings());
  };

  // Handlers
  const handleCreateBooking = (
    newBookingData: Omit<Booking, 'id' | 'bookingRef' | 'createdAt' | 'updatedAt' | 'reminders'>
  ) => {
    const created = storageService.createBooking(newBookingData);
    refreshData();
    addToast('success', `Booking ${created.bookingRef} created for ${created.clientName}`);
    setSelectedBooking(created);
  };

  const handleOpenPaymentModal = (booking: Booking) => {
    setPaymentBooking(booking);
  };

  const handlePaymentSuccess = (
    bookingId: string,
    details: { transactionId: string; paymentMethod: string }
  ) => {
    const updated = storageService.markDepositPaid(bookingId, details);
    refreshData();
    if (updated) {
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking(updated);
      }
      addToast(
        'success',
        `Deposit of $${updated.depositAmount} secured for ${updated.bookingRef} via Stripe!`
      );
    }
  };

  const handleOpenSignModal = (booking: Booking) => {
    setSignBooking(booking);
  };

  const handleSignContract = (bookingId: string, signature: ContractSignature) => {
    const updated = storageService.saveContractSignature(bookingId, signature);
    refreshData();
    if (updated) {
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking(updated);
      }
      addToast('success', `Agreement digitally executed & certified for ${updated.clientName}`);
    }
  };

  const handleCopyPaymentLink = (booking: Booking) => {
    const link =
      booking.stripePaymentUrl ||
      `https://buy.stripe.com/test_lumiere_${booking.id.slice(-6)}`;
    try {
      navigator.clipboard.writeText(link);
      addToast('success', `Stripe Payment Link copied to clipboard!`);
    } catch {
      addToast('info', `Payment Link: ${link}`);
    }
  };

  const handleDownloadContractPdf = (booking: Booking) => {
    try {
      pdfService.generateContractPdf(booking, settings);
      addToast('success', `Generated Contract PDF for ${booking.bookingRef}`);
    } catch (e) {
      console.error(e);
      addToast('error', 'Error generating contract PDF');
    }
  };

  const handleDownloadReceiptPdf = (booking: Booking) => {
    try {
      pdfService.generateReceiptPdf(booking, settings);
      addToast('success', `Generated Payment Receipt for ${booking.bookingRef}`);
    } catch (e) {
      console.error(e);
      addToast('error', 'Error generating receipt PDF');
    }
  };

  const handleSendReminder = (bookingId: string, reminderId: string) => {
    const updated = storageService.sendReminder(bookingId, reminderId);
    refreshData();
    if (updated && selectedBooking?.id === bookingId) {
      setSelectedBooking(updated);
    }
    addToast('success', 'Automated reminder dispatched successfully!');
  };

  const handleConfirmCancelBooking = () => {
    if (!bookingToCancel) return;
    const cancelled = storageService.cancelBooking(bookingToCancel.id, 'Cancelled by venue operator');
    refreshData();
    if (selectedBooking?.id === bookingToCancel.id && cancelled) {
      setSelectedBooking(cancelled);
    }
    setBookingToCancel(null);
    addToast('info', `Booking ${bookingToCancel.bookingRef} marked as cancelled.`);
  };

  const handleUpdateSettings = (newSettings: VenueSettings) => {
    storageService.saveSettings(newSettings);
    setSettings(newSettings);
    addToast('success', 'Venue settings updated successfully');
  };

  const handleResetData = () => {
    storageService.resetToDefaults();
    refreshData();
    addToast('info', 'Reset venue database to default sample records.');
  };

  const pendingDepositsCount = bookings.filter(
    (b) => (b.status === 'pending_deposit' || b.paymentStatus === 'unpaid') && b.status !== 'cancelled'
  ).length;

  const unsignedContractsCount = bookings.filter(
    (b) => b.contractStatus !== 'signed' && b.status !== 'cancelled'
  ).length;

  return (
    <div className="min-h-screen bg-[#E7F0FA] flex text-[#0D2440]">
      {/* Left Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        pendingDepositsCount={pendingDepositsCount}
        unsignedContractsCount={unsignedContractsCount}
        settings={settings}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <TopBar
          currentTab={currentTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenNewBooking={() => {
            setNewBookingPreDate(undefined);
            setIsNewBookingOpen(true);
          }}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {currentTab === 'dashboard' && (
            <DashboardView
              bookings={bookings}
              settings={settings}
              onSelectBooking={setSelectedBooking}
              onOpenNewBooking={() => {
                setNewBookingPreDate(undefined);
                setIsNewBookingOpen(true);
              }}
              onOpenPaymentModal={handleOpenPaymentModal}
              onOpenSignModal={handleOpenSignModal}
              onCopyPaymentLink={handleCopyPaymentLink}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'calendar' && (
            <CalendarView
              bookings={bookings}
              settings={settings}
              onSelectBooking={setSelectedBooking}
              onNewBookingWithDate={(date) => {
                setNewBookingPreDate(date);
                setIsNewBookingOpen(true);
              }}
            />
          )}

          {currentTab === 'bookings' && (
            <BookingsListView
              bookings={bookings}
              settings={settings}
              searchQuery={searchQuery}
              onSelectBooking={setSelectedBooking}
              onOpenNewBooking={() => {
                setNewBookingPreDate(undefined);
                setIsNewBookingOpen(true);
              }}
              onOpenPaymentModal={handleOpenPaymentModal}
              onOpenSignModal={handleOpenSignModal}
              onCopyPaymentLink={handleCopyPaymentLink}
              onDownloadContractPdf={handleDownloadContractPdf}
              onCancelBooking={setBookingToCancel}
            />
          )}

          {currentTab === 'payments' && (
            <PaymentsView
              bookings={bookings}
              settings={settings}
              onOpenPaymentModal={handleOpenPaymentModal}
              onCopyPaymentLink={handleCopyPaymentLink}
              onDownloadReceipt={(b) => setReceiptBooking(b)}
              onUpdateSettings={handleUpdateSettings}
            />
          )}

          {currentTab === 'contracts' && (
            <ContractsView
              bookings={bookings}
              settings={settings}
              onOpenSignModal={handleOpenSignModal}
              onDownloadPdf={handleDownloadContractPdf}
              onUpdateSettings={handleUpdateSettings}
            />
          )}

          {currentTab === 'clients' && (
            <ClientsView
              clients={clients}
              bookings={bookings}
              settings={settings}
              onSelectBooking={setSelectedBooking}
              onOpenNewBookingForClient={(client) => {
                setIsNewBookingOpen(true);
              }}
            />
          )}

          {currentTab === 'reminders' && (
            <RemindersView
              bookings={bookings}
              settings={settings}
              onSendReminder={handleSendReminder}
              onUpdateSettings={handleUpdateSettings}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              settings={settings}
              bookings={bookings}
              clients={clients}
              onUpdateSettings={handleUpdateSettings}
              onResetData={handleResetData}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <NewBookingModal
        isOpen={isNewBookingOpen}
        onClose={() => setIsNewBookingOpen(false)}
        clients={clients}
        settings={settings}
        preselectedDate={newBookingPreDate}
        onCreateBooking={handleCreateBooking}
      />

      <BookingDetailModal
        booking={selectedBooking}
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        settings={settings}
        onOpenPaymentModal={(b) => {
          setSelectedBooking(null);
          handleOpenPaymentModal(b);
        }}
        onOpenSignModal={(b) => {
          setSelectedBooking(null);
          handleOpenSignModal(b);
        }}
        onCopyPaymentLink={handleCopyPaymentLink}
        onDownloadContractPdf={handleDownloadContractPdf}
        onDownloadReceiptPdf={(b) => setReceiptBooking(b)}
        onSendReminder={handleSendReminder}
        onCancelBooking={(b) => {
          setSelectedBooking(null);
          setBookingToCancel(b);
        }}
      />

      <StripeCheckoutModal
        booking={paymentBooking}
        isOpen={!!paymentBooking}
        onClose={() => setPaymentBooking(null)}
        settings={settings}
        onPaymentSuccess={handlePaymentSuccess}
        onDownloadReceipt={(b) => {
          setPaymentBooking(null);
          setReceiptBooking(b);
        }}
      />

      <SignContractModal
        booking={signBooking}
        isOpen={!!signBooking}
        onClose={() => setSignBooking(null)}
        settings={settings}
        onSignContract={handleSignContract}
        onDownloadPdf={handleDownloadContractPdf}
      />

      <ReceiptModal
        booking={receiptBooking}
        isOpen={!!receiptBooking}
        onClose={() => setReceiptBooking(null)}
        settings={settings}
        onDownloadPdf={handleDownloadReceiptPdf}
      />

      <ConfirmDialog
        isOpen={!!bookingToCancel}
        title="Cancel This Booking?"
        message={`Are you sure you want to cancel reservation ${bookingToCancel?.bookingRef} for ${bookingToCancel?.clientName}? The reserved date will be released.`}
        confirmText="Yes, Cancel Booking"
        onConfirm={handleConfirmCancelBooking}
        onCancel={() => setBookingToCancel(null)}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
