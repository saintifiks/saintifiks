/**
 * Cryptographic Digest Generator for Publication Manifests
 */

import crypto from 'node:crypto'
import { PublicationManifestData, serializeCanonicalManifest } from './canonical-manifest'

export function computeManifestDigest(manifestData: PublicationManifestData): string {
  const canonicalBytes = Buffer.from(serializeCanonicalManifest(manifestData), 'utf8')
  return crypto.createHash('sha256').update(canonicalBytes).digest('hex')
}
