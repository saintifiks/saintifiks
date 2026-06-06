import Link from '@/components/ui/Link'

export const metadata = {
  title: 'Halaman Tidak Ditemukan — Saintifiks',
}

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 bg-surface-page">
      <div className="text-center max-w-md">
        <div className="mb-8 flex justify-center">
          <svg
            width="64"
            height="64"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-text-primary"
            aria-hidden="true"
          >
            <path
              d="M0 50L50 8.6849e-07L100 50L50 100L0 50Z"
              fill="currentColor"
            />
          </svg>
        </div>

        <p
          className="font-mono text-6xl font-normal text-text-tertiary/40 mb-4"
          aria-hidden="true"
        >
          404
        </p>

        <h1 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-4">
          Halaman tidak ditemukan
        </h1>

        <p className="font-interface text-sm md:text-base text-text-secondary mb-8 leading-relaxed">
          Sepertinya halaman yang Anda cari telah dipindahkan, dihapus, atau mungkin
          tidak pernah ada.
        </p>

        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center justify-center rounded bg-interactive-primary px-5 py-3 font-interface text-sm font-semibold text-text-on-inverse no-underline transition-colors duration-fast hover:bg-interactive-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  )
}
