import type { StudioDocumentV2, StudioVersionedDocument } from './document'
import {
  migrateStudioDocumentToV2,
  validateStudioDocument,
  validateStudioDocumentV2,
} from './document'
import type { StudioDraftContentV2, StudioSaveReason } from './persistence'
import { migrateVerifiedStudioDraftContentToV2 } from './persistence'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const SHA256_PATTERN = /^[a-f0-9]{64}$/
const DOCUMENT_ID_PATTERN = /^doc-[A-Za-z0-9][A-Za-z0-9_-]{2,123}$/
const SAVE_REASONS = new Set<StudioSaveReason>(['autosave', 'manual', 'restore', 'copy'])

export type StudioSyncRequest = StudioDraftContentV2 & {
  mutationId: string
  baseServerRevision: number | null
  reason: StudioSaveReason
}

export type StudioServerDraft = {
  title: string
  deck: string
  document: StudioVersionedDocument
  serverRevision: number
  serverFingerprint: string
  syncedAt: string
}

export type StudioServerDraftV2 = {
  title: string
  deck: string
  document: StudioDocumentV2
  serverRevision: number
  serverFingerprint: string
  syncedAt: string
  sourceSchemaVersion: number
  migratedFingerprint: string
}

export type StudioSyncSuccessResponse = {
  status: 'accepted' | 'duplicate'
  documentId: string
  serverRevision: number
  serverFingerprint: string
  syncedAt: string
}

export type StudioSyncConflictResponse = {
  status: 'conflict'
  serverDraft: StudioServerDraft
}

export type StudioSyncMissingResponse = {
  status: 'missing'
  message: string
}

export type StudioSyncResponse =
  | StudioSyncSuccessResponse
  | StudioSyncConflictResponse
  | StudioSyncMissingResponse

type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; message: string }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isValidDateString(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
}

function isServerRevision(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) > 0
}

export function parseStudioSyncRequest(input: unknown): ParseResult<StudioSyncRequest> {
  if (!isRecord(input)) return { ok: false, message: 'Payload sinkronisasi harus berupa objek.' }
  if (typeof input.mutationId !== 'string' || !UUID_PATTERN.test(input.mutationId)) {
    return { ok: false, message: 'ID mutasi tidak valid.' }
  }
  if (
    input.baseServerRevision !== null
    && !isServerRevision(input.baseServerRevision)
  ) {
    return { ok: false, message: 'Revisi dasar server tidak valid.' }
  }
  if (typeof input.reason !== 'string' || !SAVE_REASONS.has(input.reason as StudioSaveReason)) {
    return { ok: false, message: 'Alasan penyimpanan tidak valid.' }
  }
  if (typeof input.title !== 'string' || input.title.length > 300) {
    return { ok: false, message: 'Judul harus berupa teks dengan panjang maksimal 300 karakter.' }
  }
  if (typeof input.deck !== 'string' || input.deck.length > 1200) {
    return { ok: false, message: 'Dek harus berupa teks dengan panjang maksimal 1.200 karakter.' }
  }

  if (!isRecord(input.document) || ![1, 2].includes(Number(input.document.schemaVersion))) {
    return { ok: false, message: 'Versi dokumen tidak didukung untuk sinkronisasi.' }
  }
  const documentValidation = migrateStudioDocumentToV2(input.document)
  if (!documentValidation.ok) {
    return { ok: false, message: 'Dokumen tidak memenuhi kontrak Editorial Studio.' }
  }
  if (!DOCUMENT_ID_PATTERN.test(documentValidation.document.documentId)) {
    return { ok: false, message: 'Identitas dokumen tidak valid untuk sinkronisasi server.' }
  }

  return {
    ok: true,
    value: {
      mutationId: input.mutationId,
      baseServerRevision:
        input.baseServerRevision === null ? null : Number(input.baseServerRevision),
      reason: input.reason as StudioSaveReason,
      title: input.title,
      deck: input.deck,
      document: documentValidation.document,
    },
  }
}

function parseServerDraft(input: unknown): StudioServerDraft | null {
  if (!isRecord(input)) return null
  if (typeof input.title !== 'string' || typeof input.deck !== 'string') return null
  if (!isServerRevision(input.serverRevision)) return null
  if (typeof input.serverFingerprint !== 'string' || !SHA256_PATTERN.test(input.serverFingerprint)) {
    return null
  }
  if (!isValidDateString(input.syncedAt)) return null
  const documentValidation = isRecord(input.document) && input.document.schemaVersion === 2
    ? validateStudioDocumentV2(input.document)
    : validateStudioDocument(input.document)
  if (!documentValidation.ok) return null
  if (!DOCUMENT_ID_PATTERN.test(documentValidation.document.documentId)) return null

  return {
    title: input.title,
    deck: input.deck,
    document: documentValidation.document,
    serverRevision: input.serverRevision,
    serverFingerprint: input.serverFingerprint,
    syncedAt: input.syncedAt,
  }
}

export async function parseVerifiedStudioServerDraftV2(
  input: unknown
): Promise<StudioServerDraftV2 | null> {
  if (!isRecord(input)) return null
  if (typeof input.title !== 'string' || typeof input.deck !== 'string') return null
  if (!isServerRevision(input.serverRevision)) return null
  if (typeof input.serverFingerprint !== 'string' || !SHA256_PATTERN.test(input.serverFingerprint)) {
    return null
  }
  if (!isValidDateString(input.syncedAt)) return null

  try {
    const migration = await migrateVerifiedStudioDraftContentToV2({
      title: input.title,
      deck: input.deck,
      document: input.document,
    }, input.serverFingerprint)
    if (!DOCUMENT_ID_PATTERN.test(migration.content.document.documentId)) return null

    return {
      ...migration.content,
      serverRevision: input.serverRevision,
      serverFingerprint: input.serverFingerprint,
      syncedAt: input.syncedAt,
      sourceSchemaVersion: migration.sourceSchemaVersion,
      migratedFingerprint: migration.migratedFingerprint,
    }
  } catch {
    return null
  }
}

export function parseStudioSyncResponse(input: unknown): StudioSyncResponse | null {
  if (!isRecord(input) || typeof input.status !== 'string') return null

  if (input.status === 'accepted' || input.status === 'duplicate') {
    if (typeof input.documentId !== 'string' || !DOCUMENT_ID_PATTERN.test(input.documentId)) return null
    if (!isServerRevision(input.serverRevision)) return null
    if (typeof input.serverFingerprint !== 'string' || !SHA256_PATTERN.test(input.serverFingerprint)) {
      return null
    }
    if (!isValidDateString(input.syncedAt)) return null
    return {
      status: input.status,
      documentId: input.documentId,
      serverRevision: input.serverRevision,
      serverFingerprint: input.serverFingerprint,
      syncedAt: input.syncedAt,
    }
  }

  if (input.status === 'conflict') {
    const serverDraft = parseServerDraft(input.serverDraft)
    return serverDraft ? { status: 'conflict', serverDraft } : null
  }

  if (input.status === 'missing' && typeof input.message === 'string') {
    return { status: 'missing', message: input.message }
  }

  return null
}

export function studioSyncRequestFromOutbox(input: {
  mutationId: string
  baseServerRevision: number | null
  reason: StudioSaveReason
  title: string
  deck: string
  document: StudioDocumentV2
}): StudioSyncRequest {
  return {
    mutationId: input.mutationId,
    baseServerRevision: input.baseServerRevision,
    reason: input.reason,
    title: input.title,
    deck: input.deck,
    document: input.document,
  }
}
