'use client'

// AuthProvider — satu-satunya tempat status login dibaca di sisi klien.
// Sebelumnya Like, Komentar, Bagikan, Menu, dan Akun masing-masing membuat klien Supabase dan memeriksa sesi
// sendiri (≥5 pemeriksaan per halaman, dengan perilaku berbeda). Sekarang satu sesi, satu langganan.

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

type AuthState = {
  userId: string | null
  // false selama status belum diketahui; komponen menunda tindakan yang bergantung pada login.
  ready: boolean
}

const AuthContext = createContext<AuthState>({ userId: null, ready: false })

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), [])
  const [state, setState] = useState<AuthState>({ userId: null, ready: false })

  useEffect(() => {
    let active = true
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (active) setState({ userId: data.session?.user.id ?? null, ready: true })
      })
      .catch(() => {
        if (active) setState({ userId: null, ready: true })
      })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ userId: session?.user.id ?? null, ready: true })
    })
    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const value = useMemo(() => state, [state])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  return useContext(AuthContext)
}
