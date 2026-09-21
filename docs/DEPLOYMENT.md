# Deployment Guide

Production checklist for the MAISON ESTATE (Real Estate Agency) app — a
standard Next.js 16 standalone build with a Prisma data layer. Local
development needs none of this (`bun run dev` with the default SQLite
`.env` is enough); everything below applies once the app ships to a host.

## 1. Build

```bash
bun install
bun run build   # next build → .next/standalone
bun run start   # NODE_ENV=production bun .next/standalone/server.js
```

The `build` script already stages `public/` and the static assets into
`.next/standalone/` (see `package.json`). Hosts that run `next build`
themselves (Vercel, Netlify) manage this step for you.

## 2. Required environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | SQLite file or PostgreSQL connection string (§4) |
| `NEXTAUTH_SECRET` | Session signing secret — `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Canonical public origin (auth redirects/callbacks) |
| `NEXT_PUBLIC_SITE_URL` | Canonical public origin for metadata/OG/sitemap |

See `.env.example` for the full annotated contract, including the optional
Google OAuth values.

## 3. Host-agnostic notes

- The only route handler is NextAuth under `/api/auth/[...nextauth]`; all
  other mutations are Server Actions — no extra port or ingress surface
  is needed beyond HTTP.
- Pages are `force-dynamic` (listing data must be fresh), so there is no
  ISR/cache-invalidation concern.
- Static assets (video, imagery, fonts) are served from `public/media` and
  `next/font` — put a CDN in front if you like; they are immutable files.

## 4. Database

### Option A — PostgreSQL (recommended for production)

1. Switch the provider in `prisma/schema.prisma` to `postgresql`.
2. Point `DATABASE_URL` at your instance, e.g.
   `postgresql://maison:secret@localhost:5432/maison`.
3. Run `bun run db:push && bun run db:seed` (or adopt `prisma migrate`).
4. Restart the app.

The schema is written portably (string-union "enums", JSON-text array
columns decoded via `parseJsonArray`), so the provider switch needs no
model changes.

### Option B — SQLite with an absolute path

If you keep SQLite in production, set `DATABASE_URL` to an **absolute**
path, e.g. `file:/srv/maison/db/custom.db`, and mount that location as a
persistent volume. The repo-root resolution in `src/lib/db-path.ts`
purposely passes absolute paths through unchanged — in a stripped
standalone deployment the `prisma/` directory is not present, so
relative paths cannot be anchored and absolute is the only deterministic
form.

## 5. Verification after deploy

1. `GET /` — the video hero renders and "Featured Properties" lists the
   seeded listings (or your data).
2. `/sitemap.xml` and `/robots.txt` resolve against
   `NEXT_PUBLIC_SITE_URL`.
3. Sign in at `/login` with a real account (the demo user is seeded only
   when you run `db:seed`).
4. Submit the inquiry form on a property page and confirm the row lands
   in the `Inquiry` table.

## 6. Operational hygiene

- Never commit `.env` (only `.env.example`).
- `bun audit` before releases; keep the lockfile committed.
- The in-process rate limiter (5 submissions / 60s / email) resets on
  restart — fine for single-node deployments; move to a shared store if
  you scale horizontally.
