/**
 * TextBee OTP Provider
 * 
 * Sends real SMS via TextBee API.
 * Requires environment variables:
 * - TEXTBEE_API_KEY: API authentication key
 * - TEXTBEE_DEVICE_ID: Device/gateway ID
 * - TEXTBEE_BASE_URL: Base URL (default: https://api.textbee.dev/api/v1)
 */

import { OTPProvider } from '../types';

export class TextBeeOTPProvider implements OTPProvider {
  name = 'textbee';
  private apiKey: string;
  private deviceId: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.TEXTBEE_API_KEY || '';
    this.deviceId = process.env.TEXTBEE_DEVICE_ID || '';
    this.baseUrl = process.env.TEXTBEE_BASE_URL || 'https://api.textbee.dev/api/v1';

    // Validate configuration
    if (!this.apiKey || !this.deviceId) {
      const missing: string[] = [];
      if (!this.apiKey) missing.push('TEXTBEE_API_KEY');
      if (!this.deviceId) missing.push('TEXTBEE_DEVICE_ID');
      console.error(
        `[TextBeeOTPProvider] Missing required environment variables: ${missing.join(', ')}`
      );
    }
  }

  /**
   * Send OTP via TextBee API
   * @param phone Phone number in E.164 format (e.g., +91XXXXXXXXXX)
   * @param otp 4-digit OTP code
   * @param smsMessage Formatted SMS message with context and expiry
   * @param templateId Optional DLT template ID for India compliance
   */
  async send(
    phone: string,
    otp: string,
    smsMessage: string,
    templateId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate configuration
      if (!this.apiKey || !this.deviceId) {
        const error = 'TextBee credentials not configured. Check TEXTBEE_API_KEY and TEXTBEE_DEVICE_ID';
        console.error(`[TextBeeOTPProvider] ${error}`);
        return { success: false, error };
      }

      // Validate phone format
      if (!phone.startsWith('+')) {
        const error = `Invalid phone format. Expected E.164 format like +91XXXXXXXXXX, got: ${phone}`;
        console.error(`[TextBeeOTPProvider] ${error}`);
        return { success: false, error };
      }

      // Construct the message from the provided SMS message
      const message = smsMessage;

      // Prepare request to TextBee
      const url = `${this.baseUrl}/gateway/devices/${this.deviceId}/send-sms`;
      const payload: Record<string, unknown> = {
        recipients: [phone],
        message: message,
      };

      // Add DLT template ID if provided
      if (templateId) {
        payload.template_id = templateId;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Handle response
      if (!response.ok) {
        const responseText = await response.text();
        const error = `TextBee API error: ${response.status} ${response.statusText} - ${responseText}`;
        console.error(`[TextBeeOTPProvider] Failed to send SMS to ${phone}: ${error}`);
        return { success: false, error };
      }

      const data = await response.json();

      // Log success
      console.info(
        `[TextBeeOTPProvider] ✅ SMS sent successfully to ${phone} ` +
        `(MessageID: ${data.message_id || 'unknown'}, Device: ${this.deviceId})`
      );

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[TextBeeOTPProvider] Unexpected error sending SMS to ${phone}:`, message);
      // Return success to not break the auth flow on SMS failures
      // The user can retry if SMS doesn't arrive
      return { success: false, error: message };
    }
  }
}
