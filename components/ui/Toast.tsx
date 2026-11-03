'use client'

// Toast — umpan balik singkat setelah sebuah aksi (disimpan, tautan disalin, gagal).
// Dipasang sekali di layout lewat <ToastProvider>; dipanggil di mana saja lewat useToast().
// Aturan pakai: satu kalimat pendek, tanpa tanda seru; gagal = tone "danger" + cara mencoba lagi.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import Icon from './Icon'

type ToastTone = 'neutral' | 'success' | 'danger'

export type ToastInput = {
  message: string
  tone?: ToastTone
  // Tautan tindak lanjut, mis. { label: 'Lihat Daftar Bacaan', href: '/akun/bacaan' }
  action?: { label: string; href?: string; onClick?: () => void }
  // Milidetik; 0 = tetap sampai ditutup. Default 4000 (6000 untuk danger).
  duration?: number
}

type ToastItem = ToastInput & { id: number }

const MAX_VISIBLE = 3

const ToastContext = createContext<((toast: ToastInput) => void) | null>(null)

export function useToast(): (toast: ToastInput) => void {
  const push = useContext(ToastContext)
  if (!push) throw new Error('useToast harus dipakai di dalam <ToastProvider>')
  return push
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const nextId = useRef(1)
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>())

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id)
    if (timer) clearTimeout(timer)
    timers.current.delete(id)
    setItems((current) => current.filter((item) => item.id !== id))
  }, [])

  const push = useCallback(
    (toast: ToastInput) => {
      const id = nextId.current++
      setItems((current) => [...current, { ...toast, id }].slice(-MAX_VISIBLE))
      const duration = toast.duration ?? (toast.tone === 'danger' ? 6000 : 4000)
      if (duration > 0) timers.current.set(id, setTimeout(() => dismiss(id), duration))
    },
    [dismiss]
  )

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((timer) => clearTimeout(timer))
  }, [])

  const value = useMemo(() => push, [push])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="region"
        aria-label="Notifikasi"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-toast flex flex-col items-center gap-2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        {items.map((item) => (
          <ToastCard key={item.id} item={item} onDismiss={() => dismiss(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const tone = item.tone ?? 'neutral'
  const actionClass =
    'font-interface text-sm font-semibold underline underline-offset-4 decoration-paper/40 hover:decoration-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper'

  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className="toast-card pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-sm bg-ink px-4 py-3 text-paper shadow-lg"
    >
      {tone !== 'neutral' && (
        <Icon name={tone === 'success' ? 'circle-check' : 'warning'} size="md" className="shrink-0" />
      )}
      <p className="min-w-0 flex-1 font-interface text-sm leading-snug">{item.message}</p>
      {item.action &&
        (item.action.href ? (
          <Link href={item.action.href} onClick={onDismiss} className={actionClass}>
            {item.action.label}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => {
              item.action?.onClick?.()
              onDismiss()
            }}
            className={actionClass}
          >
            {item.action.label}
          </button>
        ))}
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Tutup notifikasi"
        className="-mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-paper/70 hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
      >
        <Icon name="close" size="sm" />
      </button>
    </div>
  )
}
