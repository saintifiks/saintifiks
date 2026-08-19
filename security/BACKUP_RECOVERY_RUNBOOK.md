# Saintifiks Backup & Disaster Recovery Runbook

## Status
- Repository GitHub Actions Backup Hardening: `DONE` (Full SHA pinned, least privilege, SHA-256 checksum)
- Isolated Database Restore Procedure: `DOCUMENTED`
- Continuous Point-in-Time Recovery (PITR): `BLOCKED_EXTERNAL` (Supabase project configuration)
- Multi-Cloud Offsite WORM / Object Lock Backup: `BLOCKED_EXTERNAL` (External cloud storage setup)

---

## 1. Automated Weekly Database Backup Workflow
- **Workflow Path:** `.github/workflows/backup.yml`
- **Trigger:** Automatic weekly execution (Sunday 00:00 UTC) + manual `workflow_dispatch`.
- **Security Protections:**
  - `permissions: contents: read` (zero unnecessary write access).
  - Pinned `actions/upload-artifact@4cec3d8aa04e39d1a68397de0c4cd6fb9dce8ec1` (`# v4.6.1`).
  - Strict shell execution: `set -euo pipefail`.
  - Database URL is never echoed to stdout/logs.
  - Generates immutable checksum: `database-backup.dump.sha256`.

---

## 2. Isolated Restore Drill Procedure (Staging / Verification)
> [!CAUTION]
> Never restore a backup directly into the active production database. Always verify backups in an isolated container or staging database first.

### Step 1: Verify Artifact Integrity
```bash
# Verify the SHA-256 checksum against the dump file
sha256sum -c database-backup.dump.sha256
```

### Step 2: Spin Up an Isolated PostgreSQL 17 Instance
```bash
docker run --name saintifiks-restore-test \
  -e POSTGRES_PASSWORD=restore_test_password \
  -e POSTGRES_DB=saintifiks_test \
  -p 54322:5432 \
  -d postgres:17
```

### Step 3: Execute pg_restore
```bash
pg_restore -h localhost -p 54322 -U postgres -d saintifiks_test -v database-backup.dump
```

### Step 4: Validate Data Invariants
```sql
-- Connect to the isolated test database
SELECT 'articles' AS table_name, count(*) FROM public.articles
UNION ALL
SELECT 'opinion_articles', count(*) FROM public.opinion_articles
UNION ALL
SELECT 'site_pages', count(*) FROM public.site_pages
UNION ALL
SELECT 'editorial_studio_documents', count(*) FROM public.editorial_studio_documents;
```

### Step 5: Clean Up Test Instance
```bash
docker stop saintifiks-restore-test && docker rm saintifiks-restore-test
```

---

## 3. Disaster Recovery Gap Analysis
1. **Supabase PITR:** Ensure Point-in-Time Recovery is enabled on the production Supabase instance to allow sub-minute recovery from accidental corruption or ransomware.
2. **Storage Bucket Objects:** PostgreSQL pg_dump stores metadata and relational tables, but uploaded binary objects in Supabase Storage (`artikel-gambar`, `opinion-images`) require separate object-level replication (e.g. AWS S3 / Cloudflare R2 backup sync).
3. **Independent Backup Identity:** Ensure the database backup credentials cannot be used to drop tables or mutate active production state.
