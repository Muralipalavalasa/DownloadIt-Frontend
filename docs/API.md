# API Reference

Base path is `/api`, except root `GET /`. Interactive OpenAPI is available at `/docs` and `/redoc` when FastAPI is running. UUID parameters are standard UUIDs. JSON bodies reject schema-invalid data with `422`.

## Authentication

| Method | Path | Auth | Request | Success | Errors |
|---|---|---|---|---|---|
| POST | `/api/auth/register` | No | `{email: string, password: string}` | `201 {id,email,created_at,is_active}` | `409` duplicate; `422` invalid email/password |
| POST | `/api/auth/login` | No | `{email: string, password: string}` | `200 {access_token,token_type:"bearer"}` | `401` same message for unknown email and wrong password; `422` invalid body |
| GET | `/api/auth/me` | Bearer | None | `200 {id,email,created_at,is_active}` | `401` missing, invalid, expired, inactive, or unknown user |

Registration password policy: minimum 12 characters, at least one uppercase, lowercase, digit, and non-alphanumeric character. Email is stripped/case-folded.

The backend README currently calls media analysis authenticated, but the current analysis route has no auth dependency; download operations remain protected.

## Media Analysis

### `POST /api/media/analyze`

Authentication is not required. Body: `{ "url": "https://..." }`. The schema requires non-empty HTTP(S) URL syntax; the chosen provider adds stricter validation. Success is `200` with:

```json
{
  "success": true,
  "platform": "extractor-derived-or-direct",
  "extractor": "optional provider name",
  "requires_authorization": true,
  "title": "optional",
  "duration": "optional string",
  "thumbnail": "optional URL",
  "webpage_url": "optional URL",
  "uploader": "optional",
  "available_formats": [
    {"format":"mp4","quality":"720p","extension":".mp4","resolution":"1280x720","filesize":null,"video_codec":null,"audio_codec":null}
  ]
}
```

Invalid syntax is `422`; unsupported/unusable media generally `400`; provider/network failure `503`; unexpected processing errors are sanitized to `502`. Metadata values are provider-reported and may be absent.

## Downloads and History

All endpoints below require `Authorization: Bearer <access_token>`.

| Method | Path | Success | Important errors |
|---|---|---|---|
| GET | `/api/downloads` | `200` array of owner history items, newest first | `401`, database unavailable `503` |
| POST | `/api/downloads` | `201 {id,status:"pending"}` | `400` unsupported options/required acknowledgement; `401`; `422`; `503` |
| GET | `/api/downloads/{download_id}` | `200` detail | `404` unknown or other-owner job; `422` malformed UUID |
| GET | `/api/downloads/{download_id}/status` | `200 {id,status,progress,downloaded_bytes,total_bytes,error}` | `404`; may mark completed job expired |
| GET | `/api/downloads/{download_id}/file` | `200` attachment (`video/mp4` or `audio/mp4`) | `404` absent/foreign/missing file; `409` not completed; `410` expired |
| DELETE | `/api/downloads/{download_id}` | `200 {success:true}` | `404` unknown/foreign; `409` processing; `422` invalid UUID |

Create request fields: `source_url` (required, max 2048), `format` (default `mp4`, 1-20 characters), `quality` (default `source`, 1-40 characters), and `authorized_to_download` (default false). Defaults are schema defaults; a provider may reject them. Direct MP4 requires `mp4/source`; yt-dlp uses only controlled offered pairs. Only yt-dlp jobs require the acknowledgement.

History item fields: `id`, `source_url`, `platform`, `title`, `status`, `format`, `quality`, `created_at`, `completed_at`. Detail adds `user_id`, `expires_at`, `error_message`. Neither returns the local file path. Status is one of `pending`, `processing`, `completed`, `failed`, `expired`.

## Health and Root

| Method | Path | Auth | Response |
|---|---|---|---|
| GET | `/api/health` | No | `200 {status:"ok",service,database:"connected"}` or `503` safe unavailable response |
| GET | `/` | No | `200 {service,version}` |

## Authorization Semantics

Job lookup is `WHERE downloads.id = :id AND downloads.user_id = :authenticated_user_id`. Foreign and nonexistent resources both return `404`. File access checks ownership before expiry/state/path validation. See [SECURITY.md](SECURITY.md) and route source in `../backend/app/api/routes/`.