// Rate limiting helper — in-memory store untuk free tier
// Tidak menggunakan Redis/Vercel KV untuk menjaga simplicity dan cost

interface RateLimitEntry {
  count: number
  resetAt: number
}

// Store in-memory (Map<identifier, entry>)
const rateMap = new Map<string, RateLimitEntry>()

/**
 * Check rate limit untuk identifier (biasanya IP address)
 * @param identifier — IP address atau user identifier
 * @param limit — Maximum requests allowed (default: 60)
 * @param windowMs — Time window in milliseconds (default: 60_000 = 1 menit)
 * @returns Object dengan success (boolean) dan remaining (number)
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 60,
  windowMs: number = 60_000
): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const entry = rateMap.get(identifier)

  // Jika tidak ada entry atau sudah expired, buat entry baru
  if (!entry || now > entry.resetAt) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + windowMs,
    }
    rateMap.set(identifier, newEntry)
    return {
      success: true,
      remaining: limit - 1,
      resetAt: newEntry.resetAt,
    }
  }

  // Jika sudah melebihi limit, tolak
  if (entry.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetAt: entry.resetAt,
    }
  }

  // Increment count
  entry.count++
  return {
    success: true,
    remaining: limit - entry.count,
    resetAt: entry.resetAt,
  }
}

/**
 * Get client IP dari request Next.js
 * Handle various proxy scenarios (Vercel, Cloudflare, etc.)
 */
export function getClientIP(request: Request): string {
  // Vercel-specific headers
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    // Ambil IP pertama dari list (client asli)
    return forwardedFor.split(',')[0].trim()
  }

  // Fallback headers
  const realIP = request.headers.get('x-real-ip')
  if (realIP) return realIP

  // Jika tidak ada header, gunakan 'unknown' (kurang ideal tapi tidak crash)
  return 'unknown'
}

/**
 * Rate limit configuration untuk berbagai endpoint
 */
export const RATE_LIMITS = {
  // Komentar — jangan terlalu sering, tapi cukup untuk diskusi
  comments: { limit: 5, windowMs: 60_000 }, // 5 per menit

  // Likes — boleh lebih sering karena user bisa like/unlike banyak artikel
  likes: { limit: 20, windowMs: 60_000 }, // 20 per menit

  // Shares — jangan terlalu sering
  shares: { limit: 5, windowMs: 60_000 }, // 5 per menit

  // Analytics — lebih longgar karena scroll events
  analytics: { limit: 30, windowMs: 60_000 }, // 30 per menit

  // Opinions — publish artikel, jarang dilakukan
  opinions: { limit: 3, windowMs: 60_000 }, // 3 per menit
} as const
