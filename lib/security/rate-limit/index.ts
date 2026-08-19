/**
 * Unified Rate Limiting Interface
 */

import { checkLocalRateLimit } from './local'
import { RateLimitResult } from './types'

export * from './types'
export * from './local'

export const STANDARD_RATE_LIMITS = {
  comments: { limit: 5, windowMs: 60_000 },
  likes: { limit: 20, windowMs: 60_000 },
  shares: { limit: 5, windowMs: 60_000 },
  analytics: { limit: 30, windowMs: 60_000 },
  opinions: { limit: 3, windowMs: 60_000 },
  search: { limit: 30, windowMs: 60_000 },
  corrections: { limit: 5, windowMs: 60_000 },
  reports: { limit: 5, windowMs: 60_000 },
  adminMutations: { limit: 60, windowMs: 60_000 },
} as const

export function checkRateLimit(
  identifier: string,
  limit = 60,
  windowMs = 60_000
): RateLimitResult {
  return checkLocalRateLimit(identifier, limit, windowMs)
}
