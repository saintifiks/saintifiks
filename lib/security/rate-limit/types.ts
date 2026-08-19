/**
 * Rate Limiting Contract Types
 */

export interface RateLimitOptions {
  limit: number
  windowMs: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  retryAfterSeconds?: number
  backend: 'local' | 'distributed'
}

export interface RateLimiter {
  check(identifier: string, limit?: number, windowMs?: number): Promise<RateLimitResult> | RateLimitResult
}
