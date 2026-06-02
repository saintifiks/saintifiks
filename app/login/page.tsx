// Halaman login — gerbang masuk (Google OAuth via Supabase)
// Memakai komponen PreLogin agar selaras Design System V2 (mendukung dark mode).
// Tujuan default setelah login: /dashboard (area admin).

import PreLogin from '@/components/layout/PreLogin'

export default function LoginPage() {
  return (
    <PreLogin
      next="/dashboard"
      title="Masuk"
      description="Masuk untuk mengelola Saintifiks."
    />
  )
}
