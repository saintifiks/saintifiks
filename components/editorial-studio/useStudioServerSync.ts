'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  acknowledgeStudioMutation,
  getStudioDraft,
  getStudioOutbox,
  markStudioOutboxAttempt,
} from '@/lib/editorial-studio/persistence'
import {
  parseStudioSyncResponse,
  studioSyncRequestFromOutbox,
  type StudioServerDraft,
} from '@/lib/editorial-studio/sync-contract'

export type StudioServerSyncState =
  | 'idle'
  | 'queued'
  | 'syncing'
  | 'synced'
  | 'offline'
  | 'conflict'
  | 'error'

type UseStudioServerSyncOptions = {
  documentId: string
  hydrated: boolean
  online: boolean
  lastLocalSavedAt: string | null
  onAdoptServer: (draft: StudioServerDraft) => Promise<void>
  onKeepLocalAsCopy: () => Promise<void>
}

const RETRY_DELAY_MS = 15_000

export function useStudioServerSync({
  documentId,
  hydrated,
  online,
  lastLocalSavedAt,
  onAdoptServer,
  onKeepLocalAsCopy,
}: UseStudioServerSyncOptions) {
  const [state, setState] = useState<StudioServerSyncState>('idle')
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [conflict, setConflict] = useState<StudioServerDraft | null>(null)
  const [resolvingConflict, setResolvingConflict] = useState(false)
  const [retrySignal, setRetrySignal] = useState(0)

  const inFlightRef = useRef(false)
  const conflictRef = useRef(false)
  const resolvingConflictRef = useRef(false)
  const retryableRef = useRef(false)
  const currentDocumentIdRef = useRef(documentId)
  currentDocumentIdRef.current = documentId

  const drainOutbox = useCallback(async () => {
    if (!hydrated || inFlightRef.current || conflictRef.current) return
    const requestedDocumentId = documentId
    inFlightRef.current = true

    try {
      const pending = await getStudioOutbox(requestedDocumentId)
      if (currentDocumentIdRef.current !== requestedDocumentId) return

      if (!pending) {
        const draft = await getStudioDraft(requestedDocumentId)
        if (currentDocumentIdRef.current !== requestedDocumentId) return
        setLastSyncedAt(draft?.lastSyncedAt ?? null)
        setState(draft?.serverRevision ? 'synced' : 'idle')
        setErrorMessage(null)
        retryableRef.current = false
        return
      }

      if (!online) {
        setState('offline')
        setErrorMessage(null)
        retryableRef.current = false
        return
      }

      setState('syncing')
      setErrorMessage(null)
      await markStudioOutboxAttempt(requestedDocumentId, pending.mutationId, null)

      const response = await fetch('/api/admin/editorial-studio/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify(studioSyncRequestFromOutbox(pending)),
      })
      const rawResponse: unknown = await response.json().catch(() => null)
      const parsedResponse = parseStudioSyncResponse(rawResponse)

      if (currentDocumentIdRef.current !== requestedDocumentId) return
      if (response.status === 409 && parsedResponse?.status === 'conflict') {
        if (parsedResponse.serverDraft.document.documentId !== requestedDocumentId) {
          const message = 'Identitas draf konflik dari server tidak cocok.'
          await markStudioOutboxAttempt(requestedDocumentId, pending.mutationId, message, {
            incrementAttempt: false,
          })
          setState('error')
          setErrorMessage(`${message} Salinan perangkat dipertahankan.`)
          retryableRef.current = false
          return
        }
        conflictRef.current = true
        setConflict(parsedResponse.serverDraft)
        setState('conflict')
        setErrorMessage(null)
        retryableRef.current = false
        return
      }
      if (response.status === 409 && parsedResponse?.status === 'missing') {
        await markStudioOutboxAttempt(requestedDocumentId, pending.mutationId, parsedResponse.message, {
          incrementAttempt: false,
        })
        setState('error')
        setErrorMessage(parsedResponse.message)
        retryableRef.current = false
        return
      }
      if (!response.ok || !parsedResponse) {
        const responseError =
          rawResponse && typeof rawResponse === 'object' && 'error' in rawResponse
            && typeof rawResponse.error === 'string'
            ? rawResponse.error
            : 'Server belum dapat menerima draf.'
        await markStudioOutboxAttempt(requestedDocumentId, pending.mutationId, responseError, {
          incrementAttempt: false,
        })
        setState('error')
        setErrorMessage(`${responseError} Salinan perangkat tetap tersimpan.`)
        retryableRef.current = response.status >= 500
        return
      }
      if (parsedResponse.status !== 'accepted' && parsedResponse.status !== 'duplicate') {
        setState('error')
        setErrorMessage('Respons sinkronisasi tidak dapat diverifikasi. Salinan perangkat dipertahankan.')
        retryableRef.current = false
        return
      }
      if (parsedResponse.documentId !== requestedDocumentId) {
        setState('error')
        setErrorMessage('Identitas draf dari server tidak cocok. Salinan perangkat dipertahankan.')
        retryableRef.current = false
        return
      }

      await acknowledgeStudioMutation(
        requestedDocumentId,
        pending.mutationId,
        parsedResponse.serverRevision,
        parsedResponse.serverFingerprint,
        parsedResponse.syncedAt
      )
      setConflict(null)
      setLastSyncedAt(parsedResponse.syncedAt)
      setState('synced')
      setErrorMessage(null)
      retryableRef.current = false
      window.setTimeout(() => setRetrySignal((value) => value + 1), 0)
    } catch (error) {
      if (currentDocumentIdRef.current !== requestedDocumentId) return
      const message = error instanceof Error ? error.message : 'Sinkronisasi server gagal.'
      const [pending, draft] = await Promise.all([
        getStudioOutbox(requestedDocumentId).catch(() => null),
        getStudioDraft(requestedDocumentId).catch(() => null),
      ])
      if (!pending && !draft) {
        setState('idle')
        setLastSyncedAt(null)
        setErrorMessage(null)
        retryableRef.current = false
        return
      }
      if (pending) {
        await markStudioOutboxAttempt(requestedDocumentId, pending.mutationId, message, {
          incrementAttempt: false,
        }).catch(() => undefined)
      }
      setState(online ? 'error' : 'offline')
      setErrorMessage(online ? `${message} Salinan perangkat tetap tersimpan.` : null)
      retryableRef.current = online
    } finally {
      inFlightRef.current = false
    }
  }, [documentId, hydrated, online])

  useEffect(() => {
    setConflict(null)
    conflictRef.current = false
    resolvingConflictRef.current = false
    setResolvingConflict(false)
    setErrorMessage(null)
    setLastSyncedAt(null)
    setState(hydrated ? 'queued' : 'idle')
  }, [documentId, hydrated])

  useEffect(() => {
    void drainOutbox()
  }, [drainOutbox, lastLocalSavedAt, retrySignal])

  useEffect(() => {
    if (state !== 'error' || !retryableRef.current || !online) return
    const timeout = window.setTimeout(() => setRetrySignal((value) => value + 1), RETRY_DELAY_MS)
    return () => window.clearTimeout(timeout)
  }, [online, state])

  const retryNow = useCallback(() => {
    retryableRef.current = true
    conflictRef.current = false
    setConflict(null)
    setState(online ? 'queued' : 'offline')
    setRetrySignal((value) => value + 1)
  }, [online])

  const useServerVersion = useCallback(async () => {
    if (!conflict || resolvingConflictRef.current) return
    resolvingConflictRef.current = true
    setResolvingConflict(true)
    try {
      await onAdoptServer(conflict)
      conflictRef.current = false
      setConflict(null)
      setLastSyncedAt(conflict.syncedAt)
      setErrorMessage(null)
      setState('synced')
      setRetrySignal((value) => value + 1)
    } catch {
      setErrorMessage('Versi server belum dapat dipulihkan ke perangkat. Tidak ada versi yang ditimpa.')
      setState('conflict')
    } finally {
      resolvingConflictRef.current = false
      setResolvingConflict(false)
    }
  }, [conflict, onAdoptServer])

  const keepLocalAsCopy = useCallback(async () => {
    if (resolvingConflictRef.current) return
    resolvingConflictRef.current = true
    setResolvingConflict(true)
    try {
      await onKeepLocalAsCopy()
      conflictRef.current = false
      setConflict(null)
      setLastSyncedAt(null)
      setErrorMessage(null)
      setState('queued')
    } catch {
      setErrorMessage('Salinan baru belum dapat dibuat. Draf perangkat dan antreannya tetap dipertahankan.')
      setState('conflict')
    } finally {
      resolvingConflictRef.current = false
      setResolvingConflict(false)
    }
  }, [onKeepLocalAsCopy])

  return {
    state,
    lastSyncedAt,
    errorMessage,
    conflict,
    resolvingConflict,
    retryNow,
    useServerVersion,
    keepLocalAsCopy,
  }
}
