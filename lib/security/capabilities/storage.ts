/**
 * Storage Capability Module
 * Confines server-side privileged storage operations.
 */

import { createAdminClient } from '@/lib/supabase/admin'

export async function uploadToStorageBucket(
  bucketName: string,
  filePath: string,
  fileBody: Buffer | Uint8Array | Blob | string,
  options: { contentType?: string; upsert?: boolean } = {}
) {
  const admin = createAdminClient()
  return admin.storage.from(bucketName).upload(filePath, fileBody, {
    contentType: options.contentType,
    upsert: options.upsert ?? false,
  })
}

export function getPublicStorageUrl(bucketName: string, filePath: string) {
  const admin = createAdminClient()
  return admin.storage.from(bucketName).getPublicUrl(filePath)
}
