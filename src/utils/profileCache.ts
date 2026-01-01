// Simple profile cache using cookies
// Keys: lz_profile_<id>, lz_profile_phone_<phone>

function readCookie(name: string) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.*+?^${}()|[\]\\])/g, '\\$1') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, maxAge = 60 * 60 * 24) {
  if (typeof document === 'undefined') return;
  const cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  document.cookie = cookie;
}

export function setProfileCache(profile: any) {
  if (!profile || !profile.id) return;
  try {
    const serialized = JSON.stringify(profile);
    writeCookie(`lz_profile_${profile.id}`, serialized);
    if (profile.phone) writeCookie(`lz_profile_phone_${profile.phone}`, serialized);
  } catch (e) {
    // ignore cookie set errors
    console.warn('Failed to set profile cache cookie', e);
  }
}

export function getProfileCache(uidOrPhone: string) {
  if (typeof document === 'undefined') return null;
  if (!uidOrPhone) return null;
  const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(uidOrPhone);
  try {
    if (isUuid) {
      const raw = readCookie(`lz_profile_${uidOrPhone}`);
      if (raw) return JSON.parse(raw);
    }
    // Try phone key
    const rawPhone = readCookie(`lz_profile_phone_${uidOrPhone}`);
    if (rawPhone) return JSON.parse(rawPhone);
    // If uuid lookup failed, also try iterating cookies to find a phone match
    // (less efficient but rare)
    const all = document.cookie.split('; ').map(c => c.split('='));
    for (const [k, v] of all) {
      if (k.startsWith('lz_profile_')) {
        try {
          const obj = JSON.parse(decodeURIComponent(v));
          if (obj && (obj.id === uidOrPhone || obj.phone === uidOrPhone)) return obj;
        } catch (e) { /* ignore */ }
      }
    }
  } catch (e) {
    console.warn('Failed to read profile cache cookie', e);
  }
  return null;
}

export function removeProfileCache(profile: any) {
  if (typeof document === 'undefined') return;
  try {
    if (profile?.id) document.cookie = `lz_profile_${profile.id}=; Path=/; Max-Age=0;`;
    if (profile?.phone) document.cookie = `lz_profile_phone_${profile.phone}=; Path=/; Max-Age=0;`;
  } catch (e) {
    // ignore
  }
}
