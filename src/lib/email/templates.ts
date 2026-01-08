import { escapeHtml, formatDateIST } from './sendAdminNotification';

/**
 * Email template generators
 * Create HTML email content for different notification types
 */

export interface ApplicationData {
  id: string;
  full_name: string;
  mobile_number: string;
  email?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  product_category: string;
  product_type: string;
  application_stage: string;
  status: string;
  source: string;
  created_at: Date | string;
  assigned_to?: string | null;
}

export interface ContactData {
  id: string;
  full_name: string;
  email: string;
  mobile_number: string;
  city?: string | null;
  state?: string | null;
  subject?: string | null;
  reason?: string | null;
  message: string;
  status?: string | null;
  created_at: Date | string;
}

/**
 * Format application data into admin notification email
 * @param app - Application data
 * @returns HTML email template
 */
export function formatApplicationEmail(app: ApplicationData): string {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
        .header { background: #2c3e50; color: white; padding: 20px; border-radius: 4px 4px 0 0; }
        .content { background: white; padding: 20px; border-radius: 0 0 4px 4px; }
        .field { margin: 10px 0; }
        .label { font-weight: bold; color: #2c3e50; min-width: 120px; display: inline-block; }
        .value { display: inline; }
        .timestamp { font-size: 12px; color: #666; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">New Loan Application Submitted</h2>
        </div>
        <div class="content">
          <div class="field">
            <span class="label">Application ID:</span>
            <span class="value">${escapeHtml(app.id)}</span>
          </div>
          <div class="field">
            <span class="label">Full Name:</span>
            <span class="value">${escapeHtml(app.full_name)}</span>
          </div>
          <div class="field">
            <span class="label">Mobile Number:</span>
            <span class="value">${escapeHtml(app.mobile_number)}</span>
          </div>
          ${
            app.email
              ? `<div class="field">
            <span class="label">Email:</span>
            <span class="value">${escapeHtml(app.email)}</span>
          </div>`
              : ''
          }
          ${
            app.city || app.state || app.pincode
              ? `<div class="field">
            <span class="label">Location:</span>
            <span class="value">${[escapeHtml(app.city || ''), escapeHtml(app.state || ''), escapeHtml(app.pincode || '')].filter(Boolean).join(', ')}</span>
          </div>`
              : ''
          }
          <div class="field">
            <span class="label">Product Category:</span>
            <span class="value">${escapeHtml(app.product_category)}</span>
          </div>
          <div class="field">
            <span class="label">Product Type:</span>
            <span class="value">${escapeHtml(app.product_type)}</span>
          </div>
          <div class="field">
            <span class="label">Application Stage:</span>
            <span class="value">${escapeHtml(app.application_stage)}</span>
          </div>
          <div class="field">
            <span class="label">Status:</span>
            <span class="value">${escapeHtml(app.status)}</span>
          </div>
          <div class="field">
            <span class="label">Source:</span>
            <span class="value">${escapeHtml(app.source)}</span>
          </div>
          ${
            app.assigned_to
              ? `<div class="field">
            <span class="label">Assigned To:</span>
            <span class="value">${escapeHtml(app.assigned_to)}</span>
          </div>`
              : ''
          }
          <div class="timestamp">
            <strong>Submitted At (IST):</strong> ${formatDateIST(new Date(app.created_at))}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return htmlContent;
}

/**
 * Format contact message data into admin notification email
 * @param contact - Contact message data
 * @returns HTML email template
 */
export function formatContactEmail(contact: ContactData): string {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
        .header { background: #2c3e50; color: white; padding: 20px; border-radius: 4px 4px 0 0; }
        .content { background: white; padding: 20px; border-radius: 0 0 4px 4px; }
        .field { margin: 10px 0; }
        .label { font-weight: bold; color: #2c3e50; min-width: 120px; display: inline-block; }
        .value { display: inline; }
        .message-box { background: #f5f5f5; padding: 15px; border-left: 4px solid #2c3e50; margin: 15px 0; white-space: pre-wrap; word-wrap: break-word; }
        .timestamp { font-size: 12px; color: #666; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">New Contact Message Received</h2>
        </div>
        <div class="content">
          <div class="field">
            <span class="label">Message ID:</span>
            <span class="value">${escapeHtml(contact.id)}</span>
          </div>
          <div class="field">
            <span class="label">Full Name:</span>
            <span class="value">${escapeHtml(contact.full_name)}</span>
          </div>
          <div class="field">
            <span class="label">Email:</span>
            <span class="value">${escapeHtml(contact.email)}</span>
          </div>
          <div class="field">
            <span class="label">Mobile Number:</span>
            <span class="value">${escapeHtml(contact.mobile_number)}</span>
          </div>
          ${
            contact.city || contact.state
              ? `<div class="field">
            <span class="label">Location:</span>
            <span class="value">${[escapeHtml(contact.city || ''), escapeHtml(contact.state || '')].filter(Boolean).join(', ')}</span>
          </div>`
              : ''
          }
          ${
            contact.subject
              ? `<div class="field">
            <span class="label">Subject:</span>
            <span class="value">${escapeHtml(contact.subject)}</span>
          </div>`
              : ''
          }
          ${
            contact.reason
              ? `<div class="field">
            <span class="label">Reason:</span>
            <span class="value">${escapeHtml(contact.reason)}</span>
          </div>`
              : ''
          }
          <div class="field">
            <span class="label">Status:</span>
            <span class="value">${escapeHtml(contact.status || 'new')}</span>
          </div>
          <div class="field">
            <span class="label">Message:</span>
          </div>
          <div class="message-box">${escapeHtml(contact.message)}</div>
          <div class="timestamp">
            <strong>Submitted At (IST):</strong> ${formatDateIST(new Date(contact.created_at))}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return htmlContent;
}
