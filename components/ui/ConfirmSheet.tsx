'use client'

// ConfirmSheet — konfirmasi aksi yang sulit dibatalkan, memakai Sheet (bukan window.confirm). Dialog bawaan peramban
// bisa diblokir atau tidak tampil (mis. di peramban tertanam), sehingga klik terasa tidak berbuat apa-apa; panel ini
// selalu tampil, menjelaskan akibatnya, dan menandai keadaan proses.

import type { ReactNode } from 'react'
import Button from './Button'
import Sheet from './Sheet'

export type ConfirmSheetProps = {
  open: boolean
  title: string
  // Akibat aksi, dalam satu-dua kalimat.
  children: ReactNode
  confirmLabel: string
  // Label tombol saat aksi berjalan, mis. "Menyembunyikan".
  busyLabel?: string
  busy?: boolean
  danger?: boolean
  onConfirm: () => void
  onClose: () => void
}

export default function ConfirmSheet({
  open,
  title,
  children,
  confirmLabel,
  busyLabel = 'Memproses',
  busy = false,
  danger = false,
  onConfirm,
  onClose,
}: ConfirmSheetProps) {
  return (
    <Sheet open={open} onClose={busy ? () => {} : onClose} title={title}>
      <div className="font-display text-body-sm leading-relaxed text-text-secondary">{children}</div>
      <div className="mt-8 flex items-center gap-6">
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} disabled={busy}>
          {busy ? busyLabel : confirmLabel}
        </Button>
        <Button variant="text" onClick={onClose} disabled={busy}>
          Batal
        </Button>
      </div>
    </Sheet>
  )
}
