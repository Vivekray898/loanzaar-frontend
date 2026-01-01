/**
 * OTP SMS Templates
 * 
 * Professional SMS templates for different OTP contexts
 * Includes DLT compliance for India
 */

export type OTPContext = 'registration' | 'login';

export interface SMSTemplate {
  context: OTPContext;
  message: (otp: string) => string;
  dltTemplateEnvVar: string;
}

/**
 * SMS template for registration OTP
 * Includes T&C agreement message
 */
const REGISTRATION_TEMPLATE: SMSTemplate = {
  context: 'registration',
  message: (otp: string) => `One time OTP for your registration is ${otp}.
This OTP is valid for 5 minutes.
By giving this OTP you are agreeing to the LOANZAAR.com T&C.
- LOANZAAR Distribution Services`,
  dltTemplateEnvVar: 'DLT_TEMPLATE_REGISTRATION_ID',
};

/**
 * SMS template for login OTP
 * Includes security warning
 */
const LOGIN_TEMPLATE: SMSTemplate = {
  context: 'login',
  message: (otp: string) => `Your login code is ${otp}.
This code is valid for 5 minutes.
Do not share this code with anyone.
- LOANZAAR Distribution Services`,
  dltTemplateEnvVar: 'DLT_TEMPLATE_LOGIN_ID',
};

const TEMPLATES: Record<OTPContext, SMSTemplate> = {
  registration: REGISTRATION_TEMPLATE,
  login: LOGIN_TEMPLATE,
};

/**
 * Get SMS message for OTP context
 * 
 * @param context OTP context (registration or login)
 * @param otp The OTP code
 * @returns Formatted SMS message
 * 
 * @example
 * ```typescript
 * const message = getSMSMessage('registration', '1234');
 * // "One time OTP for your registration is 1234. ..."
 * ```
 */
export function getSMSMessage(context: OTPContext, otp: string): string {
  const template = TEMPLATES[context] || TEMPLATES.login;
  return template.message(otp);
}

/**
 * Get DLT template ID environment variable name for context
 * 
 * @param context OTP context
 * @returns Environment variable name to check for DLT template ID
 * 
 * @example
 * ```typescript
 * const envVar = getDLTTemplateEnvVar('registration');
 * // "DLT_TEMPLATE_REGISTRATION_ID"
 * 
 * const templateId = process.env[envVar];
 * // "1707170512345678"
 * ```
 */
export function getDLTTemplateEnvVar(context: OTPContext): string {
  const template = TEMPLATES[context] || TEMPLATES.login;
  return template.dltTemplateEnvVar;
}

/**
 * Get DLT template ID if configured
 * 
 * @param context OTP context
 * @returns Template ID if configured, undefined otherwise
 */
export function getDLTTemplateId(context: OTPContext): string | undefined {
  const envVar = getDLTTemplateEnvVar(context);
  const templateId = process.env[envVar];
  return templateId || undefined;
}

/**
 * Get all DLT template info for context
 * 
 * @param context OTP context
 * @returns Object with template ID and env var name
 */
export function getDLTTemplateInfo(context: OTPContext): {
  envVar: string;
  templateId: string | undefined;
  isConfigured: boolean;
} {
  const envVar = getDLTTemplateEnvVar(context);
  const templateId = getDLTTemplateId(context);
  return {
    envVar,
    templateId,
    isConfigured: !!templateId,
  };
}
