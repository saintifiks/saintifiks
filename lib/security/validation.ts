/**
 * Deterministic Input Validation & Sanitization Engine
 * Zero-dependency, pure functions for request and action payload verification.
 */

export class ValidationError extends Error {
  public readonly field?: string

  constructor(message: string, field?: string) {
    super(message)
    this.name = 'ValidationError'
    this.field = field
  }
}

export function assertPlainObject(value: unknown, fieldName = 'Payload'): asserts value is Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new ValidationError(`${fieldName} harus berupa object valid.`, fieldName)
  }
}

export function assertExactKeys(
  obj: Record<string, unknown>,
  allowedKeys: readonly string[],
  contextName = 'Payload'
): void {
  const allowedSet = new Set(allowedKeys)
  for (const key of Object.keys(obj)) {
    if (!allowedSet.has(key)) {
      throw new ValidationError(`Field '${key}' tidak diizinkan pada ${contextName}.`, key)
    }
  }
}

export function requiredString(
  value: unknown,
  fieldName: string,
  options: { min?: number; max?: number } = {}
): string {
  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} wajib diisi sebagai teks.`, fieldName)
  }
  const trimmed = value.trim()
  const min = options.min ?? 1
  if (trimmed.length < min) {
    throw new ValidationError(`${fieldName} tidak boleh kosong (minimal ${min} karakter).`, fieldName)
  }
  if (options.max !== undefined && trimmed.length > options.max) {
    throw new ValidationError(`${fieldName} maksimal ${options.max} karakter.`, fieldName)
  }
  return trimmed
}

export function optionalString(
  value: unknown,
  fieldName: string,
  options: { max?: number } = {}
): string | null {
  if (value === undefined || value === null || value === '') {
    return null
  }
  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} harus berupa teks.`, fieldName)
  }
  const trimmed = value.trim()
  if (trimmed.length === 0) {
    return null
  }
  if (options.max !== undefined && trimmed.length > options.max) {
    throw new ValidationError(`${fieldName} maksimal ${options.max} karakter.`, fieldName)
  }
  return trimmed
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function validateUUID(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || !UUID_REGEX.test(value.trim())) {
    throw new ValidationError(`${fieldName} harus berupa UUID yang valid.`, fieldName)
  }
  return value.trim().toLowerCase()
}

export function optionalUUID(value: unknown, fieldName: string): string | null {
  if (value === undefined || value === null || value === '') return null
  return validateUUID(value, fieldName)
}

export function validateEnum<T extends string>(
  value: unknown,
  allowedValues: readonly T[],
  fieldName: string
): T {
  if (typeof value !== 'string' || !allowedValues.includes(value as T)) {
    throw new ValidationError(
      `${fieldName} harus salah satu dari: ${allowedValues.join(', ')}.`,
      fieldName
    )
  }
  return value as T
}

export function validateNonNegativeNumber(value: unknown, fieldName: string): number {
  const num = Number(value)
  if (typeof value !== 'number' && typeof value !== 'string') {
    throw new ValidationError(`${fieldName} harus berupa angka.`, fieldName)
  }
  if (!Number.isFinite(num) || num < 0) {
    throw new ValidationError(`${fieldName} harus berupa angka >= 0.`, fieldName)
  }
  return num
}

export function validateNonNegativeInteger(value: unknown, fieldName: string): number {
  const num = validateNonNegativeNumber(value, fieldName)
  if (!Number.isInteger(num)) {
    throw new ValidationError(`${fieldName} harus berupa bilangan bulat >= 0.`, fieldName)
  }
  return num
}

export function validateHttpsUrl(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} harus berupa URL teks.`, fieldName)
  }
  const trimmed = value.trim()
  try {
    const url = new URL(trimmed)
    if (url.protocol !== 'https:') {
      throw new ValidationError(`${fieldName} harus menggunakan protokol HTTPS.`, fieldName)
    }
    return url.toString()
  } catch {
    throw new ValidationError(`${fieldName} bukan format URL yang valid.`, fieldName)
  }
}

export function optionalHttpsUrl(value: unknown, fieldName: string): string | null {
  if (value === undefined || value === null || value === '') return null
  return validateHttpsUrl(value, fieldName)
}

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function validateSlug(value: unknown, fieldName: string, max = 150): string {
  const str = requiredString(value, fieldName, { min: 1, max })
  if (!SLUG_REGEX.test(str)) {
    throw new ValidationError(
      `${fieldName} hanya boleh berisi huruf kecil (a-z), angka (0-9), dan tanda hubung (-).`,
      fieldName
    )
  }
  return str
}
