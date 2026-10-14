# DownloadIt

DownloadIt is a React/TypeScript frontend and FastAPI/PostgreSQL backend for authenticated, temporary media jobs.

## Provider scope

Media support is selected through `ProviderRegistry`. Direct MP4 files are enabled only for exact HTTPS hosts in `DOWNLOAD_ALLOWED_HOSTS` (currently `samplelib.com`). When `YTDLP_ENABLED` is active, DownloadIt attempts to download media from supported public HTTP/HTTPS URLs using yt-dlp and reports the extractor only after successful analysis. Provider availability depends on extractor behavior and applicable platform rules. There is no claim that every website is supported.

Only download media you are authorized to download and that the source platform permits. The yt-dlp provider accepts no cookies, account credentials, arbitrary headers, proxies, or command-line options. It does not attempt DRM, authentication, CAPTCHA, rate-limit, or access-control bypasses. Playlists are disabled.

## Local development

Copy `backend/.env.example` to `backend/.env`, replace the JWT/database placeholders, and review the local allowlist and yt-dlp opt-in. `.env` files are ignored by Git.

Existing local env files must add `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD` values matching `DATABASE_URL` before running Compose. Use deployment-managed secrets outside local development.

Start PostgreSQL from the repository root with the Compose-only env file:

```bash
docker compose --env-file backend/.env.docker up -d
```

Keep `backend/.env` for the FastAPI/Pydantic settings loader and avoid storing the `POSTGRES_*` variables there; the application settings reject unknown extra environment keys.

Install backend dependencies and apply migrations:

```bash
cd backend
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
```

The existing `.venv` is reused. yt-dlp is optional and is not installed by the base requirements. From `backend/`, install `requirements-ytdlp.txt` and set `YTDLP_ENABLED=true` only when testing authorized/permitted sources; keep it off otherwise.

FFmpeg and ffprobe are detected on `PATH`. FFmpeg is required to merge separate audio/video streams. Before a job completes, ffprobe validates the actual MP4/M4A container and required stream type; invalid output or missing ffprobe fails safely.

Start FastAPI from `backend/`:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Start the frontend from the repository root:

```bash
npm install
npm run dev
```

The frontend reads `VITE_API_BASE_URL` from the root `.env` file and defaults to `http://localhost:8000`. The API must be running for authentication, media analysis, History, and file downloads. If it cannot be reached, authentication and analysis show a connection error rather than suggesting credentials are invalid.

## Storage and security

The frontend displays only the formats and quality values returned by media analysis, including any available resolution, estimated size, and codec details; it sends only those controlled values and never accepts raw yt-dlp selectors. Audio is delivered as M4A, and unavailable qualities are rejected. Download progress and completed files use the existing authenticated job-status and file endpoints. History is user-scoped and offers completed files only through the authenticated file endpoint.

Jobs are queued through the in-process background adapter, with status and throttled progress stored in PostgreSQL. Downloads use private temporary local storage with generated job/file IDs, `0700` directories, `0600` files, and a `DOWNLOAD_MAX_BYTES` cap (50 MB by default). Files expire after `DOWNLOAD_FILE_EXPIRATION_MINUTES`, are available only through the authenticated owner-checked endpoint, and are removed by expiry/orphan cleanup. No media is stored in PostgreSQL or served as a static directory. Authentication and history are user-scoped; users cannot read another user's jobs or files.

yt-dlp jobs require a separate user authorization acknowledgement. This is not proof of rights; operators must verify that each use is permitted. Extractor availability and platform terms can change. yt-dlp does not accept cookies, credentials, custom headers, proxies, or access-control bypasses.

## Tests

Backend tests use mocked providers and do not depend on external media websites:

```bash
cd backend
source .venv/bin/activate
pytest
```

For a permitted manual test, sign in and use a URL whose media you are authorized to download and whose source permits it. Verify analysis, job progress, completion, authenticated file access, and History. Do not infer platform support from yt-dlp extractor coverage; support can change and access restrictions are not bypassed.

Frontend checks:

```bash
npm run build
npm run lint
```

Swagger UI is available at http://localhost:8000/docs while the backend is running.
