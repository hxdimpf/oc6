// Auth middleware — the OC6 analog of OC5's src/auth.js. In the real port this
// validates the legacy session cookie against sys_sessions and loads the user;
// for the spike it sets an anonymous user so the typed `c.get('user')` pattern
// is demonstrated end to end.
import { createMiddleware } from 'hono/factory';

export interface User {
  id: number;
  username: string | null;
}

export type AuthEnv = { Variables: { user: User } };

export const auth = createMiddleware<AuthEnv>(async (c, next) => {
  // TODO(real port): read `oc5_session` cookie → validate against sys_sessions.
  c.set('user', { id: 0, username: null });
  await next();
});
