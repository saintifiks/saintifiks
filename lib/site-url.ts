/**
 * Canonical Site Origin & URL Helper
 * Single source of truth for site URLs, metadata canonicals, sitemaps, and robots.
 */

export function getSiteUrl(): string {
  // 1. Explicit canonical origin from environment
  const siteOrigin = process.env.SITE_ORIGIN || process.env.NEXT_PUBLIC_SITE_URL
  if (siteOrigin) {
    try {
      const parsed = new URL(siteOrigin)
      return parsed.origin.replace(/\/+$/, '')
    } catch {
      // Fall through on invalid URL
    }
  }

  // 2. Vercel deployment URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/+$/, '')}`
  }

  // 3. Local development fallback
  if (process.env.NODE_ENV !== 'production') {
    return 'http://localhost:3000'
  }

  // 4. Default production canonical
  return 'https://saintifiks.id'
}
