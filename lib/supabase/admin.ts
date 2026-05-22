// Supabase admin client — menggunakan service_role key
// HANYA untuk digunakan di server-side (API routes, Server Components)
// JANGAN PERNAH import file ini di komponen client atau expose ke browser

import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('[Supabase Admin] Environment variables tidak tersedia: NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
