// Data layer — all SQL lives here (the OC5 convention, carried into OC6).
// Typed result, raw parameterised SQL via the mariadb pool. This is a trimmed
// port of OC5's ocGetCacheDetail (src/data/caches.js) — enough to prove real
// data flows end to end through the new stack.
import { pool } from '../db';

export interface CacheDetail {
  referenceCode: string;
  name: string;
  lat: number;
  lon: number;
  difficulty: number;
  terrain: number;
  typeName: string;
  sizeName: string;
  statusName: string;
  ownerName: string;
  findCount: number;
}

export async function ocGetCacheDetail(wp: string): Promise<CacheDetail | null> {
  const rows = (await pool.query(
    `SELECT c.wp_oc, c.name, c.latitude, c.longitude,
            c.difficulty / 2 AS difficulty, c.terrain / 2 AS terrain,
            ct.en AS type_name, cs.name AS size_name, cst.en AS status_name,
            u.username AS owner_name, IFNULL(sc.found, 0) AS find_count
       FROM caches c
       JOIN cache_type   ct  ON c.type    = ct.id
       JOIN cache_size   cs  ON c.size    = cs.id
       JOIN cache_status cst ON c.status  = cst.id
       JOIN user         u   ON c.user_id = u.user_id
       LEFT JOIN stat_caches sc ON c.cache_id = sc.cache_id
      WHERE c.wp_oc = ?
      LIMIT 1`,
    [wp],
  )) as Record<string, unknown>[];

  const r = rows[0];
  if (!r) return null;

  return {
    referenceCode: String(r.wp_oc),
    name: String(r.name),
    lat: Number(r.latitude),
    lon: Number(r.longitude),
    difficulty: Number(r.difficulty),
    terrain: Number(r.terrain),
    typeName: String(r.type_name),
    sizeName: String(r.size_name),
    statusName: String(r.status_name),
    ownerName: String(r.owner_name),
    findCount: Number(r.find_count),
  };
}
