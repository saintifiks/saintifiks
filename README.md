# CONTEXT.md — Saintifiks Project Bible
> Versi: 2.0 | Status: Live | Terakhir diperbarui: [Isi dengan tanggal hari ini]
>
> Perubahan v2.0: Implementasi Visual System V2 (Tipografi 4-lapis, 10-token warna), Arsitektur Dark Mode murni via CSS Variables + prefers-color-scheme, dan pembatalan dokumen handover AI eksternal (Kiro/Cline).

---
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
**Status saat ini:** Live — website dapat diakses publik di https://saintifiks.vercel.app

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
| Auth pembaca | Supabase Auth + Google OAuth | Login via Google; tidak perlu buat akun baru; Supabase menangani seluruh flow; saat pengguna login, tombol keluar digantikan ikon belah ketupat dengan huruf inisial nama |
| Editor artikel admin | Markdown teks biasa | Resolved — lihat Seksi 11 untuk alasan lengkap |
| Konten format | Markdown dengan chart placeholder | `{{chart:chart-id}}` — Next.js parsing dan render keduanya |
| Markdown renderer | react-markdown + remark-gfm + remark-math + rehype-katex + rehype-highlight + rehype-raw + rehype-sanitize | Tabel GFM, formula LaTeX, syntax highlighting, XSS protection — ekosistem standar, client-side |
| JSON parser toleran | json5 | Parser JSON yang menoleransi cacat sintaks dari output AI (trailing comma, unquoted keys) untuk config chart |
| WYSIWYG editor (Opinions) | @tiptap/react + @tiptap/starter-kit + tiptap-markdown | Editor visual untuk platform Opinions dengan output Markdown — lihat Seksi 11 |
| Rate limiting | In-memory Map (lib/rate-limit.ts) | IP-based rate limiting per endpoint; trade-off: tidak persisten antar serverless invocation — acceptable untuk free tier |

### Batasan Free Tier yang Harus Diperhatikan

- **Supabase:** Project dihibernasi jika tidak ada aktivitas selama 7 hari. **Solusi wajib dan harus diimplementasikan di Sesi #1:** Cron job di Vercel yang query ringan ke database setiap 3 hari.
- **Vercel:** 100GB bandwidth/bulan di free tier. Gambar artikel harus disimpan di Supabase Storage (bukan di repo GitHub) untuk mengurangi beban bandwidth Vercel.
- **Supabase:** 500MB database storage, 2GB bandwidth, 50.000 MAU di free tier.

### Keputusan yang Masih Terbuka
- Tidak ada. Semua keputusan arsitektur dasar sudah diselesaikan.

---

## 5.1 DESIGN SYSTEM (VISUAL SYSTEM V2)

> Status: DITETAPKAN (Hard Reset Arsitektur). Wajib diikuti di seluruh proyek tanpa pengecualian. Arsitektur ini menolak penggunaan static hex di Tailwind untuk properti yang merespons tema.

### Tipografi (4 Lapis)

| Peran | Font | Keterangan |
|-------|------|------------|
| Display / Headline | Marcellus | Serif (Google Fonts) — untuk judul utama dan wordmark. Menggantikan rencana penggunaan font berbayar. |
| Body Artikel | Source Serif 4 | Serif (Google Fonts) — dioptimasi untuk pembacaan teks panjang. |
| Interface / UI | IBM Plex Sans | Sans-serif (Google Fonts) — untuk navigasi, tombol, metadata, label. |
| Data / Kicker | IBM Plex Mono | Monospace (Google Fonts) — untuk elemen presisi: angka, kicker kategori, caption gambar. |

**Cara implementasi:** Font dimuat via `next/font/google` di `app/layout.tsx`. Variabel font diinjeksikan ke `<body>` (misal: `--font-body`, `--font-interface`). `tailwind.config.ts` membaca variabel ini di objek `theme.fontFamily`.

### Color Palette (10 Token CSS)

Sistem warna menggunakan CSS Variables di `:root` (`app/globals.css`) untuk memastikan *Single Source of Truth*. Tailwind dilarang keras menggunakan Hex statis untuk warna-warna ini.

| Token Tailwind | CSS Variable | Peran Utama |
|----------------|--------------|-------------|
| `paper` | `--color-paper` | Background utama halaman (inversi di dark mode) |
| `ink` | `--color-ink` | Teks utama artikel & UI (inversi di dark mode) |
| `night` | `--color-night` | Background khusus dark mode |
| `warm-gray` | `--color-warm-gray` | Teks sekunder, metadata, caption |
| `sea-deep` | `--color-sea-deep` | Aksen primer, tautan interaktif, elemen aktif |
| `amber` | `--color-amber` | Aksen sekunder (sangat terbatas) |
| `data-gray` | `--color-data-gray` | Chart dan visualisasi data |
| `trend-up` | `--color-trend-up` | Indikator naik (IndexStrip) — tidak diinversi |
| `trend-down`| `--color-trend-down`| Indikator turun (IndexStrip) — tidak diinversi |

### Arsitektur Dark Mode (Native OS)

Sistem TIDAK menggunakan `dark:` class dari Tailwind untuk rendering struktur dasar, dan TIDAK memiliki tombol *toggle* manual.
1. **Trigger:** Menggunakan media query murni `@media (prefers-color-scheme: dark)` di `app/globals.css`.
2. **Mekanisme:** Saat OS masuk ke mode gelap, media query akan menimpa (overwrite) nilai CSS Variables di `:root`.
3. **Integrasi Tailwind:** `tailwind.config.ts` murni memanggil `var(--color-...)`. Dengan demikian, elemen `<body className="bg-paper text-ink">` akan otomatis transisi menjadi gelap tanpa ada *clashing* spesifisitas CSS.
  ---

## 5.2.1 SINTAKS MARKDOWN YANG DIDUKUNG

### Tabel
| Kolom 1 | Kolom 2 |
|---------|---------|
| Data    | Data    |

### Formula matematika
Inline: $E = mc^2$
Display (baris sendiri): $$\sum_{i=1}^{n} x_i$$

### Syntax highlighting kode
```python
def hello():
    print("hello")
```

### Gambar dengan caption dan sumber
![Deskripsi gambar | Sumber: BPS](https://url-gambar.com)
Format: [deskripsi | sumber] — pisahkan dengan tanda |
Jika tidak perlu sumber: ![Deskripsi gambar](https://url-gambar.com)

### Blockquote biasa
> Kutipan atau catatan penting di sini

### Callout box
> [!NOTE]
> Teks catatan di sini

Mendukung: `NOTE`, `WARNING`, `IMPORTANT`, `TIP` — via custom remark plugin (`lib/supabase/remark/remarkCallout.ts`).

### Footnotes
Didukung via remark-gfm — styling di `app/globals.css` (FOOTNOTE STYLING).

---

## 5.3 WIDGET INDEKS BERANDA

> Status: LIVE sejak 2026-05-21 | Hanya di halaman beranda (`/`) | Posisi diperbarui: 2026-05-21 (Sesi #27)

### Tujuan
Memberi konteks faktual ekonomi & tata kelola bagi pembaca — selaras Prinsip Editorial #5 dan #7. Bukan untuk engagement artifisial: tanpa autoplay, tanpa animasi berkedip, tanpa infinite scroll.

### Tampilan
- **Strip tipis** (~36px) di paling atas halaman beranda — **di atas Navbar**, full width, latar `primary-dark`
- Satu baris horizontal; geser manual di mobile/desktop; **scrollbar disembunyikan** (class `.index-ticker-scroll`)
- Setiap item: label + ikon tren (naik/turun/stabil) + nilai
- Ikon: naik = `accent-green`, turun = `accent-red`, stabil = abu tipis

### Indeks yang ditampilkan

| Indeks | Sumber data | Perbandingan tren | Perilaku update |
|--------|-------------|-------------------|-----------------|
| USD/IDR | Yahoo Finance (`IDR=X`); fallback Frankfurter (harian) | 5m → 1j → 1h (Yahoo) atau 1 hari (ECB) | Live saat pasar bergerak |
| IHSG | Yahoo Finance (`^JKSE`) | 5m → 1j → 1h | Live saat bursa buka |
| Emas (IDR/gram) | Yahoo `GC=F` + kurs IDR | Mengikuti emas USD | Live |
| Minyak Brent | Yahoo `BZ=F` | 5m → 1j → 1h | Live |
| Inflasi | BPS API (jika `BPS_API_KEY` ada) atau World Bank | 1 bulan / 1 tahun | Bulanan/tahunan |
| BI7DRR | Scrape halaman BI | Stabil (riwayat otomatis tidak tersedia) | Saat BI umumkan |
| Kebebasan Pers, CPI, Demokrasi, IPM | Our World in Data → sumber asli (RSF, TI, EIU, UNDP) | 1 tahun | Tahunan |

### Arsitektur teknis
- **Render awal:** Server Component `IndexStrip` → snapshot pertama dari `getIndicesSnapshot()`
- **Pembaruan:** Client Component `IndexStripClient` polling `/api/indices` setiap **15 detik** (minimum 3 detik), hanya saat tab browser aktif
- **API route:** `app/api/indices/route.ts` — `force-dynamic`, `Cache-Control: no-store`, cache server in-memory **12 detik** untuk membatasi panggilan API eksternal
- **Mode live:** `getIndicesSnapshot(true)` memakai `cache: 'no-store'` ke Yahoo; mode SSR awal boleh di-cache Next.js (revalidate per fetcher)
- **Halaman beranda ISR:** `revalidate = 3600` — daftar artikel bisa tertinggal hingga 1 jam; **strip indeks tidak bergantung pada reload halaman** karena client polling
- **Posisi & kondisionalitas:** `IndexStrip` dipasang di `app/layout.tsx` (bukan `app/page.tsx`) via wrapper `ConditionalIndexStrip` — komponen ini mengecek `usePathname()` dan hanya merender strip jika URL adalah `/`. Dengan ini, strip tidak muncul di halaman artikel, login, atau admin.

### File terkait
```
components/widgets/IndexStrip.tsx           ← Server wrapper strip indeks beranda
components/widgets/IndexStripClient.tsx     ← Polling + render strip
components/widgets/TrendIcon.tsx            ← Ikon panah
components/layout/ConditionalIndexStrip.tsx ← Client Component — tampilkan IndexStrip hanya di /
components/layout/ScrollToTop.tsx           ← Client Component — paksa scroll ke atas setiap navigasi
lib/indices/fetchers.ts                     ← Ambil & format data
lib/indices/yahoo.ts                        ← Intraday Yahoo + tren
lib/indices/trend.ts                        ← Logika naik/turun
lib/indices/http.ts                         ← Helper fetch live vs cached
lib/indices/get-indices.ts                  ← Orchestrator snapshot
app/api/indices/route.ts                    ← Endpoint polling client
```

### Environment variable opsional
| Variabel | Wajib? | Fungsi |
|----------|--------|--------|
| `BPS_API_KEY` | Tidak | Inflasi bulanan YoY dari BPS (daftar di https://webapi.bps.go.id). Tanpa ini: fallback World Bank (tahunan). |

---

## 5.4 GIT BRANCHING PROTOCOL

> Aturan ini ada untuk melindungi pemilik dari kehancuran kode yang tidak bisa di-undo.

- **`main` branch** = versi yang live/stabil. Tidak ada yang boleh langsung dicommit ke sini.
- **Setiap sesi coding** = buat feature branch baru dengan nama deskriptif: `feature/nama-fitur` atau `fix/nama-masalah`.
- **Setelah sesi berhasil dan ditest:** merge ke `main`.
- **Jika sesi gagal atau berantakan:** hapus branch, `main` tetap aman.
- AI harus selalu menanyakan nama branch yang aktif di awal setiap sesi.

---

## 5.5 BACKUP & DATA SAFETY

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
article_corrections — koreksi dan klarifikasi publik (dari pembaca, di-approve admin)
comments          — komentar publik (privacy: ditampilkan sebagai "Pembaca")
shares            — tracking share per platform (instagram, twitter, facebook, whatsapp, copy)
analytics_events  — event tracking internal (page_view, scroll_depth, dll — BUKAN untuk dijual)
users             — akun pembaca (dikelola otomatis oleh Supabase Auth saat login pertama)
```

**Catatan koreksi:** Tabel `article_corrections` memiliki kolom `status` (pending/approved/rejected) untuk moderasi.

**Catatan komentar:** Privacy-first — nama pengguna tidak di-expose, semua komentar ditampilkan sebagai "Pembaca".

**Catatan shares:** Tracking anonymized — hanya mencatat platform dan article_id, tidak mencatat siapa yang share.

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

**Catatan kritis user_profiles:** Primary key tabel user_profiles adalah `user_id` (bukan `id`).
PostgREST join via `.select('user_profiles(kolom)')` gagal silent karena FK tidak terdaftar dengan benar.
Solusi wajib: query user_profiles selalu dilakukan terpisah via `.in('user_id', authorIds)` — BUKAN via join inline di .select().
Ini berlaku di semua halaman yang perlu data profil penulis.
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
/
├── middleware.ts                         ← Token refresh + security headers (X-Frame-Options, dll)
│
├── app/
│   ├── icon.svg
│   ├── fonts/ (GeistVF.woff, GeistMonoVF.woff)
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx                          ← Halaman beranda
│   ├── not-found.tsx                     ← Custom 404 page (bukan default Next.js)
│   ├── error.tsx                         ← Global error boundary
│   ├── artikel/
│   │   ├── layout.tsx                    ← KaTeX + highlight.js CSS (hanya dimuat di halaman artikel)
│   │   └── [slug]/
│   │       └── page.tsx                  ← Halaman artikel publik
│   ├── (admin)/
│   │   ├── layout.tsx                    ← Auth guard admin
│   │   └── dashboard/
│   │       ├── page.tsx                  ← Dashboard utama
│   │       ├── artikel/
│   │       │   ├── baru/page.tsx
│   │       │   └── [id]/edit/page.tsx
│   │       └── koreksi/
│   │           └── actions.ts
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts                  ← OAuth callback dengan validasi redirect
│   ├── login/
│   │   └── page.tsx
│   ├── sitemap.ts                        ← Dynamic sitemap untuk SEO (ISR 24h) — mencakup editorial + opinions
│   ├── robots.ts                         ← Robots.txt konfigurasi crawler (disallow: admin, api, login, akun/tulis, akun/artikel/)
│   ├── opinions/
│   │   ├── layout.tsx                    ← KaTeX + highlight.js CSS (hanya dimuat di halaman opinions)
│   │   ├── page.tsx                      ← Daftar artikel opini publik
│   │   └── [username]/
│   │       └── [slug]/
│   │           └── page.tsx              ← Halaman artikel opini individual (generateMetadata lengkap)
│   └── api/
│       ├── analytics/
│       │   └── route.ts                  ← POST analytics events (gunakan getUser() bukan getSession())
│       ├── comments/
│       │   └── route.ts                  ← GET/POST komentar publik (gunakan getUser() bukan getSession())
│       ├── likes/
│       │   ├── route.ts                  ← GET/POST/DELETE likes (admin client, bypass RLS)
│       │   └── count/
│       │       └── route.ts              ← GET jumlah like publik (admin client)
│       ├── shares/
│       │   └── route.ts                  ← POST tracking share (gunakan getUser() bukan getSession())
│       ├── indices/
│       │   └── route.ts                  ← Polling data strip indeks (force-dynamic)
│       ├── keep-alive/
│       │   └── route.ts                  ← Cron job mencegah hibernasi Supabase (CRON_SECRET guard)
│       ├── opinions/
│       │   ├── route.ts                  ← GET daftar artikel user, POST buat draft
│       │   ├── analytics/
│       │   │   ├── event/route.ts        ← POST analytics event (rate limited 30/min)
│       │   │   └── summary/route.ts      ← GET statistik per artikel
│       │   └── [id]/
│       │       ├── route.ts              ← GET/PATCH/DELETE artikel
│       │       ├── publish/route.ts      ← POST publish, DELETE tarik ke draft
│       │       ├── like/route.ts         ← GET/POST/DELETE like opinions
│       │       └── report/route.ts       ← POST laporkan artikel
│       ├── opinion-charts/
│       │   └── [id]/route.ts             ← PATCH/DELETE chart config
│       ├── admin/
│       │   └── opinions/
│       │       ├── route.ts              ← GET semua artikel untuk moderasi
│       │       ├── reports/route.ts      ← GET laporan, PATCH mark reviewed
│       │       └── [id]/hide/route.ts    ← POST hide, DELETE restore
│       └── user-profiles/
│           ├── route.ts                  ← GET/POST/PATCH profil penulis
│           └── [username]/route.ts       ← GET profil publik + daftar artikel
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── ConditionalIndexStrip.tsx     ← Client Component — tampilkan IndexStrip hanya di /
│   │   ├── ScrollToTop.tsx               ← Client Component — paksa scroll ke atas setiap navigasi
│   │   └── HomepageTabs.tsx              ← Tab [Saintifiks | Opinions] di beranda
│   ├── widgets/
│   │   ├── IndexStrip.tsx                ← Server wrapper strip indeks beranda
│   │   ├── IndexStripClient.tsx          ← Client polling + render
│   │   └── TrendIcon.tsx                 ← Ikon naik/turun
│   ├── artikel/
│   │   ├── ArticleRenderer.tsx           ← **SERVER COMPONENT — TIDAK BOLEH DISENTUH**
│   │   ├── ArticleInteractions.tsx       ← Client Component wrapper untuk seluruh section interaksi
│   │   ├── ChartBlock.tsx                ← **JANGAN DISENTUH TANPA KONFIRMASI**
│   │   ├── LikeButton.tsx                ← **JANGAN DISENTUH TANPA KONFIRMASI**
│   │   ├── CorrectionSection.tsx         ← **JANGAN DISENTUH TANPA KONFIRMASI**
│   │   ├── ShareButton.tsx
│   │   ├── CommentsSection.tsx
│   │   └── ImageUpload.tsx
│   ├── opinions/
│   │   ├── OpinionContentRenderer.tsx    ← Server Component — render Markdown opinions (rehypeRaw+Sanitize+KaTeX)
│   │   ├── OpinionLabel.tsx              ← Badge "Opinions"
│   │   ├── AuthorByline.tsx              ← Byline penulis + tanggal
│   │   ├── OpinionCard.tsx               ← Card preview artikel di listing
│   │   ├── OpinionLikeButton.tsx         ← Like button untuk opinions
│   │   ├── ReportButton.tsx              ← Tombol lapor konten
│   │   ├── OpinionAnalyticsTracker.tsx   ← Analytics tracker per artikel opinions
│   │   ├── OpinionAnalyticsDashboard.tsx ← Dashboard analitik penulis
│   │   ├── AkunClient.tsx                ← Dashboard utama penulis (/akun)
│   │   ├── OpinionsModeratorClient.tsx   ← UI moderasi admin
│   │   └── editor/
│   │       ├── TipTapEditor.tsx          ← WYSIWYG utama (StarterKit+Markdown+ChartPlaceholder)
│   │       ├── OpinionEditor.tsx         ← Wrapper editor + save/publish logic
│   │       ├── ChartWizard.tsx           ← Wizard insert chart ke editor
│   │       ├── ImageModal.tsx            ← Modal upload gambar
│   │       ├── TableWizard.tsx           ← Wizard insert tabel Markdown
│   │       └── UsernameSetup.tsx         ← Form setup username pertama kali
│   └── analytics/
│       └── AnalyticsTracker.tsx
│
├── lib/
│   ├── indices/
│   │   ├── fetchers.ts                   ← **JANGAN DISENTUH TANPA KONFIRMASI**
│   │   ├── get-indices.ts
│   │   ├── http.ts
│   │   ├── format.ts
│   │   ├── trend.ts
│   │   ├── types.ts
│   │   └── yahoo.ts
│   ├── supabase/
│   │   ├── client.ts                     ← Browser client (anon key)
│   │   ├── server.ts                     ← Server client (anon key, with cookies)
│   │   ├── admin.ts                      ← Server-only admin client (service_role key)
│   │   └── remark/
│   │       └── remarkCallout.ts
│   ├── slug.ts                           ← Centralized slug generation (DRY principle)
│   └── rate-limit.ts                     ← In-memory rate limiting helper untuk API routes
│
├── .github/workflows/backup.yml
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── vercel.json
└── README.md
```

### File yang TIDAK BOLEH DISENTUH (Red Zones)

| File/Folder | Alasan |
|-------------|--------|
| `ArticleRenderer.tsx` | Server Component murni — sentuh hanya untuk perbaikan kritis yang terverifikasi |
| `ChartBlock.tsx` | SSR/Client boundary sudah di-tune — risiko crash |
| `LikeButton.tsx` | Sistem likes sudah fix 3 kali — sangat sensitif terhadap RLS |
| `CorrectionSection.tsx` | Bagian dari interaksi artikel yang sudah stabil |
| `app/artikel/[slug]/page.tsx` | ISR strategy sudah di-tune — perubahan bisa merusak caching |
| `app/api/analytics/route.ts` | Tracking sistem — perubahan bisa merusak data |
| `app/api/keep-alive/route.ts` | Risiko eksistensial — database bisa hibernate jika rusak |
| `lib/indices/` | Widget indeks sudah di-tune untuk rate limiting |
| `components/widgets/` | Polling 15 detik sudah stabil |
| `app/(admin)/dashboard/artikel/` | Workflow editorial sudah stabil |

### Catatan Kritis: Supabase Clients

Terdapat 3 jenis Supabase client — **jangan pernah salah pakai**:

1. **`lib/supabase/client.ts`** → Browser/Client Component (anon key)
   - Gunakan di: `'use client'` components
   - **Wajib:** bungkus dalam `useMemo(() => createClient(), [])` — jangan panggil langsung di body komponen
   - Jangan gunakan untuk: Operasi likes (terblokir RLS)

2. **`lib/supabase/server.ts`** → Server Component & API routes (anon key with cookie handling)
   - Gunakan di: API routes untuk verifikasi auth (`getUser()`)
   - Jangan gunakan untuk: Count likes (terblokir RLS)

3. **`lib/supabase/admin.ts`** → Server-side ONLY (service_role key)
   - Gunakan di: API routes untuk operasi agregat (count likes) atau bypass RLS
   - **⚠️ JANGAN PERNAH IMPORT DI CLIENT COMPONENT** — ini bug keamanan kritis
   - Selalu verifikasi auth via `server.ts` sebelum pakai `admin.ts` untuk tulis data

---

## 8. KONVENSI KODE

> Status: DITETAPKAN. Berlaku mulai scaffold pertama.

```
Naming files:    PascalCase untuk komponen React (ArticleRenderer.tsx, LikeButton.tsx)
                 kebab-case untuk file non-komponen (keep-alive.ts, backup.yml)
Naming vars:     camelCase untuk variabel dan fungsi (articleSlug, handleLike)
Naming DB cols:  snake_case (article_id, created_at, is_published)
Component style: PascalCase untuk nama komponen React (ArticleRenderer, LikeButton)
API routes:      /api/[resource] — selalu plural (bukan /api/like tapi /api/likes)
Error handling:  Setiap API route wajib punya try/catch dan return response dengan status code yang tepat
Comments:        Bahasa Indonesia untuk komentar bisnis/logika, bahasa Inggris untuk komentar teknis
```

---

## 9. CHECKLIST IMPLEMENTASI

> Status saat ini: Phase 0–4 selesai. Post-launch improvements berkelanjutan.

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
- [x] Sistem chart (tabel `article_charts`, placeholder parser, Chart.js renderer)
- [x] Upload gambar via Supabase Storage

### Phase 3 — Interaksi pembaca
- [x] Google OAuth untuk pembaca (login untuk like)
- [x] Sistem likes (tabel `likes`, API endpoint, LikeButton component)
- [x] Analytics internal (tabel `analytics_events`, event tracking)

### Phase 4 — Kualitas & keamanan
- [x] Weekly backup database via GitHub Actions
- [x] SEO metadata lengkap (Open Graph, Twitter Card)
- [x] Mekanisme koreksi artikel (publik)
- [x] Performance audit
- [x] Perbaikan UX Login Google OAuth (account chooser + loading feedback)
- [x] **Security audit fixes — getUser() vs getSession(), middleware, security headers** ← 24-05-2026
- [x] **Custom 404 page dan global error boundary** ← 24-05-2026
- [x] **Rate limiting di API routes — proteksi abuse dengan in-memory store** ← 24-05-2026
- [x] **rehype-sanitize — XSS protection untuk konten user-generated (Opinions)** ← 25-05-2026

### Post-launch — Beranda & konteks data
- [x] Widget indeks beranda (fetch otomatis, tanpa hardcode)
- [x] Strip tipis horizontal di atas beranda (gaya ticker editorial)
- [x] Ikon tren naik (hijau) / turun (merah) per rentang data tersedia
- [x] Pembaruan pasar live via `/api/indices` + polling client 15 detik
- [x] Scroll horizontal tanpa scrollbar terlihat
- [x] Optimasi kecepatan render artikel (migrasi penuh ke Server Component)
- [x] Implementasi parser luwes (json5) & parser HTML mentah (rehype-raw) untuk toleransi output AI
- [x] Resolusi anomali pemutusan footnote via arsitektur single-pass render
- [x] Widget indeks dipindah ke atas Navbar (via `ConditionalIndexStrip` di `layout.tsx`)
- [x] Scroll otomatis ke paling atas saat navigasi halaman (via `ScrollToTop` di `layout.tsx`)
- [x] **Fix opinions page visibility — query 2 tahap untuk menghindari PostgREST join failure** ← 25-05-2026
- [x] **Editor improvements — tabel GFM grid di editor, chart chip label, placeholder fix, toolbar top eksplisit** ← 25-05-2026
- [x] Hard reset arsitektur warna Tailwind + CSS Variables (Single Source of Truth).
- [x] Migrasi 4-lapis tipografi via Google Fonts (Marcellus, Source Serif 4, IBM Plex Sans, IBM Plex Mono).
- [x] Dark mode OS-level via `@media (prefers-color-scheme: dark)`.
- [x] Komponen `ReadingProgressIndicator` di artikel.
- [x] Pembatalan dokumen arsitektur turunan AI yang cacat (HANDOVER_CONTEXT.md, dsb).
- [x] Pembersihan residu token V1 dan propagasi token V2 pada komponen interaktif (Koreksi, Komentar, Share) dan kartu artikel Opini.
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

[20-05-2026] MASALAH: <img> di ArticleRenderer.tsx menghasilkan ESLint warning
                      (next/no-img-element) — seharusnya pakai <Image> dari next/image
             STATUS: open
             WORKAROUND: warning tidak memblokir build, halaman tetap berfungsi normal
             RESOLVED: -

[20-05-2026] MASALAH: <img> di ArticleRenderer.tsx menghasilkan ESLint warning
                      (next/no-img-element) — seharusnya pakai <Image> dari next/image
             STATUS: resolved
             WORKAROUND: -
             RESOLVED: 20-05-2026 | Sesi #19 — implementasi pendekatan hibrida:
                       gambar Supabase pakai <Image>, gambar eksternal pakai <img>
                       dengan eslint-disable inline. ESLint warning dihilangkan.

[20-05-2026] MASALAH: Callout box (> [!NOTE]) belum berfungsi — logika string matching
                      tidak kompatibel dengan react-markdown v10 (children adalah React node,
                      bukan string); regex flag /s membutuhkan ES2018 yang tidak dikonfigurasi
             STATUS: resolved
             WORKAROUND: -
             RESOLVED: 20-05-2026 | Sesi #19 — implementasi custom remark plugin
                       (lib/remark/remarkCallout.ts) yang memproses AST sebelum render.
                       Mendukung [!NOTE], [!WARNING], [!IMPORTANT], [!TIP].

[24-05-2026] MASALAH: Rate limiting di API routes (T-01, H-02) — belum ada mekanisme proteksi abuse
             STATUS: resolved
             WORKAROUND: -
             RESOLVED: 24-05-2026 | Sesi #37 — implementasi in-memory rate limiting di lib/rate-limit.ts
                       dengan konfigurasi per endpoint: comments (5/min), likes (20/min), shares (5/min),
                       analytics (30/min). Menggunakan IP-based identifier dari x-forwarded-for header.

[24-05-2026] MASALAH: rehype-sanitize untuk konten opini (S-03, M-04) — proteksi XSS tambahan
             STATUS: resolved
             WORKAROUND: -
             RESOLVED: 25-05-2026 | Sesi #39 — install rehype-sanitize, update OpinionContentRenderer.tsx
                       untuk membersihkan HTML user-generated sebelum render. Hapus tag <script>, 
                       event handlers (onclick, onerror), dan atribut berbahaya lainnya.

[25-05-2026] TECHNICAL DEBT: Sisa temuan audit yang BELUM dikerjakan:
             - [SELESAI] Semua critical, high, medium, dan low priority audit fixes sudah selesai.
             STATUS: resolved
             WORKAROUND: -
             RESOLVED: 25-05-2026 | Semua temuan audit report telah diperbaiki dan di-merge ke main.

[25-05-2026] MASALAH: Halaman /opinions kosong — artikel published tidak muncul
             STATUS: resolved
             WORKAROUND: -
             RESOLVED: 25-05-2026 | Sesi #41 — Root cause: PostgREST join user_profiles
                       dalam .select() gagal silent karena PK tabel adalah user_id bukan id.
                       Supabase tidak bisa resolve join tanpa FK eksplisit terdaftar.
                       Fix: query 2 tahap — fetch opinion_articles dulu, lalu fetch user_profiles
                       terpisah via .in('user_id', authorIds). Diterapkan di opinions/page.tsx,
                       app/page.tsx, dan app/sitemap.ts.

[25-05-2026] MASALAH: like_count di kartu artikel list (/opinions dan /) selalu 0
             STATUS: open
             WORKAROUND: Angka 0 tidak ditampilkan di UI (kondisi likeCount > 0)
             RESOLVED: -

[25-05-2026] MASALAH: Tabel GFM di editor TipTap tidak dirender sebagai grid — teks pipe | muncul mentah di area WYSIWYG.
             STATUS: resolved
             WORKAROUND: -
             RESOLVED: 25-05-2026 | Sesi #42 — install 4 package @tiptap/extension-table* v3.23.6, tambah ke extensions di TipTapEditor.tsx.

[25-05-2026] MASALAH: Chart placeholder chip kosong — tidak ada label, penulis tidak bisa membedakan antar chart jika ada lebih dari satu.
             STATUS: resolved
             WORKAROUND: -
             RESOLVED: 25-05-2026 | Sesi #42 — renderHTML() di ChartPlaceholder diubah agar menampilkan teks '📊 {chartId}'.

[25-05-2026] MASALAH: Placeholder "Mulai menulis..." tumpang tindih dengan chart placeholder node (editor berisi chart tapi tidak ada teks).
             STATUS: resolved
             WORKAROUND: -
             RESOLVED: 25-05-2026 | Sesi #42 — kondisi diganti menjadi isEmpty: doc.textContent === '' && doc.childCount <= 1.

[31-05-2026] MASALAH: Kegagalan Arsitektur Dark Mode (UI Tidak Terbaca)
           STATUS: resolved
           WORKAROUND: -
           RESOLVED: [31-05-2026] | Root cause: Implementasi AI eksternal yang menempatkan warna Hex statis di dalam objek `colors` pada `tailwind.config.ts` (#F7F5F0) dan pada saat yang bersamaan mencoba membalikkan warna melalui `@media (prefers-color-scheme: dark)` di `globals.css`. Tailwind membajak spesifisitas CSS; teks merespons menjadi terang, tapi background terkunci pada mode terang.
           Fix: Hard reset arsitektur. Hapus Hex statis dari Tailwind. Tailwind dipaksa hanya membaca `var(--color-paper)` dari CSS. Logika Dark Mode dikembalikan 100% ke kendali CSS murni.

[31-05-2026] MASALAH: Pop-up interaktif (Koreksi, Komentar, Share) merender transparan, background textarea putih solid (merusak kontras Mode Gelap), dan judul artikel Opinions gagal berinversi.
           STATUS: resolved
           WORKAROUND: -
           RESOLVED: [31-05-2026] | Root cause: 1) Pemanggilan token V1 usang (`bg-primary-light`) yang diabaikan Tailwind karena sudah dihapus dari config. 2) Ketiadaan deklarasi background pada textarea sehingga browser memaksakan default putih. 3) Penggunaan warna HEX absolut (`text-[#1A1A1A]`) pada judul opini yang memblokir CSS variables. Fix: Replace massal menggunakan token V2 (`bg-paper`, `text-ink`) dan injeksi `bg-transparent` pada input form.

[01-06-2026] MASALAH: Preview deployment Vercel terkunci proteksi login (SSO) — pengujian visual otomatis (toggle, lebar 65ch, font) tidak bisa diakses Devin tanpa kredensial Vercel.
           STATUS: open
           WORKAROUND: Pemilik membuka URL preview sambil login akun Vercel; ATAU jalankan `npx next dev` lokal dengan env publik NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_KEY agar halaman artikel ter-render.
           RESOLVED: -
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
           PERHATIAN KRITIS: CRON_SECRET env var WAJIB di-set di Vercel dashboard. Jika tidak, route handler
           akan return 500 (bukan bypass) — database tidak akan di-ping dan bisa hibernate.

[19-05-2026] KEPUTUSAN: File kode yang mengandung tag <a wajib dibuat via artifact download
             ALASAN: Browser Claude merender tag <a sebagai HTML sungguhan saat copy-paste,
             sehingga tag itu hilang dari kode sebelum sampai ke file. Ini menyebabkan
             build Vercel gagal dengan error "Unexpected token" di JSX.
             ATURAN: Setiap kali AI perlu memberikan file .tsx/.jsx yang mengandung tag <a,
             wajib gunakan fitur create_file + present_files agar user bisa download langsung.
             Jangan pernah instruksikan copy-paste kode JSX yang mengandung <a dari chat.
             ALTERNATIF DITOLAK: Copy-paste dari chat (terbukti gagal), PowerShell Set-Content
             here-string (terbukti juga memakan tag <a dalam kondisi tertentu)

[20-05-2026] KEPUTUSAN: Navbar diubah dari Server Component menjadi Client Component
             ALASAN: Perlu mengecek status sesi login pembaca secara real-time untuk
             menampilkan tombol Masuk/Keluar yang sesuai. Server Component tidak bisa
             melakukan ini tanpa membebani caching layout root.
             CATATAN IMPLEMENTASI: Tombol Masuk/Keluar disembunyikan di halaman admin
             (/dashboard, /login) karena admin punya tombol Keluar sendiri di dashboard.
             Setelah Keluar, pembaca diarahkan ke beranda (/). Tombol Masuk meneruskan
             URL halaman saat ini via parameter ?next= agar pembaca kembali ke artikel
             yang sedang dibaca setelah OAuth selesai.

[20-05-2026] KEPUTUSAN: Menggunakan `queryParams: { prompt: 'select_account' }` pada signInWithOAuth
             ALASAN: Meningkatkan transparansi dan kejelasan saat login Google, terutama ketika browser hanya punya satu akun. Memberi 
             pengalaman yang lebih sesuai ekspektasi pengguna modern (account chooser).
             ALTERNATIF DITOLAK: prompt langsung di options (TypeScript error) dan tidak menggunakan prompt sama sekali (UX kurang jelas)
             CATATAN IMPLEMENTASI: Diterapkan di Navbar.tsx dan LikeButton.tsx untuk konsistensi seluruh flow login pembaca.

[20-05-2026] KEPUTUSAN: Advanced Markdown Renderer menggunakan remark-gfm + remark-math
                        + rehype-katex + rehype-highlight
             ALASAN: Library ini adalah ekosistem standar untuk fitur tabel GFM, formula
                     LaTeX, dan syntax highlighting di atas react-markdown; ringan dan
                     tidak bergantung layanan pihak ketiga; bundle naik ~130KB (KaTeX ~100KB,
                     highlight.js ~30KB) — masih dalam batas aman free tier Vercel
             ALTERNATIF DITOLAK: Prism.js (lebih besar), MathJax (lebih berat dari KaTeX)
             CATATAN IMPLEMENTASI: CSS KaTeX dan highlight.js diimport di app/artikel/layout.tsx
                                   dan app/opinions/layout.tsx — TIDAK di root layout.tsx.
                                   Ini menghemat ~70KB per load halaman non-artikel (beranda, akun, dll).

[20-05-2026] KEPUTUSAN: Callout box didefer — tidak diimplementasikan di Sesi #17
             ALASAN: Dua masalah teknis fundamental: (1) react-markdown v10 tidak lagi
                     mengekspos children sebagai string di custom components — String(children)
                     menghasilkan "[object Object]"; (2) regex flag /s membutuhkan target
                     ES2018 di tsconfig yang tidak dikonfigurasi di proyek ini.
                     Implementasi yang benar membutuhkan remark plugin khusus yang memproses
                     AST sebelum rendering — scope berbeda, harus sesi terpisah.
             ALTERNATIF DITOLAK: String matching di blockquote component (terbukti tidak
                                 bisa bekerja dengan react-markdown v10)
             CATATAN IMPLEMENTASI: Saat callout diimplementasikan, gunakan remark-directive
                                   atau buat custom remark plugin yang transform node
                                   blockquote dengan teks [!NOTE] di AST sebelum render
[20-05-2026] KEPUTUSAN: ChartBlock menggunakan dynamic import + registerables
           ALASAN: Chart.js v4 + react-chartjs-2 tidak bisa di-SSR karena bergantung pada Canvas API browser. Dynamic import dengan 
           {ssr: false } mencegah crash di server. registerables digunakan agar semua tipe chart (bar, line, dll) otomatis terdaftar
           tanpa harus mendaftarkan satu per satu.
           ALTERNATIF DITOLAK: Import biasa (menyebabkan Application Error), mendaftarkan controller & element satu per satu (rawan 
           error & kurang future-proof).
           CATATAN IMPLEMENTASI: Dynamic import dilakukan di ArticleRenderer.tsx. Registrasi dilakukan di dalam ChartBlock.tsx itu 
           sendiri agar component self-contained.
[20-05-2026] KEPUTUSAN: Next.js <Image> hanya untuk gambar Supabase (pendekatan hibrida)
             ALASAN: <Image> hanya bisa mengoptimasi gambar dari domain yang terdaftar.
                     Mendaftarkan semua domain eksternal (BPS, Wikipedia, dll.) tidak praktis.
                     Pendekatan hibrida: cek URL — jika .supabase.co → <Image>, jika tidak → <img>.
                     Ini memaksimalkan optimasi tanpa risiko error di artikel lama.
             ALTERNATIF DITOLAK: Daftarkan semua domain (tidak skalabel);
                                 tetap pakai <img> semua (membuang manfaat Next.js Image)
             CATATAN IMPLEMENTASI: Logika pengecekan di components/artikel/ArticleRenderer.tsx.
                                   Domain Supabase dikonfigurasi di next.config.mjs.

[20-05-2026] KEPUTUSAN: Callout box menggunakan custom remark plugin (bukan remark-directive)
             ALASAN: Seksi 11 sebelumnya menyebut dua opsi: remark-directive atau custom plugin.
                     Custom plugin dipilih karena: (1) tidak menambah dependency baru,
                     (2) sintaks > [!NOTE] lebih natural daripada ::note[teks],
                     (3) cukup ~50 baris kode, maintainable sendiri.
             ALTERNATIF DITOLAK: remark-directive (menambah dependency, sintaks berbeda)
             CATATAN IMPLEMENTASI: lib/remark/remarkCallout.ts — plugin standalone tanpa
                                   dependency eksternal. Mendukung NOTE, WARNING, IMPORTANT, TIP.

[20-05-2026] KEPUTUSAN: Footnote CSS menggunakan selector CSS biasa (bukan Tailwind utility)
             ALASAN: remark-gfm menghasilkan class HTML spesifik (data-footnote-ref,
                     .footnotes, .data-footnote-backref) yang tidak bisa ditarget
                     via Tailwind utility class di JSX — harus pakai CSS global.
             ALTERNATIF DITOLAK: Tailwind arbitrary selector (verbose, sulit dibaca)
             CATATAN IMPLEMENTASI: Semua CSS footnote ada di app/globals.css
                                   di bawah comment FOOTNOTE STYLING.

[21-05-2026] KEPUTUSAN: Widget indeks beranda — hybrid Server + Client polling
             ALASAN: Memenuhi Prinsip #5/#7 (konteks faktual, sumber terlacak) tanpa
                     melanggar Zona Merah (bukan autoplay, bukan engagement bait).
                     SSR untuk first paint cepat; Client polling ringan hanya di strip.
             ALTERNATIF DITOLAK: Client-only (flash kosong), polling tiap 3 detik ke
                                 API eksternal tanpa cache server (membebani Yahoo),
                                 hardcode tahunan (terlalu manual)
             CATATAN IMPLEMENTASI: Lihat Seksi 5.3. Polling 15 detik, tab harus visible.
                                   USD/IDR dan pasar via Yahoo intraday; Frankfurter
                                   hanya fallback. ISR beranda (1 jam) tidak menggantikan
                                   polling strip.

[21-05-2026] KEPUTUSAN: accent-green (#5C8F6E) ditambahkan ke palette
             ALASAN: Ikon naik di strip indeks butuh warna semantik yang elegan dan
                     selaras dengan primary-dark/light; merah sudah dipakai untuk turun.
             CATATAN: Hanya untuk indikator naik di strip — bukan dekorasi umum.
[21-05-2026] KEPUTUSAN: ArticleRenderer diubah murni menjadi Server Component
             ALASAN: Memindahkan beban komputasi terjemahan Markdown dari peramban pembaca (client) ke Vercel (server). Menghasilkan
             waktu muat halaman (First Contentful Paint) yang jauh lebih cepat dan menghemat daya perangkat pembaca.
             ALTERNATIF DITOLAK: Client Component murni (menimbulkan latensi render di sisi klien).

[21-05-2026] KEPUTUSAN: Penggunaan format JSON5 dan Regex Strip pada ChartBlock
             ALASAN: Model AI generatif sering memproduksi format konfigurasi JSON yang kotor (membawa elemen markdown ```json,
             melupakan kutip ganda, atau menaruh koma berlebih). JSON5 memaklumi kesalahan sintaks ringan tersebut, sementara Regex
             mengeleminasi elemen markdown yang terbawa.
             CATATAN IMPLEMENTASI: Celah eksekusi JavaScript native (XSS) tetap terblokir keras oleh catch error block.

[21-05-2026] KEPUTUSAN: Arsitektur "Single-Pass Render" pada ArticleRenderer
             ALASAN: Penggunaan metode .split() memotong teks Markdown menjadi beberapa bagian (array) setiap ada grafik. Ini
             menghilangkan rekaman struktur sintaks (*AST context*), menyebabkan plugin remark-gfm gagal mengaitkan indeks footnote
             [^1] di potongan pertama dengan referensi penjelasannya di potongan terakhir. Single-pass render menggunakan metode regex
             .replace() untuk menyamar token grafik menjadi HTML murni <div class="saintifiks-chart">, sehingga teks dirender 100% utuh
             dalam satu tarikan napas tanpa memutus referensi tautan.
[21-05-2026] KEPUTUSAN: Mengganti app/favicon.ico dengan app/icon.svg
             ALASAN: Next.js App Router mendukung metadata ikon berbasis SVG secara bawaan. Menggunakan berkas murni SVG dari aset logo
             orisinal memotong kebutuhan konversi manual berkas ke format .ico konvensional, sekaligus memastikan ketajaman visual ikon
             di berbagai resolusi layar (Retina/High-DPI).
             ALTERNATIF DITOLAK: Mempertahankan berkas favicon.ico bawaan Next.js atau melakukan konversi paksa berkas SVG ke format
             ICO secara manual.

[21-05-2026] KEPUTUSAN: IndexStrip dipindah ke atas Navbar, hanya di halaman beranda
             ALASAN: Permintaan pemilik — strip indeks lebih efektif sebagai elemen editorial
                     jika langsung terlihat sebelum navigasi, bukan setelah.
             IMPLEMENTASI: Dua Client Component baru di components/layout/:
                     (1) ConditionalIndexStrip.tsx — menggunakan usePathname() dari
                         next/navigation; merender <IndexStrip /> hanya jika pathname === '/'.
                         IndexStrip (Server Component) dioper sebagai prop children/strip
                         agar Server Component tidak terkontaminasi menjadi Client Component.
                     (2) Keduanya dipasang di app/layout.tsx sebelum <Navbar />.
                     (3) <IndexStrip /> dihapus dari app/page.tsx.
             ALTERNATIF DITOLAK: Tanpa kondisi di layout.tsx (strip muncul di semua halaman
                                 — melanggar keputusan desain awal Seksi 5.3);
                                 tetap di page.tsx (posisi di bawah Navbar).
             CATATAN: Keputusan "widget hanya di beranda" dari Seksi 5.3 tetap dipertahankan.
                      Deskripsi posisi di Seksi 5.3 diperbarui dari "di bawah Navbar"
                      menjadi "di atas Navbar".

[21-05-2026] KEPUTUSAN: ScrollToTop — paksa scroll ke paling atas setiap navigasi
             ALASAN: Tanpa ini, Next.js App Router mempertahankan posisi scroll terakhir
                     saat pengguna kembali ke halaman beranda, yang membingungkan.
             IMPLEMENTASI: components/layout/ScrollToTop.tsx — Client Component ringan
                           menggunakan useEffect + usePathname(). Dipasang di app/layout.tsx.
                           Tidak ada library tambahan — hanya window.scrollTo(0,0).
             ALTERNATIF DITOLAK: CSS scroll-behavior (tidak bisa dikontrol per navigasi);
                                 solusi di masing-masing page.tsx (duplikasi, tidak terpusat).

[22-05-2026] KEPUTUSAN: Social Interaction Icons menggunakan lucide-react
             ALASAN: Keperluan icon yang konsisten dan modern untuk Like (Heart), Share (Share2),
                     dan Correction (AlertCircle). lucide-react adalah library icon yang ringan,
                     tree-shakeable, dan actively maintained.
             CATATAN IMPLEMENTASI: Tidak menambah dependency berat — bundle hanya include icon yang digunakan.
             ALTERNATIF DITOLAK: SVG manual (maintenance burden tinggi), react-icons (bundle lebih besar).

[22-05-2026] KEPUTUSAN: ShareButton dengan html-to-image untuk Instagram Story
             ALASAN: Kebutuhan generate gambar 1080x1920 secara client-side untuk dibagikan ke
                     Instagram Story tanpa perlu server-side rendering atau storage.
             CATATAN IMPLEMENTASI: html-to-image ringan, output PNG/Canvas, tidak perlu server.
             ALTERNATIF DITOLAK: html2canvas (lebih berat), puppeteer SSR (quota mahal).

[22-05-2026] KEPUTUSAN: Comments Section — privacy-first dengan nama "Pembaca"
             ALASAN: Menghindari expose data pribadi user (real name/avatar) dari auth.users.
                     Tabel auth.users tidak bisa di-join via API dengan anon key.
             CATATAN IMPLEMENTASI: Display "Pembaca" untuk semua komentar. Simpan user_id di DB
                     untuk moderasi/admin purposes saja.
             ALTERNATIF DITOLAK: Join ke auth.users (tidak bisa dengan anon key), expose real name.

[22-05-2026] KEPUTUSAN: ArticleInteractions sebagai Client Component wrapper
             ALASAN: Mengisolasi seluruh section interaksi (Like, Share, Comments) dalam satu
                     Client Component agar error di satu bagian tidak merusak artikel.
             CATATAN IMPLEMENTASI: Wrapper memanggil LikeButton, ShareButton, CommentsSection, CorrectionSection.
             ALTERNATIF DITOLAK: Masing-masing di page.tsx (error satu komponen = crash seluruh halaman).

[22-05-2026] KEPUTUSAN: Supabase query `.maybeSingle()` bukan `.single()` untuk likes
             ALASAN: `.single()` throw error 406 jika 0 rows (user belum like). `.maybeSingle()`
                     return `null` gracefully — lebih aman untuk client-side check.
             CATATAN IMPLEMENTASI: Dipakai di LikeButton.tsx untuk cek status like user.
             ALTERNATIF DITOLAK: `.single()` dengan try-catch (lebih verbose, tidak idiomatic).

[22-05-2026] KEPUTUSAN: Error handling dengan try-catch di Client Components
             ALASAN: Mencegah satu error (misal: API fail, network issue) menghancurkan seluruh UI.
                     User tetap bisa baca artikel meski fitur interaksi error.
             CATATAN IMPLEMENTASI: Wrap Supabase calls dan fetch dengan try-catch, log error ke console,
                     fallback UI jika perlu.
             ALTERNATIF DITOLAK: Error boundary React (lebih kompleks), biarkan crash (UX buruk).

[22-05-2026] KEPUTUSAN: ISR revalidate = 3600 untuk halaman artikel
             ALASAN: Hemat Supabase quota dengan cache 1 jam. Artikel jarang berubah setelah publish.
                     Koreksi dan interaksi tetap real-time via Client Components.
             CATATAN IMPLEMENTASI: `export const revalidate = 3600` di page.tsx. Jika urgent update,
                     redeploy manual via Vercel dashboard.
             ALTERNATIF DITOLAK: `dynamic = 'force-dynamic'` (boros quota, tidak perlu untuk artikel static).

[22-05-2026] KEPUTUSAN: Semua operasi likes via API server-side (admin client, bypass RLS)
             ALASAN: Insert langsung dari client (anon key) dan count via server anon key
                     keduanya terblokir RLS — likes user lain tidak terbaca, insert bisa gagal.
                     Service role key di server-side adalah satu-satunya cara yang andal untuk
                     operasi agregat (count semua rows) dan operasi tulis yang perlu bypass RLS.
             CATATAN IMPLEMENTASI: lib/supabase/admin.ts — createAdminClient() pakai service_role key.
                     app/api/likes/route.ts — GET/POST/DELETE semua via admin client.
                     Auth user tetap diverifikasi via cookie session sebelum tulis (tidak anonymous).
                     LikeButton.tsx tidak lagi direct-query Supabase untuk likes — hanya via /api/likes.
                     SUPABASE_SERVICE_ROLE_KEY wajib ada di .env.local DAN Vercel env vars.
             KEAMANAN: service_role key TIDAK PERNAH expose ke client — hanya di server API routes.
             ALTERNATIF DITOLAK: Relaksasi RLS SELECT (tidak aman untuk data writes);
                                 bypass via anon key di client (tidak bisa tanpa ubah RLS).

[22-05-2026] KEPUTUSAN: Fix likes count — useMemo + cache no-store + rollback count
             ALASAN: Tiga bug ditemukan di LikeButton.tsx:
                     (1) createClient() dipanggil di body komponen tanpa useMemo → instance baru
                         setiap render → useEffect depend pada supabase yang selalu berubah →
                         likeCount di-reset ke 0 setiap render, termasuk saat user lain membuka artikel.
                     (2) likeCount tidak di-rollback saat insert/delete error — hanya isLiked yang di-revert.
                     (3) Fetch /api/likes/count tanpa cache: 'no-store' → potensi stale response dari Next.js.
             CATATAN IMPLEMENTASI: (1) useMemo(() => createClient(), []) di LikeButton.tsx;
                     (2) setLikeCount(previousCount) ditambah di blok error handling;
                     (3) cache: 'no-store' di semua fetch + export const dynamic = 'force-dynamic'
                         dan Cache-Control no-store header di /api/likes/count/route.ts.
             ALTERNATIF DITOLAK: Re-fetch setiap interval (polling boros); tidak rollback (UX salah).

[22-05-2026] KEPUTUSAN: color-scheme: only light — situs tidak mendukung dark mode
             ALASAN: Samsung Internet dan beberapa browser mobile menerapkan "Forced Dark Mode"
                     secara otomatis ketika mode malam perangkat aktif. Tanpa deklarasi ini,
                     browser meng-invert atau mengurangi saturasi warna elemen secara paksa —
                     menyebabkan logo berubah abu-abu dan avatar profil warnanya terbalik.
                     Situs Saintifiks saat ini hanya mendukung tema terang; deklarasi ini
                     mencegah browser memodifikasi tampilan tanpa izin.
             CATATAN IMPLEMENTASI: Tiga lapisan perlindungan:
                     (1) `color-scheme: only light` di `:root` pada app/globals.css
                     (2) `colorScheme: "only light"` di metadata Next.js (app/layout.tsx)
                         → menghasilkan `<meta name="color-scheme" content="only light">`
                     (3) Elemen logo di app/page.tsx diubah dari `<img>` biasa menjadi
                         `<picture>` dengan `<source media="(prefers-color-scheme: dark)">`
                         sebagai fallback eksplisit untuk browser yang tetap
                         menghormati media query dark mode.
             ALTERNATIF DITOLAK: Kelas `dark:` Tailwind (Tailwind darkMode tidak dikonfigurasi
                                 dan situs memang tidak dirancang untuk dark mode);
                                 filter CSS manual (tidak mengatasi root cause).
             SUPERSEDED: [01-06-2026] Sesi #46 — situs kini mendukung dark mode penuh (hibrida OS + toggle). Lihat keputusan "Dark Mode Hibrida" di bawah.

[23-05-2026] KEPUTUSAN: Opinions Platform — platform opini pengguna terpisah dari sistem editorial
             ALASAN: Memungkinkan pembaca terpilih mempublikasikan artikel opini tanpa mengubah
                     sistem editorial yang sudah stabil. Dipisahkan secara penuh — tabel DB sendiri,
                     komponen sendiri, URL sendiri — agar tidak ada risiko kontaminasi ke konten redaksi.
             KEPUTUSAN TURUNAN:
               (1) Moderasi Opsi C: artikel opini publish langsung tanpa review — admin bisa takedown.
               (2) Username permanen setelah dibuat; display_name bisa diubah kapan saja.
               (3) Slug terkunci (slug_locked=true) setelah artikel pertama kali dipublish.
               (4) Status artikel: draft | published | hidden.
               (5) OpinionContentRenderer adalah Server Component BARU — salinan logika ArticleRenderer
                   tapi terpisah total. ArticleRenderer.tsx TIDAK BOLEH disentuh.
               (6) Editor: Markdown + toolbar visual (dua panel textarea + live preview).
                   Preview (OpinionPreview.tsx) adalah Client Component karena digunakan dalam editor.
               (7) Analitik per penulis dijamin via RLS — setiap penulis hanya bisa membaca data miliknya.
               (8) Like opinions menggunakan admin client (service_role) untuk bypass RLS — pola sama
                   dengan sistem likes editorial (keputusan [22-05-2026]).
             CATATAN IMPLEMENTASI:
               - 6 tabel baru: user_profiles, opinion_articles, opinion_article_charts,
                 article_reports, opinion_likes, opinion_analytics_events. RLS aktif di semua.
               - Storage bucket baru: opinions-gambar (public read, auth write, max 5MB).
               - 14 API endpoints baru di /api/opinions/, /api/opinion-charts/, /api/admin/opinions/,
                 /api/user-profiles/.
               - URL artikel opini: /opinions/[username]/[slug]
               - URL profil penulis: /penulis/[username]
               - Dashboard penulis: /akun
               - Editor tulis baru: /akun/tulis
               - Editor edit: /akun/artikel/[id]/edit
               - Moderasi admin: /dashboard/opinions
             FILE YANG TIDAK BOLEH DISENTUH (tetap berlaku):
               ArticleRenderer.tsx, ChartBlock.tsx, LikeButton.tsx, CorrectionSection.tsx,
               app/artikel/[slug]/page.tsx, app/api/analytics/route.ts,
               app/api/keep-alive/route.ts, lib/indices/, components/widgets/,
               app/(admin)/dashboard/artikel/
             ALTERNATIF DITOLAK: Menyatukan dengan sistem editorial (terlalu berisiko merusak
                                 konten redaksi yang sudah stabil); moderasi pre-publish (menambah
                                 bottleneck tanpa benefit proporsional di fase awal).

[24-05-2026] KEPUTUSAN: Homepage tab [Saintifiks | Opinions] — dua konten setara di satu halaman
             ALASAN: Opinions harus berbobot setara dengan konten redaksi — tidak boleh ada
                     superioritas intelektual antara konten redaksi dan opini pembaca. Tab dua arah
                     di bawah header beranda adalah cara paling jujur mengekspresikan kesetaraan ini
                     tanpa mengubah struktur navigasi yang sudah ada.
             CATATAN IMPLEMENTASI:
               - Dibuat `components/layout/HomepageTabs.tsx` — Client Component, handle state tab.
               - Tab sticky `top-[93px]` = IndexStrip (h-9=36px) + Navbar (py-5+text-lg=57px).
               - Background tab solid `bg-primary-light` agar konten tidak "menembus" saat scroll.
               - Tab aktif: `border-b-2 border-primary-dark`. Tab non-aktif: `text-primary-dark/40`.
               - `app/page.tsx` dimodifikasi: fetch paralel `Promise.all` untuk editorial + opinions.
               - `revalidate` turun dari 3600 → 300 agar sinkron dengan `/opinions`.
               - `app/page.tsx` dihapus dari daftar file yang tidak boleh disentuh (konfirmasi
                 pemilik [24-05-2026]).
             ALTERNATIF DITOLAK: Section opinions di bawah editorial (menempatkan opinions sebagai
                                 konten sekunder); dua halaman terpisah tanpa hubungan di beranda
                                 (opinions tidak terlihat untuk pengunjung baru).

[24-05-2026] KEPUTUSAN: Exception library baru — TipTap WYSIWYG untuk editor opinions
             ALASAN: Editor split panel (textarea kiri + preview kanan) menampilkan sintaks Markdown
                     mentah (##, **, |||, --) yang mengganggu pengalaman menulis. Penulis seharusnya
                     fokus pada konten, bukan markup. TipTap + tiptap-markdown memungkinkan WYSIWYG
                     penuh: penulis melihat hasil render langsung, Markdown tersimpan di background.
             PACKAGE YANG DITAMBAHKAN:
               - `@tiptap/react` — core WYSIWYG editor, React-first
               - `@tiptap/starter-kit` — ekstensi dasar (bold, italic, heading, list, dll)
               - `tiptap-markdown` — konversi WYSIWYG ↔ Markdown (community, gratis)
             CATATAN IMPLEMENTASI:
               - `EditorTextarea.tsx` dan `EditorToolbar.tsx` tidak lagi digunakan oleh OpinionEditor.
               - Custom Node extension untuk `{{chart:id}}` placeholder — dirender sebagai chip/badge
                 di editor, dikembalikan ke string asli saat ekspor ke Markdown via renderText().
               - Output ke DB tetap Markdown — `OpinionContentRenderer.tsx` tidak perlu diubah.
               - `OpinionPreview.tsx` (live preview lama) tidak lagi digunakan — WYSIWYG menggantikannya.
             ALTERNATIF DITOLAK: Membangun WYSIWYG sendiri tanpa library (terlalu kompleks, banyak
                                 edge case pada sinkronisasi kursor); Milkdown (kurang mature,
                                 custom node lebih sulit).

[23-05-2026] KEPUTUSAN: Toolbar interaksi artikel — icon-only dengan bottom sheet
             ALASAN: Tampilan lama (teks + tombol besar) memakan ruang horizontal dan menyebabkan
                     elemen saling tumpuk di mobile. Like count publik dihapus dari UI untuk
                     menghindari social proof bias (data tetap dicatat di DB untuk analitik admin).
                     Bottom sheet konsisten dengan pola UI mobile-first (Instagram-style).
             CATATAN IMPLEMENTASI:
                     - LikeButton.tsx: hapus likeCount state dan teks, pertahankan logika insert/delete.
                     - CommentsSection.tsx: refactor ke icon (w-10 h-10 rounded-full) + bottom sheet.
                       Jumlah komentar sebagai badge di pojok kanan atas icon agar tidak mengganggu alignment.
                     - ShareButton.tsx: tombol teks→icon rounded, modal tengah→bottom sheet.
                     - CorrectionSection.tsx: header+form inline→icon AlertCircle + bottom sheet.
                       Warna icon biru (accent-blue) untuk membedakan dari interaksi lain (abu).
                     - ArticleInteractions.tsx: satu baris flex justify-between — koreksi rata kiri,
                       like+komentar+share rata kanan. Tidak ada teks, tidak ada layout bertingkat.
             KEAMANAN: Tidak ada perubahan RLS, tidak ada endpoint baru.
             ALTERNATIF DITOLAK: Layout dua baris (mobile kurang efisien);
                                 angka komentar di bawah icon (mendorong alignment vertikal).

[24-05-2026] KEPUTUSAN: getUser() wajib digunakan alih-alih getSession() di API routes server-side
             ALASAN: Dokumentasi Supabase secara eksplisit menyatakan "Never trust getSession() inside 
                     server code. It isn't guaranteed to revalidate the Auth token." getSession() hanya
                     membaca cookie tanpa memvalidasi ke server Supabase — token bisa expired atau dipalsukan.
                     getUser() memverifikasi token ke server Supabase, menjamin autentikasi valid.
             CATATAN IMPLEMENTASI:
                     - Ganti: const { data: { session } } = await supabase.auth.getSession()
                     - Menjadi: const { data: { user }, error: authError } = await supabase.auth.getUser()
                     - File yang diubah: app/api/comments/route.ts, app/api/shares/route.ts, 
                       app/api/analytics/route.ts
                     - Jika authError atau !user, return 401 Unauthorized
             ALTERNATIF DITOLAK: Tetap pakai getSession() (rentan terhadap token forgery)

[24-05-2026] KEPUTUSAN: Validasi parameter redirect di OAuth callback untuk mencegah open redirect
             ALASAN: Parameter 'next' dari query string bisa dimanipulasi penyerang untuk mengarahkan
                     pengguna ke situs berbahaya setelah login (contoh: //evil.com atau path traversal).
             CATATAN IMPLEMENTASI:
                     - const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/dashboard'
                     - File: app/auth/callback/route.ts
                     - Hanya izinkan path yang dimulai dengan / dan bukan protocol-relative URL (//)
             ALTERNATIF DITOLAK: Tidak ada validasi (rentan open redirect attack)

[24-05-2026] KEPUTUSAN: Middleware.ts untuk token refresh otomatis dan security headers
             ALASAN: Supabase Auth JWT kedaluwarsa. Tanpa middleware yang refresh token di setiap request,
                     pengguna bisa mengalami "logged out" tiba-tiba. Security headers (X-Frame-Options,
                     X-Content-Type-Options, Referrer-Policy) melindungi dari clickjacking dan MIME sniffing.
             CATATAN IMPLEMENTASI:
                     - File: middleware.ts di root project (bukan di app/)
                     - Menggunakan @supabase/ssr createServerClient dengan cookie handling
                     - await supabase.auth.getUser() di middleware akan refresh token jika perlu
                     - Headers ditambahkan ke semua response: X-Frame-Options: DENY, 
                       X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin
             ALTERNATIF DITOLAK: Tanpa middleware (session timeout tak terduga, tanpa security headers)

[24-05-2026] KEPUTUSAN: useMemo wajib untuk createClient() di Client Components
             ALASAN: createClient() di body komponen tanpa useMemo membuat instance baru setiap render.
                     Ini menyebabkan: (1) memory leak, (2) useEffect dependency berubah terus → re-run efek,
                     (3) potensi race condition pada fetch data.
             CATATAN IMPLEMENTASI:
                     - Ganti: const supabase = createClient()
                     - Menjadi: const supabase = useMemo(() => createClient(), [])
                     - File yang diubah: components/artikel/CommentsSection.tsx, 
                       components/artikel/ShareButton.tsx
                     - Pattern ini sudah diterapkan di LikeButton.tsx sejak Sesi #30
             ALTERNATIF DITOLAK: Biarkan tanpa useMemo (performance degradation, potential bugs)
[25-05-2026] KEPUTUSAN: Query user_profiles dilakukan terpisah — bukan via PostgREST join inline
             ALASAN: Tabel user_profiles menggunakan primary key kolom user_id (bukan id).
                     PostgREST join via .select('user_profiles(kolom)') tanpa FK eksplisit
                     terdaftar di Supabase gagal silent — query tidak error tapi return null/kosong.
                     Akibatnya seluruh halaman opinions tampak kosong meski data ada di DB.
             CATATAN IMPLEMENTASI:
               Pola yang benar untuk semua halaman yang butuh data profil penulis:
               1. Fetch opinion_articles dulu, ambil author_id
               2. Fetch user_profiles terpisah: .from('user_profiles').select('user_id, ...').in('user_id', authorIds)
               3. Build profileMap: Record<string, Profile> dengan key = user_id
               4. Map articles → gabung dengan profileMap[a.author_id]
               File yang menggunakan pola ini: app/opinions/page.tsx, app/page.tsx, app/sitemap.ts
             ALTERNATIF DITOLAK: PostgREST join inline (gagal silent), menambah FK di DB (perlu migrasi, risiko)

[25-05-2026] KEPUTUSAN: TipTap table extensions untuk tabel GFM di editor
             ALASAN: tiptap-markdown (community library) tidak mendukung parsing tabel GFM secara native.
                     Tanpa @tiptap/extension-table*, karakter pipa | muncul mentah di editor WYSIWYG.
                     Install 4 package table extensions memungkinkan TipTap merender tabel sebagai grid.
                     Output ke DB tetap Markdown string via insertMarkdown() → onChange(combined).
             PACKAGE YANG DITAMBAHKAN:
                     - @tiptap/extension-table@3.23.6 — Table.configure({ resizable: false })
                     - @tiptap/extension-table-row@3.23.6
                     - @tiptap/extension-table-header@3.23.6
                     - @tiptap/extension-table-cell@3.23.6
             BUNDLE IMPACT: +15 kB di /akun/tulis dan /akun/artikel/[id]/edit (349 kB, sebelumnya 334 kB)
             CATATAN: resizable: false — resize handle memerlukan CSS tambahan, tidak diperlukan.
                      CSS tabel via Tailwind arbitrary selector di editorProps.attributes.class.
             ALTERNATIF DITOLAK: html: true + pre-processing Markdown → mengubah kebijakan keamanan
                                 html: false di Markdown.configure(), memerlukan audit HTML ke DB.

[25-05-2026] KEPUTUSAN: Chart chip label — renderHTML() menampilkan '📊 {chartId}'
             ALASAN: Chip kosong tidak informatif jika ada lebih dari satu chart di artikel.
                     renderText() yang menghasilkan {{chart:chartId}} tidak disentuh — output ke DB benar.
             CATATAN: Hanya renderHTML() yang diubah. renderText() tetap utuh.
             ALTERNATIF DITOLAK: CSS ::before (tidak bisa inject nilai dinamis dari node.attrs).

[25-05-2026] KEPUTUSAN: Placeholder isEmpty berbasis childCount, bukan getText()
             ALASAN: editor.getText() mengembalikan '' meski editor berisi chart placeholder node
                     (node bertipe atom, tidak punya textContent). Akibatnya placeholder muncul
                     tumpang tindih di atas chip chart.
                     Kondisi benar: isEmpty = doc.textContent === '' && doc.childCount <= 1.
             CATATAN: Diimplementasikan sebagai IIFE inline di JSX agar tidak menambah state baru.
             ALTERNATIF DITOLAK: editor.isEmpty dari TipTap (tidak memperhitungkan atom nodes).

[31-05-2026] KEPUTUSAN: Anulir Dokumen Eksternal AI (design.md, tasks.md, HANDOVER_CONTEXT.md, V2_HANDOVER_COMPREHENSIVE.md)
           ALASAN: File-file tersebut dihasilkan dari auto-update AI tanpa validasi logis. Instruksi di dalamnya terbukti mendegradasi codebase (memunculkan benturan CSS vs Tailwind).
           ATURAN: Hanya README.md (CONTEXT.md) ini yang menjadi sumber kebenaran teknis tunggal. Abaikan semua file berlabel "HANDOVER".

[[Isi Tanggal Hari Ini]] KEPUTUSAN: Arsitektur Theming Berbasis CSS Variables (Bukan Tailwind Static Hex)
           ALASAN: Tailwind yang dikonfigurasi dengan Hex statis akan mematikan utilitas CSS `prefers-color-scheme`. Untuk mempertahankan perpindahan tema yang dinamis dan native (OS level), Tailwind hanya boleh bertindak sebagai "pipa" yang menyalurkan `var(--color-...)`. Logika inversi warna diisolasi sepenuhnya di dalam `app/globals.css`.

[[Isi Tanggal Hari Ini]] KEPUTUSAN: Penggunaan Marcellus Sebagai Font Display Utama & Pembatalan Canela
           ALASAN: Rencana penggunaan font berbayar Canela dibatalkan. Marcellus ditetapkan sebagai font display default (Wordmark & Headline) via Google Fonts. Strategi fallback Playfair Display dihapus karena sistem kini sepenuhnya mengandalkan Google Fonts untuk keempat layer tipografi.
           SUPERSEDED: [01-06-2026] Sesi #46 — Marcellus diganti Libre Baskerville. Lihat keputusan di bawah.

[01-06-2026] KEPUTUSAN: Dark Mode Hibrida — default OS + toggle manual (localStorage)
           ALASAN: Pembaca butuh kontrol eksplisit atas tema, bukan sekadar mengikuti OS. Script anti-FOUC di <head> men-set `data-theme` (prioritas localStorage > prefers-color-scheme) sebelum render; ThemeToggle (Sun/Moon di Navbar) menimpa & menyimpan pilihan ke localStorage('saintifiks-theme').
           CATATAN IMPLEMENTASI: globals.css punya 3 skenario — @media(prefers-color-scheme:dark) :root:not([data-theme="light"]); :root[data-theme="dark"]; :root[data-theme="light"]. Komponen baru components/layout/ThemeToggle.tsx (Client, hydration-safe, aria-label ID).
           MEMBATALKAN: keputusan lama "dark mode OS-level TANPA toggle" (Sesi #43) dan "[22-05-2026] color-scheme: only light".

[01-06-2026] KEPUTUSAN: Tailwind darkMode 'media' → ['selector','[data-theme="dark"]']
           ALASAN: Utility `dark:` (dipakai di Navbar) harus mengikuti toggle manual, bukan hanya OS. Default OS tetap benar karena anti-FOUC selalu men-set data-theme.
           ALTERNATIF DITOLAK: darkMode 'class' (kurang eksplisit); tetap 'media' (mengabaikan toggle).

[01-06-2026] KEPUTUSAN: Libre Baskerville menggantikan Marcellus sebagai font display
           ALASAN: Sesuai Master Brief Sesi #46. Libre Baskerville (Google Fonts, weight 400/700 + italic, var --font-display). Marcellus dihapus total dari kode. fontFamily.libre juga dipetakan ke var(--font-display) agar heading ber-class `font-libre` (sebelumnya tak terdefinisi) konsisten.
           CATATAN: Libre Baskerville tidak punya weight 600 — penggunaan 600 efektif menjadi 700.

[01-06-2026] KEPUTUSAN: Reading width 65ch + leading dua-lapis (mobile 18px/1.7, desktop 19px/1.65)
           ALASAN: Mobile-first namun desktop optimal. Lebar baris ~65 huruf (Bringhurst 1992) hanya mengikat di layar lebar; ponsel pakai lebar penuh. Menggantikan 680px/1.75.
           CATATAN: Diterapkan via globals.css ke .article-body (editorial) & .article-content (opini) — TIDAK menyentuh Red Zone. Plus token formal CSS, skip-link, focus-visible outline, reduced motion, print stylesheet.

[02-06-2026] KEPUTUSAN: Header global menggantikan Navbar
           ALASAN: Spesifikasi Sesi #47 — kepala situs tunggal (matahari/bulan kiri, wordmark tengah, ikon menu kanan) berlaku di semua halaman, membuka Drawer. components/layout/Navbar.tsx dihapus, components/layout/Header.tsx menjadi satu-satunya header di app/layout.tsx.
           CATATAN: ThemeToggle tetap dipakai di dalam Header. onAuthStateChange (logout) dipindah ke Drawer.

[02-06-2026] KEPUTUSAN: Beranda menjadi feed editorial tunggal — tab Opinions dihapus
           ALASAN: Redesain beranda Sesi #47 hanya menampilkan article-card editorial + search bar + divider. Opini (Argumen) diakses lewat Drawer → /opinions, bukan tab beranda.
           ALTERNATIF DITOLAK: Mempertahankan tab [Saintifiks | Opinions] (Sesi #34) — tidak sesuai desain baru. components/layout/HomepageTabs.tsx dihapus.

[02-06-2026] KEPUTUSAN: Relevansi konten per-lokasi via Context klien + localStorage
           ALASAN: Drawer memilih lokasi (posisi terkini auto / Global / negara A–Z); beranda memfilter artikel berdasarkan kolom articles.country. State dibagi via LocationProvider (React Context) + localStorage('saintifiks-location'). Deteksi negara murni klien (timezone) tanpa pelacak pihak ketiga (selaras misi privasi).
           CATATAN IMPLEMENTASI: Migration menambah kolom nullable category, kicker, country ke articles (aman, data lama utuh). 'Global' → tampilkan semua; selain itu country === selected ATAU country kosong.

[02-06-2026] KEPUTUSAN: Halaman pra-login (gerbang masuk) untuk /akun logged-out
           ALASAN: /akun yang belum login dulunya redirect paksa ke OAuth. Kini menampilkan PreLogin (tombol "Masuk dengan Google") agar pengguna sadar konteks. /login memakai komponen sama (default next=/dashboard). Alur OAuth & validasi redirect tidak berubah.
```

---

## 12. LOG SESI
Branch: Berbagai feature branches (dari feature/phase-0-foundation hingga feature/custom-favicon) ter-merge ke main
Tujuan sesi: Menyelesaikan fondasi infrastruktur (Phase 0), sistem artikel & CMS (Phase 1-2), interaksi & analitik pembaca (Phase 3), optimasi SEO & keamanan (Phase 4), serta penyempurnaan fitur beranda & mesin render pasca-rilis.
Yang dikerjakan:

  [INFRASTRUKTUR, DATABASE & AUTENTIKASI]
  - Setup Next.js 14 (App Router), Supabase, Vercel, Tailwind CSS v3, GitHub Repo.
  - Implementasi cron job (Vercel) ke endpoint /api/keep-alive untuk mencegah hibernasi Supabase.
  - Skema database direalisasikan: articles, article_charts, likes, analytics_events. RLS policy diaktifkan penuh pada semua tabel.
  - Google OAuth terintegrasi via Supabase untuk admin (akses dashboard) dan pembaca (akses like). Parameter prompt: 'select_account' ditambahkan untuk transparansi UX.

  [SISTEM MANAJEMEN KONTEN (CMS) & ADMIN]
  - Pembuatan area admin terproteksi layout auth guard.
  - Implementasi form tulis/edit artikel dengan live preview Markdown dan sistem idempotent update untuk relasi chart.
  - Upload gambar dipusatkan di Supabase Storage bucket 'artikel-gambar'.

  [MESIN RENDER ARTIKEL & MARKDOWN]
  - Migrasi ArticleRenderer menjadi Server Component secara utuh untuk optimalisasi First Contentful Paint (FCP).
  - Integrasi pustaka parsing level lanjut: react-markdown, remark-gfm, remark-math, rehype-katex, rehype-highlight, dan rehype-raw.
  - Implementasi arsitektur Single-Pass Render menggunakan substitusi Regex untuk elemen {{chart:id}}, menyelesaikan masalah anomali pemutusan footnote yang sebelumnya terjadi akibat metode .split().
  - Pembuatan custom remark plugin (lib/remark/remarkCallout.ts) untuk memproses AST callout box ([!NOTE], dll) tanpa dependensi tambahan.
  - Integrasi parser json5 pada ChartBlock dengan Regex strip untuk menoleransi cacat sintaks dari output AI saat men-generate JSON chart, dengan penahan XSS native.

  [FITUR PUBLIK, UI/UX & WIDGET INDEKS]
  - Implementasi halaman beranda, artikel individual, mekanisme koreksi publik, dan navigasi klien (Client Component Navbar untuk deteksi sesi).
  - Implementasi Widget Indeks Beranda berbentuk ticker strip tipis. Skema data hibrida: SSR di awal + client polling setiap 15 detik ke /api/indices (cache server 12 detik). Indikator tren warna ditambahkan (accent-green dan accent-red).
  - Render elemen gambar adopsi rute hibrida: <Image> Next.js khusus domain Supabase, fallback <img> standar untuk sumber eksternal.
  - Optimalisasi SEO statis/dinamis (Open Graph, Twitter Card) dan penggantian favicon standar menjadi icon.svg kustom.

  [ANALITIK & INTERAKSI]
  - Sistem likes menggunakan Optimistic Update di sisi klien tanpa mengekspos agregasi angka secara publik (pembatasan social proof bias).
  - Pelacakan analitik mandiri (W3C Beacon API) via AnalyticsTracker.tsx untuk metrik page_view dan scroll_depth ke database internal murni.

Keputusan baru: Seluruh keputusan arsitektur minor maupun mayor yang dieksekusi sepanjang 26 sesi telah disahkan dan terangkum secara permanen di Seksi 11.
Status akhir: Selesai (Phase 0–4 dan Post-Launch tuntas).
Next step: [LIHAT SESI #27] Pemindahan widget IndexStrip ke atas Navbar.
---

[21-05-2026] SESI #27
Branch: feature/widget-strip-above-navbar
Tujuan sesi: Memindahkan widget IndexStrip ke posisi di atas Navbar (hanya di halaman beranda) dan memastikan halaman selalu dibuka dari posisi scroll paling atas.
Yang dikerjakan:
  - Dibuat components/layout/ConditionalIndexStrip.tsx — Client Component baru yang menggunakan usePathname() untuk merender IndexStrip hanya jika pathname === '/'. Server Component IndexStrip dioper sebagai prop untuk menghindari kontaminasi Server→Client.
  - Dibuat components/layout/ScrollToTop.tsx — Client Component ringan yang memaksa window.scrollTo(0,0) setiap kali pathname berubah.
  - Diubah app/layout.tsx — ditambahkan import dan pemasangan <ScrollToTop /> dan <ConditionalIndexStrip strip={<IndexStrip />} /> sebelum <Navbar />.
  - Diubah app/page.tsx — dihapus import IndexStrip dan penggunaan <IndexStrip /> karena sudah dipindah ke layout.tsx.
Keputusan baru: Lihat Seksi 11 — dua keputusan baru: "IndexStrip dipindah ke atas Navbar" dan "ScrollToTop".
Status akhir: Selesai. Di-push ke feature/widget-strip-above-navbar, siap di-review via Vercel Preview sebelum merge ke main.
Next step: Verifikasi di Vercel Preview URL → merge ke main.
---

[22-05-2026] SESI #28
Branch: feature/social-interaction-icons
Tujuan sesi: Implementasi fitur social interaction (like, share, comments) dengan icon yang lebih menarik dan kemampuan generate gambar Instagram Story.
Yang dikerjakan:
  [DATABASE & API]
  - Migration tabel comments dan shares dengan RLS policy lengkap di Supabase.
  - Dibuat API routes: /api/likes/count, /api/comments, /api/shares.

  [KOMPONEN UI BARU]
  - ShareButton.tsx — Client Component dengan icon Share2, bottom sheet pilihan platform (Instagram Story, Twitter, Facebook, WhatsApp, Copy Link), dan generate gambar Instagram Story 1080x1920 menggunakan html-to-image.
  - CommentsSection.tsx — Client Component dengan tampilan komentar publik (privacy: nama "Pembaca") dan form input komentar.
  - ArticleInteractions.tsx — Client Component wrapper yang mengisolasi seluruh section interaksi.

  [UPDATE KOMPONEN EXISTING]
  - LikeButton.tsx — Ditambah icon Heart dari lucide-react dan tampilan jumlah like publik.
  - CorrectionSection.tsx — Ditambah icon AlertCircle dan tampilan jumlah koreksi.
  - app/artikel/[slug]/page.tsx — Integrasi ArticleInteractions dengan ISR revalidate = 3600.

  [DEPENDENCIES]
  - Install lucide-react — Icon library untuk konsistensi visual.
  - Install html-to-image — Generate gambar dari HTML untuk Instagram Story.

  [PEMECAHAN MASALAH KRUSIAL]
  - Debug error 406 karena .single() digunakan saat user belum like → diubah ke .maybeSingle().
  - Debug error "No API key" — perlu merge ke main agar env vars ter-load di production.
  - Implementasi error boundary di Client Components agar satu error tidak menghancurkan seluruh UI.

Keputusan baru: Lihat Seksi 11 — tujuh keputusan baru terkait social interaction dan error handling.
Status akhir: Selesai. Di-merge ke main dan live di production.
Next step: Monitoring quota Supabase; pertimbangkan fitur reply komentar di masa depan.
---

[22-05-2026] SESI #29
Branch: feature/share-instagram-story-improvements
Tujuan sesi: Memperbaiki bug tampilan situs di Samsung Internet saat mode malam aktif — logo berubah abu-abu dan avatar profil warnanya terbalik.
Yang dikerjakan:
  - Diubah app/globals.css — ditambahkan color-scheme: only light di :root.
  - Diubah app/layout.tsx — ditambahkan colorScheme: "only light" di objek metadata Next.js.
  - Diubah app/page.tsx — elemen <img> logo diganti dengan <picture> + <source media="(prefers-color-scheme: dark)"> sebagai fallback eksplisit.
  - Diverifikasi components/layout/Navbar.tsx — avatar sudah konsisten menggunakan bg-primary-dark text-primary-light tanpa kelas dark:.
Keputusan baru: Lihat Seksi 11 — satu keputusan baru: "color-scheme: only light — situs tidak mendukung dark mode".
Status akhir: Selesai. Di-push ke feature/share-instagram-story-improvements.
Next step: Test di Samsung Internet dengan mode malam aktif untuk verifikasi fix.
---

[22-05-2026] SESI #30
Branch: feature/share-instagram-story-improvements
Tujuan sesi: Memperbaiki bug sistem likes — jumlah like tidak sinkron antar user.
Yang dikerjakan:
  - Diubah components/artikel/LikeButton.tsx — ganti createClient() di body komponen menjadi useMemo(() => createClient(), []), hapus supabase dari dependency array useEffect, tambah setLikeCount(previousCount) di blok error handling, tambah cache: 'no-store' di semua fetch ke /api/likes/count.
  - Diubah app/api/likes/count/route.ts — tambah export const dynamic = 'force-dynamic' dan header Cache-Control: no-store.
Keputusan baru: Lihat Seksi 11 — satu keputusan baru: "Fix likes count — useMemo + cache no-store + rollback count".
Status akhir: Selesai — namun masalah tetap terjadi saat test multiuser. Investigasi lanjutan di sesi #31.
Next step: Investigasi RLS policy tabel likes di Supabase.
---

[22-05-2026] SESI #31
Branch: feature/share-instagram-story-improvements
Tujuan sesi: Investigasi dan fix root cause likes count tidak sinkron antar user setelah sesi #30.
Yang dikerjakan:
  - Root cause ditemukan: /api/likes/count menggunakan anon key → Supabase eksekusi query sebagai anonymous → RLS memblokir SELECT rows milik user lain → count selalu 0.
  - Dibuat lib/supabase/admin.ts — service role client menggunakan SUPABASE_SERVICE_ROLE_KEY. Hanya untuk server-side.
  - Dibuat app/api/likes/route.ts — API route baru: GET (cek status like), POST (insert like), DELETE (hapus like). Semua via admin client, auth diverifikasi via cookie session sebelum tulis.
  - Diubah app/api/likes/count/route.ts — ganti anon client dengan admin client agar count membaca semua rows.
  - Diubah components/artikel/LikeButton.tsx — refactor total: semua operasi likes melalui /api/likes, bukan langsung ke Supabase client.
Keputusan baru: Lihat Seksi 11 — satu keputusan baru: "Semua operasi likes via API server-side (admin client)".
Status akhir: Selesai. Di-push ke feature/share-instagram-story-improvements.
Next step: Tambahkan SUPABASE_SERVICE_ROLE_KEY ke .env.local dan Vercel. Test manual multiuser. Merge ke main setelah verified.
---

[23-05-2026] SESI #32
Branch: feature/interaction-ui-redesign
Tujuan sesi: Redesign toolbar interaksi artikel — hapus tampilan like count dari UI, ubah semua tombol interaksi menjadi icon-only, implementasi bottom sheet.
Yang dikerjakan:
  - Diubah components/artikel/LikeButton.tsx — hapus state likeCount, fetch /api/likes/count, dan render teks "X suka". Logika insert/delete like ke DB tetap berjalan.
  - Diubah components/artikel/CommentsSection.tsx — refactor dari tampilan inline penuh menjadi icon-only trigger + bottom sheet. Badge jumlah komentar absolute di pojok atas icon.
  - Diubah components/artikel/ShareButton.tsx — tombol teks → icon Share2 rounded (w-10 h-10). Modal tengah → bottom sheet.
  - Diubah components/artikel/CorrectionSection.tsx — hapus header teks dan form inline. Ganti dengan icon AlertCircle berwarna accent-blue + bottom sheet.
  - Diubah components/artikel/ArticleInteractions.tsx — layout baru: satu baris flex justify-between — koreksi rata kiri, like+komentar+share rata kanan.
Keputusan baru: Lihat Seksi 11 — satu keputusan baru: "Toolbar interaksi artikel — icon-only dengan bottom sheet".
Status akhir: Selesai. Di-push ke feature/interaction-ui-redesign, siap di-review via Vercel Preview.
Next step: Review visual di Vercel Preview URL → merge ke main jika approved.
---

[23-05-2026] SESI #33
Branch: feature/opinions-platform
Tujuan sesi: Implementasi Opinions Platform — platform opini pengguna terpisah dari sistem editorial redaksi Saintifiks.
Yang dikerjakan:
  [DATABASE & STORAGE]
  - 6 tabel baru di Supabase: user_profiles, opinion_articles, opinion_article_charts, article_reports, opinion_likes, opinion_analytics_events. RLS policy aktif di semua tabel.
  - Storage bucket baru: opinions-gambar (public read, auth write, max 5MB).
  - Environment variable baru: ADMIN_EMAIL=saintifiks@gmail.com.

  [API ROUTES — 14 endpoint baru]
  - /api/user-profiles — GET/POST/PATCH profil penulis.
  - /api/user-profiles/[username] — GET profil publik + daftar artikel.
  - /api/opinions — GET semua artikel milik user, POST buat draft baru.
  - /api/opinions/[id] — GET detail artikel, PATCH update, DELETE (hanya draft).
  - /api/opinions/[id]/publish — POST publish, DELETE tarik ke draft.
  - /api/opinions/[id]/like — GET status like, POST tambah like, DELETE unlike.
  - /api/opinions/[id]/report — POST laporkan artikel.
  - /api/opinion-charts/[id] — PATCH update, DELETE hapus chart config.
  - /api/admin/opinions — GET semua artikel untuk moderasi admin.
  - /api/admin/opinions/[id]/hide — POST hide artikel, DELETE restore.
  - /api/admin/opinions/reports — GET semua laporan, PATCH mark reviewed.
  - /api/opinions/analytics/event — POST kirim analytics event dari client.
  - /api/opinions/analytics/summary — GET tren views 7 hari + statistik per artikel.

  [KOMPONEN — 18 file baru di components/opinions/]
  - Read-only: OpinionLabel, AuthorByline, OpinionCard, OpinionLikeButton, ReportButton.
  - Render konten: OpinionContentRenderer (Server Component, salinan logika ArticleRenderer).
  - Analitik: OpinionAnalyticsTracker (Client Component, tracking page_view + scroll depth).
  - Dashboard: OpinionAnalyticsDashboard, AkunClient, OpinionsModeratorClient.
  - Editor: UsernameSetup, EditorToolbar, EditorTextarea, TableWizard, ImageModal, ChartWizard, OpinionPreview, OpinionEditorPage, OpinionEditor.

  [HALAMAN — 7 halaman baru]
  - /opinions — daftar artikel opini publik (ISR 5 menit).
  - /opinions/[username]/[slug] — halaman artikel opini individual.
  - /penulis/[username] — halaman profil publik penulis.
  - /akun — dashboard penulis (daftar artikel + analitik).
  - /akun/tulis — editor tulis artikel baru.
  - /akun/artikel/[id]/edit — editor edit artikel existing.
  - /dashboard/opinions — halaman moderasi admin.

  [MODIFIKASI FILE EXISTING]
  - components/layout/Navbar.tsx — tambah link "Opinions" + link avatar ke /akun.
  - app/(admin)/dashboard/page.tsx — tambah tombol "Moderasi Opinions".

Keputusan baru: Lihat Seksi 11 — satu keputusan baru: "Opinions Platform — platform opini pengguna terpisah dari sistem editorial".
Status akhir: Selesai (80%). Build clean (exit code 0, 44 file baru). Di-push ke feature/opinions-platform dan di-merge ke main oleh pemilik.
Next step: Test end-to-end flow (registrasi username → tulis → publish → like → laporan → moderasi).
---

[24-05-2026] SESI #34
Branch: feature/homepage-opinions-tab
Tujuan sesi: Implementasi homepage tab [Saintifiks | Opinions] — menempatkan konten opinions setara dengan konten redaksi di halaman beranda.
Yang dikerjakan:
  - Dibuat components/layout/HomepageTabs.tsx — Client Component baru untuk tab navigasi homepage. Tab sticky top-[93px], background solid primary-light, underline indicator untuk tab aktif.
  - Diubah app/page.tsx — ditambah fetch paralel Promise.all untuk editorial + opinions, mapping OpinionItem, revalidate 3600→300.
Keputusan baru: Lihat Seksi 11 — dua keputusan baru: "Homepage tab [Saintifiks | Opinions]" dan "Exception library baru — TipTap WYSIWYG".
Status akhir: Selesai. Build clean (exit code 0). Di-push ke feature/homepage-opinions-tab, di-merge ke main oleh pemilik.
Next step: Implementasi TipTap WYSIWYG — ganti EditorTextarea + EditorToolbar dengan TipTap + tiptap-markdown + custom node {{chart:id}}.
---

[24-05-2026] SESI #35
Branch: feature/tiptap-wysiwyg-editor
Tujuan sesi: Implementasi TipTap WYSIWYG editor — menggantikan split panel (textarea + live preview) dengan editor WYSIWYG.
Yang dikerjakan:
  [FILE BARU]
  - components/opinions/editor/TipTapEditor.tsx — komponen TipTap utama. StarterKit (bold, italic, heading H2/H3, blockquote, list, HR, code, codeBlock), Markdown extension (tiptap-markdown), Custom Node ChartPlaceholder untuk {{chart:id}} dirender sebagai chip di editor. Toolbar terintegrasi, sticky, dengan active state mengikuti posisi kursor.

  [FILE DIMODIFIKASI]
  - components/opinions/editor/OpinionEditor.tsx — cabut EditorTextarea + EditorToolbar + OpinionPreview, pasang TipTapEditor. Hapus textareaRef, activeTab state, tab switch mobile, panel kanan preview.
  - components/opinions/editor/ChartWizard.tsx — onInsert signature: dari (placeholder, chartId, config) ke (chartId, config). Insert placeholder ke TipTap via window event 'tiptap:insert-chart'.

  [PACKAGE BARU]
  - @tiptap/react, @tiptap/starter-kit, tiptap-markdown (65 packages total, ~53KB bundle naik dari ~120KB).

Keputusan baru: Tidak ada — sudah tercatat di Seksi 11 sesi #34.
Status akhir: Selesai. Build clean (exit code 0). Di-push ke feature/tiptap-wysiwyg-editor. Siap di-review sebelum merge.
Next step: Test manual editor di /akun/tulis — coba bold, heading, insert chart, save draft, publish. Jika ada temuan UX, perbaiki sebelum merge ke main.
---

[24-05-2026] SESI #36 — SECURITY AUDIT FIXES
Branch: feature/security-audit-fixes
Tujuan sesi: Menyelesaikan temuan audit keamanan kritis (C-01, C-02, H-01, H-03, H-04, H-05, S-04, S-05, M-02).
Yang dikerjakan:
  [CRITICAL SECURITY FIXES]
  - app/api/comments/route.ts — Ganti getSession() dengan getUser() untuk verifikasi auth yang aman (C-01, T-02).
  - app/api/shares/route.ts — Ganti getSession() dengan getUser() (C-01, T-02).
  - app/api/analytics/route.ts — Ganti getSession() dengan getUser() (C-01, T-02).
  - app/auth/callback/route.ts — Tambah validasi parameter next untuk mencegah open redirect attack (C-02). Hanya izinkan path yang dimulai / dan bukan // (protocol-relative URL).
  - app/api/likes/count/route.ts — Hapus console.log yang mencetak prefix SUPABASE_SERVICE_ROLE_KEY (H-04, S-05).

  [PERFORMANCE FIXES]
  - components/artikel/CommentsSection.tsx — Tambah useMemo(() => createClient(), []) untuk mencegah instance Supabase baru setiap render (H-05, S-04).
  - components/artikel/ShareButton.tsx — Tambah useMemo untuk createClient() (H-05).

  [MIDDLEWARE & ERROR HANDLING]
  - middleware.ts (baru, root level) — Implementasi token refresh otomatis dan security headers (H-01, H-03). Headers: X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin.
  - app/not-found.tsx (baru) — Custom 404 page dengan branding Saintifiks (M-02, S-02).
  - app/error.tsx (baru) — Global error boundary dengan tombol "Coba Lagi" dan "Kembali ke Beranda" (M-02, S-02).

Keputusan baru: Lihat Seksi 11 — empat keputusan baru: "getUser() wajib digunakan alih-alih getSession()", "Validasi parameter redirect di OAuth callback", "Middleware.ts untuk token refresh dan security headers", "useMemo wajib untuk createClient() di Client Components".
Status akhir: Selesai. Di-merge ke main. Test di production: like ✓, komentar ✓, 404 custom ✓.
Next step: Lanjutkan sisa temuan audit (rate limiting H-02/T-01, sitemap M-01/S-01, dead code cleanup) di sesi berikutnya.
---

[24-05-2026] SESI #37 — RATE LIMITING IMPLEMENTATION
Branch: feature/rate-limiting
Tujuan sesi: Implementasi rate limiting di API routes untuk mencegah abuse dan proteksi quota (T-01, H-02).
Yang dikerjakan:
  - Dibuat lib/rate-limit.ts — Helper rate limiting in-memory. checkRateLimit() cek dan increment counter per IP, getClientIP() ekstrak IP dari x-forwarded-for, RATE_LIMITS konfigurasi: comments (5/min), likes (20/min), shares (5/min), analytics (30/min).
  - app/api/comments/route.ts — Tambah rate limiting di POST handler (5/menit per IP). Return 429 jika limit terlampaui.
  - app/api/likes/route.ts — Tambah rate limiting di POST dan DELETE (20/menit per IP, shared). Hapus console.log debug.
  - app/api/shares/route.ts — Tambah rate limiting di POST (5/menit per IP). Fix auth: getSession() → getUser().
  - app/api/analytics/route.ts — Tambah rate limiting di POST (30/menit per IP). Jika rate limit terlampaui, return 200 (tidak ganggu UX) tapi skip insert.
Keputusan baru: Tidak ada keputusan arsitektur baru.
Status akhir: Selesai. Build clean (exit code 0). Di-push dan di-merge ke main.
Next step: Lanjut ke sisa technical debt — sitemap, robots.txt, slug refactor, dead code.
---

[24-05-2026] SESI #38 — COMPLETE AUDIT CLEANUP
Branch: feature/complete-audit-cleanup
Tujuan sesi: Menyelesaikan sisa technical debt: sitemap, robots.txt, slug refactor, dead code, navbar fix.
Yang dikerjakan:
  [SEO & CRAWLING]
  - app/sitemap.ts — Dynamic sitemap dengan ISR 24 jam. Static pages: /, /login, /akun. Dynamic: /artikel/[slug] dari tabel articles.
  - app/robots.ts — Disallow: /(admin)/, /api/, /login, /akun/tulis. Sitemap reference ke /sitemap.xml.

  [REFACTORING — DRY PRINCIPLE]
  - lib/slug.ts — Centralized slug generation: generateSlug() dan buatSlug (alias backward compat).
  - app/(admin)/dashboard/artikel/baru/page.tsx — Hapus fungsi buatSlug lokal, import dari lib/slug.ts.
  - app/(admin)/dashboard/artikel/[id]/edit/page.tsx — Hapus fungsi buatSlug lokal, import dari lib/slug.ts.

  [NEXT.JS BEST PRACTICE]
  - components/layout/Navbar.tsx — Ganti <a href="/"> dengan <Link href="/">.

  [DEAD CODE CLEANUP]
  - EditorTextarea.tsx, EditorToolbar.tsx, OpinionPreview.tsx — File tidak ditemukan (sudah dibersihkan di sesi sebelumnya).

Keputusan baru: Tidak ada keputusan arsitektur baru.
Status akhir: Selesai. Build clean (exit code 0). Di-push dan di-merge ke main.
Next step: Lanjut ke XSS protection rehype-sanitize.
---

[25-05-2026] SESI #39 — XSS PROTECTION (REHYPE-SANITIZE)
Branch: feature/rehype-sanitize
Tujuan sesi: Menambahkan proteksi XSS untuk konten user-generated di fitur Opinions (M-04, S-03).
Yang dikerjakan:
  - Install rehype-sanitize.
  - Diubah components/opinions/OpinionContentRenderer.tsx — tambah rehypeSanitize ke pipeline rehypePlugins (setelah rehypeRaw, sebelum rehypeKatex). Pipeline: rehypeRaw → rehypeSanitize → rehypeKatex → rehypeHighlight.
  - Proteksi: hapus tag berbahaya (<script>, <iframe>, <object>, dll), hapus atribut event (onclick, onerror, dll).
Keputusan baru: Tidak ada keputusan arsitektur baru.
Status akhir: Selesai. Build clean. Di-merge ke main.
Next step: Lanjut ke comprehensive security & tech debt audit (Sesi #40).
---

[25-05-2026] SESI #40 — COMPREHENSIVE SECURITY & TECH DEBT AUDIT
Branch: feature/audit-fixes
Tujuan sesi: Menyelesaikan semua temuan dari laporan audit komprehensif Saintifiks.
Yang dikerjakan:
  [KEAMANAN — KRITIS]
  - app/api/opinions/analytics/event/route.ts — Tambah rate limiting (30/min per IP). Return 200 jika rate limit terlampaui — konsisten dengan /api/analytics.
  - components/artikel/ArticleRenderer.tsx — Tambah rehype-sanitize dengan custom schema. Import rehypeSanitize, defaultSchema. Custom sanitizeSchema: izinkan className, id, dataCalloutType pada div/blockquote. Pipeline: rehypeRaw → [rehypeSanitize, sanitizeSchema] → rehypeKatex → rehypeHighlight.
  - app/api/keep-alive/route.ts — Fix CRON_SECRET guard: jika tidak di-set → return 500, bukan bypass.

  [KEAMANAN — SEDANG]
  - components/layout/Navbar.tsx — createClient() dibungkus useMemo. getSession() diganti onAuthStateChange() dengan cleanup di return function useEffect.
  - app/api/user-profiles/route.ts — Validasi avatar_url: wajib dimulai https://. Tolak javascript: URI dan data: URI.

  [TECH DEBT — SEDANG]
  - app/api/opinions/route.ts — Hapus local generateSlug(), import dari lib/slug.ts.
  - app/api/opinions/[id]/route.ts — Hapus local generateSlug(), import dari lib/slug.ts.
  - app/layout.tsx — Hapus import KaTeX dan highlight.js CSS (dipindah ke sub-layout).
  - app/artikel/layout.tsx (baru) — Layout khusus halaman artikel, muat KaTeX + highlight.js CSS.
  - app/opinions/layout.tsx (baru) — Layout khusus halaman opinions, muat KaTeX + highlight.js CSS.
  - app/sitemap.ts — Tambah fetch opinion_articles published. URL opinions: /opinions/[username]/[slug], priority 0.7.
  - app/robots.ts — Tambah /akun/artikel/ ke disallow list.

  [TECH DEBT — RENDAH]
  - lib/supabase/client.ts — Hapus blok console.error debug (env var check).
  - components/opinions/editor/TipTapEditor.tsx — Tambah focus-visible:ring-2 ke btnClass untuk keyboard accessibility.

Keputusan baru: Lihat Seksi 11 — lima keputusan baru dicatat: rate limiting opinions analytics, rehype-sanitize di ArticleRenderer, KaTeX/highlight.js CSS di sub-layout, onAuthStateChange di Navbar, CRON_SECRET guard eksplisit.
Status akhir: Selesai. Build clean. Semua 12 item audit diselesaikan. Di-push dan di-merge ke main.
Next step: Verifikasi CRON_SECRET di Vercel dashboard Environment Variables.
---

[25-05-2026] SESI #41 — FIX OPINIONS PAGE VISIBILITY
Branch: feature/editor-fixes
Tujuan sesi: Memperbaiki halaman /opinions dan / yang tidak menampilkan artikel published sama sekali.
Yang dikerjakan:
  [INVESTIGASI]
  - Konfirmasi data ada di DB via SQL query langsung (7 artikel published ditemukan).
  - Identifikasi root cause: PostgREST join user_profiles dalam .select() gagal silent karena PK tabel user_profiles adalah user_id, bukan id. Supabase tidak bisa resolve join tanpa FK eksplisit terdaftar.

  [FIX — app/opinions/page.tsx]
  - Ganti export const revalidate = 300 dengan export const dynamic = 'force-dynamic'.
  - Hapus join user_profiles dan opinion_likes dari .select() inline.
  - Implementasi query 2 tahap: fetch opinion_articles dulu → fetch user_profiles terpisah via .in('user_id', authorIds) → build profileMap.
  - like_count di-hardcode 0 sementara (teks "X suka" tidak muncul karena kondisi > 0).

  [FIX — app/page.tsx]
  - Hapus join user_profiles dan opinion_likes dari query opinions.
  - Implementasi pola query 2 tahap yang sama.

  [FIX — app/sitemap.ts]
  - Hapus join user_profiles!opinion_articles_author_id_fkey dari query sitemap.
  - Implementasi pola query 2 tahap yang sama.

Keputusan baru: Lihat Seksi 11 — satu keputusan baru: "Query user_profiles dilakukan terpisah — bukan via PostgREST join inline".
Status akhir: Selesai. Build clean. Di-merge ke main. /opinions menampilkan artikel dengan nama penulis yang benar dan link artikel tidak 404.
Next step: (Opsional) kembalikan like_count di kartu list dengan query terpisah ke opinion_likes.

[25-05-2026] SESI #42 — EDITOR OPINIONS IMPROVEMENTS
Branch: feature/editor-improvements
Tujuan sesi: Memperbaiki 4 masalah tampilan dan UX di editor TipTap Opinions.
Yang dikerjakan:
  [MASALAH 1 — TABEL GFM DI EDITOR]
  - Install 4 package: @tiptap/extension-table, @tiptap/extension-table-row,
    @tiptap/extension-table-header, @tiptap/extension-table-cell (semua v3.23.6).
  - Tambah ke extensions: Table.configure({ resizable: false }), TableRow, TableHeader, TableCell.
  - CSS tabel ditambahkan di editorProps.attributes.class via Tailwind arbitrary selector.
  - Output ke DB tetap Markdown — insertMarkdown() → onChange(combined) tidak diubah.

  [MASALAH 2 — CHART CHIP LABEL]
  - renderHTML() di ChartPlaceholder: dari tanpa child → child '📊 {chartId}'.
  - renderText() tidak disentuh — output ke DB tetap {{chart:chartId}}.

  [MASALAH 3 — PLACEHOLDER OVERLAP]
  - !editor.getText() diganti: isEmpty = doc.textContent === '' && doc.childCount <= 1.
  - Mencegah placeholder muncul tumpang tindih saat editor berisi chart node tanpa teks.

  [MASALAH 4 — STICKY TOOLBAR]
  - sticky top-14 → sticky top-[56px] eksplisit. Komentar ditambahkan: jika tinggi
    header OpinionEditor berubah, nilai ini perlu disesuaikan manual.

**Keputusan baru: Lihat Seksi 11 — tiga keputusan baru: TipTap table extensions,
               chart chip label, placeholder isEmpty.**
**Status akhir: Selesai. TypeScript bersih. ESLint 0 error baru. Build exit code 0.
              Bundle /akun/tulis: 349 kB (naik 15 kB dari 4 package table).**
**Next step: Merge ke main setelah test manual di /akun/tulis.**
---

[31-06-2026] SESI #43 — HARD RESET ARSITEKTUR VISUAL SYSTEM V2
Branch: main
Tujuan sesi: Menghapus residu pekerjaan AI yang cacat dan merombak arsitektur Dark Mode agar berfungsi logis tanpa konflik spesifisitas.
Yang dikerjakan:
  - Repositori lokal disinkronkan secara absolut dengan branch `main` GitHub (git reset --hard, git clean -fd).
  - Mengubah `tailwind.config.ts`: Seluruh Hex statis diganti menjadi pemanggilan CSS variable `var(--color-...)`.
  - Mengubah `app/globals.css`: Penataan ulang struktur `:root` dan `@media (prefers-color-scheme: dark)` untuk inversi warna murni.
  - Pembaruan dokumen CONTEXT.md (README.md) agar secara akurat mencerminkan spesifikasi V2 (Marcellus dkk) dan menolak dokumen handover/otomatisasi AI sebelumnya.
Status akhir: Fondasi Theming (Dark Mode) sudah stabil dan logis.
Next step: Lakukan perbaikan warna pada komponen Red Zone dan navigasi yang mungkin masih menggunakan token usang.
---
---

[31-05-2026] SESI #45 — PEMBERSIHAN RESIDU TOKEN V1 & HARDCODE HEX KOMPONEN
Branch: main
Tujuan sesi: Membersihkan sisa-sisa kelas Tailwind lama (V1) yang menyebabkan anomali rendering (transparansi dan kontras) pada komponen interaktif dan daftar opini setelah transisi ke V2.
Yang dikerjakan:
  - Mengganti seluruh `bg-primary-light` dengan `bg-paper` dan `primary-dark` dengan `ink` pada file bottom sheet (Koreksi, Komentar, Share) di modul editorial maupun opini.
  - Menyuntikkan `bg-transparent` pada `<textarea>` di formulir untuk menggugurkan *background* putih default browser.
  - Menghapus hardcode `text-[#1A1A1A]`, `text-text-secondary`, dan `border-border-subtle` pada `OpinionCard`, serta halaman dinamis opini/penulis, lalu menggantinya dengan token V2 (`text-ink`, `text-warm-gray`) agar mematuhi CSS Variables.
Status akhir: Selesai. Seluruh komponen interaktif dan daftar artikel opini sekarang merespons transisi Mode Gelap secara akurat tanpa residu warna absolut.
Next step: -
---

[01-06-2026] SESI #46 — UI/UX: LIBRE BASKERVILLE, DARK MODE TOGGLE, READING & A11Y
Branch: feature/uiux-libre-darktoggle-reading (PR #95)
Tujuan sesi: Redesain fondasi UI/UX sesuai Master Brief — ganti font display, tambah toggle dark mode hibrida, token formal CSS, aksesibilitas, print stylesheet, dan penyempurnaan reading experience. Semua di feature branch; Red Zone tidak disentuh.
Yang dikerjakan:
  - app/layout.tsx: import Libre_Baskerville (ganti Marcellus), script anti-FOUC dark mode di <head>, skip-link "Langsung ke konten", bungkus children dengan <div id="main-content" tabIndex={-1}>.
  - tailwind.config.ts: fontFamily.display & .libre → var(--font-display); darkMode → ['selector','[data-theme="dark"]'].
  - app/globals.css: hapus Marcellus (→ var(--font-display)); 3 skenario data-theme; token formal (type scale, spacing, leading, measure, radius, transition, z-index); skip-link, focus-visible outline, reduced motion; print stylesheet; reading dua-lapis (mobile 18px/1.7, desktop 19px/1.65 + 65ch) ke .article-body & .article-content.
  - components/layout/ThemeToggle.tsx (BARU): tombol Sun/Moon, hydration-safe, aria-label ID, simpan pilihan ke localStorage.
  - components/layout/Navbar.tsx: integrasi ThemeToggle di kiri tombol auth.
Keputusan baru: Lihat Seksi 11 — 4 keputusan (dark mode hibrida+toggle; darkMode selector; Libre Baskerville; reading 65ch dua-lapis). Membatalkan keputusan lama "tanpa toggle" & "color-scheme only light".
Status akhir: Selesai. `next lint` bersih (1 warning pre-existing di Red Zone), `tsc` 0 error, CI Vercel preview build sukses, PR #95 dibuka. Pengujian visual dilakukan pemilik via preview Vercel.
Next step: Merge PR #95 setelah pemilik verifikasi tampilan; pantau CLS & FOUC di produksi.
---

[02-06-2026] SESI #47 — REDESAIN BERANDA, HEADER GLOBAL, DRAWER & HALAMAN PLACEHOLDER
Branch: feature/redesign-homepage-drawer-sesi47 (PR #97)
Tujuan sesi: Implementasi Sistem Web Baru bagian "(dikerjakan sesi ini)" — redesain Halaman Utama, header global baru, drawer navigasi turun-dari-atas, 9 halaman placeholder under-maintenance, dan halaman pra-login. Semua di feature branch; Red Zone tidak disentuh.
Yang dikerjakan:
  - components/layout/Header.tsx (BARU): kepala situs global 3-kolom (ThemeToggle kiri, wordmark tengah, ikon menu kanan). Menggantikan Navbar.
  - components/layout/Navbar.tsx: DIHAPUS (digantikan Header).
  - components/layout/Drawer.tsx (BARU): menu full-screen turun dari atas; accordion lokasi (terkini/Global/Cari Negara A–Z) + navigasi (Argumen/Akun/Tentang Kami/Koreksi/Bookstore/Bagikan Ide) + tombol Keluar (hanya saat login).
  - components/layout/LocationProvider.tsx (BARU): React Context + localStorage untuk pilihan lokasi; deteksi negara via timezone (klien).
  - lib/countries.ts (BARU): daftar negara (ID) + groupCountriesByLetter untuk daftar A–Z.
  - components/layout/HomeFeed.tsx (BARU): search bar + article-card (cover, kategori|kicker, judul, ringkasan, baca X menit) + divider; filter pencarian & lokasi.
  - app/page.tsx: refactor — fetch artikel (kolom baru category/kicker/country) + hitung menit baca server-side, render HomeFeed. Tab Opinions dihapus.
  - components/layout/HomepageTabs.tsx: DIHAPUS.
  - app/layout.tsx: import Header + LocationProvider (bungkus konten); hapus Navbar.
  - components/layout/UnderMaintenance.tsx (BARU): template placeholder.
  - app/{tentang-kami,kontak,panduan-editorial,koreksi,kebijakan-iklan,keamanan,kebijakan-privasi,bookstore,bagikan-ide}/page.tsx (BARU): 9 halaman under-maintenance.
  - components/layout/PreLogin.tsx (BARU): gerbang masuk Google OAuth.
  - app/akun/page.tsx: logged-out → tampilkan PreLogin (bukan redirect paksa).
  - app/login/page.tsx: pakai PreLogin (default next=/dashboard).
  - app/globals.css: keyframes animasi drawer (slide-down/up + stagger; hormati prefers-reduced-motion).
Keputusan baru: Lihat Seksi 11 — 4 keputusan (Header global; beranda feed editorial tunggal; relevansi lokasi via Context+localStorage; halaman pra-login).
Status akhir: Selesai di kode. `next lint` bersih (1 warning pre-existing Red Zone), `tsc` 0 error, CI Vercel preview build sukses, PR #97 dibuka.
Next step: (1) Pemilik menjalankan migration 3 kolom (category/kicker/country) di Supabase SQL Editor. (2) Pemilik verifikasi tampilan via Vercel Preview. (3) Merge PR #97. Sesi lain: redesain footer, redesain Opinions/Argumen, rearsitekturisasi halaman penulisan artikel.
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
