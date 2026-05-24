// Supabase browser client — hanya menggunakan anon key (aman untuk client-side)
// File ini digunakan oleh komponen yang berjalan di browser pengguna

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  return createBrowserClient(
    url || '',
    key || ''
  )
}