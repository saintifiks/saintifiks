# HANDOVER CONTEXT — Visual System V2 Migration

## 📋 STATUS SAAT INI
 
### ✅ SELESAI: Fase 1 - Fondasi Design System V2
Build sukses tanpa error. Semua perubahan fondasi sudah diterapkan di repositori asli (`c:\Users\putra\Projects\saintifiks`).
 
**File yang sudah diupdate:**
1. `tailwind.config.ts` - Token warna V2, font families (Marcellus), dark mode
2. `app/globals.css` - CSS custom properties, dark mode media query, utility classes
3. `app/layout.tsx` - Font loading (Marcellus, Source Serif 4, IBM Plex Sans, IBM Plex Mono)
4. `components/layout/Navbar.tsx` - Token migration + dark mode variants
 
### 🎯 PERUBAHAN YANG SUDAH AKTIF
- **Warna**: paper (#F7F5F0), ink (#1A1917), sea-deep (#0B5263), dll
- **Font**: Marcellus (display), Source Serif 4 (body), IBM Plex Sans (interface), IBM Plex Mono (mono)
- **Dark mode**: Otomatis via `prefers-color-scheme` (tidak ada toggle manual)
- **Utility classes**: .article-body, .kicker siap digunakan
 
---
 
## 🔄 YANG HARUS DILAKUKAN SELANJUTNYA
 
### Opsi A: Lanjut Migrasi Komponen (Fase 2-9)
Jika ingin melanjutkan migrasi lengkap Visual System V2 ke semua komponen:
 
#### Fase 2 - Layout Components (Belum dimulai)
- [ ] `components/layout/Footer.tsx` - Redesign + tambah link /tentang & /standar-editorial
- [ ] `components/layout/HomepageTabs.tsx` - Token migration (bg-paper, text-ink, dll)
- [ ] `app/page.tsx` - Homepage token migration + logo SVG update
 
#### Fase 3 - Red Zone Files (Token-only, no logic change)
- [ ] `components/artikel/ArticleRenderer.tsx` - Tambah .article-body class
- [ ] `components/artikel/LikeButton.tsx` - Token migration
- [ ] `components/artikel/CorrectionSection.tsx` - Token migration
- [ ] `components/widgets/IndexStrip.tsx` - bg-ink
- [ ] `components/widgets/IndexStripClient.tsx` - Token migration
 
#### Fase 4 - Artikel Components
- [ ] `components/artikel/ArticleInteractions.tsx`
- [ ] `components/artikel/CommentsSection.tsx` - ✅ SELESAI (Text visibility & interaction fixes)
- [ ] `components/artikel/ShareButton.tsx` - ✅ SELESAI (Text visibility & interaction fixes)
- [ ] `components/artikel/ChartBlock.tsx` - Update default Chart.js colors
 
#### Fase 5 - Komponen Baru
- [ ] Buat `components/artikel/ReadingProgressIndicator.tsx` (progress bar di artikel)
- [ ] Integrasi ke `app/artikel/layout.tsx`
 
#### Fase 6 - Opinions Platform
- [ ] `components/opinions/OpinionLabel.tsx`
- [ ] `components/opinions/AuthorByline.tsx`
- [ ] `components/opinions/OpinionCard.tsx`
- [ ] `components/opinions/OpinionContentRenderer.tsx`
- [ ] `components/opinions/OpinionLikeButton.tsx`
- [ ] `components/opinions/ReportButton.tsx`
- [ ] `app/opinions/page.tsx`
- [ ] `app/opinions/[username]/[slug]/page.tsx`
 
#### Fase 7 - Halaman Baru
- [ ] Buat `app/tentang/page.tsx` (stub konten)
- [ ] Buat `app/standar-editorial/page.tsx` (stub konten)
- [ ] Update `app/not-found.tsx` - Token migration
- [ ] Update `app/error.tsx` - Token migration
- [ ] Update `app/sitemap.ts` - Tambah /tentang & /standar-editorial
 
#### Fase 8 - Admin Pages
- [ ] `app/login/page.tsx` - Token migration
- [ ] `app/(admin)/dashboard/page.tsx` - Token migration (minimal)
 
#### Fase 9 - Final Verification
- [ ] `npm run build` - Pastikan 0 errors
- [ ] Visual review semua halaman
- [ ] Dark mode testing
- [ ] Mobile responsiveness check

### Opsi B: Deploy ke Production
Jika ingin deploy perubahan fondasi saja:
1. Commit perubahan: `git add . && git commit -m "feat: Visual System V2 - Foundation (Phase 1)"`
2. Push ke GitHub: `git push origin main`
3. Vercel akan auto-deploy dari main branch
4. Test di production: https://saintifiks.vercel.app

---

## 🎨 DESIGN SYSTEM V2 - REFERENSI CEPAT

### Color Tokens (Tailwind)
```typescript
colors: {
  paper:        { DEFAULT: '#F7F5F0', night: '#E8E4DC' },  // Background
  ink:          { DEFAULT: '#1A1917', night: '#0F1620' },  // Teks utama
  night:        '#0F1620',                                   // Background dark mode
  'warm-gray':  { DEFAULT: '#5A5750', night: '#8A8880' },  // Teks sekunder
  'sea-deep':   { DEFAULT: '#0B5263', light: '#3A9BB5' },  // Aksen utama
  amber:        { DEFAULT: '#C8972A', night: '#E8B84B' },  // Aksen kedua (jarang)
  'data-gray':  '#B8B4AE',                                  // Khusus chart
  'trend-up':   '#5C8F6E',                                  // IndexStrip naik
  'trend-down': '#C90203',                                  // IndexStrip turun
}
```

### Font Families (Tailwind)
```typescript
fontFamily: {
  display:   ['Marcellus', 'var(--font-display)', 'Georgia', 'serif'],
  body:      ['"Source Serif 4"', 'var(--font-body)', 'Georgia', 'serif'],
  interface: ['"IBM Plex Sans"', 'var(--font-interface)', 'Arial', 'sans-serif'],
  mono:      ['"IBM Plex Mono"', 'var(--font-mono)', '"Courier New"', 'monospace'],
  sans:      ['"IBM Plex Sans"', 'var(--font-interface)', 'Arial', 'sans-serif'],
}
```

### Custom Utilities
```typescript
maxWidth: { content: '680px' },
lineHeight: { reading: '1.75', deck: '1.6', heading: '1.4' },
fontSize: {
  kicker: ['11px', { lineHeight: '1.4', letterSpacing: '0.05em', fontWeight: '500' }],
  'body-base': ['18px', { lineHeight: '1.75' }],
  'display-base': ['40px', { lineHeight: '1.15', letterSpacing: '0.01em' }],
  // ... dan lainnya
}
```

### CSS Classes Baru (globals.css)
- `.article-body` - Wrapper artikel dengan tipografi V2
- `.kicker` - Label kecil di atas heading (IBM Plex Mono, uppercase)

---

## ⚠️ PENTING - RED ZONE FILES

File-file ini mengandung logika bisnis kritis. **HANYA boleh diubah token warnanya**, tidak ada perubahan logika:

- `components/artikel/ArticleRenderer.tsx` - Markdown rendering pipeline
- `components/artikel/LikeButton.tsx` - Like system dengan optimistic update
- `components/artikel/CorrectionSection.tsx` - Koreksi artikel
- `components/widgets/IndexStrip.tsx` - Widget indeks ekonomi
- `components/widgets/IndexStripClient.tsx` - Polling logic
- `app/(admin)/dashboard/artikel/` - Admin editorial workflow

**Aturan**: Jika perubahan menyentuh lebih dari class names (warna/font), WAJIB konfirmasi dulu.

---

## 🔧 CARA MELANJUTKAN

### 1. Untuk Development
```bash
npm run dev
# Buka http://localhost:3000
```

### 2. Untuk Testing Dark Mode
- DevTools → Rendering → Emulate CSS preference color-scheme → dark
- Atau ubah OS ke dark mode (Windows Settings → Personalization → Colors → Dark)

### 3. Untuk Build Production
```bash
npm run build
# Jika sukses, commit & push ke GitHub
git add .
git commit -m "feat: Visual System V2 - Phase X"
git push origin main
```

### 4. Untuk Rollback (jika ada masalah)
```bash
git revert HEAD  # Undo commit terakhir
git push origin main
# Atau restore file individual dari commit sebelumnya
```

---

## 📚 DOKUMENTASI REFERENSI

### File Konfigurasi Utama
- `tailwind.config.ts` - Semua token desain
- `app/globals.css` - CSS custom properties + utility classes
- `app/layout.tsx` - Font loading + metadata global

### Komponen yang Sudah Diupdate (Fase 1)
- `components/layout/Navbar.tsx` - Sudah menggunakan token V2

### Komponen yang Perlu Diupdate (Fase 2-9)
- Lihat checklist di atas untuk daftar lengkap

### File yang Tidak Boleh Disentuh Tanpa Konfirmasi
- Semua file di `app/api/` - Backend logic
- `lib/supabase/` - Database clients
- `lib/indices/` - Widget indeks logic
- `components/artikel/ArticleRenderer.tsx` - Markdown pipeline
- `components/widgets/IndexStrip*.tsx` - Polling system

---

## 🎯 PRIORITAS SELANJUTNYA

### Jika Ingin Lanjut Migrasi:
1. **Fase 2** - Layout components (Footer, HomepageTabs, app/page.tsx)
   - Ini yang paling terlihat oleh pengguna
   - Impact tinggi, risiko rendah

2. **Fase 3** - Red Zone files (ArticleRenderer, LikeButton, dll)
   - Hanya token migration, tidak ada perubahan logika
   - Perlu testing ekstra setelah setiap file

3. **Fase 7** - Halaman baru (/tentang, /standar-editorial)
   - Stub pages yang mudah dibuat
   - Tidak ada dependencies kompleks

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

---

## 📞 KONTEKS TAMBAHAN

### Kenapa Migrasi Ini Penting?
- Design system V2 lebih mature dan selaras dengan brand identity
- Dark mode adalah requirement dari brand guidelines
- Tipografi 4-lapis meningkatkan readability dan hierarchy
- Token-based approach memudahkan maintenance jangka panjang

### Apa yang Tidak Berubah?
- Semua logika bisnis (Supabase queries, API routes, auth)
- Database schema
- Vercel configuration
- Supabase Storage
- Analytics system
- Markdown rendering pipeline

### Performance Impact?
- Font loading dari Google Fonts (CDN cepat)
- Tidak ada bundle size increase signifikan
- Dark mode CSS hanya ~50 baris tambahan
- Build time tetap sama

---

## 🚀 QUICK START UNTUK OBROLAN BERIKUTNYA

Jika token obrolan ini habis dan ingin lanjut di sesi baru, copy-paste ini:

```
LANJUTKAN Visual System V2 Migration - Fase 1 sudah selesai (build sukses).

File yang sudah diupdate:
- tailwind.config.ts (token V2, Marcellus)
- app/globals.css (CSS vars, dark mode)
- app/layout.tsx (font loading V2)
- components/layout/Navbar.tsx (token migration)

File yang perlu diupdate selanjutnya (Fase 2):
- components/layout/Footer.tsx
- components/layout/HomepageTabs.tsx
- app/page.tsx

Lanjutkan dengan Fase 2 - mulai dari Footer.tsx.
```

---
 
**Dibuat**: 2026-05-30 04:07
**Diperbarui**: 2026-05-30 15:51
**Status**: Fase 1 ✅ SELESAI
**Next Step**: Lanjut Fase 2 atau Deploy ke Production