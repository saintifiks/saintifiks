import { getSitePageDefinition } from './registry'
import type { SitePageBlock, SitePageContent } from './types'

const MAX_TEXT_LENGTH = 20_000
const MAX_SECTIONS = 40
const MAX_BLOCKS = 80

function cleanText(value: unknown, field: string, required = true) {
  if (typeof value !== 'string') throw new Error(`${field} harus berupa teks.`)
  const cleaned = value.trim()
  if (required && !cleaned) throw new Error(`${field} tidak boleh kosong.`)
  if (cleaned.length > MAX_TEXT_LENGTH) throw new Error(`${field} terlalu panjang.`)
  return cleaned
}

function cleanHref(value: unknown) {
  const href = cleanText(value, 'Tautan')
  if (!href.startsWith('/') && !href.startsWith('https://') && !href.startsWith('mailto:')) {
    throw new Error('Tautan harus diawali /, https://, atau mailto:.')
  }
  return href
}

function cleanBlock(block: SitePageBlock, index: number): SitePageBlock {
  if (!block || typeof block !== 'object' || typeof block.type !== 'string') {
    throw new Error(`Blok ${index + 1} tidak valid.`)
  }

  switch (block.type) {
    case 'paragraph':
      return {
        type: 'paragraph',
        text: cleanText(block.text, `Paragraf ${index + 1}`),
        emphasis: Boolean(block.emphasis),
      }
    case 'list':
      if (!Array.isArray(block.items) || block.items.length === 0) {
        throw new Error(`Daftar ${index + 1} harus memiliki setidaknya satu butir.`)
      }
      return { type: 'list', items: block.items.map((item, itemIndex) => cleanText(item, `Butir ${itemIndex + 1}`)) }
    case 'link':
      return { type: 'link', label: cleanText(block.label, 'Label tautan'), href: cleanHref(block.href) }
    case 'callout':
      return {
        type: 'callout',
        title: block.title ? cleanText(block.title, 'Judul catatan') : undefined,
        body: cleanText(block.body, 'Isi catatan'),
        tone: block.tone === 'warning' ? 'warning' : 'info',
      }
    case 'cards':
      if (!Array.isArray(block.items) || block.items.length === 0) throw new Error('Kartu tidak boleh kosong.')
      return {
        type: 'cards',
        items: block.items.map((item) => ({
          eyebrow: item.eyebrow ? cleanText(item.eyebrow, 'Label kartu') : undefined,
          title: cleanText(item.title, 'Judul kartu'),
          body: cleanText(item.body, 'Isi kartu'),
          href: item.href ? cleanHref(item.href) : undefined,
          linkLabel: item.href ? cleanText(item.linkLabel, 'Label tautan kartu') : undefined,
        })),
      }
    case 'steps':
      if (!Array.isArray(block.items) || block.items.length === 0) throw new Error('Langkah tidak boleh kosong.')
      return {
        type: 'steps',
        items: block.items.map((item) => ({
          title: cleanText(item.title, 'Judul langkah'),
          body: cleanText(item.body, 'Isi langkah'),
        })),
      }
    case 'table': {
      if (!Array.isArray(block.columns) || block.columns.length === 0) throw new Error('Tabel harus memiliki kolom.')
      const columns = block.columns.map((column) => cleanText(column, 'Judul kolom'))
      if (!Array.isArray(block.rows)) throw new Error('Baris tabel tidak valid.')
      return {
        type: 'table',
        caption: cleanText(block.caption, 'Keterangan tabel'),
        columns,
        rows: block.rows.map((row) => {
          if (!Array.isArray(row) || row.length !== columns.length) throw new Error('Jumlah sel tabel harus sama dengan jumlah kolom.')
          return row.map((cell) => cleanText(cell, 'Isi sel'))
        }),
      }
    }
    case 'definitions':
      if (!Array.isArray(block.items) || block.items.length === 0) throw new Error('Daftar definisi tidak boleh kosong.')
      return {
        type: 'definitions',
        items: block.items.map((item) => ({
          term: cleanText(item.term, 'Istilah'),
          description: cleanText(item.description, 'Penjelasan istilah'),
        })),
      }
    case 'subsections':
      if (!Array.isArray(block.items) || block.items.length === 0) throw new Error('Subbagian tidak boleh kosong.')
      return {
        type: 'subsections',
        items: block.items.map((item) => ({
          title: cleanText(item.title, 'Judul subbagian'),
          paragraphs: item.paragraphs.map((paragraph) => cleanText(paragraph, 'Paragraf subbagian')),
        })),
      }
    default:
      throw new Error('Jenis blok tidak dikenali.')
  }
}

export function validateSitePageContent(slug: string, input: unknown): SitePageContent {
  const definition = getSitePageDefinition(slug)
  if (!definition) throw new Error('Halaman tidak terdaftar.')
  if (!input || typeof input !== 'object') throw new Error('Isi halaman tidak valid.')

  const content = input as SitePageContent
  if (content.schemaVersion !== 1) throw new Error('Versi struktur konten tidak didukung.')
  if (!Array.isArray(content.sections) || content.sections.length > MAX_SECTIONS) {
    throw new Error(`Halaman hanya boleh memiliki maksimal ${MAX_SECTIONS} bagian.`)
  }

  const sections = content.sections.map((section, sectionIndex) => {
    const id = cleanText(section.id, `ID bagian ${sectionIndex + 1}`).toLowerCase()
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
      throw new Error(`ID bagian “${id}” hanya boleh berisi huruf kecil, angka, dan tanda hubung.`)
    }
    if (!Array.isArray(section.blocks) || section.blocks.length > MAX_BLOCKS) {
      throw new Error(`Bagian ${sectionIndex + 1} memiliki terlalu banyak blok.`)
    }
    return {
      id,
      navLabel: section.navLabel ? cleanText(section.navLabel, 'Label navigasi') : undefined,
      eyebrow: section.eyebrow ? cleanText(section.eyebrow, 'Label bagian') : undefined,
      title: cleanText(section.title, `Judul bagian ${sectionIndex + 1}`),
      description: section.description ? cleanText(section.description, 'Pengantar bagian') : undefined,
      blocks: section.blocks.map(cleanBlock),
    }
  })

  const ids = sections.map((section) => section.id)
  if (new Set(ids).size !== ids.length) throw new Error('Setiap bagian harus mempunyai ID unik.')
  const missing = definition.requiredSectionIds.filter((id) => !ids.includes(id))
  if (missing.length) throw new Error(`Bagian wajib tidak boleh dihapus: ${missing.join(', ')}.`)
  const emptyRequired = sections.filter((section) => definition.requiredSectionIds.includes(section.id) && section.blocks.length === 0)
  if (emptyRequired.length) throw new Error(`Bagian wajib tidak boleh kosong: ${emptyRequired.map((section) => section.title).join(', ')}.`)

  return {
    schemaVersion: 1,
    kicker: content.kicker ? cleanText(content.kicker, 'Label halaman') : undefined,
    title: cleanText(content.title, 'Judul halaman'),
    introduction: cleanText(content.introduction, 'Pengantar halaman'),
    documentMeta: content.documentMeta ? cleanText(content.documentMeta, 'Metadata dokumen') : undefined,
    notice: content.notice
      ? {
          title: cleanText(content.notice.title, 'Judul pemberitahuan'),
          body: cleanText(content.notice.body, 'Isi pemberitahuan'),
          tone: content.notice.tone === 'warning' ? 'warning' : 'info',
        }
      : undefined,
    facts: content.facts?.map((fact) => ({
      label: cleanText(fact.label, 'Label fakta'),
      value: cleanText(fact.value, 'Isi fakta'),
    })),
    highlights: content.highlights?.map((highlight) => ({
      label: highlight.label ? cleanText(highlight.label, 'Label sorotan') : undefined,
      title: cleanText(highlight.title, 'Judul sorotan'),
      body: cleanText(highlight.body, 'Isi sorotan'),
    })),
    sections,
    footer: content.footer
      ? {
          label: content.footer.label ? cleanText(content.footer.label, 'Label catatan kaki') : undefined,
          body: cleanText(content.footer.body, 'Isi catatan kaki'),
        }
      : undefined,
  }
}
