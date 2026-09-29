import { Booking, BookingStatus, VenueSettings } from '../types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(time24: string): string {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function getStatusBadgeConfig(status: BookingStatus) {
  switch (status) {
    case 'confirmed':
      return {
        label: 'Fully Confirmed',
        dotColor: 'bg-emerald-600',
        bgColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      };
    case 'deposit_paid':
      return {
        label: 'Deposit Paid',
        dotColor: 'bg-emerald-500',
        bgColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      };
    case 'contract_signed':
      return {
        label: 'Contract Signed',
        dotColor: 'bg-[#2E5E99]',
        bgColor: 'bg-[#E7F0FA] text-[#2E5E99] border-[#7BA4D0]/40',
      };
    case 'pending_deposit':
      return {
        label: 'Deposit Pending',
        dotColor: 'bg-amber-500',
        bgColor: 'bg-amber-50 text-amber-900 border-amber-200',
      };
    case 'completed':
      return {
        label: 'Completed',
        dotColor: 'bg-slate-400',
        bgColor: 'bg-slate-100 text-slate-700 border-slate-200',
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        dotColor: 'bg-rose-400',
        bgColor: 'bg-rose-50 text-rose-700 border-rose-200',
      };
  }
}

export function fillContractTemplate(template: string, booking: Booking, settings: VenueSettings): string {
  return template
    .replace(/\{\{venue_name\}\}/g, settings.venueName)
    .replace(/\{\{client_name\}\}/g, booking.clientName)
    .replace(/\{\{client_email\}\}/g, booking.clientEmail)
    .replace(/\{\{client_phone\}\}/g, booking.clientPhone || 'N/A')
    .replace(/\{\{event_date\}\}/g, formatDate(booking.eventDate))
    .replace(/\{\{start_time\}\}/g, formatTime(booking.startTime))
    .replace(/\{\{end_time\}\}/g, formatTime(booking.endTime))
    .replace(/\{\{duration_hours\}\}/g, booking.durationHours.toString())
    .replace(/\{\{venue_space\}\}/g, booking.venueSpaceName)
    .replace(/\{\{event_type\}\}/g, booking.eventType)
    .replace(/\{\{guest_count\}\}/g, booking.guestCount.toString())
    .replace(/\{\{total_amount\}\}/g, formatCurrency(booking.totalAmount))
    .replace(/\{\{deposit_amount\}\}/g, formatCurrency(booking.depositAmount))
    .replace(/\{\{balance_due\}\}/g, formatCurrency(booking.balanceDue))
    .replace(/\{\{cancellation_policy\}\}/g, settings.cancellationPolicy);
}
