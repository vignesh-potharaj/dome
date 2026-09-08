/**
 * In-memory rate limiter for OTP dispatch per phone number.
 * Prevents abuse and conserves OTP credits.
 */

interface RateLimitRecord {
  lastSentAt: number; // epoch ms
  sendCountInWindow: number;
  windowStartAt: number;
}

const COOLDOWN_SECONDS = 45; // Minimum wait between successive sends
const MAX_SENDS_PER_WINDOW = 5; // Max 5 sends per 1 hour window
const WINDOW_DURATION_MS = 60 * 60 * 1000; // 1 hour

class OtpRateLimiter {
  private records = new Map<string, RateLimitRecord>();

  /**
   * Check if a phone number is currently allowed to request another OTP.
   */
  public check(phone: string): { allowed: boolean; retryAfter: number; reason?: string } {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const now = Date.now();
    const record = this.records.get(cleanPhone);

    if (!record) {
      return { allowed: true, retryAfter: 0 };
    }

    // 1. Check window expiry (1 hour)
    if (now - record.windowStartAt > WINDOW_DURATION_MS) {
      this.records.delete(cleanPhone);
      return { allowed: true, retryAfter: 0 };
    }

    // 2. Check 45-second cooldown
    const elapsedSeconds = Math.floor((now - record.lastSentAt) / 1000);
    if (elapsedSeconds < COOLDOWN_SECONDS) {
      const remaining = COOLDOWN_SECONDS - elapsedSeconds;
      return {
        allowed: false,
        retryAfter: remaining,
        reason: `Please wait ${remaining}s before requesting another verification code.`
      };
    }

    // 3. Check max requests in current 1-hour window
    if (record.sendCountInWindow >= MAX_SENDS_PER_WINDOW) {
      const remainingWindowMinutes = Math.ceil((WINDOW_DURATION_MS - (now - record.windowStartAt)) / 60000);
      return {
        allowed: false,
        retryAfter: remainingWindowMinutes * 60,
        reason: `Maximum OTP requests exceeded for this number. Please try again in ${remainingWindowMinutes} minutes.`
      };
    }

    return { allowed: true, retryAfter: 0 };
  }

  /**
   * Record a successful OTP dispatch for the phone number.
   */
  public record(phone: string): void {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const now = Date.now();
    const existing = this.records.get(cleanPhone);

    if (!existing || now - existing.windowStartAt > WINDOW_DURATION_MS) {
      this.records.set(cleanPhone, {
        lastSentAt: now,
        sendCountInWindow: 1,
        windowStartAt: now,
      });
    } else {
      existing.lastSentAt = now;
      existing.sendCountInWindow += 1;
    }
  }

  /**
   * Reset rate limit (for testing or administrative purposes).
   */
  public reset(phone?: string): void {
    if (phone) {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      this.records.delete(cleanPhone);
    } else {
      this.records.clear();
    }
  }
}

export const otpRateLimiter = new OtpRateLimiter();
