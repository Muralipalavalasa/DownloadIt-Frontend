# Local Development Setup

Instructions are verified against the current scripts/configuration; commands target macOS. Use safe local credentials and never commit `.env` files.

## Prerequisites

- Node.js/npm compatible with the installed Vite 8 release.
- Python with `venv` and `pip`; no minimum Python version is declared in the repository.
- Docker Desktop or a local PostgreSQL 17-compatible server.
- FFmpeg tools on `PATH`; `brew install ffmpeg` installs FFmpeg and ffprobe on macOS.

## Configure Environment

From the repository root:

```bash
cp backend/.env.example backend/.env
cp .env.example .env
```

Edit `backend/.env` locally. Replace the JWT placeholder with a strong random secret. Set `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD`, then make `DATABASE_URL` use the same values. The Compose file explicitly requires all three `POSTGRES_*` variables. The root `.env` can retain the local frontend API URL or use `VITE_API_BASE_URL` to point to the backend.

## Start Database and Backend

```bash
brew install ffmpeg
docker compose --env-file backend/.env up -d

cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The normal requirements omit yt-dlp. To opt into yt-dlp for sources you are authorized to download and the source permits:

```bash
cd backend
source .venv/bin/activate
pip install -r requirements-ytdlp.txt
```

Then set `YTDLP_ENABLED=true` in `backend/.env` and restart the API. With the example setting `false`, the provider is not selected.

## Start Frontend

In another terminal from the repository root:

```bash
npm install
npm run dev
```

Open the Vite URL, normally `http://localhost:5173`. API defaults to `http://localhost:8000`; OpenAPI UI is `/docs`.

## Checks and Shutdown

```bash
# Backend terminal, from backend/
pytest

# Frontend terminal, from repository root
npm run lint
npm run build

# Stop only the local Compose service
docker compose --env-file backend/.env down
```

Compose keeps PostgreSQL data in a named Docker volume. Do not use volume-removal options unless intentionally deleting local database contents. Do not run production with example placeholders, local CORS assumptions, or a development server.