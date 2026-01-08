import { Resend } from 'resend';

/**
 * Admin email notification helper
 * Sends emails to admin after DB write succeeds
 * Non-blocking: errors are logged but don't fail the API response
 */

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface SendEmailOptions {
  subject: string;
  html: string;
  replyTo?: string;
}

interface EmailResponse {
  success: boolean;
  error?: string;
}

/**
 * Send email to admin notification address
 * @param options - Email options (subject, html, optional replyTo)
 * @returns {EmailResponse} Success status with optional error message
 * 
 * @example
 * await sendAdminNotification({
 *   subject: 'New Application Submitted',
 *   html: '<p>Full Name: John Doe</p>',
 *   replyTo: 'user@example.com'
 * })
 */
export async function sendAdminNotification(
  options: SendEmailOptions
): Promise<EmailResponse> {
  try {
    // Validate environment
    if (!resend) {
      console.warn(
        '[EMAIL_WARNING] Resend not initialized. Set RESEND_API_KEY env var.'
      );
      return { success: false, error: 'Resend not configured' };
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const fromEmail =
      process.env.RESEND_FROM_EMAIL || process.env.FROM_EMAIL || 'onboarding@resend.dev';

    if (!adminEmail) {
      console.warn(
        '[EMAIL_WARNING] ADMIN_EMAIL not set. Admin emails will not be sent.'
      );
      return { success: false, error: 'Admin email not configured' };
    }

    // Build email payload
    const emailPayload: any = {
      from: fromEmail,
      to: adminEmail,
      subject: options.subject,
      html: options.html,
    };

    // Add reply-to if provided
    if (options.replyTo) {
      emailPayload.reply_to = options.replyTo;
    }

    // Send via Resend
    const response = await resend.emails.send(emailPayload);

    // Check for errors
    if (response.error) {
      console.error('[EMAIL_FAILED] Resend error:', response.error);
      return { success: false, error: response.error.message || 'Resend API error' };
    }

    console.log('[EMAIL_SUCCESS] Admin notification sent:', {
      id: response.data?.id,
      subject: options.subject,
      to: adminEmail,
    });

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[EMAIL_FAILED] Exception in sendAdminNotification:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Escape HTML special characters to prevent XSS
 * @param text - Text to escape
 * @returns Escaped HTML-safe text
 */
export function escapeHtml(text: string | null | undefined): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Format date to IST (Indian Standard Time)
 * @param date - Date to format
 * @returns Formatted date string (DD/MM/YYYY HH:MM:SS IST)
 */
export function formatDateIST(date: Date | null | undefined): string {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return String(date);
  }
}
