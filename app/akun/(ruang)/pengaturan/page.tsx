// Pengaturan — tampilan, data pribadi (unduh dan hapus), dan keluar. Masuk memakai Google, jadi tidak ada kata sandi
// untuk diatur di sini.

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin-check'
import SignOutButton from '@/components/auth/SignOutButton'
import ThemeChoice from '@/components/akun/ThemeChoice'
import DeleteAccount from '@/components/akun/DeleteAccount'

export const metadata: Metadata = { title: 'Pengaturan — Saintifiks', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border-default/20 py-10 first:border-t-0 first:pt-0">
      <h2 className="mb-6 font-interface text-kicker-lg font-semibold uppercase tracking-widest text-text-secondary">{title}</h2>
      {children}
    </section>
  )
}

const note = 'max-w-xl font-display text-body-sm leading-relaxed text-text-secondary'

export default async function PengaturanPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/masuk?next=/akun/pengaturan')

  const admin = await isAdmin()

  return (
    <div>
      <Section title="Tampilan">
        <ThemeChoice />
      </Section>

      <Section title="Akun">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className={note}>
            Masuk dengan Google sebagai <span className="text-text-primary">{user.email}</span>. Kata sandi dikelola Google.
          </p>
          <SignOutButton />
        </div>
      </Section>

      <Section title="Data Anda">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className={note}>
            Unduh salinan profil, tulisan, komentar, suka, bacaan tersimpan, dan usulan koreksi Anda dalam satu berkas JSON.
          </p>
          <a
            href="/api/akun/ekspor"
            download
            className="inline-flex min-h-[44px] items-center font-interface text-sm text-text-primary underline decoration-text-primary/35 decoration-1 underline-offset-[6px] transition-[text-decoration-color] duration-fast hover:decoration-text-primary"
          >
            Unduh data saya
          </a>
        </div>
      </Section>

      <Section title="Hapus akun">
        {admin ? (
          <p className={note}>Akun redaksi tidak bisa dihapus dari sini. Hubungi pemilik situs untuk mencabut akses terlebih dahulu.</p>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className={note}>
              Menghapus akun menghapus profil, tulisan Argumen, komentar, suka, dan Daftar Bacaan Anda secara permanen.
            </p>
            <DeleteAccount />
          </div>
        )}
      </Section>
    </div>
  )
}
