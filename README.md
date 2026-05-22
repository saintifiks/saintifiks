# CONTEXT.md — Saintifiks Project Bible
> Versi: 0.9 | Status: Live | Terakhir diperbarui: 2026-05-22

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
│   ├── icon.svg
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
│   │   ├── Footer.tsx
│   │   ├── ConditionalIndexStrip.tsx     ← Client Component — tampilkan IndexStrip hanya di /
│   │   └── ScrollToTop.tsx               ← Client Component — paksa scroll ke atas setiap navigasi
│   ├── widgets/
│   │   ├── IndexStrip.tsx                ← Server wrapper strip indeks beranda
│   │   ├── IndexStripClient.tsx          ← Client polling + render
│   │   └── TrendIcon.tsx                 ← Ikon naik/turun
│   ├── artikel/
│   │   ├── ArticleRenderer.tsx
│   │   ├── ArticleInteractions.tsx     ← Client Component wrapper untuk seluruh section interaksi
│   │   ├── ChartBlock.tsx
│   │   ├── LikeButton.tsx              ← Icon Heart + optimistic update + count
│   │   ├── CorrectionSection.tsx       ← Icon AlertCircle + count koreksi
│   │   ├── ShareButton.tsx             ← Generate gambar Instagram Story 1080x1920
│   │   ├── CommentsSection.tsx         ← Komentar publik (privacy: "Pembaca")
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
- [x] Widget indeks dipindah ke atas Navbar (via `ConditionalIndexStrip` di `layout.tsx`)
- [x] Scroll otomatis ke paling atas saat navigasi halaman (via `ScrollToTop` di `layout.tsx`)

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
```

---

## 12. LOG SESI

> [18-05-2026 s.d. 21-05-2026] SESI #1–#26 (KONSOLIDASI FASE 0 HINGGA POST-LAUNCH)
Branch: Berbagai feature branches (dari feature/phase-0-foundation hingga feature/custom-favicon) ter-merge ke main
Tujuan sesi: Menyelesaikan fondasi infrastruktur (Phase 0), sistem artikel & CMS (Phase 1-2), interaksi & analitik pembaca (Phase 3), optimasi SEO & keamanan (Phase 4), serta penyempurnaan fitur beranda & mesin render pasca-rilis.
Yang dikerjakan:

  [INFRASTRUKTUR, DATABASE & AUTENTIKASI]
  - Setup Next.js 14 (App Router), Supabase, Vercel, Tailwind CSS v3, GitHub Repo.
  - Implementasi cron job (Vercel) ke endpoint `/api/keep-alive` untuk mencegah hibernasi Supabase.
  - Skema database direalisasikan: `articles`, `article_charts`, `likes`, `analytics_events`. RLS policy diaktifkan penuh pada semua
  tabel.
  - Google OAuth terintegrasi via Supabase untuk admin (akses dashboard) dan pembaca (akses *like*). Parameter `prompt: 'select_account'` ditambahkan untuk transparansi UX.

  [SISTEM MANAJEMEN KONTEN (CMS) & ADMIN]
  - Pembuatan area admin terproteksi layout auth guard.
  - Implementasi form tulis/edit artikel dengan *live preview* Markdown dan sistem *idempotent update* untuk relasi *chart*.
  - Upload gambar dipusatkan di Supabase Storage bucket 'artikel-gambar'.

  [MESIN RENDER ARTIKEL & MARKDOWN]
  - Migrasi `ArticleRenderer` menjadi Server Component secara utuh untuk optimalisasi *First Contentful Paint* (FCP).
  - Integrasi pustaka parsing level lanjut: `react-markdown`, `remark-gfm`, `remark-math`, `rehype-katex`, `rehype-highlight`, dan `rehype-raw`.
  - Implementasi arsitektur *Single-Pass Render* menggunakan substitusi Regex untuk elemen `{{chart:id}}`, menyelesaikan masalah anomali pemutusan *footnote* yang sebelumnya terjadi akibat metode `.split()`.
  - Pembuatan *custom remark plugin* (`lib/remark/remarkCallout.ts`) untuk memproses AST *callout box* (`[!NOTE]`, dll) tanpa dependensi tambahan.
  - Integrasi parser `json5` pada `ChartBlock` dengan Regex *strip* untuk menoleransi cacat sintaks dari *output* AI saat men-generate JSON chart, dengan penahan XSS native.
  - Perbaikan krusial (*workaround*) isolasi bug tag `<a>`: Komponen tautan di Markdown menggunakan `React.createElement` dan seluruh generasi file berisikan tag HTML dari AI wajib menggunakan *artifact download*, dilarang keras via *copy-paste* teks chat.

  [FITUR PUBLIK, UI/UX & WIDGET INDEKS]
  - Implementasi halaman beranda, artikel individual, mekanisme koreksi publik, dan navigasi klien (*Client Component* Navbar untuk deteksi sesi).
  - Implementasi *Widget Indeks Beranda* berbentuk *ticker strip* tipis. Skema data hibrida: SSR di awal + *client polling* setiap 15 detik ke `/api/indices` (cache server 12 detik) untuk efisiensi limit API eksternal (Yahoo Finance). Indikator tren warna ditambahkan (`accent-green` dan `accent-red`).
  - Render elemen gambar mengadopsi rute hibrida: Komponen `<Image>` Next.js khusus domain Supabase, fallback `<img>` standar untuk sumber eksternal.
  - Optimalisasi metrik SEO statis/dinamis (Open Graph, Twitter Card) dan penggantian *favicon* standar menjadi *icon.svg* kustom.

  [ANALITIK & INTERAKSI]
  - Sistem *likes* menggunakan *Optimistic Update* di sisi klien tanpa mengekspos agregasi angka secara publik (pembatasan *social proof bias*).
  - Pelacakan analitik mandiri (W3C Beacon API) via `AnalyticsTracker.tsx` untuk metrik *page_view* dan *scroll_depth* ke database internal murni, tanpa telemetri pihak ketiga.

Keputusan baru: Seluruh keputusan arsitektur minor maupun mayor yang dieksekusi sepanjang 26 sesi telah disahkan dan terangkum secara permanen di Seksi 11 (Keputusan Arsitektur).
Status akhir: Selesai (Phase 0–4 dan Post-Launch tuntas).
Next step: [LIHAT SESI #28] Implementasi fitur social interaction (like, share, comments) dan Instagram Story generator.
---
---

[21-05-2026] SESI #27
Branch: feature/widget-strip-above-navbar
Tujuan sesi: Memindahkan widget IndexStrip ke posisi di atas Navbar (hanya di halaman beranda) dan memastikan halaman selalu dibuka dari posisi scroll paling atas.
Yang dikerjakan:
  - Dibuat `components/layout/ConditionalIndexStrip.tsx` — Client Component baru yang menggunakan usePathname() untuk merender IndexStrip hanya jika pathname === '/'. Server Component IndexStrip dioper sebagai prop untuk menghindari kontaminasi Server→Client.
  - Dibuat `components/layout/ScrollToTop.tsx` — Client Component ringan yang memaksa window.scrollTo(0,0) setiap kali pathname berubah.
  - Diubah `app/layout.tsx` — ditambahkan import dan pemasangan <ScrollToTop /> dan <ConditionalIndexStrip strip={<IndexStrip />} /> sebelum <Navbar />.
  - Diubah `app/page.tsx` — dihapus import IndexStrip dan penggunaan <IndexStrip /> karena sudah dipindah ke layout.tsx.
Keputusan baru: Lihat Seksi 11 — dua keputusan baru: "IndexStrip dipindah ke atas Navbar" dan "ScrollToTop".
Status akhir: Selesai. Di-push ke feature/widget-strip-above-navbar, siap di-review via Vercel Preview sebelum merge ke main.
Next step: Verifikasi di Vercel Preview URL → merge ke main.
---

[22-05-2026] SESI #28
Branch: feature/social-interaction-icons
Tujuan sesi: Menambahkan fitur social interaction (like, share, comments) dengan icon yang lebih menarik dan kemampuan generate gambar Instagram Story.
Yang dikerjakan:
  [DATABASE & API]
  - Migration tabel `comments` dan `shares` dengan RLS policy lengkap di Supabase.
  - Dibuat API routes: `/api/likes/count`, `/api/comments`, `/api/shares`.
  
  [KOMPONEN UI BARU]
  - `ShareButton.tsx` — Client Component dengan:
    • Icon Share dari lucide-react
    • Modal pilihan platform (Instagram Story, Twitter, Facebook, WhatsApp, Copy Link)
    • Generate gambar Instagram Story 1080x1920 menggunakan html-to-image
    • Tracking share count per platform
  - `CommentsSection.tsx` — Client Component dengan:
    • Tampilan komentar publik (privacy: nama ditampilkan sebagai "Pembaca")
    • Form input komentar untuk user yang sudah login
    • Error handling untuk isolasi error
  - `ArticleInteractions.tsx` — Client Component wrapper yang mengisolasi seluruh section interaksi
  
  [UPDATE KOMPONEN EXISTING]
  - `LikeButton.tsx` — Ditambah icon Heart dari lucide-react dan tampilan jumlah like publik.
  - `CorrectionSection.tsx` — Ditambah icon AlertCircle dan tampilan jumlah koreksi.
  - `page.tsx` artikel — Integrasi ArticleInteractions dengan ISR revalidate = 3600 untuk hemat quota.
  
  [DEPENDENCIES]
  - Install `lucide-react` — Icon library untuk konsistensi visual
  - Install `html-to-image` — Generate gambar dari HTML untuk Instagram Story
  
  [PEMECAHAN MASALAH KRUSIAL]
  - Debug error 406 (Not Acceptable) karena `.single()` digunakan saat user belum like → diubah ke `.maybeSingle()`
  - Debug error "No API key" — ternyata perlu merge ke main agar env vars ter-load dengan benar di production
  - Implementasi error boundary di Client Components agar satu error tidak menghancurkan seluruh UI
Keputusan baru: Lihat Seksi 11 — tujuh keputusan baru terkait social interaction dan error handling.
Status akhir: Selesai. Di-merge ke main dan live di production.
Next step: Monitoring quota Supabase; pertimbangkan penambahan fitur reply komentar atau notifikasi di masa depan.
---

[22-05-2026] SESI #29
Branch: feature/share-instagram-story-improvements
Tujuan sesi: Memperbaiki bug tampilan situs di browser Samsung Internet saat mode malam perangkat aktif — logo berubah abu-abu dan avatar profil warnanya terbalik.
Yang dikerjakan:
  - Diubah `app/globals.css` — ditambahkan `color-scheme: only light` di `:root` sebagai sinyal utama ke browser agar tidak menerapkan forced dark mode.
  - Diubah `app/layout.tsx` — ditambahkan `colorScheme: "only light"` di objek metadata Next.js, menghasilkan `<meta name="color-scheme">` di `<head>` yang dibaca browser sebelum CSS dimuat.
  - Diubah `app/page.tsx` — elemen `<img>` logo beranda diganti dengan `<picture>` + `<source media="(prefers-color-scheme: dark)">` agar browser otomatis memilih logo yang tepat (lighttheme vs darktheme) sesuai preferensi sistem.
  - Diubah `components/layout/Navbar.tsx` — verifikasi bahwa avatar profil sudah konsisten menggunakan `bg-primary-dark text-primary-light` tanpa kelas `dark:` yang bisa terpengaruh forced dark mode.
Keputusan baru: Lihat Seksi 11 — satu keputusan baru: "color-scheme: only light — situs tidak mendukung dark mode".
Status akhir: Selesai. Di-push ke feature/share-instagram-story-improvements.
Next step: Test di Samsung Internet dengan mode malam aktif untuk verifikasi fix.
---

[22-05-2026] SESI #30
Branch: feature/share-instagram-story-improvements
Tujuan sesi: Memperbaiki bug sistem likes — jumlah like tidak sinkron antar user (akun B melihat 0 likes padahal akun A sudah like, dan setelah akun B like tertulis 1 bukan 2).
Yang dikerjakan:
  - Diubah `components/artikel/LikeButton.tsx`:
    • Ganti `createClient()` di body komponen menjadi `useMemo(() => createClient(), [])` agar instance Supabase tidak dibuat ulang setiap render — mencegah useEffect re-run dan reset likeCount ke 0.
    • Tambah import `useMemo` di baris import React.
    • Hapus `supabase` dari dependency array useEffect (cukup `[articleId]`).
    • Tambah `setLikeCount(previousCount)` di blok error handling insert dan delete untuk rollback penuh.
    • Tambah `cache: 'no-store'` di semua fetch ke `/api/likes/count`.
  - Diubah `app/api/likes/count/route.ts`:
    • Tambah `export const dynamic = 'force-dynamic'` untuk mencegah Next.js meng-cache route ini.
    • Tambah header `Cache-Control: no-store, no-cache, must-revalidate` pada response sukses.
Keputusan baru: Lihat Seksi 11 — satu keputusan baru: "Fix likes count — useMemo + cache no-store + rollback count".
Status akhir: Selesai. Di-push ke feature/share-instagram-story-improvements.
Next step: Test manual — like dengan dua akun berbeda di artikel yang sama, verifikasi angka konsisten.
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
