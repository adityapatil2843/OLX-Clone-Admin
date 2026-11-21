# Admin Backend Contract

Source: `server/src/modules/admin` and `server/src/routes/v1.js`, inspected 24 October 2026.

Base URL is configured with `NEXT_PUBLIC_ADMIN_API_URL` and defaults to `http://localhost:8000/api/v1`. The deployed backend URL is `https://olx-clone-server-zngq.onrender.com/api/v1`.

## Authentication

All `/admin/*` endpoints require `Authorization: Bearer <access-token>` and an `ADMIN` or `MODERATOR` role. User-role moderation and audit logs require `ADMIN`. The admin frontend does not create a login flow yet; set a short-lived access token in `localStorage` under `admin_access_token` during development. Never commit credentials or tokens.

## Implemented endpoints

| Frontend operation | Method | Endpoint | Body/query | Allowed role |
|---|---|---|---|---|
| Platform metrics | GET | `/admin/metrics` | — | ADMIN, MODERATOR |
| List reports | GET | `/admin/reports?page=1&limit=20` | `page`, `limit` | ADMIN, MODERATOR |
| Resolve report | PATCH | `/admin/reports/:id` | `{ status: REVIEWED\|RESOLVED\|DISMISSED, resolutionNotes? }` | ADMIN, MODERATOR |
| Moderate listing | PATCH | `/admin/listings/:id/moderate` | `{ status: ACTIVE\|DRAFT\|SOLD\|ARCHIVED, reason? }` | ADMIN, MODERATOR |
| Moderate Reel | PATCH | `/admin/reels/:id/moderate` | `{ status: PUBLISHED\|DRAFT\|MODERATED\|ARCHIVED, reason? }` | ADMIN, MODERATOR |
| Moderate user | PATCH | `/admin/users/:id/moderate` | `{ isActive?, role?, reason? }` | ADMIN |
| Audit logs | GET | `/admin/audit-logs?page=1&limit=20` | `page`, `limit` | ADMIN |

## Intentionally not connected

There is no server-backed admin list/search endpoint for users, listings, Reels, ads, businesses, verifications, notifications, or analytics time-series. Existing screens for those areas remain mock-data screens until corresponding routes exist.

## Response conventions

Successful responses use `{ success: true, data, meta? }`; errors use the server error envelope. Pagination responses put `page`, `limit`, `total`, `totalPages`, and `hasNextPage` in `meta`.
