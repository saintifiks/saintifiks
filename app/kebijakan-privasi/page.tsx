import type { Metadata } from 'next'
import { Badge, Link } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Pusat Privasi (Draf) — Saintifiks',
  description:
    'Draf Pusat Privasi Saintifiks: cara kami membatasi pengumpulan data, mengukur penggunaan, dan menyiapkan pelaksanaan hak pembaca.',
  robots: {
    index: false,
    follow: false,
  },
}

const navigation = [
  { href: '#ringkasan', label: 'Ringkasan' },
  { href: '#membaca', label: 'Saat Anda membaca' },
  { href: '#pengukuran', label: 'Pengukuran situs' },
  { href: '#akun-interaksi', label: 'Akun dan interaksi' },
  { href: '#retensi', label: 'Data dan retensi' },
  { href: '#vendor', label: 'Vendor dan transfer' },
  { href: '#hak', label: 'Hak dan permintaan' },
  { href: '#jurnalisme', label: 'Jurnalisme dan privasi' },
  { href: '#keamanan', label: 'Keamanan dan insiden' },
  { href: '#kebijakan-lengkap', label: 'Kebijakan lengkap' },
]

const currentPractices = [
  {
    context: 'Pengukuran pembaca',
    data: 'Path, jenis event, session_id, dan metadata event',
    identity: 'Event baru tidak mengisi user_id',
    status: 'Terverifikasi dalam kode',
    verified: true,
  },
  {
    context: 'Komentar',
    data: 'Isi komentar, waktu, dan relasi akun internal',
    identity: 'API publik tidak mengirim user_id',
    status: 'Terverifikasi dalam kode',
    verified: true,
  },
  {
    context: 'Share',
    data: 'ID konten dan platform tujuan',
    identity: 'Event baru tidak mengisi user_id',
    status: 'Terverifikasi dalam kode',
    verified: true,
  },
  {
    context: 'Login Google',
    data: 'Scope dan claim yang diterima belum diaudit dari konfigurasi produksi',
    identity: 'Terhubung ke akun atas pilihan pengguna',
    status: 'Perlu bukti produksi',
    verified: false,
  },
]

const publicationGates = [
  'Identitas, status organisasi, alamat, dan kontak pengendali data',
  'Region, plan, log, backup, DPA, dan subprocessor vendor yang benar-benar digunakan',
  'Jadwal retensi serta alur penghapusan untuk database, Auth, Storage, log, dan backup',
  'Kanal dan SOP untuk akses, koreksi, penghapusan, pembatasan, serta banding',
  'Scope dan claim Google OAuth yang diambil dari konfigurasi produksi',
  'Penilaian perlindungan anak serta review dasar pemrosesan dan transfer data',
]

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description?: string
}) {
  return (
    <header className="mb-5">
      <p className="font-interface text-kicker font-semibold uppercase tracking-widest text-text-link">
        {eyebrow}
      </p>
      <h2 className="mt-2 font-display text-2xl font-bold leading-tight text-text-primary md:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 font-lora text-body-base leading-reading text-text-secondary md:text-body-lg">
          {description}
        </p>
      ) : null}
    </header>
  )
}

export default function KebijakanPrivasiPage() {
  return (
    <main className="min-h-screen bg-surface-page text-text-primary">
      <div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-20">
        <header className="max-w-3xl">
          <Badge variant="kicker">Pusat Privasi</Badge>
          <h1 className="mt-4 font-display text-display-sm font-bold leading-tight text-text-primary md:text-display-base">
            Privasi untuk kebebasan membaca
          </h1>
          <p className="mt-5 max-w-[65ch] font-lora text-body-base leading-reading text-text-secondary md:text-body-lg">
            Saintifiks ingin pembaca dapat membaca, menimbang, dan membentuk pendapat tanpa
            membangun histori bacaan yang terhubung ke akun. Halaman ini membedakan praktik yang
            sudah terbukti dari pekerjaan yang masih harus diselesaikan.
          </p>
          <p className="mt-5 font-interface text-sm text-text-tertiary">
            Draf 0.1 <span aria-hidden="true">·</span> Diperbarui 6 Agustus 2026{' '}
            <span aria-hidden="true">·</span> Belum berlaku sebagai kebijakan publik
          </p>
        </header>

        <section
          aria-labelledby="draft-status-title"
          className="mt-10 max-w-3xl border-l-4 border-signal-warning bg-signal-warning-surface px-5 py-5 md:px-6"
        >
          <h2
            id="draft-status-title"
            className="font-interface text-base font-semibold text-text-primary"
          >
            Belum siap dipublikasikan
          </h2>
          <p className="mt-2 font-interface text-sm leading-relaxed text-text-secondary">
            Struktur dan bahasa visual halaman ini dapat ditinjau, tetapi fakta organisasi,
            vendor, retensi, hak pengguna, dan penghapusan belum lengkap. Karena itu halaman draf
            ini sengaja tidak diindeks mesin pencari dan tidak membuat klaim yang belum mempunyai
            bukti.
          </p>
        </section>

        <section
          id="ringkasan"
          aria-labelledby="ringkasan-title"
          className="scroll-mt-24 mt-14 border-y border-border-default/15 py-8 md:mt-16 md:py-10"
        >
          <h2 id="ringkasan-title" className="sr-only">
            Ringkasan prinsip privasi
          </h2>
          <div className="grid gap-8 md:grid-cols-3 md:gap-10">
            <div>
              <p className="font-interface text-kicker font-semibold uppercase tracking-widest text-text-link">
                Membaca
              </p>
              <h3 className="mt-2 font-display text-xl font-bold text-text-primary">
                Tidak memerlukan akun
              </h3>
              <p className="mt-3 font-lora text-base leading-relaxed text-text-secondary">
                Artikel publik dapat dibaca tanpa login. Akun hanya dibutuhkan ketika seseorang
                memilih menggunakan fitur yang memerlukan identitas atau kepemilikan.
              </p>
            </div>
            <div>
              <p className="font-interface text-kicker font-semibold uppercase tracking-widest text-text-link">
                Mengukur
              </p>
              <h3 className="mt-2 font-display text-xl font-bold text-text-primary">
                Dipisahkan dari akun
              </h3>
              <p className="mt-3 font-lora text-base leading-relaxed text-text-secondary">
                Event analitik baru tidak menyimpan ID akun. Session identifier masih digunakan
                dan menjadi bagian pekerjaan lanjutan untuk retensi serta agregasi.
              </p>
            </div>
            <div>
              <p className="font-interface text-kicker font-semibold uppercase tracking-widest text-text-link">
                Membuktikan
              </p>
              <h3 className="mt-2 font-display text-xl font-bold text-text-primary">
                Klaim mengikuti bukti
              </h3>
              <p className="mt-3 font-lora text-base leading-relaxed text-text-secondary">
                Saintifiks tidak akan menyebut suatu praktik aman, anonim, atau terhapus sebelum
                konfigurasi, data, dan proses operasionalnya dapat diuji.
              </p>
            </div>
          </div>
        </section>

        <details className="mt-8 border border-border-default/20 bg-surface-elevated px-4 py-3 lg:hidden">
          <summary className="min-h-[44px] cursor-pointer py-2 font-interface text-sm font-semibold text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary">
            Daftar isi
          </summary>
          <nav aria-label="Daftar isi Pusat Privasi" className="pb-3 pt-2">
            <ol className="space-y-1">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    variant="nav"
                    className="flex min-h-[44px] items-center border-t border-border-default/10 py-2"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        </details>

        <div className="mt-12 lg:grid lg:grid-cols-[240px_minmax(0,680px)] lg:gap-16 xl:gap-24">
          <aside className="hidden lg:block" aria-label="Navigasi Pusat Privasi">
            <nav className="sticky top-24 border-l border-border-default/20 pl-5">
              <p className="mb-3 font-interface text-kicker font-semibold uppercase tracking-widest text-text-tertiary">
                Di halaman ini
              </p>
              <ol className="space-y-1">
                {navigation.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      variant="muted"
                      className="inline-flex min-h-[44px] items-center py-2 font-interface text-sm"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <article className="min-w-0">
            <section id="membaca" className="scroll-mt-24">
              <SectionHeading
                eyebrow="01 — Membaca"
                title="Saat Anda membaca"
                description="Membaca konten publik tidak memerlukan akun. Server dan penyedia infrastruktur tetap memproses data teknis yang dibutuhkan untuk mengirim halaman dan membatasi penyalahgunaan."
              />
              <p className="font-lora text-body-base leading-reading text-text-primary md:text-body-lg">
                Saintifiks belum menyatakan bahwa aktivitas membaca sepenuhnya anonim. Path halaman,
                event penggunaan, session identifier, serta data jaringan pada lapisan hosting masih
                memerlukan inventaris dan jadwal retensi yang lengkap. Target akhirnya adalah
                pengukuran agregat yang tidak dapat dipakai untuk membangun profil bacaan individual.
              </p>
            </section>

            <section
              id="pengukuran"
              className="scroll-mt-24 mt-14 border-t border-border-default/15 pt-12"
            >
              <SectionHeading
                eyebrow="02 — Pengukuran"
                title="Apa yang dicatat saat ini"
                description="Tabel ini membedakan kontrol yang sudah terlihat dalam kode dari fakta produksi yang masih memerlukan bukti."
              />

              <div className="space-y-4 sm:hidden">
                {currentPractices.map((item) => (
                  <dl
                    key={item.context}
                    className="border border-border-default/15 bg-surface-elevated p-4"
                  >
                    <div>
                      <dt className="font-interface text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                        Konteks
                      </dt>
                      <dd className="mt-1 font-interface text-sm font-semibold text-text-primary">
                        {item.context}
                      </dd>
                    </div>
                    <div className="mt-4">
                      <dt className="font-interface text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                        Data
                      </dt>
                      <dd className="mt-1 font-interface text-sm leading-relaxed text-text-secondary">
                        {item.data}
                      </dd>
                    </div>
                    <div className="mt-4">
                      <dt className="font-interface text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                        Hubungan identitas
                      </dt>
                      <dd className="mt-1 font-interface text-sm leading-relaxed text-text-secondary">
                        {item.identity}
                      </dd>
                    </div>
                    <div className="mt-4">
                      <dt className="sr-only">Status bukti</dt>
                      <dd>
                        <span
                          className={`inline-flex px-2 py-1 font-interface text-xs font-medium ${
                            item.verified
                              ? 'bg-signal-success-surface text-signal-success'
                              : 'bg-signal-warning-surface text-text-secondary'
                          }`}
                        >
                          {item.status}
                        </span>
                      </dd>
                    </div>
                  </dl>
                ))}
              </div>

              <div className="hidden overflow-x-auto border border-border-default/15 sm:block">
                <table className="w-full border-collapse text-left">
                  <caption className="sr-only">
                    Praktik data dan status verifikasinya
                  </caption>
                  <thead className="bg-surface-sunken/50">
                    <tr>
                      <th className="px-4 py-3 font-interface text-xs font-semibold uppercase tracking-wider text-text-secondary">
                        Konteks
                      </th>
                      <th className="px-4 py-3 font-interface text-xs font-semibold uppercase tracking-wider text-text-secondary">
                        Data dan identitas
                      </th>
                      <th className="px-4 py-3 font-interface text-xs font-semibold uppercase tracking-wider text-text-secondary">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPractices.map((item) => (
                      <tr key={item.context} className="border-t border-border-default/10">
                        <th
                          scope="row"
                          className="w-1/4 px-4 py-4 align-top font-interface text-sm font-semibold text-text-primary"
                        >
                          {item.context}
                        </th>
                        <td className="px-4 py-4 align-top font-interface text-sm leading-relaxed text-text-secondary">
                          <p>{item.data}</p>
                          <p className="mt-1 text-text-primary">{item.identity}</p>
                        </td>
                        <td className="w-1/4 px-4 py-4 align-top">
                          <span
                            className={`inline-flex px-2 py-1 font-interface text-xs font-medium ${
                              item.verified
                                ? 'bg-signal-success-surface text-signal-success'
                                : 'bg-signal-warning-surface text-text-secondary'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section
              id="akun-interaksi"
              className="scroll-mt-24 mt-14 border-t border-border-default/15 pt-12"
            >
              <SectionHeading eyebrow="03 — Pilihan pengguna" title="Akun dan interaksi" />
              <div className="space-y-6 font-lora text-body-base leading-reading text-text-primary md:text-body-lg">
                <p>
                  Login dibutuhkan untuk tindakan yang memerlukan kepemilikan atau akuntabilitas,
                  seperti mengirim komentar dan mengelola publikasi Opinions. Membaca artikel tidak
                  memerlukan login.
                </p>
                <p>
                  Komentar tetap mempunyai relasi internal dengan akun untuk autentikasi dan
                  moderasi, tetapi respons API publik tidak menampilkan ID akun. Event share baru
                  hanya menyimpan ID konten dan platform, bukan ID akun.
                </p>
                <p>
                  Rincian data yang diterima dari Google, masa hidup sesi, penghapusan akun, profil
                  publik, likes, laporan, dan koreksi belum boleh dijelaskan secara final sebelum
                  audit konfigurasi dan lifecycle selesai.
                </p>
              </div>
            </section>

            <section
              id="retensi"
              className="scroll-mt-24 mt-14 border-t border-border-default/15 pt-12"
            >
              <SectionHeading
                eyebrow="04 — Lifecycle"
                title="Data dan retensi"
                description="Saintifiks belum menetapkan angka retensi publik yang dapat dibuktikan untuk setiap sistem. Angka tidak akan diterka atau disalin dari kebijakan vendor."
              />
              <div className="border-l-4 border-border-accent bg-signal-info-surface px-5 py-5">
                <p className="font-interface text-sm leading-relaxed text-text-primary">
                  Jadwal final harus membedakan database aktif, autentikasi, Storage, analytics,
                  rate limiting, runtime logs, backup, moderasi, dan arsip jurnalistik. Penghapusan
                  dari layanan aktif juga harus dibedakan dari kedaluwarsa backup.
                </p>
              </div>
            </section>

            <section
              id="vendor"
              className="scroll-mt-24 mt-14 border-t border-border-default/15 pt-12"
            >
              <SectionHeading
                eyebrow="05 — Infrastruktur"
                title="Vendor dan transfer"
                description="Saintifiks menggunakan layanan eksternal untuk hosting, database, autentikasi, dan login. Peran serta konfigurasi aktualnya harus dijelaskan secara terpisah."
              />
              <dl className="divide-y divide-border-default/15 border-y border-border-default/15">
                <div className="grid gap-1 py-5 sm:grid-cols-[160px_1fr] sm:gap-6">
                  <dt className="font-interface text-sm font-semibold text-text-primary">Supabase</dt>
                  <dd className="font-interface text-sm leading-relaxed text-text-secondary">
                    Database dan autentikasi. Region, plan, backup, log, dan DPA aktual masih harus
                    dibuktikan dari tenant produksi.
                  </dd>
                </div>
                <div className="grid gap-1 py-5 sm:grid-cols-[160px_1fr] sm:gap-6">
                  <dt className="font-interface text-sm font-semibold text-text-primary">Vercel</dt>
                  <dd className="font-interface text-sm leading-relaxed text-text-secondary">
                    Hosting dan runtime. Plan, lokasi pemrosesan, log, serta kecocokan kontrak masih
                    harus diverifikasi.
                  </dd>
                </div>
                <div className="grid gap-1 py-5 sm:grid-cols-[160px_1fr] sm:gap-6">
                  <dt className="font-interface text-sm font-semibold text-text-primary">Google</dt>
                  <dd className="font-interface text-sm leading-relaxed text-text-secondary">
                    Penyedia login yang digunakan hanya ketika pengguna memilih masuk. Scope dan
                    claim produksi belum dicantumkan sebelum audit konfigurasi.
                  </dd>
                </div>
              </dl>
            </section>

            <section
              id="hak"
              className="scroll-mt-24 mt-14 border-t border-border-default/15 pt-12"
            >
              <SectionHeading
                eyebrow="06 — Kendali"
                title="Hak dan permintaan"
                description="Pusat Privasi harus menyediakan jalur yang dapat benar-benar dijalankan, bukan sekadar daftar hak."
              />
              <p className="font-lora text-body-base leading-reading text-text-primary md:text-body-lg">
                Kanal khusus, verifikasi identitas yang proporsional, pencatatan tenggat, review
                editorial, pengecualian, dan banding masih harus dibangun sebelum tombol permintaan
                data atau penghapusan ditampilkan. Usulan koreksi atas isi artikel tetap dapat
                disampaikan melalui halaman{' '}
                <Link href="/koreksi">Sampaikan Koreksi dan Klarifikasi</Link>.
              </p>
            </section>

            <section
              id="jurnalisme"
              className="scroll-mt-24 mt-14 border-t border-border-default/15 pt-12"
            >
              <SectionHeading
                eyebrow="07 — Kepentingan publik"
                title="Jurnalisme dan privasi"
                description="Data produk dan data jurnalistik tidak boleh diperlakukan sebagai satu sistem."
              />
              <p className="font-lora text-body-base leading-reading text-text-primary md:text-body-lg">
                Permintaan mengenai akun berbeda dari permintaan mengenai seseorang yang disebut
                dalam artikel, arsip, hak jawab, koreksi, atau perlindungan narasumber. Setiap kasus
                jurnalistik memerlukan penilaian akurasi, kepentingan publik, dampak, keselamatan,
                serta kewajiban hukum dan etik. Kanal sumber aman tidak boleh digabung dengan form
                dukungan umum.
              </p>
            </section>

            <section
              id="keamanan"
              className="scroll-mt-24 mt-14 border-t border-border-default/15 pt-12"
            >
              <SectionHeading
                eyebrow="08 — Perlindungan"
                title="Anak, keamanan, dan insiden"
                description="Kontrol keamanan dan perlindungan pengguna rentan harus dijelaskan berdasarkan hasil audit, bukan daftar standar yang diasumsikan sudah aktif."
              />
              <p className="font-lora text-body-base leading-reading text-text-primary md:text-body-lg">
                Penilaian akses anak, pengamanan akun administratif, RLS dan grant, incident
                response, notifikasi kebocoran, upload, hotlink gambar, serta perlindungan sumber
                masih mempunyai pekerjaan verifikasi tersendiri. Halaman final akan menyebut kontrol,
                kanal darurat, batas, dan tanggal pengujiannya secara spesifik.
              </p>
            </section>

            <section
              id="kebijakan-lengkap"
              className="scroll-mt-24 mt-14 border-t border-border-default/15 pt-12"
            >
              <SectionHeading
                eyebrow="09 — Kesiapan publikasi"
                title="Yang harus selesai sebelum kebijakan berlaku"
                description="Model kebijakan lengkap sudah tersedia dalam laporan riset, tetapi bagian yang belum diketahui tidak boleh diganti dengan asumsi."
              />
              <ul className="space-y-3" aria-label="Syarat publikasi Kebijakan Privasi">
                {publicationGates.map((gate) => (
                  <li
                    key={gate}
                    className="flex gap-3 border-t border-border-default/10 pt-3 font-interface text-sm leading-relaxed text-text-secondary first:border-t-0 first:pt-0"
                  >
                    <span aria-hidden="true" className="mt-1 text-signal-warning">
                      —
                    </span>
                    <span>{gate}</span>
                  </li>
                ))}
              </ul>
            </section>

            <footer className="mt-14 border-t-2 border-border-strong/40 pt-6">
              <p className="font-interface text-sm font-semibold text-text-primary">
                Status dokumen: draf desain dan transparansi
              </p>
              <p className="mt-2 font-interface text-sm leading-relaxed text-text-secondary">
                Versi 0.1, 6 Agustus 2026. Belum mempunyai tanggal berlaku dan tidak menggantikan
                proses verifikasi, review hukum, atau kontrol teknis yang disebut di atas.
              </p>
            </footer>
          </article>
        </div>
      </div>
    </main>
  )
}
