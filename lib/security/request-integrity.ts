/**
 * Request Integrity & CSRF Defense Helper
 * Validates request origin, Fetch Metadata headers, and trusted mutation targets.
 */

export interface IntegrityCheckResult {
  allowed: boolean
  reasonCode?: 'SAME_ORIGIN_OK' | 'MISSING_ORIGIN_ALLOWED' | 'CROSS_SITE_FETCH_METADATA' | 'UNTRUSTED_ORIGIN' | 'MALFORMED_ORIGIN'
  error?: string
}

function getTrustedOrigins(): Set<string> {
  const trusted = new Set<string>()

  // Canonical environment origins
  const siteOrigin = process.env.SITE_ORIGIN || process.env.NEXT_PUBLIC_SITE_URL
  if (siteOrigin) {
    try {
      const parsed = new URL(siteOrigin)
      trusted.add(parsed.origin.toLowerCase())
    } catch {
      // Ignore malformed env var in development
    }
  }

  // Additional trusted mutation origins (comma-separated list)
  const additional = process.env.TRUSTED_MUTATION_ORIGINS
  if (additional) {
    for (const item of additional.split(',')) {
      const trimmed = item.trim()
      if (trimmed) {
        try {
          const parsed = new URL(trimmed)
          trusted.add(parsed.origin.toLowerCase())
        } catch {
          // Ignore invalid entry
        }
      }
    }
  }

  // Default production & preview domains
  trusted.add('https://saintifiks.id')
  trusted.add('https://www.saintifiks.id')
  trusted.add('https://saintifiks.vercel.app')

  // Local development
  if (process.env.NODE_ENV !== 'production') {
    trusted.add('http://localhost:3000')
    trusted.add('http://127.0.0.1:3000')
  }

  return trusted
}

/**
 * Validates mutation request integrity based on Origin and Fetch Metadata (Sec-Fetch-Site).
 */
export function validateMutationRequestIntegrity(headers: Headers): IntegrityCheckResult {
  // 1. Fetch Metadata defense (Sec-Fetch-Site)
  const secFetchSite = headers.get('sec-fetch-site')?.toLowerCase()
  if (secFetchSite === 'cross-site') {
    return {
      allowed: false,
      reasonCode: 'CROSS_SITE_FETCH_METADATA',
      error: 'Permintaan ditolak karena berasal dari sumber lintas situs (cross-site).',
    }
  }

  // 2. Origin Header Validation
  const originHeader = headers.get('origin')
  if (!originHeader) {
    // Some same-origin form submissions or non-browser server callers might lack Origin
    // but have same-origin Sec-Fetch-Site or Referer
    return {
      allowed: true,
      reasonCode: 'MISSING_ORIGIN_ALLOWED',
    }
  }

  let requestOrigin: string
  try {
    const parsed = new URL(originHeader)
    requestOrigin = parsed.origin.toLowerCase()
  } catch {
    return {
      allowed: false,
      reasonCode: 'MALFORMED_ORIGIN',
      error: 'Header Origin permintaan tidak valid.',
    }
  }

  const trustedOrigins = getTrustedOrigins()
  if (!trustedOrigins.has(requestOrigin)) {
    return {
      allowed: false,
      reasonCode: 'UNTRUSTED_ORIGIN',
      error: 'Origin permintaan tidak dikenal atau tidak diizinkan.',
    }
  }

  return {
    allowed: true,
    reasonCode: 'SAME_ORIGIN_OK',
  }
}
