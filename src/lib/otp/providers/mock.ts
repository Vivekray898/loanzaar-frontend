/**
 * Mock OTP Provider
 * 
 * Development/testing provider that logs OTP and formatted SMS to console.
 * Useful for local development, CI/CD, and demo environments.
 */

import { OTPProvider } from '../types';

export class MockOTPProvider implements OTPProvider {
  name = 'mock';

  async send(
    phone: string,
    otp: string,
    smsMessage: string,
    templateId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Log OTP details
      console.info(
        `\n${'='.repeat(70)}\n` +
        `🔐 [MOCK OTP PROVIDER] for ${phone}\n` +
        `📌 OTP: ${otp}\n` +
        `⏰ Timestamp: ${new Date().toISOString()}\n` +
        `${'-'.repeat(70)}\n` +
        `📱 SMS Message:\n${smsMessage}\n` +
        (templateId ? `📋 DLT Template ID: ${templateId}\n` : '') +
        `${'='.repeat(70)}\n`
      );

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[MockOTPProvider] Error sending OTP to ${phone}:`, message);
      return { success: false, error: message };
    }
  }
}
