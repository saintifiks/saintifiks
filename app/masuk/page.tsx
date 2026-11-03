// Halaman masuk — satu pintu untuk semua peran (pembaca, penulis Argumen, admin). Peran menentukan tujuan,
// bukan halaman masuknya. Desktop: formulir di kiri, bidang halftone berlian di kanan. Ponsel: strip halftone
// di atas, formulir di bawah. Header dan footer situs disembunyikan agar halaman ini fokus.

import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { sanitizePostLoginDestination } from '@/lib/security/post-login-destination'
import Wordmark from '@/components/layout/Wordmark'
import HalftoneField from '@/components/brand/HalftoneField'
import GoogleButton from '@/components/auth/GoogleButton'

export const metadata: Metadata = {
  title: 'Masuk — Saintifiks',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const ERRORS: Record<string, string> = {
  gagal: 'Masuk belum berhasil. Silakan coba lagi.',
  batal: 'Masuk dibatalkan. Anda bisa mencobanya lagi kapan saja.',
}

export default async function MasukPage(props: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const sp = await props.searchParams
  const next = sanitizePostLoginDestination(sp.next ?? '/')

  // Sudah masuk: tidak perlu melihat halaman ini.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) redirect(next)

  const error = sp.error ? ERRORS[sp.error] ?? ERRORS.gagal : null

  return (
    <main className="grid min-h-screen bg-surface-page lg:grid-cols-2">
      {/* Bidang halftone: strip di ponsel, panel penuh di desktop */}
      <aside className="surface-night relative order-first h-36 overflow-hidden sm:h-44 lg:order-last lg:h-auto">
        <HalftoneField className="absolute inset-0 h-full w-full text-ink/85" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 hidden h-64 bg-gradient-to-t from-paper via-paper/85 to-transparent lg:block" />
        <p className="absolute bottom-0 left-0 hidden max-w-md p-12 font-display text-display-sm italic leading-tight text-ink lg:block">
          Mereka punya narasi, kami punya angka.
        </p>
      </aside>

      <section className="flex flex-col gap-10 px-6 py-8 sm:px-12 sm:py-10 lg:justify-between lg:gap-0 lg:px-16 lg:py-12">
        <Wordmark />

        <div className="max-w-md">
          <h1 className="font-display text-display-sm leading-[1.12] text-text-primary sm:text-display-base">
            Masuk ke Saintifiks
          </h1>
          <p className="mt-5 font-display text-body-sm leading-relaxed text-text-secondary">
            Simpan artikel untuk dibaca nanti, sukai dan komentari tulisan, usulkan koreksi, dan tulis Argumen Anda
            sendiri. Tanpa kata sandi: cukup akun Google.
          </p>

          {error && (
            <p role="alert" className="mt-6 border-l border-signal-danger pl-4 font-interface text-sm text-signal-danger">
              {error}
            </p>
          )}

          <div className="mt-8 flex flex-col items-stretch gap-5 sm:items-start">
            <GoogleButton next={next} className="w-full sm:w-auto" />
            <Link
              href={next}
              className="font-interface text-sm text-text-secondary underline decoration-border-default/40 decoration-1 underline-offset-[6px] transition-[text-decoration-color] duration-fast hover:decoration-text-primary hover:text-text-primary"
            >
              Lanjutkan membaca tanpa masuk
            </Link>
          </div>
        </div>

        <p className="mt-auto max-w-md pt-8 font-interface text-caption leading-relaxed text-text-tertiary lg:mt-0 lg:pt-0">
          Dengan masuk, Anda menyetujui{' '}
          <Link href="/kebijakan-privasi" className="underline underline-offset-4 hover:text-text-primary">
            Kebijakan Privasi
          </Link>
          . Komentar Anda tampil sebagai “Pembaca”, tanpa nama.
        </p>
      </section>
    </main>
  )
}
