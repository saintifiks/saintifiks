// Helper untuk memverifikasi apakah user yang sedang login adalah admin
// Digunakan di semua API route admin — validasi WAJIB dilakukan di server, bukan hanya di UI

import { createClient } from '@/lib/supabase/server'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL

export async function isAdmin(): Promise<boolean> {
  if (!ADMIN_EMAIL) return false
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.email === ADMIN_EMAIL
}
