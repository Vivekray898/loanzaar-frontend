/**
 * OTP Rate Limiting
 * 
 * Implements per-phone rate limiting for OTP requests
 * Max 3 OTP sends per phone per 10 minutes
 */

// Store for rate limiting: { phone: { timestamp: count } }
const rateLimitStore = new Map<string, { [timestamp: number]: number }>();

export const RATE_LIMIT_MAX_ATTEMPTS = 3;
export const RATE_LIMIT_WINDOW_MINUTES = 10;
export const RATE_LIMIT_WINDOW_MS = RATE_LIMIT_WINDOW_MINUTES * 60 * 1000;

/**
 * Check if phone has exceeded rate limit for OTP requests
 * 
 * @param phone Normalized phone number (E.164 format)
 * @returns { allowed: boolean; remaining: number; resetTime: Date | null }
 * 
 * @example
 * ```typescript
 * const check = checkRateLimit('+919876543210');
 * if (!check.allowed) {
 *   return Response.json({
 *     success: false,
 *     error: 'Too many OTP requests. Please try again later.',
 *     resetTime: check.resetTime
 *   }, { status: 429 });
 * }
 * ```
 */
export function checkRateLimit(phone: string): {
  allowed: boolean;
  remaining: number;
  resetTime: Date | null;
} {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  // Get or create rate limit record for this phone
  let phoneRecord = rateLimitStore.get(phone);
  if (!phoneRecord) {
    phoneRecord = {};
    rateLimitStore.set(phone, phoneRecord);
  }

  // Clean up old timestamps outside the window
  Object.keys(phoneRecord).forEach((timestamp) => {
    if (parseInt(timestamp, 10) < windowStart) {
      delete phoneRecord![timestamp];
    }
  });

  // Count requests in current window
  const requestsInWindow = Object.values(phoneRecord).reduce((sum, count) => sum + count, 0);
  const allowed = requestsInWindow < RATE_LIMIT_MAX_ATTEMPTS;
  const remaining = Math.max(0, RATE_LIMIT_MAX_ATTEMPTS - requestsInWindow);

  // Calculate reset time (when oldest request falls out of window)
  let resetTime: Date | null = null;
  if (!allowed) {
    const timestamps = Object.keys(phoneRecord)
      .map((ts) => parseInt(ts, 10))
      .sort((a, b) => a - b);

    if (timestamps.length > 0) {
      const oldestTimestamp = timestamps[0];
      const resetMs = oldestTimestamp + RATE_LIMIT_WINDOW_MS;
      resetTime = new Date(resetMs);
    }
  }

  return { allowed, remaining, resetTime };
}

/**
 * Record an OTP send request (increment counter)
 * Must be called after OTP is sent successfully
 * 
 * @param phone Normalized phone number (E.164 format)
 * 
 * @example
 * ```typescript
 * // After successfully sending OTP
 * recordRateLimitRequest(phone);
 * ```
 */
export function recordRateLimitRequest(phone: string): void {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  let phoneRecord = rateLimitStore.get(phone);
  if (!phoneRecord) {
    phoneRecord = {};
    rateLimitStore.set(phone, phoneRecord);
  }

  // Clean up old timestamps
  Object.keys(phoneRecord).forEach((timestamp) => {
    if (parseInt(timestamp, 10) < windowStart) {
      delete phoneRecord![timestamp];
    }
  });

  // Increment counter for current minute bucket
  const bucketKey = String(Math.floor(now / 60000) * 60000); // 1-minute buckets
  phoneRecord[bucketKey] = (phoneRecord[bucketKey] || 0) + 1;
}

/**
 * Clear rate limit for phone (admin only)
 * Use with caution
 * 
 * @param phone Normalized phone number (E.164 format)
 */
export function clearRateLimit(phone: string): void {
  rateLimitStore.delete(phone);
}

/**
 * Clear all rate limits (for testing)
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
}
