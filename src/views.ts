// Nunjucks rendering — the same engine OC5 uses (templates derived from OC4 Twig).
// Proves the pure-JS nunjucks package runs under Bun.
import nunjucks from 'nunjucks';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const env = nunjucks.configure(join(here, '..', 'views'), {
  autoescape: true,
  noCache: true,
});

export function render(tpl: string, ctx: Record<string, unknown> = {}): string {
  return env.render(tpl, ctx);
}
