/**
 * Centralized HTTP Security Headers & Content Security Policy (CSP)
 */

export interface SecurityHeaderEntry {
  key: string
  value: string
}

export function getSecurityHeaders(): SecurityHeaderEntry[] {
  // Staged CSP Policy — Stage B (Enforce structural restrictions, maintain scripts/styles compatibility)
  const cspDirectives = [
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ]

  return [
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=(), payment=()',
    },
    { key: 'Content-Security-Policy', value: cspDirectives.join('; ') },
  ]
}

export function applySecurityHeaders(headers: Headers): void {
  const securityHeaders = getSecurityHeaders()
  for (const { key, value } of securityHeaders) {
    headers.set(key, value)
  }
}
