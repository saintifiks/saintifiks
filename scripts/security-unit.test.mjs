import test from 'node:test'
import assert from 'node:assert/strict'
import { sanitizePostLoginDestination } from '../lib/security/post-login-destination.ts'
import {
  requiredString,
  optionalString,
  validateUUID,
  validateEnum,
  validateNonNegativeNumber,
  validateNonNegativeInteger,
  validateHttpsUrl,
  ValidationError,
} from '../lib/security/validation.ts'
import { validateMutationRequestIntegrity } from '../lib/security/request-integrity.ts'

test('Validation Unit: requiredString & optionalString enforce bounds', () => {
  assert.equal(requiredString('  hello  ', 'test', { min: 2, max: 10 }), 'hello')
  assert.throws(() => requiredString('', 'test'), ValidationError)
  assert.throws(() => requiredString('abcdef', 'test', { max: 4 }), ValidationError)
  assert.equal(optionalString(undefined, 'test'), null)
  assert.equal(optionalString('  trimmed  ', 'test'), 'trimmed')
})

test('Validation Unit: validateUUID correctly accepts standard UUIDs and rejects malformed', () => {
  const validUUID = 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d'
  assert.equal(validateUUID(validUUID, 'id'), validUUID)
  assert.throws(() => validateUUID('not-a-uuid', 'id'), ValidationError)
  assert.throws(() => validateUUID('12345', 'id'), ValidationError)
  assert.throws(() => validateUUID(null, 'id'), ValidationError)
})

test('Validation Unit: validateNonNegativeNumber & Integer reject negative and infinite', () => {
  assert.equal(validateNonNegativeNumber(100, 'num'), 100)
  assert.equal(validateNonNegativeNumber('0', 'num'), 0)
  assert.throws(() => validateNonNegativeNumber(-5, 'num'), ValidationError)
  assert.throws(() => validateNonNegativeNumber(Infinity, 'num'), ValidationError)
  assert.throws(() => validateNonNegativeInteger(12.34, 'int'), ValidationError)
})

test('Validation Unit: validateHttpsUrl enforces https scheme', () => {
  assert.equal(
    validateHttpsUrl('https://example.com/image.png', 'url'),
    'https://example.com/image.png'
  )
  assert.throws(() => validateHttpsUrl('http://insecure.com', 'url'), ValidationError)
  assert.throws(() => validateHttpsUrl('javascript:alert(1)', 'url'), ValidationError)
})

test('OAuth Redirection: sanitizePostLoginDestination protects against open redirect', () => {
  // Allowed safe destinations
  assert.equal(sanitizePostLoginDestination('/'), '/')
  assert.equal(sanitizePostLoginDestination('/dashboard'), '/dashboard')
  assert.equal(sanitizePostLoginDestination('/akun'), '/akun')
  assert.equal(sanitizePostLoginDestination('/koreksi'), '/koreksi')
  assert.equal(sanitizePostLoginDestination('/artikel/sains-modern'), '/artikel/sains-modern')

  // Malicious / open redirect attacks
  assert.equal(sanitizePostLoginDestination('https://attacker.com'), '/')
  assert.equal(sanitizePostLoginDestination('//attacker.com'), '/')
  assert.equal(sanitizePostLoginDestination('/\\attacker.com'), '/')
  assert.equal(sanitizePostLoginDestination('/%2f%2fattacker.com'), '/')
  assert.equal(sanitizePostLoginDestination('javascript:alert(1)'), '/')
  assert.equal(sanitizePostLoginDestination('/unknown-secret-route-xyz'), '/')
  assert.equal(sanitizePostLoginDestination(null), '/')
})

test('Request Integrity: validateMutationRequestIntegrity blocks cross-site attacks', () => {
  // Same origin with HTTPS
  const validHeaders = new Headers({
    origin: 'https://saintifiks.id',
    'sec-fetch-site': 'same-origin',
  })
  const result1 = validateMutationRequestIntegrity(validHeaders)
  assert.equal(result1.allowed, true)

  // Cross-site Fetch Metadata
  const crossSiteHeaders = new Headers({
    origin: 'https://saintifiks.id',
    'sec-fetch-site': 'cross-site',
  })
  const result2 = validateMutationRequestIntegrity(crossSiteHeaders)
  assert.equal(result2.allowed, false)
  assert.equal(result2.reasonCode, 'CROSS_SITE_FETCH_METADATA')

  // Untrusted Origin
  const untrustedHeaders = new Headers({
    origin: 'https://evil-attacker.com',
    'sec-fetch-site': 'same-site',
  })
  const result3 = validateMutationRequestIntegrity(untrustedHeaders)
  assert.equal(result3.allowed, false)
  assert.equal(result3.reasonCode, 'UNTRUSTED_ORIGIN')

  // Subdomain / Suffix spoofing
  const spoofHeaders = new Headers({
    origin: 'https://saintifiks.id.attacker.com',
    'sec-fetch-site': 'same-site',
  })
  const result4 = validateMutationRequestIntegrity(spoofHeaders)
  assert.equal(result4.allowed, false)
})
