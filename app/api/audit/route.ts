import { NextRequest, NextResponse } from "next/server";

import type { AuditApiResponse } from "@/lib/audit-types";
import { INVALID_DOMAIN_MESSAGE, performAudit } from "@/lib/perform-audit";

export const runtime = "nodejs";
export const maxDuration = 120;

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=900",
  "CDN-Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
  "Vercel-CDN-Cache-Control":
    "public, s-maxage=86400, stale-while-revalidate=604800",
};

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  return respond(sp.get("domain") ?? "", sp.get("refresh") === "true" || sp.get("refresh") === "1");
}

export async function POST(req: NextRequest) {
  let body: { domain?: string; refresh?: boolean };
  try {
    body = (await req.json()) as { domain?: string; refresh?: boolean };
  } catch {
    return NextResponse.json(
      {
        status: "error",
        message: "Invalid JSON body.",
      } satisfies AuditApiResponse,
      { status: 400 },
    );
  }
  return respond(body.domain ?? "", body.refresh ?? false);
}

async function respond(domain: string, refresh: boolean) {
  const result = await performAudit(domain, { refresh });

  if (result.status === "ready") {
    const payload: AuditApiResponse = {
      status: "ready",
      audit: result.audit,
      cached: result.cached,
      updatedAt: result.updatedAt,
    };
    return NextResponse.json(payload, { headers: CACHE_HEADERS });
  }

  if (result.status === "missing-env") {
    const payload: AuditApiResponse = {
      status: "missing-env",
      message: result.message,
      missing: result.missing,
    };
    return NextResponse.json(payload, { status: 500 });
  }

  const status = result.message === INVALID_DOMAIN_MESSAGE ? 400 : 502;
  const payload: AuditApiResponse = {
    status: "error",
    message: result.message,
  };
  return NextResponse.json(payload, { status });
}
