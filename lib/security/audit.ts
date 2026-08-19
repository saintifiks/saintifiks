/**
 * Structured Security Audit & Event Logging
 * Emits uniform JSON logs for security events without leaking credentials or sensitive PII.
 */

export type SecurityEventType =
  | 'AUTHZ_DENIED'
  | 'ADMIN_ACTION'
  | 'CMS_PUBLISH'
  | 'CMS_RESTORE'
  | 'EDITORIAL_PUBLISH'
  | 'EDITORIAL_UNPUBLISH'
  | 'OPINION_HIDE'
  | 'OPINION_RESTORE'
  | 'UPLOAD_REJECTED'
  | 'RATE_LIMIT'
  | 'SECURITY_VALIDATION_REJECTED'

export type SecurityEventResult = 'success' | 'denied' | 'failure'

export interface SecurityEventPayload {
  event: SecurityEventType
  actorId?: string | null
  resourceType?: string
  resourceId?: string
  result: SecurityEventResult
  reasonCode?: string
  metadata?: Record<string, unknown>
}

export function logSecurityEvent(payload: SecurityEventPayload): void {
  const sanitizedMetadata: Record<string, unknown> = {}
  if (payload.metadata) {
    for (const [key, val] of Object.entries(payload.metadata)) {
      // Redact potential secret keys
      const lowerKey = key.toLowerCase()
      if (
        lowerKey.includes('secret') ||
        lowerKey.includes('token') ||
        lowerKey.includes('key') ||
        lowerKey.includes('password') ||
        lowerKey.includes('auth')
      ) {
        sanitizedMetadata[key] = '[REDACTED]'
      } else if (typeof val === 'string') {
        sanitizedMetadata[key] = val.slice(0, 300)
      } else if (typeof val === 'number' || typeof val === 'boolean' || val === null) {
        sanitizedMetadata[key] = val
      }
    }
  }

  const logRecord = {
    level: payload.result === 'denied' || payload.result === 'failure' ? 'WARN' : 'INFO',
    category: 'SECURITY_AUDIT',
    timestamp: new Date().toISOString(),
    event: payload.event,
    actorId: payload.actorId ?? 'anonymous',
    resourceType: payload.resourceType ?? 'system',
    resourceId: payload.resourceId ?? null,
    result: payload.result,
    reasonCode: payload.reasonCode ?? 'NONE',
    metadata: sanitizedMetadata,
  }

  console.log(JSON.stringify(logRecord))
}
