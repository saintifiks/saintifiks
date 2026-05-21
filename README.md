# CONTEXT.md — Saintifiks Project Bible
> Versi: 0.7 | Status: Live | Terakhir diperbarui: 2026-05-21

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
| Markdown renderer | react-markdown + remark-gfm + remark-math + rehype-katex + rehype-highlight | Tabel GFM, formula LaTeX, syntax highlighting — ekosistem standar, client-side |

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
| `accent-red` | `#C90203` | Aksen — digunakan sangat sedikit (indikator turun di strip indeks, error state, highlight kritis) |
| `accent-blue` | `#002EC7` | Aksen — digunakan sangat sedikit (link aktif, CTA spesifik, elemen interaktif tertentu) |
| `accent-green` | `#5C8F6E` | Aksen — digunakan sangat sedikit (indikator naik di strip indeks beranda; hijau sage elegan, keputusan eksplisit 2026-05-21) |

**Prinsip penggunaan warna:** 90% halaman adalah `#0D0D0D` dan `#F5F4F0`. Warna aksen muncul hanya untuk elemen yang benar-benar membutuhkan perhatian. Jangan menggunakan aksen untuk dekorasi.

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

> Status: LIVE sejak 2026-05-21 | Hanya di halaman beranda (`app/page.tsx`)

### Tujuan
Memberi konteks faktual ekonomi & tata kelola bagi pembaca — selaras Prinsip Editorial #5 dan #7. Bukan untuk engagement artifisial: tanpa autoplay, tanpa animasi berkedip, tanpa infinite scroll.

### Tampilan
- **Strip tipis** (~36px) di paling atas konten beranda (di bawah Navbar), full width, latar `primary-dark`
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

### File terkait
```
components/widgets/IndexStrip.tsx      ← Server wrapper
components/widgets/IndexStripClient.tsx ← Polling + render strip
components/widgets/TrendIcon.tsx       ← Ikon panah
lib/indices/fetchers.ts                ← Ambil & format data
lib/indices/yahoo.ts                   ← Intraday Yahoo + tren
lib/indices/trend.ts                   ← Logika naik/turun
lib/indices/http.ts                    ← Helper fetch live vs cached
lib/indices/get-indices.ts             ← Orchestrator snapshot
app/api/indices/route.ts               ← Endpoint polling client
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
/
├── app/
│   ├── favicon.ico
│   ├── fonts/ (GeistVF.woff, GeistMonoVF.woff)
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx                          ← Halaman beranda
│   ├── artikel/
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
│   │       └── route.ts
│   ├── login/
│   │   └── page.tsx
│   └── api/
│       ├── analytics/
│       │   └── route.ts
│       ├── indices/
│       │   └── route.ts                  ← Polling data strip indeks (force-dynamic)
│       └── keep-alive/
│           └── route.ts
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── widgets/
│   │   ├── IndexStrip.tsx                ← Server wrapper strip indeks beranda
│   │   ├── IndexStripClient.tsx          ← Client polling + render
│   │   └── TrendIcon.tsx                 ← Ikon naik/turun
│   ├── artikel/
│   │   ├── ArticleRenderer.tsx
│   │   ├── ChartBlock.tsx
│   │   ├── LikeButton.tsx
│   │   ├── CorrectionSection.tsx
│   │   └── ImageUpload.tsx
│   └── analytics/
│       └── AnalyticsTracker.tsx
│
├── lib/
│   ├── indices/
│   │   ├── fetchers.ts                   ← Fetch semua indeks + tren
│   │   ├── get-indices.ts
│   │   ├── http.ts
│   │   ├── format.ts
│   │   ├── trend.ts
│   │   ├── types.ts
│   │   └── yahoo.ts
│   └── supabase/
│       ├── client.ts
│       ├── server.ts
│       └── remark/
│           └── remarkCallout.ts
│
├── .github/workflows/backup.yml
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── vercel.json
└── README.md
```

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

### Post-launch — Beranda & konteks data
- [x] Widget indeks beranda (fetch otomatis, tanpa hardcode)
- [x] Strip tipis horizontal di atas beranda (gaya ticker editorial)
- [x] Ikon tren naik (hijau) / turun (merah) per rentang data tersedia
- [x] Pembaruan pasar live via `/api/indices` + polling client 15 detik
- [x] Scroll horizontal tanpa scrollbar terlihat
- [x] Optimasi kecepatan render artikel (migrasi penuh ke Server Component)
- [x] Implementasi parser luwes (json5) & parser HTML mentah (rehype-raw) untuk toleransi output AI
- [x] Resolusi anomali pemutusan footnote via arsitektur single-pass render

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
             CATATAN IMPLEMENTASI: CSS KaTeX dan highlight.js diimport di app/layout.tsx
                                   setelah globals.css

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
---
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
---
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
---
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
---
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
---
> [19-05-2026] SESI #10
Branch: feature/phase-2-sistem-chart
Tujuan sesi: Phase 2 — Sistem chart (tabel article_charts, parser {{chart:chart-id}}, Chart.js renderer)
Yang dikerjakan:
  - Eksekusi SQL di Supabase: buat tabel article_charts dan 2 RLS policy (SELECT untuk artikel publik, ALL untuk admin terautentikasi).
  - Install dependensi via npm: chart.js dan react-chartjs-2.
  - Buat components/artikel/ChartBlock.tsx: Client component untuk me-render kanvas Chart.js dengan *error boundary* fallback (kotak merah jika JSON invalid/kosong).
  - Buat components/artikel/ArticleRenderer.tsx: Parser Markdown kustom untuk membelah string via regex {{chart:id}} dan me-rendernya menggunakan ChartBlock. Menggunakan React.createElement untuk mengamankan link, bypass bug browser memakan tag <a>.
  - Edit app/artikel/[slug]/page.tsx: Modifikasi query Supabase untuk *relational join* dengan article_charts, mengganti ReactMarkdown bawaan dengan ArticleRenderer. Mengganti tag HTML <a> native dengan Next.js <Link> untuk mematikan risiko bug copy-paste.
  - Edit app/(admin)/dashboard/artikel/actions.ts: Terapkan strategi idempotent update (hapus-seluruh-lalu-insert-baru) untuk relasi data chart demi menjaga konsistensi state database.
  - Edit app/(admin)/dashboard/artikel/baru/page.tsx: Injeksi deteksi real-time regex {{chart:...}} dan UI textarea dinamis untuk input JSON.
  - Edit app/(admin)/dashboard/artikel/[id]/edit/page.tsx: Injeksi logika *fetch* data JSON dari database saat *mount* dan UI dinamis input konfigurasi chart.
  - Resolusi CI/CD Vercel: Perbaikan penolakan build akibat aturan *strict linting* (penghapusan *dead code* variabel exception), perbaikan *unescaped JSX entities* (&quot;), dan penyelesaian *explicit type casting* dari tipe 'unknown' ke 'string' pada TypeScript.
Keputusan baru:
  - Workaround bug copy-paste tag <a> diperluas: implementasi link dalam komponen custom Markdown wajib menggunakan React.createElement('a', ...) alih-alih JSX mentah untuk mengeliminasi celah kegagalan build.
Status akhir: selesai
Next step: Phase 2 — Upload gambar artikel via Supabase Storage
---
> [20-05-2026] SESI #11
Branch: feature/phase-2-sistem-chart
Tujuan sesi: Phase 2 — Upload gambar artikel via Supabase Storage
Yang dikerjakan:
  - Setup bucket Storage 'artikel-gambar' di Supabase beserta 2 RLS policy.
  - Pembuatan komponen components/artikel/ImageUpload.tsx.
  - Modifikasi app/(admin)/dashboard/artikel/baru/page.tsx dan [id]/edit/page.tsx untuk injeksi komponen ImageUpload.
  - Pembaruan app/(admin)/dashboard/artikel/actions.ts untuk menyimpan nilai cover_image_url ke database.
Keputusan baru: tidak ada.
Status akhir: selesai.
Next step: Phase 3 — Google OAuth untuk pembaca (login untuk interaksi).
---
> [20-05-2026] SESI #12
Branch: feature/phase-3-likes-oauth
Tujuan sesi: Phase 3 — Implementasi Google OAuth untuk pembaca dan Sistem Likes
Yang dikerjakan:
  - Eksekusi SQL di Supabase: Pembuatan tabel `likes` dengan konfigurasi relasi ke `auth.users` dan `public.articles` (ON DELETE CASCADE) berserta constraint UNIQUE.
  - Injeksi RLS Policies pada tabel `likes`: SELECT/DELETE murni untuk owner, INSERT terikat ke auth.uid().
  - Modifikasi `app/auth/callback/route.ts`: Injeksi parameter tangkapan `next` dinamis pada URL callback agar OAuth redirect otomatis diarahkan kembali ke artikel pembaca.
  - Pembuatan `components/artikel/LikeButton.tsx`: Komponen klien yang mengeksekusi mekanisme Optimistic Update secara asinkron tanpa memblokir thread UI.
  - Modifikasi `app/artikel/[slug]/page.tsx`: Import dan integrasi penempatan LikeButton di penutup grid artikel.
Keputusan baru:
  - Komponen LikeButton secara asimetris tidak mengekspos agregasi metrik total "likes" secara publik sebagai wujud konformitas teknis pada prinsip pembatasan social proof bias (referensi: Habermas).
Status akhir: selesai
Next step: Phase 3 — Analytics internal (tabel analytics_events dan event tracking)
---
> [20-05-2026] SESI #13
Branch: feature/phase-3-analytics
Tujuan sesi: Phase 3 — Analytics internal (tabel analytics_events dan event tracking)
Yang dikerjakan:
  - Eksekusi SQL di Supabase: Pembuatan tabel analytics_events dengan RLS terisolasi (hanya INSERT).
  - Buat app/api/analytics/route.ts: API endpoint non-blocking untuk menerima beacon payload.
  - Buat components/analytics/AnalyticsTracker.tsx: Modul event tracking pasif untuk page_view dan scroll_depth berbasis W3C Beacon API pattern (keepalive: true).
  - Edit app/layout.tsx: Injeksi komponen tracker di level root.
  - Edit components/artikel/LikeButton.tsx: Injeksi pengiriman telemetry klik_like secara optimistik.
Keputusan baru: Tidak ada. Eksekusi selaras dengan limitasi performa CRP dan larangan telemetry pihak ketiga.
Status akhir: selesai
Next step: Evaluasi akhir Phase 3 dan persiapan Phase 4 (Security & SEO).
---
> [20-05-2026] SESI #14
Branch: feature/phase-4-seo
Tujuan sesi: Phase 4 — SEO metadata lengkap (Open Graph + Twitter Card)
Yang dikerjakan:
  - Edit app/layout.tsx: tambah metadataBase, default openGraph (siteName, locale, type),
    default twitter card (summary_large_image)
  - Edit app/artikel/[slug]/page.tsx: lengkapi generateMetadata() — tambah og:image,
    og:url, og:type "article", og:locale, twitter:title, twitter:description,
    twitter:image; perbaiki query Supabase untuk ambil cover_image_url dan slug
  - Edit app/page.tsx: tambah metadata statis untuk halaman beranda
  - Merge feature/phase-4-seo ke main
Keputusan baru: tidak ada (SEO menggunakan data yang sudah ada, tidak ada schema baru)
Status akhir: selesai
Next step: Phase 4 — Mekanisme koreksi artikel (publik)
---
> [20-05-2026] SESI #15
Branch: fix/artikel-404-dan-login-pembaca
Tujuan sesi: Post-launch — perbaikan bug 404 halaman artikel + akses login untuk pembaca
Yang dikerjakan:
  - Edit app/artikel/[slug]/page.tsx: hapus !inner dari join article_corrections
    (INNER JOIN menyebabkan query mengembalikan null untuk artikel tanpa koreksi → 404);
    tambah kolom status ke query; filter corrections hanya status='approved' di JavaScript
    sebelum dikirim ke komponen CorrectionSection
  - Edit components/layout/Navbar.tsx: ubah dari Server Component menjadi Client Component;
    tambah tombol Masuk (trigger Google OAuth, redirect kembali ke halaman saat ini) dan
    tombol Keluar (sign out + redirect ke beranda); tombol disembunyikan di halaman admin
  - Insiden build: ESLint menolak variabel _status (unused var) di page.tsx — diperbaiki
    dengan mengganti destructuring spread menjadi explicit mapping objek
  - Merge fix/artikel-404-dan-login-pembaca ke main
Keputusan baru:
  - Navbar diubah dari Server Component ke Client Component (lihat Seksi 11)
Status akhir: selesai
---
> [20-05-2026] SESI #16
Branch: feature/improve-login-ux
Tujuan sesi: Post-launch — Improve UX Login Google OAuth (account chooser + feedback visual)
Yang dikerjakan:
  - Edit components/layout/Navbar.tsx: tambah state isLoggingIn + queryParams prompt: 'select_account'
  - Edit components/artikel/LikeButton.tsx: tambah state isLoggingIn + queryParams prompt: 'select_account' (konsistensi)
  - Perbaikan TypeScript error terkait opsi OAuth (prompt dipindah ke queryParams)
Keputusan baru: tidak ada
Status akhir: selesai
---
> [20-05-2026] SESI #17
Branch: feature/advanced-markdown-renderer
Tujuan sesi: Post-launch — Upgrade ArticleRenderer.tsx dengan dukungan Markdown lanjutan
Yang dikerjakan:
  - Install 4 library baru via npm: remark-gfm, remark-math, rehype-katex, rehype-highlight
  - Upgrade components/artikel/ArticleRenderer.tsx: tambah plugin remark/rehype,
    tambah custom components untuk table (th, td), blockquote, pre, img dengan
    caption + sumber, dan syntax highlighting code block
  - Edit app/layout.tsx: tambah import CSS katex/dist/katex.min.css dan
    highlight.js/styles/github.css (setelah globals.css, sebelum component imports)
  - Resolusi 4 build error bertahap di Vercel:
      · package.json dan package-lock.json tidak ikut di-commit (library tidak ditemukan)
      · prop 'node' di blockquote dan code dideclare tapi tidak dipakai (ESLint no-unused-vars)
      · logika callout menggunakan regex flag /s (butuh ES2018, tsconfig tidak mendukung) —
        diganti dengan blockquote standar; callout didefer ke sesi terpisah
      · prop 'inline' di code component tidak ada di react-markdown v10 API (TypeScript error)
  - Merge feature/advanced-markdown-renderer ke main
Keputusan baru:
  - Fitur callout box (> [!NOTE]) didefer — tidak bisa diimplementasikan dengan pendekatan
    string matching di react-markdown v10; butuh remark plugin terpisah (lihat Seksi 11)
Status akhir: selesai (tanpa callout)
Next step: Implementasi callout box via remark plugin (sesi terpisah jika dibutuhkan)
---
> [20-05-2026] SESI #18
Branch: fix/chart-ssr
Tujuan sesi: Menyelesaikan bug Chart.js di Preview & artikel publik + cleanup minor (Item 3, 4, 5 dari Post-Launch)

Yang dikerjakan:
  - components/artikel/ArticleRenderer.tsx → ubah import ChartBlock menjadi dynamic import dengan { ssr: false }
  - components/artikel/ChartBlock.tsx → ganti registrasi manual BarElement dll menjadi ChartJS.register(...registerables)
  - app/globals.css → tambah styling footnote (superscript + section footnote)
  - app/fonts/ → hapus GeistVF.woff dan GeistMonoVF.woff (unused)
  - README.md → update log sesi dan keputusan arsitektur

Keputusan baru:
  - Chart.js wajib di-load client-side only via dynamic import ssr:false
  - Semua registerables Chart.js didaftarkan di dalam ChartBlock agar component reusable & robust

Status akhir: selesai
Next step: Sesi #19 — Implementasi <Image> Next.js di ArticleRenderer (Item 2)
---
[20-05-2026] SESI #19
Branch: feature/post-launch-konten-improvements
Tujuan sesi: Post-launch — Footnote CSS, Next.js Image, Callout Box
Yang dikerjakan:
  - Edit app/globals.css: tambah CSS footnote (superscript + section .footnotes)
  - Edit next.config.mjs: tambah pathname spesifik Supabase, hapus swcMinify deprecated
  - Edit components/artikel/ArticleRenderer.tsx: implementasi pendekatan hibrida
    <Image> (Supabase) vs <img> (eksternal); tambah eslint-disable inline
  - Buat lib/remark/remarkCallout.ts: custom remark plugin untuk callout box,
    mendukung [!NOTE], [!WARNING], [!IMPORTANT], [!TIP], tanpa dependency baru
  - Edit components/artikel/ArticleRenderer.tsx: tambah remarkCallout ke remarkPlugins,
    upgrade blockquote component untuk deteksi dan render callout box berwarna
  - Merge feature/post-launch-konten-improvements ke main
Keputusan baru:
  - Next.js Image hybrid approach (lihat Seksi 11)
  - Custom remark plugin untuk callout (lihat Seksi 11)
  - Footnote menggunakan CSS global (lihat Seksi 11)
Issues resolved: ESLint warning next/no-img-element, Callout box open issue
Status akhir: selesai
Next step: -
---
> [21-05-2026] SESI #20–#23 (rangkaian)
Branch: feature/homepage-index-widget → feature/homepage-index-ticker-strip →
        feature/homepage-index-trend-arrows → feature/homepage-index-live-refresh
Tujuan sesi: Widget indeks di beranda — data otomatis, strip tipis, tren naik/turun, pembaruan live
Yang dikerjakan:
  - Buat lib/indices/* (fetchers, yahoo, trend, format, types, get-indices, http)
  - Buat components/widgets/IndexStrip.tsx, IndexStripClient.tsx, TrendIcon.tsx
  - Buat app/api/indices/route.ts (force-dynamic, cache server 12 detik)
  - Edit app/page.tsx: sisipkan strip di paling atas beranda
  - Edit app/globals.css: scrollbar tersembunyi (.index-ticker-scroll)
  - Edit tailwind.config.ts + globals.css: token accent-green (#5C8F6E)
  - Iterasi desain: grid 3 grup → strip horizontal tipis (WSJ-inspired, disesuaikan Saintifiks)
  - Iterasi data: Frankfurter (harian) → Yahoo IDR=X untuk USD/IDR live; perbaikan polling
    (fetch saat mount + 15 detik, bukan hanya interval 30 detik)
  - Merge PR #33–#36 ke main
Keputusan baru:
  - Widget indeks hybrid SSR + client polling (Seksi 5.3, Seksi 11)
  - accent-green untuk ikon naik (Seksi 11)
  - Dokumentasi lengkap di Seksi 5.3 dan pembaruan struktur file Seksi 7
Status akhir: selesai
Next step: Opsional — set BPS_API_KEY di Vercel untuk inflasi bulanan BPS
---
> [21-05-2026] SESI #24
Branch: main (push langsung atas permintaan eksplisit pemilik)
Tujuan sesi: Perbarui README.md (CONTEXT) mencerminkan seluruh pekerjaan widget indeks
Yang dikerjakan:
  - Update README.md versi 0.6: palette, Seksi 5.3, struktur file, checklist, log sesi, Seksi 11
  - Perbaiki dokumentasi callout/footnote yang sudah outdated
Keputusan baru: tidak ada
Status akhir: selesai
---
> [21-05-2026] SESI #25
Branch: feature/optimize-renderer-v2
Tujuan sesi: Optimasi kecepatan render (Server Component), peningkatan toleransi format chart (json5), pemahaman sintaks HTML mentah di Markdown (rehype-raw), dan perbaikan integrasi footnote.
Yang dikerjakan:
  - Install dependensi: json5, rehype-raw
  - Edit components/artikel/ChartBlock.tsx: Integrasi json5 parser dan filter pembersih sisa markup markdown bawaan AI. Fix dead code variabel (ESLint warning).
  - Edit components/artikel/ArticleRenderer.tsx: Migrasi menjadi Server Component dengan mencabut direktif 'use client'. Integrasi rehype-raw. Perombakan parser menjadi arsitektur single-pass render untuk mencegat pemotongan konteks referensi (footnote). Fix dead code variabel (ESLint warning).
Keputusan baru:
  - ArticleRenderer sebagai Server Component (Seksi 11)
  - Penggunaan format JSON5 (Seksi 11)
  - Arsitektur Single-Pass Render (Seksi 11)
Status akhir: selesai
Next step: -
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
