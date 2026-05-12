import type { Metadata } from "next";
import Link from "next/link";

import { AuditForm } from "@/components/audit-form";
import { AuditResultsView } from "@/components/audit-results-view";
import { fetchBrand } from "@/lib/brand";
import { performAudit } from "@/lib/perform-audit";

export const runtime = "nodejs";
export const maxDuration = 120;

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.freeaiseoaudit.com/";

type PageProps = {
  params: Promise<{ domain: string }>;
  searchParams: Promise<{ refresh?: string }>;
};

function decodeDomain(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { domain } = await params;
  const decoded = decodeDomain(domain);
  const canonical = `/audit/${encodeURIComponent(decoded)}`;
  const title = `${decoded} | AI SEO Audit & Visibility Score`;
  const description = `See how ${decoded} scores for ChatGPT, Claude, and Perplexity. Free AI SEO audit covering crawlability, schema, content chunking, and trust signals, with a copy-paste fix prompt.`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: false,
      follow: true,
      googleBot: {
        index: false,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
      },
    },
  };
}

export default async function AuditPage({ params, searchParams }: PageProps) {
  const { domain } = await params;
  const sp = await searchParams;
  const refresh = sp.refresh === "true" || sp.refresh === "1";
  const decoded = decodeDomain(domain);

  const apiKey = process.env.CONTEXT_DEV_API_KEY;
  const [result, brandResult] = await Promise.all([
    performAudit(decoded, { refresh }),
    apiKey
      ? fetchBrand(decoded, apiKey)
      : Promise.resolve({ brand: null, cached: false }),
  ]);

  if (result.status === "missing-env") {
    return (
      <ErrorScreen
        eyebrow="missing config"
        title="Set CONTEXT_DEV_API_KEY."
        message="The server is missing CONTEXT_DEV_API_KEY. Set the environment variable and reload."
      />
    );
  }

  if (result.status === "error") {
    return (
      <ErrorScreen
        eyebrow={`could not audit ${decoded}`}
        title="Audit failed."
        message={result.message}
        retryDomain={decoded}
      />
    );
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "AI SEO Audit",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: decoded,
        item: `${siteUrl}/audit/${encodeURIComponent(decoded)}`,
      },
    ],
  };

  const reportSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `AI SEO Audit | ${decoded}`,
    url: `${siteUrl}/audit/${encodeURIComponent(decoded)}`,
    description: `AI SEO readability audit and 0–100 visibility score for ${decoded}.`,
    isPartOf: {
      "@type": "WebSite",
      name: "AI SEO Audit",
      url: siteUrl,
    },
    about: {
      "@type": "WebSite",
      url: `https://${decoded}`,
      name: decoded,
    },
  };
  if (result.updatedAt) {
    reportSchema.dateModified = new Date(result.updatedAt).toISOString();
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reportSchema) }}
      />
      <AuditResultsView
        audit={result.audit}
        cached={result.cached}
        updatedAt={result.updatedAt}
        brand={brandResult.brand}
      />
    </>
  );
}

function ErrorScreen({
  eyebrow,
  title,
  message,
  retryDomain,
}: {
  eyebrow: string;
  title: string;
  message: string;
  retryDomain?: string;
}) {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-canvas">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -bottom-32 select-none text-[24rem] font-medium leading-none tracking-tighter text-red/5 sm:text-[32rem]"
      >
        ✕
      </div>
      <section className="relative mx-auto grid w-full max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-24">
        <div className="font-mono text-xs uppercase tracking-[0.28em] text-red">
          ◢ {eyebrow}
        </div>
        <h1 className="max-w-3xl text-5xl font-medium tracking-[-0.03em] text-balance text-ink sm:text-7xl">
          {title}
        </h1>
        <p className="max-w-prose text-base/7 text-pretty text-muted sm:text-lg/8">
          {message}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-6 font-mono text-xs uppercase tracking-[0.22em]">
          <Link
            href="/"
            className="border-b-2 border-ink pb-1 text-ink transition hover:border-teal hover:text-teal"
          >
            ◂ back home
          </Link>
          {retryDomain ? (
            <span className="text-muted">
              tried: <span className="text-ink">{retryDomain}</span>
            </span>
          ) : null}
        </div>
        <div className="mt-8 max-w-xl border-t hairline pt-8">
          <AuditForm initialDomain={retryDomain} />
        </div>
      </section>
    </main>
  );
}
