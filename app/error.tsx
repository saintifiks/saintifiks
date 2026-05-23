'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error ke console untuk debugging
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 bg-primary-light">
      <div className="text-center max-w-md">
        {/* Logo mark */}
        <div className="mb-8 flex justify-center">
          <svg width="64" height="64" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-accent-red">
            <path d="M0 50L50 8.6849e-07L100 50L50 100L0 50Z" fill="currentColor"/>
          </svg>
        </div>

        {/* Heading */}
        <h1 className="font-libre text-3xl md:text-4xl font-bold text-primary-dark mb-4">
          Terjadi Kesalahan
        </h1>
        
        <p className="font-helvetica text-sm md:text-base text-primary-dark/60 mb-8 leading-relaxed">
          Maaf, sepertinya ada masalah teknis saat memuat halaman ini. Silakan coba lagi atau kembali ke beranda.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="font-helvetica text-sm bg-primary-dark text-primary-light px-6 py-3 hover:opacity-90 transition-opacity"
          >
            Coba Lagi
          </button>
          
          <Link 
            href="/"
            className="font-helvetica text-sm border border-primary-dark text-primary-dark px-6 py-3 hover:bg-primary-dark/5 transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>

        {/* Error digest untuk debugging (hanya dev) */}
        {error.digest && process.env.NODE_ENV === 'development' && (
          <p className="mt-8 font-helvetica text-xs text-primary-dark/40 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
