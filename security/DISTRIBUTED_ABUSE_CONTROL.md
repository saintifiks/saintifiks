# Saintifiks Distributed Abuse Control & Rate Limiting Architecture

## Status
- Local In-Memory Throttling: `DONE` (Best-effort per-instance throttling)
- Distributed Global Rate Limiting: `BLOCKED_EXTERNAL_CONFIGURATION` (Pending Redis / Upstash / Edge WAF deployment)

---

## The Serverless State Boundary
In ephemeral serverless environments (e.g., Vercel / AWS Lambda), in-memory state (`new Map()`) is local to a single worker instance. Requests distributed across multiple serverless instances do not share state.

Therefore, true global abuse prevention must be enforced at either:
1. **Edge WAF Level:** Cloudflare WAF or Vercel Edge Middleware with Rate Limiting Rules.
2. **Distributed Data Store:** Upstash Redis or AWS ElastiCache token-bucket counters.

---

## Target Rate Limit Specifications

| Action / Endpoint | Identifier Key Format | Limit | Window | Action on Violation |
|---|---|---|---|---|
| Reader Comments (`/api/comments`) | `ip:<ip_prefix>:user:<user_id>` | 5 requests | 60 seconds | 429 Too Many Requests |
| Reader Likes (`/api/likes`) | `ip:<ip_prefix>:user:<user_id>` | 20 requests | 60 seconds | 429 Too Many Requests |
| Social Shares (`/api/shares`, `/api/opinion-shares`) | `ip:<ip_prefix>` | 5 requests | 60 seconds | 429 Too Many Requests |
| Reader Corrections (`/api/koreksi`, `/api/opinion-corrections`) | `ip:<ip_prefix>:user:<user_id>` | 5 requests | 60 seconds | 429 Too Many Requests |
| Moderation Reports (`/api/opinions/[id]/report`) | `ip:<ip_prefix>:user:<user_id>` | 5 requests | 60 seconds | 429 Too Many Requests |
| Search API (`/api/koreksi/search`) | `ip:<ip_prefix>` | 30 requests | 60 seconds | 429 Too Many Requests |
| Analytics Ingress (`/api/analytics`) | `ip:<ip_prefix>` | 30 requests | 60 seconds | Silent drop (200 OK) |
| Image Upload Initiation | `user:<user_id>` | 10 uploads | 1 hour | 429 Too Many Requests |
| Admin Mutations (`/dashboard/**`) | `user:<user_id>` | 60 requests | 60 seconds | 429 Too Many Requests |

---

## Key Generation Strategy
1. **Unauthenticated Endpoints:** Use IP subnet prefix (`/24` for IPv4, `/64` for IPv6) to prevent evasion via IPv6 rotation or single-subnet proxies.
2. **Authenticated Endpoints:** Combine authenticated `user_id` with IP prefix to prevent distributed credential stuffing or compromised token abuse.
3. **Graceful Degradation:** When the distributed rate-limit backend experiences downtime, the system fails open for read operations and falls back to local in-memory throttling for mutations.
