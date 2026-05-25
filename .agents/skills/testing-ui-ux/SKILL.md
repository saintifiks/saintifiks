---
name: testing-saintifiks-ui
description: Test UI/UX and CSS changes on Saintifiks. Use when verifying design system tokens, component styling, or visual changes.
---

# Testing Saintifiks UI/UX Changes

## Environment

- **Production site**: `https://saintifiks.vercel.app` — publicly accessible, shows current deployed code
- **Vercel preview deployments**: May be behind Vercel deployment protection (SSO login required). Check if accessible before relying on them.
- **Local dev server**: `npx next dev --port 3000` — requires Supabase env vars for article/opinion data

## Devin Secrets Needed

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL for local dev
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key for local dev

Without these, the homepage renders (navbar, footer, index strip, tabs) but article pages return 404 and article cards don't appear.

## Testing Strategy

### For CSS/design system changes
1. Run local dev server with `.env.local` containing Supabase credentials
2. Use browser DevTools console to verify computed CSS values:
   ```js
   const el = document.querySelector('selector');
   const styles = window.getComputedStyle(el);
   console.log(styles.fontSize, styles.color, styles.maxWidth);
   ```
3. Compare localhost (new code) vs production (old code) side-by-side
4. For CSS custom properties: `rootStyles.getPropertyValue('--token-name')`
5. For CSS rule verification: iterate `document.styleSheets` and check `cssRules`

### For component-level changes
- Homepage components (navbar, footer, index strip, tabs) render without Supabase
- Article cards, article pages, and OpinionCards require Supabase data
- If no Supabase access, verify CSS classes in source code match the spec

### Key selectors for common tests
- Index strip labels: `aside dl dt`
- Index strip values: `aside dl dd`
- Navbar brand: `nav a[href="/"]`
- Footer: `footer`, `footer p`, `footer > div`
- Homepage header: `main header`
- Tagline: `main header p` (the tagline text element)
- Tab container: `.border-b.border-border-subtle` (tab wrapper)
- Article card title: `section ul li a h2`
- Article body: `.article-content p`

### Focus ring testing
Tab-navigate to interactive elements, then verify:
```js
const focused = document.activeElement;
const styles = window.getComputedStyle(focused);
console.log(styles.boxShadow); // Should be rgba(0,46,199,0.12) 0px 0px 0px 3px
```

## Red Zone Components (DO NOT modify)
- `ArticleRenderer.tsx` — styling override via `.article-content` in globals.css
- `ChartBlock.tsx`
- `LikeButton.tsx`
- `CorrectionSection.tsx`

## Known Issues
- Vercel preview deployments might require Vercel SSO login — use localhost or production instead
- `next build` fails without Supabase env vars (SSG errors) but `next dev` works fine for visual testing
- Pre-existing lint warning in LikeButton.tsx (missing `supabase.auth` dependency in useEffect)

## Design Tokens Reference
| Token | Value |
|-------|-------|
| `--color-text-primary` | `#1A1A1A` |
| `--color-text-secondary` | `#6B6B6B` |
| `--color-text-muted` | `#9A9A9A` |
| `--color-border-subtle` | `#E2E0DC` |
| `--color-border-default` | `#D8D6D2` |
| `--font-body-size` | `17px` |
| `--font-body-line-h` | `1.72` |
| `--article-measure` | `68ch` |
| `accent-blue` | `#002EC7` |
| `primary-dark` | `#0D0D0D` |
| `primary-light` | `#F5F4F0` |
