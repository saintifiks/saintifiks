/**
 * Post-Login Destination Sanitizer & Whitelist Registry
 * Prevents Open Redirect Attacks via OAuth next parameter.
 */

const STATIC_ALLOWED_DESTINATIONS = new Set([
  '/',
  '/dashboard',
  '/akun',
  '/akun/tulis',
  '/koreksi',
  '/opinions',
  '/bookstore',
])

const DYNAMIC_ROUTE_PATTERNS = [
  /^\/artikel\/[a-z0-9-]+$/,
  /^\/opinions\/[a-zA-Z0-9_.-]+\/[a-z0-9-]+$/,
  /^\/penulis\/[a-zA-Z0-9_.-]+$/,
  /^\/dashboard\/artikel(?:\/[0-9a-fA-F-]+(?:\/edit)?)?$/,
  /^\/dashboard\/halaman(?:\/[a-z0-9-]+(?:\/pratinjau)?)?$/,
  /^\/dashboard\/opinions$/,
  /^\/dashboard\/bookstore(?:\/[a-z0-9-]+)?$/,
  /^\/dashboard\/analytics$/,
  /^\/akun\/artikel\/[0-9a-fA-F-]+\/edit$/,
]

export function sanitizePostLoginDestination(rawDestination: unknown): string {
  if (typeof rawDestination !== 'string') {
    return '/'
  }

  const trimmed = rawDestination.trim()

  // 1. Basic length check
  if (!trimmed || trimmed.length > 300) {
    return '/'
  }

  // 2. Reject protocol indicators and control characters
  if (
    /[\r\n\t\0]/.test(trimmed) ||
    trimmed.includes('//') ||
    trimmed.includes('\\') ||
    trimmed.includes('%2f%2f') ||
    trimmed.includes('%2F%2F') ||
    trimmed.includes('%5c') ||
    trimmed.includes('%5C') ||
    /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)
  ) {
    return '/'
  }

  // 3. Must start with a single '/'
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return '/'
  }

  // 4. Exact static match
  if (STATIC_ALLOWED_DESTINATIONS.has(trimmed)) {
    return trimmed
  }

  // 5. Parameterized dynamic path match (clean pathname without query/hash for pattern check)
  const pathnameOnly = trimmed.split('?')[0].split('#')[0]
  for (const pattern of DYNAMIC_ROUTE_PATTERNS) {
    if (pattern.test(pathnameOnly)) {
      return trimmed
    }
  }

  // Fallback safe default
  return '/'
}
