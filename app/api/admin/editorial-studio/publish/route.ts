import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin-check'
import { createAdminClient } from '@/lib/supabase/admin'
import { migrateStudioDocumentToV2 } from '@/lib/editorial-studio/document'
import { studioDocumentToMarkdown } from '@/lib/editorial-studio/markdown-adapter'
import { preflightStudioArticleV2 } from '@/lib/editorial-studio/preflight'

export const dynamic = 'force-dynamic'

function response(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: NextRequest) {
  const user = await requireAdmin()
  const raw: unknown = await request.json().catch(() => null)
  if (!raw || typeof raw !== 'object') return response({ error: 'Payload publish tidak valid.' }, 400)
  const documentId = 'documentId' in raw && typeof raw.documentId === 'string' ? raw.documentId : ''
  const revision = 'serverRevision' in raw && Number.isSafeInteger(raw.serverRevision)
    ? Number(raw.serverRevision)
    : 0
  const clientFingerprint = 'clientFingerprint' in raw && typeof raw.clientFingerprint === 'string'
    ? raw.clientFingerprint
    : ''
  if (!/^doc-[A-Za-z0-9][A-Za-z0-9_-]{2,123}$/.test(documentId) || revision < 1 || !/^[a-f0-9]{64}$/.test(clientFingerprint)) {
    return response({ error: 'Draf harus selesai tersinkron sebelum diterbitkan.' }, 409)
  }

  const admin = createAdminClient()
  const { data: revisionRow, error: revisionError } = await admin
    .from('editorial_studio_revisions')
    .select('title, deck, content, revision_number, fingerprint')
    .eq('document_id', documentId)
    .eq('revision_number', revision)
    .single()

  if (revisionError || !revisionRow) {
    return response({ error: 'Revisi server tidak ditemukan. Sinkronkan ulang sebelum publish.' }, 409)
  }
  if (revisionRow.fingerprint !== clientFingerprint) {
    return response({ error: 'Perubahan terbaru belum tersinkron. Tunggu sampai status kembali tersinkron.' }, 409)
  }
  const migrated = migrateStudioDocumentToV2(revisionRow.content)
  if (!migrated.ok) return response({ error: 'Dokumen server tidak lolos kontrak canonical.' }, 422)
  const preflight = preflightStudioArticleV2(revisionRow.title, revisionRow.deck, migrated.document)
  if (!preflight.ok) return response({ error: 'Preflight masih memiliki blocker.', issues: preflight.issues }, 422)

  const { data, error } = await admin.rpc('publish_editorial_studio_article', {
    target_document_id: documentId,
    expected_revision_number: revision,
    legacy_content: studioDocumentToMarkdown(migrated.document),
    actor_id: user.id,
  })
  if (error) {
    const duplicateSlug = error.code === '23505'
    console.error('[editorial-studio/publish] RPC gagal:', { code: error.code, documentId })
    return response({
      error: duplicateSlug
        ? 'Slug sudah digunakan artikel lain. Ubah slug lalu sinkronkan kembali.'
        : 'Artikel belum dapat diterbitkan. Tidak ada versi publik yang diubah.',
    }, duplicateSlug ? 409 : 500)
  }

  const row = (Array.isArray(data) ? data[0] : data) as {
    published_article_id?: string
    published_snapshot_id?: string
    published_slug?: string
    published_at?: string
  } | null
  if (!row?.published_article_id || !row.published_snapshot_id || !row.published_slug) {
    return response({ error: 'Respons publish tidak dapat diverifikasi.' }, 500)
  }

  revalidatePath('/')
  revalidatePath('/artikel/[slug]', 'page')
  revalidatePath(`/artikel/${row.published_slug}`)
  revalidatePath('/dashboard/artikel')
  return response({
    ok: true,
    articleId: row.published_article_id,
    snapshotId: row.published_snapshot_id,
    slug: row.published_slug,
    publishedAt: row.published_at,
    warnings: preflight.warnings,
  })
}
