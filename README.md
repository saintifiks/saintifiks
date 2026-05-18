# CONTEXT.md — Saintifiks Project Bible
> Versi: 0.1 | Status: Pra-development | Terakhir diperbarui: [ISI TANGGAL SETIAP UPDATE]

---

## ⚠️ INSTRUKSI WAJIB UNTUK AI YANG MEMBACA DOKUMEN INI

Kamu adalah asisten coding untuk proyek Saintifiks. Sebelum melakukan apapun, baca seluruh dokumen ini. Dokumen ini adalah satu-satunya sumber kebenaran tentang proyek ini.

**Aturan yang tidak boleh dilanggar:**
1. Jangan ubah keputusan arsitektur yang sudah tercatat di bagian KEPUTUSAN ARSITEKTUR tanpa konfirmasi eksplisit dari pemilik proyek.
2. Jangan "perbaiki" kode yang tidak berkaitan dengan permintaan saat ini, meskipun kamu melihat ada yang bisa dioptimasi.
3. Setiap kali ada konflik antara permintaan baru dan keputusan yang sudah ada di dokumen ini, laporkan konfliknya dulu — jangan selesaikan sendiri.
4. Jika kamu tidak yakin dengan konteks kenapa suatu kode ada, tanya dulu — jangan asumsi.
5. Setiap sesi yang menghasilkan keputusan arsitektur baru, CONTEXT.md harus diperbarui di bagian LOG SESI.
6. Kerjakan satu file per respons. Jangan loncat-loncat antarfile dalam satu respons kecuali diminta eksplisit.
7. Setiap perubahan disertai penjelasan: apa yang berubah, kenapa, dan apa yang harus ditest.

**Yang harus kamu hasilkan sebelum menulis kode apapun:**
- Impact analysis: file mana yang tersentuh, file mana yang tidak boleh tersentuh.
- Conflict check: apakah permintaan bertentangan dengan keputusan yang sudah ada?
- Urutan implementasi yang aman.
- Konfirmasi dari pemilik bahwa plan disetujui.

---

## 1. IDENTITAS PROYEK

**Nama:** Saintifiks
**Tipe:** Media independen berbasis web
**Bahasa konten:** Indonesia
**Audiens:** Pembaca dewasa Indonesia yang peduli pada kualitas informasi publik
**Status saat ini:** Pra-development — arsitektur sedang dirancang, belum ada kode yang ditulis

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

## 3. PRINSIP EDITORIAL (Ringkasan — relevan untuk keputusan desain)

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
| 11 | Akuntabilitas kalkulus editorial | [Tidak ada implikasi teknis langsung saat ini] |

---

## 4. ZONA MERAH (Yang TIDAK boleh diimplementasikan)

- Tidak ada autoplay konten apapun.
- Tidak ada infinite scroll tanpa kontrol jelas dari pengguna.
- Tidak ada notifikasi push agresif.
- Tidak ada tracking perilaku yang dijual ke pihak ketiga.
- Tidak ada iklan display dari jaringan iklan eksternal.
- Tidak ada judul yang dioptimasi untuk klik bukan untuk akurasi (sistem tidak boleh mendorong ini).

---

## 5. ARSITEKTUR TEKNIS

### Stack yang Diputuskan
| Komponen | Teknologi | Alasan |
|----------|-----------|--------|
| Frontend | Next.js (App Router) | SSG/SSR untuk SEO, React ecosystem, AI-friendly |
| Hosting frontend | Vercel | Free tier cukup, deploy otomatis dari GitHub, CDN global |
| Backend / Database | Supabase | PostgreSQL + Auth + Storage dalam satu platform, free tier, portable |
| Version control | GitHub | Wajib — sebagai sumber kebenaran kode dan memori proyek |
| Visualisasi data | Chart.js (custom blocks terintegrasi) | Dipilih untuk fleksibilitas penuh dan kontrol atas visualisasi data ekonomi yang kompleks |
| Styling | Tailwind CSS | Utility-first, AI-friendly, konsisten dengan Next.js ecosystem |
| Auth pembaca | Supabase Auth + Google OAuth | Login via Google, tidak perlu buat akun baru — Supabase menangani seluruh flow |

### Keputusan yang Masih Terbuka (harus diselesaikan sebelum coding dimulai)
- [ ] **Editor artikel admin:** TipTap, Notion-like editor, atau Markdown + preview?

### Batasan Free Tier yang Harus Diperhatikan
- **Supabase:** Project dihibernasi jika tidak ada aktivitas selama 7 hari. **Solusi wajib:** Cron job di Vercel yang query ringan ke database setiap 3 hari. Ini harus diimplementasikan sebelum proyek diluncurkan.
- **Vercel:** 100GB bandwidth/bulan di free tier. Cukup untuk puluhan ribu pembaca.
- **GitHub:** Repo publik gratis unlimited. Untuk repo privat ada batas tapi cukup untuk proyek ini.

---

## 6. DATABASE SCHEMA

> Status: BELUM DIBUAT. Bagian ini diisi setelah keputusan di Seksi 5 diselesaikan dan database pertama kali dibuat di Supabase.

### Tabel yang Direncanakan
```
articles          — konten artikel, metadata, status publikasi
article_charts    — konfigurasi Chart.js per artikel (type, data, options sebagai JSON)
likes             — data interaksi likes pembaca
comments          — komentar (jika fitur ini diimplementasikan)
analytics_events  — event tracking internal (page view, scroll depth, dll)
users             — akun pembaca (jika sistem login diimplementasikan)
```

**Catatan chart:** Setiap artikel bisa memiliki satu atau lebih chart. Config Chart.js (type, data, options) disimpan sebagai JSON di tabel `article_charts`, di-render client-side via Chart.js saat halaman artikel dibuka. Chart bersifat interaktif (hover, tooltip, zoom jika diaktifkan).

### Aturan RLS (Row Level Security) — WAJIB
- **Setiap tabel baru yang dibuat di Supabase WAJIB memiliki RLS policy.**
- Tanpa RLS, tabel bisa diakses publik via Supabase API. Ini adalah risiko keamanan kritis.
- Default rule: baca publik untuk konten yang dipublikasikan, tulis hanya untuk admin yang terautentikasi.
- Ini adalah aturan yang tidak bisa dikompromikan. Jika AI membuat kode untuk tabel baru tanpa RLS, itu adalah bug kritis.

### Schema Detail
```sql
-- [BELUM DIISI — akan diisi setelah database pertama dibuat]
-- Format pengisian:
-- CREATE TABLE nama_tabel (
--   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
--   ...
-- );
-- ALTER TABLE nama_tabel ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "..." ON nama_tabel FOR SELECT USING (...);
```

---

## 7. STRUKTUR FILE

> Status: BELUM ADA — akan diisi setelah repo GitHub dibuat dan Next.js di-scaffold.

```
[AKAN DIISI — format contoh:]
/
├── app/
│   ├── (public)/
│   │   ├── page.tsx              — Halaman beranda
│   │   ├── artikel/[slug]/       — Halaman artikel
│   │   └── ...
│   ├── (admin)/
│   │   ├── dashboard/            — Panel admin
│   │   └── ...
│   └── api/
│       └── ...                   — API routes
├── components/
│   ├── ui/                       — Komponen UI generik
│   └── artikel/                  — Komponen spesifik artikel
├── lib/
│   ├── supabase/                 — Supabase client dan helpers
│   └── utils/                   — Utilitas umum
└── CONTEXT.md                    — Dokumen ini
```

---

## 8. KONVENSI KODE

> Status: BELUM DITETAPKAN. Akan diisi setelah scaffold pertama dibuat. Konvensi ini harus konsisten di seluruh proyek — AI harus mengikutinya tanpa exception.

```
Naming files:    [BELUM DIISI]
Naming vars:     [BELUM DIISI]
Naming DB cols:  [BELUM DIISI — snake_case direkomendasikan]
Component style: [BELUM DIISI]
API routes:      [BELUM DIISI]
Error handling:  [BELUM DIISI]
```

---

## 9. FITUR YANG SUDAH DIIMPLEMENTASIKAN

> Status: Tidak ada. Proyek belum mulai.

- [x] Setup repo GitHub (sudah ada, README sudah ada)
- [ ] CONTEXT.md di-commit ke repo GitHub
- [ ] Next.js scaffold di Vercel
- [ ] Supabase project dibuat
- [ ] Cron job keep-alive Supabase
- [ ] Halaman artikel (read-only, tanpa admin)
- [ ] Schema database dasar
- [ ] RLS policies
- [ ] Sistem likes
- [ ] Google OAuth (Supabase Auth)
- [ ] Panel admin
- [ ] Editor artikel
- [ ] Sistem chart/visualisasi
- [ ] Analytics internal
- [ ] Halaman beranda
- [ ] Navigasi
- [ ] SEO metadata
- [ ] Koreksi artikel (publik)

---

## 10. MASALAH YANG DIKETAHUI

> Tidak ada masalah yang tercatat — proyek belum berjalan.

Format pengisian:
```
[TANGGAL] MASALAH: [deskripsi]
           STATUS: [open / in progress / resolved]
           WORKAROUND: [solusi sementara jika ada]
```

---

## 11. KEPUTUSAN ARSITEKTUR (LOG)

> Setiap keputusan non-obvious harus dicatat di sini: apa keputusannya, kenapa dipilih, dan apa alternatif yang ditolak beserta alasannya.

```
[TANGGAL] KEPUTUSAN: Next.js App Router (bukan Pages Router)
           ALASAN: App Router adalah standar Next.js saat ini, SSG dan SSR lebih mudah dikonfigurasi
           ALTERNATIF DITOLAK: Pages Router (legacy), Vite/React tanpa framework (tidak ada SSR built-in)

[TANGGAL] KEPUTUSAN: Supabase sebagai backend
           ALASAN: PostgreSQL + Auth + Storage dalam satu platform, free tier yang generous, data bisa di-export kapan saja (tidak vendor-locked)
           ALTERNATIF DITOLAK: Firebase (NoSQL kurang cocok untuk konten artikel yang relasional), PlanetScale (tidak ada Auth built-in)

[TANGGAL] KEPUTUSAN: GitHub sebagai version control
           ALASAN: Free, standar industri, UIthub bisa membaca repo ini untuk konteks AI
           CATATAN: UIthub (uithub.com) digunakan untuk memberi AI konteks kode di setiap sesi

[Pra-dev] KEPUTUSAN: Google OAuth via Supabase Auth sebagai sistem login pembaca
           ALASAN: Pembaca tidak perlu buat akun baru, cukup akun Google yang sudah dimiliki; Supabase Auth menangani seluruh flow tanpa kode auth dari nol; konsisten dengan keputusan Supabase sebagai backend
           ALTERNATIF DITOLAK: Fingerprint anonim (data kurang akurat, tidak bisa identifikasi user lintas device/browser), email-password (friction tinggi, butuh sistem password reset)
           CATATAN IMPLEMENTASI: Setup di Google Cloud Console → buat OAuth 2.0 Client ID → paste ke Supabase Dashboard → Authentication → Providers → Google. Tabel `users` otomatis terisi oleh Supabase Auth saat user pertama kali login.

[TAMBAH KEPUTUSAN BARU DI SINI]

[Pra-dev] KEPUTUSAN: Chart.js sebagai sistem visualisasi data
           ALASAN: Fleksibilitas penuh untuk chart analisis ekonomi yang kompleks dan interaktif; kontrol penuh atas tampilan dan behavior; tidak bergantung pada layanan pihak ketiga
           ALTERNATIF DITOLAK: Datawrapper embed (lebih mudah tapi terbatas customization, bergantung pada server Datawrapper)
           CATATAN IMPLEMENTASI: Config chart (type, data, options) disimpan sebagai JSON di tabel article_charts di Supabase; di-render client-side; satu artikel bisa punya banyak chart

[Pra-dev] KEPUTUSAN: Tailwind CSS sebagai styling
           ALASAN: Utility-first, konsisten dengan ekosistem Next.js, sangat AI-friendly (AI memiliki training data yang kuat untuk Tailwind), tidak butuh file CSS terpisah
           ALTERNATIF DITOLAK: CSS modules (lebih verbose), styled-components (overhead runtime)
           CATATAN IMPLEMENTASI: Gunakan Tailwind v3 (bukan v4 yang masih baru); konfigurasi tema di tailwind.config.ts
```

---

## 12. LOG SESI

> Setiap sesi coding yang menghasilkan perubahan signifikan atau keputusan baru harus dicatat di sini. Ini adalah memori kronologis proyek.

```
Format:
[TANGGAL] SESI #N
Tujuan sesi: [apa yang ingin dicapai]
Yang dikerjakan: [file/fitur yang disentuh]
Keputusan yang dibuat: [keputusan baru yang harus masuk ke Seksi 11]
Status akhir: [selesai / terhenti di / butuh dilanjutkan dari]
---
```

> Belum ada sesi yang tercatat.

---

## 13. REFERENSI & RESOURCE

| Resource | URL | Kegunaan |
|----------|-----|---------|
| GitHub README | github.com/[ISI USERNAME]/[ISI NAMA REPO] | Isi CONTEXT.md ini ada di README repo — bukan file terpisah |
| UIthub | uithub.com/[ISI USERNAME]/[ISI NAMA REPO] | Konversi repo ke teks untuk konteks AI per sesi |
| Supabase Docs | supabase.com/docs | Referensi teknis backend |
| Next.js Docs | nextjs.org/docs | Referensi framework frontend |
| Vercel Docs | vercel.com/docs | Referensi hosting dan cron job |
| Supabase Dashboard | app.supabase.com | Manajemen database dan auth |
| Google Cloud Console | console.cloud.google.com | Setup OAuth credentials untuk Google Login |

### Cara Setup Google OAuth (untuk referensi cepat)
1. Buka console.cloud.google.com → buat project baru
2. APIs & Services → Credentials → Create OAuth 2.0 Client ID
3. Application type: Web application
4. Authorized redirect URIs: `https://[project-ref].supabase.co/auth/v1/callback`
5. Copy Client ID dan Client Secret
6. Supabase Dashboard → Authentication → Providers → Google → paste keduanya

---

*Dokumen ini hidup di README repo GitHub dan harus diperbarui setiap sesi coding. Versi yang tidak diperbarui adalah versi yang berbahaya.*
