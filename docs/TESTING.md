# Testing and Validation

## Commands

Backend (run from `backend/` with the virtual environment active):

```bash
pytest
pytest tests/test_ytdlp_provider.py
```

Frontend (run from repository root):

```bash
npm run lint
npm run build
```

`npm run build` runs `tsc -b` followed by `vite build`. There is no frontend test script. To inspect migration graph without connecting to a database: `alembic heads` from `backend/`.

## Current Audit Results

| Check | Result |
|---|---|
| Backend pytest | **92 passed** in 1.65s; one Starlette deprecation warning that `httpx` with `starlette.testclient` is deprecated and `httpx2` is suggested |
| Frontend lint | `npm run lint` completed with no reported findings |
| Frontend build | `tsc -b` and Vite 8.3.2 build succeeded; 1,914 modules transformed |
| Migration head | `0003_download_progress (head)` |
| Live media requests | `https://samplelib.com/mp4/sample-5s.mp4` analyzed and completed as an authenticated `mp4/source` job; History showed the completed job and the authenticated file endpoint returned HTTP 200. Unauthenticated status/file requests returned HTTP 401. No Instagram or YouTube live tests were run. |

The test run used the repository virtual environment (Python 3.14 was shown in the warning path). The repository does not declare a Python support range. Results describe this environment at audit time and should not be treated as compatibility certification.

## Test Design and Scope

`backend/tests/conftest.py` creates schema in a static in-memory SQLite database per test, overrides API DB dependencies, disables actual background enqueueing, and disables yt-dlp by default. Provider tests supply fake HTTP responses; yt-dlp tests use `FakeYoutubeDL`; DNS answers are mocked. Worker tests use fake provider output, and ffprobe is mocked where output validation is under test.

| Category | Evidence |
|---|---|
| Auth and password rules | `test_auth.py` |
| Owner filtering and IDOR | `test_auth.py`, `test_download_worker.py` |
| Download CRUD/history/status | `test_downloads.py`, `test_download_worker.py` |
| Health and safe DB errors | `test_health.py`, `test_downloads.py` |
| URL validation/provider registry | `test_providers.py`, `test_ytdlp_provider.py` |
| Direct provider MIME/redirect/network | `test_providers.py` |
| SSRF and connection-time DNS | `test_providers.py`, `test_ytdlp_provider.py` |
| yt-dlp options, qualities, playlist, errors | `test_ytdlp_provider.py` |
| Worker transitions/progress/size/failure | `test_download_worker.py` |
| ffprobe output validation | `test_download_worker.py` |
| Path traversal, permissions, expiration, cleanup | `test_download_worker.py` |

## Not Established by Tests

No test proves a real external extractor remains available, downloads content from a live source, or behaves consistently with changing platform rules. No frontend browser/e2e, accessibility, device, load/concurrency, production PostgreSQL migration, scheduler, or real FFmpeg/ffprobe integration test is configured. The suite verifies the application around controlled doubles, not external service availability.