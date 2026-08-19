/**
 * Publication Capability Module
 * Confines privileged service-role access for Editorial Studio publishing operations.
 */

import { createAdminClient } from '@/lib/supabase/admin'

export async function syncEditorialDraftRPC(payload: {
  document_id: string
  client_mutation_id: string
  expected_base_revision: number
  mutation_patch: Record<string, unknown>
  actor_id: string
}) {
  const admin = createAdminClient()
  return admin.rpc('sync_editorial_studio_draft', {
    target_document_id: payload.document_id,
    client_mutation_id: payload.client_mutation_id,
    expected_base_revision: payload.expected_base_revision,
    mutation_patch: payload.mutation_patch,
    actor_id: payload.actor_id,
  })
}

export async function publishEditorialSnapshotRPC(payload: {
  document_id: string
  revision_id: string
  expected_revision_number: number
  snapshot_payload: Record<string, unknown>
  digest: string
  actor_id: string
}) {
  const admin = createAdminClient()
  return admin.rpc('publish_editorial_studio_snapshot', {
    target_document_id: payload.document_id,
    target_revision_id: payload.revision_id,
    expected_revision_number: payload.expected_revision_number,
    snapshot_payload: payload.snapshot_payload,
    snapshot_digest: payload.digest,
    actor_id: payload.actor_id,
  })
}

export async function unpublishEditorialArticle(documentId: string) {
  const admin = createAdminClient()
  return admin
    .from('editorial_studio_documents')
    .update({
      publication_status: 'draft',
      published_article_id: null,
      published_revision_id: null,
      published_at: null,
    })
    .eq('id', documentId)
}

export async function loadEditorialDocumentById(documentId: string) {
  const admin = createAdminClient()
  return admin
    .from('editorial_studio_documents')
    .select('*, editorial_studio_revisions(*)')
    .eq('id', documentId)
    .single()
}
