import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cache } from 'react'
import { createAdminClient } from '@/lib/supabase/admin'
import type { SitePagePublication, SitePageRevisionRow, SitePageRow } from './types'

function hasPublicSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

export const getPublishedSitePage = cache(async function getPublishedSitePage(slug: string): Promise<SitePagePublication | null> {
  if (!hasPublicSupabaseConfig()) return null

  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: page, error: pageError } = await supabase
      .from('site_pages')
      .select('id, slug, path, name, template_key, draft_revision_id, published_revision_id, created_at, updated_at')
      .eq('slug', slug)
      .not('published_revision_id', 'is', null)
      .maybeSingle()

    if (pageError || !page?.published_revision_id) return null

    const { data: revision, error: revisionError } = await supabase
      .from('site_page_revisions')
      .select('id, page_id, version, content, meta_title, meta_description, robots_index, change_summary, created_by, created_at, published_at')
      .eq('id', page.published_revision_id)
      .maybeSingle()

    if (revisionError || !revision) return null
    return { page: page as SitePageRow, revision: revision as SitePageRevisionRow }
  } catch {
    return null
  }
})

export async function getAdminSitePages() {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('site_pages')
      .select('id, slug, path, name, template_key, draft_revision_id, published_revision_id, created_at, updated_at')
      .order('name')
    if (error) return { pages: [] as SitePageRow[], error: error.message }
    return { pages: (data ?? []) as SitePageRow[], error: null }
  } catch (error) {
    return { pages: [] as SitePageRow[], error: error instanceof Error ? error.message : 'Koneksi database gagal.' }
  }
}

export async function getAdminSitePage(slug: string) {
  const admin = createAdminClient()
  const { data: page, error } = await admin
    .from('site_pages')
    .select('id, slug, path, name, template_key, draft_revision_id, published_revision_id, created_at, updated_at')
    .eq('slug', slug)
    .maybeSingle()

  if (error || !page) return null

  const revisionIds = [page.draft_revision_id, page.published_revision_id].filter(Boolean) as string[]
  let selectedRevisions: SitePageRevisionRow[] = []
  if (revisionIds.length) {
    const { data } = await admin
      .from('site_page_revisions')
      .select('id, page_id, version, content, meta_title, meta_description, robots_index, change_summary, created_by, created_at, published_at')
      .in('id', revisionIds)
    selectedRevisions = (data ?? []) as SitePageRevisionRow[]
  }

  const { data: history } = await admin
    .from('site_page_revisions')
    .select('id, page_id, version, content, meta_title, meta_description, robots_index, change_summary, created_by, created_at, published_at')
    .eq('page_id', page.id)
    .order('version', { ascending: false })
    .limit(20)

  return {
    page: page as SitePageRow,
    draft: selectedRevisions.find((revision) => revision.id === page.draft_revision_id) ?? null,
    published: selectedRevisions.find((revision) => revision.id === page.published_revision_id) ?? null,
    history: (history ?? []) as SitePageRevisionRow[],
  }
}
