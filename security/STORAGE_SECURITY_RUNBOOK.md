# Saintifiks Storage Security Runbook

## Status
- Safe Staging Processor & Magic Byte Verifier: `DONE` (`lib/security/upload-processing.ts`)
- Storage RLS Policy Introspection: `BLOCKED_MISSING_EVIDENCE` (Supabase credentials unconfigured in local runner)
- Automated Antivirus / Malware Sandbox: `BLOCKED_EXTERNAL` (Pending external scanning provider)

---

## Target Upload Architecture
1. **Client Request:** Authenticated author initiates upload request with file metadata.
2. **Server-Side Validation:**
   - Enforce 5 MiB ceiling.
   - Verify magic bytes (JPEG, PNG, WebP only). Reject SVG, HTML, PDF.
   - Strip metadata / EXIF tags.
   - Compute SHA-256 content digest.
3. **Quarantine Storage Pipeline:**
   - Store incoming payload in private quarantine bucket (`storage/quarantine`).
   - Run asynchronous scanner / verified trusted re-encoding.
   - Move sanitized file to public bucket under immutable key `sha256/<prefix>/<digest>.<ext>`.
4. **Content-Disposition & Headers:**
   - Serve non-image files as `attachment`.
   - Send `X-Content-Type-Options: nosniff`.
