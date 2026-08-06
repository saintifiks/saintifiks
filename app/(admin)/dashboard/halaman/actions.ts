'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin-check'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSitePageDefinition } from '@/lib/site-pages/registry'
import { validateSitePageContent } from '@/lib/site-pages/validation'

type ActionResult = { success: true; revisionId?: string; version?: number } | { success: false; error: string }

type SaveDraftInput = {
  pageId: string
  slug: string
  content: unknown
  metaTitle: string
  metaDescription: string
  robotsIndex: boolean
  changeSummary: string
}

function cleanMeta(value: string, field: string, max: number) {
  const cleaned = value.trim()
  if (!cleaned) throw new Error(`${field} tidak boleh kosong.`)
  if (cleaned.length > max) throw new Error(`${field} maksimal ${max} karakter.`)
  return cleaned
}

export async function saveSitePageDraft(input: SaveDraftInput): Promise<ActionResult> {
  try {
    const user = await requireAdmin()
    const definition = getSitePageDefinition(input.slug)
    if (!definition) return { success: false, error: 'Halaman tidak terdaftar.' }

    const content = validateSitePageContent(input.slug, input.content)
    const metaTitle = cleanMeta(input.metaTitle, 'Judul SEO', 70)
    const metaDescription = cleanMeta(input.metaDescription, 'Deskripsi SEO', 180)
    const admin = createAdminClient()

    const { data: page, error: pageError } = await admin
      .from('site_pages')
      .select('id, slug')
      .eq('id', input.pageId)
      .eq('slug', input.slug)
      .single()
    if (pageError || !page) return { success: false, error: 'Halaman tidak ditemukan.' }

    const { data: created, error: revisionError } = await admin.rpc('create_site_page_draft', {
      target_page_id: page.id,
      revision_content: content,
      revision_meta_title: metaTitle,
      revision_meta_description: metaDescription,
      revision_robots_index: Boolean(input.robotsIndex),
      revision_change_summary: input.changeSummary.trim(),
      actor_id: user.id,
    })
    const revision = (created as Array<{ revision_id: string; revision_version: number }> | null)?.[0]
    if (revisionError || !revision) return { success: false, error: `Draf gagal disimpan: ${revisionError?.message ?? 'kesalahan tidak diketahui'}` }

    revalidatePath('/dashboard/halaman')
    revalidatePath(`/dashboard/halaman/${input.slug}`)
    return { success: true, revisionId: revision.revision_id, version: revision.revision_version }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Draf gagal disimpan.' }
  }
}

export async function publishSitePage(input: {
  pageId: string
  slug: string
  revisionId: string
  capabilityConfirmed: boolean
}): Promise<ActionResult> {
  try {
    await requireAdmin()
    const definition = getSitePageDefinition(input.slug)
    if (!definition) return { success: false, error: 'Halaman tidak terdaftar.' }
    if (!input.capabilityConfirmed) {
      return { success: false, error: 'Konfirmasi pemeriksaan klaim layanan sebelum menerbitkan.' }
    }

    const admin = createAdminClient()
    const { data: revision, error: revisionError } = await admin
      .from('site_page_revisions')
      .select('id, page_id, content')
      .eq('id', input.revisionId)
      .eq('page_id', input.pageId)
      .single()
    if (revisionError || !revision) return { success: false, error: 'Draf yang akan diterbitkan tidak ditemukan.' }
    const content = validateSitePageContent(input.slug, revision.content)
    if (content.sections.length === 0) {
      return { success: false, error: 'Tambahkan setidaknya satu bagian sebelum menerbitkan halaman.' }
    }

    const { error } = await admin.rpc('publish_site_page', {
      target_page_id: input.pageId,
      target_revision_id: input.revisionId,
    })
    if (error) return { success: false, error: `Halaman gagal diterbitkan: ${error.message}` }

    revalidatePath(definition.path)
    revalidatePath('/sitemap.xml')
    revalidatePath('/dashboard/halaman')
    revalidatePath(`/dashboard/halaman/${input.slug}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Halaman gagal diterbitkan.' }
  }
}

export async function restoreSitePageRevision(input: {
  pageId: string
  slug: string
  revisionId: string
}): Promise<ActionResult> {
  try {
    const user = await requireAdmin()
    const definition = getSitePageDefinition(input.slug)
    if (!definition) return { success: false, error: 'Halaman tidak terdaftar.' }
    const admin = createAdminClient()

    const { data: source, error: sourceError } = await admin
      .from('site_page_revisions')
      .select('content, meta_title, meta_description, robots_index, version')
      .eq('id', input.revisionId)
      .eq('page_id', input.pageId)
      .single()
    if (sourceError || !source) return { success: false, error: 'Versi yang dipilih tidak ditemukan.' }
    validateSitePageContent(input.slug, source.content)

    const { data: created, error: insertError } = await admin.rpc('create_site_page_draft', {
      target_page_id: input.pageId,
      revision_content: source.content,
      revision_meta_title: source.meta_title,
      revision_meta_description: source.meta_description,
      revision_robots_index: source.robots_index,
      revision_change_summary: `Dipulihkan dari versi ${source.version}`,
      actor_id: user.id,
    })
    const revision = (created as Array<{ revision_id: string; revision_version: number }> | null)?.[0]
    if (insertError || !revision) return { success: false, error: `Versi gagal dipulihkan: ${insertError?.message ?? 'kesalahan tidak diketahui'}` }

    revalidatePath(`/dashboard/halaman/${input.slug}`)
    return { success: true, revisionId: revision.revision_id, version: revision.revision_version }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Versi gagal dipulihkan.' }
  }
}
