'use client'

// AccountLink — pintu akun di header: "Masuk" bila belum login, "Akun" bila sudah.
// Tujuan tetap /akun (halaman itu menampilkan gerbang masuk bila belum login). Pintu masuk khusus
// dirancang di Fase 3.

import Link from '@/components/ui/Link'
import { useAuth } from '@/components/auth/AuthProvider'

export default function AccountLink({ className = '' }: { className?: string }) {
  const { userId, ready } = useAuth()

  return (
    <span className={['inline-block min-w-[3.5rem] text-right', className].filter(Boolean).join(' ')}>
      {ready && (
        <Link href="/akun" variant="nav">
          {userId ? 'Akun' : 'Masuk'}
        </Link>
      )}
    </span>
  )
}
