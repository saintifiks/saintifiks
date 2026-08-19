/**
 * Moderation Capability Module
 * Confines privileged service-role access for Opinions moderation and report management.
 */

import { createAdminClient } from '@/lib/supabase/admin'

export async function setOpinionHiddenStatus(opinionId: string, isHidden: boolean) {
  const admin = createAdminClient()
  return admin
    .from('opinion_articles')
    .update({ is_hidden: isHidden })
    .eq('id', opinionId)
    .select('id, title, is_hidden')
    .single()
}

export async function listAllOpinionsForAdmin(options: { rangeFrom?: number; rangeTo?: number } = {}) {
  const admin = createAdminClient()
  let query = admin
    .from('opinion_articles')
    .select('id, title, slug, status, is_hidden, created_at, published_at, author_id, view_count, like_count, comment_count', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (options.rangeFrom !== undefined && options.rangeTo !== undefined) {
    query = query.range(options.rangeFrom, options.rangeTo)
  }

  return query
}

export async function listModerationReports(statusFilter?: string) {
  const admin = createAdminClient()
  let query = admin
    .from('article_reports')
    .select('*, opinion_articles(id, title, slug, is_hidden)')
    .order('created_at', { ascending: false })

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }

  return query
}

export async function updateModerationReportStatus(reportId: string, status: 'reviewed' | 'dismissed') {
  const admin = createAdminClient()
  return admin
    .from('article_reports')
    .update({ status })
    .eq('id', reportId)
    .select('id, status')
    .single()
}
