'use client'

// AuthProvider — satu-satunya tempat status login dibaca di sisi klien.
// Sebelumnya Like, Komentar, Bagikan, Menu, dan Akun masing-masing membuat klien Supabase dan memeriksa sesi
// sendiri (≥5 pemeriksaan per halaman, dengan perilaku berbeda). Sekarang satu sesi, satu langganan.

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

export type AuthUser = {
  id: string
  email: string | null
  name: string | null
  avatarUrl: string | null
}

type AuthState = {
  userId: string | null
  // Info tampilan dari sesi (metadata Google); tanpa permintaan tambahan.
  user: AuthUser | null
  // false selama status belum diketahui; komponen menunda tindakan yang bergantung pada login.
  ready: boolean
}

const AuthContext = createContext<AuthState>({ userId: null, user: null, ready: false })

function toState(session: { user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> } } | null): AuthState {
  if (!session) return { userId: null, user: null, ready: true }
  const meta = session.user.user_metadata ?? {}
  const str = (v: unknown) => (typeof v === 'string' && v ? v : null)
  return {
    userId: session.user.id,
    ready: true,
    user: {
      id: session.user.id,
      email: session.user.email ?? null,
      name: str(meta.full_name) ?? str(meta.name),
      avatarUrl: str(meta.avatar_url) ?? str(meta.picture),
    },
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), [])
  const [state, setState] = useState<AuthState>({ userId: null, user: null, ready: false })

  useEffect(() => {
    let active = true
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (active) setState(toState(data.session))
      })
      .catch(() => {
        if (active) setState(toState(null))
      })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(toState(session))
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
