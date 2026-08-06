import type { StudioDocument, StudioJsonNode } from './document'
import { validateStudioDocument } from './document'

export type StudioPreflightIssue = {
  severity: 'blocker' | 'warning'
  code: string
  message: string
}

function textContent(node: StudioJsonNode): string {
  return `${node.text ?? ''}${(node.content ?? []).map(textContent).join('')}`
}

function visit(node: StudioJsonNode, callback: (node: StudioJsonNode) => void) {
  callback(node)
  node.content?.forEach((child) => visit(child, callback))
}

export function preflightStudioArticle(title: string, deck: string, document: StudioDocument) {
  const issues: StudioPreflightIssue[] = []
  const validation = validateStudioDocument(document)
  if (!validation.ok) {
    issues.push({ severity: 'blocker', code: 'invalid-document', message: 'Kontrak dokumen belum valid.' })
  }
  if (!title.trim()) issues.push({ severity: 'blocker', code: 'missing-title', message: 'Judul artikel wajib diisi.' })
  if (!document.article?.slug.trim()) issues.push({ severity: 'blocker', code: 'missing-slug', message: 'Slug artikel wajib diisi.' })
  if (document.article?.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(document.article.slug)) {
    issues.push({ severity: 'blocker', code: 'invalid-slug', message: 'Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung.' })
  }
  if (!textContent(document.root).trim()) {
    issues.push({ severity: 'blocker', code: 'empty-body', message: 'Isi artikel belum memiliki teks.' })
  }
  if (!deck.trim()) issues.push({ severity: 'warning', code: 'missing-deck', message: 'Ringkasan kosong; kartu dan hasil pencarian akan kurang informatif.' })

  visit(document.root, (node) => {
    if (node.attrs?.legacyRawHtml === true) {
      issues.push({ severity: 'blocker', code: 'legacy-raw-html', message: 'HTML mentah dari artikel lama harus dikonversi ke blok Studio sebelum diterbitkan.' })
    }
    if (node.type === 'figure') {
      const src = String(node.attrs?.src ?? '')
      const alt = String(node.attrs?.alt ?? '')
      if (!/^https?:\/\//i.test(src)) issues.push({ severity: 'blocker', code: 'figure-source', message: 'Setiap gambar harus selesai diunggah sebelum diterbitkan.' })
      if (!alt.trim() || /belum diisi|gambar artikel/i.test(alt)) issues.push({ severity: 'blocker', code: 'figure-alt', message: 'Setiap gambar informatif memerlukan deskripsi alternatif.' })
    }
    if (node.type === 'footnote' && /catatan kaki baru/i.test(String(node.attrs?.note ?? ''))) {
      issues.push({ severity: 'blocker', code: 'footnote-placeholder', message: 'Catatan kaki placeholder harus dilengkapi.' })
    }
    if (node.type === 'equation' && /^(x\s*=\s*y)?$/i.test(String(node.attrs?.latex ?? '').trim())) {
      issues.push({ severity: 'blocker', code: 'equation-placeholder', message: 'Rumus placeholder harus dilengkapi.' })
    }
    if (['citation', 'chartReference', 'datasetReference'].includes(node.type)) {
      issues.push({ severity: 'blocker', code: `future-${node.type}`, message: `Blok ${node.type} belum memiliki workflow produksi dan tidak boleh diterbitkan.` })
    }
  })

  return {
    issues,
    blockers: issues.filter((issue) => issue.severity === 'blocker'),
    warnings: issues.filter((issue) => issue.severity === 'warning'),
    ok: !issues.some((issue) => issue.severity === 'blocker'),
  }
}
