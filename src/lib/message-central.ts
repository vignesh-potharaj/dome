/**
 * Message Central VerifyNow Service
 * Handles server-side interactions with Message Central CPaaS APIs:
 * - Token Generation (/auth/v1/authentication/token)
 * - Send OTP (/verification/v3/send)
 * - Validate OTP (/verification/v3/validateOtp)
 */

interface SendOtpResult {
  success: boolean;
  verificationId?: string;
  timeoutSeconds?: number;
  error?: string;
  code?: string;
}

interface VerifyOtpResult {
  verified: boolean;
  error?: string;
  code?: string;
}

// In-memory token cache to prevent redundant round-trips
let cachedAuthToken: string | null = null;
let tokenExpiresAt = 0;

/**
 * Mask phone number for secure logging (e.g. +91 98765 43210 -> +91 ******3210)
 */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length <= 4) return '****';
  return `+${digits.slice(0, 2)} ******${digits.slice(-4)}`;
}

/**
 * Parse and normalize an Indian phone number into countryCode ('91') and 10-digit mobileNumber.
 */
export function parsePhoneForMessageCentral(rawPhone: string): { countryCode: string; mobileNumber: string } | null {
  if (!rawPhone || typeof rawPhone !== 'string') return null;

  // Strip non-digit characters
  let digits = rawPhone.replace(/[^0-9]/g, '');

  // Remove leading zeros
  digits = digits.replace(/^0+/, '');

  // Handle India country code prefix
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  }

  // Indian mobile numbers must be 10 digits starting with 6, 7, 8, or 9
  if (/^[6-9]\d{9}$/.test(digits)) {
    return { countryCode: '91', mobileNumber: digits };
  }

  return null;
}

/**
 * Check if the current configuration is in sandbox mode or simulated testing
 */
function isConfigSimulated(): boolean {
  const env = (process.env.MESSAGE_CENTRAL_ENV || 'sandbox').toLowerCase();
  const customerId = process.env.MESSAGE_CENTRAL_CUSTOMER_ID || '';
  const tokenOrKey = process.env.MESSAGE_CENTRAL_AUTH_TOKEN || process.env.MESSAGE_CENTRAL_API_KEY || '';

  // If in sandbox mode and dummy/placeholder credentials are set, enable simulation
  return (
    env === 'sandbox' &&
    (!customerId ||
      !tokenOrKey ||
      customerId === 'sandbox-customer-id' ||
      customerId === 'your_customer_id_here' ||
      tokenOrKey === 'sandbox-api-key' ||
      tokenOrKey === 'your_api_key_or_password_here' ||
      tokenOrKey === 'your_auth_token_here')
  );
}

/**
 * Retrieve or generate a valid Message Central auth token.
 * If the user copied the "Auth Token" (JWT starting with eyJ) from their dashboard,
 * it is used directly without an extra network call.
 */
async function getAuthToken(): Promise<string> {
  const directToken = process.env.MESSAGE_CENTRAL_AUTH_TOKEN;
  const apiKey = process.env.MESSAGE_CENTRAL_API_KEY;

  // 1. Direct Auth Token from dashboard (via MESSAGE_CENTRAL_AUTH_TOKEN or JWT in MESSAGE_CENTRAL_API_KEY)
  if (directToken && directToken.trim()) {
    return directToken.trim();
  }
  if (apiKey && apiKey.trim().startsWith('eyJ')) {
    return apiKey.trim();
  }

  // 2. Otherwise, check cache for dynamically generated token
  const now = Date.now();
  if (cachedAuthToken && now < tokenExpiresAt) {
    return cachedAuthToken;
  }

  const customerId = process.env.MESSAGE_CENTRAL_CUSTOMER_ID;
  const email = process.env.MESSAGE_CENTRAL_EMAIL || '';

  if (!customerId || !apiKey) {
    throw new Error(
      'Message Central credentials missing. Please set MESSAGE_CENTRAL_CUSTOMER_ID and MESSAGE_CENTRAL_AUTH_TOKEN (or MESSAGE_CENTRAL_API_KEY).'
    );
  }

  // Base64 encode the API key/password as required by Message Central
  let encodedKey = apiKey;
  try {
    const isBase64 = Buffer.from(apiKey, 'base64').toString('base64') === apiKey;
    if (!isBase64) {
      encodedKey = Buffer.from(apiKey).toString('base64');
    }
  } catch {
    encodedKey = Buffer.from(apiKey).toString('base64');
  }

  const tokenUrl = new URL('https://cpaas.messagecentral.com/auth/v1/authentication/token');
  tokenUrl.searchParams.set('customerId', customerId);
  tokenUrl.searchParams.set('key', encodedKey);
  tokenUrl.searchParams.set('scope', 'NEW');
  if (email) {
    tokenUrl.searchParams.set('email', email);
  }

  const res = await fetch(tokenUrl.toString(), {
    method: 'GET',
    headers: {
      accept: '*/*',
    },
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Failed to generate Message Central auth token (HTTP ${res.status}): ${errText}`);
  }

  const data = await res.json();
  const token = data.token || data.data?.token;

  if (!token) {
    throw new Error(`Message Central auth token not found in response: ${JSON.stringify(data)}`);
  }

  // Cache token for 55 minutes (typical lifetime is 1-2 hours)
  cachedAuthToken = token;
  tokenExpiresAt = now + 55 * 60 * 1000;

  return token;
}

/**
 * Clear cached token if authentication fails
 */
export function invalidateAuthToken(): void {
  cachedAuthToken = null;
  tokenExpiresAt = 0;
}

/**
 * Send OTP via Message Central VerifyNow API
 */
export async function sendOtp(phone: string): Promise<SendOtpResult> {
  const parsed = parsePhoneForMessageCentral(phone);
  if (!parsed) {
    return {
      success: false,
      code: 'INVALID_PHONE_NUMBER',
      error: 'Invalid phone number. Please enter a valid 10-digit Indian mobile number.',
    };
  }

  // Check if simulated sandbox mode is active
  if (isConfigSimulated()) {
    console.info(`[MessageCentral Sandbox] Simulated OTP send triggered for ${maskPhone(parsed.mobileNumber)}`);
    const syntheticVerificationId = `sim_${Date.now()}_${parsed.mobileNumber.slice(-4)}`;
    return {
      success: true,
      verificationId: syntheticVerificationId,
      timeoutSeconds: 60,
    };
  }

  try {
    const customerId = process.env.MESSAGE_CENTRAL_CUSTOMER_ID!;
    const token = await getAuthToken();

    const sendUrl = new URL('https://cpaas.messagecentral.com/verification/v3/send');
    sendUrl.searchParams.set('countryCode', parsed.countryCode);
    sendUrl.searchParams.set('mobileNumber', parsed.mobileNumber);
    sendUrl.searchParams.set('flowType', 'SMS');
    sendUrl.searchParams.set('customerId', customerId);
    sendUrl.searchParams.set('otpLength', '6');

    const res = await fetch(sendUrl.toString(), {
      method: 'POST',
      headers: {
        authToken: token,
      },
    });

    if (res.status === 401 || res.status === 403) {
      // Invalidate cached token and retry once
      invalidateAuthToken();
      const freshToken = await getAuthToken();
      const retryRes = await fetch(sendUrl.toString(), {
        method: 'POST',
        headers: { authToken: freshToken },
      });
      return handleSendResponse(retryRes, parsed.mobileNumber);
    }

    return handleSendResponse(res, parsed.mobileNumber);
  } catch (err: any) {
    console.error(`[MessageCentral] Error sending OTP to ${maskPhone(parsed.mobileNumber)}:`, err?.message || err);
    return {
      success: false,
      code: 'PROVIDER_ERROR',
      error: 'Network or provider failure while sending OTP. Please try again later.',
    };
  }
}

async function handleSendResponse(res: Response, mobileNumber: string): Promise<SendOtpResult> {
  const data = await res.json().catch(() => null);

  if (!res.ok || !data) {
    const errMsg = data?.errorMessage || `HTTP ${res.status}`;
    console.error(`[MessageCentral] Failed to send OTP to ${maskPhone(mobileNumber)}: ${errMsg}`);
    return {
      success: false,
      code: 'SEND_FAILED',
      error: data?.errorMessage || 'Unable to deliver verification code. Please check your number and try again.',
    };
  }

  const responseCode = String(data.responseCode || res.status);
  const verificationId = data.verificationId || data.data?.verificationId;

  if (responseCode === '200' && verificationId) {
    return {
      success: true,
      verificationId: String(verificationId),
      timeoutSeconds: Number(data.timeout || 60),
    };
  }

  console.error(`[MessageCentral] Send OTP error response: code=${responseCode}, message=${data.errorMessage}`);
  return {
    success: false,
    code: 'SEND_FAILED',
    error: data.errorMessage || 'Failed to send verification code. Please try again.',
  };
}

/**
 * Validate OTP via Message Central VerifyNow API
 */
export async function validateOtp(verificationId: string, code: string): Promise<VerifyOtpResult> {
  if (!verificationId || typeof verificationId !== 'string') {
    return {
      verified: false,
      code: 'MISSING_VERIFICATION_ID',
      error: 'Verification session identifier is required.',
    };
  }

  const cleanCode = (code || '').trim().replace(/[^0-9]/g, '');
  if (cleanCode.length < 4 || cleanCode.length > 8) {
    return {
      verified: false,
      code: 'INVALID_FORMAT',
      error: 'Please enter a valid verification code.',
    };
  }

  // Handle simulated sandbox verification
  if (verificationId.startsWith('sim_') || isConfigSimulated()) {
    console.info(`[MessageCentral Sandbox] Simulated OTP validate received for ID: ${verificationId}`);
    
    // Simulate test failure paths
    if (cleanCode === '000000') {
      return {
        verified: false,
        code: 'INVALID_OTP',
        error: 'Invalid verification code. Please check and try again.',
      };
    }
    if (cleanCode === '999999') {
      return {
        verified: false,
        code: 'OTP_EXPIRED',
        error: 'Verification code has expired. Please request a new code.',
      };
    }
    if (cleanCode === '888888') {
      return {
        verified: false,
        code: 'MAX_ATTEMPTS_EXCEEDED',
        error: 'Maximum verification attempts reached. Please request a new code.',
      };
    }

    // By default in sandbox simulation, any 6-digit code or '123456' succeeds
    return { verified: true };
  }

  try {
    const token = await getAuthToken();

    const validateUrl = new URL('https://cpaas.messagecentral.com/verification/v3/validateOtp');
    validateUrl.searchParams.set('verificationId', verificationId);
    validateUrl.searchParams.set('code', cleanCode);

    const res = await fetch(validateUrl.toString(), {
      method: 'GET',
      headers: {
        authToken: token,
      },
    });

    if (res.status === 401 || res.status === 403) {
      invalidateAuthToken();
      const freshToken = await getAuthToken();
      const retryRes = await fetch(validateUrl.toString(), {
        method: 'GET',
        headers: { authToken: freshToken },
      });
      return handleValidateResponse(retryRes);
    }

    return handleValidateResponse(res);
  } catch (err: any) {
    console.error('[MessageCentral] Error during OTP validation:', err?.message || err);
    return {
      verified: false,
      code: 'PROVIDER_ERROR',
      error: 'Network or provider failure during OTP verification. Please try again.',
    };
  }
}

async function handleValidateResponse(res: Response): Promise<VerifyOtpResult> {
  const data = await res.json().catch(() => null);

  if (!data) {
    return {
      verified: false,
      code: 'VALIDATION_FAILED',
      error: 'Failed to parse response from verification provider.',
    };
  }

  const responseCode = String(data.responseCode || '');
  const verificationStatus = String(data.verificationStatus || '');

  // 200: Success
  if (responseCode === '200' || verificationStatus === 'VERIFICATION_COMPLETED') {
    return { verified: true };
  }

  // 702: Wrong OTP entered
  if (responseCode === '702') {
    return {
      verified: false,
      code: 'INVALID_OTP',
      error: 'Wrong verification code entered. Please check and try again.',
    };
  }

  // 705: Expired verification
  if (responseCode === '705') {
    return {
      verified: false,
      code: 'OTP_EXPIRED',
      error: 'Verification code has expired. Please request a new code.',
    };
  }

  // 800: Maximum attempts reached
  if (responseCode === '800') {
    return {
      verified: false,
      code: 'MAX_ATTEMPTS_EXCEEDED',
      error: 'Maximum verification attempts reached. Please request a new code.',
    };
  }

  // General 700 or other failure
  return {
    verified: false,
    code: 'VERIFICATION_FAILED',
    error: data.errorMessage || 'Verification code failed. Please check and try again.',
  };
}
