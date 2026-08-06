'use client'

import { useMemo, useState } from 'react'
import {
  CheckCircle2,
  CircleAlert,
  Cloud,
  CloudOff,
  Copy,
  FileJson2,
  FlaskConical,
  HardDrive,
  History,
  RefreshCw,
  RotateCcw,
  Save,
  Trash2,
  WifiOff,
} from 'lucide-react'
import type { StudioDocument, StudioJsonNode } from '@/lib/editorial-studio/document'
import {
  migrateStudioDocument,
  studioDocumentsEqual,
  validateStudioDocument,
} from '@/lib/editorial-studio/document'
import { editorialStudioFixture } from '@/lib/editorial-studio/fixture'
import type { StudioDraftContent, StudioSnapshotReason } from '@/lib/editorial-studio/persistence'
import StudioEditor from './StudioEditor'
import StudioRenderer from './StudioRenderer'
import { useStudioDraftPersistence } from './useStudioDraftPersistence'
import { useStudioServerSync } from './useStudioServerSync'

type LabView = 'write' | 'render'
type RoundTripState = 'idle' | 'passed' | 'failed'

function cloneFixture(): StudioDocument {
  return JSON.parse(JSON.stringify(editorialStudioFixture)) as StudioDocument
}

function countWords(node: StudioJsonNode): number {
  const ownWords = node.type === 'text'
    ? (node.text ?? '').trim().split(/\s+/).filter(Boolean).length
    : 0
  return ownWords + (node.content?.reduce((sum, child) => sum + countWords(child), 0) ?? 0)
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

export default function StudioLab() {
  const [document, setDocument] = useState<StudioDocument>(() => cloneFixture())
  const [title, setTitle] = useState('Membangun editor yang menjaga argumen dan bukti')
  const [deck, setDeck] = useState(
    'POC kontrak dokumen dan renderer baru Saintifiks—belum terhubung ke server atau publikasi.'
  )
  const [view, setView] = useState<LabView>('write')
  const [roundTripState, setRoundTripState] = useState<RoundTripState>('idle')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const validation = useMemo(() => validateStudioDocument(document), [document])
  const wordCount = useMemo(() => countWords(document.root), [document.root])
  const draftContent = useMemo<StudioDraftContent>(
    () => ({ title, deck, document }),
    [deck, document, title]
  )
  const persistence = useStudioDraftPersistence({
    content: draftContent,
    onRestore: handleRestore,
  })
  const serverSync = useStudioServerSync({
    documentId: document.documentId,
    hydrated: persistence.hydrated,
    online: persistence.online,
    lastLocalSavedAt: persistence.lastSavedAt,
    onAdoptServer: persistence.adoptServerVersion,
    onKeepLocalAsCopy: persistence.keepServerConflictAsCopy,
  })

  function handleRestore(restored: StudioDraftContent) {
    setTitle(restored.title)
    setDeck(restored.deck)
    setDocument(restored.document)
    setRoundTripState('idle')
  }

  function handleDocumentChange(nextDocument: StudioDocument) {
    setDocument(nextDocument)
    setRoundTripState('idle')
  }

  function testRoundTrip() {
    const serialized = JSON.stringify(document)
    const restored = migrateStudioDocument(JSON.parse(serialized))
    setRoundTripState(
      restored.ok && studioDocumentsEqual(document, restored.document) ? 'passed' : 'failed'
    )
  }

  function resetFixture() {
    handleRestore({
      title: 'Membangun editor yang menjaga argumen dan bukti',
      deck: 'POC kontrak dokumen dan renderer baru Saintifiks—belum terhubung ke server atau publikasi.',
      document: cloneFixture(),
    })
    setRoundTripState('idle')
  }

  const saveLabel = {
    loading: 'Menyiapkan penyimpanan perangkat…',
    idle: 'Belum disimpan di perangkat',
    dirty: 'Ada perubahan belum tersimpan',
    saving: 'Menyimpan ke perangkat…',
    saved: `Tersimpan di perangkat${persistence.lastSavedAt ? ` · ${formatSavedAt(persistence.lastSavedAt)}` : ''}`,
    error: 'Penyimpanan perangkat bermasalah',
    conflict: 'Autosave dijeda karena konflik antar-tab',
    unavailable: 'Penyimpanan perangkat tidak tersedia',
  }[persistence.state]

  const serverLabel = {
    idle: 'Belum ada status sinkronisasi perangkat ini',
    queued: 'Menunggu sinkronisasi server',
    syncing: 'Menyinkronkan ke server…',
    synced: `Tersinkron ke server${serverSync.lastSyncedAt ? ` · ${formatSavedAt(serverSync.lastSyncedAt)}` : ''}`,
    offline: 'Offline · sinkronisasi mengantre',
    conflict: 'Konflik dengan versi server',
    error: 'Sinkronisasi server tertunda',
  }[serverSync.state]

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-5 border-b border-border-default/20 pb-7 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <div className="mb-3 flex items-center gap-2 font-mono text-kicker uppercase tracking-[0.14em] text-text-tertiary">
            <FlaskConical aria-hidden="true" size={15} />
            Editorial Studio · Phase 2
          </div>
          <h1 className="font-display text-display-sm font-semibold leading-heading text-text-primary sm:text-display-base">
            Laboratorium kontrak editor
          </h1>
          <p className="mt-3 max-w-2xl font-interface text-sm leading-relaxed text-text-secondary">
            Menulis dengan autosave local-first, pemulihan, histori perangkat, dan antrean sinkronisasi
            revisi ke server. Belum ada kemampuan menerbitkan artikel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={!persistence.hydrated || Boolean(persistence.conflict) || !validation.ok || persistence.state === 'saving'}
            onClick={() => void persistence.saveNow()}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-interactive-primary px-4 py-2 font-interface text-sm font-semibold text-text-on-inverse hover:bg-interactive-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Save aria-hidden="true" size={17} />
            Simpan sekarang
          </button>
          <button
            type="button"
            onClick={testRoundTrip}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-border-default/25 bg-surface-elevated px-4 py-2 font-interface text-sm font-semibold text-text-primary hover:bg-surface-sunken/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary"
          >
            <FileJson2 aria-hidden="true" size={17} />
            Uji integritas JSON
          </button>
        </div>
      </header>

      <section aria-label="Status naskah" aria-live="polite" className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-border-default/15 bg-surface-elevated px-4 py-3 font-interface text-xs text-text-secondary">
        <span className="inline-flex items-center gap-1.5">
          {validation.ok ? (
            <CheckCircle2 aria-hidden="true" className="text-signal-success" size={15} />
          ) : (
            <CircleAlert aria-hidden="true" className="text-signal-danger" size={15} />
          )}
          {validation.ok ? 'Kontrak valid' : `${validation.issues.length} masalah kontrak`}
        </span>
        <span>{wordCount.toLocaleString('id-ID')} kata</span>
        <span>Skema v{document.schemaVersion}</span>
        <span className={`inline-flex items-center gap-1.5 font-medium ${
          persistence.state === 'saved'
            ? 'text-signal-success'
            : persistence.state === 'error' || persistence.state === 'conflict' || persistence.state === 'unavailable'
              ? 'text-signal-danger'
              : 'text-signal-warning'
        }`}>
          <HardDrive aria-hidden="true" size={14} />
          {saveLabel}
        </span>
        <span className={`inline-flex items-center gap-1.5 font-medium ${
          serverSync.state === 'synced'
            ? 'text-signal-success'
            : serverSync.state === 'conflict' || serverSync.state === 'error'
              ? 'text-signal-danger'
              : 'text-signal-warning'
        }`}>
          {serverSync.state === 'offline' ? (
            <CloudOff aria-hidden="true" size={14} />
          ) : (
            <Cloud aria-hidden="true" size={14} />
          )}
          {serverLabel}
        </span>
        {!persistence.online && (
          <span className="inline-flex items-center gap-1.5 font-medium text-signal-warning">
            <WifiOff aria-hidden="true" size={14} />
            Offline · penyimpanan perangkat tetap aktif
          </span>
        )}
        {roundTripState === 'passed' && (
          <span className="font-medium text-signal-success">Round-trip identik</span>
        )}
        {roundTripState === 'failed' && (
          <span className="font-medium text-signal-danger">Round-trip gagal</span>
        )}
      </section>

      {persistence.recoveredAt && (
        <section className="flex items-start gap-3 rounded-lg border border-signal-success/25 bg-signal-success-surface px-4 py-3 font-interface text-sm text-text-primary">
          <RefreshCw aria-hidden="true" className="mt-0.5 shrink-0 text-signal-success" size={17} />
          <p>
            Draf terakhir dari <strong>perangkat ini</strong> dipulihkan otomatis
            {' '}({formatSavedAt(persistence.recoveredAt)}).
          </p>
        </section>
      )}

      {persistence.otherTabOpen && !persistence.conflict && (
        <section className="rounded-lg border border-signal-warning/25 bg-signal-warning-surface px-4 py-3 font-interface text-sm text-text-primary">
          Naskah ini juga terbuka di tab lain. Perubahan aman selama hanya satu tab yang digunakan untuk menulis.
        </section>
      )}

      {persistence.conflict && (
        <section role="alert" aria-labelledby="studio-conflict-title" className="rounded-lg border border-signal-danger/30 bg-signal-danger-surface p-5">
          <h2 id="studio-conflict-title" className="font-interface text-sm font-semibold text-text-primary">
            Dua versi berubah bersamaan
          </h2>
          <p className="mt-2 max-w-2xl font-interface text-sm leading-relaxed text-text-secondary">
            Autosave dihentikan agar tidak menimpa pekerjaan. Muat versi terbaru dari tab lain, atau pertahankan
            versi di layar ini sebagai naskah terpisah.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void persistence.loadLatestAfterConflict()}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-interactive-primary px-4 py-2 font-interface text-sm font-semibold text-text-on-inverse hover:bg-interactive-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary"
            >
              <RefreshCw aria-hidden="true" size={16} />
              Muat versi terbaru
            </button>
            <button
              type="button"
              onClick={persistence.keepAsCopy}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-border-default/30 bg-surface-elevated px-4 py-2 font-interface text-sm font-semibold text-text-primary hover:bg-surface-sunken/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary"
            >
              <Copy aria-hidden="true" size={16} />
              Pertahankan sebagai salinan
            </button>
          </div>
        </section>
      )}

      {serverSync.conflict && !persistence.conflict && (
        <section role="alert" aria-labelledby="studio-server-conflict-title" className="rounded-lg border border-signal-danger/30 bg-signal-danger-surface p-5">
          <h2 id="studio-server-conflict-title" className="font-interface text-sm font-semibold text-text-primary">
            Naskah di perangkat dan server sama-sama berubah
          </h2>
          <p className="mt-2 max-w-2xl font-interface text-sm leading-relaxed text-text-secondary">
            Tidak ada versi yang ditimpa otomatis. Gunakan revisi server {serverSync.conflict.serverRevision},
            atau pertahankan isi di layar sebagai naskah baru dengan identitas terpisah.
          </p>
          {serverSync.errorMessage && (
            <p className="mt-3 font-interface text-sm font-medium text-signal-danger">
              {serverSync.errorMessage}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={serverSync.resolvingConflict}
              onClick={() => void serverSync.useServerVersion()}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-interactive-primary px-4 py-2 font-interface text-sm font-semibold text-text-on-inverse hover:bg-interactive-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary disabled:cursor-not-allowed disabled:opacity-45"
            >
              <RefreshCw aria-hidden="true" size={16} />
              Gunakan versi server
            </button>
            <button
              type="button"
              disabled={serverSync.resolvingConflict}
              onClick={() => void serverSync.keepLocalAsCopy()}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-border-default/30 bg-surface-elevated px-4 py-2 font-interface text-sm font-semibold text-text-primary hover:bg-surface-sunken/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Copy aria-hidden="true" size={16} />
              Pertahankan perangkat sebagai salinan
            </button>
          </div>
        </section>
      )}

      {serverSync.errorMessage && !serverSync.conflict && !persistence.conflict && (
        <section role="alert" className="flex flex-col gap-3 rounded-lg border border-signal-warning/30 bg-signal-warning-surface px-4 py-3 font-interface text-sm text-text-primary sm:flex-row sm:items-center sm:justify-between">
          <p>{serverSync.errorMessage}</p>
          <button
            type="button"
            onClick={serverSync.retryNow}
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-lg border border-border-default/30 bg-surface-elevated px-3 py-2 font-interface text-xs font-semibold text-text-primary hover:bg-surface-sunken/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary"
          >
            <RefreshCw aria-hidden="true" size={15} />
            Coba sinkron lagi
          </button>
        </section>
      )}

      {persistence.errorMessage && !persistence.conflict && (
        <section role="alert" className="rounded-lg border border-signal-danger/30 bg-signal-danger-surface px-4 py-3 font-interface text-sm text-text-primary">
          {persistence.errorMessage} Isi tetap berada di layar; salin naskah sebelum menutup tab bila masalah berlanjut.
        </section>
      )}

      <section aria-labelledby="article-identity-title" className="rounded-xl border border-border-default/20 bg-surface-elevated p-5 shadow-xs sm:p-7">
        <h2 id="article-identity-title" className="font-interface text-xs font-semibold uppercase tracking-wider text-text-tertiary">
          Identitas naskah
        </h2>
        <label className="mt-5 block">
          <span className="sr-only">Judul artikel</span>
          <textarea
            value={title}
            rows={2}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full resize-none border-0 bg-transparent p-0 font-display text-display-sm font-semibold leading-heading text-text-primary outline-none placeholder:text-text-tertiary focus:ring-0 sm:text-display-base"
            placeholder="Judul artikel"
          />
        </label>
        <label className="mt-3 block max-w-4xl">
          <span className="sr-only">Dek artikel</span>
          <textarea
            value={deck}
            rows={2}
            onChange={(event) => setDeck(event.target.value)}
            className="w-full resize-none border-0 bg-transparent p-0 font-body text-body-sm leading-deck text-text-secondary outline-none placeholder:text-text-tertiary focus:ring-0"
            placeholder="Ringkasan singkat artikel"
          />
        </label>
      </section>

      <div className="flex items-center justify-between gap-4">
        <div
          role="group"
          aria-label="Mode laboratorium editor"
          className="inline-flex rounded-lg bg-surface-sunken p-1 font-interface text-sm"
        >
          <button
            type="button"
            aria-pressed={view === 'write'}
            onClick={() => setView('write')}
            className={`min-h-[40px] rounded-md px-4 py-2 font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-interactive-primary ${
              view === 'write'
                ? 'bg-surface-elevated text-text-primary shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Tulis
          </button>
          <button
            type="button"
            aria-pressed={view === 'render'}
            onClick={() => setView('render')}
            className={`min-h-[40px] rounded-md px-4 py-2 font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-interactive-primary ${
              view === 'render'
                ? 'bg-surface-elevated text-text-primary shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Uji renderer
          </button>
        </div>
        <p className="hidden font-interface text-xs text-text-tertiary sm:block">
          Mode renderer memakai JSON yang sama—tanpa Markdown perantara.
        </p>
      </div>

      {view === 'write' ? (
        <div
          id="studio-panel-write"
          role="region"
          aria-label="Kanvas tulis"
          tabIndex={0}
        >
          <StudioEditor document={document} onChange={handleDocumentChange} />
        </div>
      ) : (
        <section
          id="studio-panel-render"
          role="region"
          aria-label="Hasil renderer"
          tabIndex={0}
          className="rounded-xl border border-border-default/20 bg-surface-elevated px-5 py-10 shadow-xs sm:px-9 lg:px-14 lg:py-14"
        >
          <header className="mx-auto mb-10 max-w-content border-b border-border-default/20 pb-8">
            <p className="font-mono text-kicker uppercase tracking-[0.14em] text-text-tertiary">
              Prototipe artikel
            </p>
            <h1 className="mt-3 font-display text-display-sm font-semibold leading-heading sm:text-display-base">
              {title || 'Tanpa judul'}
            </h1>
            {deck && <p className="mt-4 font-body text-body-sm leading-deck text-text-secondary">{deck}</p>}
          </header>
          <StudioRenderer document={document} />
        </section>
      )}

      {!validation.ok && (
        <section aria-labelledby="validation-title" className="rounded-lg border border-signal-danger/30 bg-signal-danger-surface p-5">
          <h2 id="validation-title" className="font-interface text-sm font-semibold">
            Masalah kontrak
          </h2>
          <ul className="mt-3 space-y-2 font-mono text-xs text-text-secondary">
            {validation.issues.slice(0, 8).map((issue) => (
              <li key={`${issue.path}-${issue.message}`}>
                {issue.path}: {issue.message}
              </li>
            ))}
          </ul>
        </section>
      )}

      <details className="rounded-lg border border-border-default/15 bg-surface-elevated">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 font-interface text-sm font-medium text-text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary">
          <History aria-hidden="true" size={16} />
          Riwayat lokal ({persistence.snapshots.length})
        </summary>
        <div className="border-t border-border-default/15 p-4 sm:p-5">
          <p className="max-w-2xl font-interface text-xs leading-relaxed text-text-tertiary">
            Snapshot disimpan hanya di browser dan dibatasi 50 versi per naskah. Memulihkan versi lama selalu
            membuat revisi baru; histori yang ada tidak ditulis ulang.
          </p>
          {persistence.snapshots.length > 0 ? (
            <ol className="mt-4 divide-y divide-border-default/15">
              {persistence.snapshots.map((snapshot) => (
                <li key={snapshot.snapshotId} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-interface text-sm font-medium text-text-primary">
                      Revisi {snapshot.revision} · {snapshotReason(snapshot.reason)}
                    </p>
                    <p className="mt-0.5 font-interface text-xs text-text-tertiary">
                      {formatSavedAt(snapshot.savedAt)} · {snapshot.title || 'Tanpa judul'}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={Boolean(persistence.conflict)}
                    onClick={() => {
                      setView('write')
                      void persistence.restoreSnapshot(snapshot)
                    }}
                    className="inline-flex min-h-[40px] shrink-0 items-center justify-center rounded-lg border border-border-default/25 px-3 py-2 font-interface text-xs font-semibold text-text-primary hover:bg-surface-sunken/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Pulihkan versi ini
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-4 font-interface text-sm text-text-secondary">
              Snapshot pertama dibuat saat autosave pertama berhasil.
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border-default/15 pt-4">
            <button
              type="button"
              onClick={resetFixture}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg px-3 py-2 font-interface text-sm font-medium text-text-secondary hover:bg-surface-sunken/60 hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary"
            >
              <RotateCcw aria-hidden="true" size={16} />
              Muat contoh awal
            </button>
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg px-3 py-2 font-interface text-sm font-medium text-signal-danger hover:bg-signal-danger-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-danger"
              >
                <Trash2 aria-hidden="true" size={16} />
                Hapus simpanan lokal
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2 rounded-lg bg-signal-danger-surface p-2">
                <span className="max-w-xl px-2 font-interface text-xs leading-relaxed text-text-primary">
                  Hapus draf, snapshot, dan antrean di perangkat ini? Versi server tidak ikut dihapus;
                  perubahan yang belum tersinkron tidak dapat dipulihkan dari server.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    void persistence.deleteLocalCopy().then(() => setConfirmDelete(false))
                  }}
                  className="min-h-[40px] rounded-lg bg-signal-danger px-3 py-2 font-interface text-xs font-semibold text-text-on-inverse focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-danger"
                >
                  Ya, hapus
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="min-h-[40px] rounded-lg px-3 py-2 font-interface text-xs font-semibold text-text-primary hover:bg-surface-elevated focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary"
                >
                  Batal
                </button>
              </div>
            )}
          </div>
        </div>
      </details>

      <details className="rounded-lg border border-border-default/15 bg-surface-elevated">
        <summary className="cursor-pointer px-4 py-3 font-interface text-sm font-medium text-text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary">
          Inspeksi canonical JSON
        </summary>
        <pre className="max-h-[520px] overflow-auto border-t border-border-default/15 bg-surface-inverse p-5 font-mono text-xs leading-relaxed text-text-on-inverse">
          {JSON.stringify(document, null, 2)}
        </pre>
      </details>
    </div>
  )
}
