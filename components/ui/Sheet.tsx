'use client'

// Sheet — panel modal. Desktop (≥1024px): panel di sisi kanan setinggi layar. Ponsel: naik dari bawah,
// maksimal 85% tinggi layar. Sudut tajam, garis tipis, tanpa pegangan dekoratif.
// Fokus dikunci di dalam panel, Escape menutup, fokus kembali ke tombol pemicu.

import { useId, type ReactNode } from 'react'
import { useModalDialog } from '@/lib/use-modal-dialog'
import IconButton from './IconButton'

export type SheetProps = {
  open: boolean
  onClose: () => void
  title: string
  // Teks kecil di samping judul, mis. jumlah komentar
  meta?: ReactNode
  children: ReactNode
  // Bagian yang menempel di dasar panel (mis. formulir komentar)
  footer?: ReactNode
}

export default function Sheet({ open, onClose, title, meta, children, footer }: SheetProps) {
  const titleId = useId()
  const { dialogRef, initialFocusRef } = useModalDialog({ isOpen: open, onClose })

  if (!open) return null

  return (
    <div className="fixed inset-0 z-modal">
      <div className="sheet-backdrop absolute inset-0 bg-night/50" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="sheet-panel absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col border-t border-border-default/30 bg-surface-page lg:inset-y-0 lg:left-auto lg:right-0 lg:max-h-none lg:w-[28rem] lg:border-l lg:border-t-0"
      >
        <div className="flex items-center justify-between border-b border-border-default/20 py-1 pl-5 pr-1">
          <div className="flex items-baseline gap-3">
            <h2 id={titleId} className="font-display text-lg font-bold text-text-primary">
              {title}
            </h2>
            {meta && <span className="font-mono text-caption text-text-secondary">{meta}</span>}
          </div>
          <IconButton ref={initialFocusRef} icon="close" label={`Tutup ${title.toLowerCase()}`} onClick={onClose} />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="border-t border-border-default/20 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{footer}</div>}
      </div>
    </div>
  )
}
