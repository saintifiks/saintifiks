'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ExternalLink, FileSearch, Pencil, Plus, Trash2, X } from 'lucide-react'
import {
  STUDIO_EVIDENCE_LIMITS,
  createStudioId,
  type StudioDocumentV2,
  type StudioJsonNode,
  type StudioSourceEvidence,
} from '@/lib/editorial-studio/document'

type StudioSourceRegistryProps = {
  document: StudioDocumentV2
  onChange: (sources: StudioSourceEvidence[]) => void
}

type SourceForm = {
  title: string
  publisher: string
  authors: string
  url: string
  publishedDate: string
  accessedDate: string
  note: string
}

const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary'
const fieldClass = `mt-2 min-h-[44px] w-full rounded-lg border border-border-default/25 bg-surface-page px-3 py-2.5 font-interface text-sm text-text-primary placeholder:text-text-tertiary ${focusRing}`

function emptyForm(): SourceForm {
  return {
    title: '',
    publisher: '',
    authors: '',
    url: '',
    publishedDate: '',
    accessedDate: '',
    note: '',
  }
}

function sourceToForm(source: StudioSourceEvidence): SourceForm {
  return {
    title: source.title,
    publisher: source.publisher,
    authors: source.authors.join('; '),
    url: source.url ?? '',
    publishedDate: source.publishedDate ?? '',
    accessedDate: source.accessedDate ?? '',
    note: source.note,
  }
}

function sourceReferenceCounts(document: StudioDocumentV2) {
  const counts = new Map<string, number>()
  const addReference = (sourceId: string) => {
    counts.set(sourceId, (counts.get(sourceId) ?? 0) + 1)
  }
  function visit(node: StudioJsonNode) {
    if (node.type === 'citation' && typeof node.attrs?.sourceId === 'string') {
      addReference(node.attrs.sourceId)
    }
    node.content?.forEach(visit)
  }
  visit(document.root)
  document.evidence.methodology?.sourceIds.forEach(addReference)
  document.evidence.datasets.forEach((dataset) => {
    dataset.sourceIds.forEach(addReference)
  })
  return counts
}

function sourceHost(url: string | null) {
  if (!url) return 'URL belum diisi'
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export default function StudioSourceRegistry({
  document,
  onChange,
}: StudioSourceRegistryProps) {
  const sources = document.evidence.sources
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<SourceForm>(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const dialogRef = useRef<HTMLFormElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const counts = useMemo(() => sourceReferenceCounts(document), [document])

  useEffect(() => {
    if (!dialogOpen) return
    const restoreFocusTo = globalThis.document.activeElement instanceof HTMLElement
      ? globalThis.document.activeElement
      : null
    const previousOverflow = globalThis.document.body.style.overflow
    globalThis.document.body.style.overflow = 'hidden'
    window.setTimeout(() => titleInputRef.current?.focus(), 0)

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setDialogOpen(false)
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && globalThis.document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && globalThis.document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
    globalThis.document.addEventListener('keydown', handleKeyDown)
    return () => {
      globalThis.document.removeEventListener('keydown', handleKeyDown)
      globalThis.document.body.style.overflow = previousOverflow
      restoreFocusTo?.focus()
    }
  }, [dialogOpen])

  function openNewSource() {
    setEditingId(null)
    setForm(emptyForm())
    setError(null)
    setPendingDeleteId(null)
    setDialogOpen(true)
  }

  function openEditSource(source: StudioSourceEvidence) {
    setEditingId(source.id)
    setForm(sourceToForm(source))
    setError(null)
    setPendingDeleteId(null)
    setDialogOpen(true)
  }

  function updateForm<K extends keyof SourceForm>(key: K, value: SourceForm[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setError(null)
  }

  function saveSource() {
    const title = form.title.trim()
    if (!title) {
      setError('Judul sumber wajib diisi.')
      return
    }

    let normalizedUrl: string
    try {
      const parsed = new URL(form.url.trim())
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('protocol')
      normalizedUrl = parsed.toString()
    } catch {
      setError('Gunakan URL sumber lengkap yang diawali http:// atau https://.')
      return
    }

    const authors = form.authors
      .split(/[;\n]+/)
      .map((author) => author.trim())
      .filter(Boolean)
    if (authors.length > STUDIO_EVIDENCE_LIMITS.authorsPerSource || authors.some((author) => author.length > 160)) {
      setError(`Gunakan maksimal ${STUDIO_EVIDENCE_LIMITS.authorsPerSource} penulis; setiap nama maksimal 160 karakter.`)
      return
    }
    const source: StudioSourceEvidence = {
      id: editingId ?? createStudioId('source'),
      title,
      publisher: form.publisher.trim(),
      authors,
      url: normalizedUrl,
      publishedDate: form.publishedDate || null,
      accessedDate: form.accessedDate || null,
      note: form.note.trim(),
    }

    onChange(editingId
      ? sources.map((item) => item.id === editingId ? source : item)
      : [...sources, source])
    setDialogOpen(false)
  }

  function deleteSource(sourceId: string) {
    if ((counts.get(sourceId) ?? 0) > 0) return
    onChange(sources.filter((source) => source.id !== sourceId))
    setPendingDeleteId(null)
  }

  return (
    <section aria-labelledby="studio-sources-title" className="rounded-2xl border border-border-default/15 bg-surface-elevated p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-text-tertiary">Langkah 1 · Bukti</p>
          <h2 id="studio-sources-title" className="mt-1 font-interface text-base font-semibold text-text-primary">Sumber naskah</h2>
          <p className="mt-1 font-interface text-xs leading-relaxed text-text-secondary">Daftarkan sumber sebelum menyisipkan sitasi. Sitasi hanya dapat menunjuk sumber yang ada di registry ini.</p>
        </div>
        <button
          type="button"
          onClick={openNewSource}
          disabled={sources.length >= STUDIO_EVIDENCE_LIMITS.sources}
          className={`inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-lg bg-interactive-primary px-4 font-interface text-sm font-semibold text-text-on-inverse hover:bg-interactive-primary-hover disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
        >
          <Plus aria-hidden="true" size={17} /> Tambah sumber
        </button>
      </div>

      {sources.length === 0 ? (
        <div className="mt-4 flex items-start gap-3 rounded-xl bg-surface-sunken/65 px-4 py-3">
          <FileSearch aria-hidden="true" className="mt-0.5 shrink-0 text-text-tertiary" size={18} />
          <p className="font-interface text-sm leading-relaxed text-text-secondary">Belum ada sumber. Naskah tetap dapat ditulis, tetapi sitasi belum dapat disisipkan.</p>
        </div>
      ) : (
        <ol className="mt-4 grid gap-2 lg:grid-cols-2">
          {sources.map((source) => {
            const referenceCount = counts.get(source.id) ?? 0
            const pendingDelete = pendingDeleteId === source.id
            return (
              <li key={source.id} className="rounded-xl border border-border-default/15 bg-surface-page p-3">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-interface text-sm font-semibold text-text-primary">{source.title}</p>
                    <p className="mt-0.5 truncate font-mono text-[10px] text-text-tertiary">{sourceHost(source.url)}</p>
                    <p className="mt-2 font-interface text-xs text-text-secondary">{referenceCount > 0 ? `Dipakai oleh ${referenceCount} referensi` : 'Belum dirujuk dalam naskah'}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {source.url && (
                      <a href={source.url} target="_blank" rel="noreferrer" aria-label={`Buka sumber ${source.title}`} className={`flex h-11 w-11 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-sunken hover:text-text-primary ${focusRing}`}>
                        <ExternalLink aria-hidden="true" size={16} />
                      </a>
                    )}
                    <button type="button" aria-label={`Edit sumber ${source.title}`} onClick={() => openEditSource(source)} className={`flex h-11 w-11 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-sunken hover:text-text-primary ${focusRing}`}>
                      <Pencil aria-hidden="true" size={16} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Hapus sumber ${source.title}`}
                      disabled={referenceCount > 0}
                      title={referenceCount > 0 ? 'Lepaskan seluruh sitasi, metodologi, dan dataset yang merujuk sumber ini terlebih dahulu.' : 'Hapus sumber'}
                      onClick={() => setPendingDeleteId(source.id)}
                      className={`flex h-11 w-11 items-center justify-center rounded-lg text-signal-danger hover:bg-signal-danger-surface disabled:cursor-not-allowed disabled:opacity-35 ${focusRing}`}
                    >
                      <Trash2 aria-hidden="true" size={16} />
                    </button>
                  </div>
                </div>
                {pendingDelete && (
                  <div className="mt-3 rounded-lg bg-signal-danger-surface p-3">
                    <p className="font-interface text-xs leading-relaxed text-text-primary">Hapus sumber ini dari registry?</p>
                    <div className="mt-2 flex gap-2">
                      <button type="button" onClick={() => deleteSource(source.id)} className={`min-h-[44px] rounded-lg bg-signal-danger px-3 font-interface text-xs font-semibold text-text-on-inverse ${focusRing}`}>Ya, hapus</button>
                      <button type="button" onClick={() => setPendingDeleteId(null)} className={`min-h-[44px] rounded-lg px-3 font-interface text-xs font-semibold text-text-primary hover:bg-surface-elevated ${focusRing}`}>Batal</button>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ol>
      )}

      {dialogOpen && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4 sm:p-8">
          <button type="button" aria-label="Tutup formulir sumber" onClick={() => setDialogOpen(false)} className="absolute inset-0 bg-surface-overlay/60" />
          <form
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="studio-source-dialog-title"
            onSubmit={(event) => { event.preventDefault(); saveSource() }}
            className="relative z-base max-h-[min(820px,calc(100dvh-32px))] w-full max-w-[680px] overflow-y-auto rounded-2xl border border-border-default/20 bg-surface-elevated p-5 shadow-lg sm:p-7"
          >
            <header className="flex items-start justify-between gap-4">
              <div>
                <h2 id="studio-source-dialog-title" className="font-interface text-lg font-semibold text-text-primary">{editingId ? 'Edit sumber' : 'Tambah sumber'}</h2>
                <p className="mt-1 font-interface text-xs leading-relaxed text-text-tertiary">URL dan judul wajib agar pembaca dapat memeriksa bukti yang dirujuk.</p>
              </div>
              <button type="button" aria-label="Tutup" onClick={() => setDialogOpen(false)} className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg hover:bg-surface-sunken ${focusRing}`}><X aria-hidden="true" size={19} /></button>
            </header>

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="font-interface text-xs font-semibold text-text-primary">Judul sumber <span className="text-signal-danger">*</span></span>
                <input ref={titleInputRef} value={form.title} onChange={(event) => updateForm('title', event.target.value)} maxLength={300} className={fieldClass} />
              </label>
              <label className="block">
                <span className="font-interface text-xs font-semibold text-text-primary">URL sumber <span className="text-signal-danger">*</span></span>
                <input value={form.url} onChange={(event) => updateForm('url', event.target.value)} maxLength={2_000} inputMode="url" placeholder="https://..." className={fieldClass} />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="font-interface text-xs font-semibold text-text-primary">Penerbit atau institusi</span>
                  <input value={form.publisher} onChange={(event) => updateForm('publisher', event.target.value)} maxLength={180} className={fieldClass} />
                </label>
                <label className="block">
                  <span className="font-interface text-xs font-semibold text-text-primary">Penulis</span>
                  <input value={form.authors} onChange={(event) => updateForm('authors', event.target.value)} maxLength={3_200} placeholder="Pisahkan nama dengan titik koma" className={fieldClass} />
                </label>
                <label className="block">
                  <span className="font-interface text-xs font-semibold text-text-primary">Tanggal terbit</span>
                  <input type="date" value={form.publishedDate} onChange={(event) => updateForm('publishedDate', event.target.value)} className={fieldClass} />
                </label>
                <label className="block">
                  <span className="font-interface text-xs font-semibold text-text-primary">Tanggal diakses</span>
                  <input type="date" value={form.accessedDate} onChange={(event) => updateForm('accessedDate', event.target.value)} className={fieldClass} />
                </label>
              </div>
              <label className="block">
                <span className="font-interface text-xs font-semibold text-text-primary">Catatan untuk pembaca</span>
                <span id="studio-source-note-help" className="mt-1 block font-interface text-xs leading-relaxed text-text-tertiary">Opsional. Catatan ini akan ditampilkan dalam daftar sumber publik.</span>
                <textarea aria-describedby="studio-source-note-help" value={form.note} onChange={(event) => updateForm('note', event.target.value)} rows={3} maxLength={1_000} className={fieldClass} />
              </label>
            </div>

            {error && <p role="alert" className="mt-4 rounded-lg bg-signal-danger-surface px-3 py-2.5 font-interface text-xs text-signal-danger">{error}</p>}

            <footer className="mt-7 flex justify-end gap-2 border-t border-border-default/15 pt-5">
              <button type="button" onClick={() => setDialogOpen(false)} className={`min-h-[44px] rounded-lg px-4 font-interface text-sm font-semibold text-text-secondary hover:bg-surface-sunken ${focusRing}`}>Batal</button>
              <button type="submit" className={`min-h-[44px] rounded-lg bg-interactive-primary px-4 font-interface text-sm font-semibold text-text-on-inverse hover:bg-interactive-primary-hover ${focusRing}`}>Simpan sumber</button>
            </footer>
          </form>
        </div>
      )}
    </section>
  )
}
