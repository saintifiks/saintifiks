# CONTEXT.md — Saintifiks Project Bible
> Versi: 0.2 | Status: Pra-development — hanya GitHub repo yang ada | Terakhir diperbarui: 2025-05-18

---

## ⚠️ INSTRUKSI WAJIB UNTUK AI YANG MEMBACA DOKUMEN INI

Kamu adalah asisten teknis untuk proyek Saintifiks. **Baca seluruh dokumen ini sampai habis sebelum melakukan atau menyarankan apapun.** Dokumen ini adalah satu-satunya sumber kebenaran tentang proyek ini.

### Aturan yang tidak boleh dilanggar — tanpa pengecualian:

1. **Jangan ubah keputusan arsitektur** yang sudah tercatat di Seksi 11 tanpa konfirmasi eksplisit dari pemilik proyek.
2. **Jangan "perbaiki" kode** yang tidak berkaitan dengan permintaan saat ini, meskipun kamu melihat ada yang bisa dioptimasi.
3. **Jika ada konflik** antara permintaan baru dan keputusan yang sudah ada, laporkan konfliknya lebih dulu — jangan selesaikan sendiri.
4. **Jika kamu tidak yakin** dengan konteks kenapa suatu kode ada, tanya dulu — jangan asumsi.
5. **Setiap sesi** yang menghasilkan keputusan arsitektur baru, CONTEXT.md harus diperbarui di Seksi 12 (Log Sesi) dan Seksi 11 (Keputusan Arsitektur).
6. **Kerjakan satu file per respons.** Jangan loncat-loncat antarfile dalam satu respons kecuali diminta eksplisit.
7. **Setiap perubahan** disertai penjelasan: apa yang berubah, kenapa, dan apa yang harus ditest.
8. **Jangan pernah menaruh Supabase service_role key** di sisi client/browser — ini bug keamanan kritis.
9. **Setiap tabel database baru** WAJIB memiliki RLS (Row Level Security) policy. Tabel tanpa RLS adalah bug kritis.
10. **Semua pekerjaan** dilakukan di feature branch, bukan di main branch, kecuali disebutkan eksplisit.

### Yang harus kamu hasilkan sebelum menulis kode apapun:
- **Impact analysis:** file mana yang tersentuh, file mana yang tidak boleh tersentuh.
- **Conflict check:** apakah permintaan bertentangan dengan keputusan yang sudah ada di Seksi 11?
- **Dependency check:** apakah ada yang belum ada yang dibutuhkan?
- **Urutan implementasi** yang aman, dari yang paling fundamental ke surface.
- **Konfirmasi dari pemilik** bahwa plan disetujui — baru implementasi.

### Cara menjelaskan ke pemilik proyek:
Pemilik proyek **bukan programmer** dan tidak memiliki latar belakang teknis. Setiap kali memberikan instruksi atau langkah yang harus dilakukan pemilik, wajib mengikuti standar ini:
- Jelaskan dalam bahasa Indonesia yang jelas, tanpa jargon teknis yang tidak dijelaskan.
- Setiap langkah diberi nomor urut — jangan gabung dua tindakan dalam satu nomor.
- Sebutkan nama tombol, menu, atau field **secara eksak** seperti yang terlihat di UI (misalnya: "klik tombol yang bertuliskan 'New Project'", bukan "buat project baru").
- Jika ada langkah yang bisa salah, sebutkan kesalahan umumnya dan cara menghindarinya sebelum pemilik mengeksekusi langkah itu.
- Jika ada perintah terminal/command line, tulis persis seperti yang harus diketik, tidak lebih tidak kurang, dan jelaskan apa fungsi perintah itu dalam bahasa sederhana.
- Setelah setiap blok langkah, tanyakan konfirmasi sebelum lanjut ke blok berikutnya.

---

## 1. IDENTITAS PROYEK

**Nama brand:** Saintifiks
**Repo GitHub:** https://github.com/saintifiks/saintifiks
**Tipe:** Media independen berbasis web
**Bahasa konten:** Indonesia
**Audiens:** Pembaca dewasa Indonesia yang peduli pada kualitas informasi publik
**Status saat ini:** Pra-development — hanya GitHub repository yang sudah ada. Belum ada kode, belum ada Vercel, belum ada Supabase.

**Apa ini bukan:**
- Ini bukan blog personal biasa.
- Ini bukan media mainstream yang mengejar engagement atau klik.
- Ini bukan platform yang menyederhanakan isu demi konsumsi mudah.

---

## 2. MISI & POSISI FILOSOFIS

### Misi Inti
Memutus rantai manipulasi epistemik dalam ruang publik Indonesia — bukan dengan menyediakan kebenaran yang sudah dikemas, melainkan dengan menciptakan kondisi di mana pembaca dapat membentuk pendapat yang benar-benar milik mereka sendiri: berdasarkan fakta yang tidak dibelokkan, konteks yang tidak dipotong, dan argumen yang tidak dihilangkan karena mengancam kepentingan tertentu.

**Implikasi teknis dari misi ini:**
- Desain UI/UX harus memprioritaskan kemudahan membaca dan berpikir, bukan waktu yang dihabiskan di halaman.
- Tidak ada elemen yang mendorong engagement artifisial (autoplay, infinite scroll tanpa kontrol, notifikasi agresif).
- Sistem likes/interaksi ada untuk data analitis pemilik — bukan untuk ditampilkan secara menonjol ke pembaca sebagai sinyal sosial.
- SEO dilakukan dengan benar untuk memastikan konten ditemukan, tapi tidak mengorbankan kedalaman konten demi keyword.

### Landasan Filosofis (penting untuk keputusan desain jangka panjang)
- **Emergentisme Filosofis** — kompleksitas dihormati, tidak disederhanakan paksa.
- **Utilitarianisme Jangka Panjang (Mill, Parfit)** — metrik sukses adalah dampak generasional, bukan angka kuartalan.
- **Rasionalitas Komunikatif Habermas** — konten harus membebaskan, bukan mendistorsi.
- **Hukum Alam Sekular (Aristotelian-Lockean)** — sains adalah panduan utama, bukan otoritas teologis.
- **Pragmatisme Amerika (James, Dewey)** — evaluasi sistem berdasarkan fungsi dan tujuannya.
- **Psikologi Evolusioner (Wilson, Pinker)** — perilaku manusia dipahami lewat lensa biologis, tidak dogmatis.
- **Konservatisme Burkean** — perubahan gradual lebih aman, tapi Mill mendominasi saat keduanya berbenturan.
- **Stoisisme** — horizon kerja melampaui satu generasi.

---

## 3. PRINSIP EDITORIAL

| # | Prinsip | Implikasi Teknis |
|---|---------|-----------------|
| 1 | Kebenaran berlapis, bukan satu arah | Artikel bisa punya bagian "ketegangan yang belum terselesaikan" — format harus mendukung ini |
| 2 | Argumen, bukan delegitimasi personal | Tidak ada fitur komentar yang memungkinkan serangan ad hominem tanpa moderasi |
| 3 | Koreksi publik sebagai standar | Ada mekanisme koreksi yang terlihat publik di halaman artikel |
| 4 | Konteks struktural wajib hadir | Format artikel mendukung konten panjang dan berlapis |
| 5 | Data empiris adalah lantai, bukan langit-langit | Chart dan visualisasi data adalah fitur utama, bukan fitur tambahan |
| 6 | Ukur dampak pada kapasitas berpikir | Metrik internal: time-on-page yang bermakna, bukan bounce rate semata |
| 7 | Sains sebagai panduan utama | Chart harus akurat, sumber data harus bisa dilacak |
| 8 | Jangan sederhanakan yang kompleks | Tidak ada batas panjang artikel yang artifisial |
| 9 | Independensi finansial adalah prasyarat | Tidak ada iklan berbayar yang memengaruhi konten. Tidak ada paywall yang menghalangi akses |
| 10 | Format melayani misi | Desain fleksibel — mendukung essay panjang, data berat, satire, narasi |

---

## 4. ZONA MERAH — Yang TIDAK boleh diimplementasikan

- Tidak ada autoplay konten apapun.
- Tidak ada infinite scroll tanpa kontrol jelas dari pengguna.
- Tidak ada notifikasi push agresif.
- Tidak ada tracking perilaku yang dijual ke pihak ketiga.
- Tidak ada iklan display dari jaringan iklan eksternal.
- Tidak ada judul yang dioptimasi untuk klik bukan untuk akurasi.
- **Tidak ada Supabase `service_role` key di sisi client/browser — ini adalah bug keamanan kritis.**
- **Tidak ada tabel Supabase tanpa RLS policy — ini adalah bug keamanan kritis.**
- Tidak ada perubahan kode langsung di `main` branch — semua pekerjaan di feature branch.

---

## 5. ARSITEKTUR TEKNIS

### Stack yang Diputuskan

| Komponen | Teknologi | Alasan |
|----------|-----------|--------|
| Frontend | Next.js 14 (App Router) | SSG/SSR untuk SEO, React ecosystem, AI-friendly |
| Hosting frontend | Vercel | Free tier cukup, deploy otomatis dari GitHub, CDN global |
| Backend / Database | Supabase | PostgreSQL + Auth + Storage dalam satu platform, free tier, portable — tidak vendor-locked |
| Version control | GitHub | Standar industri; UIthub bisa membaca repo ini untuk konteks AI per sesi |
| Visualisasi data | Chart.js (custom blocks terintegrasi) | Fleksibilitas penuh, kontrol atas visualisasi data ekonomi kompleks, tidak bergantung layanan pihak ketiga |
| Styling | Tailwind CSS v3 | Utility-first, AI-friendly, konsisten dengan ekosistem Next.js |
| Auth pembaca | Supabase Auth + Google OAuth | Login via Google; tidak perlu buat akun baru; Supabase menangani seluruh flow |
| Editor artikel admin | Markdown teks biasa | Resolved — lihat Seksi 11 untuk alasan lengkap |
| Konten format | Markdown dengan chart placeholder | `{{chart:chart-id}}` — Next.js parsing dan render keduanya |

### Batasan Free Tier yang Harus Diperhatikan

- **Supabase:** Project dihibernasi jika tidak ada aktivitas selama 7 hari. **Solusi wajib dan harus diimplementasikan di Sesi #1:** Cron job di Vercel yang query ringan ke database setiap 3 hari.
- **Vercel:** 100GB bandwidth/bulan di free tier. Gambar artikel harus disimpan di Supabase Storage (bukan di repo GitHub) untuk mengurangi beban bandwidth Vercel.
- **Supabase:** 500MB database storage, 2GB bandwidth, 50.000 MAU di free tier.

### Keputusan yang Masih Terbuka
- Tidak ada. Semua keputusan arsitektur dasar sudah diselesaikan.

---

## 5.1 DESIGN SYSTEM

> Status: DITETAPKAN. Wajib diikuti di seluruh proyek tanpa pengecualian.

### Tipografi

| Peran | Font | Keterangan |
|-------|------|------------|
| Primary | Libre Baskerville | Serif — untuk body artikel, heading utama, identitas brand |
| Secondary | Helvetica (fallback: Arial, sans-serif) | Sans-serif — untuk UI elemen, label, navigasi, metadata |

**Cara implementasi:** Libre Baskerville di-load via Google Fonts di `layout.tsx`. Helvetica adalah system font, tidak perlu di-load. Semua konfigurasi font ada di `tailwind.config.ts`.

### Color Palette

| Token | Hex | Peran |
|-------|-----|-------|
| `primary-dark` | `#0D0D0D` | Warna utama — teks, background dark mode, elemen struktural |
| `primary-light` | `#F5F4F0` | Warna utama — background halaman, surface terang |
| `accent-red` | `#C90203` | Aksen — digunakan sangat sedikit dan dengan intensi (error state, highlight kritis, elemen brand tertentu) |
| `accent-blue` | `#002EC7` | Aksen — digunakan sangat sedikit (link aktif, CTA spesifik, elemen interaktif tertentu) |

**Prinsip penggunaan warna:** 90% halaman adalah `#0D0D0D` dan `#F5F4F0`. Dua warna aksen muncul hanya untuk elemen yang benar-benar membutuhkan perhatian. Jangan menggunakan aksen untuk dekorasi.

---

## 5.2 WORKFLOW PENULISAN & PUBLIKASI ARTIKEL

> Ini adalah workflow pemilik proyek — harus dipahami AI untuk mendesain sistem admin yang sesuai.

### Alur dari draft ke live:

1. **Pemilik menulis draft** di tools luar (Obsidian, Notion, atau text editor apapun) dalam format Markdown.
2. **Jika artikel membutuhkan visualisasi data** (chart ekonomi, grafik, dll): pemilik mendeskripsikan chart yang diinginkan kepada AI → AI menghasilkan Chart.js config JSON → pemilik menyimpan JSON tersebut.
3. **Pemilik masuk ke admin panel** Saintifiks (hanya bisa diakses oleh akun pemilik).
4. **Upload/paste konten Markdown** ke editor admin.
5. **Jika ada chart:** tambahkan placeholder `{{chart:chart-id}}` di posisi yang tepat dalam artikel, lalu masukkan Chart.js config JSON ke field yang tersedia.
6. **Preview artikel** sebelum publish untuk memastikan rendering benar.
7. **Publish** — artikel live di situs.

### Implikasi teknis dari workflow ini:
- Admin panel harus memiliki field terpisah untuk: (a) konten Markdown, (b) Chart.js config JSON per chart, (c) metadata artikel.
- Parser artikel di Next.js harus bisa mendeteksi `{{chart:chart-id}}`, mengambil config dari database `article_charts`, dan me-render Chart.js component di posisi tersebut.
- Preview harus akurat — apa yang terlihat di preview harus identik dengan apa yang live.

---

## 5.3 GIT BRANCHING PROTOCOL

> Aturan ini ada untuk melindungi pemilik dari kehancuran kode yang tidak bisa di-undo.

- **`main` branch** = versi yang live/stabil. Tidak ada yang boleh langsung dicommit ke sini.
- **Setiap sesi coding** = buat feature branch baru dengan nama deskriptif: `feature/nama-fitur` atau `fix/nama-masalah`.
- **Setelah sesi berhasil dan ditest:** merge ke `main`.
- **Jika sesi gagal atau berantakan:** hapus branch, `main` tetap aman.
- AI harus selalu menanyakan nama branch yang aktif di awal setiap sesi.

---

## 5.4 BACKUP & DATA SAFETY

- **Weekly database export** via GitHub Actions (pg_dump ke Supabase, disimpan sebagai artifact) — harus diimplementasikan sebelum konten pertama di-publish.
- **Supabase free tier tidak memiliki Point-in-Time Recovery.** Backup manual adalah satu-satunya safety net.

---

## 6. DATABASE SCHEMA

> Status: SUDAH DIBUAT — 2026-05-19, Sesi #3.

### Tabel yang Direncanakan

```
articles          — konten artikel (judul, slug, isi Markdown, status publikasi, metadata)
article_charts    — konfigurasi Chart.js per artikel (type, data, options sebagai JSON; relasi ke articles via foreign key)
likes             — data interaksi likes pembaca (user_id, article_id, timestamp)
analytics_events  — event tracking internal (page_view, scroll_depth, dll — BUKAN untuk dijual)
users             — akun pembaca (dikelola otomatis oleh Supabase Auth saat login pertama)
```

**Catatan chart:** Setiap artikel bisa memiliki satu atau lebih chart. Config Chart.js disimpan sebagai JSON di `article_charts`, di-render client-side via Chart.js saat halaman artikel dibuka. Chart bersifat interaktif.

**Catatan analytics:** `analytics_events` adalah tracking pertama untuk pemilik saja — bukan untuk dijual atau dikirim ke pihak ketiga. Events yang ditrack: page view, scroll depth (milestone 25/50/75/100%), time on page, klik like.

### Aturan RLS (Row Level Security) — WAJIB

- **Setiap tabel baru WAJIB memiliki RLS policy.**
- Default rule: baca publik untuk konten yang dipublikasikan, tulis hanya untuk pemilik yang terautentikasi.
- Ini adalah aturan yang tidak bisa dikompromikan.

### Schema Detail

```sql
-- ============================================================
-- SAINTIFIKS — Tabel articles
-- Dibuat: 2026-05-19 | Sesi #3
-- ============================================================

CREATE TABLE articles (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  title           text        NOT NULL,
  slug            text        NOT NULL UNIQUE,
  content         text        NOT NULL,
  excerpt         text,
  cover_image_url text,
  is_published    boolean     NOT NULL DEFAULT false,
  published_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artikel publik bisa dibaca semua orang"
ON articles FOR SELECT
USING (is_published = true);

CREATE POLICY "Hanya user terautentikasi yang bisa menulis"
ON articles FOR ALL TO authenticated
USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();
```

---

## 7. STRUKTUR FILE

## KONTEKS PEMILIK (PENTING UNTUK AI)
- OS: Windows, shell: PowerShell (bukan bash/zsh/cmd)
- Prompt PowerShell: PS C:\Users\putra\Projects\saintifiks>
- Level teknis: non-programmer — tidak memiliki latar belakang coding
- Standar instruksi wajib:
    · Setiap instruksi = satu langkah bernomor, satu tindakan per nomor
    · Sebutkan nama tombol/menu persis seperti di layar
    · Perintah terminal selalu dalam blok kode + satu kalimat penjelasan fungsi
    · Setelah maksimal 5 langkah: minta konfirmasi sebelum lanjut
    · Jika ada risiko kesalahan: sebutkan SEBELUM langkah dieksekusi
    · Jangan gunakan && di perintah PowerShell — pisahkan jadi dua perintah
    · Path yang mengandung [ dan ] wajib pakai flag -LiteralPath di PowerShell

```
[AKAN DIISI — format yang direncanakan:]
/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                  — Halaman beranda
│   │   ├── artikel/
│   │   │   └── [slug]/
│   │   │       └── page.tsx          — Halaman artikel individual
│   │   └── layout.tsx                — Layout publik
│   ├── (admin)/
│   │   ├── dashboard/
│   │   │   └── page.tsx              — Panel admin (hanya untuk pemilik)
│   │   ├── artikel/
│   │   │   ├── baru/page.tsx         — Form tulis artikel baru
│   │   │   └── [id]/edit/page.tsx    — Edit artikel
│   │   └── layout.tsx                — Layout admin (dengan auth guard)
│   └── api/
│       ├── likes/route.ts            — API endpoint untuk like/unlike
│       └── keep-alive/route.ts       — Endpoint untuk cron job Supabase
├── components/
│   ├── ui/                           — Komponen UI generik (Button, Input, dll)
│   ├── artikel/
│   │   ├── ArticleRenderer.tsx       — Parser Markdown + chart placeholder
│   │   ├── ChartBlock.tsx            — Komponen Chart.js renderer
│   │   └── LikeButton.tsx            — Tombol like dengan optimistic update
│   └── layout/
│       ├── Navbar.tsx
│       └── Footer.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 — Supabase browser client (anon key)
│   │   └── server.ts                 — Supabase server client (untuk server components)
│   └── utils/
│       └── markdown.ts               — Parser Markdown + chart placeholder resolver
├── public/                           — Aset statis (favicon, dll)
├── tailwind.config.ts                — Konfigurasi Tailwind + design tokens
├── next.config.ts                    — Konfigurasi Next.js
└── README.md                         — Dokumen ini (CONTEXT.md)
```

---

## 8. KONVENSI KODE

> Status: DITETAPKAN. Berlaku mulai scaffold pertama.

```
Naming files:    kebab-case untuk file dan folder (artikel-renderer.tsx, keep-alive.ts)
Naming vars:     camelCase untuk variabel dan fungsi (articleSlug, handleLike)
Naming DB cols:  snake_case (article_id, created_at, is_published)
Component style: PascalCase untuk nama komponen React (ArticleRenderer, LikeButton)
API routes:      /api/[resource] — selalu plural (bukan /api/like tapi /api/likes)
Error handling:  Setiap API route wajib punya try/catch dan return response dengan status code yang tepat
Comments:        Bahasa Indonesia untuk komentar bisnis/logika, bahasa Inggris untuk komentar teknis
```

---

## 9. CHECKLIST IMPLEMENTASI

> Status saat ini: hanya GitHub repository yang ada. Belum ada apapun yang di-setup.

### Phase 0 — Foundation (Harus selesai sebelum apapun)
- [x] Akun GitHub dibuat
- [x] Repository `saintifiks` dibuat di GitHub
- [x] CONTEXT.md (README.md ini) ada di repo
- [x] Node.js terinstall di komputer pemilik
- [x] Next.js scaffold di-init dan di-push ke GitHub
- [x] Vercel terhubung ke GitHub repo dan deploy pertama berhasil
- [x] Supabase project dibuat
- [x] Environment variables Supabase tersambung ke Vercel
- [x] **Cron job keep-alive Supabase diimplementasikan** ← WAJIB sebelum lanjut apapun

### Phase 1 — Bisa baca artikel
- [x] Database schema dasar (tabel `articles`) + RLS policies
- [x] Halaman artikel publik (render Markdown, SEO metadata)
- [x] Halaman beranda (list artikel yang dipublikasikan)
- [x] Navigasi dasar
- [x] Design system diterapkan (font + color palette)

### Phase 2 — Pemilik bisa publish
- [x] Google OAuth via Supabase Auth (untuk pemilik)
- [x] Admin panel dasar (hanya bisa diakses pemilik)
- [x] Form tulis/edit artikel (Markdown editor + preview)
- [ ] Sistem chart (tabel `article_charts`, placeholder parser, Chart.js renderer)
- [ ] Upload gambar via Supabase Storage

### Phase 3 — Interaksi pembaca
- [ ] Google OAuth untuk pembaca (login untuk like)
- [ ] Sistem likes (tabel `likes`, API endpoint, LikeButton component)
- [ ] Analytics internal (tabel `analytics_events`, event tracking)

### Phase 4 — Kualitas & keamanan
- [ ] Weekly backup database via GitHub Actions
- [ ] SEO metadata lengkap (Open Graph, Twitter Card)
- [ ] Mekanisme koreksi artikel (publik)
- [ ] Performance audit

---

## 10. MASALAH YANG DIKETAHUI

[19-05-2026] MASALAH: Tag <a hilang dari file TSX saat copy-paste dari chat Claude di browser
             STATUS: resolved
             WORKAROUND: -
             RESOLVED: 19-05-2026 — gunakan artifact download (create_file + present_files),
             bukan copy-paste dari chat

[19-05-2026] MASALAH: PowerShell tidak mendukung operator && sebagai pemisah perintah
             STATUS: resolved
             WORKAROUND: Jalankan setiap perintah secara terpisah satu per satu
             RESOLVED: workaround permanen — tidak perlu fix khusus

[19-05-2026] MASALAH: Get-Content di PowerShell gagal untuk path yang mengandung [ dan ]
             STATUS: resolved
             WORKAROUND: Selalu gunakan flag -LiteralPath untuk path yang mengandung
             karakter [ dan ], contoh: Get-Content -LiteralPath "app\artikel\[slug]\page.tsx"
             RESOLVED: workaround permanen — tidak perlu fix khusus

```
Format pengisian:
[TANGGAL] MASALAH: [deskripsi]
           STATUS: [open / in progress / resolved]
           WORKAROUND: [solusi sementara jika ada]
           RESOLVED: [tanggal dan cara penyelesaian, jika ada]
```

---

## 11. KEPUTUSAN ARSITEKTUR (LOG)

```
[Pra-dev] KEPUTUSAN: Next.js App Router (bukan Pages Router)
           ALASAN: App Router adalah standar Next.js saat ini; SSG dan SSR lebih mudah dikonfigurasi; lebih baik untuk caching dan server components
           ALTERNATIF DITOLAK: Pages Router (legacy), Vite/React tanpa framework (tidak ada SSR built-in)

[Pra-dev] KEPUTUSAN: Supabase sebagai backend
           ALASAN: PostgreSQL + Auth + Storage dalam satu platform; free tier yang generous; data bisa di-export kapan saja (tidak vendor-locked)
           ALTERNATIF DITOLAK: Firebase (NoSQL kurang cocok untuk konten artikel yang relasional), PlanetScale (tidak ada Auth built-in)

[Pra-dev] KEPUTUSAN: GitHub sebagai version control
           ALASAN: Free, standar industri, UIthub bisa membaca repo ini untuk konteks AI di setiap sesi
           CATATAN: UIthub (uithub.com/saintifiks/saintifiks) digunakan untuk memberi AI konteks kode lengkap di setiap sesi baru

[Pra-dev] KEPUTUSAN: Google OAuth via Supabase Auth sebagai sistem login
           ALASAN: Pembaca dan pemilik tidak perlu buat akun baru; Supabase Auth menangani seluruh flow; konsisten dengan keputusan Supabase
           ALTERNATIF DITOLAK: Fingerprint anonim (data kurang akurat, tidak bisa identifikasi lintas device), email-password (friction tinggi)
           CATATAN IMPLEMENTASI: Google Cloud Console → OAuth 2.0 Client ID → paste ke Supabase Dashboard → Authentication → Providers → Google

[Pra-dev] KEPUTUSAN: Chart.js sebagai sistem visualisasi data
           ALASAN: Fleksibilitas penuh untuk chart analisis ekonomi yang kompleks dan interaktif; tidak bergantung pada layanan pihak ketiga
           ALTERNATIF DITOLAK: Datawrapper embed (lebih mudah tapi terbatas customization, bergantung server Datawrapper)
           CATATAN IMPLEMENTASI: Config chart (type, data, options) disimpan sebagai JSON di tabel article_charts; di-render client-side; satu artikel bisa punya banyak chart

[Pra-dev] KEPUTUSAN: Tailwind CSS v3 sebagai styling
           ALASAN: Utility-first, konsisten dengan ekosistem Next.js, sangat AI-friendly
           ALTERNATIF DITOLAK: CSS modules (lebih verbose), styled-components (overhead runtime)
           CATATAN IMPLEMENTASI: Gunakan Tailwind v3 (BUKAN v4 yang masih baru dan sering bermasalah); konfigurasi tema di tailwind.config.ts

[Pra-dev] KEPUTUSAN: Markdown dengan chart placeholder sebagai format konten
           ALASAN: Format paling portabel dan AI-friendly; mendukung migrasi dari Medium/Substack; pemilik bisa menulis di tool apapun; tidak bergantung pada editor kompleks
           ALTERNATIF DITOLAK: TipTap rich text editor (terlalu kompleks, format JSON TipTap sulit dimigrasikan), MDX (overhead toolchain yang tidak perlu untuk non-programmer)
           CATATAN IMPLEMENTASI: Chart di-embed via placeholder {{chart:chart-id}} dalam teks Markdown; parser di Next.js mendeteksi placeholder, mengambil config dari article_charts, render Chart.js component

[Pra-dev] KEPUTUSAN: Design system — Libre Baskerville + Helvetica + 4-warna palette
           ALASAN: Libre Baskerville memberi karakter editorial serius; Helvetica memberi keterbacaan UI; palette minimal mencegah noise visual yang bertentangan dengan misi
           CATATAN: Libre Baskerville via Google Fonts di layout.tsx; Helvetica adalah system font; 90% halaman hanya Primary Dark dan Primary Light; aksen merah dan biru digunakan sangat sedikit

[Pra-dev] KEPUTUSAN: Git branching protocol — feature branch, tidak langsung ke main
           ALASAN: Melindungi pemilik dari perubahan yang merusak; main branch selalu dalam kondisi stabil/live
           CATATAN IMPLEMENTASI: Setiap sesi = branch baru; merge ke main hanya setelah berhasil ditest

[Pra-dev] KEPUTUSAN: Cron job keep-alive adalah implementasi hari pertama
           ALASAN: Supabase free tier hibernasi setelah 7 hari tidak aktif; kehilangan database adalah risiko eksistensial untuk proyek
           CATATAN IMPLEMENTASI: Vercel Cron Job yang query ringan ke endpoint /api/keep-alive setiap 3 hari
[19-05-2026] KEPUTUSAN: File kode yang mengandung tag <a wajib dibuat via artifact download
             ALASAN: Browser Claude merender tag <a sebagai HTML sungguhan saat copy-paste,
             sehingga tag itu hilang dari kode sebelum sampai ke file. Ini menyebabkan
             build Vercel gagal dengan error "Unexpected token" di JSX.
             ATURAN: Setiap kali AI perlu memberikan file .tsx/.jsx yang mengandung tag <a,
             wajib gunakan fitur create_file + present_files agar user bisa download langsung.
             Jangan pernah instruksikan copy-paste kode JSX yang mengandung <a dari chat.
             ALTERNATIF DITOLAK: Copy-paste dari chat (terbukti gagal), PowerShell Set-Content
             here-string (terbukti juga memakan tag <a dalam kondisi tertentu)
```

---

## 12. LOG SESI

> [18-05-2026] SESI #1
Branch: feature/phase-0-foundation
Tujuan sesi: Setup Phase 0 Foundation — semua infrastruktur dasar proyek
Yang dikerjakan:
  - Install Node.js dan Git di komputer pemilik (Windows)
  - Buat akun Supabase + project baru (region: Singapore)
  - Scaffold Next.js 14 dengan App Router, TypeScript, Tailwind CSS v3, ESLint
  - Buat lib/supabase/client.ts dan lib/supabase/server.ts
  - Buat app/api/keep-alive/route.ts (endpoint cron job)
  - Buat vercel.json (konfigurasi Vercel Cron: setiap 3 hari)
  - Buat .env.local dengan 3 variabel Supabase + CRON_SECRET
  - Buat akun Vercel + sambungkan ke GitHub repo
  - Deploy pertama berhasil
  - Merge feature/phase-0-foundation ke main
Keputusan baru: tidak ada (semua mengikuti keputusan yang sudah tercatat di Seksi 11)
Status akhir: selesai
Next step: Phase 1 — buat tabel articles di Supabase + halaman publik + design system
---

> [19-05-2026] SESI #2
Branch: feature/phase-1-design-system
Tujuan sesi: Phase 1 — Terapkan design system (font + color palette)
Yang dikerjakan:
  - Edit tailwind.config.ts: ganti token warna default, tambah primary-dark,
    primary-light, accent-red, accent-blue, font-libre, font-helvetica
  - Edit app/globals.css: hapus default Next.js, terapkan variabel warna Saintifiks,
    set background #F5F4F0 dan color #0D0D0D di body
  - Edit app/layout.tsx: hapus Geist fonts, load Libre Baskerville via Google Fonts,
    update metadata title dan description, terapkan class bg-primary-light dan font-helvetica
Keputusan baru: tidak ada (semua mengikuti keputusan yang sudah tercatat di Seksi 11)
Status akhir: selesai
Next step: Phase 1 — Database schema tabel articles di Supabase + RLS policies
---

> [19-05-2026] SESI #3
Branch: feature/phase-1-db-schema
Tujuan sesi: Phase 1 — Database schema tabel articles + RLS policies
Yang dikerjakan:
  - Membuat tabel articles di Supabase SQL Editor (10 kolom)
  - Mengaktifkan RLS pada tabel articles
  - Membuat 2 RLS policy: SELECT publik untuk is_published=true, ALL untuk authenticated
  - Membuat trigger update_updated_at_column untuk kolom updated_at
  - Update README.md Seksi 6: mengisi schema dari placeholder ke schema aktual
  - Merge feature/phase-1-db-schema ke main
Keputusan baru: tidak ada (semua mengikuti keputusan yang sudah tercatat di Seksi 11)
Status akhir: selesai
Next step: Phase 1 — Halaman beranda (list artikel is_published = true)
---

> [19-05-2026] SESI #4
Branch: feature/phase-1-beranda
Tujuan sesi: Phase 1 — Halaman beranda (list artikel is_published = true)
Yang dikerjakan:
  - Edit app/page.tsx: ganti template default Next.js dengan halaman beranda Saintifiks
  - Server Component yang fetch dari tabel articles (is_published = true, order published_at DESC)
  - Render daftar artikel: tanggal, judul (font-libre), excerpt jika ada
  - Empty state: pesan "Belum ada artikel" jika database kosong
  - Caching strategy: revalidate = 3600 (ISR, refresh setiap 1 jam)
  - Merge feature/phase-1-beranda ke main
Keputusan baru: tidak ada (semua mengikuti keputusan yang sudah tercatat di Seksi 11)
Status akhir: selesai
Next step: Phase 1 — Halaman artikel individual (/artikel/[slug]) dengan render Markdown + SEO metadata
---

> [19-05-2026] SESI #5
Branch utama: feature/phase-1-artikel-individual
Branch fix: fix/artikel-page-content, fix/artikel-slug-halaman
Tujuan sesi: Phase 1 — Halaman artikel individual (/artikel/[slug]) dengan render Markdown + SEO metadata
Yang dikerjakan:

  [TAHAP 1 — feature/phase-1-artikel-individual]
  - Analisis pre-flight: konfirmasi item Phase 1 yang belum selesai, impact analysis,
    dependency check → ditemukan react-markdown belum terinstall
  - Install library react-markdown via npm
  - Buat folder app/artikel/ dan app/artikel/[slug]/
  - Buat file app/artikel/[slug]/page.tsx berisi:
      · generateMetadata() untuk SEO (title, description, og:title, og:description)
      · Fetch artikel dari Supabase berdasarkan slug (hanya is_published = true)
      · Penanganan 404 via notFound() jika artikel tidak ditemukan
      · Render konten Markdown via ReactMarkdown dengan komponen custom sesuai design system
      · Caching ISR revalidate = 3600
  - File dibuat via PowerShell Set-Content (here-string) karena copy-paste dari chat
    menyebabkan dua tag <a hilang (browser Claude merender <a sebagai HTML sungguhan)
  - Verifikasi 3 baris pertama file tampak benar via Get-Content
  - PR di-merge ke main SEBELUM masalah tag <a terdeteksi
  - Vercel build GAGAL: "Unexpected token 'main'" di baris 77 page.tsx
    (penyebab: dua tag <a yang hilang membuat parser JSX gagal memahami struktur JSX)

  [TAHAP 2 — fix/artikel-page-content, percobaan 1]
  - Buat branch fix/artikel-page-content dari main
  - Diagnosis: tag <a hilang di dua lokasi — baris pembuka link "← Saintifiks"
    dan baris pembuka tag <a di dalam komponen ReactMarkdown
  - Percobaan perbaikan via VS Code: tambah <a secara manual di dua lokasi
  - Garis merah error di VS Code hilang setelah perbaikan
  - git add dan commit dijalankan, tapi perbaikan tidak masuk ke commit
    (file belum tersimpan saat git add dijalankan)
  - Vercel build MASIH GAGAL dengan error yang sama

  [TAHAP 3 — fix/artikel-page-content, percobaan 2]
  - Diagnosis ulang: isi file lokal dikonfirmasi lewat Get-Content — tag <a memang masih hilang
  - Percobaan baru: copy-paste kode lengkap dari chat ke VS Code
  - Tag <a tetap hilang saat copy-paste (browser memakan tag HTML)
  - Instruksi manual: tambah <a di dua lokasi spesifik di VS Code
  - User mengonfirmasi garis merah hilang
  - git add, commit, push → Vercel build MASIH GAGAL
    (kemungkinan: perubahan tidak tersimpan saat git add, atau commit salah file)

  [INSIDEN — app/page.tsx tertimpa]
  - Saat mencoba mengganti file via download dan drag ke folder,
    user secara tidak sengaja menaruh file artikel ke folder app\ (beranda)
    bukan ke app\artikel\[slug]\ (artikel individual)
  - Akibat: app/page.tsx (beranda) tertimpa oleh konten halaman artikel individual
  - Kedua file — app/page.tsx dan app/artikel/[slug]/page.tsx — sempat berisi
    konten yang sama (halaman artikel)
  - Solusi: AI menyiapkan dua file terpisah sebagai artifact download:
      · page-beranda.tsx → dipindah ke app\, rename jadi page.tsx (beranda dipulihkan)
      · page.tsx → dipindah ke app\artikel\[slug]\ (artikel individual diperbaiki)
  - Kedua file diverifikasi via Get-Content, keduanya benar
  - git add, commit, push → Vercel build MASIH GAGAL (tag <a tetap hilang di GitHub)

  [TAHAP 4 — fix/artikel-slug-halaman (penyelesaian akhir)]
  - git checkout main → git pull origin main (sinkronisasi dengan GitHub)
  - Buat branch baru fix/artikel-slug-halaman dari main yang sudah diperbarui
  - AI menyiapkan file page.tsx sebagai artifact download langsung dari sistem
    (bukan copy-paste dari chat — metode ini yang aman karena tag <a tidak akan hilang)
  - User download file, taruh di app\artikel\[slug]\, verifikasi Get-Content ✅
  - git add, commit (99902ec), push origin fix/artikel-slug-halaman
  - Vercel Preview build: READY ✅
  - PR di-merge ke main (PR #8)
  - Vercel Production build: READY ✅

Keputusan baru:
  - File kode yang mengandung tag <a TIDAK BOLEH dibuat via copy-paste dari chat Claude
    di browser. Wajib gunakan artifact download (file yang dibuat langsung oleh AI
    dan bisa didownload). Ini berlaku untuk semua sesi berikutnya.
Status akhir: selesai
Next step: Phase 1 — Navigasi dasar (Navbar dan Footer)

> [19-05-2026] SESI #6
Branch: feature/phase-1-navigasi
Tujuan sesi: Phase 1 — Navigasi dasar (Navbar dan Footer)
Yang dikerjakan:
  - Buat folder components/layout/
  - Buat components/layout/Navbar.tsx: bar navigasi atas dengan nama brand "Saintifiks" sebagai link ke beranda
  - Buat components/layout/Footer.tsx: bagian bawah halaman dengan teks copyright
  - Edit app/layout.tsx: import dan render Navbar + Footer mengapit {children}
  - Merge feature/phase-1-navigasi ke main
Keputusan baru: tidak ada (semua mengikuti keputusan yang sudah tercatat di Seksi 11)
Status akhir: selesai
Next step: Phase 2 — Google OAuth via Supabase Auth (login pemilik)

> [19-05-2026] SESI #7
Branch: feature/phase-2-google-oauth
Tujuan sesi: Phase 2 — Google OAuth via Supabase Auth (login pemilik)
Yang dikerjakan:
  - Setup Google Cloud Console: OAuth 2.0 Client ID untuk web application
  - Setup Supabase Dashboard: aktifkan Google provider + konfigurasi redirect URLs
  - Buat app/auth/callback/route.ts (handler OAuth callback — tukar kode jadi sesi)
  - Buat app/login/page.tsx (halaman login dengan tombol Masuk dengan Google)
  - Buat app/(admin)/layout.tsx (auth guard untuk seluruh area admin)
  - Buat app/(admin)/dashboard/page.tsx (placeholder konfirmasi login berhasil)
  - Tambah NEXT_PUBLIC_SITE_URL dan ADMIN_EMAIL ke .env.local dan Vercel
  - Merge feature/phase-2-google-oauth ke main
Keputusan baru: tidak ada (semua mengikuti keputusan yang sudah tercatat di Seksi 11)
Status akhir: selesai
Next step: Phase 2 — Admin panel dasar (dashboard artikel + form tulis artikel)

> [19-05-2026] SESI #8
Branch: feature/phase-2-admin-panel
Tujuan sesi: Phase 2 — Admin panel dasar (dashboard artikel)
Yang dikerjakan:
  - Edit app/(admin)/dashboard/page.tsx: ganti placeholder dengan dashboard nyata
  - Dashboard menampilkan: header admin (label + judul + email), tombol "+ Artikel Baru",
    tombol "Keluar" (sign out via server action), tabel daftar semua artikel (termasuk draft)
    dengan kolom judul / status / tanggal / link Edit, dan empty state jika belum ada artikel
  - Strategi caching: force-dynamic (admin selalu butuh data terbaru)
  - Sign out: server action inline dengan 'use server', redirect ke /login setelah logout
  - Merge feature/phase-2-admin-panel ke main
Keputusan baru: tidak ada (semua mengikuti keputusan yang sudah tercatat di Seksi 11)
Status akhir: selesai
Next step: Phase 2 — Form tulis/edit artikel (Markdown editor + live preview + publish)

> [19-05-2026] SESI #9
Branch: feature/phase-2-form-artikel
Tujuan sesi: Phase 2 — Form tulis/edit artikel (Markdown editor + live preview + publish)
Yang dikerjakan:
  - Buat app/(admin)/dashboard/artikel/actions.ts: Server Actions untuk
    buatArtikel(), updateArtikel(), terbitkanArtikel(), jadikanDraft()
  - Buat app/(admin)/dashboard/artikel/baru/page.tsx: form tulis artikel baru
    dengan field judul/slug/excerpt, textarea Markdown, live preview ReactMarkdown,
    tombol Simpan Draft dan Terbitkan
  - Buat app/(admin)/dashboard/artikel/[id]/edit/page.tsx: form edit artikel
    dengan pre-fill data dari database, badge status, tombol Simpan Perubahan /
    Terbitkan / Jadikan Draft, live preview identik dengan halaman artikel publik
  - Merge feature/phase-2-form-artikel ke main
Keputusan baru: tidak ada (semua mengikuti keputusan yang sudah tercatat di Seksi 11)
Status akhir: selesai
Next step: Phase 2 — Sistem chart (tabel article_charts, parser {{chart:chart-id}}, Chart.js renderer)
e
---
```
Format:
[TANGGAL] SESI #N
Branch: [nama branch yang digunakan]
Tujuan sesi: [apa yang ingin dicapai]
Yang dikerjakan: [file/fitur yang disentuh]
Keputusan baru: [keputusan yang harus masuk ke Seksi 11]
Status akhir: [selesai / terhenti di / butuh dilanjutkan dari]
Next step: [apa yang harus dikerjakan di sesi berikutnya]
---
```

---

## 13. REFERENSI & RESOURCE

| Resource | URL | Kegunaan |
|----------|-----|---------|
| GitHub Repo | https://github.com/saintifiks/saintifiks | Source of truth kode |
| UIthub | https://uithub.com/saintifiks/saintifiks | Snapshot repo untuk konteks AI per sesi |
| Supabase Docs | https://supabase.com/docs | Referensi teknis backend |
| Next.js Docs | https://nextjs.org/docs | Referensi framework frontend |
| Vercel Docs | https://vercel.com/docs | Referensi hosting dan cron job |
| Supabase Dashboard | https://app.supabase.com | Manajemen database dan auth |
| Google Cloud Console | https://console.cloud.google.com | Setup OAuth credentials |
| Tailwind CSS v3 Docs | https://v3.tailwindcss.com | Referensi styling (gunakan v3, bukan v4) |
| Chart.js Docs | https://www.chartjs.org/docs | Referensi visualisasi data |

---

*Dokumen ini adalah sumber kebenaran tunggal proyek Saintifiks. Setiap keputusan yang tidak tercatat di sini dianggap belum dibuat. Versi yang tidak diperbarui adalah versi yang berbahaya.*
