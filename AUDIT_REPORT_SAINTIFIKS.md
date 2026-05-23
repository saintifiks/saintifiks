# LAPORAN AUDIT TEKNIS — SAINTIFIKS

| **Tanggal Audit** | 25 Mei 2026 |
|---|---|
| **Branch** | `main` |
| **Versi README** | Sesi #35 (24-05-2026) |
| **Auditor** | Senior Technical Auditor (AI) |
| **Standar Acuan** | Website independen berkualitas tinggi, infrastruktur free tier |

---

## RINGKASAN EKSEKUTIF

Saintifiks adalah proyek media independen berbasis web yang dibangun dengan standar teknis tinggi di atas infrastruktur free tier (Vercel + Supabase + GitHub). Secara keseluruhan, proyek ini menunjukkan **kematangan arsitektur yang baik** untuk skala dan tahapan proyeknya — khususnya dalam hal pemisahan concern, strategi caching, dan penerapan keamanan dasar.

**Kekuatan utama:**
- Arsitektur keamanan service_role key sudah benar (hanya server-side)
- Isolasi platform opinions dari sistem editorial sudah rapi
- Strategi caching multi-lapis (ISR + server cache + client polling) efisien untuk free tier
- Tidak ada tracking pihak ketiga — sejalan dengan misi proyek
- Dokumentasi (README/CONTEXT.md) sangat komprehensif dan terjaga

**Area yang perlu perhatian:**
- Tidak ada rate limiting di seluruh API endpoint
- Beberapa endpoint menggunakan `getSession()` alih-alih `getUser()` untuk verifikasi autentikasi
- Tidak ada file `sitemap.xml`, `robots.txt`, `not-found.tsx`, dan `error.tsx`
- Tidak ada sanitasi input eksplisit untuk konten opini pengguna

---

## STATISTIK TEMUAN

| Severitas | Jumlah |
|---|---|
| 🔴 KRITIS | 0 |
| 🟠 TINGGI | 2 |
| 🟡 SEDANG | 7 |
| 🟢 RENDAH | 5 |
| ℹ️ INFO | 8 |

---

## TEMUAN BERDASARKAN SEVERITAS

### 🟠 TINGGI

---

#### T-01: Tidak Ada Rate Limiting di Seluruh API Endpoint

**Deskripsi:**
Seluruh API route publik (`/api/comments`, `/api/likes`, `/api/analytics`, `/api/shares`, `/api/opinions/*`, `/api/indices`) tidak memiliki mekanisme rate limiting. Penyerang bisa mengirim ribuan request per detik untuk:
- Menghabiskan kuota Supabase (50.000 row/bulan free tier)
- Spam komentar (POST `/api/comments`)
- Menghabiskan Vercel Serverless Function invocations (100.000/bulan free tier)
- Membanjiri database `analytics_events` dengan data palsu

**File terkait:** Seluruh file di `app/api/`

**Dampak:** Kuota free tier Supabase dan Vercel bisa habis dalam hitungan jam jika diserang. Pada skenario terburuk, database penuh dan seluruh fitur berhenti berfungsi sampai periode billing berikutnya.

**Rekomendasi:**
Implementasi rate limiting sederhana menggunakan in-memory store (tanpa dependency tambahan):
```typescript
// lib/rate-limit.ts
const requests = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(ip: string, limit = 60, windowMs = 60_000): boolean {
  const now = Date.now()
  const entry = requests.get(ip)
  if (!entry || now > entry.resetAt) {
    requests.set(ip, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (entry.count >= limit) return false
  entry.count++
  return true
}
```
Untuk free tier, solusi ini memadai. Alternatif: Vercel Edge Middleware dengan IP-based throttle.

---

#### T-02: Penggunaan `getSession()` untuk Verifikasi Autentikasi di API Route yang Menulis Data

**Deskripsi:**
`app/api/comments/route.ts` (baris 62) menggunakan `supabase.auth.getSession()` untuk memverifikasi identitas user sebelum menulis komentar ke database. Dokumentasi resmi Supabase secara eksplisit menyatakan:

> "Never trust `supabase.auth.getSession()` inside server code. It isn't guaranteed to revalidate the Auth token."

`getSession()` membaca token dari cookie tanpa memvalidasi ke server Supabase — token bisa expired atau dipalsukan. Untuk operasi baca (`/api/analytics`), risiko rendah. Tetapi untuk operasi tulis (`/api/comments` POST), ini adalah celah autentikasi.

**File terkait:**
- `app/api/comments/route.ts` — baris 62 (operasi tulis)
- `app/api/analytics/route.ts` — baris 9 (operasi tulis, tapi bersifat opsional)

**Perbandingan dengan pola yang benar:**
`app/api/likes/route.ts` baris 18, `app/api/opinions/[id]/route.ts` baris 35, dan semua admin route sudah menggunakan `getUser()` — ini pola yang benar.

**Rekomendasi:**
Ganti `getSession()` dengan `getUser()` di `app/api/comments/route.ts`:
```typescript
// Sebelum (rentan):
const { data: { session } } = await supabase.auth.getSession()
if (!session?.user) { ... }

// Sesudah (aman):
const { data: { user }, error } = await supabase.auth.getUser()
if (error || !user) { ... }
```

---

### 🟡 SEDANG

---

#### S-01: Tidak Ada `sitemap.xml` dan `robots.txt`

**Deskripsi:**
Tidak ditemukan file `app/sitemap.ts` atau `app/robots.ts` di project. Untuk media online, sitemap adalah sinyal penting bagi mesin pencari agar artikel baru terindeks cepat.

**Dampak:** Artikel baru mungkin butuh waktu lebih lama untuk terindeks Google, mengurangi jangkauan organik — bertentangan dengan misi menyebarkan informasi berkualitas.

**Rekomendasi:**
Buat `app/sitemap.ts` (Next.js native support) yang query semua artikel published dari Supabase. Buat `app/robots.ts` yang memperbolehkan semua crawler.

---

#### S-02: Tidak Ada Global Error Boundary (`error.tsx`) dan Custom 404 (`not-found.tsx`)

**Deskripsi:**
Tidak ditemukan file `app/error.tsx` atau `app/not-found.tsx`. Jika terjadi runtime error yang tidak tertangkap, pembaca melihat halaman error bawaan Next.js yang generik dan tidak sesuai branding.

**File terkait:** `app/` (root level)

**Dampak:** UX buruk saat terjadi error atau halaman tidak ditemukan. Pembaca mungkin mengira situs rusak.

**Rekomendasi:**
Buat `app/not-found.tsx` dan `app/error.tsx` dengan desain konsisten (font Libre Baskerville, palette Saintifiks). Cukup halaman sederhana yang mengarahkan ke beranda.

---

#### S-03: Tidak Ada Sanitasi Input Eksplisit untuk Konten Opini Pengguna

**Deskripsi:**
Konten artikel opini (`opinion_articles.content`) ditulis oleh pengguna publik dan dirender via `react-markdown` + `rehype-raw`. Plugin `rehype-raw` memperbolehkan HTML mentah dalam Markdown, yang berarti pengguna bisa menyisipkan tag HTML termasuk `<script>` atau event handler seperti `onload`.

**Mitigasi yang sudah ada:**
- `react-markdown` secara default melakukan sanitasi dasar dan tidak merender `<script>` tag
- Tidak ditemukan penggunaan `dangerouslySetInnerHTML`

**Risiko residual:** Meskipun `react-markdown` melakukan sanitasi, kombinasi `rehype-raw` membuka kemungkinan bypass jika ditemukan bug di library. Konten dari pengguna publik (bukan hanya admin) meningkatkan attack surface.

**Rekomendasi:**
Pertimbangkan menambahkan `rehype-sanitize` di pipeline `OpinionContentRenderer.tsx` (khusus untuk konten opini, bukan editorial):
```typescript
import rehypeSanitize from 'rehype-sanitize'
// ...
rehypePlugins={[rehypeSanitize, rehypeRaw, rehypeKatex, rehypeHighlight]}
```
Ini memberikan lapisan pertahanan tambahan tanpa mengubah fungsionalitas.

---

#### S-04: Supabase Client Dibuat Ulang Setiap Render di `CommentsSection.tsx`

**Deskripsi:**
Di `components/artikel/CommentsSection.tsx` baris 30, `createClient()` dipanggil langsung di body komponen tanpa `useMemo`. Ini menyebabkan instance Supabase baru dibuat setiap re-render, yang bisa menyebabkan:
- Memory leak (banyak instance subscriber)
- `useEffect` dengan dependency `supabase` akan re-run terus-menerus

**File terkait:** `components/artikel/CommentsSection.tsx` — baris 30

**Perbandingan:** `components/artikel/LikeButton.tsx` baris 22 sudah benar menggunakan `useMemo(() => createClient(), [])`.

**Rekomendasi:**
```typescript
import { useMemo } from 'react'
// ...
const supabase = useMemo(() => createClient(), [])
```

---

#### S-05: Debug `console.log` dengan Prefix Service Role Key

**Deskripsi:**
`app/api/likes/count/route.ts` baris 21 meng-log 20 karakter pertama dari `SUPABASE_SERVICE_ROLE_KEY`:
```typescript
console.log('[/api/likes/count] SERVICE_ROLE_KEY ada?', !!serviceKey, '| prefix:', serviceKey?.substring(0, 20))
```

**Mitigasi yang sudah ada:** `next.config.mjs` memiliki `compiler.removeConsole: true` untuk production, yang seharusnya menghapus statement ini dari build output.

**Risiko residual:** Jika `removeConsole` gagal di edge case tertentu (atau di masa depan), key prefix bisa bocor ke Vercel logs. Selain itu, log ini aktif saat development dan bisa terlihat jika `.env.local` dibagikan secara tidak sengaja.

**Rekomendasi:**
Hapus log ini — tidak diperlukan lagi setelah bug likes terselesaikan di sesi #31.

---

#### S-06: Polling `IndexStripClient` Tidak Memiliki Exponential Backoff

**Deskripsi:**
`components/widgets/IndexStripClient.tsx` melakukan polling setiap 15 detik ke `/api/indices`. Jika API eksternal (Yahoo Finance, Frankfurter) mengalami downtime berkepanjangan, polling terus berjalan dengan interval tetap tanpa backoff, menghabiskan Vercel function invocations.

**File terkait:** `components/widgets/IndexStripClient.tsx` — baris 66-73

**Dampak:** Pada free tier Vercel (100K invocations/bulan), jika 100 pengunjung bersamaan masing-masing polling setiap 15 detik, itu ~576K invocations/hari — melampaui kuota.

**Mitigasi yang sudah ada:** Server-side cache 12 detik (`app/api/indices/route.ts` baris 8) mengurangi beban ke API eksternal, tapi tidak mengurangi jumlah Vercel invocations.

**Rekomendasi:**
- Naikkan interval polling default dari 15 detik ke 30-60 detik
- Tambahkan exponential backoff jika response gagal
- Pertimbangkan menghentikan polling setelah 5 menit idle (tab masih visible tapi user tidak scrolling)

---

#### S-07: Fungsi `generateSlug` Diduplikasi di Dua File

**Deskripsi:**
Fungsi `generateSlug()` identik ditemukan di:
- `app/api/opinions/route.ts` — baris 11-25
- `app/api/opinions/[id]/route.ts` — baris 12-26

**Dampak:** Jika ada perubahan logika slug, harus diubah di dua tempat — risiko inkonsistensi.

**Rekomendasi:**
Ekstrak ke file helper tunggal, misalnya `lib/slug.ts`, lalu import dari kedua route.

---

### 🟢 RENDAH

---

#### R-01: Property `colorScheme` di Metadata Deprecated

**Deskripsi:**
`app/layout.tsx` baris 31 menggunakan `colorScheme: "only light"` di objek metadata Next.js. Property ini deprecated di Next.js 14.2+ dan akan dihapus di versi mendatang.

**Mitigasi yang sudah ada:** CSS `color-scheme: only light` di `:root` dan inline style di `<html>` sudah memberikan perlindungan yang sama. Metadata property ini redundan.

**Rekomendasi:**
Hapus `colorScheme` dari objek metadata. Perlindungan dari CSS dan inline style sudah cukup.

---

#### R-02: Dead Code — `EditorTextarea.tsx` dan `EditorToolbar.tsx`

**Deskripsi:**
Setelah migrasi ke TipTap (Sesi #35), file `components/opinions/editor/EditorTextarea.tsx` dan `components/opinions/editor/EditorToolbar.tsx` tidak lagi digunakan oleh `OpinionEditor.tsx`. File ini menambah bundle size yang tidak perlu.

**Rekomendasi:**
Hapus kedua file atau tandai dengan komentar `// DEPRECATED — replaced by TipTapEditor.tsx` sampai konfirmasi penuh bahwa TipTap stabil.

---

#### R-03: Brand Link di Navbar Menggunakan `<a>` Bukan `<Link>`

**Deskripsi:**
`components/layout/Navbar.tsx` baris 74 menggunakan `<a href="/">` biasa alih-alih `<Link>` dari `next/link` untuk link ke beranda. Ini menyebabkan full page reload alih-alih client-side navigation.

**Dampak:** Tidak kritis, tapi memperlambat navigasi dan membuang cache yang sudah di-prefetch.

**Rekomendasi:**
Ganti `<a href="/">` dengan `<Link href="/">`.

---

#### R-04: `OpinionPreview.tsx` Tidak Lagi Digunakan

**Deskripsi:**
Setelah migrasi TipTap, `OpinionPreview.tsx` tidak lagi dipanggil (README Sesi #35: "OpinionPreview.tsx tidak lagi digunakan — WYSIWYG menggantikannya"). File ini masih ada di repo.

**Rekomendasi:**
Hapus atau tandai sebagai deprecated.

---

#### R-05: `useEffect` Dependency Warning di `CommentsSection.tsx`

**Deskripsi:**
`components/artikel/CommentsSection.tsx` baris 58 memasukkan `supabase` sebagai dependency di `useEffect`. Karena `supabase` dibuat ulang setiap render (lihat S-04), effect ini bisa re-run lebih sering dari yang diharapkan.

**File terkait:** `components/artikel/CommentsSection.tsx` — baris 33-58

**Rekomendasi:**
Selesaikan S-04 terlebih dahulu (useMemo). Setelah itu, hapus `supabase` dari dependency array atau gunakan pattern yang sama dengan `LikeButton.tsx`.

---

### ℹ️ INFO / OBSERVASI POSITIF

---

#### I-01: Arsitektur Keamanan Service Role Key Sudah Benar

`lib/supabase/admin.ts` hanya diimpor di API routes server-side dan admin dashboard (Server Components). Tidak ada satu pun Client Component (`'use client'`) yang mengimpor file ini. Pattern verifikasi autentikasi via `createClient()` (anon key) sebelum menggunakan `createAdminClient()` (service_role) sudah diterapkan secara konsisten di seluruh API route.

---

#### I-02: Pemisahan Opinions Platform dari Editorial Sudah Rapi

Opinions platform memiliki tabel terpisah, komponen terpisah (`OpinionContentRenderer` vs `ArticleRenderer`), API endpoint terpisah, dan halaman terpisah. Tidak ada kontaminasi ke sistem editorial yang sudah stabil. Prinsip "file yang tidak boleh disentuh" dipatuhi.

---

#### I-03: Strategi Caching Efisien untuk Free Tier

- Halaman beranda: ISR 5 menit (`revalidate = 300`)
- Halaman artikel editorial: ISR 1 jam (`revalidate = 3600`)
- API indices: server-side in-memory cache 12 detik
- Halaman opinions individual: `force-dynamic` (diperlukan karena status bisa berubah)
- Semua API likes/count: `Cache-Control: no-store` (real-time)

Strategi ini menyeimbangkan freshness dan penghematan kuota dengan baik.

---

#### I-04: Tidak Ada Tracker Pihak Ketiga

Tidak ditemukan Google Analytics, Facebook Pixel, atau tracker pihak ketiga lainnya. Analitik sepenuhnya mandiri via `AnalyticsTracker.tsx` + database Supabase internal. Sesuai dengan Zona Merah README dan misi proyek.

---

#### I-05: Keep-Alive Cron Job Terimplementasi Benar

`vercel.json` mengkonfigurasi cron job setiap 3 hari. Endpoint `/api/keep-alive` melakukan validasi `CRON_SECRET` (mencegah akses publik) dan query ringan. Ini mencegah hibernasi Supabase free tier — risiko eksistensial proyek sudah dimitigasi.

---

#### I-06: Weekly Backup Otomatis via GitHub Actions

`.github/workflows/backup.yml` menjalankan `pg_dump` setiap Minggu, menyimpan ke GitHub Artifacts (retensi 30 hari). Menggunakan PostgreSQL 17 client yang kompatibel dengan Supabase. Strategi backup yang solid untuk free tier.

---

#### I-07: Privasi Komentar Sesuai Keputusan Arsitektur

`app/api/comments/route.ts` menampilkan semua pengguna sebagai "Pembaca" (baris 43), menyembunyikan nama asli dan avatar. `user_id` hanya tersimpan di DB untuk keperluan moderasi. Sesuai keputusan [22-05-2026].

---

#### I-08: Design System Konsisten

Palette 5 warna (`#0D0D0D`, `#F5F4F0`, `#C90203`, `#002EC7`, `#5C8F6E`) dikonfigurasi di `tailwind.config.ts` dan CSS variables di `globals.css`. Font Libre Baskerville + Helvetica diterapkan konsisten. Tidak ada deviasi dari design system yang terdokumentasi.

---

## TECHNICAL DEBT

| ID | Deskripsi | Effort | Prioritas |
|---|---|---|---|
| TD-01 | Implementasi rate limiting (T-01) | Medium | Tinggi |
| TD-02 | Migrasi `getSession()` → `getUser()` (T-02) | Rendah | Tinggi |
| TD-03 | Buat sitemap.ts + robots.ts (S-01) | Rendah | Sedang |
| TD-04 | Buat error.tsx + not-found.tsx (S-02) | Rendah | Sedang |
| TD-05 | Tambah rehype-sanitize untuk opinions (S-03) | Rendah | Sedang |
| TD-06 | Fix useMemo di CommentsSection (S-04) | Rendah | Sedang |
| TD-07 | Hapus debug log service key (S-05) | Trivial | Sedang |
| TD-08 | Naikkan polling interval + backoff (S-06) | Medium | Sedang |
| TD-09 | Ekstrak generateSlug ke lib/ (S-07) | Trivial | Rendah |
| TD-10 | Hapus dead code EditorTextarea, EditorToolbar, OpinionPreview (R-02, R-04) | Trivial | Rendah |
| TD-11 | Ganti `<a>` → `<Link>` di Navbar (R-03) | Trivial | Rendah |

---

## KEKUATAN PROYEK

1. **Dokumentasi luar biasa** — README.md berfungsi sebagai CONTEXT.md dengan 1.288 baris yang mencakup seluruh keputusan arsitektur, alasan, dan alternatif yang ditolak. Ini adalah standar emas untuk proyek AI-assisted.

2. **Keamanan dasar solid** — Service role key hanya server-side, admin routes dilindungi `isAdmin()`, RLS aktif di semua tabel (berdasarkan dokumentasi), auth guard di layout admin.

3. **Arsitektur Server/Client yang benar** — Pembagian Server Component vs Client Component sudah tepat: `ArticleRenderer` (Server), `ChartBlock` (Client karena Canvas), `LikeButton` (Client karena interaktif), `ConditionalIndexStrip` (Client sebagai wrapper kondisional).

4. **Isolasi error** — `ArticleInteractions` sebagai wrapper Client Component mengisolasi error interaksi dari konten artikel. Try-catch di semua Client Component mencegah crash waterfall.

5. **Efisiensi free tier** — ISR, server-side caching, `force-dynamic` hanya di tempat yang perlu, dan `removeConsole` di production menunjukkan kesadaran akan keterbatasan infrastruktur.

6. **Zero third-party tracking** — Sangat konsisten dengan misi media independen dan mematuhi Zona Merah.

7. **Pendekatan hibrida gambar** — `<Image>` untuk Supabase, `<img>` untuk sumber eksternal — pragmatis dan skalabel.

8. **Single-Pass Render** — Arsitektur regex replacement untuk chart placeholder menghindari bug footnote cross-reference yang terjadi pada pendekatan `.split()`. Solusi elegan.

---

## CATATAN UNTUK SESI CODING BERIKUTNYA

### Prioritas 1 (Harus sebelum scaling)
- [ ] Implementasi rate limiting minimal (in-memory atau Vercel KV jika ada) di `/api/comments`, `/api/likes`, `/api/opinions`, `/api/shares`
- [ ] Ganti `getSession()` → `getUser()` di `app/api/comments/route.ts`
- [ ] Hapus console.log debug di `app/api/likes/count/route.ts` baris 21 dan 30

### Prioritas 2 (SEO & UX)
- [ ] Buat `app/sitemap.ts` yang query semua artikel published + semua opinions published
- [ ] Buat `app/robots.ts` (allow all crawlers)
- [ ] Buat `app/not-found.tsx` (halaman 404 kustom)
- [ ] Buat `app/error.tsx` (global error boundary)

### Prioritas 3 (Code health)
- [ ] Tambah `useMemo` pada `createClient()` di `CommentsSection.tsx`
- [ ] Ekstrak `generateSlug()` ke `lib/slug.ts`
- [ ] Hapus/deprecate `EditorTextarea.tsx`, `EditorToolbar.tsx`, `OpinionPreview.tsx`
- [ ] Ganti `<a href="/">` dengan `<Link href="/">` di `Navbar.tsx`
- [ ] Pertimbangkan `rehype-sanitize` di `OpinionContentRenderer.tsx`
- [ ] Naikkan polling interval IndexStrip ke 30-60 detik + tambahkan backoff

### Keputusan yang TIDAK perlu diubah
- Pola admin client (service_role) sudah benar
- ISR strategy sudah tepat untuk masing-masing halaman
- Pemisahan editorial vs opinions sudah rapi
- Keep-alive + backup strategy sudah memadai
- Design system konsisten dan terdokumentasi

---

## KEPATUHAN TERHADAP ZONA MERAH

| Aturan Zona Merah | Status |
|---|---|
| Autoplay video/audio | ✅ Tidak ditemukan |
| Infinite scroll tanpa kontrol | ✅ Tidak ditemukan |
| Pop-up / interstitial | ✅ Tidak ditemukan |
| Tracking pihak ketiga | ✅ Tidak ditemukan |
| Service_role key di client | ✅ Tidak ditemukan |
| Tabel tanpa RLS | ✅ Semua tabel memiliki RLS (berdasarkan README) |
| Engagement bait / clickbait | ✅ Like count dihapus dari UI publik |
| Dark patterns | ✅ Tidak ditemukan |

---

## KEPATUHAN TERHADAP KEPUTUSAN ARSITEKTUR (SEKSI 11)

Semua keputusan arsitektur yang tercatat di Seksi 11 README telah diverifikasi implementasinya dan konsisten dengan kode aktual. Tidak ditemukan inkonsistensi antara keputusan yang terdokumentasi dan implementasi di codebase.

---

*Laporan ini dibuat berdasarkan analisis struktural kode sumber. Auditor tidak menjalankan Lighthouse, PageSpeed Insights, atau tool runtime lainnya. Semua temuan berdasarkan inspeksi kode statis.*
