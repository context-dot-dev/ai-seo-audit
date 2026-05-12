import { createClient, type Client } from "@libsql/client";

import type { AuditResult } from "@/lib/audit-types";
import type { BrandInfo } from "@/lib/brand-types";

/** Audit cache TTL: 7 days in milliseconds. */
export const AUDIT_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7;

type CachedAuditRow = {
  audit: AuditResult;
  updatedAt: number;
};

export type CachedBrandRow = {
  brand: BrandInfo | null;
  updatedAt: number;
};

let client: Client | null = null;
let initPromise: Promise<void> | null = null;
let brandInitPromise: Promise<void> | null = null;

function getClient(): Client | null {
  const url =
    process.env.aiseo_TURSO_DATABASE_URL ?? process.env.TURSO_DATABASE_URL;
  const authToken =
    process.env.aiseo_TURSO_AUTH_TOKEN ?? process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) return null;
  if (!client) {
    client = createClient({ url, authToken });
  }
  return client;
}

function ensureInitialized(c: Client): Promise<void> {
  if (!initPromise) {
    initPromise = c
      .execute(
        `CREATE TABLE IF NOT EXISTS audit_cache (
          cache_key TEXT PRIMARY KEY,
          url TEXT NOT NULL,
          value TEXT NOT NULL,
          updated_at INTEGER NOT NULL
        )`,
      )
      .then(() => undefined)
      .catch((err) => {
        initPromise = null;
        throw err;
      });
  }
  return initPromise;
}

export function isTursoEnabled(): boolean {
  return !!getClient();
}

export async function getCachedAudit(
  cacheKey: string,
): Promise<CachedAuditRow | null> {
  const c = getClient();
  if (!c) return null;

  try {
    await ensureInitialized(c);
    const result = await c.execute({
      sql: "SELECT value, updated_at FROM audit_cache WHERE cache_key = ? LIMIT 1",
      args: [cacheKey],
    });
    const row = result.rows[0];
    if (!row) return null;
    const updatedAt = Number(row.updated_at);
    // Reject stale cache entries older than the TTL.
    if (Date.now() - updatedAt > AUDIT_CACHE_TTL_MS) {
      return null;
    }
    return {
      audit: JSON.parse(row.value as string) as AuditResult,
      updatedAt,
    };
  } catch {
    return null;
  }
}

export async function setCachedAudit(
  cacheKey: string,
  url: string,
  audit: AuditResult,
): Promise<void> {
  const c = getClient();
  if (!c) return;

  try {
    await ensureInitialized(c);
    await c.execute({
      sql: `INSERT INTO audit_cache (cache_key, url, value, updated_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(cache_key) DO UPDATE SET
              url = excluded.url,
              value = excluded.value,
              updated_at = excluded.updated_at`,
      args: [cacheKey, url, JSON.stringify(audit), Date.now()],
    });
  } catch {
    // Cache writes are best-effort; the audit should still return.
  }
}

function ensureBrandInitialized(c: Client): Promise<void> {
  if (!brandInitPromise) {
    brandInitPromise = c
      .execute(
        `CREATE TABLE IF NOT EXISTS brand_cache (
          domain TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at INTEGER NOT NULL
        )`,
      )
      .then(() => undefined)
      .catch((err) => {
        brandInitPromise = null;
        throw err;
      });
  }
  return brandInitPromise;
}

export async function getCachedBrand(
  domain: string,
): Promise<CachedBrandRow | null> {
  const c = getClient();
  if (!c) return null;

  try {
    await ensureBrandInitialized(c);
    const result = await c.execute({
      sql: "SELECT value, updated_at FROM brand_cache WHERE domain = ? LIMIT 1",
      args: [domain],
    });
    const row = result.rows[0];
    if (!row) return null;
    return {
      brand: JSON.parse(row.value as string) as BrandInfo | null,
      updatedAt: Number(row.updated_at),
    };
  } catch {
    return null;
  }
}

export async function setCachedBrand(
  domain: string,
  brand: BrandInfo | null,
): Promise<void> {
  const c = getClient();
  if (!c) return;

  try {
    await ensureBrandInitialized(c);
    await c.execute({
      sql: `INSERT INTO brand_cache (domain, value, updated_at)
            VALUES (?, ?, ?)
            ON CONFLICT(domain) DO UPDATE SET
              value = excluded.value,
              updated_at = excluded.updated_at`,
      args: [domain, JSON.stringify(brand), Date.now()],
    });
  } catch {
    // best-effort
  }
}
