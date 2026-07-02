# SOPA Store

A [Medusa v2](https://medusajs.com) commerce platform in a Turborepo monorepo:

- **`apps/backend`** — Medusa server + Admin dashboard (`@dtc/backend`)
- **`apps/storefront`** — Next.js 15 storefront (`medusa-next`, React 19)

## Architecture

```
        ┌──────────────────────────────┐
        │  Backend + Admin  (Render)    │  https://sopa-stores.onrender.com
        │  apps/backend                 │  admin at /app
        └──────────────────────────────┘
                 │                     │
        ┌────────────────┐    ┌─────────────────────┐
        │ Postgres        │    │ Storefront (Vercel) │  https://sopa-stores-frontend.vercel.app
        │ (Supabase)      │    │ apps/storefront     │  lands at /de
        └────────────────┘    └─────────────────────┘
```

| Piece | Hosted on | Notes |
|---|---|---|
| Backend API + Admin | Render (web service) | Long-running Node process, `shared` worker mode |
| Storefront | Vercel | Next.js, isolated install (see below) |
| Database | Supabase | Postgres — **must use the Session Pooler** |

---

## Local development

Prerequisites: Node 20, npm 10, a Postgres connection (Supabase or local).

```bash
# from repo root
npm install

# backend (http://localhost:9000, admin at /app)
npm run backend:dev

# storefront (http://localhost:8000)
npm run storefront:dev
```

Environment files (not committed):
- `apps/backend/.env` — see [Backend env vars](#backend-env-vars)
- `apps/storefront/.env` — see [Storefront env vars](#storefront-env-vars)

Create an admin user (setup with `--db-url` skips this):

```bash
cd apps/backend
npx medusa user -e admin@sopa.store -p 'YourStrongPassword'
```

---

## Deployment

> This section exists because deploying was painful. Follow it exactly and it works.

### Database — Supabase (do this first)

1. Create a Supabase project.
2. **Use the Session Pooler connection string, NOT the direct connection.**
   - Supabase → **Connect** → **Session pooler** (port `5432`).
   - The direct host (`db.<ref>.supabase.co`) is **IPv6-only** on the free plan and Render **cannot reach it** (`ENETUNREACH`). IPv4 for the direct host is a paid add-on — don't bother; the pooler is free and IPv4.
3. Append **`?sslmode=no-verify`** to the URL.
   - `sslmode=require` now aliases to `verify-full`, which rejects Supabase's self-signed cert (`SELF_SIGNED_CERT_IN_CHAIN`). `no-verify` = encrypted but unverified, which is what the pooler needs.
   - **Not** the Transaction pooler (port `6543`) — it breaks Medusa migrations (no prepared statements).

Final `DATABASE_URL`:
```
postgresql://postgres.<PROJECT_REF>:<PASSWORD>@aws-0-<REGION>.pooler.supabase.com:5432/postgres?sslmode=no-verify
```
URL-encode special characters in the password (`@`→`%40`, `#`→`%23`, …).

### Backend — Render

Deploy from `render.yaml` (Blueprint) or configure a web service manually.

- **Root Directory:** `.` (repo root — needed so npm workspaces resolve)
- **Build command:**
  ```
  npm ci && npx turbo run build --filter=@dtc/backend && cd apps/backend/.medusa/server && npm install --legacy-peer-deps
  ```
  - `--filter=@dtc/backend` builds **only** the backend. Plain `turbo build` also builds the storefront and fails on missing `NEXT_PUBLIC_*` vars.
  - `--legacy-peer-deps` on the `.medusa/server` install — that folder has no `.npmrc`, so it hits a peer-dep conflict (`@medusajs/ui`) without it.
- **Start command** (free tier has no pre-deploy hook, so migrations run here — use `&&`, not `&`):
  ```
  cd apps/backend/.medusa/server && npx medusa db:migrate && npm run start
  ```
- **Health check path:** `/health`
- Set the [Backend env vars](#backend-env-vars) in the dashboard.

⚠️ **Free tier spins down after ~15 min idle** → cold starts of 30–50s. Fine for testing; upgrade before real traffic (cold starts also break storefront build-time fetches).

### Storefront — Vercel

- **Root Directory:** `apps/storefront`
- **Install command** (in `apps/storefront/vercel.json`):
  ```
  npm install --workspaces=false
  ```
  - The backend pins **React 18**, the storefront needs **React 19**. A shared workspace hoist puts `next` at the root but nests `react`, breaking `next build` ("module react not found"). `--workspaces=false` makes the storefront install self-contained.
  - If the dashboard has an **Install Command override**, clear it so `vercel.json` wins.
- Set the [Storefront env vars](#storefront-env-vars).
- The store is country-scoped — it lands at `/<region-country>` (e.g. `/de`), matching a country in a **region** that exists in the backend.

### CORS (on the backend / Render)

Values must be **`scheme://host` only** — no trailing slash, no path. Otherwise browser requests are blocked.

```
STORE_CORS = https://sopa-stores-frontend.vercel.app
ADMIN_CORS = https://sopa-stores.onrender.com
AUTH_CORS  = https://sopa-stores-frontend.vercel.app,https://sopa-stores.onrender.com
```

`ADMIN_CORS` points to the **backend** (the admin is served there), `STORE_CORS` to the storefront.

### Publishable key

The storefront needs a publishable key linked to a sales channel. Find it in Admin → **Settings → Publishable API Keys**, or via SQL:
```sql
select title, token from api_key where type = 'publishable';
```
Set the `pk_...` value as `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` **on Vercel** (not Render).

---

## Updating Medusa

Medusa core packages are **released together and must share the same version.**

1. Read the [release notes](https://github.com/medusajs/medusa/releases) for breaking changes / codemods.
2. Work on a **branch**, and back up / snapshot the Supabase DB before schema-changing upgrades.
3. Bump **all** backend `@medusajs/*` packages to the same new version; bump `@medusajs/ui`/`ui-preset`/`icons` to the compatible versions the release names.
4. `npm install` (regenerates the lockfile).
5. `npx medusa db:migrate` (new versions often add migrations — run against a test DB first if there are schema changes).
6. Smoke-test locally (`npm run backend:dev`, `npm run storefront:dev`), then merge → deploy.

Go incrementally across versions; don't jump many minor versions at once. There is no single "upgrade" command — it's a coordinated bump + migrate.

> Storefront `@medusajs/*` deps are currently `latest` (non-reproducible). Pin them to exact versions to avoid surprise breakage.

---

## Environment variables

### Backend env vars
| Key | Example / notes |
|---|---|
| `DATABASE_URL` | Supabase **session pooler** string + `?sslmode=no-verify` |
| `MEDUSA_WORKER_MODE` | `shared` (single service) |
| `DISABLE_MEDUSA_ADMIN` | `false` |
| `PORT` | `9000` (HTTP port — not the DB port) |
| `JWT_SECRET` / `COOKIE_SECRET` | random secrets (same on all backend services) |
| `STORE_CORS` / `ADMIN_CORS` / `AUTH_CORS` | see [CORS](#cors-on-the-backend--render) |
| `REDIS_URL` | optional for a test; add Upstash for production |

### Storefront env vars
| Key | Example / notes |
|---|---|
| `MEDUSA_BACKEND_URL` | `https://sopa-stores.onrender.com` (server-side, no `NEXT_PUBLIC_`) |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | `pk_...` from admin |
| `NEXT_PUBLIC_BASE_URL` | the storefront's own URL |
| `NEXT_PUBLIC_DEFAULT_REGION` | ISO-2 country code in an existing region (e.g. `de`) |

---

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `ENETUNREACH …:5432` (IPv6 addr) | Using Supabase direct host. Switch to **session pooler** (IPv4). |
| `SELF_SIGNED_CERT_IN_CHAIN` | Use `?sslmode=no-verify` in `DATABASE_URL`. |
| `ECONNREFUSED ::1:5432` | `DATABASE_URL` empty/unset → app falls back to localhost. |
| `npm ci` "lock file not in sync" | Regenerate `package-lock.json` (`npm install`), commit, push. |
| Render build fails on `medusa-next` / missing `NEXT_PUBLIC_*` | Build must be scoped: `turbo run build --filter=@dtc/backend`. |
| Vercel: "module react not found" | Storefront install must be `npm install --workspaces=false`. |
| Storefront build: "valid publishable key required" | Set `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` on Vercel. |
| Storefront build fails collecting `/[countryCode]` pages | `NEXT_PUBLIC_DEFAULT_REGION` doesn't match a region; or backend unreachable/asleep. |
| CORS errors in browser (cart/checkout) | CORS values have trailing slash/path — use `scheme://host` only. |
| `/app` 404s → redirects to `/de/app` | You're on the storefront domain. Admin is on the **backend** domain (`…onrender.com/app`). |

---

## Multi-storefront roadmap

See [`docs/multi-storefront-plan.md`](docs/multi-storefront-plan.md) — plan for serving multiple client storefronts from one backend via Sales Channels (pending validation).
