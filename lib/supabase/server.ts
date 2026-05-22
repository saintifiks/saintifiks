// Supabase server client — untuk digunakan di Server Components dan API routes
// PENTING: file ini menggunakan anon key, bukan service_role key
// Service_role key hanya digunakan di operasi khusus yang membutuhkan akses penuh

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  // [CATATAN] cookies() bisa error di edge cases, jadi kita wrap dengan try-catch
  let cookieStore
  try {
    cookieStore = await cookies()
  } catch {
    // Fallback jika cookies() tidak tersedia
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fallbackStore: any = {
      getAll: () => [] as Array<{ name: string; value: string }>,
      set: () => {},
    }
    cookieStore = fallbackStore
  }

  return createServerClient(
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
}