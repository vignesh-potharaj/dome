/**
 * Normalizes user-entered phone number into standard E.164 format for Firebase Auth.
 * e.g., "98765 43210" -> "+919876543210"
 *       "+91 9876543210" -> "+919876543210"
 *       "09876543210" -> "+919876543210"
 */
export function formatPhoneForFirebase(phone: string): string {
  if (!phone) return '';
  
  // Remove all spaces, dashes, brackets, dots
  const cleaned = phone.trim().replace(/[\s\-().]/g, '');
  
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  if (cleaned.startsWith('00')) {
    return `+${cleaned.slice(2)}`;
  }
  
  // Leading zero (common in Indian landline/mobile prefixes)
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return `+91${cleaned.slice(1)}`;
  }
  
  // 10-digit Indian mobile number
  if (/^\d{10}$/.test(cleaned)) {
    return `+91${cleaned}`;
  }
  
  // 12 digits starting with 91
  if (/^91\d{10}$/.test(cleaned)) {
    return `+${cleaned}`;
  }
  
  // Fallback: prepend + if missing
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
}

/**
 * Validates whether the given phone string can form a valid mobile number
 */
export function isValidPhoneNumber(phone: string): boolean {
  const formatted = formatPhoneForFirebase(phone);
  // Basic E.164 check: + followed by 8 to 15 digits
  return /^\+[1-9]\d{7,14}$/.test(formatted);
}
