// Halaman internal sistem desain — satu tempat untuk melihat semua token dan komponen.
// Hanya tersedia di lokal dan preview Vercel; di produksi mengembalikan 404.
// Setiap komponen baru wajib didemokan di sini sebelum dipakai di halaman.

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Avatar, Badge, Button, Divider, Field, Icon, IconButton, Input, iconNames } from '@/components/ui'
import ToastDemo from './ToastDemo'

export const metadata: Metadata = {
  title: 'Sistem Desain — Saintifiks',
  robots: { index: false, follow: false },
}

const surfaceColors = [
  ['paper', 'bg-paper'],
  ['surface-sunken', 'bg-surface-sunken'],
  ['ink', 'bg-ink'],
  ['night', 'bg-night'],
] as const

const textColors = [
  ['ink', 'text-ink'],
  ['warm-gray', 'text-warm-gray'],
  ['tertiary', 'text-text-tertiary'],
  ['link (aksen)', 'text-text-link'],
] as const

const signalColors = [
  ['signal-success', 'bg-signal-success'],
  ['signal-warning', 'bg-signal-warning'],
  ['signal-danger', 'bg-signal-danger'],
  ['signal-info', 'bg-signal-info'],
] as const

const typeScale = [
  ['display-lg', 'text-display-lg', 'Mereka punya narasi'],
  ['display-base', 'text-display-base', 'Mereka punya narasi, kami punya angka'],
  ['display-sm', 'text-display-sm', 'Mereka punya narasi, kami punya angka'],
  ['body-lg', 'text-body-lg', 'Isi artikel di layar lebar dibaca dengan nyaman.'],
  ['body-base', 'text-body-base', 'Isi artikel di ponsel dibaca dengan nyaman.'],
  ['caption-lg', 'text-caption-lg', 'Keterangan gambar dan metadata'],
  ['kicker', 'text-kicker uppercase', 'Kicker · Bagian'],
] as const

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="py-10 border-t border-border-default/15">
      <h2 className="font-display text-display-sm text-text-primary">{title}</h2>
      {note && <p className="mt-2 max-w-2xl font-interface text-body-sm text-text-secondary">{note}</p>}
      <div className="mt-6">{children}</div>
    </section>
  )
}

export default function DesignSystemPage() {
  if (process.env.VERCEL_ENV === 'production') notFound()

  return (
    <main className="min-h-screen bg-surface-page">
      <div className="mx-auto max-w-5xl px-5 pb-24 pt-10">
        <p className="font-mono text-kicker uppercase text-text-link">Internal · tidak diindeks</p>
        <h1 className="mt-2 font-display text-display-base text-text-primary">Sistem Desain Saintifiks</h1>
        <p className="mt-3 max-w-2xl font-interface text-body-sm text-text-secondary">
          Rujukan hidup untuk token dan komponen. Ganti tema dengan ikon bulan/matahari di header untuk memeriksa
          mode gelap. Aturan: warna, ukuran, dan ikon hanya dari halaman ini.
        </p>

        <Section title="Warna" note="Hanya token semantik di komponen. Hitam–putih hangat sebagai dasar, satu aksen (teal) untuk tautan dan status aktif.">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {surfaceColors.map(([name, cls]) => (
              <div key={name}>
                <div className={`h-16 border border-border-default/20 ${cls}`} />
                <p className="mt-2 font-mono text-caption text-text-secondary">{name}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {textColors.map(([name, cls]) => (
              <p key={name} className={`font-display text-2xl ${cls}`}>
                Aa <span className="font-mono text-caption">{name}</span>
              </p>
            ))}
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {signalColors.map(([name, cls]) => (
              <div key={name}>
                <div className={`h-10 ${cls}`} />
                <p className="mt-2 font-mono text-caption text-text-secondary">{name}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Tipografi"
          note="Libre Baskerville (hanya bobot 400 & 700 + miring) untuk judul dan isi; IBM Plex Sans untuk antarmuka; Plex Mono untuk angka dan label. Hierarki dibangun dari ukuran, miring, dan huruf kapital — bukan bobot menengah."
        >
          <div className="space-y-5">
            {typeScale.map(([name, cls, sample]) => (
              <div key={name} className="grid gap-1 sm:grid-cols-[140px_1fr] sm:items-baseline">
                <span className="font-mono text-caption text-text-tertiary">{name}</span>
                <span className={`font-display text-text-primary ${cls}`}>{sample}</span>
              </div>
            ))}
            <div className="grid gap-1 sm:grid-cols-[140px_1fr] sm:items-baseline">
              <span className="font-mono text-caption text-text-tertiary">interface</span>
              <span className="font-interface text-base text-text-primary">Tombol, menu, dan metadata memakai IBM Plex Sans.</span>
            </div>
            <div className="grid gap-1 sm:grid-cols-[140px_1fr] sm:items-baseline">
              <span className="font-mono text-caption text-text-tertiary">mono</span>
              <span className="font-mono text-base text-text-primary">Rp 16.250 · +2,4% · 03/11/2026</span>
            </div>
          </div>
        </Section>

        <Section title="Tombol" note="Empat varian × tiga ukuran. Tinggi minimal 44px untuk target sentuh.">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Utama</Button>
            <Button variant="secondary">Sekunder</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Hapus</Button>
            <Button variant="link">Tautan</Button>
            <Button disabled>Nonaktif</Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button size="sm">Kecil</Button>
            <Button size="md">Sedang</Button>
            <Button size="lg">Besar</Button>
          </div>
        </Section>

        <Section title="Tombol ikon" note="Wajib punya label (untuk pembaca layar). Toggle memakai aria-pressed dan ikon terisi saat aktif.">
          <div className="flex flex-wrap items-center gap-3">
            <IconButton icon="heart" label="Suka" />
            <IconButton icon="heart" label="Batal suka" pressed />
            <IconButton icon="bookmark" label="Simpan" variant="outline" />
            <IconButton icon="bookmark" label="Hapus dari simpanan" variant="outline" pressed />
            <IconButton icon="share" label="Bagikan" variant="outline" />
            <IconButton icon="send" label="Mengirim" variant="solid" busy />
            <IconButton icon="more" label="Menu lainnya" />
          </div>
        </Section>

        <Section title="Formulir" note="Field menyambungkan label, petunjuk, dan pesan galat ke input secara otomatis.">
          <div className="grid max-w-xl gap-6">
            <Field label="Surel" hint="Dipakai hanya untuk masuk.">
              <Input type="email" placeholder="nama@contoh.id" />
            </Field>
            <Field label="Nama pengguna" error="Hanya huruf kecil, angka, dan tanda hubung.">
              <Input defaultValue="Nama Saya!" />
            </Field>
          </div>
        </Section>

        <Section title="Lencana, avatar, pemisah">
          <div className="flex flex-wrap items-center gap-4">
            <Badge variant="kicker">Kicker</Badge>
            <Badge variant="category">Kategori</Badge>
            <Badge>Default</Badge>
            <Badge variant="success">Diterbitkan</Badge>
            <Badge variant="warning">Ditinjau</Badge>
            <Badge variant="danger">Disembunyikan</Badge>
            <Avatar name="Putri Ayu" size="sm" />
            <Avatar name="Putri Ayu" size="md" />
            <Avatar name="Putri Ayu" size="lg" />
          </div>
          <Divider spacing="md" className="mt-6" />
        </Section>

        <Section title="Notifikasi (toast)" note="Satu kalimat pendek, tanpa tanda seru. Gagal selalu menawarkan cara mencoba lagi.">
          <ToastDemo />
        </Section>

        <Section
          title="Ikon"
          note="Hanya lewat <Icon>: 3 ukuran (16/20/24), goresan 1,5. Ikon merek memakai bentuk berlian logo dan diprefiks brand-."
        >
          <div className="grid grid-cols-3 gap-px bg-border-default/15 sm:grid-cols-5 lg:grid-cols-8">
            {iconNames.map((name) => (
              <div key={name} className="flex flex-col items-center gap-3 bg-surface-page px-2 py-5">
                <Icon name={name} size="lg" className={name.startsWith('brand-') ? 'text-text-link' : 'text-text-primary'} />
                <span className="font-mono text-caption text-text-tertiary">{name}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-6 text-text-primary">
            <span className="flex items-center gap-2 font-interface text-sm"><Icon name="brand-koreksi" size="sm" /> 16</span>
            <span className="flex items-center gap-2 font-interface text-sm"><Icon name="brand-koreksi" size="md" /> 20</span>
            <span className="flex items-center gap-2 font-interface text-sm"><Icon name="brand-koreksi" size="lg" /> 24</span>
          </div>
        </Section>
      </div>
    </main>
  )
}
