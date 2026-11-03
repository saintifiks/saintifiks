// Pratinjau bagian Akun yang berupa komponen klien (navigasi, tampilan, profil, hapus akun) tanpa login dan tanpa
// database. Hanya lokal dan preview Vercel (404 di produksi). Tombol simpan dan hapus akan gagal (tidak ada API/sesi).

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Avatar } from '@/components/ui'
import AkunNav from '@/components/akun/AkunNav'
import ThemeChoice from '@/components/akun/ThemeChoice'
import DeleteAccount from '@/components/akun/DeleteAccount'
import ProfileForm from '@/components/akun/ProfileForm'

export const metadata: Metadata = { title: 'Pratinjau Akun', robots: { index: false, follow: false } }

export default function AkunPreviewPage() {
  if (process.env.VERCEL_ENV === 'production') notFound()

  return (
    <main className="min-h-screen bg-surface-page">
      <div className="mx-auto max-w-4xl px-5 pb-24 pt-10 lg:px-8 lg:pt-14">
        <header className="flex items-center gap-5">
          <Avatar name="Rina Anggraeni" size="lg" />
          <div className="min-w-0">
            <h1 className="truncate font-display text-display-sm leading-tight text-text-primary">Rina Anggraeni</h1>
            <p className="mt-1 truncate font-mono text-caption text-text-tertiary">rina@contoh.id · @rina</p>
          </div>
        </header>

        <AkunNav />

        <div className="mt-10 space-y-14">
          <section>
            <h2 className="mb-6 font-interface text-kicker-lg font-semibold uppercase tracking-widest text-text-secondary">Tampilan</h2>
            <ThemeChoice />
          </section>

          <section>
            <h2 className="mb-6 font-interface text-kicker-lg font-semibold uppercase tracking-widest text-text-secondary">Profil</h2>
            <ProfileForm
              userId="00000000-0000-0000-0000-000000000000"
              username="rina"
              initialDisplayName="Rina Anggraeni"
              initialBio="Peneliti kebijakan publik. Menulis soal gizi dan anggaran."
              initialAvatarUrl=""
            />
          </section>

          <section>
            <h2 className="mb-6 font-interface text-kicker-lg font-semibold uppercase tracking-widest text-text-secondary">Hapus akun</h2>
            <DeleteAccount />
          </section>
        </div>
      </div>
    </main>
  )
}
