'use client'

// AccountLink — pintu akun di header: "Masuk" bila belum login, "Akun" bila sudah.
// Tujuan tetap /akun (halaman itu menampilkan gerbang masuk bila belum login). Pintu masuk khusus
// dirancang di Fase 3.

import { useEffect, useMemo, useState } from 'react'
import Link from '@/components/ui/Link'
import { createClient } from '@/lib/supabase/client'

export default function AccountLink({ className = '' }: { className?: string }) {
  const supabase = useMemo(() => createClient(), [])
  // null = belum diketahui; ruang dipesan agar header tidak bergeser saat status terbaca.
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (active) setLoggedIn(!!data.session)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => setLoggedIn(!!session))
    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [supabase])

  return (
    <span className={['inline-block min-w-[3.5rem] text-right', className].filter(Boolean).join(' ')}>
      {loggedIn !== null && (
        <Link href="/akun" variant="nav">
          {loggedIn ? 'Akun' : 'Masuk'}
        </Link>
      )}
    </span>
  )
}
