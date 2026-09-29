import { Booking, Client, VenueSettings, ContractSignature } from '../types';
import { INITIAL_BOOKINGS, INITIAL_CLIENTS, INITIAL_SETTINGS } from '../data/initialData';

const SETTINGS_KEY = 'ateliervenue_settings_v1';
const BOOKINGS_KEY = 'ateliervenue_bookings_v1';
const CLIENTS_KEY = 'ateliervenue_clients_v1';

export const storageService = {
  getSettings(): VenueSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error reading settings from localStorage', e);
    }
    return INITIAL_SETTINGS;
  },

  saveSettings(settings: VenueSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings', e);
    }
  },

  getBookings(): Booking[] {
    try {
      const data = localStorage.getItem(BOOKINGS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error reading bookings from localStorage', e);
    }
    return INITIAL_BOOKINGS;
  },

  saveBookings(bookings: Booking[]): void {
    try {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    } catch (e) {
      console.error('Error saving bookings', e);
    }
  },

  getClients(): Client[] {
    try {
      const data = localStorage.getItem(CLIENTS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error reading clients from localStorage', e);
    }
    return INITIAL_CLIENTS;
  },

  saveClients(clients: Client[]): void {
    try {
      localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
    } catch (e) {
      console.error('Error saving clients', e);
    }
  },

  createBooking(newBookingData: Omit<Booking, 'id' | 'bookingRef' | 'createdAt' | 'updatedAt' | 'reminders'>): Booking {
    const bookings = this.getBookings();
    const clients = this.getClients();
    
    // Generate clean ref e.g. BK-9406
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingRef = `BK-${randomSuffix}`;
    const id = `bk_${Date.now()}`;
    const now = new Date().toISOString();

    const reminders = [
      {
        id: `rem_${Date.now()}_1`,
        type: 'deposit_request' as const,
        title: `Deposit Payment Link ($${newBookingData.depositAmount})`,
        scheduledDate: newBookingData.eventDate,
        sent: false,
        channel: 'email' as const,
        recipient: 'client' as const,
      },
      {
        id: `rem_${Date.now()}_2`,
        type: '7_days_prior' as const,
        title: '7-Day Event Countdown & Check-in',
        scheduledDate: newBookingData.eventDate,
        sent: false,
        channel: 'email' as const,
        recipient: 'client' as const,
      },
      {
        id: `rem_${Date.now()}_3`,
        type: '24_hours_prior' as const,
        title: '24-Hour Studio Access Codes & Parking Info',
        scheduledDate: newBookingData.eventDate,
        sent: false,
        channel: 'sms' as const,
        recipient: 'client' as const,
      },
      {
        id: `rem_${Date.now()}_4`,
        type: 'owner_prep' as const,
        title: `Day-of Prep: ${newBookingData.venueSpaceName}`,
        scheduledDate: newBookingData.eventDate,
        sent: false,
        channel: 'sms' as const,
        recipient: 'owner' as const,
      },
    ];

    const newBooking: Booking = {
      ...newBookingData,
      id,
      bookingRef,
      reminders,
      stripePaymentUrl: `https://buy.stripe.com/test_lumiere_${id.slice(-6)}`,
      createdAt: now,
      updatedAt: now,
    };

    // Update or add client
    let client = clients.find((c) => c.email.toLowerCase() === newBooking.clientEmail.toLowerCase());
    if (client) {
      client.totalBookings += 1;
      client.totalSpent += newBooking.totalAmount;
    } else {
      client = {
        id: newBooking.clientId || `cli_${Date.now()}`,
        name: newBooking.clientName,
        email: newBooking.clientEmail,
        phone: newBooking.clientPhone,
        company: newBooking.clientCompany,
        totalBookings: 1,
        totalSpent: newBooking.totalAmount,
        createdAt: now,
      };
      clients.push(client);
    }
    this.saveClients(clients);

    bookings.unshift(newBooking);
    this.saveBookings(bookings);
    return newBooking;
  },

  updateBooking(updated: Booking): void {
    const bookings = this.getBookings();
    const index = bookings.findIndex((b) => b.id === updated.id);
    if (index !== -1) {
      bookings[index] = {
        ...updated,
        updatedAt: new Date().toISOString(),
      };
      this.saveBookings(bookings);
    }
  },

  cancelBooking(bookingId: string, reason?: string): Booking | null {
    const bookings = this.getBookings();
    const index = bookings.findIndex((b) => b.id === bookingId);
    if (index !== -1) {
      bookings[index].status = 'cancelled';
      if (reason) {
        bookings[index].notes = `${bookings[index].notes ? bookings[index].notes + ' | ' : ''}Cancellation Reason: ${reason}`;
      }
      bookings[index].updatedAt = new Date().toISOString();
      this.saveBookings(bookings);
      return bookings[index];
    }
    return null;
  },

  deleteBooking(bookingId: string): void {
    const bookings = this.getBookings().filter((b) => b.id !== bookingId);
    this.saveBookings(bookings);
  },

  markDepositPaid(
    bookingId: string,
    details?: { transactionId?: string; paymentMethod?: string; paidAt?: string }
  ): Booking | null {
    const bookings = this.getBookings();
    const index = bookings.findIndex((b) => b.id === bookingId);
    if (index !== -1) {
      const b = bookings[index];
      b.paymentStatus = 'deposit_paid';
      b.depositPaidAt = details?.paidAt || new Date().toISOString();
      b.depositTransactionId = details?.transactionId || `pi_3P${Math.random().toString(36).substring(2, 9)}Dep`;
      b.paymentMethod = details?.paymentMethod || 'Visa •••• 4242 (Stripe Checkout)';

      // If contract is also signed, advance status to confirmed
      if (b.contractStatus === 'signed') {
        b.status = 'confirmed';
      } else {
        b.status = 'deposit_paid';
      }

      // Mark deposit reminder as sent
      b.reminders = b.reminders.map((r) =>
        r.type === 'deposit_request' ? { ...r, sent: true, sentAt: new Date().toISOString() } : r
      );

      b.updatedAt = new Date().toISOString();
      this.saveBookings(bookings);
      return b;
    }
    return null;
  },

  saveContractSignature(bookingId: string, signature: ContractSignature): Booking | null {
    const bookings = this.getBookings();
    const index = bookings.findIndex((b) => b.id === bookingId);
    if (index !== -1) {
      const b = bookings[index];
      b.contractStatus = 'signed';
      b.contractSignedAt = signature.signedAt;
      b.contractSignature = signature;

      // If deposit is also paid, advance to confirmed
      if (b.paymentStatus === 'deposit_paid' || b.paymentStatus === 'paid_in_full') {
        b.status = 'confirmed';
      } else {
        b.status = 'contract_signed';
      }

      b.updatedAt = new Date().toISOString();
      this.saveBookings(bookings);
      return b;
    }
    return null;
  },

  markContractSent(bookingId: string): Booking | null {
    const bookings = this.getBookings();
    const index = bookings.findIndex((b) => b.id === bookingId);
    if (index !== -1) {
      bookings[index].contractStatus = 'sent';
      bookings[index].contractSentAt = new Date().toISOString();
      bookings[index].updatedAt = new Date().toISOString();
      this.saveBookings(bookings);
      return bookings[index];
    }
    return null;
  },

  sendReminder(bookingId: string, reminderId: string): Booking | null {
    const bookings = this.getBookings();
    const index = bookings.findIndex((b) => b.id === bookingId);
    if (index !== -1) {
      bookings[index].reminders = bookings[index].reminders.map((rem) =>
        rem.id === reminderId ? { ...rem, sent: true, sentAt: new Date().toISOString() } : rem
      );
      bookings[index].updatedAt = new Date().toISOString();
      this.saveBookings(bookings);
      return bookings[index];
    }
    return null;
  },

  resetToDefaults(): void {
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(BOOKINGS_KEY);
    localStorage.removeItem(CLIENTS_KEY);
  },
};
