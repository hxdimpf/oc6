import express from 'express';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;
const OKAPI_URL = process.env.OKAPI_URL || 'http://okapi:80';

// ── Static assets from oc-frontend submodule ──
app.use('/_frontend', express.static('public/_frontend'));

// ── API proxy: forward all /api/* requests to OKAPI ──
app.use('/api', async (req, res) => {
  try {
    const target = `${OKAPI_URL}/okapi${req.path}`;
    const qs = new URLSearchParams(req.url.split('?')[1] || '');
    const url = qs.toString() ? `${target}?${qs}` : target;

    const headers = { 'User-Agent': 'oc6-proxy/1.0' };

    // Forward OAuth Authorization header if present
    if (req.headers.authorization)
      headers['Authorization'] = req.headers.authorization;

    // Forward the legacy session cookie as consumer_key for OKAPI
    const cookie = req.cookies?.ocdevelopmentdata || req.headers.cookie;
    if (cookie)
      headers['Cookie'] = cookie;

    const body = req.method === 'POST' || req.method === 'PUT'
      ? await new Response(req).text()
      : undefined;

    const fetchResp = await fetch(url, {
      method: req.method,
      headers,
      body,
    });

    const contentType = fetchResp.headers.get('content-type') || '';
    res.status(fetchResp.status);

    // Forward relevant headers
    for (const [k, v] of fetchResp.headers) {
      if (['content-type', 'x-okapi-', 'access-control-'].some(p => k.toLowerCase().startsWith(p)))
        res.set(k, v);
    }

    if (contentType.includes('json')) {
      res.json(await fetchResp.json());
    } else {
      res.send(await fetchResp.text());
    }
  } catch (err) {
    res.status(502).json({ error: 'OKAPI unreachable', detail: err.message });
  }
});

// ── Page shells: serve static HTML from oc-frontend templates ──
const PAGES = {
  '':                    'index.html',
  'caches/search':       'caches/search.html',
  'cache/new':           'caches/new.html',
  'cache/:wp':           'caches/detail.html',
  'user/search':         'user/search.html',
  'livemap':             'maps/livemap.html',
  'login':               'login.html',
};

// SPA fallback: all routes that don't match /_frontend/ or /api/ get index.html
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: 'public/_frontend/templates' }, (err) => {
    if (err) res.sendFile('index.html', { root: 'public/_frontend/templates' });
  });
});

app.listen(PORT, () => console.log(`oc6 running on http://localhost:${PORT}`));
