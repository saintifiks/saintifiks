import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit'
import {
  assertPlainObject,
  validateEnum,
  requiredString,
  optionalString,
} from '@/lib/security/validation'

const ALLOWED_ANALYTICS_EVENTS = [
  'page_view',
  'scroll_depth',
  'klik_like',
  'klik_share',
  'article_read',
  'theme_toggle',
  'scroll_25',
  'scroll_50',
  'scroll_75',
  'scroll_100',
] as const

const ALLOWED_METADATA_KEYS = ['depth', 'article_id', 'slug', 'theme', 'destination', 'referrer'] as const

export async function POST(request: Request) {
  try {
    // [RATE LIMITING] Cegah abuse analytics — maks 30 per menit per IP
    const clientIP = getClientIP(request)
    const rateLimit = checkRateLimit(
      `analytics:${clientIP}`,
      RATE_LIMITS.analytics.limit,
      RATE_LIMITS.analytics.windowMs
    )

    if (!rateLimit.success) {
      // Untuk analytics, tetap return 200 agar tidak ganggu UX pembaca
      return NextResponse.json({ success: true })
    }

    const rawBody = await request.json()
    assertPlainObject(rawBody, 'Analytics payload')

    const eventType = validateEnum(rawBody.event_type, ALLOWED_ANALYTICS_EVENTS, 'Event type')
    const path = requiredString(rawBody.path, 'Path', { min: 1, max: 500 })
    const sessionId = optionalString(rawBody.session_id, 'Session ID', { max: 100 }) ?? 'anonymous'

    // Filter metadata secara ketat dan batasi ukuran
    const sanitizedMetadata: Record<string, unknown> = {}
    if (rawBody.metadata && typeof rawBody.metadata === 'object' && !Array.isArray(rawBody.metadata)) {
      const rawMeta = rawBody.metadata as Record<string, unknown>
      for (const key of ALLOWED_METADATA_KEYS) {
        if (key in rawMeta && rawMeta[key] !== undefined && rawMeta[key] !== null) {
          const val = rawMeta[key]
          if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
            sanitizedMetadata[key] = typeof val === 'string' ? val.slice(0, 500) : val
          }
        }
      }
    }

    const serializedMeta = JSON.stringify(sanitizedMetadata)
    if (serializedMeta.length > 4096) {
      return NextResponse.json({ success: true })
    }

    const supabase = await createClient()

    // Privacy-first: analytics pembaca tidak boleh dikaitkan dengan akun pengguna
    const payload = {
      event_type: eventType,
      path,
      session_id: sessionId,
      metadata: sanitizedMetadata,
    }

    const { error } = await supabase.from('analytics_events').insert(payload)
    if (error) {
      console.error('[Analytics] Gagal merekam event ke database.')
    }

    return NextResponse.json({ success: true })
  } catch {
    // Fail safe & silent for reader analytics to preserve reading experience
    return NextResponse.json({ success: true })
  }
}
