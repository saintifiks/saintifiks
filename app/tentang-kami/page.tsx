import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Tentang Saintifiks',
  description:
    'Mengenal tujuan, cara kerja, pendanaan, penggunaan AI, dan pertanggungjawaban editorial Saintifiks.',
  openGraph: {
    title: 'Tentang Saintifiks',
    description:
      'Publikasi independen yang memberi ruang bagi data, konteks, dan pemikiran yang benar-benar milik pembaca.',
    url: '/tentang-kami',
    type: 'website',
    locale: 'id_ID',
    siteName: 'Saintifiks',
  },
}

const waysOfWorking = [
  {
    number: '01',
    title: 'Berangkat dari pertanyaan',
    description:
      'Penelusuran dimulai dari sesuatu yang belum cukup dijelaskan, bukan dari kesimpulan yang sudah dipilih lalu dicarikan pembenaran.',
  },
  {
    number: '02',
    title: 'Mencari sumber aslinya',
    description:
      'Dataset, dokumen, riset, dan keterangan ditelusuri sampai ke sumber yang dapat diperiksa. Tautan bukan dekorasi; ia memungkinkan pembaca menguji dasar sebuah klaim.',
  },
  {
    number: '03',
    title: 'Menguji mekanisme dan batas',
    description:
      'Fakta dibedakan dari interpretasi. Penjelasan diuji terhadap bukti yang berlawanan, asumsi yang digunakan, dan hal-hal yang belum dapat diketahui.',
  },
  {
    number: '04',
    title: 'Membiarkan kesimpulan tetap terbuka',
    description:
      'Saintifiks menyampaikan apa yang ditemukan dan seberapa jauh bukti menopangnya. Keputusan tentang apa yang patut dipercaya tetap berada pada pembaca.',
  },
]

const publications = [
  {
    title: 'Artikel Saintifiks',
    description:
      'Tulisan editorial yang menelusuri data, konteks, dan mekanisme di balik sebuah persoalan.',
    href: '/',
    label: 'Baca artikel',
  },
  {
    title: 'Argumen',
    description:
      'Ruang bagi pembaca untuk menerbitkan pemikirannya sendiri. Setiap tulisan merupakan pandangan penulisnya, bukan posisi editorial Saintifiks.',
    href: '/opinions',
    label: 'Jelajahi Argumen',
  },
  {
    title: 'Bookstore',
    description:
      'Katalog buku pilihan yang dikembangkan sebagai salah satu jalan membiayai operasional tanpa menutup artikel di balik paywall.',
    href: '/bookstore',
    label: 'Lihat Bookstore',
  },
]

export default function TentangKamiPage() {
  return (
    <main className="min-h-screen bg-surface-page">
      <div className="mx-auto max-w-5xl px-5 pb-20 pt-12 md:pb-28 md:pt-20">
        <header className="max-w-4xl pb-14 md:pb-20">
          <p className="font-mono text-kicker uppercase tracking-widest text-text-link">
            Tentang Saintifiks
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-display-base font-bold text-text-primary md:text-display-lg">
            Tempat di mana berpikir layak dilakukan.
          </h1>
          <p className="mt-6 max-w-2xl font-lora text-body-base text-text-secondary md:text-body-lg">
            Saintifiks adalah publikasi independen berbasis web yang menyajikan data,
            konteks, dan proses penalaran tanpa mengambil alih hak pembaca untuk
            menyimpulkan.
          </p>
        </header>

        <dl className="grid border-y border-border-default/50 md:grid-cols-3">
          <div className="py-6 md:pr-8">
            <dt className="font-mono text-kicker uppercase tracking-widest text-text-tertiary">
              Pengelolaan
            </dt>
            <dd className="mt-2 font-interface text-sm leading-relaxed text-text-primary">
              Dijalankan secara mandiri oleh satu pengelola
            </dd>
          </div>
          <div className="border-t border-border-default/50 py-6 md:border-l md:border-t-0 md:px-8">
            <dt className="font-mono text-kicker uppercase tracking-widest text-text-tertiary">
              Pendanaan saat ini
            </dt>
            <dd className="mt-2 font-interface text-sm leading-relaxed text-text-primary">
              Tanpa investor, donor, atau sponsor
            </dd>
          </div>
          <div className="border-t border-border-default/50 py-6 md:border-l md:border-t-0 md:pl-8">
            <dt className="font-mono text-kicker uppercase tracking-widest text-text-tertiary">
              Akses
            </dt>
            <dd className="mt-2 font-interface text-sm leading-relaxed text-text-primary">
              Artikel dapat dibaca tanpa paywall
            </dd>
          </div>
        </dl>

        <section
          aria-labelledby="mengapa-saintifiks"
          className="grid gap-6 border-b border-border-default/50 py-14 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)] md:gap-12 md:py-20"
        >
          <div>
            <p className="font-mono text-kicker uppercase tracking-widest text-text-tertiary">
              Mengapa
            </p>
            <h2
              id="mengapa-saintifiks"
              className="mt-2 font-display text-2xl font-bold leading-tight text-text-primary"
            >
              Otonomi berpikir
            </h2>
          </div>

          <div className="max-w-[65ch] space-y-6 font-lora text-body-sm text-text-secondary md:text-body-base">
            <p>
              Banyak informasi meminta pembaca menentukan posisi sebelum sempat memeriksa
              bagaimana sebuah kesimpulan dibentuk. Angka dapat hadir tanpa konteks,
              ketidakpastian dapat disembunyikan, dan penjelasan dapat berhenti tepat ketika
              persoalan mulai menjadi rumit.
            </p>
            <p>
              Saintifiks tidak dibangun untuk menyediakan apa yang seharusnya dipercaya.
              Tujuannya adalah menyediakan bahan yang cukup agar sebuah pemikiran dapat
              diperiksa, dipertanyakan, dan akhirnya benar-benar dimiliki oleh pembacanya.
              Emosi tetap dikenali sebagai bagian dari manusia, tetapi tidak diperlakukan
              sebagai pengganti bukti.
            </p>
          </div>
        </section>

        <section
          aria-labelledby="yang-dikerjakan"
          className="grid gap-8 border-b border-border-default/50 py-14 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)] md:gap-12 md:py-20"
        >
          <div>
            <p className="font-mono text-kicker uppercase tracking-widest text-text-tertiary">
              Ruang publikasi
            </p>
            <h2
              id="yang-dikerjakan"
              className="mt-2 font-display text-2xl font-bold leading-tight text-text-primary"
            >
              Yang dikerjakan
            </h2>
          </div>

          <div className="divide-y divide-border-default/50 border-y border-border-default/50">
            {publications.map((publication) => (
              <article key={publication.title} className="py-7 md:py-8">
                <h3 className="font-display text-xl font-bold text-text-primary">
                  {publication.title}
                </h3>
                <p className="mt-2 max-w-[62ch] font-lora text-body-sm text-text-secondary">
                  {publication.description}
                </p>
                <Link
                  href={publication.href}
                  className="mt-4 inline-flex min-h-[44px] items-center font-interface text-sm font-medium text-text-link underline decoration-border-accent/40 underline-offset-4 transition-colors duration-swift hover:text-interactive-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-interactive-primary"
                >
                  {publication.label} <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="cara-bekerja"
          className="grid gap-8 border-b border-border-default/50 py-14 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)] md:gap-12 md:py-20"
        >
          <div>
            <p className="font-mono text-kicker uppercase tracking-widest text-text-tertiary">
              Proses
            </p>
            <h2
              id="cara-bekerja"
              className="mt-2 font-display text-2xl font-bold leading-tight text-text-primary"
            >
              Cara bekerja
            </h2>
          </div>

          <ol className="divide-y divide-border-default/50 border-y border-border-default/50">
            {waysOfWorking.map((item) => (
              <li
                key={item.number}
                className="grid gap-3 py-7 sm:grid-cols-[48px_minmax(0,1fr)] md:py-8"
              >
                <span className="font-mono text-kicker text-text-tertiary" aria-hidden="true">
                  {item.number}
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold text-text-primary">
                    {item.title}
                  </h3>
                  <p className="mt-2 max-w-[62ch] font-lora text-body-sm text-text-secondary">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section
          aria-labelledby="ai-dalam-riset"
          className="grid gap-6 border-b border-border-default/50 py-14 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)] md:gap-12 md:py-20"
        >
          <div>
            <p className="font-mono text-kicker uppercase tracking-widest text-text-tertiary">
              Transparansi
            </p>
            <h2
              id="ai-dalam-riset"
              className="mt-2 font-display text-2xl font-bold leading-tight text-text-primary"
            >
              AI dalam riset
            </h2>
          </div>

          <div className="max-w-[65ch] space-y-6 font-lora text-body-sm text-text-secondary md:text-body-base">
            <p className="text-text-primary">
              AI memperluas jangkauan penelusuran. AI bukan sumber, bukti, atau pihak yang
              bertanggung jawab atas sebuah klaim.
            </p>
            <p>
              Saintifiks menggunakan AI untuk memetakan pertanyaan, menemukan kandidat
              sumber, menelusuri dataset, dan mengidentifikasi bukti yang perlu diperiksa.
              Setiap sumber yang hendak digunakan dibuka dan dibandingkan kembali dengan
              uraian AI. Jika keduanya tidak sejalan, sumber asli yang menjadi acuan. Informasi
              yang tidak dapat ditelusuri kembali tidak diperlakukan sebagai dasar klaim.
            </p>
            <p>
              Keputusan tentang relevansi sumber, batas sebuah klaim, susunan argumen, dan
              publikasi tetap menjadi tanggung jawab pengelola Saintifiks.
            </p>
          </div>
        </section>

        <section
          aria-labelledby="independensi"
          className="grid gap-6 border-b border-border-default/50 py-14 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)] md:gap-12 md:py-20"
        >
          <div>
            <p className="font-mono text-kicker uppercase tracking-widest text-text-tertiary">
              Pendanaan
            </p>
            <h2
              id="independensi"
              className="mt-2 font-display text-2xl font-bold leading-tight text-text-primary"
            >
              Independensi dalam praktik
            </h2>
          </div>

          <div className="max-w-[65ch] space-y-6 font-lora text-body-sm text-text-secondary md:text-body-base">
            <p>
              Saintifiks dibangun dan dibiayai secara mandiri. Saat halaman ini diperbarui,
              tidak ada investor, donor, sponsor, atau organisasi eksternal yang mendanai
              operasional maupun memegang pengaruh atas keputusan editorial.
            </p>
            <p>
              Bookstore dikembangkan sebagai salah satu jalan membangun arus pendapatan agar
              artikel tetap dapat dibaca tanpa paywall. Penjualan buku tidak memberi penerbit,
              penulis, atau pemasok hak untuk memengaruhi isi editorial. Jika sebuah publikasi
              membahas produk yang juga dijual melalui Bookstore, hubungan komersial tersebut
              akan dinyatakan kepada pembaca.
            </p>
          </div>
        </section>

        <section
          aria-labelledby="tanggung-jawab"
          className="grid gap-6 py-14 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)] md:gap-12 md:py-20"
        >
          <div>
            <p className="font-mono text-kicker uppercase tracking-widest text-text-tertiary">
              Akuntabilitas
            </p>
            <h2
              id="tanggung-jawab"
              className="mt-2 font-display text-2xl font-bold leading-tight text-text-primary"
            >
              Siapa yang bertanggung jawab
            </h2>
          </div>

          <div className="max-w-[65ch] space-y-6 font-lora text-body-sm text-text-secondary md:text-body-base">
            <p>
              Saintifiks dijalankan oleh satu pengelola yang memegang seluruh tanggung jawab
              editorial dan operasional. Nama pribadi, alamat rumah, nomor telepon pribadi,
              dan akun administratif tidak ditampilkan untuk menjaga keamanan pengelola.
              Pilihan ini tidak digunakan untuk menyembunyikan struktur kepemilikan atau
              kepentingan finansial: keduanya dijelaskan secara terbuka di halaman ini.
            </p>
            <p>
              Kepercayaan tidak diminta tanpa syarat. Jika terdapat fakta, sumber,
              interpretasi, atau penyajian yang perlu diperiksa kembali, pembaca dapat
              menyampaikan usulan. Koreksi yang diterima akan ditampilkan pada artikel yang
              berkaitan.
            </p>
            <Link
              href="/koreksi"
              className="inline-flex min-h-[44px] items-center font-interface text-sm font-medium text-text-link underline decoration-border-accent/40 underline-offset-4 transition-colors duration-swift hover:text-interactive-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-interactive-primary"
            >
              Sampaikan koreksi atau klarifikasi <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>

        <footer className="border-t border-border-default/50 pt-6">
          <p className="font-mono text-kicker uppercase tracking-widest text-text-tertiary">
            Terakhir diperbarui 6 Agustus 2026
          </p>
        </footer>
      </div>
    </main>
  )
}
