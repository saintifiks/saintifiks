// Supabase browser client — hanya menggunakan anon key (aman untuk client-side)
// File ini digunakan oleh komponen yang berjalan di browser pengguna

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // [DEBUG] Log untuk verifikasi env vars tersedia
  if (!url || !key) {
    console.error('[Supabase Client] Environment variables tidak tersedia:', { 
      url: url ? 'SET' : 'MISSING', 
      key: key ? 'SET' : 'MISSING' 
    })
  }
  
  return createBrowserClient(
    url || '',
    key || ''
  )
}