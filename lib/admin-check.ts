// Helper untuk memverifikasi apakah user yang sedang login adalah admin
// Menggunakan tabel explicit admin_memberships dengan fail-closed compatibility layer

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ALLOWED_ADMIN_ROLES = ['admin', 'publisher', 'moderator', 'security_admin'] as const

export async function isAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return false

    // 1. Cek membership eksplisit dari database
    const { data: membership, error: dbError } = await supabase
      .from('admin_memberships')
      .select('role, enabled')
      .eq('user_id', user.id)
      .eq('enabled', true)
      .maybeSingle()

    if (!dbError && membership && ALLOWED_ADMIN_ROLES.includes(membership.role as typeof ALLOWED_ADMIN_ROLES[number])) {
      return true
    }

    // 2. Compatibility fallback: hanya jika diaktifkan secara eksplisit melalui environment flag
    const enableLegacyFallback =
      process.env.SECURITY_ENABLE_LEGACY_ADMIN_EMAIL_FALLBACK === 'true' ||
      process.env.SECURITY_ENABLE_LEGACY_ADMIN_EMAIL_FALLBACK === '1'

    if (enableLegacyFallback && ADMIN_EMAIL && user.email === ADMIN_EMAIL) {
      return true
    }

    return false
  } catch {
    // Fail closed pada setiap runtime error
    return false
  }
}

export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // 1. Cek membership eksplisit dari database
  try {
    const { data: membership, error: dbError } = await supabase
      .from('admin_memberships')
      .select('role, enabled')
      .eq('user_id', user.id)
      .eq('enabled', true)
      .maybeSingle()

    if (!dbError && membership && ALLOWED_ADMIN_ROLES.includes(membership.role as typeof ALLOWED_ADMIN_ROLES[number])) {
      return user
    }
  } catch {
    // Abaikan dan lanjut ke pemeriksaan fallback jika diizinkan
  }

  // 2. Compatibility fallback: hanya jika diaktifkan secara eksplisit melalui environment flag
  const enableLegacyFallback =
    process.env.SECURITY_ENABLE_LEGACY_ADMIN_EMAIL_FALLBACK === 'true' ||
    process.env.SECURITY_ENABLE_LEGACY_ADMIN_EMAIL_FALLBACK === '1'

  if (enableLegacyFallback && ADMIN_EMAIL && user.email === ADMIN_EMAIL) {
    return user
  }

  redirect('/login')
}
