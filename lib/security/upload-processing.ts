/**
 * Secure Upload Validation & Processing Pipeline
 */

import crypto from 'node:crypto'
import { ValidationError } from './validation'

export const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export type AllowedMimeType = typeof ALLOWED_IMAGE_MIME_TYPES[number]

export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024 // 5 MiB

const MIME_TO_EXTENSION: Record<AllowedMimeType, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}


export function verifyMagicBytes(buffer: Uint8Array): AllowedMimeType {
  if (buffer.length < 12) {
    throw new ValidationError('Ukuran file terlalu kecil atau rusak.')
  }

  // Check JPEG
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg'
  }

  // Check PNG
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png'
  }

  // Check WEBP (RIFF .... WEBP)
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return 'image/webp'
  }

  throw new ValidationError(
    'Tipe file tidak diizinkan. Hanya file raster JPEG, PNG, dan WebP yang didukung.'
  )
}

export function computeSha256Digest(buffer: Uint8Array): string {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

export function generateSanitizedObjectKey(buffer: Uint8Array, declaredMime: string): {
  sha256: string
  verifiedMime: AllowedMimeType
  objectKey: string
} {
  if (buffer.length > MAX_UPLOAD_SIZE_BYTES) {
    throw new ValidationError(`Ukuran file melebihi batas maksimal ${MAX_UPLOAD_SIZE_BYTES / (1024 * 1024)} MB.`)
  }

  const verifiedMime = verifyMagicBytes(buffer)
  if (declaredMime && declaredMime !== verifiedMime) {
    throw new ValidationError('Header MIME browser tidak cocok dengan signature biner file.')
  }

  const sha256 = computeSha256Digest(buffer)
  const ext = MIME_TO_EXTENSION[verifiedMime]
  const objectKey = `sha256/${sha256.slice(0, 2)}/${sha256}.${ext}`

  return {
    sha256,
    verifiedMime,
    objectKey,
  }
}
