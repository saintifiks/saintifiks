// Komponen Navbar — navigasi utama situs Saintifiks
// Server Component: tidak ada data dari database, konten statis

export default function Navbar() {
  return (
    <nav className="border-b border-primary-dark/10 bg-primary-light">
      <div className="max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">

        {/* Brand — nama situs, link ke beranda */}
        <a
          href="/"
          className="font-libre text-lg font-bold text-primary-dark hover:opacity-60 transition-opacity duration-150"
        >
          Saintifiks
        </a>

      </div>
    </nav>
  )
}
