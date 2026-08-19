/**
 * Publication Manifest Verification Helper
 */

import { PublicationManifestData } from './canonical-manifest'
import { computeManifestDigest } from './digest'

export function verifyManifestDigest(
  manifestData: PublicationManifestData,
  expectedDigest: string
): boolean {
  const computed = computeManifestDigest(manifestData)
  return computed.toLowerCase() === expectedDigest.toLowerCase().trim()
}
