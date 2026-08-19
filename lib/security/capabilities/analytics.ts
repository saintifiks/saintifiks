/**
 * Analytics Capability Module
 * Confines analytics aggregations and operations.
 */

import { createAdminClient } from '@/lib/supabase/admin'

export async function fetchAnalyticsAggregate(options: { days?: number } = {}) {
  const admin = createAdminClient()
  const days = options.days ?? 30
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  return admin
    .from('analytics_events')
    .select('event_type, path, created_at')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
}
