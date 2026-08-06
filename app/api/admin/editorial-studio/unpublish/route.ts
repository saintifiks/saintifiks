import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin-check'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const user = await requireAdmin()
  const raw: unknown = await request.json().catch(() => null)
  const documentId = raw && typeof raw === 'object' && 'documentId' in raw
    && typeof raw.documentId === 'string' ? raw.documentId : ''
  if (!/^doc-[A-Za-z0-9][A-Za-z0-9_-]{2,123}$/.test(documentId)) {
    return NextResponse.json({ error: 'Identitas dokumen tidak valid.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin.rpc('unpublish_editorial_studio_article', {
    target_document_id: documentId,
    actor_id: user.id,
  })
  if (error || typeof data !== 'string') {
    console.error('[editorial-studio/unpublish] RPC gagal:', { code: error?.code, documentId })
    return NextResponse.json({ error: 'Artikel belum dapat dijadikan draf.' }, { status: 500 })
  }

  revalidatePath('/')
  revalidatePath('/artikel/[slug]', 'page')
  revalidatePath('/dashboard/artikel')
  return NextResponse.json({ ok: true, articleId: data }, { headers: { 'Cache-Control': 'no-store' } })
}
