// Composition root — the OC6 analog of OC5's app.js. Sets up middleware and
// mounts feature routers; declares no handlers itself. Bun serves the Hono app
// via the default export ({ port, fetch }).
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { auth, type AuthEnv } from './middleware/auth';
import caches from './routes/caches';
import { loadConfig } from './config';

const config = loadConfig();
const app = new Hono<AuthEnv>();

app.use('*', logger());
app.use('*', auth);

app.get('/', (c) =>
  c.text('OC6 spike — Bun + TS + Hono.\nTry  /cache/OC1001  or  /api/cache/OC1001\n'),
);

// Health check — no DB, for the container/proxy
app.get('/healthz', (c) => c.json({ ok: true, stack: 'bun+ts+hono' }));

app.route('/', caches);

console.log(`OC6 spike listening on :${config.port}`);

export default {
  port: config.port,
  fetch: app.fetch,
};
