# Saintifiks Security Implementation Ledger

This ledger inventories every attack surface, mutation endpoint, privileged client invocation, rendering pipeline, and abuse boundary.

## Inventory Summary
- **Route Handlers:** 18 API routes
- **Server Action Files:** 4 files (`app/(admin)/dashboard/bookstore/actions.ts`, `app/(admin)/dashboard/artikel/actions.ts`, `app/(admin)/dashboard/halaman/actions.ts`, `app/(admin)/dashboard/koreksi/actions.ts`)
- **Direct `createAdminClient` Callers:** 14 files
- **Render Pipelines:** 2 primary renderers (`ArticleRenderer.tsx`, `OpinionContentRenderer.tsx`)
- **Image Upload Integrations:** 4 components (`CoverImageUpload.tsx`, `ImageModal.tsx`, `StudioImageUpload.tsx`, `ImageUpload.tsx`)

---

## Surface Records

### Route Handlers & Server Actions

```text
ID: SA-BOOKSTORE-01
File: app/(admin)/dashboard/bookstore/actions.ts
Function/route: tambahPenulis
Method: Server Action (POST)
Authentication: None (Previously implicit session client)
Authorization: Missing requireAdmin() -> Hardened to explicit requireAdmin()
Database access: authors (INSERT)
Privilege used: Authenticated user session
Input: { name: string, biography: string }
Output: { sukses: true } | { error: string }
Current test: Static contract & bookstore mutation tests
Security dependency: WP-02, WP-06
Planned change: Inject fail-closed requireAdmin(), strict input bounds, error masking
Risk: Low blast radius (admin only)
Rollback: Revert to previous action file
Status: IN_PROGRESS
```

```text
ID: SA-BOOKSTORE-02
File: app/(admin)/dashboard/bookstore/actions.ts
Function/route: tambahPenerbit
Method: Server Action (POST)
Authentication: None (Previously implicit session client)
Authorization: Missing requireAdmin() -> Hardened to explicit requireAdmin()
Database access: publishers (INSERT)
Privilege used: Authenticated user session
Input: { name: string }
Output: { sukses: true } | { error: string }
Current test: Static contract & bookstore mutation tests
Security dependency: WP-02, WP-06
Planned change: Inject fail-closed requireAdmin(), strict input bounds, error masking
Risk: Low blast radius (admin only)
Rollback: Revert to previous action file
Status: IN_PROGRESS
```

```text
ID: SA-BOOKSTORE-03
File: app/(admin)/dashboard/bookstore/actions.ts
Function/route: tambahBuku
Method: Server Action (POST)
Authentication: None (Previously implicit session client)
Authorization: Missing requireAdmin() -> Hardened to explicit requireAdmin()
Database access: books (INSERT), book_variants (INSERT), inventory_ledger (INSERT)
Privilege used: Authenticated user session
Input: { title, author_id, publisher_id, description, editorial_take, cover_image_url, format, price_amount, stock_qty }
Output: { sukses: true } | { error: string }
Current test: Static contract & bookstore mutation tests
Security dependency: WP-02, WP-06
Planned change: Inject fail-closed requireAdmin(), strict UUID & enum bounds, non-negative price/stock, error masking
Risk: Low blast radius (admin only)
Rollback: Revert to previous action file
Status: IN_PROGRESS
```

```text
ID: SA-ARTIKEL-01
File: app/(admin)/dashboard/artikel/actions.ts
Function/route: buatArtikelBaru, updateArtikel, terbitkanArtikel, jadikanDraft
Method: Server Action (POST)
Authentication: None (Previously implicit session client)
Authorization: Missing requireAdmin() -> Hardened to explicit requireAdmin()
Database access: articles (INSERT/UPDATE), article_charts (INSERT/DELETE)
Privilege used: Authenticated user session
Input: Article payload and status updates
Output: { sukses: true } | { error: string }
Current test: Static contract & editorial tests
Security dependency: WP-02, WP-06
Planned change: Inject fail-closed requireAdmin(), strict slug/content bounds, error masking
Risk: Low blast radius (admin only)
Rollback: Revert to previous action file
Status: IN_PROGRESS
```

```text
ID: SA-HALAMAN-01
File: app/(admin)/dashboard/halaman/actions.ts
Function/route: saveSitePageDraft, publishSitePage, restoreSitePageRevision
Method: Server Action (POST)
Authentication: Checked
Authorization: requireAdmin()
Database access: site_pages, site_page_revisions via RPC
Privilege used: createAdminClient (service_role)
Input: Page CMS payload
Output: ActionResult
Current test: Site pages validation suite
Security dependency: WP-02, WP-05B, WP-06
Planned change: Route createAdminClient via CMS capability module
Risk: Low blast radius
Rollback: Revert action file
Status: IN_PROGRESS
```

```text
ID: API-ANALYTICS-01
File: app/api/analytics/route.ts
Function/route: POST /api/analytics
Method: POST
Authentication: Anonymous / Public
Authorization: Public reader event ingestion
Database access: analytics_events (INSERT)
Privilege used: Anonymous client
Input: { event_type, path, session_id, metadata }
Output: JSON { success: boolean }
Current test: Analytics rate limiting and schema tests
Security dependency: WP-06, WP-06B, WP-07
Planned change: Strict event type allowlist, string length bounds, metadata key allowlist & size ceiling
Risk: Low
Rollback: Revert route file
Status: IN_PROGRESS
```

```text
ID: API-AUTH-CALLBACK-01
File: app/auth/callback/route.ts
Function/route: GET /auth/callback
Method: GET
Authentication: OAuth code exchange
Authorization: Public callback
Database access: auth.exchangeCodeForSession
Privilege used: Anon server client
Input: code, next
Output: Redirect to destination
Current test: Security unit tests
Security dependency: WP-06D
Planned change: Strict destination allowlist, reject //, protocol schemes, control chars
Risk: Low
Rollback: Revert route file
Status: IN_PROGRESS
```
