import { eq, and, sql } from 'drizzle-orm';
import { db } from './index';
import { customers, bookings, bookingLogs, blockedDates } from './schema';

// Helper to compute total price on the server
export function calculateTotalPrice(data: {
  packageName: string;
  cakeOption?: string | null;
  eggless?: boolean | null;
  sparklers?: boolean | null;
  addOns?: string[] | null;
  ledName?: string | null;
}) {
  const packagePrice = {
    party: 3999,
    vibe: 5999,
    magic: 8999,
    elite: 14999,
    luxury: 19999
  }[data.packageName] || 0;

  let cakePrice = 0;
  const hasCake = data.cakeOption && data.cakeOption !== 'none';
  if (hasCake) {
    const baseCakePrice = 0; // complimentary
    const premiumSurcharge = (data.cakeOption === 'red-velvet' || data.cakeOption === 'chocolate-truffle') ? 250 : 0;
    const egglessSurcharge = data.eggless ? 250 : 0;
    cakePrice = baseCakePrice + premiumSurcharge + egglessSurcharge;
  }

  const isSparklerFree = ['vibe', 'magic', 'elite', 'luxury'].includes(data.packageName);
  const sparklerPrice = data.sparklers ? (isSparklerFree ? 0 : 149) : 0;

  const addOnsList = [
    { id: 'led-name', price: 49 },
    { id: 'sparkling-candle', price: 70 },
    { id: 'blindfold', price: 100 },
    { id: 'personalised-letter', price: 100 },
    { id: 'sash-tiara', price: 200 },
    { id: 'photo-frame', price: 200 },
    { id: 'foil-balloon', price: 200 },
    { id: 'photo-prints', price: 200 },
    { id: 'balloon-stands', price: 400 },
    { id: 'heart-balloons', price: 500 },
    { id: 'rose-bouquet', price: 600 },
    { id: 'flower-entrance', price: 750 },
    { id: 'chrome-balloons', price: 1000 },
    { id: 'coldfire-2', price: 1000 },
    { id: 'coldfire-4', price: 1500 },
    { id: 'coldfire-6', price: 2000 },
    { id: 'fog-entry', price: 1500 },
    { id: 'photographer', price: 2500 },
    { id: 'guitarist', price: 5000 }
  ];

  const addOnsTotal = (data.addOns || []).reduce((sum, id) => {
    if (id === 'led-name') {
      const lettersCount = data.ledName ? data.ledName.replace(/[^a-zA-Z0-9]/g, '').length : 0;
      return sum + lettersCount * 49;
    }
    const addon = addOnsList.find(a => a.id === id);
    return sum + (addon ? addon.price : 0);
  }, 0);

  return packagePrice + cakePrice + sparklerPrice + addOnsTotal;
}

// Helper to check if a booking slot is in the past (using Asia/Kolkata timezone - IST)
export function isSlotInPast(dateStr: string, slotStr: string): boolean {
  const now = new Date();

  // Parse slot start time (e.g., '5:00 PM' from '5:00 PM – 6:30 PM')
  // Split on either en-dash (–) or regular hyphen (-)
  const timePart = slotStr.split(/[–-]/)[0].trim();
  
  const match = timePart.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (!match) {
    return false;
  }

  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();

  if (ampm === 'PM' && hour < 12) {
    hour += 12;
  } else if (ampm === 'AM' && hour === 12) {
    hour = 0;
  }

  // Construct ISO string in Asia/Kolkata timezone offset (+05:30)
  const isoStr = `${dateStr}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00+05:30`;
  const slotStartTime = new Date(isoStr);

  return now.getTime() > slotStartTime.getTime();
}

// Check if a slot is blocked or fully booked
export async function checkSlotAvailability(tx: any, branchId: string, dateStr: string, slot: string) {
  // Check if slot is in the past
  if (isSlotInPast(dateStr, slot)) {
    return { available: false, reason: 'Slot is in the past' };
  }

  // Check if the date is in blockedDates
  const blocked = await tx.select()
    .from(blockedDates)
    .where(
      and(
        eq(blockedDates.branchId, branchId),
        eq(blockedDates.date, dateStr)
      )
    )
    .limit(1);

  if (blocked.length > 0) {
    return { available: false, reason: `Date is blocked: ${blocked[0].reason || 'Private Event / Closure'}` };
  }

  // Check if capacity is reached for this slot
  // Get branch capacity
  const branchList = await tx.query.branches.findFirst({
    where: (branches: any, { eq }: any) => eq(branches.id, branchId)
  });
  const capacity = branchList?.capacity ?? 6;

  // Get active/confirmed bookings for this slot
  const slotBookings = await tx.select()
    .from(bookings)
    .where(
      and(
        eq(bookings.branchId, branchId),
        eq(bookings.date, dateStr),
        eq(bookings.slot, slot),
        sql`status IN ('confirmed', 'pending_payment', 'rescheduled')` // include pending, confirmed, and rescheduled bookings
      )
    );

  // Check if slot is blocked by admin (Block package)
  const hasBlock = slotBookings.some((b: any) => b.packageName === 'Block');
  if (hasBlock) {
    return { available: false, reason: 'Slot is blocked by admin' };
  }

  if (slotBookings.length >= capacity) {
    return { available: false, reason: 'Slot is fully booked' };
  }

  return { available: true };
}

// 1. Create or update customer record and occasions mapping
export async function getOrCreateCustomer(
  tx: any,
  data: {
    name: string;
    phone: string;
    email?: string;
    occasions?: Record<string, string>;
    marketingConsent: boolean;
  }
) {
  // Try to find the customer by phone number
  const existing = await tx.select()
    .from(customers)
    .where(eq(customers.phone, data.phone))
    .limit(1);

  if (existing.length > 0) {
    const current = existing[0];
    const mergedOccasions = {
      ...(current.occasions as Record<string, string> || {}),
      ...(data.occasions || {})
    };

    const [updated] = await tx.update(customers)
      .set({
        name: data.name,
        email: data.email ?? current.email,
        marketingConsent: data.marketingConsent,
        occasions: mergedOccasions,
      })
      .where(eq(customers.id, current.id))
      .returning();

    return updated;
  } else {
    const [inserted] = await tx.insert(customers)
      .values({
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        marketingConsent: data.marketingConsent,
        occasions: data.occasions ?? {},
      })
      .returning();

    return inserted;
  }
}

// Generate a unique, customer-friendly booking ID
export function generateBookingId(branchId: string): string {
  const branchChar = branchId.charAt(0).toUpperCase();
  const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `DC-${branchChar}${randomChars}`;
}

// 2. Create pending booking record
export async function createPendingBooking(
  tx: any,
  data: {
    branchId: string;
    customerId: string;
    date: string; // YYYY-MM-DD
    slot: string;
    packageName: string;
    balloonColor?: string | null;
    cakeOption?: string | null;
    sparklers?: boolean;
    eggless?: boolean;
    ledName?: string | null;
    messageOnCake?: string | null;
    addOns: string[];
    celebrantName?: string | null;
    specialNote?: string | null;
    guestCount: number;
    razorpayOrderId?: string | null;
  }
) {
  // Double check availability
  const availability = await checkSlotAvailability(tx, data.branchId, data.date, data.slot);
  if (!availability.available) {
    throw new Error(availability.reason || 'Slot not available');
  }

  // Calculate pricing
  const totalPrice = calculateTotalPrice({
    packageName: data.packageName,
    cakeOption: data.cakeOption,
    eggless: data.eggless,
    sparklers: data.sparklers,
    addOns: data.addOns,
    ledName: data.ledName
  });

  const advancePaid = Math.floor(totalPrice / 2); // 50% advance

  const bookingId = generateBookingId(data.branchId);

  const [booking] = await tx.insert(bookings)
    .values({
      id: bookingId,
      branchId: data.branchId,
      customerId: data.customerId,
      date: data.date,
      slot: data.slot,
      packageName: data.packageName,
      balloonColor: data.balloonColor || null,
      cakeOption: data.cakeOption || null,
      sparklers: data.sparklers ?? false,
      ledName: data.ledName || null,
      messageOnCake: data.messageOnCake || null,
      addOns: data.addOns,
      celebrantName: data.celebrantName || null,
      specialNote: data.specialNote || null,
      guestCount: data.guestCount,
      status: 'pending_payment',
      totalPrice,
      advancePaid,
      razorpayOrderId: data.razorpayOrderId || null,
      balancePaid: false,
    })
    .returning();

  // Create booking log
  await tx.insert(bookingLogs)
    .values({
      bookingId: booking.id,
      action: 'created',
      details: {
        totalPrice,
        advancePaid,
        customerAction: true,
      }
    });

  return booking;
}

// 3. Confirm booking payment / transaction record during checkout
export async function confirmBookingPayment(
  tx: any,
  bookingId: string,
  razorpayPaymentId: string,
  razorpayOrderId: string
) {
  // Fetch existing booking
  const existingList = await tx.select()
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1);

  if (existingList.length === 0) {
    throw new Error(`Booking with ID ${bookingId} not found`);
  }

  const booking = existingList[0];

  if (booking.status === 'confirmed') {
    return booking; // Already confirmed
  }

  if (booking.status !== 'pending_payment') {
    throw new Error(`Booking is in status '${booking.status}' and cannot be confirmed.`);
  }

  const [updatedBooking] = await tx.update(bookings)
    .set({
      status: 'confirmed',
      razorpayPaymentId,
      razorpayOrderId: razorpayOrderId || booking.razorpayOrderId,
    })
    .where(eq(bookings.id, bookingId))
    .returning();

  // Log status change
  await tx.insert(bookingLogs)
    .values({
      bookingId,
      action: 'status_changed',
      details: {
        oldStatus: 'pending_payment',
        newStatus: 'confirmed',
        razorpayPaymentId,
        razorpayOrderId: razorpayOrderId || booking.razorpayOrderId,
      }
    });

  return updatedBooking;
}
