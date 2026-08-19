/**
 * CMS Capability Module
 * Confines privileged service-role access for Site Pages CMS operations.
 */

import { createAdminClient } from '@/lib/supabase/admin'

export async function fetchSitePageBySlug(slug: string) {
  const admin = createAdminClient()
  return admin
    .from('site_pages')
    .select('*, current_published_revision:site_page_revisions(*)')
    .eq('slug', slug)
    .maybeSingle()
}

export async function fetchAllSitePages() {
  const admin = createAdminClient()
  return admin
    .from('site_pages')
    .select('id, slug, title, is_published, updated_at')
    .order('slug')
}

export async function fetchSitePageRevisions(pageId: string) {
  const admin = createAdminClient()
  return admin
    .from('site_page_revisions')
    .select('*')
    .eq('page_id', pageId)
    .order('version', { ascending: false })
}

export async function createSitePageDraftRPC(payload: {
  target_page_id: string
  revision_content: unknown
  revision_meta_title: string
  revision_meta_description: string
  revision_robots_index: boolean
  revision_change_summary: string
  actor_id: string
}) {
  const admin = createAdminClient()
  return admin.rpc('create_site_page_draft', payload)
}

export async function publishSitePageRPC(payload: {
  target_page_id: string
  target_revision_id: string
}) {
  const admin = createAdminClient()
  return admin.rpc('publish_site_page', payload)
}
