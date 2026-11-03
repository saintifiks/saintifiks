'use client'

// Menampilkan satu dialog editor (Tabel, Gambar, Grafik) langsung terbuka, untuk pratinjau desain.

import { useSyncExternalStore } from 'react'
import TableWizard from '@/components/opinions/editor/TableWizard'
import ImageModal from '@/components/opinions/editor/ImageModal'
import ChartWizard from '@/components/opinions/editor/ChartWizard'

export default function Dialogs({ which }: { which: 'tabel' | 'gambar' | 'grafik' }) {
  // Dialog hanya dibuka lewat interaksi di editor sungguhan; pratinjau menunggu sisi klien agar tidak salah hidrasi.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  if (!mounted) return null
  const noop = () => {}
  if (which === 'tabel') return <TableWizard onInsert={noop} onClose={noop} />
  if (which === 'gambar') return <ImageModal onInsert={noop} onClose={noop} />
  return <ChartWizard articleId="" onInsert={noop} onClose={noop} />
}
