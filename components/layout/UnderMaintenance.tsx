// UnderMaintenance — komponen placeholder untuk halaman yang belum berisi.
// Menampilkan judul halaman + pesan "dalam pemeliharaan" + tautan kembali.
// Server Component (tanpa interaksi klien).

import Link from 'next/link'
import { Wrench } from 'lucide-react'

type UnderMaintenanceProps = {
  title: string
  description?: string
}

export default function UnderMaintenance({ title, description }: UnderMaintenanceProps) {
  return (
    <main className="min-h-[70vh] bg-surface-page flex items-center justify-center px-5">
      <div className="max-w-md w-full text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-surface-sunken/50 text-text-secondary mb-8">
          <Wrench size={26} strokeWidth={1.75} />
        </span>

        <h1 className="font-display text-display-sm font-bold text-text-primary">
          {title}
        </h1>

        <p className="font-interface text-body-sm text-text-secondary mt-4">
          {description ?? 'Halaman ini sedang dalam pemeliharaan. Kami sedang menyiapkan isinya — silakan kembali lagi nanti.'}
        </p>

        <Link
          href="/"
          className="inline-block font-interface text-kicker uppercase tracking-widest text-text-link hover:opacity-70 transition-opacity duration-fast mt-8"
        >
          ← Kembali ke Beranda
        </Link>
      </div>
    </main>
  )
}
