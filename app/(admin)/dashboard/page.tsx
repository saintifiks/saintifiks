// Halaman dashboard admin — PLACEHOLDER SEMENTARA
// Tujuan file ini: konfirmasi visual bahwa auth guard berfungsi dan login berhasil
// Akan digantikan dengan admin panel lengkap di sesi berikutnya

import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <main className="min-h-screen bg-primary-light">
      <div className="max-w-2xl mx-auto px-6 py-16">

        <p className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest">
          Admin Panel
        </p>

        <h1 className="font-libre text-3xl font-bold text-primary-dark mt-4">
          Selamat datang.
        </h1>

        <p className="font-helvetica text-sm text-primary-dark/60 mt-3">
          Login berhasil sebagai: {user?.email}
        </p>

        <p className="font-helvetica text-xs text-primary-dark/30 mt-12">
          Admin panel sedang dibangun. Halaman ini adalah konfirmasi sementara bahwa sistem autentikasi berfungsi.
        </p>

      </div>
    </main>
  )
}
