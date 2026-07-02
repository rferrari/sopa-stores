# Implementation Plan — One Backend, Multiple Client Storefronts

> Status: **PROPOSAL for validation. Not implemented.**
> Goal: A single Medusa backend (Render + Supabase) serving many independent
> client storefronts (each on its own Vercel deploy / domain), managed centrally.

---

## 1. Architecture summary

One Medusa backend instance. Each client storefront maps to a **Sales Channel**
plus its own **Publishable API Key**. The storefront (same Next.js template,
deployed once per client) is scoped to its channel by that key.

```
                         ┌─────────────────────────────┐
                         │   Medusa backend (Render)    │
                         │   + Admin dashboard          │
                         │   + Postgres (Supabase)      │
                         └─────────────────────────────┘
                            │            │            │
                Sales Channel A   Sales Channel B   Sales Channel C
                 + pk_A            + pk_B            + pk_C
                    │                 │                 │
              Storefront A       Storefront B       Storefront C   (Vercel, own domain)
              client-a.com       client-b.com       client-c.com
```

## 2. What is isolated vs. shared  ← **VALIDATE THIS FIRST**

This is the crux of whether this model is acceptable for a multi-client agency.

| Concern | Isolated per client? | Mechanism |
|---|---|---|
| Product catalog visibility | ✅ Yes | Products assigned to a sales channel; publishable key scopes storefront reads |
| Pricing | ✅ Yes | Price lists / channel-scoped prices |
| Inventory | ✅ Yes | Stock locations per channel |
| Storefront domain / branding | ✅ Yes | Separate Vercel deploy + env per client |
| **Customers** | ❌ **Shared** | One customer table across all channels |
| **Orders** | ⚠️ Tagged by channel, not walled | All orders live in one backend/admin |
| **Admin dashboard** | ❌ **Shared** | One admin; operators see ALL clients' data |
| **Promotions / tax / regions** | Shared unless scoped | Some can be channel/region-scoped |

**Key risk:** there is **no built-in tenant wall**. Anyone with admin access sees
every client's products, orders, and customers. If clients must log into their
*own* admin and never see each other's data, this model does **not** provide that
out of the box (would need custom RBAC or the instance-per-tenant model instead).

**Validation questions to answer before building:**
- Do clients need their own admin login, or does *your agency* operate the admin on their behalf? (If agency-operated → this model is fine.)
- Is it acceptable that customers/orders share one data space (segmented by channel), not physically isolated?
- Any compliance/contractual requirement for hard data isolation? (If yes → instance-per-tenant.)

## 3. Per-client provisioning model

Each new client requires (all creatable via Admin API or dashboard — no code):
1. **Sales Channel** — e.g. "Client A Web".
2. **Publishable API Key** — linked to that sales channel.
3. **Stock Location** — linked to the sales channel (for inventory).
4. **Region(s)** — currency/tax/payment for the client's market (can be shared or dedicated).
5. **Product assignment** — the client's products added to their sales channel.
6. **Storefront deploy** — Vercel project from the storefront template, env-scoped to this client.

Consider scripting steps 1–5 as a **seed/provisioning script** (`src/scripts/provision-client.ts`)
using the Medusa container + module services, so onboarding a client is one command.

## 4. Storefront template (parameterized)

The existing `apps/storefront` becomes a reusable template deployed once per client.
Per-client differentiation is **env-only** (no code fork):

| Env var | Per-client value |
|---|---|
| `MEDUSA_BACKEND_URL` | Same shared backend URL for all |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | **Client-specific `pk_...`** |
| `NEXT_PUBLIC_BASE_URL` | Client's domain |
| `NEXT_PUBLIC_DEFAULT_REGION` | Client's region |
| Branding (logo/theme) | Via env or per-client config file/CMS |

Open design decision to validate: **branding** — env vars for simple cases, or a
config/theming layer (or CMS) if clients need significant visual customization.

## 5. Backend CORS model

`STORE_CORS` and `AUTH_CORS` must include **every** client storefront domain
(comma-separated). This grows with each client — plan to manage it as a single
maintained env var, or automate updates as part of provisioning.

## 6. Deployment model

- **Backend:** single Render service (current setup). Upgrade off free tier before
  real traffic (free spins down → cold starts break storefront ISR/build fetches).
- **Storefronts:** one Vercel project per client, all from the same repo/root
  (`apps/storefront`), each with its own env + domain.
- **Redis:** add a real Redis (Upstash) before production — required for a shared
  backend under multi-storefront load (event bus, workflows, caching).

## 7. Phased rollout

- **Phase 0 — Validation (current):** confirm the single-backend + sales-channel
  model meets isolation needs (section 2). Manually create 2 sales channels +
  2 publishable keys, point 2 storefronts at them, verify catalog scoping works
  and there's no cross-channel product leakage.
- **Phase 1 — Provisioning automation:** script client onboarding (channel, key,
  stock location, region, product assignment).
- **Phase 2 — Storefront templating:** finalize env-driven config + branding strategy;
  document the "add a client" runbook.
- **Phase 3 — Hardening:** paid Render tier, Redis, CORS automation, backups,
  monitoring, admin access strategy (RBAC if clients self-serve admin).
- **Phase 4 — Scale:** evaluate limits (products/channels, admin performance with
  many clients' data in one DB) and revisit instance-per-tenant if isolation or
  scale demands it.

## 8. Known limits / when to reconsider this model

- No hard tenant isolation (shared admin/customers/orders).
- No per-client admin RBAC out of the box.
- One DB = shared blast radius; a bad migration or outage affects all clients.
- Admin performance may degrade with very large combined catalogs/order volumes.

If any of these become blockers during validation, fall back to **instance-per-tenant**
(one backend + DB per client) — more cost/ops, full isolation.

## 9. Open questions for the team

1. Agency-operated admin, or client-self-service admin? (decides RBAC need)
2. Hard data isolation required? (decides single-backend vs instance-per-tenant)
3. How much per-client storefront customization (env-level vs full theming/CMS)?
4. Expected number of clients in 6–12 months? (decides scale/cost planning)
5. Shared payment accounts or per-client payment providers/payout accounts?
