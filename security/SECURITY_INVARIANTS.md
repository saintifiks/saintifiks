# Saintifiks Security Invariants

These invariants are mandatory and non-negotiable across all code modifications and architectures.

## Authorization
1. Every mutation endpoint must perform its own authentication and authorization.
2. Admin layout is not an authorization boundary for Server Actions.
3. UI visibility is not authorization.
4. `robots.txt` is not authorization.
5. User A cannot access or mutate User B's private resources.
6. Owner identity must derive from server-side authenticated user context, never client request body.
7. Resource identity from URL/body must be validated before use.
8. Administrative mutations must fail closed.

## Secrets & Privileges
9. `SUPABASE_SERVICE_ROLE_KEY` must never be present in client bundles or Client Components.
10. Normal browsers must not obtain privileged credentials.
11. Secrets must never be logged.
12. Preview environments must not assume production secrets.
13. No local fallback secret generation.

## Database & RLS
14. No database policy or grant created on unverified assumptions.
15. RLS must default to deny for private resources.
16. `SECURITY DEFINER` must be an exception, requiring narrow schemas, explicit `search_path = ''`, and qualified relation names.
17. Privileged functions must not be executable by `PUBLIC`, `anon`, or `authenticated` unless explicitly intended.

## Content & Inputs
18. Persisted user-generated content is untrusted.
19. User content must never obtain script execution capabilities.
20. SVG/HTML uploads must not be served as active content on trusted origins.
21. MIME from browser headers is not proof of file type.
22. Unsafe transformations after sanitization are strictly forbidden.

## Deployment & Verification
23. Every security change must have automated tests.
24. A clean build alone is not proof of security.
25. Every migration must have documented verification and rollback.
26. Catastrophic-boundary changes must not be bundled into a single unverified commit.
