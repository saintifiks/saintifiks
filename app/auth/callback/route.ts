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
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    // Tukar kode auth menjadi sesi yang aktif di browser pengguna
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Setelah sesi berhasil dibuat, arahkan ke dashboard admin
  return NextResponse.redirect(`${origin}/dashboard`)
}
