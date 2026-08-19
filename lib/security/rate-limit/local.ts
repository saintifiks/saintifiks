/**
 * In-Memory Local Rate Limiter
 *
 * CRITICAL ARCHITECTURAL NOTICE:
 * NOT_A_DISTRIBUTED_SECURITY_BOUNDARY
 *
 * In serverless deployments (e.g. Vercel), instances are ephemeral and isolated.
 * This in-memory store serves as a best-effort per-instance throttling layer.
 * Global multi-region abuse prevention requires edge WAF or distributed Redis backends.
 */

import { RateLimitResult } from './types'

interface RateLimitEntry {
  count: number
  resetAt: number
}

const localStore = new Map<string, RateLimitEntry>()

export function checkLocalRateLimit(
  identifier: string,
  limit = 60,
  windowMs = 60_000
): RateLimitResult {
  const now = Date.now()
  const entry = localStore.get(identifier)

  if (!entry || now > entry.resetAt) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + windowMs,
    }
    localStore.set(identifier, newEntry)
    return {
      allowed: true,
      remaining: Math.max(0, limit - 1),
      resetAt: newEntry.resetAt,
      backend: 'local',
    }
  }

  if (entry.count >= limit) {
    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000)
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfterSeconds,
      backend: 'local',
    }
  }

  entry.count++
  return {
    allowed: true,
    remaining: Math.max(0, limit - entry.count),
    resetAt: entry.resetAt,
    backend: 'local',
  }
}
