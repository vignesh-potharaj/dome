'use client';

import React, { useState, useEffect, useRef } from 'react';
import { isValidPhoneNumber } from '@/lib/phone-utils';

export interface PhoneOtpVerificationProps {
  phone: string;
  onChangePhone: (phone: string) => void;
  isVerified: boolean;
  onVerified: (data: { phone: string; verificationId: string; verifiedAt: string }) => void;
  onResetVerification?: () => void;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  placeholder?: string;
  hasError?: boolean;
  errorMessage?: string;
}

export default function PhoneOtpVerification({
  phone,
  onChangePhone,
  isVerified,
  onVerified,
  onResetVerification,
  disabled = false,
  required = true,
  label = 'WhatsApp / Mobile Number',
  placeholder = '+91 98765 43210',
  hasError = false,
  errorMessage,
}: PhoneOtpVerificationProps) {
  const [verificationId, setVerificationId] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const [cooldown, setCooldown] = useState<number>(0);
  const [inlineError, setInlineError] = useState<string>('');
  const [inlineSuccess, setInlineSuccess] = useState<string>('');

  const otpInputRef = useRef<HTMLInputElement | null>(null);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Handle Send OTP
  const handleSendOtp = async () => {
    if (disabled || isSending || isVerified) return;

    if (!phone || !isValidPhoneNumber(phone)) {
      setInlineError('Please enter a valid 10-digit Indian phone number (e.g. +91 98765 43210).');
      return;
    }

    setIsSending(true);
    setInlineError('');
    setInlineSuccess('');

    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setInlineError(data.error || 'Failed to send OTP. Please try again.');
        if (data.retryAfter) {
          setCooldown(data.retryAfter);
        }
        return;
      }

      setVerificationId(data.verificationId);
      setIsOtpSent(true);
      setCooldown(data.cooldownSeconds || 45);
      setInlineSuccess('Verification code sent via SMS!');
      setOtpCode('');

      // Auto focus OTP input
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 100);
    } catch (err: any) {
      console.error('Error sending OTP:', err);
      setInlineError('Network connection failure. Please check your internet and try again.');
    } finally {
      setIsSending(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async () => {
    if (disabled || isVerifying || !verificationId) return;

    const cleanCode = otpCode.trim();
    if (cleanCode.length < 4 || cleanCode.length > 8) {
      setInlineError('Please enter the 6-digit verification code.');
      return;
    }

    setIsVerifying(true);
    setInlineError('');
    setInlineSuccess('');

    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationId,
          code: cleanCode,
          phone,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.verified) {
        setInlineError(data.error || 'Invalid verification code. Please check and try again.');
        return;
      }

      // Verification successful!
      setIsOtpSent(false);
      setOtpCode('');
      setInlineError('');
      setInlineSuccess('Phone number verified successfully!');

      onVerified({
        phone,
        verificationId,
        verifiedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('Error verifying OTP:', err);
      setInlineError('Network failure during verification. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePhoneChange = (newVal: string) => {
    onChangePhone(newVal);
    if (inlineError) setInlineError('');
    if (inlineSuccess) setInlineSuccess('');

    // If already verified and user changes the phone number, reset verified status
    if (isVerified) {
      setIsOtpSent(false);
      setVerificationId('');
      setOtpCode('');
      onResetVerification?.();
    }
  };

  const handleEditPhone = () => {
    setIsOtpSent(false);
    setVerificationId('');
    setOtpCode('');
    setInlineError('');
    setInlineSuccess('');
    onResetVerification?.();
  };

  return (
    <div className="flex flex-col w-full gap-2">
      {/* Label */}
      <div className="flex justify-between items-center">
        <label className="font-sans font-medium text-[11px] tracking-[0.2em] text-[#94A3B8] uppercase">
          {label} {required && <span className="text-[#00A7FA]">*</span>}
        </label>
        {isVerified && (
          <button
            type="button"
            onClick={handleEditPhone}
            className="text-[11px] font-sans text-[#00A7FA] hover:text-[#89D0FF] underline bg-transparent border-none cursor-pointer transition-colors p-0"
          >
            Change Number
          </button>
        )}
      </div>

      {/* Primary Phone Input + Send/Status Button */}
      <div className="flex gap-3 w-full items-stretch">
        <div className="relative flex-grow">
          <input
            type="tel"
            value={phone}
            disabled={disabled || isVerified}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-[rgba(0,167,250,0.04)] border rounded-[2px] p-[14px_18px] text-[#FFFFFF] font-sans font-light text-[14px] outline-none transition-colors focus:border-[#00A7FA] focus:bg-[rgba(0,167,250,0.07)] disabled:opacity-75"
            style={{
              borderColor: hasError || inlineError ? '#8B3A3A' : isVerified ? '#00A7FA' : 'rgba(0,167,250,0.2)',
            }}
          />
          {isVerified && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[#00A7FA] font-sans font-medium text-[11px] tracking-wider pointer-events-none select-none">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>VERIFIED</span>
            </div>
          )}
        </div>

        {/* Send / Status Button */}
        {!isVerified && (
          <button
            type="button"
            disabled={disabled || isSending || phone.trim().length < 10 || cooldown > 0}
            onClick={handleSendOtp}
            className="px-6 bg-[rgba(0,167,250,0.1)] hover:bg-[rgba(0,167,250,0.18)] border border-[rgba(0,167,250,0.3)] text-[#00A7FA] font-sans font-medium text-[12px] uppercase tracking-wider rounded-[2px] transition-colors disabled:opacity-30 cursor-pointer whitespace-nowrap min-w-[120px] flex items-center justify-center"
          >
            {isSending ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 border-2 border-[#00A7FA] border-t-transparent rounded-full animate-spin" />
                Sending...
              </span>
            ) : cooldown > 0 ? (
              `Wait ${cooldown}s`
            ) : isOtpSent ? (
              'Resend'
            ) : (
              'Send OTP'
            )}
          </button>
        )}
      </div>

      {/* Secondary Row: OTP Code Input Box (appears when OTP has been sent) */}
      {isOtpSent && !isVerified && (
        <div className="mt-2 p-4 bg-[rgba(0,167,250,0.06)] border border-[#00A7FA]/30 rounded-[2px] flex flex-col gap-3 transition-all animate-fadeIn">
          <div className="flex justify-between items-center">
            <span className="font-sans font-medium text-[11px] tracking-wider text-[#94A3B8] uppercase">
              Enter 6-Digit Code
            </span>
            {cooldown > 0 ? (
              <span className="font-sans text-[11px] text-[#94A3B8]">
                Resend available in <strong className="text-[#00A7FA]">{cooldown}s</strong>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSending}
                className="text-[11px] font-sans text-[#00A7FA] hover:text-[#89D0FF] uppercase tracking-wider bg-transparent border-none cursor-pointer transition-colors p-0"
              >
                Resend OTP Now
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <input
              ref={otpInputRef}
              type="text"
              maxLength={6}
              value={otpCode}
              disabled={isVerifying}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setOtpCode(val);
                if (inlineError) setInlineError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && otpCode.length >= 4) {
                  e.preventDefault();
                  handleVerifyOtp();
                }
              }}
              placeholder="••••••"
              className="flex-grow bg-[rgba(9,9,14,0.8)] border border-[rgba(0,167,250,0.3)] rounded-[2px] p-[12px_16px] text-center text-[#FFFFFF] font-display text-[18px] tracking-[0.4em] outline-none focus:border-[#00A7FA] transition-colors"
            />

            <button
              type="button"
              disabled={isVerifying || otpCode.trim().length < 4}
              onClick={handleVerifyOtp}
              className="px-6 py-3 bg-[#00A7FA] hover:bg-[#89D0FF] text-[#09090E] font-sans font-semibold text-[12px] uppercase tracking-[0.15em] rounded-[2px] transition-colors disabled:opacity-40 cursor-pointer whitespace-nowrap min-w-[110px] flex items-center justify-center"
            >
              {isVerifying ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 border-2 border-[#09090E] border-t-transparent rounded-full animate-spin" />
                  Verifying
                </span>
              ) : (
                'Verify'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Inline Feedback Messages */}
      {inlineError && (
        <span className="text-[#E06C75] text-[11px] font-sans mt-1 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {inlineError}
        </span>
      )}

      {!inlineError && hasError && errorMessage && (
        <span className="text-[#8B3A3A] text-[11px] font-sans mt-1">
          {errorMessage}
        </span>
      )}

      {inlineSuccess && (
        <span className="text-[#4EC9B0] text-[11px] font-sans mt-1 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          {inlineSuccess}
        </span>
      )}
    </div>
  );
}
