// Layout admin — AUTH GUARD
// Setiap halaman di dalam folder (admin) harus melewati pemeriksaan ini dulu
// Jika tidak ada sesi login → diarahkan ke /login
// Jika email bukan pemilik → diarahkan ke /login

import { redirect } from 'next/navigation'
import AdminShell from '@/components/admin/AdminShell'
import { requireAdmin } from '@/lib/admin-check'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Fail closed: dashboard tidak pernah terbuka bila ADMIN_EMAIL belum dikonfigurasi.
  const user = await requireAdmin()

  async function handleSignOut() {
    'use server'

    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <AdminShell email={user.email} signOutAction={handleSignOut}>
      {children}
    </AdminShell>
  )
}
