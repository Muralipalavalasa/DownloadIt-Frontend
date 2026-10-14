# DownloadIt: Project and Copilot Work Guide

**Detailed project handover and source-code map**  
Prepared from the project files and documentation available in this workspace  
Date: 8 October 2026

## About this guide

This guide explains the DownloadIt application, how its main code areas fit together, what the existing project records say about development work, and how to run and validate it. The appendix maps each application, test, and migration source file to its responsibility. The companion reference sections provide the API contract, architecture, data model, security controls, setup, test evidence, limitations, and production-readiness notes.

This is a system-level code explanation, not a verbatim commentary on every source line. For exact implementation details, follow the file links in the source tree and the descriptions in the module inventory below.

## What can be established about GitHub Copilot's work

The checked-out workspace does not contain Git metadata. Therefore, it does not provide commits, authors, pull requests, or change attribution. The files also do not independently prove whether a particular change was authored by GitHub Copilot, a person, or both. This guide does not assign authorship without evidence.

The strongest project-specific work record available is [PHASE_13_REPORT.md](PHASE_13_REPORT.md). It documents a frontend UX and accessibility pass, including clearer API connection errors, URL-scheme validation, mobile navigation/history improvements, result-state redesign, reduced-motion/focus treatments, and updates to user-facing claims. It also records validation claimed for that phase: frontend lint/build, 92 backend tests, and a local end-to-end Direct MP4 sample flow. The report explicitly says that YouTube and Instagram were not live-tested and that the direct sample does not establish broad platform support.

[DEVELOPMENT_HISTORY.md](DEVELOPMENT_HISTORY.md) states that exact numbered implementation history for earlier phases could not be reconstructed. The three Alembic migration numbers are database schema revisions, not evidence of a complete product timeline. Consequently, the reliable answer to “what Copilot did” is: the repository documents what the project contains and what Phase 13 reports as completed, but it cannot verify Copilot authorship or a complete Copilot activity log.

## Project in one sentence

DownloadIt is a React and TypeScript web app with a FastAPI service that analyzes media URLs, lets a signed-in user create a temporary download job for an offered format, tracks progress, and serves completed files only through an authenticated owner-checked endpoint.

## Main user journey

1. The browser opens the landing page and submits a URL to `POST /api/media/analyze`.
2. The backend chooses an enabled provider. The direct-file provider is restricted to exact HTTPS host allowlisting; the optional yt-dlp provider is disabled by the example configuration.
3. The browser renders only formats returned by analysis. It does not send raw yt-dlp selector expressions.
4. A signed-in user creates a job. For yt-dlp, the request also requires an authorization acknowledgement.
5. FastAPI inserts a `pending` job row and starts an in-process background task.
6. The worker downloads into private temporary storage, reports progress, checks size and output paths, and uses ffprobe to validate the actual container and stream.
7. The browser polls the owner-scoped job status and retrieves a completed, unexpired file through the authenticated file endpoint.
8. History lists the signed-in user's jobs. Media bytes are not stored in PostgreSQL.

## Architecture at a glance

```text
React browser
  ├── pages, forms, analysis and progress UI
  ├── API client and sessionStorage bearer token
  └── FastAPI routes
        ├── authentication and owner checks
        ├── services and PostgreSQL metadata
        ├── provider registry
        │     ├── allowlisted direct MP4
        │     └── optional yt-dlp integration
        ├── in-process background worker
        ├── ffprobe output validation
        └── private temporary files
```

The app uses React state and a small authentication context rather than a global state/query library. The frontend selects views from `window.location.pathname`; no routing package is configured. On the server, routes validate inputs and delegate database or provider work to services. PostgreSQL holds accounts and job metadata, while local disk holds temporary media.

## Source-code inventory

### Frontend entry, routing, and shared state

| File | Responsibility |
|---|---|
| `src/main.tsx` | Browser entry point; mounts the app under React Strict Mode and imports global styling. |
| `src/App.tsx` | Chooses the page from the pathname, provides the auth context, and gates History while auth state is loading or signed out. |
| `src/context/auth-context.ts` | Defines the shared authentication context contract. |
| `src/context/auth-provider.tsx` | Owns signed-in user/loading state, restores a saved token through `/api/auth/me`, and exposes login/logout behavior to child components. |
| `src/context/useAuth.ts` | Typed hook for consuming the auth context and detecting use outside its provider. |
| `src/lib/authStorage.ts` | Gets, saves, and clears the short-lived browser-session bearer token in `sessionStorage`. |
| `src/lib/api.ts` | Central API client: base URL resolution, network/error handling, JSON requests, authentication headers, auth calls, analysis, job creation/status, history, and file retrieval. |
| `src/types/media.ts` | TypeScript request/response contracts for analysis and offered media formats. |
| `src/types/download.ts` | TypeScript contracts for a created job, status/progress, and history items. |

### Frontend pages and components

| File | Responsibility |
|---|---|
| `src/pages/Home.tsx` | Assembles the landing page and URL download flow. |
| `src/pages/Login.tsx` | Login form, field handling, validation messages, and auth-provider integration. |
| `src/pages/Register.tsx` | Registration form and password-policy guidance, submitting through the API client. |
| `src/pages/History.tsx` | Loads the current user's history, displays statuses/details responsively, and offers file retrieval for completed jobs. |
| `src/components/UrlDownloader.tsx` | Controls URL analysis, the selected offered format, acknowledgement, job submission, polling, and progress/error/success states. |
| `src/components/MediaResult.tsx` | Displays analysis metadata, available formats, job states, progress, and completion affordances. |
| `src/components/Navbar.tsx` | Responsive top navigation and sign-in/history navigation state. |
| `src/components/Hero.tsx` | Landing-page introduction and primary call to action. |
| `src/components/Features.tsx` | Renders the landing-page feature section from local feature data. |
| `src/components/FeatureCard.tsx` | Reusable feature card that accepts an icon, title, and explanatory text. |
| `src/components/Logo.tsx` | Shared brand mark/wordmark component. |
| `src/components/Footer.tsx` | Shared page footer and footer navigation. |
| `src/index.css` | Global Tailwind CSS import and base styles. |
| `src/App.css` | App-level styles, where applicable. |
| `src/assets/hero.png` | Hero artwork used by the frontend. |
| `src/assets/react.svg`, `src/assets/vite.svg` | Starter/template assets; their presence does not imply React/Vite marketing content is part of the product flow. |

### Backend application, APIs, and contracts

| File | Responsibility |
|---|---|
| `backend/app/main.py` | Creates FastAPI, configures CORS, includes routers, maps database errors to a safe unavailable response, and exposes the root service response. |
| `backend/app/api/dependencies.py` | Resolves and validates the bearer-token user dependency used by protected routes. |
| `backend/app/api/routes/auth.py` | Registration, login, and current-user API endpoints. |
| `backend/app/api/routes/media.py` | Public media-analysis endpoint; validates the request and delegates to provider selection. |
| `backend/app/api/routes/downloads.py` | Owner-scoped history, job creation, details, status, file download, and deletion endpoints. |
| `backend/app/api/routes/health.py` | Health endpoint, including database availability. |
| `backend/app/api/routes/__init__.py`, `backend/app/api/__init__.py`, `backend/app/__init__.py` | Python package markers for the API and application packages. |
| `backend/app/schemas/auth.py` | Pydantic registration/login/user/token schemas and email normalization/password validation. |
| `backend/app/schemas/media.py` | Pydantic analysis request/response and format-option schemas. |
| `backend/app/schemas/downloads.py` | Pydantic job create, status, history, detail, and delete response schemas. |
| `backend/app/schemas/__init__.py` | Schema package marker. |
| `backend/app/models/user.py` | SQLAlchemy user model, normalized email uniqueness, password hash, active state, and relationship to downloads. |
| `backend/app/models/download.py` | SQLAlchemy job/history model, ownership, state, format, timestamps, progress counters, and relative file-path metadata. |
| `backend/app/models/__init__.py` | Model package marker/exports. |

### Backend configuration, providers, services, and workers

| File | Responsibility |
|---|---|
| `backend/app/core/config.py` | Typed application settings loaded from environment, including database, JWT, provider, storage, and size/expiry options. |
| `backend/app/core/database.py` | SQLAlchemy base, engine/session setup, and request-scoped database session dependency. |
| `backend/app/core/network_security.py` | Connection-time DNS resolution guard that rejects non-public addresses during guarded provider work. |
| `backend/app/core/__init__.py` | Core package marker. |
| `backend/app/providers/base.py` | Shared provider protocol and data structures for platform identity, media formats, and metadata. |
| `backend/app/providers/registry.py` | Ordered provider lookup; chooses the first enabled provider matching the requested URL. |
| `backend/app/providers/direct_file.py` | Direct HTTPS MP4 provider constrained by exact host allowlist, MIME checks, no redirects, streaming, and size limits. |
| `backend/app/providers/ytdlp_provider.py` | Optional yt-dlp analysis/download adapter, controlled format mapping, public URL checks, playlist rejection, authorization requirement, progress, and safe error conversion. |
| `backend/app/providers/errors.py` | Typed provider failure categories and mapping from safe provider errors to HTTP responses. |
| `backend/app/providers/__init__.py` | Provider package marker/exports. |
| `backend/app/services/auth_service.py` | Password hashing/verification, user creation and lookup, authentication, and JWT issue/validation. |
| `backend/app/services/media_service.py` | Provider selection and analysis orchestration for a URL. |
| `backend/app/services/download_service.py` | Job creation/owner lookup, state transitions, progress persistence, and lazy expiration. |
| `backend/app/services/job_queue.py` | Queue interface and current in-process background-task adapter. |
| `backend/app/services/storage_service.py` | Private local temporary storage, generated names, file permissions, path validation, and containment. |
| `backend/app/services/storage_cleanup.py` | Callable cleanup of expired files and orphaned storage; the project documentation says it is not scheduled automatically. |
| `backend/app/services/__init__.py` | Service package marker. |
| `backend/app/workers/download_worker.py` | Processes jobs, updates state/progress, downloads through the provider, enforces output checks, runs ffprobe validation, and records safe completion/failure. |
| `backend/app/workers/__init__.py` | Worker package marker. |

### Database migration and backend test files

| File | Responsibility |
|---|---|
| `backend/alembic/env.py` | Connects Alembic to application settings and model metadata for migration operations. |
| `backend/alembic/script.py.mako` | Template Alembic uses when generating a revision. |
| `backend/alembic/versions/0001_initial_download_history.py` | Creates initial users and downloads tables and their base ownership/history structure. |
| `backend/alembic/versions/0002_user_authentication.py` | Adds authentication fields, normalizes existing email data, and enforces case-insensitive uniqueness. |
| `backend/alembic/versions/0003_download_progress.py` | Adds downloaded/total byte counters and percentage progress. |
| `backend/tests/conftest.py` | Shared isolated test database, FastAPI dependency overrides, fixtures, and test defaults. |
| `backend/tests/test_auth.py` | Registration/login/password/token behavior and user-scoped authorization tests. |
| `backend/tests/test_downloads.py` | Download API creation, history, status, ownership, and failure/validation behaviors. |
| `backend/tests/test_download_worker.py` | Worker transitions, progress, file storage/validation, completion/failure, expiry, and cleanup behavior. |
| `backend/tests/test_health.py` | Health endpoint and unavailable-database response behavior. |
| `backend/tests/test_providers.py` | Registry and direct-provider URL, response, MIME, redirect, and network behavior. |
| `backend/tests/test_ytdlp_provider.py` | yt-dlp provider behavior using fakes for metadata, options, URLs, quality, limits, and errors. |
| `backend/tests/__init__.py` | Test package marker. |

### Project-level files and infrastructure

| File or folder | Responsibility |
|---|---|
| `package.json` / `package-lock.json` | Frontend dependencies and `dev`, `build`, `lint`, and `preview` scripts with locked versions. |
| `vite.config.ts` | Vite frontend build/dev-server configuration. |
| `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` | TypeScript project and frontend/tooling compiler settings. |
| `index.html` | Vite HTML entry document. |
| `docker-compose.yml` | Starts PostgreSQL only; frontend and API are separate local processes. |
| `backend/alembic.ini` | Alembic configuration. |
| `backend/requirements.txt` | Pinned base Python backend dependencies. |
| `backend/requirements-ytdlp.txt` | Separate optional yt-dlp dependency. |
| `.env.example`, `backend/.env.example`, `backend/.env.docker` | Configuration examples/separation; actual ignored local secret files are intentionally excluded from this guide. |
| `public/favicon.svg`, `public/icons.svg` | Public browser icon assets. |
| `README.md`, `backend/README.md` | Local project/backend orientation; read alongside the more detailed docs for current route behavior and caveats. |

## Key implementation ideas explained

### Providers keep source-specific behavior behind a common contract

`MediaProvider` describes shared operations. `ProviderRegistry` uses the configured order to select one enabled provider. This avoids putting media-source protocol details in route handlers. The direct provider is intentionally narrow. yt-dlp is an opt-in general extractor adapter, not a promise of universal site support.

### Routes, schemas, and services have different jobs

Pydantic schemas define accepted/returned API shapes. Route functions bind HTTP methods and paths to those contracts, enforce authentication where required, and translate expected errors. Services own reusable business operations such as job state changes or storage. The worker executes long-running work outside the request function, though its current queue is still in-process rather than durable.

### Database rows describe jobs; local storage holds media

The `users` table represents accounts. Each `downloads` row belongs to one user and records the source, selected output, status, progress, timestamps, expiry, and a relative file path. Three migrations evolve this schema. The media itself is not stored in PostgreSQL.

### Output is validated before success is reported

A successful provider return alone is not enough. The worker checks that the generated file exists, is not a symlink or empty, stays under the size limit, has no unexpected residual files, and passes ffprobe checks for a valid MP4/M4A container and required stream. Failed jobs expose safe messages rather than raw provider diagnostics.

### Security is layered, with deployment caveats

Protected job and file operations scope database lookups by both job ID and authenticated user ID. Storage uses generated identifiers and constrained paths. URL access is guarded against private-address SSRF; the direct provider is further restricted to configured exact hosts and disallows redirects. The codebase also documents important limits: browser tokens are in JavaScript-readable `sessionStorage`, direct HTTP requests may honor proxy environment variables, rate limiting is absent, and local storage/in-process work are not production-scale infrastructure.

## API overview

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/auth/register` | Create an account. |
| `POST` | `/api/auth/login` | Authenticate and receive a bearer token. |
| `GET` | `/api/auth/me` | Validate the current token and return its active user. |
| `POST` | `/api/media/analyze` | Analyze a URL and return provider metadata/formats; this route is public in the current source. |
| `GET` | `/api/downloads` | List the signed-in user's job history. |
| `POST` | `/api/downloads` | Create an owner-bound download job. |
| `GET` | `/api/downloads/{id}` | Read owner-scoped job details. |
| `GET` | `/api/downloads/{id}/status` | Read job state and progress. |
| `GET` | `/api/downloads/{id}/file` | Retrieve an owned, complete, unexpired file. |
| `DELETE` | `/api/downloads/{id}` | Delete an eligible owned job. |
| `GET` | `/api/health` | Check API/database health. |
| `GET` | `/` | Return service name/version. |

The complete field definitions and status/error semantics are in [API.md](API.md).

## What the evidence says is complete, tested, or still limited

- The project documentation reports a React frontend, FastAPI API, PostgreSQL metadata schema, authentication, provider registry, job worker, local temporary storage, and file validation.
- Three Alembic revisions are present; `0003_download_progress` is described as the current migration head.
- The documentation records 92 backend tests plus frontend lint/build results for the prior validation run. Those are historical recorded results, not a claim that this guide re-ran them.
- The backend tests use fake providers, mocked HTTP/DNS, an isolated test database, and mocked ffprobe where relevant. They verify application behavior but cannot guarantee a live website extractor still works.
- The Phase 13 report records one local Direct MP4 sample flow. It explicitly does not claim YouTube or Instagram live verification.
- The worker queue is process-local. Cleanup exists but has no automatic scheduler. No production deployment, rate limiter, observability stack, database backup plan, or frontend browser-test suite is documented.
- yt-dlp is optional and disabled in the example configuration. Use it only for media you are authorized to download and where the source permits it. No DRM, access-control, login, CAPTCHA, or rate-limit bypass is implemented.

## Recommended way to read the code

1. Begin at `src/main.tsx` and `src/App.tsx` to understand the browser entry and page selection.
2. Follow `src/components/UrlDownloader.tsx` to the API methods in `src/lib/api.ts` and the types in `src/types/`.
3. Read `backend/app/main.py`, then the route modules and Pydantic schemas.
4. Trace job creation through `download_service.py`, `job_queue.py`, and `workers/download_worker.py`.
5. Read `providers/base.py`, `registry.py`, and provider implementations to understand analysis/download dispatch.
6. Read `models/`, `alembic/versions/`, and `services/storage_service.py` to understand persisted metadata and temporary media.
7. Use the companion API, security, database, testing, setup, and architecture references for precise contracts and boundaries.

## Companion sections included in the PDF

The full PDF continues with the project's existing detailed references:

- [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md) — complete system overview and feature-by-feature explanation.
- [ARCHITECTURE.md](ARCHITECTURE.md) — component boundaries, request sequence, provider selection, job state, and deployment shape.
- [API.md](API.md) — endpoint contracts, request/response fields, and error behavior.
- [DATABASE.md](DATABASE.md) — tables, columns, relationships, migration sequence, and lifecycle semantics.
- [SECURITY.md](SECURITY.md) — authentication, ownership, SSRF, storage, and security gaps.
- [SETUP.md](SETUP.md) — local environment and run instructions.
- [TESTING.md](TESTING.md) — test design, recorded results, and what tests do not establish.
- [DEVELOPMENT_HISTORY.md](DEVELOPMENT_HISTORY.md) — available evidence and limits on historical attribution.
- [PHASE_13_REPORT.md](PHASE_13_REPORT.md) — detailed record of the Phase 13 UI/UX work and its reported validation.
- [PRODUCTION_READINESS.md](PRODUCTION_READINESS.md) — implementation gaps and operational recommendations.
- [DOCUMENTATION_AUDIT.md](DOCUMENTATION_AUDIT.md) — documented inspection scope, verified behavior, and confidence caveats.

## Terms in plain English

| Term | Meaning in this project |
|---|---|
| API | HTTP interface the browser calls to analyze URLs, authenticate, and manage jobs. |
| Bearer token/JWT | Signed short-lived credential attached to protected API requests. |
| Provider | Component that knows how to inspect/download one category of media source. |
| Registry | Chooses an enabled provider for a URL. |
| Job | Database record representing one requested download and its processing status. |
| Worker | Function that performs provider download and final media checks. |
| ffmpeg | External media tool yt-dlp can use to merge compatible streams. |
| ffprobe | External media inspector used by the worker to validate completed output. |
| SSRF | Server-side request forgery: tricking a server into connecting to unintended network addresses. |
| IDOR | Insecure direct object reference: accessing another user's record by guessing/changing an ID. |
| Alembic migration | Versioned database schema change that can be applied in order. |
| In-process background task | Work run by the API process itself; simple locally, but not a durable distributed queue. |

