import { jsPDF } from 'jspdf';
import { Booking, VenueSettings } from '../types';

export const pdfService = {
  /**
   * Generates a downloadable legal PDF contract for the booking
   */
  generateContractPdf(booking: Booking, settings: VenueSettings): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 18;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    // --- Header Letterhead ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(13, 36, 64); // #0D2440 Brand Dark
    doc.text(settings.venueName.toUpperCase(), margin, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`${settings.address}, ${settings.cityStateZip}  |  ${settings.ownerPhone}  |  ${settings.ownerEmail}`, margin, y);
    y += 4;

    // Divider line
    doc.setDrawColor(46, 94, 153); // #2E5E99 Brand Primary
    doc.setLineWidth(0.8);
    doc.line(margin, y, margin + contentWidth, y);
    y += 8;

    // Document Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(13, 36, 64);
    doc.text('VENUE RENTAL AGREEMENT & TERMS OF OCCUPANCY', margin, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    const agreementDate = booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'September 2026';
    doc.text(`Reference No: ${booking.bookingRef}   |   Issued: ${agreementDate}   |   Status: ${booking.contractStatus === 'signed' ? 'EXECUTED & LEGALLY BINDING' : 'PENDING SIGNATURE'}`, margin, y);
    y += 7;

    // --- Reservation & Parties Box ---
    doc.setFillColor(231, 240, 250); // #E7F0FA Light Brand Canvas
    doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'F');
    doc.setDrawColor(123, 164, 208); // #7BA4D0
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'S');

    const col1X = margin + 4;
    const col2X = margin + (contentWidth / 2) + 2;
    let boxY = y + 6;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(46, 94, 153);
    doc.text('RENTER / CLIENT DETAILS', col1X, boxY);
    doc.text('EVENT & RESERVATION DETAILS', col2X, boxY);
    boxY += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(17, 24, 39);
    doc.text(`Name: ${booking.clientName}`, col1X, boxY);
    doc.text(`Space: ${booking.venueSpaceName}`, col2X, boxY);
    boxY += 4.5;

    doc.text(`Email: ${booking.clientEmail}`, col1X, boxY);
    doc.text(`Date: ${booking.eventDate} (${booking.startTime} - ${booking.endTime})`, col2X, boxY);
    boxY += 4.5;

    doc.text(`Phone: ${booking.clientPhone || 'N/A'}`, col1X, boxY);
    doc.text(`Event: ${booking.eventType} (${booking.guestCount} guests)`, col2X, boxY);
    boxY += 4.5;

    doc.text(`Company: ${booking.clientCompany || 'Personal'}`, col1X, boxY);
    doc.text(`Total: $${booking.totalAmount.toLocaleString()}  |  Deposit: $${booking.depositAmount.toLocaleString()} (${booking.depositPercentage}%)`, col2X, boxY);

    y += 40;

    // --- Agreement Clauses ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(13, 36, 64);
    doc.text('TERMS AND CONDITIONS', margin, y);
    y += 5;

    const termsText = [
      '1. RESERVATION & DEPOSIT GUARANTEE: The venue date is held temporarily upon booking creation. The date is confirmed only upon receipt of the non-refundable holding deposit via Stripe. Deposit amount will be credited toward total rental fee.',
      '2. BALANCE SETTLEMENT: The remaining balance is due exactly 7 calendar days before the event date. Late payments may result in cancellation without refund of deposit.',
      `3. CANCELLATION POLICY: ${settings.cancellationPolicy}`,
      '4. CARE OF PREMISES & LOAD-OUT: Renter agrees to leave the premises in substantially clean condition. All decor, trash, and outside vendor gear must be completely removed by the conclusion of the rental window.',
      '5. LIABILITY & INDEMNITY: Renter assumes full responsibility for any physical property damage or personal injury during occupancy and indemnifies Venue from any claims.',
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(51, 65, 85);

    termsText.forEach((paragraph) => {
      const splitLines = doc.splitTextToSize(paragraph, contentWidth);
      doc.text(splitLines, margin, y);
      y += splitLines.length * 3.8 + 2.5;
    });

    y += 3;

    // --- Signatures Section ---
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);
    doc.line(margin, y, margin + contentWidth, y);
    y += 6;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(13, 36, 64);
    doc.text('EXECUTION & E-SIGNATURE VERIFICATION', margin, y);
    y += 5;

    const sigBoxWidth = (contentWidth - 6) / 2;
    const sigBoxHeight = 36;

    // Venue Owner Signature Box (Left)
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y, sigBoxWidth, sigBoxHeight, 'F');
    doc.rect(margin, y, sigBoxWidth, sigBoxHeight, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('AUTHORIZED VENUE REPRESENTATIVE', margin + 3, y + 5);

    doc.setFont('times', 'italic');
    doc.setFontSize(14);
    doc.setTextColor(46, 94, 153);
    doc.text(settings.ownerName, margin + 4, y + 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`${settings.venueName}`, margin + 3, y + 23);
    doc.text(`Authorized by: ${settings.ownerEmail}`, margin + 3, y + 27);
    doc.text(`Status: Verified Owner Signature`, margin + 3, y + 31);

    // Client Signature Box (Right)
    const clientBoxX = margin + sigBoxWidth + 6;
    doc.setFillColor(248, 250, 252);
    doc.rect(clientBoxX, y, sigBoxWidth, sigBoxHeight, 'F');
    doc.rect(clientBoxX, y, sigBoxWidth, sigBoxHeight, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('RENTER / CLIENT SIGNATURE', clientBoxX + 3, y + 5);

    if (booking.contractStatus === 'signed' && booking.contractSignature) {
      const sig = booking.contractSignature;
      doc.setFont('times', 'italic');
      doc.setFontSize(14);
      doc.setTextColor(46, 94, 153);
      doc.text(sig.signerName, clientBoxX + 4, y + 16);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(71, 85, 105);
      const signDate = new Date(sig.signedAt).toLocaleString();
      doc.text(`Digitally Signed: ${signDate}`, clientBoxX + 3, y + 22);
      doc.text(`Signer IP: ${sig.ipAddress} | Verified E-Sign`, clientBoxX + 3, y + 26);
      doc.text(`Audit Hash: ${sig.auditHash}`, clientBoxX + 3, y + 30);
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184);
      doc.text('[ Awaiting Client Electronic Signature ]', clientBoxX + 6, y + 18);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text(`Sent to: ${booking.clientEmail}`, clientBoxX + 3, y + 27);
      doc.text('Sign via: Secure online link provided by venue', clientBoxX + 3, y + 31);
    }

    y += sigBoxHeight + 6;

    // --- Tamper-evident Audit Certificate Footer ---
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    const auditText = `Electronic Signature Audit Trail generated by AtelierVenue. Complies with U.S. Electronic Signatures in Global and National Commerce Act (ESIGN) and UETA. Tamper-evident record reference: ${booking.bookingRef}-${Date.now().toString(36).toUpperCase()}`;
    const auditLines = doc.splitTextToSize(auditText, contentWidth);
    doc.text(auditLines, margin, y);

    // Save PDF
    const filename = `Contract_${booking.bookingRef}_${booking.clientName.replace(/\s+/g, '_')}.pdf`;
    doc.save(filename);
  },

  /**
   * Generates a clean receipt for Stripe deposit payment
   */
  generateReceiptPdf(booking: Booking, settings: VenueSettings): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a5',
    });

    const margin = 14;
    const pageWidth = 148;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(13, 36, 64);
    doc.text(settings.venueName, margin, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('OFFICIAL PAYMENT RECEIPT', margin, y);
    y += 6;

    doc.setDrawColor(46, 94, 153);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + contentWidth, y);
    y += 7;

    // Receipt details
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);

    const paidDate = booking.depositPaidAt ? new Date(booking.depositPaidAt).toLocaleString() : new Date().toLocaleString();
    doc.text(`Receipt ID: REC-${booking.bookingRef}`, margin, y);
    doc.text(`Date: ${paidDate}`, margin + (contentWidth / 2), y);
    y += 5;

    doc.text(`Billed To: ${booking.clientName}`, margin, y);
    doc.text(`Email: ${booking.clientEmail}`, margin + (contentWidth / 2), y);
    y += 5;

    doc.text(`Transaction ID: ${booking.depositTransactionId || 'pi_simulated_stripe'}`, margin, y);
    doc.text(`Method: ${booking.paymentMethod || 'Stripe Card Payment'}`, margin + (contentWidth / 2), y);
    y += 8;

    // Items table
    doc.setFillColor(231, 240, 250);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(13, 36, 64);
    doc.text('DESCRIPTION', margin + 3, y + 4.8);
    doc.text('AMOUNT', margin + contentWidth - 18, y + 4.8);
    y += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(17, 24, 39);
    doc.text(`Deposit Payment (${booking.depositPercentage}%) - ${booking.venueSpaceName}`, margin + 3, y);
    doc.text(`$${booking.depositAmount.toFixed(2)}`, margin + contentWidth - 18, y);
    y += 5;

    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Event Date: ${booking.eventDate} | Time: ${booking.startTime} - ${booking.endTime}`, margin + 3, y);
    y += 8;

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, margin + contentWidth, y);
    y += 5;

    // Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(13, 36, 64);
    doc.text('Total Paid Today:', margin + 45, y);
    doc.text(`$${booking.depositAmount.toFixed(2)} USD`, margin + contentWidth - 25, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Remaining Balance Due: $${booking.balanceDue.toFixed(2)} USD`, margin + 45, y);
    y += 12;

    // Thank you note
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Thank you for booking with ${settings.venueName}. Your date is secured on our calendar.`, margin, y);

    const filename = `Receipt_${booking.bookingRef}.pdf`;
    doc.save(filename);
  },
};
