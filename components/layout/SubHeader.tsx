'use client'

// Sub-header — tanggal dan metadata ala NYT
// [IMPROVEMENT] Menambahkan konteks temporal yang jelas untuk pembaca

function formatTanggalIndonesia(date: Date): string {
  const hari = date.toLocaleDateString('id-ID', { weekday: 'long' })
  const tanggal = date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  // Capitalize hari
  return `${hari.charAt(0).toUpperCase() + hari.slice(1)}, ${tanggal}`
}

export default function SubHeader() {
  return (
    <div className="border-b border-ink dark:border-paper">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Tanggal format Indonesia */}
        <span className="font-mono text-kicker uppercase font-semibold text-ink dark:text-paper">
          {formatTanggalIndonesia(new Date())}
        </span>

        {/* CTA button — bisa diisi dengan action di masa depan */}
        {/* Saat ini disembunyikan untuk menjaga minimalisme */}
        {/* <button className="font-mono text-kicker border border-ink dark:border-paper px-3 py-1.5 hover:bg-ink hover:text-paper dark:hover:bg-paper dark:hover:text-night transition-colors">
          Unduh App
        </button> */}
      </div>
    </div>
  )
}
