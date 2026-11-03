// Dokumen Argumen — Argumen ditulis dengan editor Studio yang sama dengan artikel redaksi, jadi isinya disimpan
// sebagai dokumen Studio (kolom opinion_articles.studio_document). Kolom `content` tetap diisi Markdown turunan
// untuk pencarian, waktu baca, validasi panjang terbit, dan tulisan lama yang belum memakai dokumen Studio.
//
// Berkas ini dipakai server (validasi sebelum simpan) dan klien (memuat tulisan ke editor), tanpa dependensi server.

import {
  createStudioDocumentV2,
  migrateStudioDocumentToV2,
  validateStudioDocumentV2,
  type StudioDocumentV2,
} from '../editorial-studio/document'
import { markdownToStudioDocument, studioDocumentToMarkdown } from '../editorial-studio/markdown-adapter'

export const OPINION_MAX_MARKDOWN = 50000
export const OPINION_MAX_DOCUMENT_BYTES = 1_000_000

export type PreparedOpinionDocument =
  | { ok: true; document: StudioDocumentV2; markdown: string }
  | { ok: false; error: string }

// Memeriksa dokumen kiriman penulis. Metadata artikel redaksi (kategori, slug, sampul) bukan milik Argumen
// dan dibuang; batas ukuran dijaga agar satu penulis tidak bisa membebani basis data.
export function prepareOpinionDocument(input: unknown): PreparedOpinionDocument {
  let size = 0
  try {
    size = JSON.stringify(input)?.length ?? 0
  } catch {
    return { ok: false, error: 'Isi tulisan tidak dapat dibaca.' }
  }
  if (size > OPINION_MAX_DOCUMENT_BYTES) return { ok: false, error: 'Tulisan terlalu besar untuk disimpan.' }

  const validated = validateStudioDocumentV2(input)
  if (!validated.ok) return { ok: false, error: 'Isi tulisan tidak lolos pemeriksaan format.' }

  const { article: _article, ...rest } = validated.document
  void _article
  const document: StudioDocumentV2 = rest
  const markdown = studioDocumentToMarkdown(document)
  if (markdown.length > OPINION_MAX_MARKDOWN) {
    return { ok: false, error: `Tulisan maksimal ${OPINION_MAX_MARKDOWN.toLocaleString('id-ID')} karakter.` }
  }
  return { ok: true, document, markdown }
}

type OpinionRow = { id: string; content: string | null; studio_document?: unknown }

// Dokumen untuk editor: dokumen Studio tersimpan bila ada; tulisan lama (Markdown) diimpor ke dokumen Studio.
export function opinionDocumentFor(row: OpinionRow): StudioDocumentV2 {
  const documentId = `doc-opinion-${row.id.replace(/-/g, '')}`
  if (row.studio_document) {
    const stored = migrateStudioDocumentToV2(row.studio_document)
    if (stored.ok) return { ...stored.document, documentId }
  }
  const imported = migrateStudioDocumentToV2(markdownToStudioDocument(row.content ?? '', { documentId }))
  return imported.ok ? imported.document : createStudioDocumentV2(undefined, { documentId })
}

// Dokumen untuk penampil publik: hanya dokumen Studio yang lolos pemeriksaan; selain itu pakai Markdown lama.
export function publishedOpinionDocument(value: unknown): StudioDocumentV2 | null {
  if (!value) return null
  const validated = validateStudioDocumentV2(value)
  return validated.ok ? validated.document : null
}
