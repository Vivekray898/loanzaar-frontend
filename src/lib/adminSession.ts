const ADMIN_KEY = process.env.ADMIN_COOKIE_SIGNING_KEY || '';
const TTL_SECONDS = Number(process.env.ADMIN_SESSION_TTL_SECONDS || 60 * 60 * 24); // default 24h

if (!ADMIN_KEY) {
  console.warn('ADMIN_COOKIE_SIGNING_KEY not set — admin cookie sessions will not be available.');
}

// Helper: convert ArrayBuffer to hex
function bufToHex(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  return Array.prototype.map.call(bytes, x => ('00' + x.toString(16)).slice(-2)).join('');
}

// Constant-time compare for strings (hex)
function timingSafeEqualStr(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function signAdminSession(profileId: string) {
  if (!ADMIN_KEY) throw new Error('Admin cookie signing key not configured');
  const expires = Date.now() + TTL_SECONDS * 1000;
  const payload = `${profileId}|${expires}`;

  const enc = new TextEncoder();
  const keyData = enc.encode(ADMIN_KEY);
  const importedKey = await (crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']));
  const sigBuf = await crypto.subtle.sign('HMAC', importedKey, enc.encode(payload));
  const sigHex = bufToHex(sigBuf);
  return `${payload}|${sigHex}`;
}

export async function verifyAdminSession(cookieValue: string | null) {
  if (!ADMIN_KEY || !cookieValue) return null;
  const parts = cookieValue.split('|');
  if (parts.length !== 3) return null;
  const [profileId, expiresStr, sig] = parts;
  const payload = `${profileId}|${expiresStr}`;

  try {
    const enc = new TextEncoder();
    const keyData = enc.encode(ADMIN_KEY);
    const importedKey = await (crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']));
    const expectedBuf = await crypto.subtle.sign('HMAC', importedKey, enc.encode(payload));
    const expectedHex = bufToHex(expectedBuf);

    // Timing-safe compare
    if (!timingSafeEqualStr(expectedHex, sig)) return null;

    const expires = Number(expiresStr);
    if (Number.isNaN(expires) || Date.now() > expires) return null;
    return profileId;
  } catch (e) {
    console.error('verifyAdminSession error:', e);
    return null;
  }
}

export function getAdminCookieHeader(cookieValue: string, maxAgeSeconds?: number) {
  const maxAge = typeof maxAgeSeconds === 'number' ? maxAgeSeconds : TTL_SECONDS;
  const secureFlag = process.env.NODE_ENV === 'production' ? ' Secure;' : '';
  return `admin_profile=${cookieValue}; Path=/; Max-Age=${maxAge}; HttpOnly;${secureFlag} SameSite=Lax;`;
}

export function clearAdminCookieHeader() {
  const secureFlag = process.env.NODE_ENV === 'production' ? ' Secure;' : '';
  return `admin_profile=; Path=/; Max-Age=0; HttpOnly;${secureFlag} SameSite=Lax;`;
}
