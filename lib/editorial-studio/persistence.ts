import type { StudioDocument } from './document'
import { migrateStudioDocument, validateStudioDocument } from './document'

export const STUDIO_STORAGE_VERSION = 2 as const
export const STUDIO_SNAPSHOT_LIMIT = 50
export const STUDIO_AUTOSAVE_DELAY_MS = 1_000
export const STUDIO_AUTOSNAPSHOT_INTERVAL_MS = 5 * 60 * 1_000

const DATABASE_NAME = 'saintifiks-editorial-studio'
const DATABASE_VERSION = 2
const DRAFT_STORE = 'drafts'
const SNAPSHOT_STORE = 'snapshots'
const OUTBOX_STORE = 'outbox'
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export type StudioDraftContent = {
  title: string
  deck: string
  document: StudioDocument
}

export type StudioSaveReason = 'autosave' | 'manual' | 'restore' | 'copy'
export type StudioSnapshotReason = StudioSaveReason | 'server'

export type StudioDraftRecord = StudioDraftContent & {
  storageVersion: typeof STUDIO_STORAGE_VERSION
  documentId: string
  revision: number
  fingerprint: string
  savedAt: string
  lastSnapshotAt: string | null
  writerId: string
  serverRevision: number | null
  serverFingerprint: string | null
  lastSyncedAt: string | null
}

export type StudioDraftSnapshot = StudioDraftRecord & {
  snapshotId: string
  reason: StudioSnapshotReason
}

export type StudioOutboxRecord = StudioDraftContent & {
  storageVersion: typeof STUDIO_STORAGE_VERSION
  documentId: string
  mutationId: string
  baseServerRevision: number | null
  localRevision: number
  fingerprint: string
  reason: StudioSaveReason
  createdAt: string
  attemptCount: number
  lastAttemptAt: string | null
  lastError: string | null
}

export type SaveStudioDraftOptions = {
  writerId: string
  expectedRevision: number | null
  reason: StudioSaveReason
  now?: Date
}

export type SaveStudioDraftResult = {
  record: StudioDraftRecord
  snapshotCreated: boolean
}

export class StudioDraftConflictError extends Error {
  readonly latestRecord: StudioDraftRecord

  constructor(latestRecord: StudioDraftRecord) {
    super('Draf telah berubah di tab lain.')
    this.name = 'StudioDraftConflictError'
    this.latestRecord = latestRecord
  }
}

export class StudioPersistenceCorruptionError extends Error {
  constructor(message = 'Data penyimpanan lokal tidak dapat dibaca dengan aman.') {
    super(message)
    this.name = 'StudioPersistenceCorruptionError'
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isValidDateString(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
}

function fallbackFingerprint(serialized: string) {
  let hash = 0x811c9dc5
  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, '0')}`
}

function canonicalizeJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalizeJson)
  if (!isRecord(value)) return value

  return Object.keys(value)
    .sort()
    .reduce<Record<string, unknown>>((result, key) => {
      const child = value[key]
      if (child !== undefined && typeof child !== 'function' && typeof child !== 'symbol') {
        result[key] = canonicalizeJson(child)
      }
      return result
    }, {})
}

export function serializeStudioDraft(content: StudioDraftContent) {
  return JSON.stringify(canonicalizeJson({
    title: content.title,
    deck: content.deck,
    document: content.document,
  }))
}

function serializeLegacyStudioDraft(content: StudioDraftContent) {
  return JSON.stringify({
    title: content.title,
    deck: content.deck,
    document: content.document,
  })
}

async function digestStudioDraft(serialized: string) {
  if (globalThis.crypto?.subtle) {
    const digest = await globalThis.crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(serialized)
    )
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
  }

  return fallbackFingerprint(serialized)
}

function createMutationId() {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }

  const bytes = new Uint8Array(16)
  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(bytes)
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256)
    }
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export async function fingerprintStudioDraft(content: StudioDraftContent) {
  return digestStudioDraft(serializeStudioDraft(content))
}

export function parseStudioDraftRecord(input: unknown): StudioDraftRecord | null {
  if (!isRecord(input)) return null
  if (input.storageVersion !== 1 && input.storageVersion !== STUDIO_STORAGE_VERSION) return null
  if (typeof input.documentId !== 'string' || input.documentId.length === 0) return null
  if (typeof input.title !== 'string' || typeof input.deck !== 'string') return null
  if (!Number.isSafeInteger(input.revision) || Number(input.revision) < 1) return null
  if (typeof input.fingerprint !== 'string' || input.fingerprint.length === 0) return null
  if (!isValidDateString(input.savedAt)) return null
  if (input.lastSnapshotAt !== null && !isValidDateString(input.lastSnapshotAt)) return null
  if (typeof input.writerId !== 'string' || input.writerId.length === 0) return null

  let serverRevision: number | null = null
  let serverFingerprint: string | null = null
  let lastSyncedAt: string | null = null
  if (input.storageVersion === STUDIO_STORAGE_VERSION) {
    const syncMetadataIsEmpty =
      input.serverRevision === null
      && input.serverFingerprint === null
      && input.lastSyncedAt === null
    const syncMetadataIsComplete =
      Number.isSafeInteger(input.serverRevision)
      && Number(input.serverRevision) > 0
      && typeof input.serverFingerprint === 'string'
      && /^[a-f0-9]{64}$/.test(input.serverFingerprint)
      && isValidDateString(input.lastSyncedAt)

    if (!syncMetadataIsEmpty && !syncMetadataIsComplete) return null
    if (syncMetadataIsComplete) {
      serverRevision = Number(input.serverRevision)
      serverFingerprint = input.serverFingerprint as string
      lastSyncedAt = input.lastSyncedAt as string
    }
  }

  const documentResult = migrateStudioDocument(input.document)
  if (!documentResult.ok || documentResult.document.documentId !== input.documentId) return null

  return {
    storageVersion: STUDIO_STORAGE_VERSION,
    documentId: input.documentId,
    title: input.title,
    deck: input.deck,
    document: documentResult.document,
    revision: Number(input.revision),
    fingerprint: input.fingerprint,
    savedAt: input.savedAt,
    lastSnapshotAt: input.lastSnapshotAt,
    writerId: input.writerId,
    serverRevision,
    serverFingerprint,
    lastSyncedAt,
  }
}

export function parseStudioDraftSnapshot(input: unknown): StudioDraftSnapshot | null {
  if (!isRecord(input)) return null
  const record = parseStudioDraftRecord(input)
  if (!record) return null
  if (typeof input.snapshotId !== 'string' || input.snapshotId.length === 0) return null
  if (!['autosave', 'manual', 'restore', 'copy', 'server'].includes(String(input.reason))) return null

  return {
    ...record,
    snapshotId: input.snapshotId,
    reason: input.reason as StudioSnapshotReason,
  }
}

export function parseStudioOutboxRecord(input: unknown): StudioOutboxRecord | null {
  if (!isRecord(input) || input.storageVersion !== STUDIO_STORAGE_VERSION) return null
  if (typeof input.documentId !== 'string' || input.documentId.length === 0) return null
  if (typeof input.title !== 'string' || typeof input.deck !== 'string') return null
  if (typeof input.mutationId !== 'string' || !UUID_PATTERN.test(input.mutationId)) return null
  if (
    input.baseServerRevision !== null
    && (!Number.isSafeInteger(input.baseServerRevision) || Number(input.baseServerRevision) < 1)
  ) return null
  if (!Number.isSafeInteger(input.localRevision) || Number(input.localRevision) < 1) return null
  if (typeof input.fingerprint !== 'string' || input.fingerprint.length === 0) return null
  if (!['autosave', 'manual', 'restore', 'copy'].includes(String(input.reason))) return null
  if (!isValidDateString(input.createdAt)) return null
  if (!Number.isSafeInteger(input.attemptCount) || Number(input.attemptCount) < 0) return null
  if (input.lastAttemptAt !== null && !isValidDateString(input.lastAttemptAt)) return null
  if ((Number(input.attemptCount) === 0) !== (input.lastAttemptAt === null)) return null
  if (input.lastError !== null && typeof input.lastError !== 'string') return null

  const documentResult = migrateStudioDocument(input.document)
  if (!documentResult.ok || documentResult.document.documentId !== input.documentId) return null

  return {
    storageVersion: STUDIO_STORAGE_VERSION,
    documentId: input.documentId,
    title: input.title,
    deck: input.deck,
    document: documentResult.document,
    mutationId: input.mutationId,
    baseServerRevision: input.baseServerRevision === null ? null : Number(input.baseServerRevision),
    localRevision: Number(input.localRevision),
    fingerprint: input.fingerprint,
    reason: input.reason as StudioSaveReason,
    createdAt: input.createdAt,
    attemptCount: Number(input.attemptCount),
    lastAttemptAt: input.lastAttemptAt,
    lastError: input.lastError,
  }
}

export function shouldCreateStudioSnapshot(
  previous: StudioDraftRecord | null,
  reason: StudioSaveReason,
  now: Date
) {
  if (!previous || reason !== 'autosave' || !previous.lastSnapshotAt) return true
  return now.getTime() - Date.parse(previous.lastSnapshotAt) >= STUDIO_AUTOSNAPSHOT_INTERVAL_MS
}

export function snapshotsOutsideRetention(
  snapshots: StudioDraftSnapshot[],
  limit = STUDIO_SNAPSHOT_LIMIT
) {
  return [...snapshots]
    .sort((left, right) => right.revision - left.revision)
    .slice(Math.max(0, limit))
}

function requestResult<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Operasi IndexedDB gagal.'))
  })
}

function transactionComplete(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error ?? new Error('Transaksi IndexedDB gagal.'))
    transaction.onabort = () => reject(transaction.error ?? new Error('Transaksi IndexedDB dibatalkan.'))
  })
}

function observeTransaction(transaction: IDBTransaction) {
  const completion = transactionComplete(transaction)
  void completion.catch(() => undefined)
  return completion
}

function openStudioDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('Browser tidak menyediakan IndexedDB.'))
      return
    }

    let blocked = false
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(DRAFT_STORE)) {
        database.createObjectStore(DRAFT_STORE, { keyPath: 'documentId' })
      }
      if (!database.objectStoreNames.contains(SNAPSHOT_STORE)) {
        const snapshots = database.createObjectStore(SNAPSHOT_STORE, { keyPath: 'snapshotId' })
        snapshots.createIndex('documentId', 'documentId', { unique: false })
      }
      if (!database.objectStoreNames.contains(OUTBOX_STORE)) {
        database.createObjectStore(OUTBOX_STORE, { keyPath: 'documentId' })
      }
    }
    request.onsuccess = () => {
      if (blocked) {
        request.result.close()
        return
      }
      request.result.onversionchange = () => request.result.close()
      resolve(request.result)
    }
    request.onerror = () => reject(request.error ?? new Error('IndexedDB tidak dapat dibuka.'))
    request.onblocked = () => {
      blocked = true
      reject(new Error('Upgrade penyimpanan diblokir oleh tab lain.'))
    }
  })
}

export async function getStudioDraft(documentId: string) {
  const database = await openStudioDatabase()
  try {
    const transaction = database.transaction(DRAFT_STORE, 'readonly')
    const completion = observeTransaction(transaction)
    const raw = await requestResult(transaction.objectStore(DRAFT_STORE).get(documentId))
    await completion
    if (raw === undefined) return null
    const record = parseStudioDraftRecord(raw)
    if (!record) throw new StudioPersistenceCorruptionError()
    const canonicalFingerprint = await fingerprintStudioDraft(record)
    const legacyFingerprint = canonicalFingerprint === record.fingerprint
      ? canonicalFingerprint
      : await digestStudioDraft(serializeLegacyStudioDraft(record))
    if (legacyFingerprint !== record.fingerprint) {
      throw new StudioPersistenceCorruptionError('Checksum draf lokal tidak cocok.')
    }
    return record
  } finally {
    database.close()
  }
}

export async function listStudioSnapshots(documentId: string, limit = 20) {
  const database = await openStudioDatabase()
  try {
    const transaction = database.transaction(SNAPSHOT_STORE, 'readonly')
    const completion = observeTransaction(transaction)
    const rawSnapshots = await requestResult(
      transaction.objectStore(SNAPSHOT_STORE).index('documentId').getAll(IDBKeyRange.only(documentId))
    )
    await completion
    return rawSnapshots
      .map(parseStudioDraftSnapshot)
      .filter((snapshot): snapshot is StudioDraftSnapshot => snapshot !== null)
      .sort((left, right) => right.revision - left.revision)
      .slice(0, Math.max(0, limit))
  } finally {
    database.close()
  }
}

async function pruneStudioSnapshots(documentId: string) {
  const snapshots = await listStudioSnapshots(documentId, Number.MAX_SAFE_INTEGER)
  const expired = snapshotsOutsideRetention(snapshots)
  if (expired.length === 0) return

  const database = await openStudioDatabase()
  try {
    const transaction = database.transaction(SNAPSHOT_STORE, 'readwrite')
    const completion = observeTransaction(transaction)
    const store = transaction.objectStore(SNAPSHOT_STORE)
    expired.forEach((snapshot) => store.delete(snapshot.snapshotId))
    await completion
  } finally {
    database.close()
  }
}

export async function saveStudioDraft(
  content: StudioDraftContent,
  options: SaveStudioDraftOptions
): Promise<SaveStudioDraftResult> {
  const validation = validateStudioDocument(content.document)
  if (!validation.ok) throw new Error('Dokumen tidak valid dan tidak disimpan.')

  const fingerprint = await fingerprintStudioDraft(content)
  const now = options.now ?? new Date()
  const savedAt = now.toISOString()
  const database = await openStudioDatabase()
  let result: SaveStudioDraftResult

  try {
    const transaction = database.transaction([DRAFT_STORE, SNAPSHOT_STORE, OUTBOX_STORE], 'readwrite')
    const completion = observeTransaction(transaction)
    const drafts = transaction.objectStore(DRAFT_STORE)
    const snapshots = transaction.objectStore(SNAPSHOT_STORE)
    const outbox = transaction.objectStore(OUTBOX_STORE)
    const rawPrevious = await requestResult(drafts.get(content.document.documentId))
    const previous = rawPrevious === undefined ? null : parseStudioDraftRecord(rawPrevious)

    if (rawPrevious !== undefined && !previous) {
      transaction.abort()
      await completion.catch(() => undefined)
      throw new StudioPersistenceCorruptionError()
    }
    if (previous && previous.revision !== options.expectedRevision) {
      transaction.abort()
      await completion.catch(() => undefined)
      throw new StudioDraftConflictError(previous)
    }
    if (!previous && options.expectedRevision !== null) {
      transaction.abort()
      await completion.catch(() => undefined)
      throw new StudioPersistenceCorruptionError('Revisi draf lokal tidak lagi tersedia.')
    }

    const snapshotCreated = shouldCreateStudioSnapshot(previous, options.reason, now)
    const revision = (previous?.revision ?? 0) + 1
    const record: StudioDraftRecord = {
      storageVersion: STUDIO_STORAGE_VERSION,
      documentId: content.document.documentId,
      title: content.title,
      deck: content.deck,
      document: content.document,
      revision,
      fingerprint,
      savedAt,
      lastSnapshotAt: snapshotCreated ? savedAt : previous?.lastSnapshotAt ?? null,
      writerId: options.writerId,
      serverRevision: previous?.serverRevision ?? null,
      serverFingerprint: previous?.serverFingerprint ?? null,
      lastSyncedAt: previous?.lastSyncedAt ?? null,
    }

    const pendingMutation: StudioOutboxRecord = {
      storageVersion: STUDIO_STORAGE_VERSION,
      documentId: record.documentId,
      title: record.title,
      deck: record.deck,
      document: record.document,
      mutationId: createMutationId(),
      baseServerRevision: record.serverRevision,
      localRevision: record.revision,
      fingerprint: record.fingerprint,
      reason: options.reason,
      createdAt: savedAt,
      attemptCount: 0,
      lastAttemptAt: null,
      lastError: null,
    }

    drafts.put(record)
    outbox.put(pendingMutation)
    if (snapshotCreated) {
      const snapshot: StudioDraftSnapshot = {
        ...record,
        snapshotId: `${record.documentId}:revision:${record.revision}`,
        reason: options.reason,
      }
      snapshots.put(snapshot)
    }

    await completion
    result = { record, snapshotCreated }
  } finally {
    database.close()
  }

  if (result.snapshotCreated) {
    await pruneStudioSnapshots(result.record.documentId).catch(() => undefined)
  }
  return result
}

export async function deleteStudioDraft(documentId: string) {
  const database = await openStudioDatabase()
  try {
    const transaction = database.transaction([DRAFT_STORE, SNAPSHOT_STORE, OUTBOX_STORE], 'readwrite')
    const completion = observeTransaction(transaction)
    transaction.objectStore(DRAFT_STORE).delete(documentId)
    transaction.objectStore(OUTBOX_STORE).delete(documentId)
    const snapshotStore = transaction.objectStore(SNAPSHOT_STORE)
    const snapshotKeys = await requestResult(
      snapshotStore.index('documentId').getAllKeys(IDBKeyRange.only(documentId))
    )
    snapshotKeys.forEach((key) => snapshotStore.delete(key))
    await completion
  } finally {
    database.close()
  }
}

export async function getStudioOutbox(documentId: string) {
  const database = await openStudioDatabase()
  try {
    const transaction = database.transaction(OUTBOX_STORE, 'readonly')
    const completion = observeTransaction(transaction)
    const raw = await requestResult(transaction.objectStore(OUTBOX_STORE).get(documentId))
    await completion
    if (raw === undefined) return null
    const record = parseStudioOutboxRecord(raw)
    if (!record) throw new StudioPersistenceCorruptionError('Antrean sinkronisasi lokal rusak.')
    return record
  } finally {
    database.close()
  }
}

export async function markStudioOutboxAttempt(
  documentId: string,
  mutationId: string,
  errorMessage: string | null,
  options: { incrementAttempt?: boolean; now?: Date } = {}
) {
  const incrementAttempt = options.incrementAttempt ?? true
  const attemptedAt = options.now ?? new Date()
  const database = await openStudioDatabase()
  try {
    const transaction = database.transaction(OUTBOX_STORE, 'readwrite')
    const completion = observeTransaction(transaction)
    const store = transaction.objectStore(OUTBOX_STORE)
    const raw = await requestResult(store.get(documentId))
    const pending = raw === undefined ? null : parseStudioOutboxRecord(raw)
    if (raw !== undefined && !pending) {
      transaction.abort()
      await completion.catch(() => undefined)
      throw new StudioPersistenceCorruptionError('Antrean sinkronisasi lokal rusak.')
    }
    if (pending?.mutationId === mutationId) {
      store.put({
        ...pending,
        attemptCount: pending.attemptCount + (incrementAttempt ? 1 : 0),
        lastAttemptAt: incrementAttempt ? attemptedAt.toISOString() : pending.lastAttemptAt,
        lastError: errorMessage?.slice(0, 500) ?? null,
      } satisfies StudioOutboxRecord)
    }
    await completion
  } finally {
    database.close()
  }
}

export async function acknowledgeStudioMutation(
  documentId: string,
  mutationId: string,
  serverRevision: number,
  serverFingerprint: string,
  syncedAt: string
) {
  if (!Number.isSafeInteger(serverRevision) || serverRevision < 1) {
    throw new Error('Revisi server tidak valid.')
  }
  if (!/^[a-f0-9]{64}$/.test(serverFingerprint) || !isValidDateString(syncedAt)) {
    throw new Error('Metadata sinkronisasi server tidak valid.')
  }

  const database = await openStudioDatabase()
  try {
    const transaction = database.transaction([DRAFT_STORE, OUTBOX_STORE], 'readwrite')
    const completion = observeTransaction(transaction)
    const drafts = transaction.objectStore(DRAFT_STORE)
    const outbox = transaction.objectStore(OUTBOX_STORE)
    const [rawDraft, rawOutbox] = await Promise.all([
      requestResult(drafts.get(documentId)),
      requestResult(outbox.get(documentId)),
    ])
    const draft = rawDraft === undefined ? null : parseStudioDraftRecord(rawDraft)
    const pending = rawOutbox === undefined ? null : parseStudioOutboxRecord(rawOutbox)

    if (!draft || (rawOutbox !== undefined && !pending)) {
      transaction.abort()
      await completion.catch(() => undefined)
      throw new StudioPersistenceCorruptionError('Draf lokal berubah saat sinkronisasi.')
    }

    if (
      draft.serverRevision === serverRevision
      && draft.serverFingerprint !== null
      && draft.serverFingerprint !== serverFingerprint
    ) {
      transaction.abort()
      await completion.catch(() => undefined)
      throw new StudioPersistenceCorruptionError('Checksum revisi server yang sama tidak konsisten.')
    }

    const acknowledgedIsNewest = serverRevision >= (draft.serverRevision ?? 0)
    const newestServerRevision = acknowledgedIsNewest ? serverRevision : draft.serverRevision

    drafts.put({
      ...draft,
      serverRevision: newestServerRevision,
      serverFingerprint: acknowledgedIsNewest ? serverFingerprint : draft.serverFingerprint,
      lastSyncedAt: acknowledgedIsNewest ? syncedAt : draft.lastSyncedAt,
    } satisfies StudioDraftRecord)

    if (pending?.mutationId === mutationId) {
      outbox.delete(documentId)
    } else if (pending) {
      outbox.put({
        ...pending,
        baseServerRevision: newestServerRevision,
      } satisfies StudioOutboxRecord)
    }
    await completion
  } finally {
    database.close()
  }
}

export async function discardStudioOutbox(documentId: string, expectedRevision: number | null) {
  const database = await openStudioDatabase()
  try {
    const transaction = database.transaction([DRAFT_STORE, OUTBOX_STORE], 'readwrite')
    const completion = observeTransaction(transaction)
    const rawDraft = await requestResult(transaction.objectStore(DRAFT_STORE).get(documentId))
    const draft = rawDraft === undefined ? null : parseStudioDraftRecord(rawDraft)
    if (rawDraft !== undefined && !draft) {
      transaction.abort()
      await completion.catch(() => undefined)
      throw new StudioPersistenceCorruptionError()
    }
    if (draft && draft.revision !== expectedRevision) {
      transaction.abort()
      await completion.catch(() => undefined)
      throw new StudioDraftConflictError(draft)
    }
    if (!draft && expectedRevision !== null) {
      transaction.abort()
      await completion.catch(() => undefined)
      throw new StudioPersistenceCorruptionError('Revisi draf lokal tidak lagi tersedia.')
    }
    transaction.objectStore(OUTBOX_STORE).delete(documentId)
    await completion
  } finally {
    database.close()
  }
}

export async function adoptStudioServerDraft(
  content: StudioDraftContent,
  serverRevision: number,
  serverFingerprint: string,
  serverSyncedAt: string,
  writerId: string,
  expectedLocalRevision: number | null,
  now = new Date()
) {
  if (!validateStudioDocument(content.document).ok) {
    throw new Error('Dokumen server tidak valid.')
  }
  if (!Number.isSafeInteger(serverRevision) || serverRevision < 1) {
    throw new Error('Revisi server tidak valid.')
  }
  if (!isValidDateString(serverSyncedAt)) {
    throw new Error('Waktu sinkronisasi server tidak valid.')
  }
  const computedFingerprint = await fingerprintStudioDraft(content)
  if (computedFingerprint !== serverFingerprint || !/^[a-f0-9]{64}$/.test(serverFingerprint)) {
    throw new StudioPersistenceCorruptionError('Checksum draf server tidak cocok.')
  }

  const savedAt = now.toISOString()
  const database = await openStudioDatabase()
  let record: StudioDraftRecord
  try {
    const transaction = database.transaction([DRAFT_STORE, SNAPSHOT_STORE, OUTBOX_STORE], 'readwrite')
    const completion = observeTransaction(transaction)
    const drafts = transaction.objectStore(DRAFT_STORE)
    const rawPrevious = await requestResult(drafts.get(content.document.documentId))
    const previous = rawPrevious === undefined ? null : parseStudioDraftRecord(rawPrevious)
    if (rawPrevious !== undefined && !previous) {
      transaction.abort()
      await completion.catch(() => undefined)
      throw new StudioPersistenceCorruptionError()
    }
    if (previous && previous.revision !== expectedLocalRevision) {
      transaction.abort()
      await completion.catch(() => undefined)
      throw new StudioDraftConflictError(previous)
    }
    if (!previous && expectedLocalRevision !== null) {
      transaction.abort()
      await completion.catch(() => undefined)
      throw new StudioPersistenceCorruptionError('Revisi draf lokal tidak lagi tersedia.')
    }

    record = {
      storageVersion: STUDIO_STORAGE_VERSION,
      documentId: content.document.documentId,
      title: content.title,
      deck: content.deck,
      document: content.document,
      revision: (previous?.revision ?? 0) + 1,
      fingerprint: serverFingerprint,
      savedAt,
      lastSnapshotAt: savedAt,
      writerId,
      serverRevision,
      serverFingerprint,
      lastSyncedAt: serverSyncedAt,
    }
    drafts.put(record)
    transaction.objectStore(SNAPSHOT_STORE).put({
      ...record,
      snapshotId: `${record.documentId}:revision:${record.revision}`,
      reason: 'server',
    } satisfies StudioDraftSnapshot)
    transaction.objectStore(OUTBOX_STORE).delete(record.documentId)
    await completion
  } finally {
    database.close()
  }

  await pruneStudioSnapshots(record.documentId).catch(() => undefined)
  return record
}
