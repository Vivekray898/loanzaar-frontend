/**
 * OTP Provider Types & Interfaces
 * 
 * Defines the contract for OTP providers.
 */

export interface OTPProvider {
  /**
   * Send OTP to the provided phone number
   * @param phone Phone number in E.164 format (e.g., +91XXXXXXXXXX)
   * @param otp 4-digit OTP code
   * @param smsMessage Formatted SMS message with context and expiry
   * @param templateId Optional DLT template ID for India compliance
   * @returns Promise<{ success: boolean; error?: string }>
   */
  send(
    phone: string,
    otp: string,
    smsMessage: string,
    templateId?: string
  ): Promise<{ success: boolean; error?: string }>;

  /**
   * Name of the provider (for logging/debugging)
   */
  name: string;
}

export type OTPProviderName = 'mock' | 'textbee';
