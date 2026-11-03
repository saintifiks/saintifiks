'use client'

// GoogleButton — memulai masuk dengan Google. Selama menunggu pengalihan, tombol menampilkan "Membuka Google".
// `next` sudah disaring di server (sanitizePostLoginDestination) sebelum sampai ke sini.

import { useState } from 'react'
import { Button } from '@/components/ui'
import { signInWithGoogle } from '@/lib/auth-client'

export default function GoogleButton({ next, className = '' }: { next: string; className?: string }) {
  const [loading, setLoading] = useState(false)

  async function start() {
    setLoading(true)
    try {
      await signInWithGoogle(next)
      // Halaman dialihkan ke Google; tidak perlu mengembalikan state.
    } catch {
      setLoading(false)
    }
  }

  return (
    <Button size="lg" onClick={start} disabled={loading} aria-busy={loading} className={className}>
      {loading ? 'Membuka Google' : 'Lanjutkan dengan Google'}
    </Button>
  )
}
