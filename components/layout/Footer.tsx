// Komponen Footer — bagian bawah setiap halaman Saintifiks
// Server Component: konten statis, tidak ada data dari database

export default function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-primary-light">
      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Copyright — tahun dihitung otomatis saat build */}
        <p className="font-helvetica text-sm text-text-secondary">
          &copy; {new Date().getFullYear()} Saintifiks. Semua hak dilindungi.
        </p>

      </div>
    </footer>
  )
}
