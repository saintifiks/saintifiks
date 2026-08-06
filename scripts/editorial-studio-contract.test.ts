import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'
import type { StudioDocument, StudioIdFactory, StudioJsonNode } from '../lib/editorial-studio/document'
import {
  createStudioDocument,
  migrateStudioDocument,
  normalizeStudioRoot,
  studioDocumentsEqual,
  validateStudioDocument,
} from '../lib/editorial-studio/document'
import { editorialStudioFixture } from '../lib/editorial-studio/fixture'
import { markdownToStudioDocument, studioDocumentToMarkdown } from '../lib/editorial-studio/markdown-adapter'
import { preflightStudioArticle } from '../lib/editorial-studio/preflight'
import {
  fingerprintStudioDraft,
  parseStudioDraftRecord,
  parseStudioOutboxRecord,
  parseStudioDraftSnapshot,
  shouldCreateStudioSnapshot,
  snapshotsOutsideRetention,
  type StudioDraftContent,
  type StudioDraftRecord,
  type StudioDraftSnapshot,
  type StudioOutboxRecord,
} from '../lib/editorial-studio/persistence'
import {
  parseStudioSyncRequest,
  parseStudioSyncResponse,
  studioSyncRequestFromOutbox,
} from '../lib/editorial-studio/sync-contract'

function sequentialIds(): StudioIdFactory {
  let counter = 0
  return (nodeType) => `${nodeType}-test-${++counter}`
}

const fixtureContent: StudioDraftContent = {
  title: 'Judul pengujian',
  deck: 'Dek pengujian',
  document: editorialStudioFixture,
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
  const outbox: StudioOutboxRecord = {
    storageVersion: 2,
    documentId: record.documentId,
    title: record.title,
    deck: record.deck,
    document: record.document,
    mutationId: '14c78b10-9e67-4a7a-8de6-94dd53b8e724',
    baseServerRevision: 3,
    localRevision: 4,
    fingerprint: record.fingerprint,
    reason: 'manual',
    createdAt: record.savedAt,
    attemptCount: 0,
    lastAttemptAt: null,
    lastError: null,
  }
  const request = studioSyncRequestFromOutbox(outbox)

  assert.equal(parseStudioSyncRequest(request).ok, true)
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
