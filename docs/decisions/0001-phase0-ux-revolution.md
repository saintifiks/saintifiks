# 0001 — Fase 0: kunci arah perombakan UI/UX

Tanggal: 2026-11-03 · Status: **sementara** (default ★ dari audit; menunggu konfirmasi owner per butir)
Rujukan: `UIUX REVOLUTION/AUDIT_DAN_STRATEGI_UIUX.md`

## Pembekuan fitur (berlaku sampai Fase 2 selesai)
Tidak ada fitur baru. Diizinkan: perbaikan bug, perbaikan keamanan, konten, dan pekerjaan Fase 1–2 pada peta jalan. Alasan: fitur ditambah tanpa peta perjalanan adalah akar masalah #1 audit.

## Keputusan (default ★ — ubah dengan menyunting baris ini)
| # | Keputusan | Nilai sementara |
|---|---|---|
| D1 | Warna aksen | **Diubah 2026-11-03 atas arahan owner:** tanpa aksen. Palet = tinta, kertas, malam + satu merah (hanya galat/tindakan tak bisa dibatalkan). Warna sinyal sukses/peringatan/info dihapus; status dibedakan oleh bentuk penanda (berlian). `--color-sea-deep` kini alias ke ink. |
| D8a | Bahasa tombol & hover | **Ditetapkan 2026-11-03:** tombol utama = balok tinta bersudut tajam; tombol kedua = teks bergaris bawah tipis rata kiri; tanpa tombol kontur dan **tanpa ikon di dalam tombol**. Hover sederhana: balok tinta melunak jadi abu hangat, garis bawah menjadi penuh, ikon abu jadi tinta. Tanpa gerak isian/"tinta naik" (ditolak owner: performatif, mengganggu di dalam teks). Fokus formulir = garis menebal, bukan warna. |
| D2 | Font isi artikel | Libre Baskerville (Lora dibuang di Fase 1) |
| D3 | Nama fitur opini pembaca | "Argumen" (alamat `/argumen`, alihan dari `/opinions`) |
| D4 | Metode masuk | Google + tautan email |
| D5 | Bookstore | keluar dari alur utama sampai produk jelas; `CartProvider` dipindah ke layout toko |
| D6 | Komentar | tetap anonim "Pembaca" |
| D7 | Gambar khas dithered/halftone | ya (login + ilustrasi) |
| D8 | Bahasa sudut | tajam (0). Bulat hanya avatar |
| D9 | Basis data Argumen vs artikel | UI bersama dulu; database belakangan |
| D10 | Daftar Bacaan / buletin | Daftar Bacaan sekarang; buletin nanti |

## Hasil Fase 0 (keadaan 2026-11-03)
- Dokumen usang diarsipkan: `V2_HANDOVER_COMPREHENSIVE.md` → `docs/archive/`.
- Baseline skema inti diekspor: `supabase/baseline/` (belum disahkan sebagai migrasi; lihat README di sana).
- Advisor Supabase dijalankan; temuan keamanan kritis ditemukan (policy RLS terlalu longgar). Perbaikan diterapkan ke produksi 2026-11-03: `supabase/migrations/20261103101302_tighten_core_rls.sql`.
- `security/DATABASE_AUTHORIZATION_TARGET.md` berstatus "Live Database Inspection: BLOCKED". Sekarang ada bukti live; skema produksi menyimpang dari matriks target pada `articles`, `article_charts`, `article_corrections`, `opinion_corrections`, `comments`, `shares`.
