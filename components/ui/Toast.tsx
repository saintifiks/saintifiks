'use client'

// Toast — "keping" tinta yang muncul dari tepi bawah setelah sebuah aksi.
// Susunan: label kecil (apa yang terjadi) · kalimat pendek dalam serif · tindakan lanjutan · tutup.
// Sisa waktu terlihat sebagai garis tipis yang menyusut di tepi bawah; kursor di atasnya menjeda.
// Gagal = garis merah di tepi kiri (bukan latar merah). Satu kalimat, tanpa tanda seru.
//
// Pasang sekali di layout lewat <ToastProvider>; panggil di mana saja lewat useToast().

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import Icon from './Icon'

type ToastTone = 'neutral' | 'success' | 'danger'

export type ToastInput = {
  message: string
  tone?: ToastTone
  // Label kecil di atas kalimat. Default mengikuti tone: Info / Tersimpan / Gagal.
  label?: string
  // Tautan tindak lanjut, mis. { label: 'Lihat Daftar Bacaan', href: '/akun/bacaan' }
  action?: { label: string; href?: string; onClick?: () => void }
  // Milidetik; 0 = tetap sampai ditutup. Default 4000 (7000 untuk danger).
  duration?: number
}

type ToastItem = ToastInput & { id: number }

const MAX_VISIBLE = 3
const defaultLabel: Record<ToastTone, string> = { neutral: 'Info', success: 'Tersimpan', danger: 'Gagal' }

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
      const duration = toast.duration ?? (toast.tone === 'danger' ? 7000 : 4000)
      setItems((current) => [...current, { ...toast, duration, id }].slice(-MAX_VISIBLE))
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
        className="pointer-events-none fixed inset-x-0 bottom-0 z-toast flex flex-col items-stretch gap-2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-start sm:px-8 sm:pb-8"
      >
        {items.map((item) => (
          <ToastView key={item.id} item={item} onDismiss={() => dismiss(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// Tampilan murni (tanpa timer) — dipakai Provider dan halaman sistem desain.
export function ToastView({
  item,
  onDismiss,
  live = true,
}: {
  item: ToastInput & { id?: number }
  onDismiss?: () => void
  // false = tanpa animasi masuk/garis waktu (untuk contoh statis)
  live?: boolean
}) {
  const tone = item.tone ?? 'neutral'
  const duration = item.duration ?? 4000
  const actionClass =
    'rise inline-flex min-h-[36px] shrink-0 items-center gap-2 px-3 font-interface text-caption font-semibold uppercase tracking-widest [--rise-fill:var(--color-paper)] [--rise-text:var(--color-ink)] text-paper'

  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={[
        'pointer-events-auto relative flex w-full max-w-lg items-stretch overflow-hidden rounded-none bg-night text-paper shadow-lg',
        live ? 'toast-card' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {tone === 'danger' && <span aria-hidden="true" className="w-1 shrink-0 bg-signal-danger" />}
      <div className="flex min-w-0 flex-1 items-center gap-4 py-3 pl-4 pr-2">
        <div className="min-w-0 flex-1">
          <p className="font-interface text-kicker font-semibold uppercase tracking-widest text-paper/60">
            {item.label ?? defaultLabel[tone]}
          </p>
          <p className="mt-1 font-display text-sm leading-snug">{item.message}</p>
        </div>
        {item.action &&
          (item.action.href ? (
            <Link href={item.action.href} onClick={onDismiss} className={actionClass}>
              {item.action.label}
              <Icon name="arrow-right" size="sm" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                item.action?.onClick?.()
                onDismiss?.()
              }}
              className={actionClass}
            >
              {item.action.label}
              <Icon name="arrow-right" size="sm" />
            </button>
          ))}
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Tutup notifikasi"
          className="flex h-9 w-9 shrink-0 items-center justify-center text-paper/60 transition-colors duration-moderate hover:text-paper"
        >
          <Icon name="close" size="sm" />
        </button>
      </div>
      {live && duration > 0 && (
        <span
          aria-hidden="true"
          style={{ ['--toast-duration' as string]: `${duration}ms` }}
          className="toast-bar absolute inset-x-0 bottom-0 h-px bg-paper/70"
        />
      )}
    </div>
  )
}
