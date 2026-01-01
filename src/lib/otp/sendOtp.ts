/**
 * OTP Sending Function
 * 
 * Single entry point for sending OTPs.
 * Uses pluggable provider system to support multiple SMS services.
 * 
 * Supported providers via USE_MOCK_OTP env variable:
 * - USE_MOCK_OTP=true: Logs to console (dev/test)
 * - USE_MOCK_OTP=false: Sends real SMS via TextBee API
 */

import { OTPProvider, OTPProviderName } from './types';
import { OTPContext, getSMSMessage, getDLTTemplateInfo } from './templates';
import { MockOTPProvider } from './providers/mock';
import { TextBeeOTPProvider } from './providers/textbee';

// Initialize provider based on environment variable
function getOTPProvider(): OTPProvider {
  const useMock = process.env.USE_MOCK_OTP === 'true';

  if (useMock) {
    return new MockOTPProvider();
  } else {
    return new TextBeeOTPProvider();
  }
}

// Store provider instance
let provider: OTPProvider | null = null;

/**
 * Get the configured OTP provider
 */
export function getProvider(): OTPProvider {
  if (!provider) {
    provider = getOTPProvider();
    const useMock = process.env.USE_MOCK_OTP === 'true';
    const providerName = useMock ? 'mock' : 'textbee';
    console.info(
      `[OTP] Using provider: ${providerName} (USE_MOCK_OTP=${process.env.USE_MOCK_OTP || 'false'})`
    );
  }
  return provider;
}

/**
 * Send OTP to a phone number
 * 
 * @param phone - Phone number in E.164 format (e.g., +91XXXXXXXXXX)
 * @param otp - 4-digit OTP code (must be exactly 4 digits)
 * @param context - OTP context: "registration" or "login" (default: "login")
 * @returns Promise with success status
 * 
 * @example
 * ```typescript
 * // In your API route
 * import { sendOTP } from '@/lib/otp/sendOtp';
 * 
 * // For registration
 * const result = await sendOTP('+919876543210', '1234', 'registration');
 * 
 * // For login (default)
 * const result = await sendOTP('+919876543210', '5678');
 * 
 * if (result.success) {
 *   console.log('OTP sent successfully');
 * } else {
 *   console.error('Failed to send OTP:', result.error);
 * }
 * ```
 */
export async function sendOTP(
  phone: string,
  otp: string,
  context: OTPContext = 'login'
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get SMS message for this context
    const smsMessage = getSMSMessage(context, otp);

    // Get DLT template info if configured
    const dltInfo = getDLTTemplateInfo(context);

    // Get provider and send SMS
    const provider = getProvider();
    return await provider.send(phone, otp, smsMessage, dltInfo.templateId);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[OTP] Unexpected error in sendOTP:', message);
    return { success: false, error: message };
  }
}

/**
 * Get the name of the currently active provider
 */
export function getActiveProviderName(): string {
  return getProvider().name;
}
