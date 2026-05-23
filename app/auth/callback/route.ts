// Route handler untuk OAuth callback dari Supabase
// Supabase mengarahkan browser ke URL ini setelah pengguna berhasil login via Google
// Tugas file ini: tukar "kode sementara" dari Google menjadi sesi login yang aktif

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  // Tangkap parameter 'next' dari URL, jika tidak ada, gunakan default '/dashboard'
  // Validasi untuk mencegah open redirect attack (C-02)
  const rawNext = requestUrl.searchParams.get('next') ?? '/dashboard'
  // Hanya izinkan path yang dimulai dengan / dan bukan protocol-relative URL (//)
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/dashboard'
  const origin = requestUrl.origin

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Diabaikan jika dipanggil dari Server Component
            }
          },
        },
      }
    )

    // Tukar kode auth menjadi sesi yang aktif di browser pengguna
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Setelah sesi berhasil dibuat, arahkan ke rute dinamis (artikel) atau default (/dashboard)
  return NextResponse.redirect(`${origin}${next}`)
}