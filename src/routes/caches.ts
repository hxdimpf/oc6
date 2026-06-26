// Cache feature router (Hono) — the OC6 analog of OC5's src/routes/caches.js.
// Same feature-module pattern: thin handlers, full paths declared here, mounted
// once in server.ts. Compare side by side with the OC5 file — it's a 1:1 port.
import { Hono } from 'hono';
import { z } from 'zod';
import type { AuthEnv } from '../middleware/auth';
import { ocGetCacheDetail } from '../data/caches';
import { render } from '../views';

const caches = new Hono<AuthEnv>();

// ── HTML page ──────────────────────────────────────────────────────────────
caches.get('/cache/:wp', async (c) => {
  const wp = c.req.param('wp').toUpperCase();
  const cache = await ocGetCacheDetail(wp);
  if (!cache) return c.text(`Cache ${wp} not found`, 404);
  return c.html(render('caches/detail.njk', { cache, user: c.get('user') }));
});

// ── JSON API ───────────────────────────────────────────────────────────────
caches.get('/api/cache/:wp', async (c) => {
  const cache = await ocGetCacheDetail(c.req.param('wp').toUpperCase());
  return cache ? c.json(cache) : c.json({ error: 'Cache not found' }, 404);
});

// ── JSON API — Zod-validated query (proves zod runs on Bun) ─────────────────
const SearchQuery = z.object({ q: z.string().min(1).max(50) });

caches.get('/api/caches/search', (c) => {
  const parsed = SearchQuery.safeParse({ q: c.req.query('q') });
  if (!parsed.success) {
    return c.json({ error: 'Invalid query', issues: parsed.error.issues }, 400);
  }
  // Spike stub — real impl calls a data-layer search function.
  return c.json({ q: parsed.data.q, note: 'zod-validated (spike stub)' });
});

export default caches;
