# Database Reference

The application uses SQLAlchemy models and Alembic migrations. The test suite swaps PostgreSQL for an in-memory SQLite database; migration application against a live PostgreSQL service was not performed in this documentation audit. `alembic heads` reports `0003_download_progress` as the current head.

## Entity Relationship

```mermaid
erDiagram
    USERS ||--o{ DOWNLOADS : owns
    USERS {
        uuid id PK
        varchar email UK
        varchar password_hash nullable
        boolean is_active
        datetime created_at
        datetime updated_at
    }
    DOWNLOADS {
        uuid id PK
        uuid user_id FK
        varchar source_url
        varchar platform
        varchar title nullable
        varchar status
        varchar format
        varchar quality
        varchar file_path nullable
        datetime created_at
        datetime completed_at nullable
        datetime expires_at nullable
        text error_message nullable
        bigint downloaded_bytes nullable
        bigint total_bytes nullable
        integer progress_percent nullable
    }
```

## Tables

### `users`

| Column | Type/constraints | Meaning |
|---|---|---|
| `id` | UUID primary key | Application-generated user identifier |
| `email` | `varchar(320)`, non-null, unique/indexed | Normalized account email; a functional unique index enforces `lower(email)` |
| `password_hash` | nullable `varchar(255)` | Hashed password; raw password is never persisted |
| `is_active` | non-null boolean, default true | Authentication eligibility |
| `created_at` | non-null timestamp, server default now | Creation time |
| `updated_at` | non-null timestamp, server default now/on update | Last ORM update time |

ORM relationship `downloads` has delete-orphan cascade. The foreign key also declares `ON DELETE CASCADE`.

### `downloads`

| Column | Type/constraints | Meaning |
|---|---|---|
| `id` | UUID primary key | Job ID and storage directory name |
| `user_id` | UUID, non-null FK to users, indexed | Owning account |
| `source_url` | non-null `varchar(2048)` | Submitted media URL |
| `platform` | non-null `varchar(40)` | `direct` or provider-derived label |
| `title` | nullable `varchar(500)` | Provider metadata title |
| `status` | non-null `varchar(20)` with check | `pending`, `processing`, `completed`, `failed`, or `expired` |
| `format` | non-null `varchar(20)` | Output format, currently MP4/M4A |
| `quality` | non-null `varchar(40)` | Controlled quality label |
| `file_path` | nullable `varchar(2048)` | Relative path under configured temp root; not a full machine path |
| `created_at` | non-null timezone timestamp, server default now | Job creation |
| `completed_at` | nullable timezone timestamp | Successful completion |
| `expires_at` | nullable timezone timestamp | Media expiry deadline |
| `error_message` | nullable text | Sanitized public-safe worker failure |
| `downloaded_bytes` | nullable bigint | Last reported bytes/current final size |
| `total_bytes` | nullable bigint | Expected total when known/final size on completion |
| `progress_percent` | nullable integer | Percent when total is known; 100 on completion |

Media bytes are not stored in the database.

## Migration History

| Order | Revision | Parent | Change |
|---:|---|---|---|
| 1 | `0001_initial` | none | Creates users and downloads, base fields, status check, owner foreign key/index. |
| 2 | `0002_user_auth` | `0001_initial` | Adds nullable `password_hash`, non-null `is_active`, normalizes emails, adds functional case-insensitive unique index. |
| 3 | `0003_download_progress` | `0002_user_auth` | Adds nullable downloaded/total bytes and progress percent. |

Migration source is in `../backend/alembic/versions/`; runtime setup is in `../backend/alembic/env.py` and `../backend/alembic.ini`.

## Lifecycle Semantics

Job creation assigns `user_id` from the authenticated user. Successful worker completion sets title, relative file path, timestamps, expiry, byte counts, and `progress_percent=100`. Failure clears `file_path`; expiration clears the file reference after removal attempt and changes status to `expired`. The file itself is local temporary storage and cleanup is separate from relational deletion.