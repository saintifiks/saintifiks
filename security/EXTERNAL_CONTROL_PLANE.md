# Saintifiks External Control Plane & Identity Matrix

This matrix tracks the state of external systems, infrastructure, DNS, and cloud provider configurations.

| Control Area | Target Requirement | Status | Verification / Blocker Note |
|---|---|---|---|
| Admin Hardware MFA | FIDO2/WebAuthn hardware key for Google & admin email | `BLOCKED_EXTERNAL` | Requires operator Google Workspace/Identity configuration. |
| Admin Recovery Account | Dedicated offline recovery account with break-glass MFA | `BLOCKED_EXTERNAL` | Requires organization identity configuration. |
| Supabase Org MFA | Mandatory MFA for Supabase dashboard members | `BLOCKED_EXTERNAL` | Requires Supabase organization settings enforcement. |
| Vercel Account MFA | Mandatory MFA & SAML SSO for Vercel deployment team | `BLOCKED_EXTERNAL` | Requires Vercel team security settings. |
| GitHub Branch Protection | Branch rulesets, signed commits, mandatory CI passing | `BLOCKED_EXTERNAL` | Requires GitHub repository settings admin action. |
| Registrar Hardware MFA | Domain registrar account protected by hardware MFA | `BLOCKED_EXTERNAL` | Operator registrar control plane. |
| Registry Lock | Registry Lock enabled on apex domain (`saintifiks.id`) | `BLOCKED_EXTERNAL` | Operator registrar/PANDI registry action. |
| DNSSEC | DNSSEC signed zone | `BLOCKED_EXTERNAL` | DNS provider zone setting. |
| CAA Records | CAA records restricting CA issuance to Let's Encrypt / DigiCert | `BLOCKED_EXTERNAL` | DNS zone configuration. |
| CT Monitoring | Certificate Transparency log monitoring alerts | `BLOCKED_EXTERNAL` | External monitoring setup. |
| DMARC Policy | `v=DMARC1; p=reject; rua=...` | `BLOCKED_EXTERNAL` | DNS TXT record deployment. |
| DKIM & SPF | Strict SPF (`-all`) and 2048-bit DKIM keys | `BLOCKED_EXTERNAL` | Mail provider / DNS record. |
| MTA-STS & TLS-RPT | Enforced SMTP TLS reporting and policy | `BLOCKED_EXTERNAL` | `_mta-sts` & `_smtp._tls` DNS TXT records. |
| Edge WAF | Layer 7 WAF with OWASP Core Rules & managed challenges | `BLOCKED_EXTERNAL` | Vercel Enterprise / Cloudflare WAF. |
| Distributed Rate Limiting | Edge/Redis-backed distributed request token buckets | `BLOCKED_EXTERNAL` | Edge middleware or external Redis store. |
| Database PITR | Continuous Point-in-Time Recovery enabled on Supabase | `BLOCKED_EXTERNAL` | Supabase project add-on settings. |
| Immutable Backups | WORM/GCS Object Lock off-platform backup replication | `BLOCKED_EXTERNAL` | Cloud storage backup pipeline. |
| KMS Publication Signer | Cloud KMS asymmetric key (Ed25519/ECDSA) for publication signing | `BLOCKED_EXTERNAL` | Cloud KMS IAM & key provisioning. |
| External Audit Sink | Tamper-resistant log streaming to Datadog/CloudWatch/Logflare | `BLOCKED_EXTERNAL` | External log drain configuration. |
| security.txt | RFC 9116 security contact URI | `BLOCKED_EXTERNAL` | Pending canonical operator security contact disclosure. |
