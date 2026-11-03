import assert from 'node:assert/strict'
import test from 'node:test'
import { createStudioDocumentV2, type StudioJsonNode } from '../lib/editorial-studio/document'
import {
  OPINION_MAX_MARKDOWN,
  opinionDocumentFor,
  prepareOpinionDocument,
  publishedOpinionDocument,
} from '../lib/opinions/studio-document'

function docWith(...content: StudioJsonNode[]) {
  return createStudioDocumentV2({ type: 'doc', content }, { documentId: 'doc-opinion-uji' })
}

const paragraph = (text: string, marks?: StudioJsonNode['marks']): StudioJsonNode => ({
  type: 'paragraph',
  content: [{ type: 'text', text, ...(marks ? { marks } : {}) }],
})

test('dokumen Argumen yang sah diterima dan menghasilkan Markdown turunan', () => {
  const result = prepareOpinionDocument(docWith(paragraph('Debat soal makan siang gratis sering berhenti di angka anggaran.')))
  assert.equal(result.ok, true)
  if (result.ok) assert.match(result.markdown, /makan siang gratis/)
})

test('metadata artikel redaksi dibuang dari tulisan Argumen', () => {
  const document = {
    ...docWith(paragraph('Isi tulisan.')),
    article: { kind: 'article', articleId: null, slug: 'dicuri', coverImageUrl: null, category: 'x', kicker: '', coverIllustrator: '', country: '' },
  }
  const result = prepareOpinionDocument(document)
  assert.equal(result.ok, true)
  if (result.ok) assert.equal('article' in result.document, false)
})

test('tautan berprotokol berbahaya ditolak', () => {
  const result = prepareOpinionDocument(
    docWith(paragraph('klik', [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }]))
  )
  assert.equal(result.ok, false)
})

test('masukan yang bukan dokumen ditolak', () => {
  assert.equal(prepareOpinionDocument(null).ok, false)
  assert.equal(prepareOpinionDocument('teks').ok, false)
  assert.equal(prepareOpinionDocument({ schemaVersion: 2 }).ok, false)
})

test('tulisan di atas batas karakter ditolak', () => {
  const long = 'a'.repeat(OPINION_MAX_MARKDOWN + 1)
  const result = prepareOpinionDocument(docWith(paragraph(long)))
  assert.equal(result.ok, false)
})

test('tulisan lama (Markdown) diimpor ke dokumen Studio dengan id tetap', () => {
  const document = opinionDocumentFor({
    id: '11111111-2222-3333-4444-555555555555',
    content: '## Sasaran yang bergeser\n\nStunting terbentuk sebelum anak masuk sekolah.',
  })
  assert.equal(document.documentId, 'doc-opinion-11111111222233334444555555555555')
  assert.equal(document.root.content?.[0]?.type, 'heading')
})

test('dokumen Studio tersimpan dipakai bila ada', () => {
  const stored = docWith(paragraph('Dari dokumen Studio.'))
  const document = opinionDocumentFor({ id: 'aaaa', content: 'isi lama', studio_document: stored })
  assert.equal(document.root.content?.[0]?.content?.[0]?.text, 'Dari dokumen Studio.')
})

test('penampil publik hanya menerima dokumen yang lolos pemeriksaan', () => {
  assert.equal(publishedOpinionDocument(null), null)
  assert.equal(publishedOpinionDocument({ schemaVersion: 2 }), null)
  assert.notEqual(publishedOpinionDocument(docWith(paragraph('ok'))), null)
})
