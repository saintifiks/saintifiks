// Komponen Footer — bagian bawah setiap halaman Saintifiks
// Server Component: konten statis, tidak ada data dari database

export default function Footer() {
  return (
    <footer className="border-t border-primary-dark/10 bg-primary-light dark:border-primary-light/10 dark:bg-primary-dark">
      <div className="max-w-2xl mx-auto px-6 py-8">

        {/* Copyright — tahun dihitung otomatis saat build */}
        <p className="font-helvetica text-xs text-primary-dark/40 dark:text-primary-light/40">
          © {new Date().getFullYear()} Saintifiks. Semua hak dilindungi.
        </p>

      </div>
    </footer>
  )
}
