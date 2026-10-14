# Production Readiness Assessment

This is an assessment, not an implementation plan. The app is suitable for continued local development and isolated functional tests; production readiness is not established.

| Area | Current evidence | State | Recommended work |
|---|---|---|---|
| Frontend | React app builds and lints; placeholder links; no browser tests | Partial | UX/accessibility review, real-user tests, browser tests, remove placeholder destinations. |
| Backend | FastAPI route/service separation and safe error handling | Partial | Deploy behind hardened ingress; define operations, timeouts, and observability. |
| Database | PostgreSQL Compose service and three migrations | Partial | Production DB provisioning, migration runbook, backups and restore tests. |
| Authentication | Password hashes and 30-minute default JWT | Partial | Review token storage, revocation/refresh needs, account abuse controls. |
| Authorization | Owner-scoped lookup for job/history/file routes | Implemented | Keep IDOR tests as routes expand. |
| Downloader | Allowlisted direct MP4; optional yt-dlp, fake-provider tests | Partial | Authorized live validation in a controlled environment; resource and concurrency isolation. |
| Storage | Local private temp dirs/files and containment checks | Partial | Durable/shared strategy if needed, capacity quotas, automated cleanup and monitoring. |
| SSRF | Public IP precheck and connection-time DNS guard | Partial | Evaluate egress and proxy behavior; direct httpx can honor environment proxies. |
| Secrets | `SecretStr`, `.env` ignored, examples use placeholders | Partial | Managed secret store/injection, rotation, deployment validation. |
| CORS | Configured origin plus explicit localhost patterns and regex | Not production-ready as-is | Restrict origins/methods/headers to deployed frontend. |
| Rate limiting | Not present | Not started | Add abuse controls for auth, analysis, and job creation. |
| Logging/monitoring | No production observability stack found | Not started | Structured logs, metrics, tracing, alerting and retention policy. |
| Queue | FastAPI in-process background tasks | Not production-ready for durable work | Durable broker/worker, retry/idempotency, cancellation and concurrency controls. |
| Deployment/HTTPS | Compose runs PostgreSQL only | Not started | Deploy API/UI, TLS, hardened network/egress policy, health and rollout strategy. |
| Backups | Not configured | Not started | Database and any retained-file backups with recovery exercises. |
| Cleanup | Callable service and lazy expiry checks; no scheduler | Partial | Schedule cleanup and alert on failures/storage growth. |
| Tests | 92 backend tests, mostly mocks; lint/build pass | Partial | Live integration in controlled/authorized sources, frontend/e2e, PostgreSQL and concurrency tests. |

## Operational Risks

- Jobs are not durable across process termination and there is no cross-process queue coordination.
- Cleanup has no automatic invocation. Completed files are expired lazily when status/file endpoints are used; history does not itself expire rows.
- Local filesystem storage is not shared across API replicas and the per-file cap does not constitute a total storage quota.
- No rate limit is configured for registration, login, analysis, or job creation.
- `sessionStorage` is exposed to same-origin JavaScript and there is no refresh/revocation flow.
- CORS contains development localhost allowances; production origins should be explicitly narrowed.
- yt-dlp compatibility is external and changes over time. No platform-wide guarantee or live extraction SLA is evidenced.
- Direct provider requests do not opt out of environment proxies, while the DNS guard cannot independently validate proxy-side resolution.

## Suggested Sequence

1. Define production threat model, legal scope, source policy, and deployment boundary.
2. Address token/CORS/rate-limit/secret requirements and proxy-aware SSRF/egress policy.
3. Replace in-process jobs with durable execution and operational concurrency limits.
4. Schedule cleanup; define storage quotas, backups, retention, and recovery.
5. Add monitoring/logging and production deployment/TLS automation.
6. Add controlled live integration and frontend/end-to-end regression coverage.

These suggestions are not code changes made by the documentation task.