# Saintifiks Target Database Authorization Matrix

This document defines the target authorization, RLS policies, and privilege boundaries for all tables in the Saintifiks database.

## Status
- Live Database Inspection: `BLOCKED_MISSING_EVIDENCE` (Context only, credentials unconfigured in local runner)
- Target Model Specification: `DONE`

---

## Authorization Matrix

### 1. Editorial Core
| Table | Principal | Operations Allowed | Target Policy & Conditions |
|---|---|---|---|
| `articles` | `anon`, `authenticated` | `SELECT` | Only where `is_published = true`. |
| `articles` | `admin` (service_role / admin_memberships) | `SELECT`, `INSERT`, `UPDATE`, `DELETE` | Full editorial management. |
| `article_charts` | `anon`, `authenticated` | `SELECT` | Only where parent `article_id` is published. |
| `article_charts` | `admin` | `ALL` | Direct parent relation mutation. |
| `article_corrections` | `authenticated` | `INSERT` | Own correction only (`auth.uid() = user_id`). |
| `article_corrections` | `admin` | `SELECT`, `UPDATE` | Review and status updates (`pending`, `accepted`, `rejected`). |

### 2. Social & User Interactions
| Table | Principal | Operations Allowed | Target Policy & Conditions |
|---|---|---|---|
| `likes` / `opinion_likes` | `anon` | `SELECT` (aggregates) | Count only via intended view or RPC. |
| `likes` / `opinion_likes` | `authenticated` | `SELECT`, `INSERT`, `DELETE` | Own rows only (`auth.uid() = user_id`). |
| `comments` / `opinion_comments` | `anon` | `SELECT` | Published/approved comments only. |
| `comments` / `opinion_comments` | `authenticated` | `SELECT`, `INSERT`, `DELETE` | Own comment management (`auth.uid() = user_id`). |
| `shares` / `opinion_shares` | `authenticated` | `INSERT` | Own share records only (`auth.uid() = user_id`). |
| `user_profiles` | `anon`, `authenticated` | `SELECT` | Public attributes (username, display_name, avatar, bio). |
| `user_profiles` | `authenticated` (owner) | `UPDATE` | Own profile only (`auth.uid() = id`). |

### 3. User Opinions (UGC)
| Table | Principal | Operations Allowed | Target Policy & Conditions |
|---|---|---|---|
| `opinion_articles` | `anon` | `SELECT` | Published & visible opinions only (`is_published = true AND is_hidden = false`). |
| `opinion_articles` | `authenticated` (owner) | `SELECT`, `INSERT`, `UPDATE`, `DELETE` | Own drafts & published (`auth.uid() = author_id`). Cannot mutate `author_id`. |
| `opinion_articles` | `admin` / `moderator` | `SELECT`, `UPDATE` | Moderation (`is_hidden = true/false`). |
| `opinion_article_charts` | `authenticated` (owner) | `ALL` | Parent opinion article ownership required. |

### 4. Bookstore Catalog
| Table | Principal | Operations Allowed | Target Policy & Conditions |
|---|---|---|---|
| `authors`, `publishers`, `books`, `book_variants`, `categories` | `anon`, `authenticated` | `SELECT` | Active visible catalog only. |
| `authors`, `publishers`, `books`, `book_variants`, `categories` | `admin` | `ALL` | Administrative catalog management. |
| `inventory_ledger` | `anon`, `authenticated` | None | No direct access. |
| `inventory_ledger` | `admin` | `SELECT`, `INSERT` | Append-only ledger updates (no client UPDATE/DELETE). |

### 5. CMS & Editorial Studio
| Table | Principal | Operations Allowed | Target Policy & Conditions |
|---|---|---|---|
| `site_pages` | `anon`, `authenticated` | `SELECT` | Published pages only. |
| `site_page_revisions` | `anon`, `authenticated` | None | No draft/historical revision leak to PostgREST. |
| `site_page_revisions` | `admin` | `SELECT`, `INSERT` | Managed via strict RPC (`create_site_page_draft`, `publish_site_page`). |
| `editorial_studio_*` | `anon`, `authenticated` | None | Zero PostgREST direct access. |
| `editorial_studio_*` | `admin` | `ALL` via RPC | High-integrity publication snapshots and synchronized state. |

---

## Target SECURITY DEFINER Policy
1. All functions must declare `SECURITY DEFINER` with `SET search_path = ''`.
2. All relations must be fully qualified: `public.<table_name>`, `auth.uid()`.
3. Revoke generic execute:
   ```sql
   REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;
   REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM anon;
   ```
4. Grant execution only to exact intended roles (`authenticated` or `service_role`).
