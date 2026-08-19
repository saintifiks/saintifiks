import test from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'

// Direct deterministic manifest logic for test validation
function serializeCanonicalManifest(data) {
  if (data.schemaVersion !== '1.0.0') {
    throw new Error(`Unsupported manifest schema version: ${data.schemaVersion}`)
  }
  if (!data.documentId || !data.revisionId || !data.articleId || !data.slug || !data.title) {
    throw new Error('Manifest is missing mandatory fields.')
  }
  if (typeof data.revisionNumber !== 'number' || !Number.isInteger(data.revisionNumber) || data.revisionNumber < 1) {
    throw new Error('Manifest revisionNumber must be a positive integer.')
  }

  const canonicalObject = {
    schemaVersion: data.schemaVersion,
    documentId: data.documentId.trim(),
    revisionId: data.revisionId.trim(),
    revisionNumber: data.revisionNumber,
    articleId: data.articleId.trim(),
    slug: data.slug.trim(),
    title: data.title.trim(),
    deck: data.deck ? data.deck.trim() : null,
    contentFingerprint: data.contentFingerprint.trim(),
    publishedAt: data.publishedAt.trim(),
    previousPublicationDigest: data.previousPublicationDigest ? data.previousPublicationDigest.trim() : null,
  }

  return JSON.stringify(canonicalObject)
}

function computeManifestDigest(manifestData) {
  const canonicalBytes = Buffer.from(serializeCanonicalManifest(manifestData), 'utf8')
  return crypto.createHash('sha256').update(canonicalBytes).digest('hex')
}

function verifyManifestDigest(manifestData, expectedDigest) {
  const computed = computeManifestDigest(manifestData)
  return computed.toLowerCase() === expectedDigest.toLowerCase().trim()
}

const FIXED_SAMPLE_MANIFEST = {
  schemaVersion: '1.0.0',
  documentId: 'doc-001',
  revisionId: 'rev-101',
  revisionNumber: 3,
  articleId: 'art-555',
  slug: 'uji-coba-integritas',
  title: 'Uji Coba Integritas Publikasi',
  deck: 'Sebuah artikel pembuktian integritas cryptographic hashing.',
  contentFingerprint: 'fp-998877665544332211',
  publishedAt: '2026-08-19T10:00:00.000Z',
  previousPublicationDigest: 'a1b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef',
}

test('Editorial Integrity 1: Canonical manifest serialization is deterministic', () => {
  const serialized1 = serializeCanonicalManifest(FIXED_SAMPLE_MANIFEST)
  const serialized2 = serializeCanonicalManifest({ ...FIXED_SAMPLE_MANIFEST })
  assert.equal(serialized1, serialized2)
  assert.ok(serialized1.startsWith('{"schemaVersion":"1.0.0"'))
})

test('Editorial Integrity 2: Digest computation produces stable SHA-256 hash', () => {
  const digest1 = computeManifestDigest(FIXED_SAMPLE_MANIFEST)
  const digest2 = computeManifestDigest(FIXED_SAMPLE_MANIFEST)
  assert.equal(digest1, digest2)
  assert.match(digest1, /^[0-9a-f]{64}$/)
})

test('Editorial Integrity 3: Any alteration to content triggers verification failure', () => {
  const validDigest = computeManifestDigest(FIXED_SAMPLE_MANIFEST)
  assert.ok(verifyManifestDigest(FIXED_SAMPLE_MANIFEST, validDigest))

  // Mutate title
  const tamperedManifest = {
    ...FIXED_SAMPLE_MANIFEST,
    title: 'Uji Coba Integritas Publikasi (TAMPERED)',
  }
  assert.ok(!verifyManifestDigest(tamperedManifest, validDigest), 'Tampered manifest must fail verification')
})

test('Editorial Integrity 4: Missing mandatory fields throw ValidationError', () => {
  assert.throws(() => {
    serializeCanonicalManifest({
      ...FIXED_SAMPLE_MANIFEST,
      title: '',
    })
  }, /missing mandatory fields/i)
})
