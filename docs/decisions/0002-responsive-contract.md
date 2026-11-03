# 0002 — Kontrak responsif (mobile-first)

Tanggal: 2026-11-03 · Status: berlaku

Situs dirancang ponsel dulu, lalu diperluas. Setiap halaman baru diperiksa pada lebar dan orientasi berikut sebelum dinyatakan selesai.

## Lebar yang diperiksa
| Lebar | Mewakili | Yang dicek |
|---|---|---|
| 320 | ponsel terkecil | tidak ada gulir horizontal; header tidak bertabrakan |
| 360 · 390 · 414 | ponsel umum | wordmark rata tengah; target sentuh ≥ 44px |
| 768 | tablet potret | gambar tidak lebih tinggi dari 1/2 lebar; tidak ada kolom kosong lebar |
| 1024 | tablet lanskap / laptop kecil | kolom samping tidak terlalu sempit (judul ≤ 4 baris) |
| 1280 | desktop | rel aksi artikel muncul (breakpoint `xl`) |
| 1440 · 1920 | desktop lebar | konten tetap di dalam kontainer maksimal; tidak melebar |
| 844 × 390 | ponsel lanskap | header tidak menempel; area baca tidak habis |

## Aturan
1. **Mobile-first:** kelas dasar untuk ponsel, varian `sm:` `md:` `lg:` `xl:` menambah. Jangan menulis desktop dulu lalu mengecilkan.
2. **Hover hanya untuk perangkat dengan kursor** (`future.hoverOnlyWhenSupported`). Jangan menaruh informasi atau fungsi di balik hover.
3. **Target sentuh minimal 44 × 44 px** untuk semua kontrol interaktif.
4. **Aksi utama di zona jempol** pada ponsel (bilah di dasar layar), bukan di pojok atas.
5. **Elemen menempel** (header, bilah aksi) dihitung terhadap tinggi layar; pada layar pendek lanskap header dilepas.
6. Pengujian cepat: `/dev/home-preview` dan `/dev/article-preview` (lihat parameter di berkas masing-masing) pada lebar di atas. Cari `document.documentElement.scrollWidth > innerWidth` untuk gulir horizontal.
7. **Lapisan modal (menu, panel, dialog) selalu di tingkat akar** (portal ke `<body>` atau saudara dari `<header>`), tidak boleh di dalam elemen `sticky`/`fixed`/ber-`z-index`: elemen itu membuat konteks tumpukan sendiri sehingga `z-modal` di dalamnya tidak pernah menang atas elemen lain di luar. (Bug 2026-11-03: bilah aksi artikel tampil di atas menu layar penuh.)
