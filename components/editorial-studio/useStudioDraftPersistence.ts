'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createStudioId, validateStudioDocument } from '@/lib/editorial-studio/document'
import {
  STUDIO_AUTOSAVE_DELAY_MS,
  StudioDraftConflictError,
  adoptStudioServerDraft,
  deleteStudioDraft,
  discardStudioOutbox,
  fingerprintStudioDraft,
  getStudioDraft,
  listStudioSnapshots,
  saveStudioDraft,
  type StudioDraftContent,
  type StudioDraftRecord,
  type StudioDraftSnapshot,
  type StudioSaveReason,
} from '@/lib/editorial-studio/persistence'
import type { StudioServerDraft } from '@/lib/editorial-studio/sync-contract'

export type StudioPersistenceState =
  | 'loading'
  | 'idle'
  | 'dirty'
  | 'saving'
  | 'saved'
  | 'error'
  | 'conflict'
  | 'unavailable'

type UseStudioDraftPersistenceOptions = {
  content: StudioDraftContent
  onRestore: (content: StudioDraftContent) => void
}

type StudioChannelMessage =
  | { type: 'hello'; writerId: string }
  | { type: 'present'; writerId: string }
  | { type: 'leaving'; writerId: string }
  | { type: 'saved'; writerId: string; revision: number }

function copyDocument(content: StudioDraftContent): StudioDraftContent['document'] {
  return {
    ...content.document,
    documentId: createStudioId('document'),
    ...(content.document.article ? {
      article: {
        ...content.document.article,
        articleId: null,
        slug: '',
      },
    } : {}),
  }
}

function writerId() {
  return `writer-${createStudioId('document')}`
}

export function useStudioDraftPersistence({
  content,
  onRestore,
}: UseStudioDraftPersistenceOptions) {
  const [state, setState] = useState<StudioPersistenceState>('loading')
  const [hydrated, setHydrated] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [recoveredAt, setRecoveredAt] = useState<string | null>(null)
  const [snapshots, setSnapshots] = useState<StudioDraftSnapshot[]>([])
  const [conflict, setConflict] = useState<StudioDraftRecord | null>(null)
  const [otherTabOpen, setOtherTabOpen] = useState(false)
  const [online, setOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const writerIdRef = useRef(writerId())
  const latestContentRef = useRef(content)
  const onRestoreRef = useRef(onRestore)
  const revisionRef = useRef<number | null>(null)
  const fingerprintRef = useRef<string | null>(null)
  const channelRef = useRef<BroadcastChannel | null>(null)
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve())
  const suppressNextAutosaveRef = useRef(false)

  latestContentRef.current = content
  onRestoreRef.current = onRestore

  const refreshSnapshots = useCallback(async (documentId: string) => {
    try {
      const nextSnapshots = await listStudioSnapshots(documentId, 20)
      setSnapshots(nextSnapshots)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? `Draf tersimpan, tetapi riwayat lokal gagal dibaca: ${error.message}`
          : 'Draf tersimpan, tetapi riwayat lokal gagal dibaca.'
      )
    }
  }, [])

  const applyRecord = useCallback(
    async (record: StudioDraftRecord, options: { recovered?: boolean } = {}) => {
      revisionRef.current = record.revision
      fingerprintRef.current = record.fingerprint
      setLastSavedAt(record.savedAt)
      setErrorMessage(null)
      setConflict(null)
      setState('saved')
      if (options.recovered) setRecoveredAt(record.savedAt)
      suppressNextAutosaveRef.current = true
      onRestoreRef.current({
        title: record.title,
        deck: record.deck,
        document: record.document,
      })
      await refreshSnapshots(record.documentId)
    },
    [refreshSnapshots]
  )

  const executeSave = useCallback(
    async (reason: StudioSaveReason, contentOverride?: StudioDraftContent) => {
      const draftContent = contentOverride ?? latestContentRef.current
      if (!validateStudioDocument(draftContent.document).ok) {
        setState('error')
        setErrorMessage('Dokumen belum valid, sehingga autosave dihentikan.')
        return
      }

      const nextFingerprint = await fingerprintStudioDraft(draftContent)
      if (reason === 'autosave' && nextFingerprint === fingerprintRef.current) {
        setState('saved')
        return
      }

      setState('saving')
      setErrorMessage(null)
      try {
        const expectedRevision =
          draftContent.document.documentId === content.document.documentId
            ? revisionRef.current
            : null
        const result = await saveStudioDraft(draftContent, {
          writerId: writerIdRef.current,
          expectedRevision,
          reason,
        })
        revisionRef.current = result.record.revision
        fingerprintRef.current = result.record.fingerprint
        setLastSavedAt(result.record.savedAt)
        setRecoveredAt(null)
        setConflict(null)
        setState('saved')
        if (result.snapshotCreated) await refreshSnapshots(result.record.documentId)
        channelRef.current?.postMessage({
          type: 'saved',
          writerId: writerIdRef.current,
          revision: result.record.revision,
        } satisfies StudioChannelMessage)
      } catch (error) {
        if (error instanceof StudioDraftConflictError) {
          setConflict(error.latestRecord)
          setState('conflict')
          setErrorMessage('Tab lain menyimpan revisi yang lebih baru. Autosave dihentikan sementara.')
          return
        }
        setState(typeof indexedDB === 'undefined' ? 'unavailable' : 'error')
        setErrorMessage(error instanceof Error ? error.message : 'Penyimpanan lokal gagal.')
      }
    },
    [content.document.documentId, refreshSnapshots]
  )

  const queueSave = useCallback(
    (reason: StudioSaveReason, contentOverride?: StudioDraftContent) => {
      const task = saveQueueRef.current.then(() => executeSave(reason, contentOverride))
      saveQueueRef.current = task.catch(() => undefined)
      return task
    },
    [executeSave]
  )

  const saveNow = useCallback(() => queueSave('manual'), [queueSave])

  useEffect(() => {
    let cancelled = false
    const documentId = content.document.documentId
    setHydrated(false)
    setState('loading')
    setConflict(null)
    setOtherTabOpen(false)
    setErrorMessage(null)
    setRecoveredAt(null)
    revisionRef.current = null
    fingerprintRef.current = null

    async function hydrate() {
      try {
        const existing = await getStudioDraft(documentId)
        if (cancelled) return
        if (existing) {
          await applyRecord(existing, { recovered: true })
        } else {
          setSnapshots([])
          setLastSavedAt(null)
          setState('idle')
        }
      } catch (error) {
        if (cancelled) return
        setState(typeof indexedDB === 'undefined' ? 'unavailable' : 'error')
        setErrorMessage(error instanceof Error ? error.message : 'Penyimpanan lokal gagal dibuka.')
      } finally {
        window.setTimeout(() => {
          if (!cancelled) setHydrated(true)
        }, 0)
      }
    }

    void hydrate()
    return () => {
      cancelled = true
    }
  }, [applyRecord, content.document.documentId])

  useEffect(() => {
    if (!hydrated || conflict) return
    if (suppressNextAutosaveRef.current) {
      suppressNextAutosaveRef.current = false
      return
    }
    setState('dirty')
    const timeout = window.setTimeout(() => {
      void queueSave('autosave')
    }, STUDIO_AUTOSAVE_DELAY_MS)
    return () => window.clearTimeout(timeout)
  }, [conflict, content, hydrated, queueSave])

  useEffect(() => {
    function updateOnlineState() {
      setOnline(navigator.onLine)
    }
    window.addEventListener('online', updateOnlineState)
    window.addEventListener('offline', updateOnlineState)
    return () => {
      window.removeEventListener('online', updateOnlineState)
      window.removeEventListener('offline', updateOnlineState)
    }
  }, [])

  useEffect(() => {
    function handleSaveShortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        void saveNow()
      }
    }
    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden' && hydrated && !conflict) {
        void queueSave('autosave')
      }
    }
    window.addEventListener('keydown', handleSaveShortcut, { capture: true })
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      window.removeEventListener('keydown', handleSaveShortcut, { capture: true })
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [conflict, hydrated, queueSave, saveNow])

  useEffect(() => {
    if (!hydrated || typeof BroadcastChannel === 'undefined') return
    const documentId = content.document.documentId
    const currentWriterId = writerIdRef.current
    const channel = new BroadcastChannel(`saintifiks-studio:${documentId}`)
    channelRef.current = channel

    async function handleRemoteSave(message: Extract<StudioChannelMessage, { type: 'saved' }>) {
      if (message.writerId === currentWriterId || message.revision <= (revisionRef.current ?? 0)) return
      try {
        const latest = await getStudioDraft(documentId)
        if (!latest || latest.revision <= (revisionRef.current ?? 0)) return
        const currentFingerprint = await fingerprintStudioDraft(latestContentRef.current)
        if (currentFingerprint === fingerprintRef.current) {
          await applyRecord(latest)
        } else {
          setConflict(latest)
          setState('conflict')
          setErrorMessage('Ada perubahan baru dari tab lain dan versi ini juga telah berubah.')
        }
      } catch (error) {
        setState('error')
        setErrorMessage(error instanceof Error ? error.message : 'Revisi tab lain gagal dibaca.')
      }
    }

    channel.onmessage = (event: MessageEvent<StudioChannelMessage>) => {
      const message = event.data
      if (!message || message.writerId === currentWriterId) return
      if (message.type === 'hello') {
        setOtherTabOpen(true)
        channel.postMessage({ type: 'present', writerId: currentWriterId } satisfies StudioChannelMessage)
      } else if (message.type === 'present') {
        setOtherTabOpen(true)
      } else if (message.type === 'leaving') {
        setOtherTabOpen(false)
      } else if (message.type === 'saved') {
        void handleRemoteSave(message)
      }
    }

    channel.postMessage({ type: 'hello', writerId: currentWriterId } satisfies StudioChannelMessage)
    return () => {
      channel.postMessage({ type: 'leaving', writerId: currentWriterId } satisfies StudioChannelMessage)
      channel.close()
      if (channelRef.current === channel) channelRef.current = null
    }
  }, [applyRecord, content.document.documentId, hydrated])

  const loadLatestAfterConflict = useCallback(async () => {
    try {
      const latest = conflict ?? (await getStudioDraft(content.document.documentId))
      if (!latest) return
      await applyRecord(latest)
    } catch (error) {
      setState('error')
      setErrorMessage(error instanceof Error ? error.message : 'Versi terbaru gagal dimuat.')
    }
  }, [applyRecord, conflict, content.document.documentId])

  const keepAsCopy = useCallback(() => {
    const current = latestContentRef.current
    const copy: StudioDraftContent = {
      ...current,
      title: current.title ? `${current.title} — salinan` : 'Naskah tanpa judul — salinan',
      document: copyDocument(current),
    }
    setConflict(null)
    setState('dirty')
    onRestoreRef.current(copy)
  }, [])

  const adoptServerVersion = useCallback(
    async (serverDraft: StudioServerDraft) => {
      try {
        const record = await adoptStudioServerDraft(
          {
            title: serverDraft.title,
            deck: serverDraft.deck,
            document: serverDraft.document,
          },
          serverDraft.serverRevision,
          serverDraft.serverFingerprint,
          serverDraft.syncedAt,
          writerIdRef.current,
          revisionRef.current
        )
        await applyRecord(record)
      } catch (error) {
        if (error instanceof StudioDraftConflictError) {
          setConflict(error.latestRecord)
          setState('conflict')
          setErrorMessage('Tab lain menyimpan revisi baru saat konflik server sedang diselesaikan.')
        } else {
          setState('error')
          setErrorMessage(error instanceof Error ? error.message : 'Versi server gagal dipulihkan.')
        }
        throw error
      }
    },
    [applyRecord]
  )

  const keepServerConflictAsCopy = useCallback(async () => {
    const current = latestContentRef.current
    try {
      await discardStudioOutbox(current.document.documentId, revisionRef.current)
    } catch (error) {
      if (error instanceof StudioDraftConflictError) {
        setConflict(error.latestRecord)
        setState('conflict')
        setErrorMessage('Tab lain menyimpan revisi baru saat salinan sedang dibuat.')
      }
      throw error
    }
    const copy: StudioDraftContent = {
      ...current,
      title: current.title ? `${current.title} — salinan` : 'Naskah tanpa judul — salinan',
      document: copyDocument(current),
    }
    setState('dirty')
    setErrorMessage(null)
    onRestoreRef.current(copy)
  }, [])

  const restoreSnapshot = useCallback(
    async (snapshot: StudioDraftSnapshot) => {
      const restoredContent: StudioDraftContent = {
        title: snapshot.title,
        deck: snapshot.deck,
        document: snapshot.document,
      }
      latestContentRef.current = restoredContent
      onRestoreRef.current(restoredContent)
      await queueSave('restore', restoredContent)
    },
    [queueSave]
  )

  const deleteLocalCopy = useCallback(async () => {
    try {
      await deleteStudioDraft(content.document.documentId)
      revisionRef.current = null
      fingerprintRef.current = null
      setSnapshots([])
      setLastSavedAt(null)
      setRecoveredAt(null)
      setConflict(null)
      setErrorMessage(null)
      setState('idle')
    } catch (error) {
      setState('error')
      setErrorMessage(error instanceof Error ? error.message : 'Simpanan lokal gagal dihapus.')
    }
  }, [content.document.documentId])

  return {
    state,
    hydrated,
    online,
    lastSavedAt,
    recoveredAt,
    snapshots,
    conflict,
    otherTabOpen,
    errorMessage,
    saveNow,
    restoreSnapshot,
    loadLatestAfterConflict,
    keepAsCopy,
    adoptServerVersion,
    keepServerConflictAsCopy,
    deleteLocalCopy,
  }
}
