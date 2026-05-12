import { createHash } from "node:crypto";

import { buildAgentFixPrompts } from "@/lib/agent-fix-prompt";
import { runAudit } from "@/lib/audit";
import type { AuditResult } from "@/lib/audit-types";
import { getCachedAudit, setCachedAudit } from "@/lib/turso";
import { auditUrlFromDomain, normalizeDomain } from "@/lib/url";

export type PerformAuditResult =
  | {
      status: "ready";
      audit: AuditResult;
      cached: boolean;
      updatedAt?: number;
      domain: string;
    }
  | { status: "error"; message: string }
  | { status: "missing-env"; message: string; missing: string[] };

export const INVALID_DOMAIN_MESSAGE = "Enter a valid domain.";

export async function performAudit(
  rawDomain: string,
  opts?: { refresh?: boolean },
): Promise<PerformAuditResult> {
  const refresh = opts?.refresh ?? false;
  const domain = normalizeDomain(rawDomain);
  if (!domain) {
    return {
      status: "error",
      message: INVALID_DOMAIN_MESSAGE,
    };
  }

  const apiKey = process.env.CONTEXT_DEV_API_KEY;
  if (!apiKey) {
    return {
      status: "missing-env",
      message: "Missing CONTEXT_DEV_API_KEY.",
      missing: ["CONTEXT_DEV_API_KEY"],
    };
  }

  const url = auditUrlFromDomain(domain);

  // Bump when AuditResult shape changes so stale blobs are not served.
  const CACHE_SCHEMA_VERSION = "v12";
  const cacheKey = createHash("sha256")
    .update(`${CACHE_SCHEMA_VERSION}:${domain}`)
    .digest("hex");
  if (!refresh) {
    const cached = await getCachedAudit(cacheKey);
    if (cached) {
      return {
        status: "ready",
        audit: ensureAgentPrompts(cached.audit),
        cached: true,
        updatedAt: cached.updatedAt,
        domain,
      };
    }
  }

  try {
    const audit = await runAudit(url, apiKey);
    await setCachedAudit(cacheKey, url, audit);
    return { status: "ready", audit, cached: false, domain };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Audit failed.",
    };
  }
}

function ensureAgentPrompts(audit: AuditResult): AuditResult {
  if (audit.agentPrompts?.full) return audit;
  return {
    ...audit,
    agentPrompts: buildAgentFixPrompts(audit as Omit<AuditResult, "agentPrompts">),
  };
}
