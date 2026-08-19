/**
 * Deterministic Editorial Publication Manifest
 * Canonical JSON serialization for cryptographic integrity and tamper detection.
 */

export interface PublicationManifestData {
  schemaVersion: '1.0.0'
  documentId: string
  revisionId: string
  revisionNumber: number
  articleId: string
  slug: string
  title: string
  deck: string | null
  contentFingerprint: string
  publishedAt: string
  previousPublicationDigest: string | null
}

/**
 * Serializes a publication manifest to a deterministic canonical JSON string.
 * Keys are strictly ordered, values are strictly normalized, whitespace is deterministic.
 */
export function serializeCanonicalManifest(data: PublicationManifestData): string {
  // Validate required fields
  if (data.schemaVersion !== '1.0.0') {
    throw new Error(`Unsupported manifest schema version: ${data.schemaVersion}`)
  }
  if (!data.documentId || !data.revisionId || !data.articleId || !data.slug || !data.title) {
    throw new Error('Manifest is missing mandatory fields.')
  }
  if (typeof data.revisionNumber !== 'number' || !Number.isInteger(data.revisionNumber) || data.revisionNumber < 1) {
    throw new Error('Manifest revisionNumber must be a positive integer.')
  }

  // Canonical key ordering
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
