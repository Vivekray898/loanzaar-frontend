// Build an absolute server URL for internal API calls from server components
export function serverUrl(path: string) {
  const envBase = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_VERCEL_URL;
  let base: string;

  if (envBase) {
    // If VERCEL_URL is provided, ensure it has protocol
    if (envBase.startsWith('http://') || envBase.startsWith('https://')) {
      base = envBase;
    } else {
      base = envBase.startsWith('localhost') ? `http://${envBase}` : `https://${envBase}`;
    }
  } else {
    const port = process.env.PORT || '3000';
    base = `http://localhost:${port}`;
  }

  // Ensure path begins with /
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalized, base).toString();
}

export default serverUrl;
