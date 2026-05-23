import Link from 'next/link'

export const metadata = {
  title: 'Halaman Tidak Ditemukan — Saintifiks',
}

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 bg-primary-light">
      <div className="text-center max-w-md">
        {/* Logo mark */}
        <div className="mb-8 flex justify-center">
          <svg width="64" height="64" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary-dark">
            <path d="M0 50L50 8.6849e-07L100 50L50 100L0 50Z" fill="currentColor"/>
          </svg>
        </div>

        {/* Heading */}
        <h1 className="font-libre text-4xl md:text-5xl font-bold text-primary-dark mb-4">
          404
        </h1>
        
        <p className="font-libre text-xl md:text-2xl text-primary-dark mb-4">
          Halaman tidak ditemukan
        </p>
        
        <p className="font-helvetica text-sm md:text-base text-primary-dark/60 mb-8 leading-relaxed">
          Sepertinya halaman yang Anda cari telah dipindahkan, dihapus, atau mungkin tidak pernah ada.
        </p>

        {/* CTA */}
        <Link 
          href="/"
          className="inline-block font-helvetica text-sm bg-primary-dark text-primary-light px-6 py-3 hover:opacity-90 transition-opacity"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  )
}
