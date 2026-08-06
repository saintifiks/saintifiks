import type { SitePageContent } from './types'

export const aboutDefaultContent: SitePageContent = {
  schemaVersion: 1,
  kicker: 'Tentang Saintifiks',
  title: 'Tempat di mana berpikir layak dilakukan.',
  introduction:
    'Saintifiks adalah publikasi independen berbasis web yang menyajikan data, konteks, dan proses penalaran tanpa mengambil alih hak pembaca untuk menyimpulkan.',
  facts: [
    { label: 'Pengelolaan', value: 'Dijalankan secara mandiri oleh satu pengelola' },
    { label: 'Pendanaan saat ini', value: 'Tanpa investor, donor, atau sponsor' },
    { label: 'Akses', value: 'Artikel dapat dibaca tanpa paywall' },
  ],
  sections: [
    {
      id: 'mengapa-saintifiks',
      navLabel: 'Mengapa',
      eyebrow: 'Mengapa',
      title: 'Otonomi berpikir',
      blocks: [
        {
          type: 'paragraph',
          text: 'Banyak informasi meminta pembaca menentukan posisi sebelum sempat memeriksa bagaimana sebuah kesimpulan dibentuk. Angka dapat hadir tanpa konteks, ketidakpastian dapat disembunyikan, dan penjelasan dapat berhenti tepat ketika persoalan mulai menjadi rumit.',
        },
        {
          type: 'paragraph',
          text: 'Saintifiks tidak dibangun untuk menyediakan apa yang seharusnya dipercaya. Tujuannya adalah menyediakan bahan yang cukup agar sebuah pemikiran dapat diperiksa, dipertanyakan, dan akhirnya benar-benar dimiliki oleh pembacanya. Emosi tetap dikenali sebagai bagian dari manusia, tetapi tidak diperlakukan sebagai pengganti bukti.',
        },
      ],
    },
    {
      id: 'yang-dikerjakan',
      navLabel: 'Ruang publikasi',
      eyebrow: 'Ruang publikasi',
      title: 'Yang dikerjakan',
      blocks: [
        {
          type: 'cards',
          items: [
            {
              title: 'Artikel Saintifiks',
              body: 'Tulisan editorial yang menelusuri data, konteks, dan mekanisme di balik sebuah persoalan.',
              href: '/',
              linkLabel: 'Baca artikel',
            },
            {
              title: 'Argumen',
              body: 'Ruang bagi pembaca untuk menerbitkan pemikirannya sendiri. Setiap tulisan merupakan pandangan penulisnya, bukan posisi editorial Saintifiks.',
              href: '/opinions',
              linkLabel: 'Jelajahi Argumen',
            },
            {
              title: 'Bookstore',
              body: 'Katalog buku pilihan yang dikembangkan sebagai salah satu jalan membiayai operasional tanpa menutup artikel di balik paywall.',
              href: '/bookstore',
              linkLabel: 'Lihat Bookstore',
            },
          ],
        },
      ],
    },
    {
      id: 'cara-bekerja',
      navLabel: 'Proses',
      eyebrow: 'Proses',
      title: 'Cara bekerja',
      blocks: [
        {
          type: 'steps',
          items: [
            {
              title: 'Berangkat dari pertanyaan',
              body: 'Penelusuran dimulai dari sesuatu yang belum cukup dijelaskan, bukan dari kesimpulan yang sudah dipilih lalu dicarikan pembenaran.',
            },
            {
              title: 'Mencari sumber aslinya',
              body: 'Dataset, dokumen, riset, dan keterangan ditelusuri sampai ke sumber yang dapat diperiksa. Tautan bukan dekorasi; ia memungkinkan pembaca menguji dasar sebuah klaim.',
            },
            {
              title: 'Menguji mekanisme dan batas',
              body: 'Fakta dibedakan dari interpretasi. Penjelasan diuji terhadap bukti yang berlawanan, asumsi yang digunakan, dan hal-hal yang belum dapat diketahui.',
            },
            {
              title: 'Membiarkan kesimpulan tetap terbuka',
              body: 'Saintifiks menyampaikan apa yang ditemukan dan seberapa jauh bukti menopangnya. Keputusan tentang apa yang patut dipercaya tetap berada pada pembaca.',
            },
          ],
        },
      ],
    },
    {
      id: 'ai-dalam-riset',
      navLabel: 'AI dalam riset',
      eyebrow: 'Transparansi',
      title: 'AI dalam riset',
      blocks: [
        {
          type: 'paragraph',
          emphasis: true,
          text: 'AI memperluas jangkauan penelusuran. AI bukan sumber, bukti, atau pihak yang bertanggung jawab atas sebuah klaim.',
        },
        {
          type: 'paragraph',
          text: 'Saintifiks menggunakan AI untuk memetakan pertanyaan, menemukan kandidat sumber, menelusuri dataset, dan mengidentifikasi bukti yang perlu diperiksa. Setiap sumber yang hendak digunakan dibuka dan dibandingkan kembali dengan uraian AI. Jika keduanya tidak sejalan, sumber asli yang menjadi acuan. Informasi yang tidak dapat ditelusuri kembali tidak diperlakukan sebagai dasar klaim.',
        },
        {
          type: 'paragraph',
          text: 'Keputusan tentang relevansi sumber, batas sebuah klaim, susunan argumen, dan publikasi tetap menjadi tanggung jawab pengelola Saintifiks.',
        },
      ],
    },
    {
      id: 'independensi',
      navLabel: 'Pendanaan',
      eyebrow: 'Pendanaan',
      title: 'Independensi dalam praktik',
      blocks: [
        {
          type: 'paragraph',
          text: 'Saintifiks dibangun dan dibiayai secara mandiri. Saat halaman ini diperbarui, tidak ada investor, donor, sponsor, atau organisasi eksternal yang mendanai operasional maupun memegang pengaruh atas keputusan editorial.',
        },
        {
          type: 'paragraph',
          text: 'Bookstore dikembangkan sebagai salah satu jalan membangun arus pendapatan agar artikel tetap dapat dibaca tanpa paywall. Penjualan buku tidak memberi penerbit, penulis, atau pemasok hak untuk memengaruhi isi editorial. Jika sebuah publikasi membahas produk yang juga dijual melalui Bookstore, hubungan komersial tersebut akan dinyatakan kepada pembaca.',
        },
      ],
    },
    {
      id: 'tanggung-jawab',
      navLabel: 'Akuntabilitas',
      eyebrow: 'Akuntabilitas',
      title: 'Siapa yang bertanggung jawab',
      blocks: [
        {
          type: 'paragraph',
          text: 'Saintifiks dijalankan oleh satu pengelola yang memegang seluruh tanggung jawab editorial dan operasional. Nama pribadi, alamat rumah, nomor telepon pribadi, dan akun administratif tidak ditampilkan untuk menjaga keamanan pengelola. Pilihan ini tidak digunakan untuk menyembunyikan struktur kepemilikan atau kepentingan finansial: keduanya dijelaskan secara terbuka di halaman ini.',
        },
        {
          type: 'paragraph',
          text: 'Kepercayaan tidak diminta tanpa syarat. Jika terdapat fakta, sumber, interpretasi, atau penyajian yang perlu diperiksa kembali, pembaca dapat menyampaikan usulan. Koreksi yang diterima akan ditampilkan pada artikel yang berkaitan.',
        },
        { type: 'link', label: 'Sampaikan koreksi atau klarifikasi', href: '/koreksi' },
      ],
    },
  ],
  footer: { body: 'Terakhir diperbarui 6 Agustus 2026' },
}

export const privacyDefaultContent: SitePageContent = {
  schemaVersion: 1,
  kicker: 'Pusat Privasi',
  title: 'Privasi untuk kebebasan membaca',
  introduction:
    'Saintifiks ingin membatasi data yang timbul ketika Anda membaca, menimbang, dan membentuk pendapat. Di halaman ini kami menjelaskan apa yang diproses saat Anda membaca, menggunakan akun, berinteraksi, atau menerbitkan karya—beserta alasan dan siapa yang dapat melihatnya.',
  documentMeta: 'Draf 0.2 · Diperbarui 6 Agustus 2026 · Belum berlaku sebagai kebijakan publik',
  notice: {
    title: 'Naskah ini masih berupa pratinjau',
    body: 'Struktur dan bahasanya sedang ditinjau. Identitas resmi pengendali data, kontak privasi, jangka penyimpanan, rincian konfigurasi penyedia layanan, dan tanggal berlaku akan dicantumkan sebelum kebijakan ini dipublikasikan. Sampai saat itu, halaman ini tidak diindeks mesin pencari.',
    tone: 'warning',
  },
  highlights: [
    {
      label: 'Membaca',
      title: 'Tidak memerlukan akun',
      body: 'Artikel publik dapat dibaca tanpa login. Akun dibutuhkan hanya ketika Anda memilih menggunakan fitur yang memerlukan identitas atau kepemilikan.',
    },
    {
      label: 'Mengukur',
      title: 'Tidak dihubungkan ke akun',
      body: 'Pengukuran penggunaan baru tidak memuat ID akun. Session identifier masih digunakan untuk mengelompokkan event dalam satu kunjungan dan dijelaskan secara terbuka di bawah.',
    },
    {
      label: 'Memilih',
      title: 'Publik hanya saat diperlukan',
      body: 'Kami membedakan data privat, data yang diperlukan untuk moderasi, dan data yang Anda pilih untuk diterbitkan. Menjadi pengguna akun tidak otomatis membuat profil Anda publik.',
    },
  ],
  sections: [
    {
      id: 'data-yang-diproses',
      navLabel: 'Data yang diproses',
      eyebrow: '01 — Gambaran umum',
      title: 'Data yang timbul dari pilihan Anda',
      description: 'Jenis data yang diproses bergantung pada cara Anda menggunakan Saintifiks. Membaca, login, berinteraksi, dan menerbitkan karya mempunyai kebutuhan serta tingkat keterlihatan yang berbeda.',
      blocks: [
        {
          type: 'table',
          caption: 'Ringkasan data berdasarkan aktivitas pengguna',
          columns: ['Aktivitas', 'Data dan tujuan', 'Keterlihatan'],
          rows: [
            [
              'Membaca',
              'Halaman yang dibuka, waktu kejadian, event pengukuran, session identifier, serta data jaringan yang diproses penyedia hosting. Digunakan untuk mengirim halaman, memahami apakah konten terbaca, dan membatasi penyalahgunaan.',
              'Tidak ditampilkan kepada publik.',
            ],
            [
              'Menggunakan akun',
              'Data akun yang diterima melalui login Google, pengenal akun internal, dan informasi sesi. Digunakan untuk mengautentikasi pengguna dan menjaga kepemilikan tindakan atau konten.',
              'Data akun tetap privat kecuali pengguna memilih membuat profil publik.',
            ],
            [
              'Berinteraksi',
              'Komentar, likes, pilihan platform share, koreksi, laporan, waktu, dan hubungan internal dengan konten terkait. Digunakan untuk menjalankan fitur, mencegah duplikasi, menjaga integritas editorial, serta melakukan moderasi.',
              'Berbeda menurut fitur; dijelaskan sebelum dan sesudah tindakan terkait.',
            ],
            [
              'Menulis Opinions',
              'Profil yang dipilih pengguna, draf, artikel, gambar, grafik, status publikasi, dan riwayat pengelolaan. Digunakan untuk menyimpan, menerbitkan, dan memoderasi kontribusi penulis.',
              'Profil dan artikel yang diterbitkan bersifat publik; draf tidak ditampilkan kepada publik.',
            ],
          ],
        },
      ],
    },
    {
      id: 'pengukuran',
      navLabel: 'Pengukuran situs',
      eyebrow: '02 — Pengukuran',
      title: 'Memahami penggunaan tanpa membuat profil pembaca',
      description: 'Saintifiks mengukur apakah halaman dibuka dan seberapa jauh artikel dibaca untuk mengevaluasi fungsi situs serta kualitas penyajian konten.',
      blocks: [
        { type: 'paragraph', text: 'Event yang saat ini dikirim meliputi pembukaan halaman, pencapaian kedalaman baca 25%, 50%, 75%, atau 100%, serta klik like. Record analitik baru tidak memuat ID akun atau email, termasuk ketika pembaca sedang login.' },
        { type: 'paragraph', text: 'Browser membuat session identifier acak untuk menghubungkan event dalam satu kunjungan. Identifier ini tidak disimpan sebagai preferensi permanen di browser, tetapi tetap dapat menghubungkan beberapa event selama sesi berlangsung. Karena itu kami tidak menyebut pengukuran ini sepenuhnya anonim.' },
        { type: 'paragraph', text: 'Alamat IP dipakai sementara untuk membatasi pengiriman event berlebihan dan tidak dimasukkan ke catatan pengukuran Saintifiks. Penyedia hosting tetap dapat memproses informasi jaringan dalam log mereka. Jangka penyimpanan record mentah dan log penyedia akan dicantumkan setelah jadwal retensi disahkan.' },
        { type: 'paragraph', text: 'Data pengukuran tidak digunakan untuk menentukan berita yang boleh Anda lihat, menampilkan iklan perilaku, atau menyimpulkan pandangan politik, agama, kesehatan, seksualitas, dan keyakinan lain dari bacaan Anda.' },
      ],
    },
    {
      id: 'akun-interaksi',
      navLabel: 'Akun dan interaksi',
      eyebrow: '03 — Akun dan kontribusi',
      title: 'Apa yang terjadi ketika Anda memilih berinteraksi',
      description: 'Akun memberikan kepemilikan dan akuntabilitas pada tindakan tertentu. Setiap fitur mempunyai konsekuensi publik yang berbeda.',
      blocks: [
        {
          type: 'subsections',
          items: [
            { title: 'Login Google', paragraphs: ['Jika Anda memilih login, browser mengarahkan Anda ke Google untuk autentikasi dan Supabase membantu Saintifiks mengelola akun serta sesi. Login tidak dibutuhkan untuk membaca. Sebelum kebijakan ini berlaku, kami akan mencantumkan dengan tepat data profil yang diterima dan masa hidup sesi.'] },
            { title: 'Komentar', paragraphs: ['Isi komentar dan waktu pengiriman dapat dilihat publik dengan nama “Pembaca”. Saintifiks menyimpan hubungan internal dengan akun untuk autentikasi, moderasi, dan penanganan penyalahgunaan, tetapi ID akun internal tidak dikirim melalui respons komentar publik.'] },
            { title: 'Likes dan shares', paragraphs: ['Like dihubungkan secara internal dengan akun agar tindakan yang sama tidak dihitung berulang dan dapat dibatalkan. Untuk share baru, Saintifiks hanya mencatat konten serta platform yang dipilih, tanpa ID akun. Setelah Anda membuka platform lain, platform tersebut memproses aktivitas sesuai kebijakannya sendiri.'] },
            { title: 'Koreksi dan laporan', paragraphs: ['Usulan koreksi dan laporan digunakan untuk pemeriksaan editorial, moderasi, serta keselamatan. Kiriman asli tidak dipublikasikan otomatis. Koreksi yang disetujui dapat diumumkan tanpa menampilkan identitas pengusul. Jangan menyertakan data sensitif milik orang lain kecuali benar-benar diperlukan untuk menjelaskan masalah.'] },
            { title: 'Profil dan Opinions', paragraphs: ['Penulis memilih informasi yang dimasukkan ke profil publik. Username, nama tampilan, bio, avatar, dan artikel yang diterbitkan dapat dilihat serta diindeks publik. Draf tidak ditampilkan kepada pembaca, tetapi tetap diproses oleh sistem penyimpanan dan dapat diakses oleh fungsi yang berwenang untuk operasi atau moderasi.'] },
          ],
        },
      ],
    },
    {
      id: 'perangkat-pihak-lain',
      navLabel: 'Perangkat dan pihak lain',
      eyebrow: '04 — Perangkat dan penyedia',
      title: 'Data yang tersimpan di perangkat atau diproses pihak lain',
      description: 'Sebagian pilihan tersimpan hanya di browser. Sebagian fungsi lain memerlukan infrastruktur eksternal atau membawa Anda ke layanan di luar Saintifiks.',
      blocks: [
        { type: 'paragraph', text: 'Pilihan tema, lokasi konten, dan keranjang Bookstore dapat disimpan melalui penyimpanan lokal browser (localStorage) pada perangkat Anda. Data ini bertahan sampai dihapus oleh browser, aplikasi, atau pengguna. Bookstore saat ini belum memproses checkout, pembayaran, alamat pengiriman, atau pesanan.' },
        { type: 'paragraph', text: 'Artikel dapat memuat gambar dari domain eksternal. Ketika gambar tersebut dimuat, browser dapat mengirim informasi jaringan seperti alamat IP, user-agent, dan referrer kepada penyedia gambar. Saintifiks sedang menyiapkan pembatasan agar permintaan semacam ini tidak terjadi tanpa kontrol yang memadai.' },
        { type: 'paragraph', text: 'Tombol share hanya membuka platform yang Anda pilih. Tindakan pada platform seperti X, Facebook, WhatsApp, atau layanan lain berada di bawah kendali dan kebijakan privasi platform tersebut.' },
        {
          type: 'definitions',
          items: [
            { term: 'Supabase', description: 'Menyediakan database, autentikasi, dan penyimpanan berkas yang digunakan Saintifiks.' },
            { term: 'Vercel', description: 'Mengirim situs dan menjalankan aplikasi. Dalam prosesnya, infrastruktur hosting dapat menerima data jaringan dan request.' },
            { term: 'Google', description: 'Mengautentikasi pengguna yang memilih masuk melalui akun Google. Membaca artikel tidak memerlukan login Google.' },
          ],
        },
        { type: 'paragraph', text: 'Lokasi pemrosesan, jangka log, backup, dasar transfer, dan penyedia pendukung lain yang benar-benar berlaku bagi akun Saintifiks akan ditambahkan sebelum kebijakan ini mempunyai tanggal berlaku.' },
      ],
    },
    {
      id: 'retensi',
      navLabel: 'Penyimpanan dan penghapusan',
      eyebrow: '05 — Siklus hidup data',
      title: 'Penyimpanan dan penghapusan',
      description: 'Data yang berbeda tidak semestinya disimpan selama jangka yang sama.',
      blocks: [
        { type: 'paragraph', text: 'Saintifiks akan menetapkan masa simpan atau kriteria penghapusan untuk akun, sesi, analytics, komentar, likes, shares, profil, draf, koreksi, laporan, berkas, log, serta catatan administratif. Jadwal final belum disahkan sehingga kami tidak mencantumkan angka yang belum dapat dibuktikan.' },
        { type: 'paragraph', text: 'Penghapusan dari situs aktif tidak selalu berarti data segera hilang dari seluruh backup. Kebijakan final akan membedakan penghapusan dari layanan aktif, masa tunggu backup, kewajiban penyimpanan, sengketa, keselamatan, dan kepentingan arsip jurnalistik.' },
        { type: 'callout', body: 'Kami tidak akan menyatakan sebuah akun atau data “terhapus sepenuhnya” sebelum alur penghapusan database, autentikasi, Storage, log, backup, dan penyedia terkait dapat dijalankan serta diuji dari ujung ke ujung.', tone: 'info' },
      ],
    },
    {
      id: 'hak',
      navLabel: 'Hak dan permintaan',
      eyebrow: '06 — Kendali Anda',
      title: 'Hak dan permintaan',
      description: 'Hak privasi harus dapat dijalankan melalui proses yang jelas, bukan hanya disebut dalam dokumen.',
      blocks: [
        { type: 'paragraph', text: 'Bergantung pada keadaan dan ketentuan yang berlaku, Anda dapat:' },
        {
          type: 'list',
          items: [
            'meminta informasi dan akses atas data pribadi yang diproses Saintifiks;',
            'meminta perbaikan atau pembaruan data yang tidak tepat;',
            'meminta penghentian, pembatasan, penghapusan, atau pemusnahan apabila syaratnya terpenuhi;',
            'menarik persetujuan untuk pemrosesan yang memang bergantung pada persetujuan;',
            'mengajukan keberatan, pengaduan, atau permintaan peninjauan;',
            'meminta salinan atau portabilitas data apabila berlaku dan dapat dilaksanakan;',
            'meminta penanganan terhadap konten Saintifiks yang memuat informasi tentang dirinya.',
          ],
        },
        { type: 'paragraph', text: 'Kanal permintaan privasi belum dibuka karena verifikasi identitas, pencatatan tenggat, pengecualian, penghapusan, dan banding masih harus diuji. Kami tidak meminta foto KTP sebagai langkah awal. Dokumen identitas hanya boleh diminta bila benar-benar diperlukan dan harus dibatasi pada informasi minimum.' },
        { type: 'paragraph', text: 'Jika permintaan berkaitan dengan isi artikel, sumber, hak orang lain, keselamatan, sengketa, atau kewajiban penyimpanan, Saintifiks dapat memerlukan penilaian editorial dan hukum. Usulan atas kesalahan fakta dapat disampaikan melalui halaman Sampaikan Koreksi dan Klarifikasi.' },
        { type: 'link', label: 'Sampaikan Koreksi dan Klarifikasi', href: '/koreksi' },
      ],
    },
    {
      id: 'jurnalisme',
      navLabel: 'Jurnalisme dan privasi',
      eyebrow: '07 — Kepentingan publik',
      title: 'Jurnalisme dan privasi',
      description: 'Permintaan tentang akun berbeda dari permintaan mengenai seseorang yang disebut dalam karya jurnalistik.',
      blocks: [
        { type: 'paragraph', text: 'Untuk informasi dalam artikel, Saintifiks mempertimbangkan akurasi, kepentingan publik, dampak terhadap individu, hak jawab, koreksi, konteks sejarah, keselamatan, dan perlindungan narasumber. Penghapusan bukan satu-satunya penyelesaian; pembaruan, catatan koreksi, anonimisasi, pembatasan indeks, atau penjelasan tambahan dapat lebih tepat bergantung pada kasusnya.' },
        { type: 'paragraph', text: 'Identitas sumber rahasia dan bahan berisiko tinggi tidak boleh diperlakukan seperti data akun biasa. Kanal sumber aman harus dipisahkan dari form dukungan umum dan tidak akan diumumkan sebagai “aman” sebelum batas teknis serta ancamannya dijelaskan.' },
      ],
    },
    {
      id: 'keamanan-anak',
      navLabel: 'Keamanan dan anak',
      eyebrow: '08 — Perlindungan',
      title: 'Keamanan, insiden, dan pengguna anak',
      description: 'Perlindungan yang dijanjikan harus sesuai dengan kontrol yang benar-benar berjalan.',
      blocks: [
        { type: 'paragraph', text: 'Akses ke akun, database, aplikasi, dan proses moderasi harus dibatasi menurut fungsi. Rincian kontrol yang benar-benar aktif, hasil pengujiannya, kanal pelaporan keamanan, serta prosedur pemberitahuan insiden akan dicantumkan setelah pemeriksaan operasional selesai.' },
        { type: 'paragraph', text: 'Situs publik dapat diakses oleh pengguna berusia muda. Penilaian formal mengenai fitur yang mungkin digunakan anak belum selesai. Sampai penilaian itu tersedia, Saintifiks tidak akan mengumpulkan tanggal lahir hanya untuk menciptakan kesan patuh dan tidak akan menganggap pernyataan “untuk orang dewasa” sebagai perlindungan yang memadai.' },
        { type: 'paragraph', text: 'Jangan mencantumkan alamat rumah, nomor identitas, informasi kesehatan, data anak, atau informasi sensitif orang lain di komentar, laporan, koreksi, profil, dan artikel kecuali benar-benar diperlukan serta aman untuk diproses atau diterbitkan.' },
      ],
    },
    {
      id: 'perubahan-kontak',
      navLabel: 'Perubahan dan kontak',
      eyebrow: '09 — Akuntabilitas',
      title: 'Perubahan, identitas, dan kontak',
      description: 'Kebijakan final akan mempunyai pemilik yang jelas, tanggal berlaku, riwayat perubahan, dan jalur pengaduan.',
      blocks: [
        { type: 'paragraph', text: 'Perbaikan redaksional akan dicatat tanpa mengubah praktik. Perubahan tujuan, kategori data, penyedia, atau masa penyimpanan akan ditinjau sebelum diterapkan dan dijelaskan secara menonjol. Penggunaan berlanjut tidak dianggap sebagai persetujuan untuk pemrosesan baru apabila hukum mengharuskan pilihan afirmatif.' },
        { type: 'paragraph', text: 'Sebelum halaman ini berlaku, bagian ini akan memuat nama hukum pengendali data, bentuk organisasi, alamat, kontak privasi, kontak keamanan, saluran pengaduan, tanggal berlaku, serta versi kebijakan. Kami tidak akan menerbitkan identitas atau status organisasi yang belum dapat diverifikasi.' },
      ],
    },
  ],
  footer: {
    label: 'Status dokumen: pratinjau naskah publik',
    body: 'Versi draf 0.2, 6 Agustus 2026. Naskah ini belum mempunyai tanggal berlaku dan belum menggantikan kebijakan atau pemberitahuan yang diwajibkan pada titik interaksi.',
  },
}

const maintenanceDefaults: Record<string, SitePageContent> = {
  'panduan-editorial': {
    schemaVersion: 1,
    kicker: 'Standar Saintifiks',
    title: 'Panduan Editorial',
    introduction: 'Jelaskan standar riset, sumber, penulisan, koreksi, konflik kepentingan, dan pertanggungjawaban publik Saintifiks.',
    sections: [],
  },
  'kebijakan-iklan': {
    schemaVersion: 1,
    kicker: 'Kebijakan Saintifiks',
    title: 'Kebijakan Iklan',
    introduction: 'Jelaskan bentuk pendanaan komersial yang diterima atau ditolak, pelabelan, pemisahan editorial, dan konflik kepentingan.',
    sections: [],
  },
  kontak: {
    schemaVersion: 1,
    kicker: 'Hubungi Saintifiks',
    title: 'Kontak',
    introduction: 'Sediakan jalur komunikasi yang benar-benar aktif tanpa membahayakan keamanan pribadi pengelola.',
    sections: [],
  },
  keamanan: {
    schemaVersion: 1,
    kicker: 'Keamanan',
    title: 'Laporkan Masalah Keamanan',
    introduction: 'Jelaskan ruang lingkup, kanal aman, informasi yang diperlukan, dan batas respons pelaporan kerentanan.',
    sections: [],
  },
  'bagikan-ide': {
    schemaVersion: 1,
    kicker: 'Partisipasi pembaca',
    title: 'Bagikan Ide',
    introduction: 'Jelaskan jenis gagasan yang dapat dikirim, bagaimana ide dinilai, serta apa yang terjadi setelah pengiriman.',
    sections: [],
  },
}

export function getDefaultSitePageContent(slug: string): SitePageContent | null {
  if (slug === 'tentang-kami') return aboutDefaultContent
  if (slug === 'kebijakan-privasi') return privacyDefaultContent
  return maintenanceDefaults[slug] ?? null
}
