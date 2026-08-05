import type { Metadata } from 'next'
import { Badge, Link } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Pusat Privasi (Draf) — Saintifiks',
  description:
    'Draf Pusat Privasi Saintifiks tentang data yang diproses saat membaca, menggunakan akun, berinteraksi, dan menerbitkan konten.',
  robots: {
    index: false,
    follow: false,
  },
}

const navigation = [
  { href: '#ringkasan', label: 'Ringkasan' },
  { href: '#data-yang-diproses', label: 'Data yang diproses' },
  { href: '#pengukuran', label: 'Pengukuran situs' },
  { href: '#akun-interaksi', label: 'Akun dan interaksi' },
  { href: '#perangkat-pihak-lain', label: 'Perangkat dan pihak lain' },
  { href: '#retensi', label: 'Penyimpanan dan penghapusan' },
  { href: '#hak', label: 'Hak dan permintaan' },
  { href: '#jurnalisme', label: 'Jurnalisme dan privasi' },
  { href: '#keamanan-anak', label: 'Keamanan dan anak' },
  { href: '#perubahan-kontak', label: 'Perubahan dan kontak' },
]

const dataOverview = [
  {
    activity: 'Membaca',
    data: 'Halaman yang dibuka, waktu kejadian, event pengukuran, session identifier, serta data jaringan yang diproses penyedia hosting.',
    purpose: 'Mengirim halaman, memahami apakah konten terbaca, dan membatasi penyalahgunaan.',
    visibility: 'Tidak ditampilkan kepada publik.',
  },
  {
    activity: 'Menggunakan akun',
    data: 'Data akun yang diterima melalui login Google, pengenal akun internal, dan informasi sesi.',
    purpose: 'Mengautentikasi pengguna dan menjaga kepemilikan tindakan atau konten.',
    visibility: 'Data akun tetap privat kecuali pengguna memilih membuat profil publik.',
  },
  {
    activity: 'Berinteraksi',
    data: 'Komentar, likes, pilihan platform share, koreksi, laporan, waktu, dan hubungan internal dengan konten terkait.',
    purpose: 'Menjalankan fitur, mencegah duplikasi, menjaga integritas editorial, serta melakukan moderasi.',
    visibility: 'Berbeda menurut fitur; dijelaskan sebelum dan sesudah tindakan terkait.',
  },
  {
    activity: 'Menulis Opinions',
    data: 'Profil yang dipilih pengguna, draf, artikel, gambar, grafik, status publikasi, dan riwayat pengelolaan.',
    purpose: 'Menyimpan, menerbitkan, dan memoderasi kontribusi penulis.',
    visibility: 'Profil dan artikel yang diterbitkan bersifat publik; draf tidak ditampilkan kepada publik.',
  },
]

const serviceProviders = [
  {
    name: 'Supabase',
    role: 'Menyediakan database, autentikasi, dan penyimpanan berkas yang digunakan Saintifiks.',
  },
  {
    name: 'Vercel',
    role: 'Mengirim situs dan menjalankan aplikasi. Dalam prosesnya, infrastruktur hosting dapat menerima data jaringan dan request.',
  },
  {
    name: 'Google',
    role: 'Mengautentikasi pengguna yang memilih masuk melalui akun Google. Membaca artikel tidak memerlukan login Google.',
  },
]

const userRights = [
  'meminta informasi dan akses atas data pribadi yang diproses Saintifiks;',
  'meminta perbaikan atau pembaruan data yang tidak tepat;',
  'meminta penghentian, pembatasan, penghapusan, atau pemusnahan apabila syaratnya terpenuhi;',
  'menarik persetujuan untuk pemrosesan yang memang bergantung pada persetujuan;',
  'mengajukan keberatan, pengaduan, atau permintaan peninjauan;',
  'meminta salinan atau portabilitas data apabila berlaku dan dapat dilaksanakan;',
  'meminta penanganan terhadap konten Saintifiks yang memuat informasi tentang dirinya.',
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
            Saintifiks ingin membatasi data yang timbul ketika Anda membaca, menimbang, dan
            membentuk pendapat. Di halaman ini kami menjelaskan apa yang diproses saat Anda membaca,
            menggunakan akun, berinteraksi, atau menerbitkan karya—beserta alasan dan siapa yang
            dapat melihatnya.
          </p>
          <p className="mt-5 font-interface text-sm text-text-tertiary">
            Draf 0.2 <span aria-hidden="true">·</span> Diperbarui 6 Agustus 2026{' '}
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
            Naskah ini masih berupa pratinjau
          </h2>
          <p className="mt-2 font-interface text-sm leading-relaxed text-text-secondary">
            Struktur dan bahasanya sedang ditinjau. Identitas resmi pengendali data, kontak privasi,
            jangka penyimpanan, rincian konfigurasi penyedia layanan, dan tanggal berlaku akan
            dicantumkan sebelum kebijakan ini dipublikasikan. Sampai saat itu, halaman ini tidak
            diindeks mesin pencari.
          </p>
        </section>

        <section
          id="ringkasan"
          aria-labelledby="ringkasan-title"
          className="scroll-mt-24 mt-14 border-y border-border-default/15 py-8 md:mt-16 md:py-10"
        >
          <h2 id="ringkasan-title" className="sr-only">
            Ringkasan privasi Saintifiks
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
                Artikel publik dapat dibaca tanpa login. Akun dibutuhkan hanya ketika Anda memilih
                menggunakan fitur yang memerlukan identitas atau kepemilikan.
              </p>
            </div>
            <div>
              <p className="font-interface text-kicker font-semibold uppercase tracking-widest text-text-link">
                Mengukur
              </p>
              <h3 className="mt-2 font-display text-xl font-bold text-text-primary">
                Tidak dihubungkan ke akun
              </h3>
              <p className="mt-3 font-lora text-base leading-relaxed text-text-secondary">
                Pengukuran penggunaan baru tidak memuat ID akun. Session identifier masih digunakan
                untuk mengelompokkan event dalam satu kunjungan dan dijelaskan secara terbuka di bawah.
              </p>
            </div>
            <div>
              <p className="font-interface text-kicker font-semibold uppercase tracking-widest text-text-link">
                Memilih
              </p>
              <h3 className="mt-2 font-display text-xl font-bold text-text-primary">
                Publik hanya saat diperlukan
              </h3>
              <p className="mt-3 font-lora text-base leading-relaxed text-text-secondary">
                Kami membedakan data privat, data yang diperlukan untuk moderasi, dan data yang Anda
                pilih untuk diterbitkan. Menjadi pengguna akun tidak otomatis membuat profil Anda publik.
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
            <section id="data-yang-diproses" className="scroll-mt-24">
              <SectionHeading
                eyebrow="01 — Gambaran umum"
                title="Data yang timbul dari pilihan Anda"
                description="Jenis data yang diproses bergantung pada cara Anda menggunakan Saintifiks. Membaca, login, berinteraksi, dan menerbitkan karya mempunyai kebutuhan serta tingkat keterlihatan yang berbeda."
              />

              <div className="space-y-4 sm:hidden">
                {dataOverview.map((item) => (
                  <dl
                    key={item.activity}
                    className="border border-border-default/15 bg-surface-elevated p-4"
                  >
                    <div>
                      <dt className="font-interface text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                        Aktivitas
                      </dt>
                      <dd className="mt-1 font-interface text-sm font-semibold text-text-primary">
                        {item.activity}
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
                        Tujuan
                      </dt>
                      <dd className="mt-1 font-interface text-sm leading-relaxed text-text-secondary">
                        {item.purpose}
                      </dd>
                    </div>
                    <div className="mt-4">
                      <dt className="font-interface text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                        Keterlihatan
                      </dt>
                      <dd className="mt-1 font-interface text-sm leading-relaxed text-text-primary">
                        {item.visibility}
                      </dd>
                    </div>
                  </dl>
                ))}
              </div>

              <div className="hidden overflow-x-auto border border-border-default/15 sm:block">
                <table className="w-full border-collapse text-left">
                  <caption className="sr-only">
                    Ringkasan data berdasarkan aktivitas pengguna
                  </caption>
                  <thead className="bg-surface-sunken/50">
                    <tr>
                      <th className="px-4 py-3 font-interface text-xs font-semibold uppercase tracking-wider text-text-secondary">
                        Aktivitas
                      </th>
                      <th className="px-4 py-3 font-interface text-xs font-semibold uppercase tracking-wider text-text-secondary">
                        Data dan tujuan
                      </th>
                      <th className="px-4 py-3 font-interface text-xs font-semibold uppercase tracking-wider text-text-secondary">
                        Keterlihatan
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataOverview.map((item) => (
                      <tr key={item.activity} className="border-t border-border-default/10">
                        <th
                          scope="row"
                          className="w-1/5 px-4 py-4 align-top font-interface text-sm font-semibold text-text-primary"
                        >
                          {item.activity}
                        </th>
                        <td className="px-4 py-4 align-top font-interface text-sm leading-relaxed text-text-secondary">
                          <p>{item.data}</p>
                          <p className="mt-2 text-text-primary">{item.purpose}</p>
                        </td>
                        <td className="w-1/4 px-4 py-4 align-top font-interface text-sm leading-relaxed text-text-secondary">
                          {item.visibility}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section
              id="pengukuran"
              className="scroll-mt-24 mt-14 border-t border-border-default/15 pt-12"
            >
              <SectionHeading
                eyebrow="02 — Pengukuran"
                title="Memahami penggunaan tanpa membuat profil pembaca"
                description="Saintifiks mengukur apakah halaman dibuka dan seberapa jauh artikel dibaca untuk mengevaluasi fungsi situs serta kualitas penyajian konten."
              />
              <div className="space-y-6 font-lora text-body-base leading-reading text-text-primary md:text-body-lg">
                <p>
                  Event yang saat ini dikirim meliputi pembukaan halaman, pencapaian kedalaman baca
                  25%, 50%, 75%, atau 100%, serta klik like. Record analitik baru tidak memuat ID akun
                  atau email, termasuk ketika pembaca sedang login.
                </p>
                <p>
                  Browser membuat session identifier acak untuk menghubungkan event dalam satu
                  kunjungan. Identifier ini tidak disimpan sebagai preferensi permanen di browser,
                  tetapi tetap dapat menghubungkan beberapa event selama sesi berlangsung. Karena itu
                  kami tidak menyebut pengukuran ini sepenuhnya anonim.
                </p>
                <p>
                  Alamat IP dipakai sementara untuk membatasi pengiriman event berlebihan dan tidak
                  dimasukkan ke catatan pengukuran Saintifiks. Penyedia hosting tetap dapat memproses
                  informasi jaringan dalam log mereka. Jangka penyimpanan record mentah dan log
                  penyedia akan dicantumkan setelah jadwal retensi disahkan.
                </p>
                <p>
                  Data pengukuran tidak digunakan untuk menentukan berita yang boleh Anda lihat,
                  menampilkan iklan perilaku, atau menyimpulkan pandangan politik, agama, kesehatan,
                  seksualitas, dan keyakinan lain dari bacaan Anda.
                </p>
              </div>
            </section>

            <section
              id="akun-interaksi"
              className="scroll-mt-24 mt-14 border-t border-border-default/15 pt-12"
            >
              <SectionHeading
                eyebrow="03 — Akun dan kontribusi"
                title="Apa yang terjadi ketika Anda memilih berinteraksi"
                description="Akun memberikan kepemilikan dan akuntabilitas pada tindakan tertentu. Setiap fitur mempunyai konsekuensi publik yang berbeda."
              />

              <div className="space-y-8">
                <div>
                  <h3 className="font-display text-xl font-bold text-text-primary">Login Google</h3>
                  <p className="mt-3 font-lora text-body-base leading-reading text-text-primary md:text-body-lg">
                    Jika Anda memilih login, browser mengarahkan Anda ke Google untuk autentikasi dan
                    Supabase membantu Saintifiks mengelola akun serta sesi. Login tidak dibutuhkan
                    untuk membaca. Sebelum kebijakan ini berlaku, kami akan mencantumkan dengan tepat
                    data profil yang diterima dan masa hidup sesi.
                  </p>
                </div>

                <div>
                  <h3 className="font-display text-xl font-bold text-text-primary">Komentar</h3>
                  <p className="mt-3 font-lora text-body-base leading-reading text-text-primary md:text-body-lg">
                    Isi komentar dan waktu pengiriman dapat dilihat publik dengan nama “Pembaca”.
                    Saintifiks menyimpan hubungan internal dengan akun untuk autentikasi, moderasi,
                    dan penanganan penyalahgunaan, tetapi ID akun internal tidak dikirim melalui
                    respons komentar publik.
                  </p>
                </div>

                <div>
                  <h3 className="font-display text-xl font-bold text-text-primary">Likes dan shares</h3>
                  <p className="mt-3 font-lora text-body-base leading-reading text-text-primary md:text-body-lg">
                    Like dihubungkan secara internal dengan akun agar tindakan yang sama tidak dihitung
                    berulang dan dapat dibatalkan. Untuk share baru, Saintifiks hanya mencatat konten
                    serta platform yang dipilih, tanpa ID akun. Setelah Anda membuka platform lain,
                    platform tersebut memproses aktivitas sesuai kebijakannya sendiri.
                  </p>
                </div>

                <div>
                  <h3 className="font-display text-xl font-bold text-text-primary">
                    Koreksi dan laporan
                  </h3>
                  <p className="mt-3 font-lora text-body-base leading-reading text-text-primary md:text-body-lg">
                    Usulan koreksi dan laporan digunakan untuk pemeriksaan editorial, moderasi, serta
                    keselamatan. Kiriman asli tidak dipublikasikan otomatis. Koreksi yang disetujui
                    dapat diumumkan tanpa menampilkan identitas pengusul. Jangan menyertakan data
                    sensitif milik orang lain kecuali benar-benar diperlukan untuk menjelaskan masalah.
                  </p>
                </div>

                <div>
                  <h3 className="font-display text-xl font-bold text-text-primary">
                    Profil dan Opinions
                  </h3>
                  <p className="mt-3 font-lora text-body-base leading-reading text-text-primary md:text-body-lg">
                    Penulis memilih informasi yang dimasukkan ke profil publik. Username, nama tampilan,
                    bio, avatar, dan artikel yang diterbitkan dapat dilihat serta diindeks publik.
                    Draf tidak ditampilkan kepada pembaca, tetapi tetap diproses oleh sistem penyimpanan
                    dan dapat diakses oleh fungsi yang berwenang untuk operasi atau moderasi.
                  </p>
                </div>
              </div>
            </section>

            <section
              id="perangkat-pihak-lain"
              className="scroll-mt-24 mt-14 border-t border-border-default/15 pt-12"
            >
              <SectionHeading
                eyebrow="04 — Perangkat dan penyedia"
                title="Data yang tersimpan di perangkat atau diproses pihak lain"
                description="Sebagian pilihan tersimpan hanya di browser. Sebagian fungsi lain memerlukan infrastruktur eksternal atau membawa Anda ke layanan di luar Saintifiks."
              />

              <div className="space-y-6 font-lora text-body-base leading-reading text-text-primary md:text-body-lg">
                <p>
                  Pilihan tema, lokasi konten, dan keranjang Bookstore dapat disimpan melalui
                  penyimpanan lokal browser (localStorage) pada perangkat Anda. Data ini bertahan
                  sampai dihapus oleh browser, aplikasi, atau pengguna. Bookstore saat ini belum
                  memproses checkout, pembayaran, alamat pengiriman, atau pesanan.
                </p>
                <p>
                  Artikel dapat memuat gambar dari domain eksternal. Ketika gambar tersebut dimuat,
                  browser dapat mengirim informasi jaringan seperti alamat IP, user-agent, dan
                  referrer kepada penyedia gambar. Saintifiks sedang menyiapkan pembatasan agar
                  permintaan semacam ini tidak terjadi tanpa kontrol yang memadai.
                </p>
                <p>
                  Tombol share hanya membuka platform yang Anda pilih. Tindakan pada platform seperti
                  X, Facebook, WhatsApp, atau layanan lain berada di bawah kendali dan kebijakan
                  privasi platform tersebut.
                </p>
              </div>

              <dl className="mt-8 divide-y divide-border-default/15 border-y border-border-default/15">
                {serviceProviders.map((provider) => (
                  <div
                    key={provider.name}
                    className="grid gap-1 py-5 sm:grid-cols-[160px_1fr] sm:gap-6"
                  >
                    <dt className="font-interface text-sm font-semibold text-text-primary">
                      {provider.name}
                    </dt>
                    <dd className="font-interface text-sm leading-relaxed text-text-secondary">
                      {provider.role}
                    </dd>
                  </div>
                ))}
              </dl>

              <p className="mt-5 font-interface text-sm leading-relaxed text-text-secondary">
                Lokasi pemrosesan, jangka log, backup, dasar transfer, dan penyedia pendukung lain
                yang benar-benar berlaku bagi akun Saintifiks akan ditambahkan sebelum kebijakan
                ini mempunyai tanggal berlaku.
              </p>
            </section>

            <section
              id="retensi"
              className="scroll-mt-24 mt-14 border-t border-border-default/15 pt-12"
            >
              <SectionHeading
                eyebrow="05 — Siklus hidup data"
                title="Penyimpanan dan penghapusan"
                description="Data yang berbeda tidak semestinya disimpan selama jangka yang sama."
              />
              <div className="space-y-6 font-lora text-body-base leading-reading text-text-primary md:text-body-lg">
                <p>
                  Saintifiks akan menetapkan masa simpan atau kriteria penghapusan untuk akun, sesi,
                  analytics, komentar, likes, shares, profil, draf, koreksi, laporan, berkas, log,
                  serta catatan administratif. Jadwal final belum disahkan sehingga kami tidak
                  mencantumkan angka yang belum dapat dibuktikan.
                </p>
                <p>
                  Penghapusan dari situs aktif tidak selalu berarti data segera hilang dari seluruh
                  backup. Kebijakan final akan membedakan penghapusan dari layanan aktif, masa tunggu
                  backup, kewajiban penyimpanan, sengketa, keselamatan, dan kepentingan arsip jurnalistik.
                </p>
              </div>
              <div className="mt-6 border-l-4 border-border-accent bg-signal-info-surface px-5 py-5">
                <p className="font-interface text-sm leading-relaxed text-text-primary">
                  Kami tidak akan menyatakan sebuah akun atau data “terhapus sepenuhnya” sebelum alur
                  penghapusan database, autentikasi, Storage, log, backup, dan penyedia terkait dapat
                  dijalankan serta diuji dari ujung ke ujung.
                </p>
              </div>
            </section>

            <section
              id="hak"
              className="scroll-mt-24 mt-14 border-t border-border-default/15 pt-12"
            >
              <SectionHeading
                eyebrow="06 — Kendali Anda"
                title="Hak dan permintaan"
                description="Hak privasi harus dapat dijalankan melalui proses yang jelas, bukan hanya disebut dalam dokumen."
              />
              <p className="font-lora text-body-base leading-reading text-text-primary md:text-body-lg">
                Bergantung pada keadaan dan ketentuan yang berlaku, Anda dapat:
              </p>
              <ul className="mt-5 space-y-3" aria-label="Daftar hak privasi pengguna">
                {userRights.map((right) => (
                  <li
                    key={right}
                    className="flex gap-3 border-t border-border-default/10 pt-3 font-interface text-sm leading-relaxed text-text-secondary first:border-t-0 first:pt-0"
                  >
                    <span aria-hidden="true" className="mt-1 text-text-link">
                      —
                    </span>
                    <span>{right}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-7 space-y-4 font-lora text-body-base leading-reading text-text-primary md:text-body-lg">
                <p>
                  Kanal permintaan privasi belum dibuka karena verifikasi identitas, pencatatan
                  tenggat, pengecualian, penghapusan, dan banding masih harus diuji. Kami tidak meminta
                  foto KTP sebagai langkah awal. Dokumen identitas hanya boleh diminta bila benar-benar
                  diperlukan dan harus dibatasi pada informasi minimum.
                </p>
                <p>
                  Jika permintaan berkaitan dengan isi artikel, sumber, hak orang lain, keselamatan,
                  sengketa, atau kewajiban penyimpanan, Saintifiks dapat memerlukan penilaian editorial
                  dan hukum. Usulan atas kesalahan fakta dapat disampaikan melalui halaman{' '}
                  <Link href="/koreksi">Sampaikan Koreksi dan Klarifikasi</Link>.
                </p>
              </div>
            </section>

            <section
              id="jurnalisme"
              className="scroll-mt-24 mt-14 border-t border-border-default/15 pt-12"
            >
              <SectionHeading
                eyebrow="07 — Kepentingan publik"
                title="Jurnalisme dan privasi"
                description="Permintaan tentang akun berbeda dari permintaan mengenai seseorang yang disebut dalam karya jurnalistik."
              />
              <div className="space-y-6 font-lora text-body-base leading-reading text-text-primary md:text-body-lg">
                <p>
                  Untuk informasi dalam artikel, Saintifiks mempertimbangkan akurasi, kepentingan
                  publik, dampak terhadap individu, hak jawab, koreksi, konteks sejarah, keselamatan,
                  dan perlindungan narasumber. Penghapusan bukan satu-satunya penyelesaian; pembaruan,
                  catatan koreksi, anonimisasi, pembatasan indeks, atau penjelasan tambahan dapat lebih
                  tepat bergantung pada kasusnya.
                </p>
                <p>
                  Identitas sumber rahasia dan bahan berisiko tinggi tidak boleh diperlakukan seperti
                  data akun biasa. Kanal sumber aman harus dipisahkan dari form dukungan umum dan tidak
                  akan diumumkan sebagai “aman” sebelum batas teknis serta ancamannya dijelaskan.
                </p>
              </div>
            </section>

            <section
              id="keamanan-anak"
              className="scroll-mt-24 mt-14 border-t border-border-default/15 pt-12"
            >
              <SectionHeading
                eyebrow="08 — Perlindungan"
                title="Keamanan, insiden, dan pengguna anak"
                description="Perlindungan yang dijanjikan harus sesuai dengan kontrol yang benar-benar berjalan."
              />
              <div className="space-y-6 font-lora text-body-base leading-reading text-text-primary md:text-body-lg">
                <p>
                  Akses ke akun, database, aplikasi, dan proses moderasi harus dibatasi menurut fungsi.
                  Rincian kontrol yang benar-benar aktif, hasil pengujiannya, kanal pelaporan keamanan,
                  serta prosedur pemberitahuan insiden akan dicantumkan setelah pemeriksaan operasional
                  selesai.
                </p>
                <p>
                  Situs publik dapat diakses oleh pengguna berusia muda. Penilaian formal mengenai
                  fitur yang mungkin digunakan anak belum selesai. Sampai penilaian itu tersedia,
                  Saintifiks tidak akan mengumpulkan tanggal lahir hanya untuk menciptakan kesan patuh
                  dan tidak akan menganggap pernyataan “untuk orang dewasa” sebagai perlindungan yang
                  memadai.
                </p>
                <p>
                  Jangan mencantumkan alamat rumah, nomor identitas, informasi kesehatan, data anak,
                  atau informasi sensitif orang lain di komentar, laporan, koreksi, profil, dan
                  artikel kecuali benar-benar diperlukan serta aman untuk diproses atau diterbitkan.
                </p>
              </div>
            </section>

            <section
              id="perubahan-kontak"
              className="scroll-mt-24 mt-14 border-t border-border-default/15 pt-12"
            >
              <SectionHeading
                eyebrow="09 — Akuntabilitas"
                title="Perubahan, identitas, dan kontak"
                description="Kebijakan final akan mempunyai pemilik yang jelas, tanggal berlaku, riwayat perubahan, dan jalur pengaduan."
              />
              <div className="space-y-6 font-lora text-body-base leading-reading text-text-primary md:text-body-lg">
                <p>
                  Perbaikan redaksional akan dicatat tanpa mengubah praktik. Perubahan tujuan,
                  kategori data, penyedia, atau masa penyimpanan akan ditinjau sebelum diterapkan dan
                  dijelaskan secara menonjol. Penggunaan berlanjut tidak dianggap sebagai persetujuan
                  untuk pemrosesan baru apabila hukum mengharuskan pilihan afirmatif.
                </p>
                <p>
                  Sebelum halaman ini berlaku, bagian ini akan memuat nama hukum pengendali data,
                  bentuk organisasi, alamat, kontak privasi, kontak keamanan, saluran pengaduan,
                  tanggal berlaku, serta versi kebijakan. Kami tidak akan menerbitkan identitas atau
                  status organisasi yang belum dapat diverifikasi.
                </p>
              </div>
            </section>

            <footer className="mt-14 border-t-2 border-border-strong/40 pt-6">
              <p className="font-interface text-sm font-semibold text-text-primary">
                Status dokumen: pratinjau naskah publik
              </p>
              <p className="mt-2 font-interface text-sm leading-relaxed text-text-secondary">
                Versi draf 0.2, 6 Agustus 2026. Naskah ini belum mempunyai tanggal berlaku dan belum
                menggantikan kebijakan atau pemberitahuan yang diwajibkan pada titik interaksi.
              </p>
            </footer>
          </article>
        </div>
      </div>
    </main>
  )
}
