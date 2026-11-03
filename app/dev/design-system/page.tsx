// Pedoman desain Saintifiks — rujukan hidup untuk token dan komponen.
// Hanya tersedia di lokal dan preview Vercel; di produksi mengembalikan 404.
// Komponen baru wajib tampil di sini sebelum dipakai di halaman.

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Avatar, Badge, Button, Field, Icon, IconButton, Input, iconNames } from '@/components/ui'
import Link from '@/components/ui/Link'
import { ToastView } from '@/components/ui/Toast'
import { coreIconNames } from '@/components/ui/core-icons'
import ToastDemo from './ToastDemo'

export const metadata: Metadata = {
  title: 'Pedoman Desain — Saintifiks',
  robots: { index: false, follow: false },
}

const toc = [
  ['warna', 'Warna'],
  ['tipografi', 'Tipografi'],
  ['tombol', 'Tombol'],
  ['tautan', 'Tautan'],
  ['formulir', 'Formulir'],
  ['penanda', 'Penanda'],
  ['avatar', 'Avatar'],
  ['notifikasi', 'Notifikasi'],
  ['ikon', 'Ikon'],
] as const

const brandNames = iconNames.filter((n) => n.startsWith('brand-'))

const scale = [
  ['display-lg', 'text-display-lg', '52 / 1,1', 'Judul halaman utama'],
  ['display-base', 'text-display-base', '40 / 1,15', 'Judul artikel'],
  ['display-sm', 'text-display-sm', '32 / 1,2', 'Judul bagian'],
  ['body-lg', 'text-body-lg', '19 / 1,7', 'Isi artikel — desktop'],
  ['body-base', 'text-body-base', '18 / 1,75', 'Isi artikel — ponsel'],
  ['caption-lg', 'text-caption-lg', '13 / 1,5', 'Keterangan, metadata'],
] as const

function Section({
  id,
  n,
  title,
  lead,
  children,
}: {
  id: string
  n: string
  title: string
  lead: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-border-default/20 py-12 lg:py-16">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
        <header className="lg:col-span-4">
          <p className="font-mono text-caption text-text-tertiary">{n}</p>
          <h2 className="mt-2 font-display text-display-sm text-text-primary">{title}</h2>
          <div className="mt-4 max-w-sm space-y-3 font-display text-sm leading-relaxed text-text-secondary">{lead}</div>
        </header>
        <div className="min-w-0 lg:col-span-8">{children}</div>
      </div>
    </section>
  )
}

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 font-interface text-kicker-lg font-semibold uppercase tracking-widest text-text-secondary">
      {children}
    </p>
  )
}

function Panels({ children }: { children: (surface: 'paper' | 'night') => React.ReactNode }) {
  return (
    <div className="grid gap-px bg-border-default/20 sm:grid-cols-2">
      <div className="bg-paper p-6 sm:p-8">
        <Caption>Di atas kertas</Caption>
        {children('paper')}
      </div>
      <div className="surface-night p-6 sm:p-8">
        <Caption>Di atas malam</Caption>
        {children('night')}
      </div>
    </div>
  )
}

export default function DesignSystemPage() {
  if (process.env.VERCEL_ENV === 'production') notFound()

  return (
    <main className="min-h-screen bg-surface-page">
      <div className="mx-auto max-w-6xl px-5 pb-32 pt-8 lg:px-8">
        {/* Kepala halaman */}
        <div className="flex items-baseline justify-between border-b border-border-default pb-3 font-interface text-kicker-lg font-semibold uppercase tracking-widest text-text-primary">
          <span>Pedoman Desain</span>
          <span className="font-mono text-caption font-normal normal-case tracking-normal text-text-secondary">
            Edisi 1 · 3 November 2026
          </span>
        </div>
        <div className="border-b-2 border-border-default pt-px" />

        <div className="grid gap-10 pt-10 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-14">
          {/* Indeks */}
          <nav aria-label="Isi pedoman" className="hidden lg:block">
            <ol className="sticky top-28 space-y-1">
              {toc.map(([id, label], i) => (
                <li key={id}>
                  <Link
                    href={`#${id}`}
                    variant="nav"
                    className="flex items-baseline gap-3 py-1.5 pr-2"
                  >
                    <span className="w-5 font-mono text-caption text-text-tertiary">{String(i + 1).padStart(2, '0')}</span>
                    {label}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>

          <div className="min-w-0">
            {/* Judul */}
            <header className="max-w-3xl pb-12">
              <h1 className="font-display text-display-base leading-tight text-text-primary lg:text-display-lg">
                Cara Saintifiks <em>terlihat</em> dan <em>bergerak.</em>
              </h1>
              <p className="mt-6 max-w-2xl font-display text-body-base leading-relaxed text-text-secondary">
                Hitam di atas kertas. Satu huruf serif. Garis tipis sebagai pemisah. Setiap tombol, tautan, dan
                ikon di situs ini diambil dari halaman ini — bukan dibuat ulang di tiap halaman.
              </p>
            </header>

            {/* 01 WARNA */}
            <Section
              id="warna"
              n="01"
              title="Warna"
              lead={
                <>
                  <p>Tiga warna dasar dan satu merah. Tidak ada warna aksen: tautan, status, dan fokus dibedakan oleh bentuk, garis, dan gerak.</p>
                  <p>Mode gelap membalik tinta dan kertas; malam dipakai sebagai blok kontras.</p>
                </>
              }
            >
              <div className="grid h-72 grid-cols-10 sm:h-80">
                <div className="col-span-5 flex flex-col justify-between border border-border-default/25 bg-paper p-5 text-ink">
                  <span className="font-display text-2xl">Kertas</span>
                  <span className="font-mono text-caption">
                    {'#'}F7F5F0
                    <br />
                    Latar halaman
                  </span>
                </div>
                <div className="col-span-3 flex flex-col justify-between bg-ink p-5 text-paper">
                  <span className="font-display text-2xl">Tinta</span>
                  <span className="font-mono text-caption">
                    {'#'}1A1917
                    <br />
                    Teks, garis, tombol
                  </span>
                </div>
                <div className="col-span-2 flex flex-col justify-between bg-night p-4 text-paper">
                  <span className="font-display text-2xl">Malam</span>
                  <span className="font-mono text-caption">
                    {'#'}0F1620
                    <br />
                    Blok kontras
                  </span>
                </div>
              </div>

              <dl className="mt-10 divide-y divide-border-default/15 border-y border-border-default/15">
                {(
                  [
                    ['text-ink', 'bg-ink', 'Tinta', '16,1 : 1', 'Judul, isi artikel, tombol'],
                    ['text-warm-gray', 'bg-warm-gray', 'Abu hangat', '6,6 : 1', 'Teks sekunder, keterangan'],
                    ['text-text-tertiary', 'bg-text-tertiary', 'Abu muda', '4,7 : 1', 'Petunjuk isian, metadata'],
                  ] as const
                ).map(([text, bar, name, ratio, use]) => (
                  <div key={name} className="grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 py-4 sm:grid-cols-[8rem_1fr_auto]">
                    <dt className={`font-display text-lg ${text}`}>{name}</dt>
                    <dd className="order-3 col-span-2 flex items-center gap-4 sm:order-none sm:col-span-1">
                      <span className={`h-px flex-1 ${bar}`} />
                      <span className="font-interface text-caption text-text-secondary">{use}</span>
                    </dd>
                    <dd className="font-mono text-caption text-text-secondary">{ratio}</dd>
                  </div>
                ))}
                <div className="grid grid-cols-[1fr_auto] items-baseline gap-x-6 py-4 sm:grid-cols-[8rem_1fr_auto]">
                  <dt className="font-display text-lg text-signal-danger">Merah</dt>
                  <dd className="order-3 col-span-2 font-interface text-caption text-text-secondary sm:order-none sm:col-span-1">
                    Hanya untuk galat dan tindakan yang tak bisa dibatalkan
                  </dd>
                  <dd className="font-mono text-caption text-text-secondary">6,0 : 1</dd>
                </div>
              </dl>
            </Section>

            {/* 02 TIPOGRAFI */}
            <Section
              id="tipografi"
              n="02"
              title="Tipografi"
              lead={
                <>
                  <p>Libre Baskerville untuk judul dan isi — hanya bobot reguler dan tebal, ditambah miring. Hierarki dibangun dari ukuran, miring, dan huruf kapital, bukan bobot menengah.</p>
                  <p>IBM Plex Sans untuk antarmuka; Plex Mono hanya untuk angka dan label teknis.</p>
                </>
              }
            >
              <div className="flex items-end justify-between border-b border-border-default/20 pb-6">
                <span className="font-display text-[9rem] leading-none text-text-primary">Aa</span>
                <p className="max-w-[16rem] pb-3 font-display text-sm italic leading-relaxed text-text-secondary">
                  ABCDEFGHIJKLMNOPQRSTUVWXYZ
                  <br />
                  abcdefghijklmnopqrstuvwxyz
                  <br />
                  0123456789 — “angka” &amp; tanda baca
                </p>
              </div>

              {/* Komposisi kepala artikel */}
              <Caption>Kepala artikel</Caption>
              <article className="border-y border-border-default/20 py-8">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <Badge variant="category">Ekonomi</Badge>
                  <span className="font-interface text-sm font-semibold text-text-primary">Utang negara</span>
                </div>
                <h3 className="mt-4 max-w-xl font-display text-display-sm leading-tight text-text-primary sm:text-display-base">
                  Utang yang tak pernah selesai dibicarakan
                </h3>
                <p className="mt-4 max-w-xl font-display text-body-sm italic leading-relaxed text-text-secondary">
                  Rasio utang terlihat aman di atas kertas. Angka yang jarang dibaca justru ada di bunganya.
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <Avatar name="Putri Ayu" size="md" />
                  <div>
                    <p className="font-interface text-sm font-semibold text-text-primary">Putri Ayu</p>
                    <p className="font-mono text-caption text-text-tertiary">3 Nov 2026 · baca 6 menit</p>
                  </div>
                </div>
              </article>

              <Caption>Skala</Caption>
              <div className="divide-y divide-border-default/15 border-y border-border-default/15">
                {scale.map(([name, cls, size, use]) => (
                  <div key={name} className="grid items-baseline gap-x-6 gap-y-1 py-4 sm:grid-cols-[9rem_1fr]">
                    <p className="font-mono text-caption text-text-tertiary">
                      {name}
                      <span className="ml-2 text-text-secondary">{size}</span>
                    </p>
                    <div className="min-w-0">
                      <p className={`truncate font-display text-text-primary ${cls}`}>Mereka punya narasi, kami punya angka</p>
                      <p className="mt-1 font-interface text-caption text-text-secondary">{use}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* 03 TOMBOL */}
            <Section
              id="tombol"
              n="03"
              title="Tombol"
              lead={
                <>
                  <p>Sudut tajam. Tidak ada tombol berkotak kontur: yang penting berupa balok tinta, yang lain hanya teks bergaris tipis.</p>
                  <p>Semua hover memakai satu gerak — <strong className="font-bold">tinta naik</strong>: tinta merambat dari bawah memenuhi tombol dan huruf berbalik warna. Arahkan kursor untuk mencobanya.</p>
                </>
              }
            >
              <Panels>
                {() => (
                  <div className="space-y-8">
                    <div>
                      <p className="mb-3 font-interface text-caption text-text-secondary">Utama — aksi pokok halaman</p>
                      <div className="flex flex-wrap items-center gap-4">
                        <Button arrow>Mulai membaca</Button>
                        <Button disabled>Nonaktif</Button>
                      </div>
                    </div>
                    <div>
                      <p className="mb-3 font-interface text-caption text-text-secondary">Teks — aksi kedua</p>
                      <div className="flex flex-wrap items-center gap-4">
                        <Button variant="text" arrow>
                          Lihat semua
                        </Button>
                        <Button variant="text" disabled>
                          Nonaktif
                        </Button>
                      </div>
                    </div>
                    <div>
                      <p className="mb-3 font-interface text-caption text-text-secondary">Hapus — tak bisa dibatalkan</p>
                      <Button variant="danger">Hapus artikel</Button>
                    </div>
                    <div>
                      <p className="mb-3 font-interface text-caption text-text-secondary">Ukuran</p>
                      <div className="flex flex-wrap items-center gap-4">
                        <Button size="sm">Kecil</Button>
                        <Button size="md">Sedang</Button>
                        <Button size="lg">Besar</Button>
                      </div>
                    </div>
                  </div>
                )}
              </Panels>
              <p className="mt-4 max-w-xl font-display text-sm italic leading-relaxed text-text-secondary">
                Tombol hapus tidak langsung menghapus: klik pertama mengubah label menjadi “Yakin hapus? Ya · Batal”, baru klik kedua yang menjalankan. (Polanya dibangun saat tombol ini dipakai di halaman.)
              </p>
            </Section>

            {/* 04 TAUTAN */}
            <Section
              id="tautan"
              n="04"
              title="Tautan"
              lead={<p>Diam: garis tipis di dasar kata. Hover: tinta naik memenuhi kata. Sama dengan tombol teks, sehingga pembaca belajar satu gerak saja.</p>}
            >
              <p className="max-w-xl font-display text-body-base leading-relaxed text-text-primary">
                Defisit tahun ini disebut turun, tetapi{' '}
                <Link href="#tautan">bunga utang yang jatuh tempo</Link> naik lebih cepat. Baca juga{' '}
                <Link href="#tautan">metodologi kami</Link> dan{' '}
                <Link href="#tautan" variant="muted">catatan koreksi</Link>.
              </p>
              <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2 border-t border-border-default/15 pt-6">
                <Link href="#tautan" variant="nav">Beranda</Link>
                <Link href="#tautan" variant="nav">Argumen</Link>
                <Link href="#tautan" variant="nav">Angka</Link>
                <Link href="#tautan" variant="nav">Tentang</Link>
              </div>
            </Section>

            {/* 05 FORMULIR */}
            <Section
              id="formulir"
              n="05"
              title="Formulir"
              lead={
                <>
                  <p>Isian berupa garis di atas kertas, seperti formulir cetak. Tidak ada kotak dan tidak ada warna fokus: saat difokus garis menebal dan penuh tinta.</p>
                  <p>Teks ditulis dengan serif; petunjuk miring. Label huruf kapital kecil.</p>
                </>
              }
            >
              <div className="grid max-w-xl gap-10">
                <Field label="Surel" hint="Dipakai hanya untuk masuk.">
                  <Input type="email" placeholder="nama@contoh.id" />
                </Field>
                <Field label="Nama pengguna" error="Hanya huruf kecil, angka, dan tanda hubung.">
                  <Input defaultValue="Nama Saya!" />
                </Field>
                <div>
                  <Button arrow>Masuk</Button>
                </div>
              </div>
            </Section>

            {/* 06 PENANDA */}
            <Section
              id="penanda"
              n="06"
              title="Penanda"
              lead={
                <>
                  <p>Status dibedakan oleh bentuk, bukan warna. Berlian logo menjadi bahasanya: terisi berarti aktif, kosong berarti belum, separuh berarti sedang dikerjakan, dicoret berarti ditarik.</p>
                  <p>Tanpa kapsul, tanpa latar, tanpa hijau-kuning-biru.</p>
                </>
              }
            >
              <ul className="divide-y divide-border-default/15 border-y border-border-default/15">
                {(
                  [
                    ['Utang yang tak pernah selesai dibicarakan', 'success', 'Diterbitkan'],
                    ['Mengapa angka kemiskinan sulit dibandingkan', 'warning', 'Ditinjau'],
                    ['Catatan awal tentang pajak karbon', 'default', 'Draf'],
                    ['Opini yang ditarik atas permintaan penulis', 'danger', 'Disembunyikan'],
                  ] as const
                ).map(([title, variant, label]) => (
                  <li key={title} className="flex items-center justify-between gap-6 py-4">
                    <span className={`font-display text-base ${variant === 'danger' ? 'text-text-secondary' : 'text-text-primary'}`}>
                      {title}
                    </span>
                    <Badge variant={variant}>{label}</Badge>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
                <Badge variant="category">Kategori</Badge>
                <Badge variant="kicker">Kicker</Badge>
              </div>
            </Section>

            {/* 07 AVATAR */}
            <Section
              id="avatar"
              n="07"
              title="Avatar"
              lead={<p>Satu-satunya bentuk bulat di sistem ini — sengaja, agar wajah pembaca dan penulis menonjol di antara sudut tajam. Tanpa foto: huruf pertama di atas tinta.</p>}
            >
              <div className="flex items-end gap-6">
                <Avatar name="Putri Ayu" size="sm" />
                <Avatar name="Putri Ayu" size="md" />
                <Avatar name="Putri Ayu" size="lg" />
                <div className="ml-4 flex -space-x-2">
                  {['Budi', 'Citra', 'Dimas', 'Eka'].map((n) => (
                    <Avatar key={n} name={n} size="md" className="ring-2 ring-paper" />
                  ))}
                </div>
              </div>
            </Section>

            {/* 08 NOTIFIKASI */}
            <Section
              id="notifikasi"
              n="08"
              title="Notifikasi"
              lead={
                <>
                  <p>Keping malam yang naik dari tepi bawah: label kecil, satu kalimat serif, tindakan lanjutan. Garis tipis di dasar menunjukkan sisa waktu dan berhenti saat kursor di atasnya.</p>
                  <p>Gagal ditandai garis merah di tepi kiri, selalu dengan cara mencoba lagi.</p>
                </>
              }
            >
              <div className="space-y-3 border-y border-border-default/15 py-8">
                <ToastView live={false} item={{ message: 'Tautan artikel disalin ke papan klip.', label: 'Disalin' }} />
                <ToastView
                  live={false}
                  item={{ message: 'Artikel masuk ke Daftar Bacaan Anda.', tone: 'success', action: { label: 'Lihat' } }}
                />
                <ToastView
                  live={false}
                  item={{ message: 'Komentar belum terkirim. Periksa koneksi Anda.', tone: 'danger', action: { label: 'Coba lagi' } }}
                />
              </div>
              <div className="mt-6">
                <Caption>Coba</Caption>
                <ToastDemo />
              </div>
            </Section>

            {/* 09 IKON */}
            <Section
              id="ikon"
              n="09"
              title="Ikon"
              lead={
                <>
                  <p>Digambar sendiri dengan aturan yang sama: grid 24, goresan 1,5, ujung dan sambungan tajam. Hati bersegi seperti permata, penanda buku berpangkal V, gelembung bertaring siku.</p>
                  <p>Toggle berubah dari garis menjadi isi penuh. Ikon merek memakai bentuk berlian logo.</p>
                </>
              }
            >
              <Caption>Inti</Caption>
              <div className="grid grid-cols-3 border-l border-t border-border-default/20 sm:grid-cols-5">
                {coreIconNames.map((name) => (
                  <div key={name} className="flex flex-col items-center gap-5 border-b border-r border-border-default/20 px-2 py-8">
                    <Icon name={name} size="lg" className="h-10 w-10 text-text-primary" />
                    <span className="font-mono text-caption text-text-tertiary">{name}</span>
                  </div>
                ))}
              </div>

              <Caption>
                <span className="mt-10 block">Merek</span>
              </Caption>
              <div className="grid grid-cols-3 border-l border-t border-border-default/20 sm:grid-cols-4">
                {brandNames.map((name) => (
                  <div key={name} className="flex flex-col items-center gap-5 border-b border-r border-border-default/20 px-2 py-8">
                    <Icon name={name} size="lg" className="h-10 w-10 text-text-primary" />
                    <span className="font-mono text-caption text-text-tertiary">{name.replace('brand-', '')}</span>
                  </div>
                ))}
              </div>

              <Caption>
                <span className="mt-10 block">Dalam konteks — aksi artikel</span>
              </Caption>
              <div className="flex items-center justify-between border-y border-border-default/20 py-2">
                <div className="flex items-center">
                  <div className="flex items-center">
                    <IconButton icon="heart" label="Suka" pressed />
                    <span className="mr-4 font-mono text-caption text-text-secondary">128</span>
                  </div>
                  <IconButton icon="bookmark" label="Simpan" pressed={false} />
                  <IconButton icon="share" label="Bagikan" />
                  <div className="flex items-center">
                    <IconButton icon="comment" label="Komentar" />
                    <span className="font-mono text-caption text-text-secondary">14</span>
                  </div>
                </div>
                <IconButton icon="more" label="Menu lainnya" />
              </div>
              <p className="mt-3 font-interface text-caption text-text-secondary">
                Hover pada ikon: tinta naik dari bawah. Suka sedang aktif (terisi).
              </p>
            </Section>
          </div>
        </div>
      </div>
    </main>
  )
}
