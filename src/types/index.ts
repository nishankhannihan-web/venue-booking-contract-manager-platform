export type BookingStatus =
  | 'pending_deposit'
  | 'deposit_paid'
  | 'contract_signed'
  | 'confirmed'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 'unpaid' | 'deposit_paid' | 'paid_in_full' | 'refunded';
export type ContractStatus = 'draft' | 'sent' | 'signed';

export interface VenueSpace {
  id: string;
  name: string;
  description: string;
  hourlyRate: number;
  minHours: number;
  capacity: number;
  imageUrl: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  notes?: string;
  totalBookings: number;
  totalSpent: number;
  createdAt: string;
}

export interface ContractSignature {
  signerName: string;
  signerEmail: string;
  signatureDataUrl?: string; // canvas draw or SVG/typed
  signatureType: 'draw' | 'type';
  signedAt: string;
  ipAddress: string;
  userAgent: string;
  auditHash: string;
}

export interface ReminderItem {
  id: string;
  type: 'deposit_request' | 'contract_request' | '7_days_prior' | '24_hours_prior' | 'balance_due' | 'owner_prep';
  title: string;
  scheduledDate: string;
  sent: boolean;
  sentAt?: string;
  channel: 'email' | 'sms';
  recipient: 'client' | 'owner';
}

export interface Booking {
  id: string;
  bookingRef: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientCompany?: string;

  venueSpaceId: string;
  venueSpaceName: string;
  eventType: string;
  eventDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  durationHours: number;
  guestCount: number;

  baseRate: number;
  cleaningFee: number;
  addOnsAmount: number;
  totalAmount: number;
  depositPercentage: number; // e.g. 50
  depositAmount: number;
  balanceDue: number;

  status: BookingStatus;
  paymentStatus: PaymentStatus;
  contractStatus: ContractStatus;

  depositPaidAt?: string;
  depositTransactionId?: string;
  paymentMethod?: string;
  stripePaymentUrl?: string;

  contractSentAt?: string;
  contractSignedAt?: string;
  contractSignature?: ContractSignature;
  contractTermsOverride?: string;

  notes?: string;
  reminders: ReminderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface VenueSettings {
  venueName: string;
  tagline: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  address: string;
  cityStateZip: string;
  website: string;
  currency: string;
  defaultDepositPercentage: number;
  stripeConnected: boolean;
  stripeAccountId: string;
  stripeTestMode: boolean;
  autoSendDepositLink: boolean;
  autoSendContract: boolean;
  remindersEnabled: boolean;
  contractTemplate: string;
  cancellationPolicy: string;
  spaces: VenueSpace[];
}
