import { createHash } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-check'
import { createAdminClient } from '@/lib/supabase/admin'
import { parseStudioSyncRequest } from '@/lib/editorial-studio/sync-contract'
import { serializeStudioDraft } from '@/lib/editorial-studio/persistence'

export const dynamic = 'force-dynamic'

const MAX_REQUEST_BYTES = 5_500_000
const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024

type SyncRpcRow = {
  sync_status: 'accepted' | 'duplicate' | 'conflict' | 'missing'
  synced_document_id: string
  synced_revision_id: string | null
  synced_revision_number: number
  synced_title: string
  synced_deck: string
  synced_content: unknown
  synced_schema_version: number
  synced_fingerprint: string
  synced_at: string
}

function noStoreJson(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  })
}

export async function POST(request: NextRequest) {
  const user = await requireAdmin()

  try {
    const contentLength = Number(request.headers.get('content-length') ?? 0)
    if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
      return noStoreJson({ error: 'Draf melebihi batas sinkronisasi.' }, 413)
    }

    let rawBody: unknown
    try {
      rawBody = await request.json()
    } catch {
      return noStoreJson({ error: 'Payload JSON tidak dapat dibaca.' }, 400)
    }
    const parsed = parseStudioSyncRequest(rawBody)
    if (!parsed.ok) return noStoreJson({ error: parsed.message }, 400)

    const payload = parsed.value
    if (Buffer.byteLength(JSON.stringify(payload.document), 'utf8') > MAX_DOCUMENT_BYTES) {
      return noStoreJson({ error: 'Isi draf melebihi batas sinkronisasi 5 MB.' }, 413)
    }
    const serializedContent = serializeStudioDraft(payload)
    if (Buffer.byteLength(serializedContent, 'utf8') > MAX_REQUEST_BYTES) {
      return noStoreJson({ error: 'Draf melebihi batas sinkronisasi.' }, 413)
    }
    const fingerprint = createHash('sha256').update(serializedContent).digest('hex')

    const adminClient = createAdminClient()
    const { data, error } = await adminClient.rpc('sync_editorial_studio_draft', {
      target_document_id: payload.document.documentId,
      revision_title: payload.title,
      revision_deck: payload.deck,
      revision_content: payload.document,
      revision_schema_version: payload.document.schemaVersion,
      revision_fingerprint: fingerprint,
      expected_revision_number: payload.baseServerRevision,
      client_mutation_id: payload.mutationId,
      revision_reason: payload.reason,
      actor_id: user.id,
    })

    if (error) {
      console.error('[editorial-studio/sync] RPC gagal:', {
        code: error.code,
        documentId: payload.document.documentId,
      })
      return noStoreJson({ error: 'Server belum dapat menyimpan draf. Antrean lokal dipertahankan.' }, 500)
    }

    const row = (Array.isArray(data) ? data[0] : data) as SyncRpcRow | null
    if (!row || !['accepted', 'duplicate', 'conflict', 'missing'].includes(row.sync_status)) {
      console.error('[editorial-studio/sync] Respons RPC tidak dikenal.', {
        documentId: payload.document.documentId,
      })
      return noStoreJson({ error: 'Respons sinkronisasi server tidak valid.' }, 500)
    }

    if (row.sync_status === 'accepted' || row.sync_status === 'duplicate') {
      return noStoreJson({
        status: row.sync_status,
        documentId: row.synced_document_id,
        serverRevision: Number(row.synced_revision_number),
        serverFingerprint: row.synced_fingerprint,
        syncedAt: row.synced_at,
      })
    }

    if (row.sync_status === 'conflict') {
      return noStoreJson({
        status: 'conflict',
        serverDraft: {
          title: row.synced_title,
          deck: row.synced_deck,
          document: row.synced_content,
          serverRevision: Number(row.synced_revision_number),
          serverFingerprint: row.synced_fingerprint,
          syncedAt: row.synced_at,
        },
      }, 409)
    }

    return noStoreJson({
      status: 'missing',
      message: 'Revisi dasar tidak ditemukan di server. Draf lokal tidak ditimpa.',
    }, 409)
  } catch (error) {
    console.error('[editorial-studio/sync] Error tak terduga:',
      error instanceof Error ? error.message : 'unknown')
    return noStoreJson({ error: 'Sinkronisasi server gagal. Antrean lokal dipertahankan.' }, 500)
  }
}
