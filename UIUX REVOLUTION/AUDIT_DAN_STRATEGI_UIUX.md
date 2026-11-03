# Audit & Strategi Perombakan UI/UX Saintifiks

| | |
|---|---|
| Tanggal | 3 November 2026 |
| Dasar audit | Membaca kode (`app/`, `components/`, `lib/`, `supabase/`), mengompilasi CSS Tailwind proyek, membaca 9 referensi visual di folder ini |
| Batasan | Situs live tidak dijalankan/di-screenshot; database produksi tidak dibuka. Semua angka berasal dari kode di `main`. Hal yang butuh pengecekan live ditandai **[cek]** |
| Bahasa | Sengaja non-teknis. Istilah teknis dijelaskan sekali di tempat pertama muncul |

---

## 0. Jawaban singkat

**Kesan Anda benar, dan penyebabnya bisa dibuktikan — bukan sekadar selera.** Ada lima temuan terbesar:

1. **Sebagian besar halaman "interaksi" dan "akun" sebenarnya tidak punya gaya sama sekali.** Kode memakai ±740 nama gaya lama (`text-primary-dark`, `font-helvetica`, `bg-primary-light`, dst.) di 38 file, tetapi nama-nama itu sudah tidak terdaftar di sistem desain. Saya mengompilasi CSS-nya: `font-helvetica` menghasilkan **0 aturan**, `text-primary-dark` **0 aturan**. Artinya tombol like, komentar, share, koreksi, halaman Akun, Argumen, dan hampir seluruh dashboard admin tampil dengan gaya bawaan browser sebagian. Ini kemungkinan besar penyebab utama rasa "belum didesain".
2. **Tidak ada peta perjalanan pengguna.** Menu berisi 6 tautan yang campur (konten, akun, toko, formulir), Beranda tidak punya hierarki, dan tidak ada "jalur utama" yang jelas dari datang → membaca → percaya → kembali.
3. **"Mobile-first" berubah menjadi "mobile-only".** Seluruh Beranda dan header hanyalah kolom 672px di tengah layar desktop. Tidak ada tata letak desktop yang dirancang, tidak ada sidebar/rail, hover hanya `opacity-60`.
4. **Interaksi artikel (like/komentar/share/koreksi) hanya satu baris ikon di *ujung bawah* artikel**, tanpa fitur simpan, tanpa laporan di sisi editorial, dan login dipicu mendadak lewat pengalihan penuh ke Google.
5. **Fondasi data belum siap tumbuh.** ±20 dari 27 tabel yang dipakai kode **tidak ada** di folder migrasi (hanya 6 migrasi, untuk CMS/Studio/admin). Sistem artikel editorial dan sistem Argumen (opini pembaca) dibangun **kembar** — tabel, API, dan komponen kembar (like ×2, share ×2, komentar ×2, koreksi ×2).

**Rekomendasi inti:** jangan merombak halaman satu per satu. Urutannya: *kunci keputusan → perbaiki fondasi (token, font, ikon, komponen) → jalur baca → masuk & akun → Argumen/penulis → back-office → poles*. Detail di §9.

**Yang dipertahankan (sesuai permintaan Anda):** palet hitam–putih hangat (`paper #F7F5F0` / `ink #1A1917`), logo berlian-S, dan Libre Baskerville. Semuanya sudah ada di kode; masalahnya bukan di sana.

---

## 1. Yang sudah baik (jangan dibuang)

- Logo (berlian hitam + "S" serif) — kuat, sederhana, mudah dijadikan basis ikon merek. **Tapi tidak dipakai di Header maupun Login**: header hanya teks "Saintifiks"; logo hanya ada di Footer dan favicon.
- Token warna berbasis variabel + mode gelap + script anti-kedip tema.
- Aksesibilitas dasar: *skip link*, cincin fokus (`focus-visible` ±287 pemakaian), target sentuh 44px di banyak tombol, jebakan fokus pada dialog.
- Keamanan & privasi: header keamanan, allowlist tujuan setelah login, analitik tanpa user_id, ISR (cache 5 menit) di Beranda.
- Studio Editorial (editor admin) punya tes kontrak.
- `error.tsx`, `not-found.tsx`, `sitemap.ts`, `robots.ts` sudah ada (audit Mei 2026 menandainya hilang — sudah selesai).

---

## 2. Diagnosis: delapan akar masalah

### 2.1 Fitur ditambah tanpa peta perjalanan
**Bukti.** Rute publik: Beranda, Artikel, Argumen (`/opinions`), Profil penulis, Akun, Tulis, Koreksi, Bookstore (+keranjang), Bagikan Ide, Tentang, Kontak, Keamanan, Kebijakan Iklan, Kebijakan Privasi, Panduan Editorial, Login. Drawer menyusunnya datar: *Argumen · Akun · Tentang Kami · Koreksi · Bookstore · Bagikan Ide* — konten, akun, toko, dan formulir sejajar, tanpa urutan nilai.
Lima halaman (Bagikan Ide, Kontak, Keamanan, Kebijakan Iklan, Panduan Editorial) adalah halaman CMS yang akan menampilkan "dalam pemeliharaan" bila isinya belum diterbitkan **[cek isinya di database]**.
Satu fitur punya tiga nama: "Argumen" (menu), `/opinions` (alamat), "opini/Opinions" (kode & dokumen).

**Dampak.** Pengguna tidak tahu apa yang bisa dilakukan; Anda sendiri lupa fitur apa yang ada — gejala yang sama.

### 2.2 Sistem desain tiga lapis, sebagian mati
**Bukti.**
- Tiga generasi token hidup bersamaan di `globals.css`: V2 (`paper/ink/sea-deep`), V3 semantik (`surface-page/text-primary/interactive-primary`), dan *legacy* (`primary-dark/primary-light/accent-*`).
- Hanya V2 & V3 yang terdaftar di Tailwind. Legacy **tidak** → ±469 pemakaian `primary-*` dan 268 `font-helvetica` di 38 file tidak menghasilkan CSS (terkonfirmasi kompilasi).
- Dua kelas tipografi artikel bentrok: `.article-content` (paragraf 17px, line-height 1.6) vs `.article-body` (18px, 1.75).
- 68 ukuran font *hard-code* (`text-[13px]`), 23 warna hex langsung di komponen, 3 sistem bayangan, z-index mentah (`z-50`) di samping token z-index.
- `button { transition: all 150ms }` global — menganimasikan semua properti semua tombol, termasuk yang tidak seharusnya.
- Empat keluarga font dimuat (Libre Baskerville 4 varian, Lora 6, Plex Sans 3, Plex Mono 2). Dua serif berbeda (Baskerville & Lora) hampir mirip tapi tidak sama → hasil "hampir konsisten" yang terasa murahan.
- Penggunaan font tidak sistematis: `font-libre` (54) dan `font-display` (58) adalah font yang sama dengan dua nama; kartu artikel memakai `font-display` untuk ringkasan, halaman artikel memakai Lora untuk isi.
- Libre Baskerville hanya dimuat bobot 400 & 700, tapi kode memakai `font-medium` (500) — diam-diam jatuh ke 400. Hierarki harus dibangun dari ukuran/italik/huruf kapital, bukan bobot.
- Dokumen panduan **usang & bertentangan**: `V2_HANDOVER_COMPREHENSIVE.md` menyebut Next.js 14 dan font Marcellus, padahal kode memakai Next.js 16 dan Libre Baskerville. `README.md` 277 KB. AI berikutnya yang membaca dokumen ini akan menarik kode ke arah salah.

### 2.3 Mobile-first yang tidak melahirkan desktop
**Bukti.** `max-w-2xl` (672px) dipakai di Header & Beranda; halaman Akun `max-w-4xl`; artikel 720px. Tidak ada rail samping, tidak ada grid kolom, header desktop = header mobile (tema kiri, wordmark tengah, hamburger kanan), Drawer menu layar penuh dengan tautan 40px di monitor 1440px. Footer saja yang punya versi desktop. Hover = `hover:opacity-60` hampir di mana-mana (±252 pemakaian `hover:` tetapi hampir semuanya variasi opasitas/warna tunggal).

### 2.4 Tidak ada sistem umpan balik interaksi
**Bukti.** Tidak ada komponen Toast/Snackbar bersama (kata "toast" hanya muncul di token z-index dan `AdminShell`, bukan komponen bersama). Pola yang ada: ikon `Loader2` berputar, `alert()/confirm()` bawaan browser (4 titik), pesan error inline berbeda-beda. Animasi hanya di Drawer, progress baca, dan transisi tema. `prefers-reduced-motion` hanya ditangani di 2 tempat. Status tombol (*pressed*) praktis tidak ada (`active:` 5 pemakaian).

### 2.5 Ikon & identitas visual tidak disusun
**Bukti.** Ikon = Lucide bawaan di 34 file + 23 SVG inline ad-hoc (ikon platform share, TrendIcon, logo). Tidak ada ukuran/ketebalan baku, tidak ada status aktif (outline→terisi), tidak ada ikon khas merek. Ikon pemeliharaan = kunci pas di lingkaran abu — pola generik.

### 2.6 Beranda tanpa hierarki editorial
**Bukti.** `HomeFeed` = kolom pencarian + daftar kartu berukuran sama. Tidak ada berita utama, tidak ada bagian/kategori meski kolom `category`, `kicker`, `country` sudah ada. Filter negara tersembunyi di Drawer dan *diam-diam* mengubah isi Beranda tanpa penanda di layar. Modul pembeda merek — angka/indeks ("Mereka punya narasi, kami punya angka") — hanya sebagai ticker tipis, tidak punya halaman/bagian sendiri.
Secara teknis: Beranda mengambil **semua** artikel terbit **beserta isi lengkapnya** hanya untuk menghitung "baca N menit", tanpa halaman (pagination). Ukuran kiriman naik linear seiring artikel bertambah.

### 2.7 Login dirancang sebagai gerbang admin, bukan pengalaman pembaca
**Bukti.**
- `/login` bertuliskan "Masuk untuk mengelola Saintifiks" dan default ke `/dashboard` → membingungkan pembaca biasa.
- Satu-satunya metode: Google. Tidak ada alternatif, tidak ada penjelasan "apa untungnya masuk".
- Login pembaca terjadi *mendadak*: menekan ♥ saat belum masuk langsung melempar ke Google; setelah kembali, aksi like **tidak dilanjutkan** (hanya kembali ke halaman).
- Header tidak punya status akun (tidak ada avatar/“Masuk”); "Akun" terkubur di Drawer.
- Tiap komponen (Like, Komentar, Drawer) membuat klien Supabase & mengecek sesi sendiri → logika auth tersebar di ≥3 tempat.
- Halaman login memakai tata letak "teks di tengah" yang sama dengan halaman pemeliharaan; tanpa logo, tanpa gambar, tanpa status error.

### 2.8 Fondasi kode & data belum siap tumbuh
Lihat §7 (terpisah karena teknis).

---

## 3. Audit per halaman

| Halaman | Masalah utama | Prioritas |
|---|---|---|
| **Beranda** | Satu kolom 672px; kartu seragam; tanpa bagian/kategori; filter tersembunyi; ambil semua artikel + isi penuh; pencarian hanya di sisi klien atas data yang sudah dimuat | Tinggi |
| **Artikel** | Judul 32px sama untuk semua; cover mobile full-bleed tapi desktop sama 720px; tidak ada daftar isi/rail; interaksi hanya di bawah; kicker 20px lebih besar dari ringkasan 14px (hierarki terbalik); teks "ILLUSTRATION : NAMA" dalam bahasa Inggris pada situs berbahasa Indonesia; gambar `<img>` mentah tanpa optimasi ukuran; gaya interaksi sebagian mati (§2.2) | Tinggi |
| **Interaksi artikel** | Satu baris ikon di bawah; Like/Komentar/Share masing-masing memuat data sendiri (≥3 permintaan per artikel); `SafeComponent` di `ArticleInteractions` bukan error boundary sungguhan (pendengar `window.error` tidak menangkap error render React); tidak ada Simpan; tidak ada Laporkan di artikel editorial (hanya di Argumen); share = bottom sheet khas mobile bahkan di desktop | Tinggi |
| **Login** | §2.7 | Tinggi |
| **Akun** (dashboard penulis) | Hampir seluruhnya memakai kelas mati (`font-helvetica`, `primary-*`); tabel kaku 4 kolom; tanpa daftar bacaan/riwayat/pengaturan; "Akun" berarti "dashboard penulis", bukan akun pembaca | Tinggi |
| **Argumen (daftar & detail)** | Komponen kembar dari artikel; gaya sebagian mati; `force-dynamic` tanpa cache | Sedang |
| **Penulis / Profil** | Gaya legacy mati; tanpa ikon sosial/bio terstruktur | Sedang |
| **Tulis/Edit (editor Tiptap)** | Editor kaya fitur (chart, tabel, gambar) tetapi wizard tersebar; gaya mati; alur draft → ajukan → moderasi → terbit tidak terlihat oleh penulis | Sedang |
| **Koreksi** | Halaman terpisah, terputus dari artikelnya; padahal koreksi adalah *diferensiator kepercayaan* | Sedang |
| **Bookstore** | Hanya 63 baris halaman + keranjang; `CartProvider` dimuat di root layout untuk *semua* halaman; status produk belum jelas | Putuskan dulu (D5) |
| **Halaman CMS** (Tentang, Kontak, dst.) | Pola pemeliharaan generik bila kosong; tidak ada struktur "Tentang & Kebijakan" | Rendah |
| **Dashboard admin** | Gaya legacy mati; satu "shell" untuk 8 tugas berbeda; densitas data (tabel) tidak punya sistem sendiri | Sedang (setelah publik) |
| **404 / Error / Kosong / Memuat** | Ada, tetapi sekadar fungsional; tidak ada keadaan kosong bermerek | Rendah |

---

## 4. Alur perjalanan pengguna (hulu ke hilir)

### 4.1 Empat peran

| Peran | Tujuan | Jalur sekarang | Putus di mana |
|---|---|---|---|
| **Pembaca anonim** | Menemukan & membaca artikel tepercaya | Beranda → Artikel | Tidak ada navigasi kategori/topik, tidak ada alasan kembali |
| **Pembaca terdaftar** | Menyimpan, menyukai, berkomentar, mengusul koreksi | Ikon bawah artikel → Google → kembali | Aksi hilang setelah login; tidak ada Simpan/Daftar Bacaan; tidak ada "akun saya" untuk pembaca |
| **Kontributor (Argumen)** | Menulis & diterbitkan | Drawer → Akun → username → Tulis | Pembuatan username memblokir di gerbang; status moderasi tidak terkomunikasi; dampak (analitik) tersembunyi |
| **Editor/Admin** | Menerbitkan, memoderasi, melihat angka | `/login` → Dashboard | Satu shell untuk semuanya; belum ada antrean "yang perlu saya kerjakan hari ini" |

### 4.2 Loop utama yang direkomendasikan
**Baca → Percaya → Simpan → Kembali → Ikut serta.**

1. *Baca* — Beranda dengan hierarki, artikel dengan pengalaman membaca prima.
2. *Percaya* — sumber, metodologi, koreksi dan tanggal pembaruan tampil terang di artikel (ini janji merek Anda: "angka").
3. *Simpan* — Daftar Bacaan (butuh tabel baru `bookmarks`).
4. *Kembali* — Topik/kategori, "lanjutkan membaca", RSS; buletin email ditunda (butuh layanan luar).
5. *Ikut serta* — komentar, usul koreksi, menulis Argumen. Login hanya diminta di langkah ini, dan hanya saat dibutuhkan.

### 4.3 Peta informasi (usulan)
```
Beranda  ─ Utama · Bagian (kategori) · Angka (indeks/data) · Argumen
Artikel  ─ baca · sumber & koreksi · terkait
Argumen  ─ daftar · detail · profil penulis
Akun     ─ Daftar Bacaan · Aktivitas · Artikel Saya (penulis) · Pengaturan
Tentang  ─ Tentang · Standar Editorial · Koreksi · Kontak · Kebijakan (Privasi, Iklan, Keamanan)
Toko     ─ (putuskan D5)
Admin    ─ terpisah, hanya untuk peran admin
```
Menu desktop menampilkan 4–5 item pertama langsung di header; Drawer dipertahankan hanya untuk mobile.

### 4.4 Inventaris fitur → keputusan
| Fitur | Keputusan |
|---|---|
| Beranda editorial | **Rombak** (hierarki, bagian) |
| Pembaca artikel | **Rombak** (pengalaman membaca) |
| Argumen | **Satukan UI** dengan artikel (komponen bersama) |
| Profil penulis | Pertahankan, rapikan |
| Akun / Tulis / Edit | **Rombak**; pisahkan "akun saya" dari "dashboard penulis" |
| Koreksi | **Integrasikan** ke artikel (lencana "Dikoreksi", panel koreksi), halaman tetap sebagai arsip |
| Indeks/ticker angka | **Angkat** jadi modul/halaman "Angka" — pembeda merek |
| Bookstore | **Putuskan** (D5) — jika dipertahankan, pindahkan `CartProvider` ke layout toko |
| Filter negara | Tampilkan sebagai *chip* terlihat di Beranda, bukan diam-diam di Drawer |
| Halaman CMS | Susun jadi satu grup "Tentang & Kebijakan"; isi semua atau sembunyikan dari tautan |
| Dashboard admin | Sistem desain padat-data sendiri, setelah publik selesai |
| Daftar Bacaan (baru) | **Tambah** — kunci loop kembali |

---

## 5. Membaca referensi visual Anda (menerjemahkan "kenapa saya suka")

Anda belum bisa membahasakan alasannya; ini terjemahan dari yang saya lihat.

### 5.1 Beranda — The Economist, NYT, Washington Post
Ketiganya, meski berbeda, memakai resep yang sama:
- **Satu berita utama jauh lebih besar** daripada yang lain; sisanya berukuran bertingkat. (Teknis: *visual hierarchy*, skala berita 3–4 tingkat.)
- **Kicker** kecil di atas judul (Economist: merah; NYT/WaPo: kapital kecil abu). Satu warna aksen dipakai *hanya* untuk makna.
- **Garis tipis (hairline rule)** sebagai pemisah, bukan bayangan atau kotak.
- **Metadata kecil seragam**: "7 min read", penulis, tanggal.
- **Grid kolom** (Economist 4-up, NYT 3 kolom dengan garis vertikal, WaPo kolom Opini di kanan).
- **Modul data** di tengah halaman (peta 53 balapan WaPo; infografik) — ini persis tempat "angka" Saintifiks.
- Bilah utilitas atas: cari, masuk, langganan — selalu terlihat di desktop.

### 5.2 Artikel — tiga layar mobile
| Yang terlihat | Istilah teknis | Dipakai di Saintifiks |
|---|---|---|
| Huruf pertama besar (drop cap) merah/hitam | *Drop cap* | Opsional: huruf pertama artikel panjang |
| Cover penuh lebar, bilah progres tipis | *Full-bleed hero, progress bar* | Sudah ada progres; tambah hero penuh lebar |
| Bilah mengambang "Aa · simpan · bagikan" | *Floating reading toolbar* | Toolbar mengambang mobile + rail desktop |
| Lembar pengaturan: ukuran teks, mode malam, daftar bab | *Reading settings sheet* | "Aa": ukuran teks 3 tingkat + tema + daftar isi |
| Kutipan dengan garis merah kiri, miring | *Pull quote* | Sudah ada gayanya; seragamkan |
| Label mono kecil (SÜREÇ, IOS READING APP) | *Mono kicker/label* | Pakai hemat — sekarang kicker mono dipakai berlebihan (57 titik) |
| Kartu tonal berwarna (Museo): pil label, kata digarisbawahi, "GET STARTED →" | *Tonal cards, pill tag, CTA footer* | Untuk modul "Bagian/Angka", bukan untuk semua kartu |

### 5.3 Login — dua referensi Pinterest
- **Layar terbagi dua**: kiri formulir minimal, kanan gambar berkarakter (satu hitam-putih *dithered*, satu lukisan *pointillist*). Kuncinya: **gambar membawa suasana merek**, formulir tetap tenang.
- Judul serif besar, satu tombol utama hitam (pil), tombol sosial putih berkerangka, pemisah "Or", tautan "Sign Up" kecil di bawah.
- Gambar *dithered* hitam-putih sangat cocok dengan identitas Anda (hitam–putih + data/piksel).

**Kesimpulan gaya:** *editorial-serif bertata letak ketat, hairline, satu aksen, gambar berkarakter* — bukan "SaaS bulat dan pastel".

---

## 6. Strategi desain

### 6.1 Prinsip
1. **Tipografi memimpin** — Libre Baskerville adalah suara merek; UI di sekelilingnya tenang.
2. **Garis, bukan kotak** — hairline 1px; bayangan hanya untuk lapisan melayang (menu, dialog).
3. **Satu aksen, dipakai bermakna** — tautan, status aktif, kicker; bukan hiasan.
4. **Setiap aksi punya empat tahap**: ajakan (hover/fokus) → tekan → proses → hasil.
5. **Desktop dirancang, bukan diperlebar** — grid 12 kolom, rail, hover bermakna.
6. **Kepercayaan terlihat** — sumber, tanggal, koreksi tampil sebagai elemen desain utama.
7. **Satu sumber kebenaran** — semua gaya lewat token; tidak ada hex/px liar.

### 6.2 Design system: tiga lapis token
`primitif` (nilai mentah) → `semantik` (peran: surface/text/border/interactive/signal) → `komponen` (tombol, kartu). Tailwind hanya membaca lapis semantik. Nama legacy dihapus lewat **codemod** (penggantian otomatis) dengan tabel:

| Lama | Baru |
|---|---|
| `primary-dark` | `ink` / `text-primary` |
| `primary-light` | `paper` / `surface-page` |
| `accent-blue` | `interactive-primary` |
| `accent-red` | `signal-danger` |
| `accent-green` | `signal-success` |
| `font-helvetica` | `font-interface` |
| `font-libre` | `font-display` |

Hasilnya sekaligus memperbaiki ±740 kelas mati.

### 6.3 Tipografi
- **Libre Baskerville** — judul, display, kutipan, huruf pertama. Bobot 400/700 + italik: hierarki dibangun dari **ukuran, italik, kapital kecil**.
- **Teks isi**: pilih satu (D2). Rekomendasi: **Libre Baskerville juga untuk isi** (memang dirancang untuk teks layar) → buang Lora, identitas jadi satu suara. Alternatif: tetap Lora.
- **IBM Plex Sans** — UI, metadata, tombol. **Plex Mono** hanya untuk widget angka.
- Skala bernama (±9 tingkat) dengan ukuran cair (`clamp`) untuk judul; tidak ada lagi `text-[13px]`. Satu kelas artikel (`.prose-saintifiks`) menggantikan `.article-body` + `.article-content`.
- Hasil: 4 → 3 keluarga font, muat lebih ringan.

### 6.4 Warna & gambar
- Pertahankan `paper/ink`, mode gelap, `sea-deep` sebagai aksen tunggal (atau ganti — D1).
- Warna sinyal (sukses/peringatan/bahaya) hanya untuk status.
- **Perlakuan gambar khas**: opsi *dithered/halftone* hitam-putih untuk ilustrasi dan halaman login; foto berita tetap warna. (D7)

### 6.5 Tata letak & grid
| Lebar | Kolom | Catatan |
|---|---|---|
| < 640 | 4 | gutter 16 |
| 640–1023 | 8 | gutter 24 |
| ≥ 1024 | 12 | kontainer maks 1200 |
| Kolom baca | 680 | di ≥ 1280 ada *rail* samping (daftar isi, aksi, catatan sumber) |

**Beranda desktop**: utama (7 kolom) + dua sekunder bergambar (5 kolom) → baris 4-up → bagian Angka (modul data) → Argumen (kolom samping seperti Opini WaPo). Mobile: tumpukan dengan ukuran bertingkat.

### 6.6 Komponen
Inti yang dibangun sekali lalu dipakai di mana-mana:
`Button · IconButton · Field/Input · Tabs · Menu/Popover · Dialog · ResponsiveSheet (popover di desktop, lembar bawah di mobile) · Toast · Tooltip · Skeleton · Avatar · Kicker/Badge · Byline · Card (Lead / Standar / Ringkas / Teks / Argumen) · Toolbar · EmptyState · ErrorState · Pagination · DataTable (admin) · ReadingProgress`.
Ada sebagian (`components/ui`: Button, Input, Badge, Divider, Link, Label, Skeleton); sisanya baru. Semua didemokan di halaman internal `/dev/design-system` supaya mudah diaudit dan dilihat.

### 6.7 Ikon
- Satu pembungkus `<Icon name="…" />`: grid 24, goresan 1,5, ukuran 16/20/24, daftar putih ±40 ikon (Lucide sebagai dasar).
- Aturan status: **outline → terisi** untuk toggle (suka, simpan).
- **Set ikon merek ±10**, digambar di grid yang sama dengan berlian logo: Koreksi (berlian + centang), Angka/Indeks, Argumen (dua berlian bertumpuk), Sumber, Metodologi, Verifikasi, Pembaruan. Menjawab "ikon khusus branding".
- Logo dipakai di Header (berlian kecil + wordmark), Login, Footer, keadaan kosong.

### 6.8 Sistem mikro-interaksi
**Token gerak**: tekan 120 ms · perubahan status 200 ms · masuk 320 ms · keluar 240 ms; easing *out* untuk masuk, *in* untuk keluar; `prefers-reduced-motion` mematikan gerak non-esensial secara global.

**Aturan umum**
| Elemen | Hover (desktop) | Tekan | Fokus |
|---|---|---|---|
| Tautan teks | garis bawah bergeser (offset) | warna lebih gelap | cincin 2px |
| Kartu artikel | gambar skala 1,02, judul bergaris bawah | — | cincin pada kartu |
| Tombol utama | latar berubah 1 tingkat | skala 0,98 | cincin |
| IconButton | lingkaran latar halus | skala 0,94 | cincin |

**Aksi artikel**
| Aksi | Tempat | Umpan balik |
|---|---|---|
| **Suka** | rail/toolbar | optimistis: hati terisi + satu denyut + angka berganti; gagal → kembali + toast |
| **Simpan** | rail/toolbar | penanda terisi + toast "Disimpan · Lihat Daftar Bacaan" |
| **Bagikan** | rail/toolbar | desktop: popover (Salin tautan, WhatsApp, X, Facebook); mobile: lembar bagikan bawaan HP; "Salin tautan" berubah jadi "Tersalin ✓" |
| **Komentar** | rail/toolbar | panel samping (desktop) / lembar (mobile), draf tersimpan otomatis |
| **Laporkan** | menu ⋯ | dua langkah (alasan → kirim) + toast terima kasih |
| **Usul koreksi** | menu ⋯ + lencana "Dikoreksi" di kepala artikel | terhubung ke halaman Koreksi |
| **Belum masuk** | — | popover kecil di tempat: "Masuk untuk menyukai" + tombol Google; aksi **dilanjutkan** setelah kembali |

**Penempatan di artikel**
1. *Bilah atas lengket*: kembali · progres · **Aa** · simpan · bagikan.
2. *Rail kiri lengket (≥1100px)*: suka · komentar · simpan · bagikan.
3. *Bilah mengambang mobile* (muncul saat gulir naik, sembunyi saat gulir turun).
4. *Akhir artikel*: baris aksi diulang + Koreksi + Sumber + Terkait + "Berikutnya".
5. **Aa** membuka pengaturan baca: ukuran teks (3), tema, disimpan di perangkat.

**Gulir**: header menyusut saat gulir; progres baca tipis; *scroll-spy* daftar isi pada artikel panjang; pemulihan posisi gulir saat kembali; anchor judul dengan salin-tautan.

### 6.9 Halaman login & akun (rancangan)
**Satu pintu masuk untuk semua peran** (`/masuk`); peran menentukan tujuan (admin → dashboard, lainnya → tempat semula).

1. **Halaman `/masuk`** — desktop terbagi dua (formulir kiri, gambar *dithered* merek kanan), mobile: strip gambar atas + formulir. Isi: logo, judul Libre Baskerville "Masuk ke Saintifiks", satu kalimat manfaat (simpan, suka, komentar, menulis), tombol **Google** (utama), **Email tautan-ajaib** (opsional, D4), "Lanjutkan tanpa masuk", tautan Kebijakan/Privasi, keadaan memuat & error, ingat tujuan sebelumnya.
2. **Ajakan masuk di tempat** (popover/lembar) untuk suka/simpan/komentar — tanpa membuang pengguna ke halaman lain sebelum mereka setuju; aksi dilanjutkan otomatis setelah login (*intent preservation*).
3. **Menu akun di header** — "Masuk" (belum login) atau avatar → menu: Daftar Bacaan · Artikel Saya · Tulis · Pengaturan · Keluar.
4. **Username dibuat saat pertama kali menulis**, bukan di gerbang.
5. **Tanpa kata sandi**: kata sandi menambah beban keamanan (reset, kebocoran) untuk produk kecil; Google + tautan email cukup. Apple Sign-In butuh akun developer berbayar — tunda.

### 6.10 Mencegah "AI slop"
Penyebabnya: instruksi hanya teks → AI memakai default umum. Penawarnya:
1. **Brief per halaman** (komposisi, referensi mana, token mana) sebelum kode.
2. **Wireframe/prototipe disetujui Anda** sebelum implementasi.
3. **Larangan tertulis** (lint + checklist): tidak ada hover hanya-opasitas; tidak ada hex/px liar; tidak semua-di-tengah; tidak ada kartu seragam sebagai satu-satunya pola; tidak ada emoji/ikon dekoratif; satu bahasa radius; bayangan hanya untuk lapisan melayang; Lucide tidak langsung (lewat `<Icon>`).
4. **Tangkapan layar tiga lebar** (390 / 768 / 1440) untuk setiap halaman sebelum dinyatakan selesai; Anda menilai dari gambar, bukan dari deskripsi.
5. Sekarang radius campur (0 di kartu, `rounded` di tombol, `rounded-full` di ikon, `rounded-t-2xl` di lembar) — satu keputusan bahasa radius (D8) menyatukannya.

---

## 7. Audit teknis: kode & database

### 7.1 Temuan
| # | Temuan | Dampak |
|---|---|---|
| T1 | **±20 tabel tidak ada di `supabase/migrations`** (articles, comments, likes, shares, article_corrections, opinion_*, user_profiles, books, authors, publishers, analytics_events, dll.). Hanya 6 migrasi (site_pages, editorial_studio_*, admin_memberships). CI "migration check" membandingkan folder dengan remote tetapi folder tidak mencakup skema inti | Tidak bisa membuat ulang database dari nol; tidak bisa review perubahan skema inti; pemulihan bencana bergantung pada backup saja |
| T2 | **Sistem kembar**: `articles` vs `opinion_articles`, `likes` vs `opinion_likes`, `comments` vs `opinion_comments`, `shares` vs `opinion_shares`, `article_corrections` vs `opinion_corrections`, `analytics_events` vs `opinion_analytics_events`. Komponen kembar: Share 373 vs 393 baris, Komentar 299 vs 297, Koreksi 250 vs 260 | Setiap perubahan UI harus dikerjakan dua kali; rawan menyimpang |
| T3 | **Gaya mati** (§2.2) | Tampilan rusak diam-diam |
| T4 | Beranda memuat semua artikel + isi penuh; tanpa pagination; waktu baca dihitung saat setiap render | Melambat seiring pertumbuhan |
| T5 | Tiap artikel memicu ≥3 permintaan klien terpisah (status suka, komentar, sesi) + `getSession` ganda | Boros kuota gratis Vercel/Supabase |
| T6 | `CartProvider` dan `IndexStrip` dimuat di root layout untuk semua halaman | Bobot tak perlu |
| T7 | `<img>` mentah (kartu & artikel) tanpa optimasi ukuran/format | LCP lambat, boros bandwidth |
| T8 | File raksasa: `StudioEditor` 1.427 baris, `document.ts` 1.390, `persistence.ts` 920, `StudioLab` 836, `globals.css` 805, `OpinionContentRenderer` 526 | Sulit diaudit & diubah |
| T9 | Tidak ada tes UI / regresi visual; hanya tes kontrak Studio & keamanan | Perombakan besar tanpa jaring pengaman |
| T10 | Dokumen usang & bertentangan (Next 14/Marcellus vs kode sebenarnya); README 277 KB | AI/pengembang berikutnya tersesat |
| T11 | Logika autentikasi tersebar (Like, Komentar, Drawer, PreLogin masing-masing membuat klien & cek sesi) | Perilaku login tidak konsisten |
| T12 | `SafeComponent` memakai `window.addEventListener('error')` — tidak menangkap error render | Isolasi error semu |

### 7.2 Arsitektur target: *modular monolith*
"Monolit modular" = **satu aplikasi** (mudah di-deploy, murah di tier gratis) yang di dalamnya terbagi modul dengan batas tegas — bukan microservices.

```
app/                 ← hanya perutean & komposisi halaman (tipis)
features/
  articles/          ← baca, kartu, renderer
  opinions/          ← penulisan & moderasi Argumen
  engagement/        ← suka · simpan · bagikan · komentar · laporan · koreksi  (SATU modul, dipakai artikel & Argumen)
  auth/              ← AuthProvider tunggal, ajakan masuk, menu akun
  bookstore/
  studio/            ← Studio Editorial
  admin/
  analytics/
design-system/       ← token · primitif · pola · ikon · gerak
lib/                 ← supabase, keamanan, util
supabase/migrations/ ← baseline LENGKAP + migrasi bertahap
docs/                ← keputusan arsitektur (ADR), panduan, peta fitur
```
Aturan: modul fitur boleh memakai `design-system` & `lib`; antar-fitur hanya lewat `engagement`/`auth`. Dipaksa oleh aturan lint (*import boundaries*).

### 7.3 Database
1. **Baseline skema lengkap** — ekspor skema produksi ke migrasi (`supabase db dump`), commit, lalu CI memverifikasi bahwa DB kosong + semua migrasi = skema produksi. Langkah ini tidak mengubah data.
2. Jalankan **Supabase advisors** (keamanan & performa: RLS, indeks) — baca-saja, bisa dilakukan segera.
3. **Engagement polimorfik** (jangka menengah): tabel `engagements`/`comments` dengan `content_type` + `content_id`, menggantikan pasangan kembar. Jalur aman: *UI bersama dulu* (adaptor di atas dua backend), *migrasi data belakangan*, bukan sekaligus.
4. Tabel baru: `bookmarks` (user_id, content_type, content_id, created_at), dengan RLS ketat.
5. Kolom turunan: `reading_minutes` disimpan saat terbit; Beranda hanya memilih kolom ringan.
6. Pagination/kursor di semua daftar; indeks pada `(is_published, published_at desc)`, `(category, published_at desc)`.
7. Satu endpoint ringkas `GET /api/engagement?type=&id=` (jumlah + status pengguna) menggantikan ≥3 permintaan.

### 7.4 Kualitas & jaring pengaman
- Halaman `/dev/design-system` + **tes regresi visual** (Playwright, 3 lebar) untuk halaman inti.
- Lint: larang hex, `text-[…px]`, nama legacy, impor lintas-fitur.
- Anggaran performa (LCP, ukuran JS) dicek di CI.
- Audit aksesibilitas WCAG 2.2 AA (kontras `text-tertiary`, urutan fokus, gerak berkurang) **[cek]**.
- Pecah file >500 baris saat modul tersebut disentuh (bukan sebagai proyek sendiri).
- `docs/`: arsipkan `V2_HANDOVER_COMPREHENSIVE.md`, pecah README jadi ringkas + rujukan; satu `DESIGN_SYSTEM.md` sebagai sumber kebenaran.

---

## 8. Keputusan yang saya butuhkan dari Anda

Tidak perlu jawaban teknis — cukup pilih. Rekomendasi saya diberi tanda ★.

| # | Keputusan | Pilihan |
|---|---|---|
| D1 | Warna aksen | ★ pertahankan teal `sea-deep` · merah tinta (nuansa Economist/Mürekkep) · hanya hitam-putih tanpa aksen |
| D2 | Font isi artikel | ★ Libre Baskerville (buang Lora) · tetap Lora |
| D3 | Nama fitur opini pembaca | ★ "Argumen" di mana-mana (alamat `/argumen`) · "Opini" · tetap campur |
| D4 | Metode masuk | ★ Google + tautan email · hanya Google · tambah kata sandi |
| D5 | Nasib Bookstore | ★ tunda dari alur utama sampai produk jelas · pertahankan di menu · hapus |
| D6 | Komentar | ★ tetap anonim "Pembaca" (privasi) tetapi tampilkan nama pilihan bila diizinkan nanti · tampilkan nama sekarang |
| D7 | Perlakuan gambar khas (dithered/halftone) | ★ ya, untuk login & ilustrasi · tidak |
| D8 | Bahasa sudut | ★ tajam editorial (0–2px), pil hanya untuk tombol/chip · semua membulat |
| D9 | Satukan database Argumen & artikel | ★ UI bersama dulu, database belakangan · tetap terpisah selamanya |
| D10 | Lingkup "Daftar Bacaan" & buletin | ★ Daftar Bacaan sekarang, buletin nanti · keduanya nanti |

Yang juga membantu: **tiga tangkapan layar situs live Anda saat ini** (Beranda, Artikel, Akun) di 390px dan 1440px, agar saya membandingkan dengan temuan kode ini. **[cek]**

---

## 9. Peta jalan (urut, tiap fase punya "selesai bila")

Ukuran: S = beberapa hari, M = 1–2 minggu, L = 2–4 minggu kerja bersama AI.

| Fase | Isi | Selesai bila | Ukuran |
|---|---|---|---|
| **0. Kunci arah** | Setujui dokumen ini + jawaban D1–D10; baseline migrasi DB; jalankan advisors; bekukan fitur baru; arsipkan dokumen usang | Keputusan tertulis; DB bisa dibangun ulang dari repo | S |
| **1. Fondasi** | Satukan token; codemod nama legacy; kurangi font; `<Icon>` + ikon merek; primitif & Toast; `/dev/design-system`; aturan lint | 0 kelas legacy, 0 hex liar, halaman Akun/komentar/like tampil benar, build hijau | M |
| **2. Jalur baca** | Header & grid desktop; Beranda berhierarki + bagian + Angka; pembaca artikel; modul *engagement* (suka/simpan/bagikan/komentar/laporan/koreksi); pengaturan baca; skeleton/kosong/error | Tangkapan layar 390/768/1440 disetujui; Beranda tak lagi memuat isi penuh; permintaan per artikel ≤1 | L |
| **3. Masuk & Akun** | `/masuk`; ajakan masuk di tempat + lanjutkan aksi; menu akun; `bookmarks` + Daftar Bacaan; AuthProvider tunggal | Pembaca baru: dari ♥ sampai terlanjutkan tanpa kehilangan aksi | M |
| **4. Argumen & Penulis** | Argumen memakai komponen artikel; alur menulis → ajukan → moderasi → terbit tampak jelas; profil penulis | UI kembar dihapus; status moderasi terlihat oleh penulis | M |
| **5. Back-office & Angka** | Sistem padat-data untuk admin; antrean "perlu dikerjakan"; halaman Angka; putusan Bookstore | Dashboard bebas kelas legacy; modul Angka terbit | M |
| **6. Poles & penjaga** | Audit gerak & a11y, anggaran performa, tes visual, dokumentasi akhir | Lighthouse & axe lulus ambang; regresi visual aktif di CI | S |

**Cara kerja tiap halaman** (agar tidak jadi "AI slop"): Anda memilih referensi → saya tulis brief + wireframe → Anda setujui → implementasi hanya dengan token → tangkapan layar 3 lebar → Anda menilai.

---

## 10. Risiko & cara menjaganya

| Risiko | Penjagaan |
|---|---|
| Situs live punya pembaca; perombakan merusak halaman | Fase 1 hanya mengganti nama gaya (tampilan hanya membaik); tiap fase lewat *preview deployment* Vercel & tangkapan layar sebelum digabung |
| Codemod mengubah tampilan tak terduga di halaman yang kini "mati" | Peninjauan tangkapan layar sebelum/sesudah per halaman; justru banyak yang akan *terlihat benar untuk pertama kali* |
| Menyatukan DB Argumen/artikel merusak data | Ditunda; UI bersama dulu (D9) |
| Lingkup membengkak | Fase bergerbang; fitur baru dibekukan di Fase 0 |
| Batas tier gratis (Vercel/Supabase) | Satu endpoint engagement, pagination, optimasi gambar, ISR dipertahankan |
| Dokumen usang menyesatkan AI | Fase 0 mengarsipkan; `DESIGN_SYSTEM.md` jadi satu-satunya rujukan |
