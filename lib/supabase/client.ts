// Supabase browser client — hanya menggunakan anon key (aman untuk client-side)
// File ini digunakan oleh komponen yang berjalan di browser pengguna

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}