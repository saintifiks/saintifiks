'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  CircleAlert,
  Cloud,
  CloudOff,
  Copy,
  Eye,
  FileJson2,
  HardDrive,
  History,
  PencilLine,
  RefreshCw,
  RotateCcw,
  Save,
  Send,
  Settings2,
  Trash2,
  WifiOff,
  X,
} from 'lucide-react'
import type {
  StudioArticleMetadata,
  StudioDocumentV2,
  StudioJsonNode,
  StudioSourceEvidence,
} from '@/lib/editorial-studio/document'
import {
  createStudioDocumentV2,
  migrateStudioDocumentToV2,
  studioDocumentsEqual,
  validateStudioDocumentV2,
} from '@/lib/editorial-studio/document'
import { createEditorialStudioV2Fixture } from '@/lib/editorial-studio/fixture'
import { preflightStudioArticleV2 } from '@/lib/editorial-studio/preflight'
import { buatSlug } from '@/lib/slug'
import { fingerprintStudioDraft, type StudioDraftContentV2, type StudioSnapshotReason } from '@/lib/editorial-studio/persistence'
import StudioEditor from './StudioEditor'
import StudioImageUpload from './StudioImageUpload'
import StudioRenderer from './StudioRenderer'
import StudioSourceRegistry from './StudioSourceRegistry'
import { useStudioDraftPersistence } from './useStudioDraftPersistence'
import { useStudioServerSync } from './useStudioServerSync'

type StudioView = 'write' | 'preview'
type RoundTripState = 'idle' | 'passed' | 'failed'

type StudioInitialDraft = {
  title: string
  deck: string
  document: StudioDocumentV2
  isPublished: boolean
  publishedAt: string | null
}

type StudioLabProps = {
  initialDraft?: StudioInitialDraft
  production?: boolean
}

const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary'

function cloneFixture(): StudioDocumentV2 {
  return JSON.parse(JSON.stringify(createEditorialStudioV2Fixture())) as StudioDocumentV2
}

function blankDocument(source = createEditorialStudioV2Fixture()): StudioDocumentV2 {
  return createStudioDocumentV2(undefined, {
    documentId: source.documentId,
    article: source.article,
  })
}

function countWords(node: StudioJsonNode): number {
  const ownWords = node.type === 'text'
    ? (node.text ?? '').trim().split(/\s+/).filter(Boolean).length
    : 0
  return ownWords + (node.content?.reduce((sum, child) => sum + countWords(child), 0) ?? 0)
}

function nodeText(node: StudioJsonNode): string {
  return `${node.text ?? ''}${node.content?.map(nodeText).join('') ?? ''}`
}

function collectOutline(root: StudioJsonNode) {
  const items: Array<{ id: string; label: string; level: 2 | 3 }> = []
  function visit(node: StudioJsonNode) {
    if (node.type === 'heading' && (node.attrs?.level === 2 || node.attrs?.level === 3)) {
      const id = typeof node.attrs?.id === 'string' ? node.attrs.id : ''
      const label = nodeText(node).trim()
      if (id && label) items.push({ id, label, level: node.attrs.level })
    }
    node.content?.forEach(visit)
  }
  visit(root)
  return items
}

function formatSavedAt(value: string | null) {
  if (!value) return null
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function snapshotReason(reason: StudioSnapshotReason) {
  return {
    autosave: 'Autosave',
    manual: 'Simpan manual',
    restore: 'Pemulihan',
    copy: 'Salinan konflik',
    server: 'Versi server',
  }[reason]
}

export default function StudioLab({ initialDraft, production = false }: StudioLabProps) {
  const router = useRouter()
  const initialDocument = initialDraft?.document ?? blankDocument()
  const [document, setDocument] = useState<StudioDocumentV2>(() => initialDocument)
  const [title, setTitle] = useState(initialDraft?.title ?? '')
  const [deck, setDeck] = useState(initialDraft?.deck ?? '')
  const [isPublished, setIsPublished] = useState(initialDraft?.isPublished ?? false)
  const [publishedAt, setPublishedAt] = useState(initialDraft?.publishedAt ?? null)
  const [publishOpen, setPublishOpen] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null)
  const [confirmUnpublish, setConfirmUnpublish] = useState(false)
  const [view, setView] = useState<StudioView>('write')
  const [toolsOpen, setToolsOpen] = useState(false)
  const [roundTripState, setRoundTripState] = useState<RoundTripState>('idle')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [hasOperatorEdited, setHasOperatorEdited] = useState(false)
  const toolsRef = useRef<HTMLElement>(null)
  const toolsCloseRef = useRef<HTMLButtonElement>(null)
  const toolsTriggerRef = useRef<HTMLButtonElement>(null)

  const validation = useMemo(() => validateStudioDocumentV2(document), [document])
  const preflight = useMemo(() => preflightStudioArticleV2(title, deck, document), [deck, document, title])
  const wordCount = useMemo(() => countWords(document.root), [document.root])
  const outline = useMemo(() => collectOutline(document.root), [document.root])
  const draftContent = useMemo<StudioDraftContentV2>(
    () => ({ title, deck, document }),
    [deck, document, title]
  )
  const persistence = useStudioDraftPersistence({
    content: draftContent,
    onRestore: handleRestore,
    writeEnabled: hasOperatorEdited,
  })
  const serverSync = useStudioServerSync({
    documentId: document.documentId,
    hydrated: persistence.hydrated,
    online: persistence.online,
    lastLocalSavedAt: persistence.lastSavedAt,
    onAdoptServer: persistence.adoptServerVersion,
    onKeepLocalAsCopy: async () => {
      setHasOperatorEdited(true)
      await persistence.keepServerConflictAsCopy()
    },
  })

  useEffect(() => {
    if (!production || document.article?.articleId || !/\/dashboard\/artikel\/baru\/?$/.test(window.location.pathname)) return
    const url = new URL(window.location.href)
    if (url.searchParams.get('draft') === document.documentId) return
    url.searchParams.set('draft', document.documentId)
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
  }, [document.article?.articleId, document.documentId, production])

  useEffect(() => {
    if (!toolsOpen) return
    const trigger = toolsTriggerRef.current
    const previousOverflow = documentBodyOverflow()
    globalThis.document.body.style.overflow = 'hidden'
    toolsCloseRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setToolsOpen(false)
        return
      }
      if (event.key !== 'Tab' || !toolsRef.current) return
      const focusable = toolsRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), summary, [tabindex]:not([tabindex="-1"])'
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
      trigger?.focus()
    }
  }, [toolsOpen])

  function documentBodyOverflow() {
    return typeof window === 'undefined' ? '' : globalThis.document.body.style.overflow
  }

  function handleRestore(restored: StudioDraftContentV2) {
    if (restored.document.documentId !== document.documentId && restored.document.article?.articleId === null) {
      setIsPublished(false)
      setPublishedAt(null)
    }
    setTitle(restored.title)
    setDeck(restored.deck)
    setDocument(restored.document)
    setRoundTripState('idle')
  }

  function handleDocumentChange(nextDocument: StudioDocumentV2) {
    setHasOperatorEdited(true)
    setDocument(nextDocument)
    setRoundTripState('idle')
    setPublishSuccess(null)
  }

  function handleTitleChange(nextTitle: string) {
    setHasOperatorEdited(true)
    const previousAutomaticSlug = buatSlug(title)
    setTitle(nextTitle)
    if (document.article && (!document.article.slug || document.article.slug === previousAutomaticSlug)) {
      updateArticleMetadata({ slug: buatSlug(nextTitle) })
    }
    setPublishSuccess(null)
  }

  function updateArticleMetadata(patch: Partial<StudioArticleMetadata>) {
    if (!document.article) return
    setHasOperatorEdited(true)
    setDocument((current) => current.article ? {
      ...current,
      article: { ...current.article, ...patch },
    } : current)
    setPublishSuccess(null)
  }

  function testRoundTrip() {
    const serialized = JSON.stringify(document)
    const restored = migrateStudioDocumentToV2(JSON.parse(serialized))
    setRoundTripState(
      restored.ok && studioDocumentsEqual(document, restored.document) ? 'passed' : 'failed'
    )
  }

  function resetFixture() {
    setHasOperatorEdited(true)
    handleRestore({
      title: 'Membangun editor yang menjaga argumen dan bukti',
      deck: 'Contoh lengkap blok semantik Editorial Studio Saintifiks.',
      document: cloneFixture(),
    })
    setView('write')
  }

  function resetBlank() {
    setHasOperatorEdited(true)
    handleRestore({ title: '', deck: '', document: blankDocument(document) })
    setView('write')
  }

  function handleSourcesChange(sources: StudioSourceEvidence[]) {
    setHasOperatorEdited(true)
    setDocument((current) => ({
      ...current,
      evidence: { ...current.evidence, sources },
    }))
    setRoundTripState('idle')
    setPublishSuccess(null)
  }

  function handleDeckChange(nextDeck: string) {
    setHasOperatorEdited(true)
    setDeck(nextDeck)
    setPublishSuccess(null)
  }

  async function publishArticle() {
    if (!production || !serverSync.serverRevision || !preflight.ok) return
    setPublishing(true)
    setPublishError(null)
    try {
      const clientFingerprint = await fingerprintStudioDraft(draftContent)
      const response = await fetch('/api/admin/editorial-studio/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          documentId: document.documentId,
          serverRevision: serverSync.serverRevision,
          clientFingerprint,
        }),
      })
      const result: unknown = await response.json().catch(() => null)
      const payload = result && typeof result === 'object' ? result as Record<string, unknown> : null
      if (!response.ok || !payload?.ok || typeof payload.articleId !== 'string') {
        setPublishError(typeof payload?.error === 'string' ? payload.error : 'Artikel belum dapat diterbitkan.')
        return
      }
      setIsPublished(true)
      setPublishedAt(typeof payload.publishedAt === 'string' ? payload.publishedAt : new Date().toISOString())
      setPublishOpen(false)
      setPublishSuccess('Versi ini telah diterbitkan sebagai snapshot immutable.')
      router.replace(`/dashboard/artikel/${payload.articleId}/edit`)
    } catch {
      setPublishError('Koneksi ke server terputus. Versi publik tidak diubah; coba lagi setelah koneksi pulih.')
    } finally {
      setPublishing(false)
    }
  }

  async function unpublishArticle() {
    if (!production) return
    setPublishing(true)
    setPublishError(null)
    try {
      const response = await fetch('/api/admin/editorial-studio/unpublish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ documentId: document.documentId }),
      })
      const result: unknown = await response.json().catch(() => null)
      const payload = result && typeof result === 'object' ? result as Record<string, unknown> : null
      if (!response.ok || !payload?.ok) {
        setPublishError(typeof payload?.error === 'string' ? payload.error : 'Artikel belum dapat dijadikan draf.')
        return
      }
      setIsPublished(false)
      setPublishedAt(null)
      setConfirmUnpublish(false)
      setPublishSuccess('Artikel tidak lagi tampil untuk pembaca. Snapshot lama tetap tersimpan.')
      router.refresh()
    } catch {
      setPublishError('Koneksi ke server terputus. Artikel tetap dalam status sebelumnya.')
    } finally {
      setPublishing(false)
    }
  }

  const deviceLabel = {
    loading: 'Menyiapkan penyimpanan perangkat...',
    idle: 'Belum disimpan di perangkat',
    dirty: 'Ada perubahan belum tersimpan',
    saving: 'Menyimpan ke perangkat...',
    saved: `Tersimpan di perangkat${persistence.lastSavedAt ? ` | ${formatSavedAt(persistence.lastSavedAt)}` : ''}`,
    error: 'Penyimpanan perangkat bermasalah',
    conflict: 'Autosave dijeda karena konflik antar-tab',
    unavailable: 'Penyimpanan perangkat tidak tersedia',
  }[persistence.state]

  const serverLabel = {
    idle: 'Belum ada salinan server',
    queued: 'Menunggu sinkronisasi server',
    syncing: 'Menyinkronkan ke server...',
    synced: `Tersinkron ke server${serverSync.lastSyncedAt ? ` | ${formatSavedAt(serverSync.lastSyncedAt)}` : ''}`,
    offline: 'Offline | sinkronisasi mengantre',
    conflict: 'Konflik dengan versi server',
    error: 'Sinkronisasi server tertunda',
  }[serverSync.state]

  const compactSaveStatus = (() => {
    if (persistence.state === 'saving') return { label: 'Menyimpan di perangkat...', icon: HardDrive, tone: 'text-text-secondary' }
    if (persistence.state === 'dirty') return { label: 'Perubahan belum tersimpan', icon: CircleAlert, tone: 'text-signal-warning' }
    if (persistence.state === 'conflict' || serverSync.state === 'conflict') return { label: 'Perlu memilih versi', icon: CircleAlert, tone: 'text-signal-danger' }
    if (persistence.state === 'error' || persistence.state === 'unavailable') return { label: 'Penyimpanan bermasalah', icon: CircleAlert, tone: 'text-signal-danger' }
    if (serverSync.state === 'syncing' || serverSync.state === 'queued') return { label: 'Tersimpan | menyinkronkan', icon: Cloud, tone: 'text-text-secondary' }
    if (serverSync.state === 'offline') return { label: 'Tersimpan di perangkat | offline', icon: CloudOff, tone: 'text-signal-warning' }
    if (serverSync.state === 'error') return { label: 'Tersimpan di perangkat', icon: HardDrive, tone: 'text-signal-warning' }
    if (serverSync.state === 'synced') return { label: 'Semua perubahan tersimpan', icon: Check, tone: 'text-signal-success' }
    if (persistence.state === 'saved') return { label: 'Tersimpan di perangkat', icon: Check, tone: 'text-signal-success' }
    return { label: 'Draf baru', icon: HardDrive, tone: 'text-text-tertiary' }
  })()
  const CompactStatusIcon = compactSaveStatus.icon

  function jumpToHeading(id: string) {
    setToolsOpen(false)
    window.setTimeout(() => {
      const target = globalThis.document.getElementById(id)
        ?? globalThis.document.querySelector<HTMLElement>(`[data-studio-id="${id}"]`)
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 80)
  }

  return (
    <div className="-mx-4 -my-7 min-h-[calc(100vh-4rem)] bg-surface-page sm:-mx-6 sm:-my-9 lg:-mx-8 lg:-my-10 lg:min-h-screen">
      <header className="sticky top-16 z-raised border-b border-border-default/15 bg-surface-elevated/95 backdrop-blur lg:top-0">
        <div className="flex min-h-[68px] items-center gap-2 px-3 sm:px-5 lg:px-7">
          <Link
            href="/dashboard/artikel"
            aria-label="Kembali ke daftar artikel"
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-sunken hover:text-text-primary ${focusRing}`}
          >
            <ArrowLeft aria-hidden="true" size={19} />
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate font-interface text-sm font-semibold text-text-primary">
                {title.trim() || 'Naskah tanpa judul'}
              </p>
              <span className="hidden rounded-full bg-surface-sunken px-2 py-0.5 font-mono text-[9px] font-medium uppercase tracking-wider text-text-tertiary sm:inline">{isPublished ? 'Diterbitkan' : 'Draf'}</span>
            </div>
            <p aria-live="polite" className={`mt-0.5 flex items-center gap-1.5 truncate font-interface text-[11px] ${compactSaveStatus.tone}`}>
              <CompactStatusIcon aria-hidden="true" size={13} />
              {compactSaveStatus.label}
            </p>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              aria-label={view === 'write' ? 'Pratinjau' : 'Kembali menulis'}
              onClick={() => setView((current) => current === 'write' ? 'preview' : 'write')}
              className={`inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-border-default/20 bg-surface-elevated px-3 font-interface text-sm font-semibold text-text-primary hover:bg-surface-sunken ${focusRing}`}
            >
              {view === 'write' ? <Eye aria-hidden="true" size={17} /> : <PencilLine aria-hidden="true" size={17} />}
              <span className="hidden sm:inline">{view === 'write' ? 'Pratinjau' : 'Kembali menulis'}</span>
            </button>
            <button
              type="button"
              aria-label="Simpan"
              disabled={!hasOperatorEdited || !persistence.hydrated || Boolean(persistence.conflict) || !validation.ok || persistence.state === 'saving'}
              onClick={() => void persistence.saveNow()}
              className={`inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-interactive-primary px-3 font-interface text-sm font-semibold text-text-on-inverse hover:bg-interactive-primary-hover disabled:cursor-not-allowed disabled:opacity-45 sm:px-4 ${focusRing}`}
            >
              <Save aria-hidden="true" size={17} />
              <span className="hidden md:inline">Simpan</span>
            </button>
            {production && (
              <button
                type="button"
                aria-label={isPublished ? 'Terbitkan pembaruan' : 'Terbitkan artikel'}
                disabled={publishing}
                onClick={() => { setPublishError(null); setPublishOpen(true) }}
                className={`inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-surface-inverse px-3 font-interface text-sm font-semibold text-text-on-inverse hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-35 sm:px-4 ${focusRing}`}
              >
                <Send aria-hidden="true" size={16} />
                <span className="hidden md:inline">{isPublished ? 'Terbitkan pembaruan' : 'Terbitkan'}</span>
              </button>
            )}
            <button
              ref={toolsTriggerRef}
              type="button"
              aria-label="Buka alat naskah"
              aria-haspopup="dialog"
              aria-expanded={toolsOpen}
              onClick={() => setToolsOpen(true)}
              className={`flex h-11 w-11 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-sunken hover:text-text-primary ${focusRing}`}
            >
              <Settings2 aria-hidden="true" size={19} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1240px] px-3 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
        {persistence.recoveredAt && (
          <section className="mb-4 flex items-start gap-3 rounded-xl border border-signal-success/25 bg-signal-success-surface px-4 py-3 font-interface text-sm text-text-primary">
            <RefreshCw aria-hidden="true" className="mt-0.5 shrink-0 text-signal-success" size={16} />
            <p>Draf terakhir dari perangkat ini dipulihkan otomatis ({formatSavedAt(persistence.recoveredAt)}).</p>
          </section>
        )}

        {publishSuccess && (
          <section aria-live="polite" className="mb-4 flex items-start gap-3 rounded-xl border border-signal-success/25 bg-signal-success-surface px-4 py-3 font-interface text-sm text-text-primary">
            <CheckCircle2 aria-hidden="true" className="mt-0.5 shrink-0 text-signal-success" size={16} />
            <p>{publishSuccess}</p>
          </section>
        )}

        {publishError && !publishOpen && (
          <section role="alert" className="mb-4 flex items-start gap-3 rounded-xl border border-signal-danger/25 bg-signal-danger-surface px-4 py-3 font-interface text-sm text-text-primary">
            <CircleAlert aria-hidden="true" className="mt-0.5 shrink-0 text-signal-danger" size={16} />
            <p>{publishError}</p>
          </section>
        )}

        {persistence.otherTabOpen && !persistence.conflict && (
          <section className="mb-4 rounded-xl border border-signal-warning/25 bg-signal-warning-surface px-4 py-3 font-interface text-sm text-text-primary">
            Naskah ini juga terbuka di tab lain. Gunakan satu tab untuk menulis agar versi tidak berkonflik.
          </section>
        )}

        {persistence.conflict && (
          <section role="alert" aria-labelledby="studio-device-conflict-title" className="mb-4 rounded-xl border border-signal-danger/30 bg-signal-danger-surface p-5">
            <h2 id="studio-device-conflict-title" className="font-interface text-sm font-semibold text-text-primary">Dua tab mengubah naskah bersamaan</h2>
            <p className="mt-2 max-w-2xl font-interface text-sm leading-relaxed text-text-secondary">Autosave dijeda agar tidak menimpa pekerjaan. Pilih versi terbaru dari perangkat, atau jadikan isi layar sebagai naskah terpisah.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => void persistence.loadLatestAfterConflict()} className={`inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-interactive-primary px-4 font-interface text-sm font-semibold text-text-on-inverse ${focusRing}`}>
                <RefreshCw aria-hidden="true" size={16} /> Muat versi terbaru
              </button>
              <button type="button" onClick={() => { setHasOperatorEdited(true); persistence.keepAsCopy() }} className={`inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-border-default/30 bg-surface-elevated px-4 font-interface text-sm font-semibold text-text-primary hover:bg-surface-sunken ${focusRing}`}>
                <Copy aria-hidden="true" size={16} /> Jadikan salinan
              </button>
            </div>
          </section>
        )}

        {serverSync.conflict && !persistence.conflict && (
          <section role="alert" aria-labelledby="studio-server-conflict-title" className="mb-4 rounded-xl border border-signal-danger/30 bg-signal-danger-surface p-5">
            <h2 id="studio-server-conflict-title" className="font-interface text-sm font-semibold text-text-primary">Versi perangkat dan server sama-sama berubah</h2>
            <p className="mt-2 max-w-2xl font-interface text-sm leading-relaxed text-text-secondary">Tidak ada versi yang ditimpa otomatis. Gunakan revisi server {serverSync.conflict.serverRevision}, atau pertahankan isi perangkat sebagai naskah baru.</p>
            {serverSync.errorMessage && <p className="mt-3 font-interface text-sm font-medium text-signal-danger">{serverSync.errorMessage}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" disabled={serverSync.resolvingConflict} onClick={() => void serverSync.useServerVersion()} className={`inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-interactive-primary px-4 font-interface text-sm font-semibold text-text-on-inverse disabled:opacity-45 ${focusRing}`}>
                <RefreshCw aria-hidden="true" size={16} /> Gunakan versi server
              </button>
              <button type="button" disabled={serverSync.resolvingConflict} onClick={() => void serverSync.keepLocalAsCopy()} className={`inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-border-default/30 bg-surface-elevated px-4 font-interface text-sm font-semibold text-text-primary hover:bg-surface-sunken disabled:opacity-45 ${focusRing}`}>
                <Copy aria-hidden="true" size={16} /> Jadikan salinan
              </button>
            </div>
          </section>
        )}

        {serverSync.errorMessage && !serverSync.conflict && !persistence.conflict && (
          <section role="alert" className="mb-4 flex flex-col gap-3 rounded-xl border border-signal-warning/30 bg-signal-warning-surface px-4 py-3 font-interface text-sm text-text-primary sm:flex-row sm:items-center sm:justify-between">
            <p>{serverSync.errorMessage}</p>
            <button type="button" onClick={serverSync.retryNow} className={`inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-lg border border-border-default/30 bg-surface-elevated px-3 font-interface text-xs font-semibold text-text-primary hover:bg-surface-sunken ${focusRing}`}>
              <RefreshCw aria-hidden="true" size={15} /> Coba lagi
            </button>
          </section>
        )}

        {persistence.errorMessage && !persistence.conflict && (
          <section role="alert" className="mb-4 rounded-xl border border-signal-danger/30 bg-signal-danger-surface px-4 py-3 font-interface text-sm text-text-primary">
            {persistence.errorMessage} Isi tetap berada di layar; salin naskah sebelum menutup tab bila masalah berlanjut.
          </section>
        )}

        {view === 'write' ? (
          <div className="space-y-4">
            <StudioSourceRegistry
              document={document}
              onChange={handleSourcesChange}
            />
            <StudioEditor
              document={document}
              title={title}
              deck={deck}
              wordCount={wordCount}
              sources={document.evidence.sources}
              onChange={handleDocumentChange}
              onTitleChange={handleTitleChange}
              onDeckChange={handleDeckChange}
            />
          </div>
        ) : (
          <section aria-label="Pratinjau artikel" className="rounded-2xl border border-border-default/15 bg-surface-elevated px-5 py-10 shadow-sm sm:px-10 sm:py-14 lg:px-16">
            <header className="mx-auto mb-10 max-w-content border-b border-border-default/20 pb-8">
              <p className="font-mono text-kicker uppercase tracking-[0.14em] text-text-tertiary">{document.article?.kicker || document.article?.category || 'Pratinjau naskah'}</p>
              <h1 className="mt-3 font-display text-display-sm font-semibold leading-heading sm:text-display-base">{title || 'Naskah tanpa judul'}</h1>
              {deck && <p className="mt-4 font-body text-body-sm leading-deck text-text-secondary">{deck}</p>}
              {document.article?.slug && <p className="mt-4 font-mono text-[10px] text-text-tertiary">/artikel/{document.article.slug}</p>}
            </header>
            {document.article?.coverImageUrl && (
              <figure className="mx-auto mb-10 max-w-content">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={document.article.coverImageUrl} alt={title ? `Cover ${title}` : 'Cover artikel'} className="h-auto w-full rounded-lg" />
                {document.article.coverIllustrator && <figcaption className="mt-2 font-interface text-caption text-text-tertiary">Ilustrasi: {document.article.coverIllustrator}</figcaption>}
              </figure>
            )}
            <StudioRenderer document={document} />
          </section>
        )}
      </main>

      {toolsOpen && (
        <div className="fixed inset-0 z-modal">
          <button type="button" aria-label="Tutup alat naskah" onClick={() => setToolsOpen(false)} className="absolute inset-0 bg-surface-overlay/55" />
          <aside ref={toolsRef} role="dialog" aria-modal="true" aria-labelledby="studio-tools-title" className="absolute inset-y-0 right-0 flex w-[min(92vw,460px)] flex-col border-l border-border-default/20 bg-surface-elevated shadow-lg">
            <header className="flex min-h-[68px] items-center justify-between border-b border-border-default/15 px-5">
              <div>
                <h2 id="studio-tools-title" className="font-interface text-sm font-semibold text-text-primary">Alat naskah</h2>
                <p className="mt-0.5 font-interface text-[11px] text-text-tertiary">Publikasi, struktur, dan pemulihan</p>
              </div>
              <button ref={toolsCloseRef} type="button" aria-label="Tutup alat naskah" onClick={() => setToolsOpen(false)} className={`flex h-11 w-11 items-center justify-center rounded-lg hover:bg-surface-sunken ${focusRing}`}>
                <X aria-hidden="true" size={19} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              {production && document.article && (
                <section aria-labelledby="studio-metadata-title">
                  <h3 id="studio-metadata-title" className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-text-tertiary">Pengaturan artikel</h3>
                  <div className="mt-4 space-y-4">
                    <label className="block">
                      <span className="font-interface text-xs font-semibold text-text-primary">Slug <span className="text-signal-danger">*</span></span>
                      <div className="mt-2 flex min-h-[44px] items-center rounded-lg border border-border-default/25 bg-surface-page focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-interactive-primary">
                        <span className="pl-3 font-mono text-xs text-text-tertiary">/artikel/</span>
                        <input
                          value={document.article.slug}
                          onChange={(event) => updateArticleMetadata({ slug: buatSlug(event.target.value) })}
                          maxLength={220}
                          spellCheck={false}
                          className="h-11 min-w-0 flex-1 border-0 bg-transparent px-1.5 pr-3 font-mono text-xs text-text-primary outline-none"
                        />
                      </div>
                    </label>

                    <StudioImageUpload
                      label="Gambar cover"
                      value={document.article.coverImageUrl}
                      previewAlt="Pratinjau cover artikel"
                      onChange={(url) => updateArticleMetadata({ coverImageUrl: url })}
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="font-interface text-xs font-semibold text-text-primary">Kategori</span>
                        <input value={document.article.category} onChange={(event) => updateArticleMetadata({ category: event.target.value })} maxLength={120} className={`mt-2 h-11 w-full rounded-lg border border-border-default/25 bg-surface-page px-3 font-interface text-sm text-text-primary ${focusRing}`} />
                      </label>
                      <label className="block">
                        <span className="font-interface text-xs font-semibold text-text-primary">Negara</span>
                        <input value={document.article.country} onChange={(event) => updateArticleMetadata({ country: event.target.value })} maxLength={120} className={`mt-2 h-11 w-full rounded-lg border border-border-default/25 bg-surface-page px-3 font-interface text-sm text-text-primary ${focusRing}`} />
                      </label>
                    </div>
                    <label className="block">
                      <span className="font-interface text-xs font-semibold text-text-primary">Kicker</span>
                      <input value={document.article.kicker} onChange={(event) => updateArticleMetadata({ kicker: event.target.value })} maxLength={240} className={`mt-2 h-11 w-full rounded-lg border border-border-default/25 bg-surface-page px-3 font-interface text-sm text-text-primary ${focusRing}`} />
                    </label>
                    <label className="block">
                      <span className="font-interface text-xs font-semibold text-text-primary">Kredit ilustrasi cover</span>
                      <input value={document.article.coverIllustrator} onChange={(event) => updateArticleMetadata({ coverIllustrator: event.target.value })} maxLength={180} className={`mt-2 h-11 w-full rounded-lg border border-border-default/25 bg-surface-page px-3 font-interface text-sm text-text-primary ${focusRing}`} />
                    </label>
                  </div>

                  <div className="mt-6 rounded-xl bg-surface-sunken/65 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-interface text-sm font-semibold text-text-primary">{isPublished ? 'Artikel sedang tayang' : 'Artikel masih berupa draf'}</p>
                        {publishedAt && <p className="mt-1 font-interface text-xs text-text-tertiary">Versi publik terakhir: {formatSavedAt(publishedAt)}</p>}
                      </div>
                      <span className={`rounded-full px-2 py-1 font-mono text-[9px] font-medium uppercase tracking-wider ${isPublished ? 'bg-signal-success-surface text-signal-success' : 'bg-surface-elevated text-text-secondary'}`}>{isPublished ? 'Publik' : 'Draf'}</span>
                    </div>
                    {isPublished && !confirmUnpublish && (
                      <button type="button" onClick={() => { setPublishError(null); setConfirmUnpublish(true) }} className={`mt-3 min-h-[44px] rounded-lg px-3 font-interface text-xs font-semibold text-signal-danger hover:bg-signal-danger-surface ${focusRing}`}>Tarik dari publikasi</button>
                    )}
                    {isPublished && confirmUnpublish && (
                      <div className="mt-3 rounded-lg border border-signal-danger/20 bg-signal-danger-surface p-3">
                        <p className="font-interface text-xs leading-relaxed text-text-primary">Artikel akan hilang dari web publik. Draf dan snapshot lama tidak dihapus.</p>
                        {publishError && <p role="alert" className="mt-2 font-interface text-xs leading-relaxed text-signal-danger">{publishError}</p>}
                        <div className="mt-3 flex gap-2">
                          <button type="button" disabled={publishing} onClick={() => void unpublishArticle()} className={`min-h-[44px] rounded-lg bg-signal-danger px-3 font-interface text-xs font-semibold text-text-on-inverse disabled:opacity-45 ${focusRing}`}>{publishing ? 'Memproses...' : 'Ya, tarik artikel'}</button>
                          <button type="button" onClick={() => setConfirmUnpublish(false)} className={`min-h-[44px] rounded-lg px-3 font-interface text-xs font-semibold text-text-primary hover:bg-surface-elevated ${focusRing}`}>Batal</button>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}

              <section aria-labelledby="studio-outline-title" className={`${production ? 'mt-7 border-t border-border-default/15 pt-6' : ''}`}>
                <h3 id="studio-outline-title" className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-text-tertiary">Struktur naskah</h3>
                {outline.length > 0 ? (
                  <ol className="mt-3 space-y-1">
                    {outline.map((item) => (
                      <li key={item.id} className={item.level === 3 ? 'pl-4' : ''}>
                        <button type="button" onClick={() => jumpToHeading(item.id)} className={`min-h-[40px] w-full rounded-lg px-2 text-left font-interface text-sm text-text-secondary hover:bg-surface-sunken hover:text-text-primary ${focusRing}`}>{item.label}</button>
                      </li>
                    ))}
                  </ol>
                ) : <p className="mt-3 font-interface text-xs leading-relaxed text-text-tertiary">Tambahkan judul bagian agar struktur artikel muncul di sini.</p>}
              </section>

              <section aria-labelledby="studio-status-title" className="mt-7 border-t border-border-default/15 pt-6">
                <h3 id="studio-status-title" className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-text-tertiary">Status penyimpanan</h3>
                <div className="mt-3 space-y-2">
                  <div className="flex items-start gap-3 rounded-xl bg-surface-sunken/70 p-3">
                    <HardDrive aria-hidden="true" className="mt-0.5 shrink-0 text-text-secondary" size={17} />
                    <div><p className="font-interface text-sm font-medium text-text-primary">Perangkat</p><p className="mt-0.5 font-interface text-xs leading-relaxed text-text-secondary">{deviceLabel}</p></div>
                  </div>
                  <div className="flex items-start gap-3 rounded-xl bg-surface-sunken/70 p-3">
                    {serverSync.state === 'offline' ? <CloudOff aria-hidden="true" className="mt-0.5 shrink-0 text-signal-warning" size={17} /> : <Cloud aria-hidden="true" className="mt-0.5 shrink-0 text-text-secondary" size={17} />}
                    <div><p className="font-interface text-sm font-medium text-text-primary">Server</p><p className="mt-0.5 font-interface text-xs leading-relaxed text-text-secondary">{serverLabel}</p></div>
                  </div>
                  {!persistence.online && <p className="flex items-center gap-2 px-1 font-interface text-xs font-medium text-signal-warning"><WifiOff aria-hidden="true" size={14} /> Offline | penyimpanan perangkat tetap aktif</p>}
                </div>
              </section>

              <section aria-labelledby="studio-integrity-title" className="mt-7 border-t border-border-default/15 pt-6">
                <h3 id="studio-integrity-title" className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-text-tertiary">Integritas naskah</h3>
                <div className="mt-3 flex items-center gap-2 font-interface text-sm text-text-primary">
                  {validation.ok ? <CheckCircle2 aria-hidden="true" className="text-signal-success" size={17} /> : <CircleAlert aria-hidden="true" className="text-signal-danger" size={17} />}
                  {validation.ok ? 'Kontrak dokumen valid' : `${validation.issues.length} masalah kontrak`}
                </div>
                <p className="mt-1 font-interface text-xs text-text-tertiary">{wordCount.toLocaleString('id-ID')} kata | canonical schema v{document.schemaVersion}</p>
                <button type="button" onClick={testRoundTrip} className={`mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-border-default/25 px-3 font-interface text-xs font-semibold text-text-primary hover:bg-surface-sunken ${focusRing}`}>
                  <FileJson2 aria-hidden="true" size={15} /> Uji simpan-muat
                </button>
                {roundTripState !== 'idle' && <p className={`mt-2 font-interface text-xs font-medium ${roundTripState === 'passed' ? 'text-signal-success' : 'text-signal-danger'}`}>{roundTripState === 'passed' ? 'Dokumen kembali identik.' : 'Uji simpan-muat gagal.'}</p>}
                {!validation.ok && (
                  <ul className="mt-3 space-y-2 rounded-lg bg-signal-danger-surface p-3 font-mono text-[11px] text-text-secondary">
                    {validation.issues.slice(0, 8).map((issue) => <li key={`${issue.path}-${issue.message}`}>{issue.path}: {issue.message}</li>)}
                  </ul>
                )}
              </section>

              <section aria-labelledby="studio-history-title" className="mt-7 border-t border-border-default/15 pt-6">
                <div className="flex items-center justify-between gap-3">
                  <h3 id="studio-history-title" className="flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-text-tertiary"><History aria-hidden="true" size={14} /> Riwayat lokal</h3>
                  <span className="font-interface text-xs text-text-tertiary">{persistence.snapshots.length} versi</span>
                </div>
                <p className="mt-2 font-interface text-xs leading-relaxed text-text-tertiary">Snapshot berada di browser ini. Pemulihan selalu membuat revisi baru.</p>
                {persistence.snapshots.length > 0 ? (
                  <ol className="mt-3 divide-y divide-border-default/15">
                    {persistence.snapshots.map((snapshot) => (
                      <li key={snapshot.snapshotId} className="py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-interface text-sm font-medium text-text-primary">Revisi {snapshot.revision} | {snapshotReason(snapshot.reason)}</p>
                            <p className="mt-0.5 font-interface text-xs text-text-tertiary">{formatSavedAt(snapshot.savedAt)}</p>
                          </div>
                          <button type="button" disabled={Boolean(persistence.conflict)} onClick={() => { setHasOperatorEdited(true); setView('write'); setToolsOpen(false); void persistence.restoreSnapshot(snapshot) }} className={`min-h-[44px] shrink-0 rounded-lg px-3 font-interface text-xs font-semibold text-interactive-primary hover:bg-signal-info-surface disabled:opacity-45 ${focusRing}`}>Pulihkan</button>
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : <p className="mt-3 font-interface text-sm text-text-secondary">Belum ada snapshot lokal.</p>}
              </section>

              <details className="mt-7 border-t border-border-default/15 pt-5">
                <summary className={`flex min-h-[44px] cursor-pointer list-none items-center font-interface text-sm font-medium text-text-secondary hover:text-text-primary ${focusRing}`}>Lihat canonical JSON</summary>
                <pre className="mt-2 max-h-[360px] overflow-auto rounded-lg bg-surface-inverse p-4 font-mono text-[10px] leading-relaxed text-text-on-inverse">{JSON.stringify(document, null, 2)}</pre>
              </details>

              <section aria-labelledby="studio-reset-title" className="mt-7 border-t border-border-default/15 pt-6">
                <h3 id="studio-reset-title" className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-text-tertiary">Mulai ulang</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={resetBlank} className={`inline-flex min-h-[44px] items-center gap-2 rounded-lg px-3 font-interface text-xs font-semibold text-text-secondary hover:bg-surface-sunken hover:text-text-primary ${focusRing}`}><RotateCcw aria-hidden="true" size={15} /> Naskah kosong</button>
                  {!production && <button type="button" onClick={resetFixture} className={`inline-flex min-h-[44px] items-center gap-2 rounded-lg px-3 font-interface text-xs font-semibold text-text-secondary hover:bg-surface-sunken hover:text-text-primary ${focusRing}`}><FileJson2 aria-hidden="true" size={15} /> Muat contoh blok</button>}
                </div>
                {!confirmDelete ? (
                  <button type="button" onClick={() => setConfirmDelete(true)} className={`mt-2 inline-flex min-h-[44px] items-center gap-2 rounded-lg px-3 font-interface text-xs font-semibold text-signal-danger hover:bg-signal-danger-surface ${focusRing}`}><Trash2 aria-hidden="true" size={15} /> Hapus simpanan lokal</button>
                ) : (
                  <div className="mt-3 rounded-xl bg-signal-danger-surface p-3">
                    <p className="font-interface text-xs leading-relaxed text-text-primary">Hapus draf, snapshot, dan antrean di perangkat ini? Versi server tidak ikut dihapus.</p>
                    <div className="mt-3 flex gap-2">
                      <button type="button" onClick={() => { void persistence.deleteLocalCopy().then(() => setConfirmDelete(false)) }} className={`min-h-[44px] rounded-lg bg-signal-danger px-3 font-interface text-xs font-semibold text-text-on-inverse ${focusRing}`}>Ya, hapus</button>
                      <button type="button" onClick={() => setConfirmDelete(false)} className={`min-h-[44px] rounded-lg px-3 font-interface text-xs font-semibold text-text-primary hover:bg-surface-elevated ${focusRing}`}>Batal</button>
                    </div>
                  </div>
                )}
              </section>
            </div>

            <footer className="border-t border-border-default/15 px-5 py-4">
              <p className="font-interface text-[11px] leading-relaxed text-text-tertiary">{production ? 'Perubahan publik selalu dibuat sebagai snapshot baru; versi lama tidak ditimpa.' : 'Studio Lab terisolasi dari artikel publik.'}</p>
            </footer>
          </aside>
        </div>
      )}

      {publishOpen && production && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4 sm:p-8">
          <button type="button" aria-label="Tutup pemeriksaan publikasi" onClick={() => setPublishOpen(false)} className="absolute inset-0 bg-surface-overlay/60" />
          <section role="dialog" aria-modal="true" aria-labelledby="studio-publish-title" className="relative z-base max-h-[min(760px,calc(100vh-32px))] w-full max-w-[620px] overflow-y-auto rounded-2xl border border-border-default/20 bg-surface-elevated p-5 shadow-lg sm:p-7">
            <header className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-text-tertiary">Pemeriksaan sebelum tayang</p>
                <h2 id="studio-publish-title" className="mt-2 font-display text-2xl font-semibold leading-heading text-text-primary">{isPublished ? 'Terbitkan pembaruan?' : 'Terbitkan artikel?'}</h2>
                <p className="mt-2 font-interface text-sm leading-relaxed text-text-secondary">Versi yang tersinkron akan menjadi snapshot publik baru. Publikasi yang sedang tayang tidak berubah jika proses gagal.</p>
              </div>
              <button type="button" aria-label="Tutup" onClick={() => setPublishOpen(false)} className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg hover:bg-surface-sunken ${focusRing}`}><X aria-hidden="true" size={19} /></button>
            </header>

            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <div className={`rounded-xl p-3 ${persistence.state === 'saved' ? 'bg-signal-success-surface' : 'bg-signal-warning-surface'}`}>
                <p className="flex items-center gap-2 font-interface text-xs font-semibold text-text-primary">{persistence.state === 'saved' ? <CheckCircle2 aria-hidden="true" className="text-signal-success" size={15} /> : <CircleAlert aria-hidden="true" className="text-signal-warning" size={15} />} Penyimpanan perangkat</p>
                <p className="mt-1 font-interface text-[11px] text-text-secondary">{persistence.state === 'saved' ? 'Perubahan lokal sudah aman.' : 'Simpan perubahan terlebih dahulu.'}</p>
              </div>
              <div className={`rounded-xl p-3 ${serverSync.state === 'synced' && serverSync.serverRevision ? 'bg-signal-success-surface' : 'bg-signal-warning-surface'}`}>
                <p className="flex items-center gap-2 font-interface text-xs font-semibold text-text-primary">{serverSync.state === 'synced' && serverSync.serverRevision ? <CheckCircle2 aria-hidden="true" className="text-signal-success" size={15} /> : <CircleAlert aria-hidden="true" className="text-signal-warning" size={15} />} Sinkronisasi server</p>
                <p className="mt-1 font-interface text-[11px] text-text-secondary">{serverSync.state === 'synced' && serverSync.serverRevision ? `Revisi ${serverSync.serverRevision} siap.` : 'Tunggu sampai status tersinkron.'}</p>
              </div>
            </div>

            <section aria-labelledby="studio-preflight-title" className="mt-6">
              <div className="flex items-center justify-between gap-3">
                <h3 id="studio-preflight-title" className="font-interface text-sm font-semibold text-text-primary">Preflight konten</h3>
                <span className={`rounded-full px-2 py-1 font-mono text-[9px] font-medium uppercase tracking-wider ${preflight.ok ? 'bg-signal-success-surface text-signal-success' : 'bg-signal-danger-surface text-signal-danger'}`}>{preflight.ok ? 'Lolos' : `${preflight.blockers.length} blocker`}</span>
              </div>

              {preflight.blockers.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {preflight.blockers.map((issue, index) => (
                    <li key={`${issue.code}-${index}`} className="flex items-start gap-2 rounded-lg bg-signal-danger-surface px-3 py-2.5 font-interface text-xs leading-relaxed text-text-primary"><CircleAlert aria-hidden="true" className="mt-0.5 shrink-0 text-signal-danger" size={14} /> {issue.message}</li>
                  ))}
                </ul>
              )}
              {preflight.warnings.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {preflight.warnings.map((issue, index) => (
                    <li key={`${issue.code}-${index}`} className="flex items-start gap-2 rounded-lg bg-signal-warning-surface px-3 py-2.5 font-interface text-xs leading-relaxed text-text-primary"><CircleAlert aria-hidden="true" className="mt-0.5 shrink-0 text-signal-warning" size={14} /> {issue.message}</li>
                  ))}
                </ul>
              )}
              {preflight.ok && preflight.warnings.length === 0 && <p className="mt-3 rounded-lg bg-signal-success-surface px-3 py-2.5 font-interface text-xs text-text-primary">Judul, slug, isi, dan seluruh blok produksi siap diterbitkan.</p>}
            </section>

            {publishError && <p role="alert" className="mt-4 rounded-lg bg-signal-danger-surface px-3 py-2.5 font-interface text-xs leading-relaxed text-signal-danger">{publishError}</p>}

            <footer className="mt-7 flex justify-end gap-2 border-t border-border-default/15 pt-5">
              <button type="button" onClick={() => setPublishOpen(false)} className={`min-h-[44px] rounded-lg px-4 font-interface text-sm font-semibold text-text-secondary hover:bg-surface-sunken ${focusRing}`}>Batal</button>
              <button
                type="button"
                disabled={publishing || persistence.state !== 'saved' || serverSync.state !== 'synced' || !serverSync.serverRevision || !preflight.ok}
                onClick={() => void publishArticle()}
                className={`inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-surface-inverse px-4 font-interface text-sm font-semibold text-text-on-inverse hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-35 ${focusRing}`}
              >
                <Send aria-hidden="true" size={16} /> {publishing ? 'Menerbitkan...' : isPublished ? 'Terbitkan pembaruan' : 'Terbitkan sekarang'}
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  )
}
