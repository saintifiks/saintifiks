import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'
import type {
  StudioDocument,
  StudioDocumentV2,
  StudioIdFactory,
  StudioJsonNode,
} from '../lib/editorial-studio/document'
import {
  STUDIO_EVIDENCE_LIMITS,
  createStudioDocument,
  createStudioDocumentV2,
  findStudioEvidenceDependencies,
  migrateStudioDocument,
  migrateStudioDocumentToV2,
  normalizeStudioRoot,
  studioDocumentsEqual,
  validateStudioDocument,
  validateStudioDocumentV2,
} from '../lib/editorial-studio/document'
import {
  STUDIO_CHART_INPUT_LIMITS,
  buildStudioChartEvidence,
  findStudioDatasetChartDependencies,
  findStudioDatasetColumnChartDependencies,
  resolveStudioChartModel,
  validateStudioChartDraft,
} from '../lib/editorial-studio/chart-model'
import {
  createEditorialStudioV2Fixture,
  editorialStudioFixture,
} from '../lib/editorial-studio/fixture'
import { markdownToStudioDocument, studioDocumentToMarkdown } from '../lib/editorial-studio/markdown-adapter'
import {
  preflightStudioArticle,
  preflightStudioArticleV2,
} from '../lib/editorial-studio/preflight'
import {
  createStudioServerRetryCycle,
  getStudioServerRetryDelay,
  recordStudioServerRetryableFailure,
} from '../lib/editorial-studio/server-retry-policy'
import {
  evaluateStudioAutosaveGate,
  fingerprintStudioDraft,
  migrateVerifiedStudioDraftContentToV2,
  parseStudioDraftRecord,
  parseStudioOutboxRecord,
  parseStudioDraftSnapshot,
  serializeStudioDraft,
  shouldCreateStudioSnapshot,
  shouldPersistStudioDraft,
  snapshotsOutsideRetention,
  studioDraftFingerprintMatches,
  type StudioDraftContent,
  type StudioDraftContentV2,
  type StudioDraftRecord,
  type StudioDraftSnapshot,
  type StudioOutboxRecord,
  type StudioOutboxRecordV2,
} from '../lib/editorial-studio/persistence'
import {
  parseVerifiedStudioServerDraftV2,
  parseStudioSyncRequest,
  parseStudioSyncResponse,
  studioSyncRequestFromOutbox,
} from '../lib/editorial-studio/sync-contract'
import {
  STUDIO_TABULAR_INPUT_LIMITS,
  buildStudioDatasetTable,
  convertStudioTabularValue,
  parseStudioTabularInput,
} from '../lib/editorial-studio/tabular-input'

function sequentialIds(): StudioIdFactory {
  let counter = 0
  return (nodeType) => `${nodeType}-test-${++counter}`
}

const fixtureContent: StudioDraftContent = {
  title: 'Judul pengujian',
  deck: 'Dek pengujian',
  document: editorialStudioFixture,
}

function fnv1aFingerprint(serialized: string) {
  let hash = 0x811c9dc5
  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, '0')}`
}

const editorialStudioV2Fixture = createEditorialStudioV2Fixture()
const fixtureContentV2: StudioDraftContentV2 = {
  title: fixtureContent.title,
  deck: fixtureContent.deck,
  document: editorialStudioV2Fixture,
}

async function fixtureRecord(overrides: Partial<StudioDraftRecord> = {}): Promise<StudioDraftRecord> {
  const fingerprint = await fingerprintStudioDraft(fixtureContent)
  return {
    storageVersion: 2,
    documentId: editorialStudioFixture.documentId,
    title: fixtureContent.title,
    deck: fixtureContent.deck,
    document: editorialStudioFixture,
    revision: 1,
    fingerprint,
    savedAt: '2026-08-06T12:00:00.000Z',
    lastSnapshotAt: '2026-08-06T12:00:00.000Z',
    writerId: 'writer-test',
    serverRevision: null,
    serverFingerprint: null,
    lastSyncedAt: null,
    ...overrides,
  }
}

test('golden fixture memenuhi kontrak canonical JSON v1', () => {
  const result = validateStudioDocument(editorialStudioFixture)
  assert.equal(result.ok, true)
})

test('serialisasi dan muat ulang mempertahankan dokumen secara identik', () => {
  const serialized = JSON.stringify(editorialStudioFixture)
  const restored = migrateStudioDocument(JSON.parse(serialized))

  assert.equal(restored.ok, true)
  if (restored.ok) {
    assert.equal(studioDocumentsEqual(editorialStudioFixture, restored.document), true)
  }
})

test('normalisasi memberi ID stabil pada blok baru dan seluruh blok bersarang', () => {
  const rawRoot: StudioJsonNode = {
    type: 'doc',
    content: [
      {
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'Isi baru' }] },
            ],
          },
        ],
      },
    ],
  }
  const document = createStudioDocument(rawRoot, { idFactory: sequentialIds() })
  const result = validateStudioDocument(document)

  assert.equal(result.ok, true)
  assert.equal(document.root.content?.[0].attrs?.id, 'bulletList-test-2')
  assert.equal(document.root.content?.[0].content?.[0].attrs?.id, 'listItem-test-3')
  assert.equal(document.root.content?.[0].content?.[0].content?.[0].attrs?.id, 'paragraph-test-4')
})

test('normalisasi tidak mengganti ID yang sudah ada', () => {
  const normalized = normalizeStudioRoot(
    {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { id: 'paragraph-owned', schemaVersion: 1 },
          content: [{ type: 'text', text: 'Tetap sama' }],
        },
      ],
    },
    sequentialIds()
  )

  assert.equal(normalized.content?.[0].attrs?.id, 'paragraph-owned')
})

test('validator menolak node tak dikenal dan tautan dengan protokol berbahaya', () => {
  const unsafe = createStudioDocument(
    {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'klik',
              marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }],
            },
          ],
        },
        { type: 'html' as StudioJsonNode['type'], attrs: { raw: '<script />' } },
      ],
    },
    { idFactory: sequentialIds() }
  )
  const result = validateStudioDocument(unsafe)

  assert.equal(result.ok, false)
  if (!result.ok) {
    assert.equal(result.issues.some((issue) => issue.message.includes('Protokol URL')), true)
    assert.equal(result.issues.some((issue) => issue.message.includes('tidak didukung')), true)
  }
})

test('validator mendeteksi ID node duplikat', () => {
  const duplicate: StudioDocument = {
    schemaVersion: 1,
    documentId: 'doc-duplicate',
    root: {
      type: 'doc',
      content: [
        { type: 'paragraph', attrs: { id: 'same-id', schemaVersion: 1 } },
        { type: 'paragraph', attrs: { id: 'same-id', schemaVersion: 1 } },
      ],
    },
  }
  const result = validateStudioDocument(duplicate)

  assert.equal(result.ok, false)
  if (!result.ok) {
    assert.equal(result.issues.some((issue) => issue.message.includes('duplikat')), true)
  }
})

test('validator menolak struktur node yang tidak sesuai content model', () => {
  const invalidTree = createStudioDocument(
    {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'figure',
              attrs: { assetId: 'asset-inside-paragraph', alt: 'Tidak sah' },
            },
          ],
        },
      ],
    },
    { idFactory: sequentialIds() }
  )
  const result = validateStudioDocument(invalidTree)

  assert.equal(result.ok, false)
  if (!result.ok) {
    assert.equal(result.issues.some((issue) => issue.message.includes('langsung di dalam paragraph')), true)
  }
})

test('validator menerima blok produksi di dalam item daftar sesuai content model editor', () => {
  const document = createStudioDocument({
    type: 'doc',
    content: [{
      type: 'bulletList',
      content: [{
        type: 'listItem',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'Penjelasan' }] },
          {
            type: 'equation',
            attrs: { latex: 'E = mc^2', label: 'Kesetaraan massa dan energi' },
          },
        ],
      }],
    }],
  }, { idFactory: sequentialIds() })

  assert.equal(validateStudioDocument(document).ok, true)
})

test('jalur migrasi v0 menambahkan wrapper dan metadata node v1', () => {
  const migrated = migrateStudioDocument(
    {
      schemaVersion: 0,
      documentId: 'legacy-doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Warisan' }] }],
    },
    sequentialIds()
  )

  assert.equal(migrated.ok, true)
  if (migrated.ok) {
    assert.equal(migrated.document.schemaVersion, 1)
    assert.equal(migrated.document.documentId, 'legacy-doc')
    assert.equal(migrated.document.root.content?.[0].attrs?.schemaVersion, 1)
  }
})

test('dokumen panjang 5.000 paragraf tetap lolos round-trip kontrak', () => {
  const root: StudioJsonNode = {
    type: 'doc',
    content: Array.from({ length: 5_000 }, (_, index) => ({
      type: 'paragraph' as const,
      content: [{ type: 'text' as const, text: `Paragraf pengujian ${index + 1}` }],
    })),
  }
  const document = createStudioDocument(root, { idFactory: sequentialIds() })
  const restored = migrateStudioDocument(JSON.parse(JSON.stringify(document)))

  assert.equal(restored.ok, true)
  if (restored.ok) assert.equal(studioDocumentsEqual(document, restored.document), true)
})

test('batas node mencegah dokumen ekstrem diproses tanpa kendali', () => {
  const root: StudioJsonNode = {
    type: 'doc',
    content: Array.from({ length: 10_001 }, (_, index) => ({
      type: 'paragraph' as const,
      attrs: { id: `paragraph-limit-${index}`, schemaVersion: 1 },
      content: [{ type: 'text' as const, text: 'x' }],
    })),
  }
  const result = validateStudioDocument({
    schemaVersion: 1,
    documentId: 'doc-too-large',
    root,
  })

  assert.equal(result.ok, false)
  if (!result.ok) {
    assert.equal(result.issues.some((issue) => issue.message.includes('batas 20000 node')), true)
  }
})

test('fingerprint draf stabil dan berubah ketika isi berubah', async () => {
  const first = await fingerprintStudioDraft(fixtureContent)
  const same = await fingerprintStudioDraft({ ...fixtureContent })
  const changed = await fingerprintStudioDraft({ ...fixtureContent, title: 'Judul berbeda' })

  assert.equal(first, same)
  assert.notEqual(first, changed)
})

test('fingerprint canonical tidak berubah ketika urutan kunci JSON berbeda', async () => {
  const reorderedDocument: StudioDocument = {
    root: editorialStudioFixture.root,
    documentId: editorialStudioFixture.documentId,
    schemaVersion: editorialStudioFixture.schemaVersion,
  }
  const original = await fingerprintStudioDraft(fixtureContent)
  const reordered = await fingerprintStudioDraft({
    ...fixtureContent,
    document: reorderedDocument,
  })

  assert.equal(original, reordered)
})

test('verifikasi fingerprint menerima serialisasi canonical, legacy, dan fallback FNV', async () => {
  const canonicalFingerprint = await fingerprintStudioDraft(fixtureContent)
  const legacyFingerprint = createHash('sha256')
    .update(JSON.stringify({
      title: fixtureContent.title,
      deck: fixtureContent.deck,
      document: fixtureContent.document,
    }))
    .digest('hex')
  const fallbackFingerprint = fnv1aFingerprint(serializeStudioDraft(fixtureContent))

  assert.equal(
    await studioDraftFingerprintMatches(fixtureContent, canonicalFingerprint),
    true
  )
  assert.equal(
    await studioDraftFingerprintMatches(fixtureContent, legacyFingerprint),
    true
  )
  assert.equal(
    await studioDraftFingerprintMatches(fixtureContent, fallbackFingerprint),
    true
  )
})

test('migrasi durability memverifikasi v1 mentah lalu menghasilkan v2 tanpa mutasi input', async () => {
  const source = JSON.parse(JSON.stringify(fixtureContent)) as StudioDraftContent
  const before = JSON.stringify(source)
  const sourceFingerprint = await fingerprintStudioDraft(source)
  const migrated = await migrateVerifiedStudioDraftContentToV2(
    source,
    sourceFingerprint,
    sequentialIds()
  )

  assert.equal(migrated.sourceSchemaVersion, 1)
  assert.equal(migrated.content.document.schemaVersion, 2)
  assert.equal(migrated.sourceFingerprint, sourceFingerprint)
  assert.notEqual(migrated.migratedFingerprint, sourceFingerprint)
  assert.equal(migrated.migrated, true)
  assert.equal(JSON.stringify(source), before)
})

test('migrasi durability menolak isi yang berubah sebelum migrasi dijalankan', async () => {
  const sourceFingerprint = await fingerprintStudioDraft(fixtureContent)

  await assert.rejects(
    migrateVerifiedStudioDraftContentToV2(
      { ...fixtureContent, title: 'Judul yang telah diubah' },
      sourceFingerprint
    ),
    {
      name: 'StudioPersistenceCorruptionError',
      message: 'Checksum sumber draf tidak cocok sebelum migrasi.',
    }
  )
})

test('parser record menolak metadata rusak dan documentId yang tidak cocok', async () => {
  const valid = await fixtureRecord()
  assert.notEqual(parseStudioDraftRecord(valid), null)
  assert.equal(parseStudioDraftRecord({ ...valid, revision: 0 }), null)
  assert.equal(parseStudioDraftRecord({ ...valid, documentId: 'doc-lain' }), null)
})

test('parser record memigrasikan record penyimpanan v1 tanpa metadata server', async () => {
  const current = await fixtureRecord()
  const legacy = {
    ...current,
    storageVersion: 1,
  }
  delete (legacy as Partial<StudioDraftRecord>).serverRevision
  delete (legacy as Partial<StudioDraftRecord>).serverFingerprint
  delete (legacy as Partial<StudioDraftRecord>).lastSyncedAt

  const parsed = parseStudioDraftRecord(legacy)
  assert.notEqual(parsed, null)
  assert.equal(parsed?.storageVersion, 2)
  assert.equal(parsed?.serverRevision, null)
})

test('metadata sinkronisasi record harus kosong bersama-sama atau lengkap dan valid', async () => {
  const record = await fixtureRecord()
  assert.equal(parseStudioDraftRecord({ ...record, serverRevision: 1 }), null)
  assert.notEqual(parseStudioDraftRecord({
    ...record,
    serverRevision: 2,
    serverFingerprint: 'a'.repeat(64),
    lastSyncedAt: '2026-08-06T13:00:00.000Z',
  }), null)
})

test('kebijakan snapshot membuat checkpoint berkala dan selalu menyimpan aksi eksplisit', async () => {
  const previous = await fixtureRecord()
  assert.equal(shouldCreateStudioSnapshot(null, 'autosave', new Date('2026-08-06T12:01:00Z')), true)
  assert.equal(shouldCreateStudioSnapshot(previous, 'autosave', new Date('2026-08-06T12:04:59Z')), false)
  assert.equal(shouldCreateStudioSnapshot(previous, 'autosave', new Date('2026-08-06T12:05:00Z')), true)
  assert.equal(shouldCreateStudioSnapshot(previous, 'manual', new Date('2026-08-06T12:01:00Z')), true)
  assert.equal(shouldCreateStudioSnapshot(previous, 'restore', new Date('2026-08-06T12:01:00Z')), true)
})

test('migration v1 yang hanya dibuka tidak memicu write sampai ada edit operator', () => {
  assert.equal(shouldPersistStudioDraft(false, 'autosave'), false)
  assert.equal(shouldPersistStudioDraft(false, 'manual'), false)
  assert.equal(shouldPersistStudioDraft(true, 'autosave'), true)
  assert.equal(shouldPersistStudioDraft(false, 'restore'), true)
  assert.equal(shouldPersistStudioDraft(false, 'copy'), true)
})

test('gate autosave melewati restore tetapi menyimpan edit pertama setelah recovery', () => {
  const beforeHydration = evaluateStudioAutosaveGate({
    hydrated: false,
    hasConflict: false,
    writeEnabled: false,
    suppressNext: true,
  })
  assert.deepEqual(beforeHydration, { shouldSchedule: false, suppressNext: true })

  const restoredRender = evaluateStudioAutosaveGate({
    hydrated: true,
    hasConflict: false,
    writeEnabled: false,
    suppressNext: beforeHydration.suppressNext,
  })
  assert.deepEqual(restoredRender, { shouldSchedule: false, suppressNext: false })

  const firstOperatorEdit = evaluateStudioAutosaveGate({
    hydrated: true,
    hasConflict: false,
    writeEnabled: true,
    suppressNext: restoredRender.suppressNext,
  })
  assert.deepEqual(firstOperatorEdit, { shouldSchedule: true, suppressNext: false })
})

test('gate autosave mempertahankan suppression selama hydration atau konflik', () => {
  assert.deepEqual(evaluateStudioAutosaveGate({
    hydrated: true,
    hasConflict: true,
    writeEnabled: true,
    suppressNext: true,
  }), { shouldSchedule: false, suppressNext: true })
  assert.deepEqual(evaluateStudioAutosaveGate({
    hydrated: true,
    hasConflict: false,
    writeEnabled: false,
    suppressNext: false,
  }), { shouldSchedule: false, suppressNext: false })
})

test('retensi snapshot memilih revisi paling lama untuk dihapus', async () => {
  const base = await fixtureRecord()
  const snapshots: StudioDraftSnapshot[] = Array.from({ length: 6 }, (_, index) => ({
    ...base,
    revision: index + 1,
    snapshotId: `snapshot-${index + 1}`,
    reason: 'autosave',
  }))
  const expired = snapshotsOutsideRetention(snapshots, 3)

  assert.deepEqual(expired.map((snapshot) => snapshot.revision), [3, 2, 1])
})

test('parser snapshot hanya menerima alasan revisi yang dikenal', async () => {
  const valid = {
    ...(await fixtureRecord()),
    snapshotId: 'snapshot-valid',
    reason: 'manual',
  }
  assert.notEqual(parseStudioDraftSnapshot(valid), null)
  assert.notEqual(parseStudioDraftSnapshot({ ...valid, reason: 'server' }), null)
  assert.equal(parseStudioDraftSnapshot({ ...valid, reason: 'overwrite' }), null)
})

test('parser outbox menerima mutasi valid dan menolak UUID serta revisi dasar rusak', async () => {
  const record = await fixtureRecord()
  const outbox: StudioOutboxRecord = {
    storageVersion: 2,
    documentId: record.documentId,
    title: record.title,
    deck: record.deck,
    document: record.document,
    mutationId: '14c78b10-9e67-4a7a-8de6-94dd53b8e724',
    baseServerRevision: null,
    localRevision: record.revision,
    fingerprint: record.fingerprint,
    reason: 'autosave',
    createdAt: record.savedAt,
    attemptCount: 0,
    lastAttemptAt: null,
    lastError: null,
  }

  assert.notEqual(parseStudioOutboxRecord(outbox), null)
  assert.equal(parseStudioOutboxRecord({ ...outbox, mutationId: 'bukan-uuid' }), null)
  assert.equal(parseStudioOutboxRecord({ ...outbox, baseServerRevision: 0 }), null)
  assert.equal(parseStudioOutboxRecord({ ...outbox, attemptCount: 1 }), null)
})

test('kontrak request sync memvalidasi metadata dan canonical document', async () => {
  const record = await fixtureRecord()
  const outbox: StudioOutboxRecordV2 = {
    storageVersion: 2,
    documentId: record.documentId,
    title: record.title,
    deck: record.deck,
    document: editorialStudioV2Fixture,
    mutationId: '14c78b10-9e67-4a7a-8de6-94dd53b8e724',
    baseServerRevision: 3,
    localRevision: 4,
    fingerprint: await fingerprintStudioDraft(fixtureContentV2),
    reason: 'manual',
    createdAt: record.savedAt,
    attemptCount: 0,
    lastAttemptAt: null,
    lastError: null,
  }
  const request = studioSyncRequestFromOutbox(outbox)

  assert.equal(parseStudioSyncRequest(request).ok, true)
  const migratedLegacyRequest = parseStudioSyncRequest({ ...request, document: editorialStudioFixture })
  assert.equal(migratedLegacyRequest.ok, true)
  if (migratedLegacyRequest.ok) assert.equal(migratedLegacyRequest.value.document.schemaVersion, 2)
  assert.equal(parseStudioSyncRequest({ ...request, document: { ...editorialStudioFixture, schemaVersion: 0 } }).ok, false)
  assert.equal(parseStudioSyncRequest({ ...request, reason: 'publish' }).ok, false)
  assert.equal(parseStudioSyncRequest({ ...request, title: 'x'.repeat(301) }).ok, false)
  assert.equal(parseStudioSyncRequest({
    ...request,
    document: { ...request.document, documentId: 'legacy-doc' },
  }).ok, false)
})

test('parser respons sync membedakan acknowledgement dan konflik tervalidasi', async () => {
  const record = await fixtureRecord()
  const acknowledgement = {
    status: 'accepted',
    documentId: record.documentId,
    serverRevision: 1,
    serverFingerprint: 'a'.repeat(64),
    syncedAt: '2026-08-06T13:00:00.000Z',
  }
  const conflict = {
    status: 'conflict',
    serverDraft: {
      title: record.title,
      deck: record.deck,
      document: record.document,
      serverRevision: 2,
      serverFingerprint: 'b'.repeat(64),
      syncedAt: '2026-08-06T13:05:00.000Z',
    },
  }

  assert.equal(parseStudioSyncResponse(acknowledgement)?.status, 'accepted')
  assert.equal(parseStudioSyncResponse(conflict)?.status, 'conflict')
  assert.equal(parseStudioSyncResponse({ ...acknowledgement, serverFingerprint: 'invalid' }), null)
})

test('parser durability konflik server memverifikasi fingerprint v1 sebelum migrasi v2', async () => {
  const serverFingerprint = await fingerprintStudioDraft(fixtureContent)
  const serverDraft = {
    ...fixtureContent,
    serverRevision: 2,
    serverFingerprint,
    syncedAt: '2026-08-06T13:05:00.000Z',
  }
  const parsed = await parseVerifiedStudioServerDraftV2(serverDraft)

  assert.notEqual(parsed, null)
  assert.equal(parsed?.document.schemaVersion, 2)
  assert.equal(parsed?.sourceSchemaVersion, 1)
  assert.equal(parsed?.serverFingerprint, serverFingerprint)
  assert.notEqual(parsed?.migratedFingerprint, serverFingerprint)
  assert.equal(
    await parseVerifiedStudioServerDraftV2({ ...serverDraft, deck: 'Dek telah diubah' }),
    null
  )
})

test('parser sync aktif menerima konflik canonical v2 setelah aktivasi source-first', async () => {
  const sourceFingerprint = await fingerprintStudioDraft(fixtureContent)
  const migrated = await migrateVerifiedStudioDraftContentToV2(
    fixtureContent,
    sourceFingerprint,
    sequentialIds()
  )
  const v2Conflict = {
    status: 'conflict',
    serverDraft: {
      ...migrated.content,
      serverRevision: 3,
      serverFingerprint: migrated.migratedFingerprint,
      syncedAt: '2026-08-06T13:10:00.000Z',
    },
  }

  const parsed = parseStudioSyncResponse(v2Conflict)
  assert.equal(parsed?.status, 'conflict')
  if (parsed?.status === 'conflict') {
    assert.equal(parsed.serverDraft.document.schemaVersion, 2)
  }
})

test('migration sync mengunci akses client langsung dan hanya membuka RPC ke service role', () => {
  const migration = readFileSync(
    resolve(process.cwd(), 'supabase/migrations/20260806230000_editorial_studio_draft_sync.sql'),
    'utf8'
  ).toLowerCase()

  assert.match(migration, /enable row level security/)
  assert.match(migration, /force row level security/)
  assert.match(migration, /to anon, authenticated\s+using \(false\)\s+with check \(false\)/)
  assert.match(migration, /revoke all on function public\.sync_editorial_studio_draft[\s\S]+from public, anon, authenticated/)
  assert.match(migration, /grant execute on function public\.sync_editorial_studio_draft[\s\S]+to service_role/)
})

test('migration sync memiliki serialisasi, idempotency, konflik optimistis, dan tanpa publish', () => {
  const migration = readFileSync(
    resolve(process.cwd(), 'supabase/migrations/20260806230000_editorial_studio_draft_sync.sql'),
    'utf8'
  ).toLowerCase()

  assert.match(migration, /mutation_id uuid not null unique/)
  assert.match(migration, /pg_advisory_xact_lock/)
  assert.match(migration, /for update/)
  assert.match(migration, /'duplicate'::text/)
  assert.match(migration, /'conflict'::text/)
  assert.doesNotMatch(migration, /\bpublished_at\b|\bpublish_editorial|\bstatus\s+text/)
})

test('metadata artikel canonical tervalidasi bersama dokumen', () => {
  const document = createStudioDocument(undefined, {
    article: {
      kind: 'article',
      articleId: null,
      slug: 'artikel-uji',
      coverImageUrl: 'https://example.com/cover.webp',
      category: 'Sains',
      kicker: 'Analisis',
      coverIllustrator: 'Saintifiks',
      country: 'Indonesia',
    },
  })
  assert.equal(validateStudioDocument(document).ok, true)
  assert.equal(validateStudioDocument({
    ...document,
    article: { ...document.article, coverImageUrl: 'javascript:alert(1)' },
  }).ok, false)
})

test('adapter Markdown menjaga struktur dasar dan fallback terbitan', () => {
  const document = markdownToStudioDocument([
    '## Bagian utama',
    '',
    'Paragraf dengan **tebal** dan [tautan](https://example.com).',
    '',
    '- Satu',
    '- Dua',
    '',
    '| Konsep | Makna |',
    '| --- | --- |',
    '| Rayleigh | Hamburan |',
    '',
    '![Deskripsi](https://example.com/image.webp "Keterangan")',
  ].join('\n'), { documentId: 'doc-markdown-adapter' })

  assert.equal(validateStudioDocument(document).ok, true)
  const fallback = studioDocumentToMarkdown(document)
  assert.match(fallback, /## Bagian utama/)
  assert.match(fallback, /\*\*tebal\*\*/)
  assert.equal(document.root.content?.some((node) => node.type === 'table'), true)
  assert.match(fallback, /\| --- \| --- \|/)
  assert.match(fallback, /!\[Deskripsi\]\(https:\/\/example\.com\/image\.webp "Keterangan"\)/)
})

test('preflight hanya meloloskan blok produksi yang lengkap', () => {
  const document = markdownToStudioDocument('Isi artikel yang siap dibaca.', {
    documentId: 'doc-preflight-ready',
    article: {
      kind: 'article',
      articleId: null,
      slug: 'artikel-siap',
      coverImageUrl: null,
      category: '',
      kicker: '',
      coverIllustrator: '',
      country: '',
    },
  })
  assert.equal(preflightStudioArticle('Judul siap', 'Ringkasan siap.', document).ok, true)
  assert.equal(preflightStudioArticle('', '', document).ok, false)
})

test('chart Markdown lama dipertahankan sebagai blok terstruktur dan diblokir sampai workflow tersedia', () => {
  const document = markdownToStudioDocument('Paragraf.\n\n{{chart:pertumbuhan}}', {
    documentId: 'doc-chart-legacy',
    article: {
      kind: 'article',
      articleId: null,
      slug: 'grafik-lama',
      coverImageUrl: null,
      category: '',
      kicker: '',
      coverIllustrator: '',
      country: '',
    },
  })
  assert.equal(document.root.content?.some((node) => node.type === 'chartReference'), true)
  const preflight = preflightStudioArticle('Grafik lama', 'Ringkasan', document)
  assert.equal(preflight.ok, false)
  assert.equal(preflight.blockers.some((issue) => issue.code === 'future-chartReference'), true)
})

test('adapter mengubah display math menjadi equation dan menahan HTML mentah lama', () => {
  const document = markdownToStudioDocument('$$\nE = mc^2\n$$\n\n<div>warisan</div>', {
    documentId: 'doc-legacy-special-blocks',
    article: {
      kind: 'article',
      articleId: null,
      slug: 'blok-warisan',
      coverImageUrl: null,
      category: '',
      kicker: '',
      coverIllustrator: '',
      country: '',
    },
  })

  assert.equal(document.root.content?.some((node) => node.type === 'equation'), true)
  const preflight = preflightStudioArticle('Blok warisan', 'Ringkasan', document)
  assert.equal(preflight.blockers.some((issue) => issue.code === 'legacy-raw-html'), true)
})

test('migration publikasi memakai snapshot immutable, pointer publik, dan RPC service-role atomik', () => {
  const migration = readFileSync(
    resolve(process.cwd(), 'supabase/migrations/20260807010000_editorial_studio_publication.sql'),
    'utf8'
  ).toLowerCase()

  assert.match(migration, /create table if not exists public\.editorial_studio_published_snapshots/)
  assert.match(migration, /before update or delete[\s\S]+prevent_studio_snapshot_mutation/)
  assert.match(migration, /create table if not exists public\.editorial_studio_publications/)
  assert.match(migration, /using \(exists \([\s\S]+public\.editorial_studio_publications/)
  assert.match(migration, /create or replace function public\.publish_editorial_studio_article/)
  assert.match(migration, /requested_article_id is null and btrim\(new\.title\) = ''/)
  assert.match(migration, /for update/)
  assert.match(migration, /on conflict \(article_id\) do update/)
  assert.match(migration, /revoke all on function public\.publish_editorial_studio_article[\s\S]+from public, anon, authenticated/)
  assert.match(migration, /grant execute on function public\.publish_editorial_studio_article[\s\S]+to service_role/)
})

test('hotfix digest mempertahankan search_path sempit dan tidak mengubah tabel atau izin', () => {
  const publicationMigration = readFileSync(
    resolve(process.cwd(), 'supabase/migrations/20260807010000_editorial_studio_publication.sql'),
    'utf8'
  ).toLowerCase().replace(/\r\n/g, '\n')
  const migration = readFileSync(
    resolve(
      process.cwd(),
      'supabase/migrations/20260814220000_editorial_studio_digest_schema_hotfix.sql'
    ),
    'utf8'
  ).toLowerCase().replace(/\r\n/g, '\n')

  assert.match(migration, /create or replace function public\.link_editorial_revision_to_article/)
  assert.match(migration, /security definer\s+set search_path = public/)
  assert.match(migration, /extensions\.digest\(new\.document_id, 'sha256'\)/)
  assert.doesNotMatch(migration, /encode\(\s*digest\(/)
  assert.doesNotMatch(migration, /set search_path\s*=\s*public\s*,\s*extensions/)
  assert.doesNotMatch(migration, /\b(?:create|alter|drop) table\b/)
  assert.doesNotMatch(migration, /\b(?:grant|revoke)\b/)

  const functionPattern = /create or replace function public\.link_editorial_revision_to_article\(\)[\s\S]*?\n\$\$;/
  const originalFunction = publicationMigration.match(functionPattern)?.[0]
  const hotfixFunction = migration.match(functionPattern)?.[0]
  assert.ok(originalFunction)
  assert.ok(hotfixFunction)
  assert.equal(hotfixFunction.replace('extensions.digest(', 'digest('), originalFunction)
})

test('hotfix publish mengualifikasi kolom published_at tanpa mengubah kontrak RPC', () => {
  const publicationMigration = readFileSync(
    resolve(process.cwd(), 'supabase/migrations/20260807010000_editorial_studio_publication.sql'),
    'utf8'
  ).toLowerCase().replace(/\r\n/g, '\n')
  const migration = readFileSync(
    resolve(
      process.cwd(),
      'supabase/migrations/20260814230000_editorial_studio_publish_ambiguity_hotfix.sql'
    ),
    'utf8'
  ).toLowerCase().replace(/\r\n/g, '\n')

  assert.match(migration, /create or replace function public\.publish_editorial_studio_article/)
  assert.match(migration, /security definer\s+set search_path = public/)
  assert.match(migration, /update public\.articles as target_article/)
  assert.match(
    migration,
    /published_at = coalesce\(target_article\.published_at, publication_time\)/
  )
  assert.doesNotMatch(migration, /coalesce\(\s*published_at\s*,\s*publication_time\)/)
  assert.doesNotMatch(migration, /\b(?:create|alter|drop) table\b/)
  assert.doesNotMatch(migration, /\b(?:grant|revoke)\b/)

  const functionPattern = /create or replace function public\.publish_editorial_studio_article\([\s\S]*?\n\$\$;/
  const originalFunction = publicationMigration.match(functionPattern)?.[0]
  const hotfixFunction = migration.match(functionPattern)?.[0]
  assert.ok(originalFunction)
  assert.ok(hotfixFunction)
  assert.equal(
    hotfixFunction
      .replace('update public.articles as target_article', 'update public.articles')
      .replace(
        'coalesce(target_article.published_at, publication_time)',
        'coalesce(published_at, publication_time)'
      )
      .replace('where target_article.id = studio_document.article_id', 'where id = studio_document.article_id'),
    originalFunction
  )
})

test('retry sinkronisasi berhenti setelah 15 detik dan 60 detik untuk satu mutasi', () => {
  let cycle = createStudioServerRetryCycle()

  cycle = recordStudioServerRetryableFailure(cycle, 'mutation-a')
  assert.equal(cycle.failedRequestCount, 1)
  assert.equal(getStudioServerRetryDelay(cycle.failedRequestCount), 15_000)

  cycle = recordStudioServerRetryableFailure(cycle, 'mutation-a')
  assert.equal(cycle.failedRequestCount, 2)
  assert.equal(getStudioServerRetryDelay(cycle.failedRequestCount), 60_000)

  cycle = recordStudioServerRetryableFailure(cycle, 'mutation-a')
  assert.equal(cycle.failedRequestCount, 3)
  assert.equal(getStudioServerRetryDelay(cycle.failedRequestCount), null)
})

test('mutasi baru dan retry manual memulai anggaran retry yang baru', () => {
  let cycle = recordStudioServerRetryableFailure(
    createStudioServerRetryCycle('mutation-a'),
    'mutation-a'
  )
  cycle = recordStudioServerRetryableFailure(cycle, 'mutation-a')
  cycle = recordStudioServerRetryableFailure(cycle, 'mutation-a')

  const newMutationCycle = recordStudioServerRetryableFailure(cycle, 'mutation-b')
  assert.equal(newMutationCycle.mutationId, 'mutation-b')
  assert.equal(newMutationCycle.failedRequestCount, 1)
  assert.equal(getStudioServerRetryDelay(newMutationCycle.failedRequestCount), 15_000)

  const manualCycle = createStudioServerRetryCycle(cycle.mutationId)
  const manualFailure = recordStudioServerRetryableFailure(manualCycle, 'mutation-a')
  assert.equal(manualFailure.failedRequestCount, 1)
  assert.equal(getStudioServerRetryDelay(manualFailure.failedRequestCount), 15_000)
})

test('hook sinkronisasi memakai retry policy terbatas, bukan timer tanpa batas', () => {
  const hook = readFileSync(
    resolve(process.cwd(), 'components/editorial-studio/useStudioServerSync.ts'),
    'utf8'
  )

  assert.match(hook, /recordStudioServerRetryableFailure\(/)
  assert.match(hook, /getStudioServerRetryDelay\(retryCycleRef\.current\.failedRequestCount\)/)
  assert.match(hook, /if \(retryDelay === null\) return/)
  assert.doesNotMatch(hook, /const RETRY_DELAY_MS/)
})

test('boundary publish aktif memigrasikan revision ke v2 dan menjalankan preflight v2', () => {
  const route = readFileSync(
    resolve(process.cwd(), 'app/api/admin/editorial-studio/publish/route.ts'),
    'utf8'
  )

  assert.match(route, /migrateStudioDocumentToV2\(revisionRow\.content\)/)
  assert.match(route, /preflightStudioArticleV2\(revisionRow\.title, revisionRow\.deck, migrated\.document\)/)
})

test('publish berpindah ke URL edit permanen tanpa refresh route draf yang bersaing', () => {
  const studio = readFileSync(
    resolve(process.cwd(), 'components/editorial-studio/StudioLab.tsx'),
    'utf8'
  )
  const publishFlow = studio.match(
    /async function publishArticle\(\)[\s\S]*?\n  async function unpublishArticle\(\)/
  )?.[0]

  assert.ok(publishFlow)
  assert.match(
    publishFlow,
    /router\.replace\(`\/dashboard\/artikel\/\$\{payload\.articleId\}\/edit`\)/
  )
  assert.doesNotMatch(publishFlow, /router\.refresh\(\)/)
})

test('operator source-first memakai registry nyata dan tetap menutup command dataset serta chart', () => {
  const editor = readFileSync(
    resolve(process.cwd(), 'components/editorial-studio/StudioEditor.tsx'),
    'utf8'
  )
  const registry = readFileSync(
    resolve(process.cwd(), 'components/editorial-studio/StudioSourceRegistry.tsx'),
    'utf8'
  )

  assert.match(editor, /sources\.find\(\(item\) => item\.id === citationDialog\.sourceId\)/)
  assert.doesNotMatch(editor, /createStudioId\('citation'\)/)
  assert.doesNotMatch(editor, /id: 'dataset'/)
  assert.doesNotMatch(editor, /id: 'chart'/)
  assert.match(registry, /document\.evidence\.methodology\?\.sourceIds\.forEach\(addReference\)/)
  assert.match(registry, /document\.evidence\.datasets\.forEach/)
  assert.match(registry, /dataset\.sourceIds\.forEach\(addReference\)/)
  assert.match(registry, /disabled=\{referenceCount > 0\}/)
  assert.match(registry, /Catatan untuk pembaca/)
  assert.match(registry, /ditampilkan dalam daftar sumber publik/)
  assert.doesNotMatch(registry, /Catatan internal/)
})

test('golden fixture v2 memiliki registry hasil migrasi yang valid', () => {
  const result = validateStudioDocumentV2(editorialStudioV2Fixture)

  assert.equal(result.ok, true)
  assert.equal(editorialStudioV2Fixture.schemaVersion, 2)
  assert.deepEqual(
    editorialStudioV2Fixture.evidence.sources.map((source) => source.id),
    ['source-poc-1']
  )
  assert.deepEqual(
    editorialStudioV2Fixture.evidence.datasets.map((dataset) => dataset.id),
    ['dataset-poc-1']
  )
  assert.deepEqual(
    editorialStudioV2Fixture.evidence.charts.map((chart) => chart.id),
    ['chart-poc-1']
  )
  const chartReference = editorialStudioV2Fixture.root.content?.find(
    (node) => node.type === 'chartReference'
  )
  const datasetReference = editorialStudioV2Fixture.root.content?.find(
    (node) => node.type === 'datasetReference'
  )
  assert.equal(chartReference?.attrs?.title, undefined)
  assert.equal(datasetReference?.attrs?.label, undefined)
})

test('validator legacy v1 tetap menolak dokumen v2 secara eksplisit', () => {
  assert.equal(validateStudioDocument(editorialStudioV2Fixture).ok, false)
  assert.equal(validateStudioDocumentV2(editorialStudioV2Fixture).ok, true)
})

test('reader compatibility tidak menaikkan v1 secara otomatis', () => {
  const restored = migrateStudioDocument(JSON.parse(JSON.stringify(editorialStudioFixture)))

  assert.equal(restored.ok, true)
  if (restored.ok) assert.equal(restored.document.schemaVersion, 1)
})

test('migrasi v1 ke v2 menjaga isi dan stable ID tanpa memutasi input', () => {
  const original = JSON.stringify(editorialStudioFixture)
  const migrated = migrateStudioDocumentToV2(editorialStudioFixture)

  assert.equal(migrated.ok, true)
  assert.equal(JSON.stringify(editorialStudioFixture), original)
  if (migrated.ok && migrated.document.schemaVersion === 2) {
    assert.equal(migrated.document.documentId, editorialStudioFixture.documentId)
    assert.equal(
      migrated.document.root.content?.[0].attrs?.id,
      editorialStudioFixture.root.content?.[0].attrs?.id
    )
    assert.equal(
      migrated.document.root.content?.[0].content?.[0].text,
      editorialStudioFixture.root.content?.[0].content?.[0].text
    )
    assert.equal(migrated.document.root.content?.[0].attrs?.schemaVersion, 2)
  }
})

test('migrasi v2 idempotent dan round-trip JSON identik', () => {
  const migratedAgain = migrateStudioDocumentToV2(
    JSON.parse(JSON.stringify(editorialStudioV2Fixture))
  )

  assert.equal(migratedAgain.ok, true)
  if (migratedAgain.ok) {
    assert.equal(studioDocumentsEqual(editorialStudioV2Fixture, migratedAgain.document), true)
  }
})

test('jalur migrasi v0 dapat mencapai v2 secara berurutan', () => {
  const migrated = migrateStudioDocumentToV2({
    schemaVersion: 0,
    documentId: 'legacy-doc-v2',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Warisan' }] }],
  }, sequentialIds())

  assert.equal(migrated.ok, true)
  if (migrated.ok && migrated.document.schemaVersion === 2) {
    assert.equal(migrated.document.documentId, 'legacy-doc-v2')
    assert.deepEqual(migrated.document.evidence, {
      sources: [],
      methodology: null,
      datasets: [],
      charts: [],
    })
  }
})

test('validator v2 menolak citation dengan sourceId dangling', () => {
  const dangling = JSON.parse(JSON.stringify(editorialStudioV2Fixture)) as StudioDocumentV2
  const paragraph = dangling.root.content?.[0]
  const citation = paragraph?.content?.find((node) => node.type === 'citation')
  if (citation?.attrs) citation.attrs.sourceId = 'source-tidak-ada'

  const result = validateStudioDocumentV2(dangling)
  assert.equal(result.ok, false)
  if (!result.ok) {
    assert.equal(result.issues.some((issue) => issue.message.includes('source tidak ditemukan')), true)
  }
})

test('validator v2 menolak ID evidence duplikat', () => {
  const duplicate = JSON.parse(JSON.stringify(editorialStudioV2Fixture)) as StudioDocumentV2
  duplicate.evidence.sources.push({ ...duplicate.evidence.sources[0] })

  const result = validateStudioDocumentV2(duplicate)
  assert.equal(result.ok, false)
  if (!result.ok) {
    assert.equal(result.issues.some((issue) => issue.message.includes('ID evidence duplikat')), true)
  }
})

function semanticChartDocument(): StudioDocumentV2 {
  return createStudioDocumentV2({
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Angka inflasi dapat diperiksa pada ' },
          {
            type: 'citation',
            attrs: { sourceId: 'source-bps', label: 'BPS', locator: 'tabel 1' },
          },
          { type: 'text', text: '.' },
        ],
      },
      {
        type: 'chartReference',
        attrs: { chartId: 'chart-inflasi' },
      },
    ],
  }, {
    documentId: 'doc-semantic-chart',
    idFactory: sequentialIds(),
    evidence: {
      sources: [{
        id: 'source-bps',
        title: 'Data inflasi',
        publisher: 'BPS',
        authors: [],
        url: 'https://example.com/inflasi',
        publishedDate: '2026-01-01',
        accessedDate: '2026-08-14',
        note: '',
      }],
      methodology: {
        summary: 'Nilai dibandingkan per tahun tanpa mengubah angka sumber.',
        limitations: 'Rangkaian ini belum menjelaskan variasi antarwilayah.',
        sourceIds: ['source-bps'],
      },
      datasets: [{
        id: 'dataset-inflasi',
        title: 'Inflasi tahunan',
        sourceIds: ['source-bps'],
        downloadUrl: 'https://example.com/inflasi.csv',
        accessedDate: '2026-08-14',
        methodology: 'Nilai digunakan tanpa interpolasi.',
        limitations: 'Dataset hanya memuat satu observasi contoh.',
        columns: [
          { key: 'year', label: 'Tahun', dataType: 'string', unit: null },
          { key: 'value', label: 'Inflasi', dataType: 'number', unit: '%' },
        ],
        rows: [{ id: 'row-inflasi-2025', values: { year: '2025', value: 2.4 } }],
      }],
      charts: [{
        id: 'chart-inflasi',
        title: 'Perubahan inflasi',
        summary: 'Inflasi pada tahun 2025 tercatat 2,4 persen.',
        datasetId: 'dataset-inflasi',
        type: 'line',
        xKey: 'year',
        series: [{ id: 'series-inflasi', columnKey: 'value', label: 'Inflasi' }],
      }],
    },
  })
}

function f1bPublishCandidate(): StudioDocumentV2 {
  const document = semanticChartDocument()
  document.article = {
    kind: 'article',
    articleId: null,
    slug: 'grafik-semantik',
    coverImageUrl: null,
    category: 'Data',
    kicker: 'Analisis',
    coverIllustrator: '',
    country: 'Indonesia',
  }
  return document
}

function sourceFirstDocument(): StudioDocumentV2 {
  return createStudioDocumentV2({
    type: 'doc',
    content: [{
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Angka resmi tersedia pada ' },
        {
          type: 'citation',
          attrs: { sourceId: 'source-bps-release', label: 'BPS', locator: 'tabel 1' },
        },
        { type: 'text', text: '.' },
      ],
    }],
  }, {
    documentId: 'doc-source-first',
    idFactory: sequentialIds(),
    article: {
      kind: 'article',
      articleId: null,
      slug: 'sumber-pertama',
      coverImageUrl: null,
      category: 'Data',
      kicker: 'Verifikasi',
      coverIllustrator: '',
      country: 'Indonesia',
    },
    evidence: {
      sources: [{
        id: 'source-bps-release',
        title: 'Rilis inflasi nasional',
        publisher: 'Badan Pusat Statistik',
        authors: [],
        url: 'https://example.com/rilis-inflasi',
        publishedDate: '2026-08-01',
        accessedDate: '2026-08-14',
        note: '',
      }],
      methodology: null,
      datasets: [],
      charts: [],
    },
  })
}

test('validator v2 menerima chart semantik dengan dataset dan source terhubung', () => {
  assert.equal(validateStudioDocumentV2(semanticChartDocument()).ok, true)
})

test('fallback Markdown v2 mempertahankan source, metodologi, ringkasan, unit, dan tabel data', () => {
  const document = semanticChartDocument()
  document.evidence.sources[0].note = 'Catatan publik untuk membantu pembaca memeriksa sumber.'
  const fallback = studioDocumentToMarkdown(document)

  assert.match(fallback, /\[BPS, tabel 1\]\(https:\/\/example\.com\/inflasi\)/)
  assert.match(fallback, /Inflasi pada tahun 2025 tercatat 2,4 persen\./)
  assert.match(fallback, /\| Tahun \| Inflasi \(%\) \|/)
  assert.match(fallback, /\| 2025 \| 2\.4 \|/)
  assert.match(fallback, /Metodologi dataset:\*\* Nilai digunakan tanpa interpolasi\./)
  assert.match(fallback, /## Metodologi/)
  assert.match(fallback, /Rangkaian ini belum menjelaskan variasi antarwilayah\./)
  assert.match(fallback, /## Sumber/)
  assert.match(fallback, /Catatan publik untuk membantu pembaca memeriksa sumber\./)
  assert.doesNotMatch(fallback, /\{\{chart:/)
})

test('preflight v2 meloloskan vertical slice source dan citation yang lengkap', () => {
  const preflight = preflightStudioArticleV2(
    'Artikel dengan sumber',
    'Ringkasan yang dapat diperiksa.',
    sourceFirstDocument()
  )

  assert.equal(preflight.ok, true)
  assert.equal(preflight.blockers.length, 0)
  assert.equal(preflight.warnings.length, 0)
})

test('preflight v2 memblokir source tanpa URL dan placeholder hasil migrasi', () => {
  const document = sourceFirstDocument()
  document.evidence.sources[0].title = 'Sumber 1'
  document.evidence.sources[0].url = null
  const preflight = preflightStudioArticleV2('Artikel sumber', 'Ringkasan.', document)

  assert.equal(preflight.ok, false)
  assert.equal(preflight.blockers.some((issue) => issue.code === 'source-url-missing'), true)
  assert.equal(preflight.blockers.some((issue) => issue.code === 'source-placeholder'), true)
})

test('preflight v2 memperlakukan orphan evidence sebagai warning, bukan blocker', () => {
  const document = sourceFirstDocument()
  document.evidence.sources.push({
    id: 'source-belum-dipakai',
    title: 'Sumber pelengkap',
    publisher: 'Lembaga Data',
    authors: [],
    url: 'https://example.com/pelengkap',
    publishedDate: null,
    accessedDate: '2026-08-14',
    note: '',
  })
  const preflight = preflightStudioArticleV2('Artikel sumber', 'Ringkasan.', document)

  assert.equal(preflight.ok, true)
  assert.equal(preflight.warnings.some((issue) => issue.code === 'orphan-source'), true)
})

test('preflight v2 tetap menutup chart production meskipun evidence lengkap', () => {
  const document = semanticChartDocument()
  document.article = {
    kind: 'article',
    articleId: null,
    slug: 'grafik-semantik',
    coverImageUrl: null,
    category: 'Data',
    kicker: 'Analisis',
    coverIllustrator: '',
    country: 'Indonesia',
  }
  const preflight = preflightStudioArticleV2('Grafik semantik', 'Ringkasan.', document)

  assert.equal(preflight.ok, false)
  assert.equal(preflight.blockers.some((issue) => issue.code === 'future-chartReference'), true)
  assert.equal(preflight.blockers.some((issue) => issue.code === 'chart-summary-missing'), false)
  assert.equal(preflight.blockers.some((issue) => issue.code === 'dataset-table-missing'), false)
})

test('preflight v2 memerinci evidence placeholder sementara preflight legacy tetap v1', () => {
  const document = JSON.parse(JSON.stringify(editorialStudioV2Fixture)) as StudioDocumentV2
  document.article = {
    kind: 'article',
    articleId: null,
    slug: 'evidence-belum-lengkap',
    coverImageUrl: null,
    category: 'Data',
    kicker: '',
    coverIllustrator: '',
    country: 'Indonesia',
  }
  const v2Preflight = preflightStudioArticleV2('Evidence belum lengkap', 'Ringkasan.', document)
  const activePreflight = preflightStudioArticle('Kontrak aktif', 'Ringkasan.', editorialStudioFixture)

  assert.equal(v2Preflight.blockers.some((issue) => issue.code === 'source-url-missing'), true)
  assert.equal(v2Preflight.blockers.some((issue) => issue.code === 'dataset-table-missing'), true)
  assert.equal(v2Preflight.blockers.some((issue) => issue.code === 'chart-summary-missing'), true)
  assert.equal(activePreflight.blockers.some((issue) => issue.code === 'future-citation'), true)
})

test('validator v2 menolak mapping kolom chart yang tidak tersedia', () => {
  const invalid = semanticChartDocument()
  invalid.evidence.charts[0].series[0].columnKey = 'missing'

  const result = validateStudioDocumentV2(invalid)
  assert.equal(result.ok, false)
  if (!result.ok) {
    assert.equal(result.issues.some((issue) => issue.message.includes('Kolom series tidak ditemukan')), true)
  }
})

test('validator v2 menolak nilai cell yang tidak sesuai tipe kolom', () => {
  const invalid = semanticChartDocument()
  invalid.evidence.datasets[0].rows[0].values.value = 'bukan-angka'

  const result = validateStudioDocumentV2(invalid)
  assert.equal(result.ok, false)
  if (!result.ok) {
    assert.equal(result.issues.some((issue) => issue.message.includes('tipe kolom number')), true)
  }
})

test('validator v2 menerapkan batas jumlah source', () => {
  const invalid = createStudioDocumentV2(undefined, { documentId: 'doc-source-limit' })
  invalid.evidence.sources = Array.from(
    { length: STUDIO_EVIDENCE_LIMITS.sources + 1 },
    (_, index) => ({
      id: `source-limit-${index}`,
      title: `Sumber ${index}`,
      publisher: '',
      authors: [],
      url: null,
      publishedDate: null,
      accessedDate: null,
      note: '',
    })
  )

  const result = validateStudioDocumentV2(invalid)
  assert.equal(result.ok, false)
  if (!result.ok) {
    assert.equal(result.issues.some((issue) => issue.message.includes('Sources harus berupa array')), true)
  }
})

test('placeholder evidence hasil migrasi tetap valid secara struktural', () => {
  assert.equal(editorialStudioV2Fixture.evidence.sources[0].url, null)
  assert.equal(editorialStudioV2Fixture.evidence.datasets[0].columns.length, 0)
  assert.equal(editorialStudioV2Fixture.evidence.charts[0].datasetId, null)
  assert.equal(validateStudioDocumentV2(editorialStudioV2Fixture).ok, true)
})

test('validator v2 menolak URL dan tanggal evidence yang tidak aman', () => {
  const invalid = semanticChartDocument()
  invalid.evidence.sources[0].url = 'javascript:alert(1)'
  invalid.evidence.sources[0].publishedDate = '2026-02-30'

  const result = validateStudioDocumentV2(invalid)
  assert.equal(result.ok, false)
  if (!result.ok) {
    assert.equal(result.issues.some((issue) => issue.message.includes('http atau https')), true)
    assert.equal(result.issues.some((issue) => issue.message.includes('Tanggal evidence tidak valid')), true)
  }
})

test('F1B-1 parser TSV menjaga quoted cell, multiline, formula teks, dan konversi id-ID', () => {
  const parsed = parseStudioTabularInput(
    'Tahun\tNilai\tCatatan\r\n2025\t1.234,50\t"=SUM(A1:A2)"\r\n2026\t2.000,00\t"Dua\r\nbaris"\r\n'
  )

  assert.equal(parsed.ok, true)
  if (!parsed.ok) return
  assert.equal(parsed.table.rows.length, 2)
  assert.equal(parsed.table.rows[1][2], 'Dua\nbaris')

  const built = buildStudioDatasetTable(
    parsed.table,
    [
      { dataType: 'string' },
      { dataType: 'number', unit: '%' },
      { dataType: 'string' },
    ],
    'id-ID',
    sequentialIds()
  )

  assert.equal(built.ok, true)
  if (!built.ok) return
  assert.deepEqual(built.columns.map((column) => column.key), ['tahun', 'nilai', 'catatan'])
  assert.equal(built.rows[0].values.nilai, 1234.5)
  assert.equal(built.rows[0].values.catatan, '=SUM(A1:A2)')
  assert.equal(built.rows[1].values.catatan, 'Dua\nbaris')
})

test('F1B-1 input tabular menolak bentuk rusak, batas terlampaui, nilai ambigu, dan pembulatan tidak aman', () => {
  const malformed = parseStudioTabularInput('A\tB\n"kutip tanpa penutup\t1')
  const uneven = parseStudioTabularInput('A\tB\n1')
  const duplicateHeader = parseStudioTabularInput('Nilai\tnilai\n1\t2')
  const tooManyColumns = parseStudioTabularInput(
    Array.from({ length: STUDIO_TABULAR_INPUT_LIMITS.columns + 1 }, (_, index) => `Kolom ${index}`).join('\t')
  )
  const tooManyRows = parseStudioTabularInput([
    'Nilai',
    ...Array.from(
      { length: STUDIO_TABULAR_INPUT_LIMITS.rows + 1 },
      (_, index) => String(index)
    ),
  ].join('\n'))

  assert.equal(malformed.ok, false)
  assert.equal(uneven.ok, false)
  assert.equal(duplicateHeader.ok, false)
  assert.equal(tooManyColumns.ok, false)
  assert.equal(tooManyRows.ok, false)
  assert.deepEqual(convertStudioTabularValue('1.234,56', 'number', 'id-ID'), {
    ok: true,
    value: 1234.56,
  })
  assert.deepEqual(convertStudioTabularValue('1,234.56', 'number', 'en-US'), {
    ok: true,
    value: 1234.56,
  })
  assert.equal(convertStudioTabularValue('1,234.56', 'number', 'id-ID').ok, false)
  assert.equal(convertStudioTabularValue('1.234,56', 'number', 'en-US').ok, false)
  assert.deepEqual(convertStudioTabularValue('29/02/2024', 'date', 'id-ID'), {
    ok: true,
    value: '2024-02-29',
  })
  assert.equal(convertStudioTabularValue('29/02/2023', 'date', 'id-ID').ok, false)
  assert.equal(convertStudioTabularValue('mungkin', 'boolean', 'id-ID').ok, false)
  assert.equal(
    convertStudioTabularValue('9007199254740992', 'number', 'en-US').ok,
    false
  )
  const roundedUnsafeInteger = convertStudioTabularValue(
    '9007199254740992.5',
    'number',
    'en-US'
  )
  assert.equal(roundedUnsafeInteger.ok, false)
  if (roundedUnsafeInteger.ok) return
  assert.equal(roundedUnsafeInteger.issue.code, 'unsafe-integer')
})

test('F1B-1 builder tabular membuat key sistem dan menolak label hasil review yang duplikat', () => {
  const parsed = parseStudioTabularInput('2025\tNilai %\tNilai orang\n2025\t2,4\t100')
  assert.equal(parsed.ok, true)
  if (!parsed.ok) return

  const built = buildStudioDatasetTable(
    parsed.table,
    [
      { dataType: 'string' },
      { dataType: 'number', unit: '%' },
      { dataType: 'number', unit: 'orang' },
    ],
    'id-ID',
    sequentialIds()
  )
  assert.equal(built.ok, true)
  if (built.ok) {
    assert.deepEqual(
      built.columns.map((column) => column.key),
      ['column-2025', 'nilai', 'nilai-orang']
    )
  }

  const duplicateLabels = buildStudioDatasetTable(
    parsed.table,
    [
      { dataType: 'string', label: 'Nilai' },
      { dataType: 'number', label: 'nilai', unit: '%' },
      { dataType: 'number', unit: 'orang' },
    ],
    'id-ID',
    sequentialIds()
  )
  assert.equal(duplicateLabels.ok, false)
  if (!duplicateLabels.ok) {
    assert.equal(duplicateLabels.issues.some((issue) => issue.code === 'duplicate-label'), true)
  }
})

test('F1B-1 chart model membangun mapping semantik dan mempertahankan stable ID saat edit', () => {
  const dataset = semanticChartDocument().evidence.datasets[0]
  const draft = {
    title: 'Perubahan inflasi',
    summary: 'Inflasi dapat dibandingkan per tahun.',
    type: 'line' as const,
    xKey: 'year',
    series: [{ columnKey: 'value' }],
  }

  assert.equal(validateStudioChartDraft(dataset, draft).ok, true)
  const built = buildStudioChartEvidence(dataset, draft, { idFactory: sequentialIds() })
  assert.equal(built.ok, true)
  if (!built.ok) return
  assert.equal(resolveStudioChartModel(dataset, built.chart).ok, true)

  const rebuilt = buildStudioChartEvidence(
    dataset,
    { ...draft, title: 'Perubahan inflasi tahunan' },
    {
      existingChart: built.chart,
      idFactory: () => {
        throw new Error('Stable ID seharusnya dipertahankan.')
      },
    }
  )
  assert.equal(rebuilt.ok, true)
  if (!rebuilt.ok) return
  assert.equal(rebuilt.chart.id, built.chart.id)
  assert.deepEqual(
    rebuilt.chart.series.map((series) => series.id),
    built.chart.series.map((series) => series.id)
  )
  assert.equal(
    findStudioDatasetChartDependencies([built.chart], dataset.id)[0].chartId,
    built.chart.id
  )
  assert.deepEqual(
    findStudioDatasetColumnChartDependencies([built.chart], dataset.id, 'value')[0].roles,
    ['series']
  )
})

test('F1B-1 chart model menolak tipe, unit, duplikasi, dan batas operator yang tidak aman', () => {
  const dataset = semanticChartDocument().evidence.datasets[0]
  const baseDraft = {
    title: 'Perubahan inflasi',
    summary: 'Ringkasan grafik.',
    type: 'line' as const,
    xKey: 'year',
    series: [{ columnKey: 'value' }],
  }
  const scatter = validateStudioChartDraft(dataset, { ...baseDraft, type: 'scatter' })
  const nonNumericSeries = validateStudioChartDraft(dataset, {
    ...baseDraft,
    series: [{ columnKey: 'year' }],
  })
  const missingUnitDataset = JSON.parse(JSON.stringify(dataset)) as typeof dataset
  missingUnitDataset.columns[1].unit = null
  const missingUnit = validateStudioChartDraft(missingUnitDataset, baseDraft)
  const mixedUnitDataset = JSON.parse(JSON.stringify(dataset)) as typeof dataset
  mixedUnitDataset.columns.push({
    key: 'population',
    label: 'Populasi',
    dataType: 'number',
    unit: 'orang',
  })
  const mixedUnits = validateStudioChartDraft(mixedUnitDataset, {
    ...baseDraft,
    series: [{ columnKey: 'value' }, { columnKey: 'population' }],
  })
  const expandedDataset = JSON.parse(JSON.stringify(dataset)) as typeof dataset
  const expandedSeries = Array.from(
    { length: STUDIO_CHART_INPUT_LIMITS.series + 1 },
    (_, index) => {
      const columnKey = `value-${index + 1}`
      expandedDataset.columns.push({
        key: columnKey,
        label: `Nilai ${index + 1}`,
        dataType: 'number',
        unit: '%',
      })
      return { columnKey }
    }
  )
  const tooManySeries = validateStudioChartDraft(expandedDataset, {
    ...baseDraft,
    series: expandedSeries,
  })

  assert.equal(scatter.ok, false)
  assert.equal(nonNumericSeries.ok, false)
  assert.equal(missingUnit.ok, false)
  assert.equal(mixedUnits.ok, false)
  assert.equal(tooManySeries.ok, false)
  if (!tooManySeries.ok) {
    assert.equal(tooManySeries.issues.some((issue) => issue.code === 'too-many-series'), true)
  }

  const readerChart = {
    id: 'chart-reader-seven',
    title: 'Tujuh seri',
    summary: 'Kompatibilitas reader schema v2.',
    datasetId: expandedDataset.id,
    type: 'bar' as const,
    xKey: 'year',
    series: expandedSeries.map((series, index) => ({
      id: `series-reader-${index + 1}`,
      columnKey: series.columnKey,
      label: `Nilai ${index + 1}`,
    })),
  }
  assert.equal(resolveStudioChartModel(expandedDataset, readerChart).ok, true)
})

test('F1B-1 validator canonical menolak nilai dataset dan mapping chart yang merusak integritas', () => {
  const invalidDate = semanticChartDocument()
  invalidDate.evidence.datasets[0].columns[0].dataType = 'date'
  const unsafeInteger = semanticChartDocument()
  unsafeInteger.evidence.datasets[0].rows[0].values.value = Number.MAX_SAFE_INTEGER + 1
  const unsafeText = semanticChartDocument()
  unsafeText.evidence.datasets[0].rows[0].values.year = '2025\u0000'
  const scatterWithStringX = semanticChartDocument()
  scatterWithStringX.evidence.charts[0].type = 'scatter'
  const nonNumericSeries = semanticChartDocument()
  nonNumericSeries.evidence.charts[0].series[0].columnKey = 'year'
  const duplicateSeries = semanticChartDocument()
  duplicateSeries.evidence.charts[0].series.push({
    id: 'series-inflasi-copy',
    columnKey: 'value',
    label: 'Inflasi salinan',
  })
  const mixedUnits = semanticChartDocument()
  mixedUnits.evidence.datasets[0].columns.push({
    key: 'population',
    label: 'Populasi',
    dataType: 'number',
    unit: 'orang',
  })
  mixedUnits.evidence.datasets[0].rows[0].values.population = 100
  mixedUnits.evidence.charts[0].series.push({
    id: 'series-population',
    columnKey: 'population',
    label: 'Populasi',
  })

  assert.equal(validateStudioDocumentV2(invalidDate).ok, false)
  assert.equal(validateStudioDocumentV2(unsafeInteger).ok, false)
  assert.equal(validateStudioDocumentV2(unsafeText).ok, false)
  assert.equal(validateStudioDocumentV2(scatterWithStringX).ok, false)
  assert.equal(validateStudioDocumentV2(nonNumericSeries).ok, false)
  assert.equal(validateStudioDocumentV2(duplicateSeries).ok, false)
  assert.equal(validateStudioDocumentV2(mixedUnits).ok, false)
})

test('F1B-1 dependency registry menjaga source, dataset, chart, dan kolom yang masih dirujuk', () => {
  const document = semanticChartDocument()
  document.root.content?.push({
    type: 'datasetReference',
    attrs: {
      id: 'dataset-reference-test',
      schemaVersion: 2,
      datasetId: 'dataset-inflasi',
    },
  })
  assert.equal(validateStudioDocumentV2(document).ok, true)

  assert.deepEqual(
    findStudioEvidenceDependencies(document, { type: 'source', id: 'source-bps' })
      .map((dependency) => dependency.kind),
    ['citation', 'methodology-source', 'dataset-source']
  )
  assert.deepEqual(
    findStudioEvidenceDependencies(document, { type: 'dataset', id: 'dataset-inflasi' })
      .map((dependency) => dependency.kind),
    ['dataset-reference', 'chart-dataset']
  )
  assert.deepEqual(
    findStudioEvidenceDependencies(document, { type: 'chart', id: 'chart-inflasi' })
      .map((dependency) => dependency.kind),
    ['chart-reference']
  )
  assert.deepEqual(
    findStudioEvidenceDependencies(document, {
      type: 'datasetColumn',
      datasetId: 'dataset-inflasi',
      columnKey: 'value',
    }).map((dependency) => dependency.kind),
    ['chart-series-column']
  )
})

test('F1B-1 preflight menjadikan download warning dan mempertahankan production blockers', () => {
  const chartCandidate = f1bPublishCandidate()
  chartCandidate.evidence.datasets[0].downloadUrl = null
  const chartPreflight = preflightStudioArticleV2(
    'Grafik semantik',
    'Ringkasan.',
    chartCandidate
  )

  assert.equal(chartPreflight.ok, false)
  assert.equal(
    chartPreflight.blockers.some((issue) => issue.code === 'future-chartReference'),
    true
  )
  assert.equal(
    chartPreflight.blockers.some((issue) => issue.code === 'dataset-download-missing'),
    false
  )
  assert.equal(
    chartPreflight.warnings.some((issue) => issue.code === 'dataset-download-missing'),
    true
  )

  const datasetCandidate = f1bPublishCandidate()
  const chartReference = datasetCandidate.root.content?.find(
    (node) => node.type === 'chartReference'
  )
  if (chartReference) {
    chartReference.type = 'datasetReference'
    chartReference.attrs = {
      ...chartReference.attrs,
      datasetId: 'dataset-inflasi',
    }
    delete chartReference.attrs.chartId
  }
  const datasetPreflight = preflightStudioArticleV2(
    'Dataset semantik',
    'Ringkasan.',
    datasetCandidate
  )
  assert.equal(
    datasetPreflight.blockers.some((issue) => issue.code === 'future-datasetReference'),
    true
  )
})

test('F1B-1 preflight memblokir source, tabel, metodologi, unit, dan chart yang tidak siap', () => {
  const incomplete = f1bPublishCandidate()
  incomplete.evidence.datasets[0].downloadUrl = null
  incomplete.evidence.datasets[0].sourceIds = []
  incomplete.evidence.datasets[0].rows = []
  incomplete.evidence.datasets[0].methodology = ''
  incomplete.evidence.datasets[0].columns[1].unit = '   '
  incomplete.evidence.sources[0].url = null
  const result = preflightStudioArticleV2('Evidence belum lengkap', 'Ringkasan.', incomplete)

  for (const code of [
    'source-url-missing',
    'dataset-source-missing',
    'dataset-table-missing',
    'dataset-methodology-missing',
    'dataset-unit-missing',
  ]) {
    assert.equal(result.blockers.some((issue) => issue.code === code), true, code)
  }
  assert.equal(result.warnings.some((issue) => issue.code === 'dataset-download-missing'), true)

  const invalidChart = f1bPublishCandidate()
  invalidChart.evidence.charts[0].series[0].columnKey = 'year'
  const chartResult = preflightStudioArticleV2(
    'Chart belum lengkap',
    'Ringkasan.',
    invalidChart
  )
  assert.equal(
    chartResult.blockers.some((issue) => issue.code === 'chart-series-type-unsupported'),
    true
  )
  assert.equal(
    chartResult.blockers.some((issue) => issue.code === 'future-chartReference'),
    true
  )
})

test('callout ketidakpastian hanya menjadi bagian kontrak v2', () => {
  const v2 = createStudioDocumentV2({
    type: 'doc',
    content: [{
      type: 'callout',
      attrs: { tone: 'evidenceLimit' },
      content: [{
        type: 'paragraph',
        content: [{ type: 'text', text: 'Data terbaru belum lengkap.' }],
      }],
    }],
  }, { documentId: 'doc-uncertainty-v2', idFactory: sequentialIds() })
  const v1 = createStudioDocument({
    type: 'doc',
    content: [{
      type: 'callout',
      attrs: { tone: 'evidenceLimit' },
      content: [{
        type: 'paragraph',
        content: [{ type: 'text', text: 'Data terbaru belum lengkap.' }],
      }],
    }],
  }, { documentId: 'doc-uncertainty-v1', idFactory: sequentialIds() })

  assert.equal(validateStudioDocumentV2(v2).ok, true)
  assert.equal(validateStudioDocument(v1).ok, false)
})

test('versi canonical yang belum dikenal tetap ditolak', () => {
  const result = migrateStudioDocumentToV2({
    schemaVersion: 3,
    documentId: 'doc-future-version',
    root: { type: 'doc', content: [] },
  })

  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.issues[0].path, '$.schemaVersion')
})
