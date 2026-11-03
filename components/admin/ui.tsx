// Perangkat kecil bersama untuk halaman admin: judul bagian, tautan, catatan, keadaan kosong, tabel bergaris.
// Semua monokrom dan bersudut tajam; hierarki dari ukuran dan garis, bukan dari warna atau kartu.

import type { ReactNode } from 'react'
import Link from 'next/link'

export const sectionTitle = 'font-interface text-kicker-lg font-semibold uppercase tracking-widest text-text-secondary'

export const adminLink =
  'underline decoration-border-default/40 decoration-1 underline-offset-[6px] transition-[text-decoration-color] duration-fast hover:decoration-text-primary'

export const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary'

// Tabel bergaris: tanpa latar kepala, tanpa kartu pembungkus.
export const table = {
  wrap: 'overflow-x-auto border-y border-border-default/20',
  root: 'w-full border-collapse text-left',
  th: 'px-4 py-3 font-interface text-kicker-lg font-semibold uppercase tracking-widest text-text-secondary first:pl-0 last:pr-0',
  td: 'px-4 py-4 align-top first:pl-0 last:pr-0',
  headRow: 'border-b border-border-default/20',
  bodyRows: 'divide-y divide-border-default/15',
}

// Catatan penting (galat, peringatan): garis di kiri dan teks biasa. Tanpa latar atau ikon berwarna.
export function Notice({
  tone = 'info',
  title,
  children,
}: {
  tone?: 'info' | 'danger'
  title?: string
  children: ReactNode
}) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={['mb-8 border-l pl-4', tone === 'danger' ? 'border-signal-danger' : 'border-border-default'].join(' ')}
    >
      {title && <p className="font-interface text-sm font-semibold text-text-primary">{title}</p>}
      <div className="font-display text-body-sm leading-relaxed text-text-secondary">{children}</div>
    </div>
  )
}

export function EmptyState({
  title,
  children,
  action,
}: {
  title: string
  children?: ReactNode
  action?: { label: string; href: string }
}) {
  return (
    <div className="border-y border-border-default/20 py-12">
      <p className="font-display text-lg text-text-primary">{title}</p>
      {children && (
        <p className="mt-2 max-w-md font-display text-body-sm italic leading-relaxed text-text-secondary">{children}</p>
      )}
      {action && (
        <Link href={action.href} className={`mt-5 inline-block font-interface text-sm text-text-primary ${adminLink} ${focusRing}`}>
          {action.label}
        </Link>
      )}
    </div>
  )
}

// Angka ringkasan: label kecil, angka mono besar. Dipakai berderet di Analitik dan Bookstore.
export function StatRow({ items }: { items: { label: string; value: number | string }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-y-6 border-y border-border-default/20 py-6 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label}>
          <dt className={sectionTitle}>{item.label}</dt>
          <dd className="mt-2 font-mono text-display-sm tabular-nums text-text-primary">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
