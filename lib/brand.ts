import { ContextDev } from "context.dev";

import type {
  BrandBackdrop,
  BrandColor,
  BrandIndustry,
  BrandInfo,
  BrandLogo,
} from "@/lib/brand-types";
import { getCachedBrand, setCachedBrand } from "@/lib/turso";

const BRAND_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export type FetchBrandResult = {
  brand: BrandInfo | null;
  cached: boolean;
  updatedAt?: number;
};

export async function fetchBrand(
  domain: string,
  apiKey: string,
): Promise<FetchBrandResult> {
  if (!domain) return { brand: null, cached: false };

  const cached = await getCachedBrand(domain);
  if (cached && Date.now() - cached.updatedAt < BRAND_CACHE_TTL_MS) {
    return { brand: cached.brand, cached: true, updatedAt: cached.updatedAt };
  }

  try {
    const client = new ContextDev({ apiKey });
    const response = await client.brand.retrieve({ domain });
    const brand = normalizeBrand(response, domain);
    await setCachedBrand(domain, brand);
    return { brand, cached: false };
  } catch {
    // Never let a brand-lookup failure break the audit page.
    // Cache the null so we don't keep hammering the API for unknown domains.
    await setCachedBrand(domain, null);
    return { brand: null, cached: false };
  }
}

type RawBrand = {
  brand?: {
    domain?: string;
    title?: string;
    description?: string;
    slogan?: string;
    logos?: Array<{
      url?: string;
      type?: "icon" | "logo";
      mode?: "light" | "dark" | "has_opaque_background";
    }>;
    backdrops?: Array<{
      url?: string;
      resolution?: { aspect_ratio?: number };
    }>;
    colors?: Array<{ hex?: string; name?: string }>;
    industries?: {
      eic?: Array<{ industry?: string; subindustry?: string }>;
    };
  };
};

function normalizeBrand(raw: RawBrand, fallbackDomain: string): BrandInfo {
  const b = raw.brand ?? {};
  const logos: BrandLogo[] = (b.logos ?? [])
    .filter((l): l is { url: string } & typeof l => Boolean(l.url))
    .map((l) => ({ url: l.url, type: l.type, mode: l.mode }));

  const backdrops: BrandBackdrop[] = (b.backdrops ?? [])
    .filter((bd): bd is { url: string } & typeof bd => Boolean(bd.url))
    .map((bd) => ({
      url: bd.url,
      aspectRatio: bd.resolution?.aspect_ratio,
    }));

  const colors: BrandColor[] = (b.colors ?? [])
    .filter((c): c is { hex: string } & typeof c => Boolean(c.hex))
    .map((c) => ({ hex: c.hex, name: c.name }));

  const industries: BrandIndustry[] = (b.industries?.eic ?? [])
    .filter(
      (i): i is { industry: string; subindustry: string } =>
        Boolean(i.industry) && Boolean(i.subindustry),
    )
    .map((i) => ({ industry: i.industry, subindustry: i.subindustry }));

  return {
    domain: b.domain ?? fallbackDomain,
    title: b.title ?? null,
    description: b.description ?? null,
    slogan: b.slogan ?? null,
    logos,
    backdrops,
    colors,
    industries,
  };
}

export function pickHeroLogo(logos: BrandLogo[]): BrandLogo | null {
  if (!logos.length) return null;
  return (
    logos.find((l) => l.type === "logo" && l.mode === "light") ??
    logos.find((l) => l.type === "logo" && l.mode === "has_opaque_background") ??
    logos.find((l) => l.type === "logo") ??
    logos.find((l) => l.mode === "light") ??
    logos[0]
  );
}

export function pickHeroBackdrop(
  backdrops: BrandBackdrop[],
): BrandBackdrop | null {
  if (!backdrops.length) return null;
  return (
    backdrops.find((b) => (b.aspectRatio ?? 0) >= 1.6) ?? backdrops[0]
  );
}

export function uniqueIndustryLabels(industries: BrandIndustry[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const i of industries) {
    if (!seen.has(i.subindustry)) {
      seen.add(i.subindustry);
      out.push(i.subindustry);
    }
    if (!seen.has(i.industry)) {
      seen.add(i.industry);
      out.push(i.industry);
    }
  }
  return out;
}
