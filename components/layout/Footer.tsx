// Komponen Footer — bagian bawah setiap halaman Saintifiks
// [IMPROVEMENT] NYT-style: heavy top border, centered brand wordmark

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t-4 border-ink dark:border-paper bg-paper dark:bg-night mt-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 flex flex-col items-center gap-6">
        {/* Brand wordmark */}
        <Link
          href="/"
          className="font-display text-2xl font-bold text-ink dark:text-paper tracking-[0.04em] hover:opacity-60 transition-opacity"
        >
          Saintifiks
        </Link>

        {/* Navigation links */}
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <Link 
            href="/" 
            className="font-interface text-sm text-warm-gray hover:text-ink dark:hover:text-paper transition-colors duration-150"
          >
            Beranda
          </Link>
          <Link 
            href="/opinions" 
            className="font-interface text-sm text-warm-gray hover:text-ink dark:hover:text-paper transition-colors duration-150"
          >
            Opinions
          </Link>
          <Link 
            href="/tentang" 
            className="font-interface text-sm text-warm-gray hover:text-ink dark:hover:text-paper transition-colors duration-150"
          >
            Tentang
          </Link>
          <Link 
            href="/standar-editorial" 
            className="font-interface text-sm text-warm-gray hover:text-ink dark:hover:text-paper transition-colors duration-150"
          >
            Standar Editorial
          </Link>
        </nav>

        {/* Copyright */}
        <p className="font-interface text-xs text-warm-gray text-center">
          &copy; {new Date().getFullYear()} Saintifiks. Semua hak dilindungi.
        </p>
      </div>
    </footer>
  )
}