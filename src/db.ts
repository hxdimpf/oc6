// MariaDB connection pool — the OC6 analog of OC5's src/db.js. Same pure-JS
// `mariadb` driver; the whole point of the spike is to prove it runs on Bun.
import { createPool, type Pool } from 'mariadb';
import { loadConfig } from './config';

const { db } = loadConfig();

export const pool: Pool = createPool({
  host: db.host,
  port: db.port,
  user: db.user,
  password: db.password,
  database: db.database,
  connectionLimit: 5,
  connectTimeout: 5000,
  // mariadb returns BigInt for some columns; coerce to Number for JSON-friendliness
  insertIdAsNumber: true,
  decimalAsNumber: true,
  bigIntAsNumber: true,
});
