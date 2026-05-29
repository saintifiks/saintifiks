// Komponen Footer — bagian bawah setiap halaman Saintifiks
// Server Component: konten statis, tidak ada data dari database

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-paper">
      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Navigation links */}
        <nav className="flex items-center justify-center gap-6 mb-6">
          <Link 
            href="/" 
            className="font-interface text-sm text-warm-gray hover:text-ink transition-colors duration-150"
          >
            Beranda
          </Link>
          <Link 
            href="/tentang" 
            className="font-interface text-sm text-warm-gray hover:text-ink transition-colors duration-150"
          >
            Tentang
          </Link>
          <Link 
            href="/standar-editorial" 
            className="font-interface text-sm text-warm-gray hover:text-ink transition-colors duration-150"
          >
            Standar Editorial
          </Link>
        </nav>

        {/* Copyright — tahun dihitung otomatis saat build */}
        <p className="font-interface text-sm text-warm-gray text-center">
          &copy; {new Date().getFullYear()} Saintifiks. Semua hak dilindungi.
        </p>
      </div>
    </footer>
  )
}