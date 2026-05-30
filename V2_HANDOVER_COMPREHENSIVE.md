# MASTER HANDOVER — Visual System V2 Migration

**Dibuat untuk**: AI/Developer yang melanjutkan migrasi
**Status Proyek**: LIVE di https://saintifiks.vercel.app
**Bahasa**: Indonesia
**Framework**: Next.js 14 App Router
**Styling**: Tailwind CSS v3
**Backend**: Supabase (PostgreSQL + Auth + Storage)
**Hosting**: Vercel (Free Tier)

---

## ⚠️ PERINGATAN KRITIS

1. **PROYEK LIVE** — Terdapat pembaca aktif. Setiap error bisa mematikan halaman.
2. **BACA SEMUA DOKUMEN INI** sebelum menulis kode.
3. **JANGAN UBAH LOGIKA BISNIS** — Hanya visual (warna, font, spacing).
4. **IKUTI URUTAN** yang ditetapkan — tidak ada shortcut.

---

## 📋 STATUS SAAT INI (Per 30 Mei 2026, 15:51)
 
### ✅ SELESAI: Fase 1 - Fondasi Design System V2
- Build sukses tanpa error
- 4 file fondasi sudah diupdate
- Token warna V2 aktif
- Font Marcellus menggantikan Libre Baskerville
- Dark mode otomatis via prefers-color-scheme
 
### ✅ SELESAI: Fase 2 - Layout Components
- Build sukses (1 warning ESLint tidak kritis)
- Footer redesigned + link /tentang & /standar-editorial
- HomepageTabs token migration
- app/page.tsx token migration + logo SVG updated

### 📁 FILE YANG SUDAH DIUPDATE

1. **`tailwind.config.ts`**
   - ✅ Token warna V2 (paper, ink, night, warm-gray, sea-deep, amber, data-gray, trend-up, trend-down)
   - ✅ Font families V2 (Marcellus, Source Serif 4, IBM Plex Sans, IBM Plex Mono)
   - ✅ `darkMode: 'media'` (otomatis, tanpa toggle)
   - ✅ Custom utilities (maxWidth.content, lineHeight, fontSize tokens)

2. **`app/globals.css`**
   - ✅ CSS custom properties V2 di `:root`
   - ✅ `@media (prefers-color-scheme: dark)` media query
   - ✅ `.article-body` utility class
   - ✅ `.kicker` utility class
   - ✅ Legacy tokens dipertahankan untuk backward compatibility
   - ✅ `color-scheme: only light` DIHAPUS

3. **`app/layout.tsx`**
   - ✅ Import Marcellus, Source_Serif_4, IBM_Plex_Sans, IBM_Plex_Mono
   - ✅ Hapus `colorScheme: "only light"` dari metadata
   - ✅ Font variables di `<html>` className
   - ✅ Body className: `bg-paper text-ink font-interface antialiased`

4. **`components/layout/Navbar.tsx`**
   - ✅ Token warna V2 (bg-paper, text-ink, border-ink)
   - ✅ Font display untuk wordmark
   - ✅ Dark mode variants

5. **`components/layout/Footer.tsx`** *(Fase 2)*
   - ✅ Token warna V2 (bg-paper, border-ink/10, text-warm-gray)
   - ✅ Font interface (IBM Plex Sans)
   - ✅ Link navigasi: Beranda, Tentang, Standar Editorial

6. **`components/layout/HomepageTabs.tsx`** *(Fase 2)*
   - ✅ Token warna V2 (border-ink/10, text-ink, text-warm-gray, text-sea-deep)
   - ✅ Font families V2 (font-mono untuk tabs, font-display untuk judul, font-body untuk excerpt)
   - ✅ Text size tokens (text-kicker, text-meta, text-display-sm, text-body-base)

7. **`app/page.tsx`** *(Fase 2)*
    - ✅ Token warna V2 (bg-paper, border-ink/10, text-ink, text-warm-gray)
    - ✅ Font display untuk judul "Saintifiks"
    - ✅ Logo SVG updated dengan `currentColor` (responsive dark mode)
    - ✅ Text size tokens (text-display-lg, text-body-lg)
    - ✅ Improved text tracking for better readability (tracking-[0.05em])

---

## 🎯 APA YANG HARUS DILAKUKAN SELANJUTNYA

### OPSI A: Lanjut Migrasi Lengkap (Fase 2-9)

#### **Fase 2 - Layout Components** ✅ SELESAI
- [x] `components/layout/Footer.tsx` - Redesign + tambah link /tentang & /standar-editorial
- [x] `components/layout/HomepageTabs.tsx` - Token migration
- [x] `app/page.tsx` - Homepage token migration + logo SVG update

#### **Fase 3 - Red Zone Files** (Token-Only, NO LOGIC CHANGE)
- [ ] `components/artikel/ArticleRenderer.tsx` - Tambah .article-body class
- [ ] `components/artikel/LikeButton.tsx` - Token migration
- [ ] `components/artikel/CorrectionSection.tsx` - Token migration
- [ ] `components/widgets/IndexStrip.tsx` - bg-ink
- [ ] `components/widgets/IndexStripClient.tsx` - Token migration

#### **Fase 4 - Artikel Components**
- [ ] `components/artikel/ArticleInteractions.tsx`
- [ ] `components/artikel/CommentsSection.tsx` - ✅ SELESAI (Text visibility & interaction fixes)
- [ ] `components/artikel/ShareButton.tsx` - ✅ SELESAI (Text visibility & interaction fixes)
- [ ] `components/artikel/ChartBlock.tsx` - Update default Chart.js colors

#### **Fase 5 - Komponen Baru**
- [ ] Buat `components/artikel/ReadingProgressIndicator.tsx`
- [ ] Integrasi ke `app/artikel/layout.tsx`

#### **Fase 6 - Opinions Platform**
- [ ] `components/opinions/OpinionLabel.tsx`
- [ ] `components/opinions/AuthorByline.tsx`
- [ ] `components/opinions/OpinionCard.tsx`
- [ ] `components/opinions/OpinionContentRenderer.tsx`
- [ ] `components/opinions/OpinionLikeButton.tsx`
- [ ] `components/opinions/ReportButton.tsx`
- [ ] `app/opinions/page.tsx`
- [ ] `app/opinions/[username]/[slug]/page.tsx`

#### **Fase 7 - Halaman Baru**
- [ ] Buat `app/tentang/page.tsx` (stub)
- [ ] Buat `app/standar-editorial/page.tsx` (stub)
- [ ] Update `app/not-found.tsx`
- [ ] Update `app/error.tsx`
- [ ] Update `app/sitemap.ts`

#### **Fase 8 - Admin Pages**
- [ ] `app/login/page.tsx`
- [ ] `app/(admin)/dashboard/page.tsx`

#### **Fase 9 - Final Verification**
- [ ] `npm run build` (0 errors)
- [ ] Visual review semua halaman
- [ ] Dark mode testing
- [ ] Mobile responsiveness check

### OPSI B: Deploy ke Production (Fase 1 + 2)
1. Commit: `git add . && git commit -m "feat: Visual System V2 - Phase 1 & 2"`
2. Push: `git push origin main`
3. Vercel auto-deploy
4. Test di https://saintifiks.vercel.app

---

## 🎨 DESIGN SYSTEM V2 - REFERENSI LENGKAP

### Color Tokens (Tailwind Config)

```typescript
colors: {
  // Light Mode
  paper:        { DEFAULT: '#F7F5F0', night: '#E8E4DC' },  // Background
  ink:          { DEFAULT: '#1A1917', night: '#0F1620' },  // Teks utama
  night:        '#0F1620',                                   // Background dark mode
  'warm-gray':  { DEFAULT: '#5A5750', night: '#8A8880' },  // Teks sekunder
  'sea-deep':   { DEFAULT: '#0B5263', light: '#3A9BB5' },  // Aksen primer
  amber:        { DEFAULT: '#C8972A', night: '#E8B84B' },  // Aksen sekunder
  'data-gray':  '#B8B4AE',                                  // Khusus chart
  'trend-up':   '#5C8F6E',                                  // IndexStrip naik
  'trend-down': '#C90203',                                  // IndexStrip turun
}
```

### Font Families (Tailwind Config)

```typescript
fontFamily: {
  display:   ['Marcellus', 'var(--font-display)', 'Georgia', 'serif'],
  body:      ['"Source Serif 4"', 'var(--font-body)', 'Georgia', 'serif'],
  interface: ['"IBM Plex Sans"', 'var(--font-interface)', 'Arial', 'sans-serif'],
  mono:      ['"IBM Plex Mono"', 'var(--font-mono)', '"Courier New"', 'monospace'],
  sans:      ['"IBM Plex Sans"', 'var(--font-interface)', 'Arial', 'sans-serif'],
}
```

### Custom Utilities (Tailwind Config)

```typescript
maxWidth: { content: '680px' },
lineHeight: { reading: '1.75', deck: '1.6', heading: '1.4' },
fontSize: {
  kicker: ['11px', { lineHeight: '1.4', letterSpacing: '0.05em', fontWeight: '500' }],
  'kicker-lg': ['12px', { lineHeight: '1.4', letterSpacing: '0.05em', fontWeight: '500' }],
  meta: ['12px', { lineHeight: '1.4' }],
  caption: ['12px', { lineHeight: '1.5' }],
  'caption-lg': ['13px', { lineHeight: '1.5' }],
  'body-sm': ['16px', { lineHeight: '1.75' }],
  'body-base': ['18px', { lineHeight: '1.75' }],
  'body-lg': ['19px', { lineHeight: '1.75' }],
  'display-sm': ['32px', { lineHeight: '1.2', letterSpacing: '0.01em' }],
  'display-base': ['40px', { lineHeight: '1.15', letterSpacing: '0.01em' }],
  'display-lg': ['52px', { lineHeight: '1.1', letterSpacing: '0.01em' }],
}
```

### CSS Classes Baru (globals.css)

```css
.article-body {
  font-family: 'Source Serif 4', Georgia, serif;
  font-size: 18px;
  line-height: 1.75;
  color: var(--color-ink);
  max-width: 680px;
  margin-inline: auto;
}

.kicker {
  font-family: 'IBM Plex Mono', 'Courier New', monospace;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-sea-deep);
}
```

---

## ⚠️ RED ZONE FILES - JANGAN DISENTUH TANPA KONFIRMASI

File-file ini mengandung logika bisnis kritis. **HANYA boleh diubah token warnanya**, tidak ada perubahan logika:

| File | Yang Diizinkan | Yang Dilarang |
|------|----------------|---------------|
| `ArticleRenderer.tsx` | Ganti font class, token warna | remark/rehype pipeline, chart detection, image logic |
| `ChartBlock.tsx` | Update default Chart.js colors | dynamic import, registerables, SSR logic, JSON parsing |
| `LikeButton.tsx` | Ganti token warna class | useMemo, fetch logic, optimistic update, rollback logic |
| `CorrectionSection.tsx` | Ganti token warna class | form submit logic, state management |
| `IndexStrip.tsx` | bg-primary-dark → bg-ink | data fetching, snapshot logic |
| `IndexStripClient.tsx` | Ganti token warna container | polling logic, interval, tab visibility detection |
| `app/(admin)/dashboard/artikel/` | **JANGAN SENTUH SAMA SEKALI** | Semua file di folder ini |

**Aturan**: Jika perubahan menyentuh lebih dari class names (warna/font), WAJIB konfirmasi dulu.

---

## 📂 STRUKTUR PROYEK

```
saintifiks/
├── app/
│   ├── globals.css              ✅ DIUPDATE (V2 tokens, dark mode)
│   ├── layout.tsx               ✅ DIUPDATE (font loading V2)
│   ├── page.tsx                 ✅ DIUPDATE (Fase 2)
│   ├── not-found.tsx            ⏳ PERLU DIUPDATE (Fase 7)
│   ├── error.tsx                ⏳ PERLU DIUPDATE (Fase 7)
│   ├── sitemap.ts               ⏳ PERLU DIUPDATE (Fase 7)
│   ├── robots.ts                ✅ TIDAK PERLU UBAH
│   ├── artikel/
│   │   ├── layout.tsx           ⏳ PERLU DIUPDATE (Fase 5)
│   │   └── [slug]/page.tsx      ⚠️ RED ZONE (jangan sentuh)
│   ├── opinions/
│   │   ├── layout.tsx           ✅ TIDAK PERLU UBAH
│   │   ├── page.tsx             ⏳ PERLU DIUPDATE (Fase 6)
│   │   └── [username]/[slug]/page.tsx ⏳ PERLU DIUPDATE (Fase 6)
│   ├── login/page.tsx           ⏳ PERLU DIUPDATE (Fase 8)
│   ├── (admin)/dashboard/       ⚠️ RED ZONE (jangan sentuh)
│   └── api/                     ⚠️ RED ZONE (jangan sentuh)
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx           ✅ DIUPDATE (token V2)
│   │   ├── Footer.tsx           ✅ DIUPDATE (Fase 2)
│   │   ├── HomepageTabs.tsx     ✅ DIUPDATE (Fase 2)
│   │   ├── ConditionalIndexStrip.tsx ✅ TIDAK PERLU UBAH
│   │   └── ScrollToTop.tsx      ✅ TIDAK PERLU UBAH
│   ├── artikel/
│   │   ├── ArticleRenderer.tsx  ⚠️ RED ZONE (token only)
│   │   ├── ArticleInteractions.tsx ⏳ PERLU DIUPDATE (Fase 4)
│   │   ├── ChartBlock.tsx       ⚠️ RED ZONE (colors only)
│   │   ├── LikeButton.tsx       ⚠️ RED ZONE (token only)
│   │   ├── CorrectionSection.tsx ⚠️ RED ZONE (token only)
│   │   ├── CommentsSection.tsx  ✅ DIUPDATE (Fase 4 - Text visibility & interaction fixes)
│   │   ├── ShareButton.tsx      ✅ DIUPDATE (Fase 4 - Text visibility & interaction fixes)
│   │   └── ReadingProgress.tsx  ✅ SUDAH ADA (tidak perlu ubah)
│   ├── opinions/
│   │   ├── OpinionCard.tsx      ⏳ PERLU DIUPDATE (Fase 6)
│   │   ├── OpinionLabel.tsx     ⏳ PERLU DIUPDATE (Fase 6)
│   │   ├── AuthorByline.tsx     ⏳ PERLU DIUPDATE (Fase 6)
│   │   ├── OpinionContentRenderer.tsx ⏳ PERLU DIUPDATE (Fase 6)
│   │   ├── OpinionLikeButton.tsx ⏳ PERLU DIUPDATE (Fase 6)
│   │   ├── ReportButton.tsx     ⏳ PERLU DIUPDATE (Fase 6)
│   │   └── editor/
│   │       └── TipTapEditor.tsx ⏳ PERLU DIUPDATE (Fase 6)
│   └── widgets/
│       ├── IndexStrip.tsx       ⚠️ RED ZONE (token only)
│       ├── IndexStripClient.tsx ⚠️ RED ZONE (token only)
│       └── TrendIcon.tsx        ⏳ PERLU DIUPDATE (Fase 3)
├── lib/
│   ├── supabase/                ⚠️ RED ZONE (jangan sentuh)
│   └── indices/                 ⚠️ RED ZONE (jangan sentuh)
├── tailwind.config.ts           ✅ DIUPDATE (token V2, fonts)
├── tsconfig.json                ✅ TIDAK PERLU UBAH
├── next.config.mjs              ✅ TIDAK PERLU UBAH
├── package.json                 ✅ TIDAK PERLU UBAH
└── README.md (CONTEXT.md)       ⚠️ SUMBER KEBENARAN TEKNIS
```

---

## 🔧 CARA MELANJUTKAN

### 1. Development Mode
```bash
npm run dev
# Buka http://localhost:3000
```

### 2. Testing Dark Mode
- **DevTools**: Rendering → Emulate CSS preference color-scheme → dark
- **Windows**: Settings → Personalization → Colors → Dark
- **macOS**: System Preferences → General → Appearance → Dark

### 3. Build & Verification
```bash
# Setelah setiap file/fase selesai
npm run build

# Jika sukses, commit
git add .
git commit -m "feat: Visual System V2 - Phase X"
git push origin main
```

### 4. Rollback (Jika Ada Masalah)
```bash
# Undo commit terakhir
git revert HEAD
git push origin main

# Atau restore file individual
git checkout HEAD~1 -- path/to/file.tsx
```

---

## 📋 CHECKLIST VERIFIKASI SETELAH SETIAP FILE

Sebelum lanjut ke file berikutnya:

- [ ] `npm run build` sukses (exit code 0)
- [ ] Tidak ada TypeScript errors baru
- [ ] Tidak ada komponen yang jadi undefined/null
- [ ] Semua import yang dihapus tidak masih direferensi
- [ ] Visual review di dev server (halaman terkait masih berfungsi)
- [ ] Dark mode testing (jika komponen punya dark variant)

---

## 🎯 PRIORITAS SELANJUTNYA

### Jika Ingin Lanjut Migrasi:
1. **Fase 7** - Halaman baru (/tentang, /standar-editorial)
   - Stub pages sederhana
   - Tidak ada dependencies kompleks
   - Langsung bisa dilihat hasilnya

2. **Fase 3** - Red Zone files (ArticleRenderer, LikeButton, dll)
   - Hanya token migration, tidak ada perubahan logika
   - Perlu testing ekstra setelah setiap file
   - Impact tinggi karena halaman artikel adalah core product

### Jika Ingin Deploy Saja:
1. Test manual semua halaman di dev server
2. Commit perubahan
3. Push ke GitHub (Vercel auto-deploy)
4. Monitor Vercel deployment logs
5. Test di production URL

---

## 💡 TIPS PENTING

1. **Selalu test dark mode** setelah update komponen
2. **Jalankan `npm run build`** setelah setiap fase selesai
3. **Jangan edit logika** di Red Zone files - hanya class names
4. **Gunakan token V2** (paper, ink, sea-deep) bukan warna hardcoded
5. **Pertahankan backward compatibility** - legacy tokens masih ada di globals.css
6. **Baca CONTEXT.md** sebelum mengambil keputusan arsitektur
7. **Jangan sentuh API routes** - semua di `app/api/` adalah Red Zone
8. **Jangan sentuh Supabase logic** - semua di `lib/supabase/` adalah Red Zone
9. **Jangan sentuh widget indices** - semua di `lib/indices/` adalah Red Zone
10. **Jangan sentuh admin dashboard** - `app/(admin)/dashboard/artikel/` adalah Red Zone

---

## 🚀 QUICK START UNTUK OBROLAN BERIKUTNYA

Jika token obrolan ini habis dan ingin lanjut di sesi baru, copy-paste ini:

```
LANJUTKAN Visual System V2 Migration.

STATUS: Fase 1 (Fondasi) & Fase 2 (Layout Components) SUDAH SELESAI - build sukses.

FILE YANG SUDAH DIUPDATE:
- tailwind.config.ts (token V2, Marcellus)
- app/globals.css (CSS vars, dark mode)
- app/layout.tsx (font loading V2)
- components/layout/Navbar.tsx (token migration)
- components/layout/Footer.tsx (redesign + token migration)
- components/layout/HomepageTabs.tsx (token migration)
- app/page.tsx (token migration + logo SVG)

FILE YANG PERLU DIUPDATE SELANJUTNYA (Fase 3 - Red Zone):
- components/artikel/ArticleRenderer.tsx
- components/artikel/LikeButton.tsx
- components/artikel/CorrectionSection.tsx
- components/widgets/IndexStrip.tsx
- components/widgets/IndexStripClient.tsx

ATAU (Fase 7 - Halaman Baru):
- app/tentang/page.tsx
- app/standar-editorial/page.tsx

LANGKAH SELANJUTNYA: Lanjutkan dengan Fase 3 (Red Zone - token only, NO LOGIC CHANGE) atau Fase 7 (Halaman Baru).

PENTING:
- Jangan sentuh logika bisnis, hanya visual (warna, font)
- Jangan sentuh Red Zone files tanpa konfirmasi
- Setiap selesai file/fase, jalankan npm run build
- Test dark mode setelah setiap perubahan
```

---

## 📊 METRIK KEBERHASILAN

### Design System Verification

**Tipografi:**
- [ ] Wordmark "Saintifiks" menggunakan font-display (Marcellus)
- [ ] Body artikel menggunakan Source Serif 4, 18-19px, line-height 1.75
- [ ] Nav links menggunakan IBM Plex Sans
- [ ] Kicker menggunakan IBM Plex Mono, uppercase
- [ ] Tidak ada Libre Baskerville atau Helvetica sebagai font utama

**Warna:**
- [ ] Background: #F7F5F0 (paper)
- [ ] Teks utama: #1A1917 (ink)
- [ ] Aksen: #0B5263 (sea-deep)
- [ ] Tidak ada #002EC7 (accent-blue lama) di manapun
- [ ] IndexStrip background: #1A1917 (ink)

**Dark Mode:**
- [ ] Background berubah ke #0F1620 (night)
- [ ] Teks masih terbaca (kontras cukup)
- [ ] IndexStrip tidak berubah (tetap dark)
- [ ] Tidak ada color-scheme: only light

**Layout:**
- [ ] Content width artikel: 680px (max-w-content)
- [ ] Mobile padding: minimum 20px

**Aksesibilitas:**
- [ ] Heading hierarchy: H1 → H2 → H3
- [ ] Focus indicator terlihat
- [ ] Kontras teks: minimal 4.5:1 (WCAG AA)
- [ ] lang="id" di HTML root

**Regression Check:**
- [ ] Like button masih berfungsi
- [ ] Komentar masih bisa disubmit
- [ ] IndexStrip masih polling
- [ ] Login Google OAuth masih berfungsi
- [ ] Chart di artikel masih render
- [ ] Halaman admin masih bisa diakses
- [ ] TipTap editor masih berfungsi
- [ ] Callout box masih render
- [ ] Formula LaTeX masih render
- [ ] Syntax highlighting masih render
- [ ] Footnotes masih render

---

## 📞 KONTAK & DUKUNGAN

**Repository**: https://github.com/saintifiks/saintifiks
**Production**: https://saintifiks.vercel.app
**Documentation**: CONTEXT.md (README.md) di root repository

**Jika ada masalah:**
1. Cek CONTEXT.md untuk keputusan arsitektur
2. Cek error di terminal atau Vercel deployment logs
3. Rollback jika perlu: `git revert HEAD`
4. Test di dev server sebelum push

---

**Dibuat**: 30 Mei 2026, 04:11 WIB
**Diperbarui**: 30 Mei 2026, 16:07 WIB
**Status**: Fase 1 & 2 ✅ SELESAI, Fase 4 progres (CommentsSection, ShareButton selesai)
**Next Step**: Lanjut Fase 3 (Red Zone) / Fase 7 (Halaman Baru) / Deploy
**Build Status**: ✅ SUKSES (0 errors, 1 ESLint warning tidak kritis)
