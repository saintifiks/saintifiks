'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowDown, ArrowUp, Eye, Plus, RotateCcw, Save, Send, Trash2 } from 'lucide-react'
import { publishSitePage, restoreSitePageRevision, saveSitePageDraft } from '@/app/(admin)/dashboard/halaman/actions'
import type { SitePageBlock, SitePageContent, SitePageRevisionRow, SitePageSection } from '@/lib/site-pages/types'

type EditorProps = {
  pageId: string
  slug: string
  publicPath: string
  initialContent: SitePageContent
  initialMetaTitle: string
  initialMetaDescription: string
  initialRobotsIndex: boolean
  initialDraftId: string | null
  publishedRevisionId: string | null
  requiredSectionIds: string[]
  history: SitePageRevisionRow[]
}

const inputClass = 'mt-1.5 w-full rounded-lg border border-border-default/25 bg-surface-page px-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-border-accent focus:outline-none focus:ring-2 focus:ring-interactive-primary/15'
const smallButtonClass = 'inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded border border-border-default/20 px-2.5 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-sunken/60 hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary disabled:cursor-not-allowed disabled:opacity-40'

const blockLabels: Record<SitePageBlock['type'], string> = {
  paragraph: 'Paragraf',
  list: 'Daftar',
  link: 'Tautan',
  callout: 'Catatan penting',
  cards: 'Kumpulan kartu',
  steps: 'Langkah berurutan',
  table: 'Tabel',
  definitions: 'Istilah dan penjelasan',
  subsections: 'Subbagian',
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-text-primary">{label}</span>
      {hint && <span className="ml-2 text-[11px] font-normal text-text-tertiary">{hint}</span>}
      {children}
    </label>
  )
}

function newBlock(type: SitePageBlock['type']): SitePageBlock {
  if (type === 'paragraph') return { type, text: '' }
  if (type === 'list') return { type, items: [''] }
  if (type === 'link') return { type, label: '', href: '/' }
  if (type === 'callout') return { type, title: '', body: '', tone: 'info' }
  if (type === 'cards') return { type, items: [{ title: '', body: '' }] }
  if (type === 'steps') return { type, items: [{ title: '', body: '' }] }
  if (type === 'table') return { type, caption: '', columns: ['Kolom 1', 'Kolom 2'], rows: [['', '']] }
  if (type === 'definitions') return { type, items: [{ term: '', description: '' }] }
  return { type: 'subsections', items: [{ title: '', paragraphs: [''] }] }
}

function BlockEditor({
  block,
  index,
  total,
  onChange,
  onRemove,
  onMove,
}: {
  block: SitePageBlock
  index: number
  total: number
  onChange: (block: SitePageBlock) => void
  onRemove: () => void
  onMove: (direction: -1 | 1) => void
}) {
  return (
    <div className="rounded-lg border border-border-default/15 bg-surface-page p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-interactive-primary">{blockLabels[block.type]}</p>
        <div className="flex items-center gap-1">
          <button type="button" className={smallButtonClass} aria-label="Pindahkan blok ke atas" disabled={index === 0} onClick={() => onMove(-1)}><ArrowUp size={14} /></button>
          <button type="button" className={smallButtonClass} aria-label="Pindahkan blok ke bawah" disabled={index === total - 1} onClick={() => onMove(1)}><ArrowDown size={14} /></button>
          <button type="button" className={`${smallButtonClass} text-signal-danger`} onClick={onRemove}><Trash2 size={14} /> Hapus</button>
        </div>
      </div>

      {block.type === 'paragraph' && (
        <div className="space-y-3">
          <Field label="Teks paragraf"><textarea rows={5} className={inputClass} value={block.text} onChange={(event) => onChange({ ...block, text: event.target.value })} /></Field>
          <label className="flex items-center gap-2 text-xs text-text-secondary"><input type="checkbox" checked={Boolean(block.emphasis)} onChange={(event) => onChange({ ...block, emphasis: event.target.checked })} /> Tekankan paragraf ini</label>
        </div>
      )}

      {block.type === 'list' && (
        <Field label="Butir daftar" hint="Satu butir per baris">
          <textarea rows={6} className={inputClass} value={block.items.join('\n')} onChange={(event) => onChange({ ...block, items: event.target.value.split('\n') })} />
        </Field>
      )}

      {block.type === 'link' && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Teks tautan"><input className={inputClass} value={block.label} onChange={(event) => onChange({ ...block, label: event.target.value })} /></Field>
          <Field label="Tujuan" hint="/halaman atau https://..."><input className={inputClass} value={block.href} onChange={(event) => onChange({ ...block, href: event.target.value })} /></Field>
        </div>
      )}

      {block.type === 'callout' && (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Judul opsional"><input className={inputClass} value={block.title ?? ''} onChange={(event) => onChange({ ...block, title: event.target.value })} /></Field>
            <Field label="Nada"><select className={inputClass} value={block.tone ?? 'info'} onChange={(event) => onChange({ ...block, tone: event.target.value as 'info' | 'warning' })}><option value="info">Informasi</option><option value="warning">Peringatan</option></select></Field>
          </div>
          <Field label="Isi catatan"><textarea rows={4} className={inputClass} value={block.body} onChange={(event) => onChange({ ...block, body: event.target.value })} /></Field>
        </div>
      )}

      {block.type === 'cards' && (
        <div className="space-y-4">
          {block.items.map((item, itemIndex) => (
            <div key={itemIndex} className="rounded border border-border-default/15 p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Label opsional"><input className={inputClass} value={item.eyebrow ?? ''} onChange={(event) => { const items = [...block.items]; items[itemIndex] = { ...item, eyebrow: event.target.value }; onChange({ ...block, items }) }} /></Field>
                <Field label="Judul kartu"><input className={inputClass} value={item.title} onChange={(event) => { const items = [...block.items]; items[itemIndex] = { ...item, title: event.target.value }; onChange({ ...block, items }) }} /></Field>
              </div>
              <Field label="Isi kartu"><textarea rows={3} className={inputClass} value={item.body} onChange={(event) => { const items = [...block.items]; items[itemIndex] = { ...item, body: event.target.value }; onChange({ ...block, items }) }} /></Field>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="Tujuan tautan opsional"><input className={inputClass} value={item.href ?? ''} onChange={(event) => { const items = [...block.items]; items[itemIndex] = { ...item, href: event.target.value }; onChange({ ...block, items }) }} /></Field>
                <Field label="Teks tautan"><input className={inputClass} value={item.linkLabel ?? ''} onChange={(event) => { const items = [...block.items]; items[itemIndex] = { ...item, linkLabel: event.target.value }; onChange({ ...block, items }) }} /></Field>
              </div>
              {block.items.length > 1 && <button type="button" className={`${smallButtonClass} mt-3 text-signal-danger`} onClick={() => onChange({ ...block, items: block.items.filter((_, i) => i !== itemIndex) })}>Hapus kartu</button>}
            </div>
          ))}
          <button type="button" className={smallButtonClass} onClick={() => onChange({ ...block, items: [...block.items, { title: '', body: '' }] })}><Plus size={14} /> Tambah kartu</button>
        </div>
      )}

      {block.type === 'steps' && (
        <div className="space-y-4">
          {block.items.map((item, itemIndex) => (
            <div key={itemIndex} className="grid gap-3 rounded border border-border-default/15 p-3 sm:grid-cols-[minmax(0,1fr)_2fr_auto]">
              <Field label={`Judul langkah ${itemIndex + 1}`}><input className={inputClass} value={item.title} onChange={(event) => { const items = [...block.items]; items[itemIndex] = { ...item, title: event.target.value }; onChange({ ...block, items }) }} /></Field>
              <Field label="Penjelasan"><textarea rows={3} className={inputClass} value={item.body} onChange={(event) => { const items = [...block.items]; items[itemIndex] = { ...item, body: event.target.value }; onChange({ ...block, items }) }} /></Field>
              {block.items.length > 1 && <button type="button" aria-label="Hapus langkah" className={`${smallButtonClass} self-end text-signal-danger`} onClick={() => onChange({ ...block, items: block.items.filter((_, i) => i !== itemIndex) })}><Trash2 size={14} /></button>}
            </div>
          ))}
          <button type="button" className={smallButtonClass} onClick={() => onChange({ ...block, items: [...block.items, { title: '', body: '' }] })}><Plus size={14} /> Tambah langkah</button>
        </div>
      )}

      {block.type === 'definitions' && (
        <div className="space-y-4">
          {block.items.map((item, itemIndex) => (
            <div key={itemIndex} className="grid gap-3 rounded border border-border-default/15 p-3 sm:grid-cols-[minmax(0,1fr)_2fr_auto]">
              <Field label="Istilah"><input className={inputClass} value={item.term} onChange={(event) => { const items = [...block.items]; items[itemIndex] = { ...item, term: event.target.value }; onChange({ ...block, items }) }} /></Field>
              <Field label="Penjelasan"><textarea rows={3} className={inputClass} value={item.description} onChange={(event) => { const items = [...block.items]; items[itemIndex] = { ...item, description: event.target.value }; onChange({ ...block, items }) }} /></Field>
              {block.items.length > 1 && <button type="button" aria-label="Hapus istilah" className={`${smallButtonClass} self-end text-signal-danger`} onClick={() => onChange({ ...block, items: block.items.filter((_, i) => i !== itemIndex) })}><Trash2 size={14} /></button>}
            </div>
          ))}
          <button type="button" className={smallButtonClass} onClick={() => onChange({ ...block, items: [...block.items, { term: '', description: '' }] })}><Plus size={14} /> Tambah istilah</button>
        </div>
      )}

      {block.type === 'subsections' && (
        <div className="space-y-4">
          {block.items.map((item, itemIndex) => (
            <div key={itemIndex} className="rounded border border-border-default/15 p-3">
              <Field label="Judul subbagian"><input className={inputClass} value={item.title} onChange={(event) => { const items = [...block.items]; items[itemIndex] = { ...item, title: event.target.value }; onChange({ ...block, items }) }} /></Field>
              <Field label="Paragraf" hint="Satu paragraf per baris"><textarea rows={5} className={inputClass} value={item.paragraphs.join('\n')} onChange={(event) => { const items = [...block.items]; items[itemIndex] = { ...item, paragraphs: event.target.value.split('\n') }; onChange({ ...block, items }) }} /></Field>
              {block.items.length > 1 && <button type="button" className={`${smallButtonClass} mt-3 text-signal-danger`} onClick={() => onChange({ ...block, items: block.items.filter((_, i) => i !== itemIndex) })}>Hapus subbagian</button>}
            </div>
          ))}
          <button type="button" className={smallButtonClass} onClick={() => onChange({ ...block, items: [...block.items, { title: '', paragraphs: [''] }] })}><Plus size={14} /> Tambah subbagian</button>
        </div>
      )}

      {block.type === 'table' && (
        <div className="space-y-3">
          <Field label="Keterangan tabel"><input className={inputClass} value={block.caption} onChange={(event) => onChange({ ...block, caption: event.target.value })} /></Field>
          <Field label="Judul kolom" hint="Pisahkan dengan tanda |"><input className={inputClass} value={block.columns.join(' | ')} onChange={(event) => { const columns = event.target.value.split('|').map((value) => value.trim()); const rows = block.rows.map((row) => columns.map((_, index) => row[index] ?? '')); onChange({ ...block, columns, rows }) }} /></Field>
          <Field label="Isi tabel" hint="Satu baris per baris; pisahkan sel dengan tanda |"><textarea rows={7} className={inputClass} value={block.rows.map((row) => row.join(' | ')).join('\n')} onChange={(event) => { const rows = event.target.value.split('\n').map((row) => { const cells = row.split('|').map((value) => value.trim()); return block.columns.map((_, index) => cells[index] ?? '') }); onChange({ ...block, rows }) }} /></Field>
        </div>
      )}
    </div>
  )
}

export default function SitePageEditor(props: EditorProps) {
  const router = useRouter()
  const [content, setContent] = useState(props.initialContent)
  const [metaTitle, setMetaTitle] = useState(props.initialMetaTitle)
  const [metaDescription, setMetaDescription] = useState(props.initialMetaDescription)
  const [robotsIndex, setRobotsIndex] = useState(props.initialRobotsIndex)
  const [changeSummary, setChangeSummary] = useState('')
  const [draftId, setDraftId] = useState(props.initialDraftId)
  const [dirty, setDirty] = useState(false)
  const [capabilityConfirmed, setCapabilityConfirmed] = useState(false)
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  function changeContent(next: SitePageContent) {
    setContent(next)
    setDirty(true)
    setMessage(null)
  }

  function replaceSection(index: number, next: SitePageSection) {
    const sections = [...content.sections]
    sections[index] = next
    changeContent({ ...content, sections })
  }

  function moveSection(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= content.sections.length) return
    const sections = [...content.sections]
    ;[sections[index], sections[target]] = [sections[target], sections[index]]
    changeContent({ ...content, sections })
  }

  function removeSection(index: number) {
    const section = content.sections[index]
    if (props.requiredSectionIds.includes(section.id)) return
    if (!window.confirm(`Hapus bagian “${section.title}”?`)) return
    changeContent({ ...content, sections: content.sections.filter((_, i) => i !== index) })
  }

  function addSection() {
    let sequence = content.sections.length + 1
    let id = `bagian-baru-${sequence}`
    while (content.sections.some((section) => section.id === id)) id = `bagian-baru-${++sequence}`
    changeContent({ ...content, sections: [...content.sections, { id, navLabel: 'Bagian baru', eyebrow: 'Bagian', title: 'Judul bagian baru', blocks: [{ type: 'paragraph', text: 'Isi bagian baru.' }] }] })
  }

  function saveDraft() {
    startTransition(async () => {
      setMessage(null)
      const result = await saveSitePageDraft({ pageId: props.pageId, slug: props.slug, content, metaTitle, metaDescription, robotsIndex, changeSummary })
      if (!result.success) return setMessage({ tone: 'error', text: result.error })
      setDraftId(result.revisionId ?? null)
      setDirty(false)
      setChangeSummary('')
      setCapabilityConfirmed(false)
      setMessage({ tone: 'success', text: `Draf versi ${result.version} tersimpan. Belum terlihat oleh pembaca.` })
      router.refresh()
    })
  }

  function publishDraft() {
    if (!draftId) return
    startTransition(async () => {
      setMessage(null)
      const result = await publishSitePage({ pageId: props.pageId, slug: props.slug, revisionId: draftId, capabilityConfirmed })
      if (!result.success) return setMessage({ tone: 'error', text: result.error })
      setDraftId(null)
      setCapabilityConfirmed(false)
      setMessage({ tone: 'success', text: 'Halaman berhasil diterbitkan dan cache publik diperbarui.' })
      router.refresh()
    })
  }

  function restoreRevision(revision: SitePageRevisionRow) {
    if (!window.confirm(`Jadikan versi ${revision.version} sebagai draf baru? Perubahan yang belum disimpan akan hilang.`)) return
    startTransition(async () => {
      const result = await restoreSitePageRevision({ pageId: props.pageId, slug: props.slug, revisionId: revision.id })
      if (!result.success) return setMessage({ tone: 'error', text: result.error })
      setMessage({ tone: 'success', text: `Versi ${revision.version} disalin menjadi draf baru.` })
      router.refresh()
    })
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-6">
        {message && <div role="status" className={`rounded-lg border px-4 py-3 text-sm ${message.tone === 'success' ? 'border-signal-success/30 bg-signal-success-surface text-text-primary' : 'border-signal-danger/30 bg-signal-danger-surface text-signal-danger'}`}>{message.text}</div>}

        <section className="rounded-lg border border-border-default/15 bg-surface-elevated p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-text-primary">Identitas halaman</h2>
          <div className="mt-5 space-y-4">
            <Field label="Label kecil"><input className={inputClass} value={content.kicker ?? ''} onChange={(event) => changeContent({ ...content, kicker: event.target.value })} /></Field>
            <Field label="Judul utama"><textarea rows={2} className={inputClass} value={content.title} onChange={(event) => changeContent({ ...content, title: event.target.value })} /></Field>
            <Field label="Pengantar"><textarea rows={4} className={inputClass} value={content.introduction} onChange={(event) => changeContent({ ...content, introduction: event.target.value })} /></Field>
            <Field label="Keterangan dokumen" hint="Opsional, misalnya versi dan tanggal"><input className={inputClass} value={content.documentMeta ?? ''} onChange={(event) => changeContent({ ...content, documentMeta: event.target.value })} /></Field>
          </div>
        </section>

        <section className="rounded-lg border border-border-default/15 bg-surface-elevated p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div><h2 className="font-display text-lg font-bold text-text-primary">Sorotan atas</h2><p className="mt-1 text-xs text-text-tertiary">Fakta singkat atau ringkasan sebelum isi utama.</p></div>
          </div>
          <div className="mt-5 space-y-5">
            {content.facts && (
              <Field label="Fakta singkat" hint="Satu baris: Label | Isi">
                <textarea rows={4} className={inputClass} value={content.facts.map((fact) => `${fact.label} | ${fact.value}`).join('\n')} onChange={(event) => changeContent({ ...content, facts: event.target.value ? event.target.value.split('\n').map((line) => { const [label, ...value] = line.split('|'); return { label: label.trim(), value: value.join('|').trim() } }) : undefined })} />
              </Field>
            )}
            {content.highlights && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-text-primary">Kartu ringkasan</p>
                {content.highlights.map((highlight, index) => (
                  <div key={index} className="rounded border border-border-default/15 p-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Label"><input className={inputClass} value={highlight.label ?? ''} onChange={(event) => { const highlights = [...(content.highlights ?? [])]; highlights[index] = { ...highlight, label: event.target.value }; changeContent({ ...content, highlights }) }} /></Field>
                      <Field label="Judul"><input className={inputClass} value={highlight.title} onChange={(event) => { const highlights = [...(content.highlights ?? [])]; highlights[index] = { ...highlight, title: event.target.value }; changeContent({ ...content, highlights }) }} /></Field>
                    </div>
                    <Field label="Isi"><textarea rows={3} className={inputClass} value={highlight.body} onChange={(event) => { const highlights = [...(content.highlights ?? [])]; highlights[index] = { ...highlight, body: event.target.value }; changeContent({ ...content, highlights }) }} /></Field>
                  </div>
                ))}
              </div>
            )}
            {content.notice && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-text-primary">Pemberitahuan halaman</p>
                <Field label="Judul"><input className={inputClass} value={content.notice.title} onChange={(event) => changeContent({ ...content, notice: { ...content.notice!, title: event.target.value } })} /></Field>
                <Field label="Isi"><textarea rows={3} className={inputClass} value={content.notice.body} onChange={(event) => changeContent({ ...content, notice: { ...content.notice!, body: event.target.value } })} /></Field>
              </div>
            )}
          </div>
        </section>

        <div className="space-y-5">
          {content.sections.map((section, sectionIndex) => {
            const required = props.requiredSectionIds.includes(section.id)
            return (
              <section key={section.id} className="rounded-lg border border-border-default/15 bg-surface-elevated p-5 shadow-xs sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border-default/10 pb-4">
                  <div><p className="font-mono text-[10px] uppercase tracking-widest text-text-tertiary">Bagian {sectionIndex + 1}{required ? ' · Wajib' : ''}</p><h2 className="mt-1 font-display text-lg font-bold text-text-primary">{section.title}</h2></div>
                  <div className="flex gap-1">
                    <button type="button" className={smallButtonClass} disabled={sectionIndex === 0} onClick={() => moveSection(sectionIndex, -1)}><ArrowUp size={14} /><span className="sr-only">Naik</span></button>
                    <button type="button" className={smallButtonClass} disabled={sectionIndex === content.sections.length - 1} onClick={() => moveSection(sectionIndex, 1)}><ArrowDown size={14} /><span className="sr-only">Turun</span></button>
                    <button type="button" className={`${smallButtonClass} text-signal-danger`} disabled={required} title={required ? 'Bagian wajib tidak dapat dihapus' : undefined} onClick={() => removeSection(sectionIndex)}><Trash2 size={14} /> Hapus</button>
                  </div>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Field label="ID bagian" hint={required ? 'Dikunci' : 'untuk tautan langsung'}><input disabled={required} className={inputClass} value={section.id} onChange={(event) => replaceSection(sectionIndex, { ...section, id: event.target.value })} /></Field>
                  <Field label="Label daftar isi"><input className={inputClass} value={section.navLabel ?? ''} onChange={(event) => replaceSection(sectionIndex, { ...section, navLabel: event.target.value })} /></Field>
                  <Field label="Label bagian"><input className={inputClass} value={section.eyebrow ?? ''} onChange={(event) => replaceSection(sectionIndex, { ...section, eyebrow: event.target.value })} /></Field>
                  <Field label="Judul bagian"><input className={inputClass} value={section.title} onChange={(event) => replaceSection(sectionIndex, { ...section, title: event.target.value })} /></Field>
                </div>
                <div className="mt-4"><Field label="Pengantar bagian" hint="Opsional"><textarea rows={3} className={inputClass} value={section.description ?? ''} onChange={(event) => replaceSection(sectionIndex, { ...section, description: event.target.value })} /></Field></div>

                <div className="mt-6 space-y-4">
                  {section.blocks.map((block, blockIndex) => (
                    <BlockEditor
                      key={`${block.type}-${blockIndex}`}
                      block={block}
                      index={blockIndex}
                      total={section.blocks.length}
                      onChange={(nextBlock) => { const blocks = [...section.blocks]; blocks[blockIndex] = nextBlock; replaceSection(sectionIndex, { ...section, blocks }) }}
                      onRemove={() => { if (window.confirm('Hapus blok ini?')) replaceSection(sectionIndex, { ...section, blocks: section.blocks.filter((_, index) => index !== blockIndex) }) }}
                      onMove={(direction) => { const target = blockIndex + direction; const blocks = [...section.blocks]; [blocks[blockIndex], blocks[target]] = [blocks[target], blocks[blockIndex]]; replaceSection(sectionIndex, { ...section, blocks }) }}
                    />
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <select id={`block-type-${sectionIndex}`} className="min-h-[40px] rounded border border-border-default/20 bg-surface-page px-3 text-xs text-text-primary" defaultValue="paragraph">
                    {Object.entries(blockLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                  <button type="button" className={smallButtonClass} onClick={() => { const select = document.getElementById(`block-type-${sectionIndex}`) as HTMLSelectElement; replaceSection(sectionIndex, { ...section, blocks: [...section.blocks, newBlock(select.value as SitePageBlock['type'])] }) }}><Plus size={14} /> Tambah blok</button>
                </div>
              </section>
            )
          })}
        </div>

        <button type="button" className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border-accent/50 bg-signal-info-surface/40 text-sm font-semibold text-text-link hover:bg-signal-info-surface" onClick={addSection}><Plus size={16} /> Tambah bagian</button>

        <section className="rounded-lg border border-border-default/15 bg-surface-elevated p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-text-primary">Catatan kaki</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Label opsional"><input className={inputClass} value={content.footer?.label ?? ''} onChange={(event) => changeContent({ ...content, footer: { label: event.target.value, body: content.footer?.body ?? '' } })} /></Field>
            <Field label="Isi"><input className={inputClass} value={content.footer?.body ?? ''} onChange={(event) => changeContent({ ...content, footer: { label: content.footer?.label, body: event.target.value } })} /></Field>
          </div>
        </section>
      </div>

      <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
        <section className="rounded-lg border border-border-default/15 bg-surface-elevated p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-text-primary">Simpan dan terbitkan</h2>
          <div className="mt-4 space-y-4">
            <Field label="Ringkasan perubahan" hint="Tersimpan di riwayat"><textarea rows={3} className={inputClass} value={changeSummary} onChange={(event) => setChangeSummary(event.target.value)} placeholder="Contoh: memperbarui penjelasan penggunaan AI" /></Field>
            <button type="button" disabled={isPending} onClick={saveDraft} className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-interactive-primary px-4 text-sm font-semibold text-text-on-inverse hover:bg-interactive-primary-hover disabled:cursor-wait disabled:opacity-60"><Save size={16} /> {isPending ? 'Memproses…' : 'Simpan draf'}</button>
            {draftId && !dirty && <Link href={`/dashboard/halaman/${props.slug}/pratinjau`} className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-interactive-primary text-sm font-semibold text-interactive-primary hover:bg-signal-info-surface"><Eye size={16} /> Buka pratinjau</Link>}
          </div>

          <div className="mt-5 border-t border-border-default/15 pt-5">
            <label className="flex items-start gap-3 text-xs leading-5 text-text-secondary">
              <input type="checkbox" className="mt-1" checked={capabilityConfirmed} onChange={(event) => setCapabilityConfirmed(event.target.checked)} />
              <span>Saya sudah memastikan halaman ini tidak menjanjikan formulir, kontak, penghapusan data, keamanan, atau layanan lain yang belum benar-benar tersedia.</span>
            </label>
            <button type="button" disabled={isPending || !draftId || dirty || !capabilityConfirmed} onClick={publishDraft} className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-signal-success px-4 text-sm font-semibold text-text-on-inverse hover:bg-signal-success/90 disabled:cursor-not-allowed disabled:opacity-40"><Send size={16} /> Terbitkan draf</button>
            {dirty && draftId && <p className="mt-2 text-xs leading-5 text-signal-warning">Simpan perubahan terbaru sebelum menerbitkan.</p>}
            {!draftId && <p className="mt-2 text-xs leading-5 text-text-tertiary">Simpan draf terlebih dahulu. Halaman publik tidak berubah saat Anda mengedit.</p>}
          </div>
        </section>

        <section className="rounded-lg border border-border-default/15 bg-surface-elevated p-5">
          <h2 className="font-display text-base font-bold text-text-primary">SEO dan indeks</h2>
          <div className="mt-4 space-y-4">
            <Field label="Judul SEO" hint={`${metaTitle.length}/70`}><input className={inputClass} maxLength={70} value={metaTitle} onChange={(event) => { setMetaTitle(event.target.value); setDirty(true) }} /></Field>
            <Field label="Deskripsi SEO" hint={`${metaDescription.length}/180`}><textarea rows={4} className={inputClass} maxLength={180} value={metaDescription} onChange={(event) => { setMetaDescription(event.target.value); setDirty(true) }} /></Field>
            <label className="flex items-start gap-3 text-xs leading-5 text-text-secondary"><input type="checkbox" className="mt-1" checked={robotsIndex} onChange={(event) => { setRobotsIndex(event.target.checked); setDirty(true) }} /><span>Izinkan mesin pencari mengindeks versi terbit</span></label>
          </div>
        </section>

        <section className="rounded-lg border border-border-default/15 bg-surface-elevated p-5">
          <div className="flex items-center justify-between"><h2 className="font-display text-base font-bold text-text-primary">Riwayat versi</h2><span className="text-xs tabular-nums text-text-tertiary">{props.history.length}</span></div>
          {props.history.length === 0 ? <p className="mt-3 text-xs leading-5 text-text-tertiary">Riwayat muncul setelah draf pertama disimpan.</p> : (
            <ol className="mt-4 divide-y divide-border-default/10">
              {props.history.map((revision) => {
                const published = revision.id === props.publishedRevisionId
                const draft = revision.id === draftId
                return (
                  <li key={revision.id} className="py-3 first:pt-0">
                    <div className="flex items-center justify-between gap-3"><p className="text-xs font-semibold text-text-primary">Versi {revision.version}</p><span className="text-[10px] uppercase tracking-wider text-text-tertiary">{published ? 'Terbit' : draft ? 'Draf' : 'Arsip'}</span></div>
                    <p className="mt-1 text-[11px] leading-4 text-text-secondary">{revision.change_summary || 'Tanpa ringkasan perubahan'}</p>
                    <p className="mt-1 text-[10px] text-text-tertiary">{new Date(revision.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' })}</p>
                    {!draft && <button type="button" disabled={isPending} className={`${smallButtonClass} mt-2`} onClick={() => restoreRevision(revision)}><RotateCcw size={13} /> Jadikan draf</button>}
                  </li>
                )
              })}
            </ol>
          )}
        </section>

        <Link href={props.publicPath} target="_blank" className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-border-default/20 text-sm font-semibold text-text-secondary hover:bg-surface-sunken/50"><Eye size={16} /> Lihat versi publik</Link>
      </aside>
    </div>
  )
}
