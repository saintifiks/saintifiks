// Layout admin — AUTH GUARD
// Setiap halaman di dalam folder (admin) harus melewati pemeriksaan ini dulu
// Jika tidak ada sesi login → diarahkan ke /login
// Jika email bukan pemilik → diarahkan ke /login

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Ambil data user yang sedang login (null jika tidak ada sesi)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Pemeriksaan 1: apakah ada sesi login yang valid?
  if (!user) {
    redirect('/login')
  }

  // Pemeriksaan 2: apakah email yang login cocok dengan email pemilik?
  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail && user.email !== adminEmail) {
    redirect('/login')
  }

  return <>{children}</>
}
