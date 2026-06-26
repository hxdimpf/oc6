// Typed config, read from the environment at startup. Bun loads .env natively —
// no dotenv. Fails fast if DATABASE_URL is missing.

export interface DbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export interface Config {
  port: number;
  db: DbConfig;
}

export function loadConfig(env: Record<string, string | undefined> = Bun.env): Config {
  const raw = env.DATABASE_URL;
  if (!raw) {
    throw new Error('Missing DATABASE_URL (mysql://user:pass@host:port/db)');
  }
  const u = new URL(raw);
  return {
    port: Number(env.PORT ?? 3000),
    db: {
      host: u.hostname,
      port: Number(u.port || 3306),
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: u.pathname.replace('/', ''),
    },
  };
}
