# OC6 — Bun + TypeScript + Hono spike

Proof-of-life for an "OC6" stack: the **same architecture as OC5**
(thin feature routers → isolated data layer → raw SQL → uniCache-style objects →
Nunjucks/JSON) on a modern runtime — **Bun, TypeScript, Hono** — talking to the
**same MariaDB** via the same pure-JS `mariadb` driver.

It ports one feature, **caches**, end to end so we can answer "does the stack
actually work together?" — especially the one real risk, the `mariadb` driver
under Bun.

## What it proves

| Layer | OC5 (Node/Express/JS) | OC6 (Bun/Hono/TS) |
|---|---|---|
| Runtime | Node | **Bun** (runs `.ts` directly, no build) |
| Framework | Express `Router` | **Hono** (`new Hono()` per feature) |
| Types | JS | **TypeScript**, strict |
| DB driver | `mariadb` | **`mariadb`** (unchanged — the key compat check) |
| Validation | homegrown `validate.js` | **Zod** |
| Templating | Nunjucks | Nunjucks (unchanged) |
| Env | dotenv | **Bun built-in `.env`** |
| Watch | nodemon | **`bun --watch`** |

## Run locally

```bash
cp .env.example .env        # point DATABASE_URL at your dev MariaDB
bun install
bun run dev                 # or: bun start

curl localhost:3000/api/cache/OC1001     # JSON
open  http://localhost:3000/cache/OC1001 # HTML (Nunjucks)
curl 'localhost:3000/api/caches/search?q=wald'  # Zod-validated
bun run typecheck           # tsc --noEmit (Bun runs TS but does not type-check it)
```

## Layout

```
src/
  server.ts          composition root (Hono app, middleware, mounts)
  config.ts          typed env config (Bun.env)
  db.ts              mariadb pool
  middleware/auth.ts auth (anon stub for the spike)
  routes/caches.ts   feature router — GET /cache/:wp, /api/cache/:wp, /api/caches/search
  data/caches.ts     SQL (ocGetCacheDetail) — typed
views/caches/detail.njk
deploy/docker-compose.yml   oc6 stack (oven/bun), mirrors the oc5 stack
```

## Deploy (oc3.baiti.net)

Mirrors the oc5 stack: bind-mount `/opt/repos/oc6` into an `oven/bun` container on
the shared `oc` network, route `oc6.baiti.net` via Nginx Proxy Manager. See
`deploy/docker-compose.yml`.
