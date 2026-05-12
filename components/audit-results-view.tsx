"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  Check,
  CheckCircle2,
  CircleDashed,
  Copy,
  ExternalLink,
  MinusCircle,
  XCircle,
} from "lucide-react";

import type {
  AuditCategory,
  AuditItem,
  AuditResult,
  AuditStatus,
} from "@/lib/audit-types";
import { pickHeroLogo, uniqueIndustryLabels } from "@/lib/brand";
import type { BrandInfo } from "@/lib/brand-types";

const CONTEXT_DEV_ENDPOINTS = [
  "/web/scrape/html",
  "/web/scrape/markdown",
  "/web/scrape/sitemap",
] as const;

function contextDevHref(host: string, campaign: string): string {
  const params = new URLSearchParams({
    utm_source: "ai-seo-audit",
    utm_medium: "audit_hero",
    utm_campaign: campaign,
    utm_content: host,
  });
  return `https://context.dev/?${params.toString()}`;
}

type AuditResultsViewProps = {
  audit: AuditResult;
  cached: boolean;
  updatedAt?: number;
  brand?: BrandInfo | null;
};

export function AuditResultsView({
  audit,
  cached,
  updatedAt,
  brand,
}: AuditResultsViewProps) {
  const score = Math.round(audit.score);
  const percent = Math.max(0, Math.min(100, audit.score));
  const [refreshing, setRefreshing] = useState(false);

  const promptsById = useMemo(() => {
    const map = new Map<string, string>();
    for (const issue of audit.agentPrompts.topIssues) {
      map.set(issue.id, issue.prompt);
    }
    return map;
  }, [audit.agentPrompts.topIssues]);

  const [copiedKey, setCopiedKey] = useState("");
  async function copyPrompt(key: string, prompt: string) {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedKey(key);
      window.setTimeout(
        () => setCopiedKey((current) => (current === key ? "" : current)),
        1800,
      );
    } catch {
      /* ignore clipboard errors */
    }
  }

  const counts = useMemo(
    () => countStatuses(audit.categories),
    [audit.categories],
  );

  function reRunAudit() {
    setRefreshing(true);
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set("refresh", "1");
    window.location.href = currentUrl.toString();
  }

  return (
    <main className="bg-canvas">
      {/* Top utility strip */}
      <div className="border-b hairline bg-canvas/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] text-muted transition hover:text-ink"
          >
            <ArrowLeft className="size-3.5" />
            new audit
          </Link>
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-muted">
            {cached ? <span>cached</span> : <span>fresh</span>}
            {updatedAt ? <span className="text-ink/40">·</span> : null}
            {updatedAt ? (
              <time dateTime={new Date(updatedAt).toISOString()}>
                {formatTimestamp(updatedAt)}
              </time>
            ) : null}
            {cached ? (
              <>
                <span className="text-ink/40">·</span>
                <button
                  type="button"
                  disabled={refreshing}
                  onClick={reRunAudit}
                  className="underline decoration-ink/20 decoration-1 underline-offset-4 transition hover:text-teal hover:decoration-teal disabled:opacity-50"
                >
                  {refreshing ? "refreshing..." : "re-run audit"}
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden border-b hairline">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -bottom-32 select-none text-[20rem] font-medium leading-[0.8] tracking-tighter text-ink/[0.04] tabular-nums sm:text-[32rem]"
        >
          {score}
        </div>
        <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[7fr_5fr] lg:items-end lg:gap-16">
          <div className="flex flex-col justify-end">
            <div className="flex flex-wrap items-center gap-2">
              <BandBadge label={audit.band.label} />
            </div>
            <div className="flex flex-row space-x-2 items-end justify-start mb-2">
              {brand?.logos[0] ? (
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg p-1.5 bg-white outline-1 -outline-offset-1 outline-ink/10 flex flex-row space-x-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={brand?.logos[0].url}
                    alt={`${brand?.title ?? audit.host} logo`}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ) : null}
              <h1 className="mt-5 text-4xl font-medium tracking-[-0.03em] text-balance text-ink sm:text-5xl/[1.05]">
                {brand?.title ?? audit.title ?? brand?.title ?? audit.host}
              </h1>
            </div>
            {brand?.slogan ? (
              <div className="mt-0.5 truncate font-mono text-[0.6875rem] uppercase tracking-[0.22em] text-muted">
                {brand?.slogan}
              </div>
            ) : null}
            {brand?.industries.length ? (
              <ul role="list" className="flex flex-wrap gap-1.5 my-2">
                {brand?.industries.map((label) => (
                  <li
                    key={label.subindustry}
                    className="rounded-full bg-soft px-2.5 py-1 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-muted outline-1 -outline-offset-1 outline-ink/5"
                  >
                    {label.subindustry}
                  </li>
                ))}
              </ul>
            ) : null}
            <a
              href={audit.url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 font-mono text-sm text-muted transition hover:text-ink"
            >
              {audit.host}
              <ExternalLink className="size-3.5" />
            </a>
            <p className="mt-6 max-w-prose text-base/7 text-pretty text-muted">
              {audit.band.interpretation}
            </p>

            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-t hairline pt-6 font-mono sm:grid-cols-4">
              <Stat label="words" value={audit.stats.words.toLocaleString()} />
              <Stat
                label="headings"
                value={audit.stats.headings.toLocaleString()}
              />
              <Stat
                label="ext links"
                value={audit.stats.externalLinks.toLocaleString()}
              />
              <Stat
                label="json-ld"
                value={audit.stats.jsonLdBlocks.toLocaleString()}
              />
            </dl>
          </div>

          <div className="lg:text-right">
            <div className="font-mono text-xs uppercase tracking-[0.28em] text-muted">
              score
            </div>
            <div className="mt-2 flex items-baseline gap-2 lg:justify-end">
              <span className="text-8xl font-medium leading-none tracking-[-0.04em] tabular-nums text-ink sm:text-9xl lg:text-[10rem]">
                {score}
              </span>
              <span className="font-mono text-2xl tabular-nums text-ink/30">
                /100
              </span>
            </div>
            <div className="mt-5 h-1.5 w-full bg-ink/5">
              <div
                className="h-full bg-teal"
                style={{ width: `${percent}%` }}
                aria-hidden
              />
            </div>
            <dl className="mt-6 grid grid-cols-4 gap-2 font-mono lg:justify-end">
              <CountChip label="pass" value={counts.pass} tone="green" />
              <CountChip label="partial" value={counts.partial} tone="amber" />
              <CountChip label="fail" value={counts.fail} tone="red" />
              {counts.na > 0 ? (
                <CountChip label="n/a" value={counts.na} tone="muted" />
              ) : null}
            </dl>
          </div>
        </div>
      </section>

      {/* EXPERIMENTAL ADVISORY */}
      <aside
        role="note"
        aria-label="Experimental field advisory"
        className="border-b hairline bg-amber/[0.06]"
      >
        <div className="mx-auto flex w-full max-w-7xl items-start gap-4 px-5 py-4 sm:px-8 sm:py-5">
          <AlertTriangle
            aria-hidden
            className="mt-0.5 size-4 shrink-0 text-amber"
          />
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[0.6875rem] uppercase tracking-[0.22em] text-amber">
              ◢ experimental field
            </div>
            <p className="mt-1.5 text-sm/6 text-pretty text-muted sm:text-base/7">
              AI SEO, also known as GEO (generative engine optimization), is a
              new and rapidly evolving discipline. The signals that move
              visibility in ChatGPT, Claude, and Perplexity shift as providers
              update their crawlers, training data, and retrieval. Treat this
              report as a directional snapshot, not a fixed checklist.
            </p>
          </div>
        </div>
      </aside>

      {/* FIX PROMPTS */}
      <section id="fixes" className="border-b hairline">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[5fr_7fr] lg:gap-16">
          <header>
            <div className="font-mono text-xs uppercase tracking-[0.28em] text-teal">
              {"// fix prompts"}
            </div>
            <h2 className="mt-4 text-3xl font-medium tracking-[-0.02em] text-balance text-ink sm:text-5xl/[1.05]">
              Hand the whole audit to your agent.
            </h2>
            <p className="mt-5 max-w-prose text-base/7 text-pretty text-muted">
              Copy a consolidated prompt for every actionable issue, or grab a
              single fix at a time from the checklist below.
            </p>
            <div className="mt-6">
              <CopyAction
                size="lg"
                copied={copiedKey === "full"}
                label="Copy full fix prompt"
                onClick={() => void copyPrompt("full", audit.agentPrompts.full)}
              />
            </div>
          </header>
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.28em] text-muted">
              top priorities · {audit.topPriorities.length}
            </div>
            <ol
              role="list"
              className="mt-5 divide-y divide-ink/10 border-y hairline"
            >
              {audit.topPriorities.length ? (
                audit.topPriorities.map((priority, index) => (
                  <li
                    key={priority}
                    className="grid grid-cols-[2.5rem_1fr] gap-4 py-4"
                  >
                    <span className="font-mono text-sm tabular-nums text-muted">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="text-base/7 text-pretty text-ink">
                      {priority}
                    </p>
                  </li>
                ))
              ) : (
                <li className="py-4 text-base/7 text-muted">
                  No failing automated checks. Manual items still need a human
                  review.
                </li>
              )}
            </ol>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      {audit.categories.map((category) => (
        <CategorySection
          key={category.id}
          category={category}
          promptsById={promptsById}
          copiedKey={copiedKey}
          onCopy={copyPrompt}
        />
      ))}

      {/* DIAGNOSTICS */}
      <section className="border-b hairline">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 py-12 sm:px-8 lg:grid-cols-[5fr_7fr] lg:gap-16">
          <header>
            <div className="font-mono text-xs uppercase tracking-[0.28em] text-teal">
              {"// diagnostics"}
            </div>
            <h2 className="mt-4 text-3xl font-medium tracking-[-0.02em] text-balance text-ink sm:text-4xl">
              Fetch trace
            </h2>
          </header>
          <dl className="grid gap-0 divide-y divide-ink/10 border-y hairline font-mono text-sm">
            <DiagnosticRow
              label="Context.dev HTML"
              value={audit.diagnostics.contextDevHtml}
            />
            <DiagnosticRow
              label="Context.dev markdown"
              value={audit.diagnostics.contextDevMarkdown}
            />
            <DiagnosticRow
              label="JSON-LD parse failures"
              value={audit.diagnostics.jsonLdParseFailures}
            />
          </dl>
        </div>
      </section>
    </main>
  );
}

/* ---------------- Sub-components ---------------- */

function CategorySection({
  category,
  promptsById,
  copiedKey,
  onCopy,
}: {
  category: AuditCategory;
  promptsById: Map<string, string>;
  copiedKey: string;
  onCopy: (key: string, prompt: string) => void;
}) {
  const percent = Math.round((category.score / category.maxScore) * 100);
  const counts = useMemo(() => countStatuses([category]), [category]);

  return (
    <section className="border-b hairline">
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 py-12 sm:px-8 sm:py-14 lg:grid-cols-[5fr_7fr] lg:gap-16">
        <header className="lg:sticky lg:top-6 lg:self-start">
          <div className="font-mono text-xs uppercase tracking-[0.28em] text-teal">
            category 0{category.id}
          </div>
          <h2 className="mt-4 text-3xl font-medium tracking-[-0.02em] text-balance text-ink sm:text-5xl/[1.05]">
            {category.name}
          </h2>
          <p className="mt-5 max-w-prose text-base/7 text-pretty text-muted">
            {category.description}
          </p>

          <div className="mt-8 flex items-baseline justify-between font-mono">
            <span className="text-xs uppercase tracking-[0.22em] text-muted">
              score
            </span>
            <span className="text-2xl font-medium tabular-nums text-ink">
              {category.score.toFixed(1)}
              <span className="text-ink/30">/{category.maxScore}</span>
              <span className="ml-2 text-xs uppercase tracking-[0.22em] text-muted">
                {percent}%
              </span>
            </span>
          </div>
          <div className="mt-3 h-1 w-full bg-ink/5">
            <div className="h-full bg-teal" style={{ width: `${percent}%` }} />
          </div>

          <dl className="mt-5 grid grid-cols-4 gap-2 font-mono">
            <CountChip label="pass" value={counts.pass} tone="green" />
            <CountChip label="partial" value={counts.partial} tone="amber" />
            <CountChip label="fail" value={counts.fail} tone="red" />
            {category.naExcluded > 0 ? (
              <CountChip label="n/a" value={category.naExcluded} tone="muted" />
            ) : null}
          </dl>
        </header>

        <div className="divide-y divide-ink/10 border-y hairline">
          {category.items.map((item) => (
            <CheckRow
              key={item.id}
              item={item}
              prompt={promptsById.get(item.id)}
              copiedKey={copiedKey}
              onCopy={onCopy}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function CheckRow({
  item,
  prompt,
  copiedKey,
  onCopy,
}: {
  item: AuditItem;
  prompt: string | undefined;
  copiedKey: string;
  onCopy: (key: string, prompt: string) => void;
}) {
  const status = statusStyle(item.status);
  const Icon = status.icon;
  const actionable = item.status === "fail" || item.status === "partial";

  return (
    <article className="grid gap-3 py-5">
      <div className="flex items-start gap-4">
        <Icon
          aria-hidden
          className={`mt-1 size-5 shrink-0 ${status.iconClass}`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-mono text-xs uppercase tracking-[0.22em] text-muted tabular-nums">
              {item.id}
            </span>
            <h3 className="text-lg font-medium tracking-tight text-balance text-ink sm:text-xl">
              {item.label}
            </h3>
            <span className={status.badgeClass}>{status.label}</span>
          </div>
          <p className="mt-3 text-base/7 text-pretty text-muted">
            {item.evidence}
          </p>
          {actionable ? (
            <p className="mt-3 border-l-2 border-teal/30 pl-3 text-base/7 text-pretty text-ink">
              {item.recommendation}
            </p>
          ) : null}
        </div>
        {item.maxScore > 0 ? (
          <div className="shrink-0 text-right font-mono">
            <div className="text-lg tabular-nums text-ink">
              {item.score.toFixed(1)}
            </div>
            <div className="text-xs uppercase tracking-wider text-muted">
              /{item.maxScore}
            </div>
          </div>
        ) : null}
      </div>
      {prompt ? (
        <div className="pl-9">
          <CopyAction
            size="sm"
            copied={copiedKey === item.id}
            label="Copy fix prompt"
            onClick={() => onCopy(item.id, prompt)}
          />
        </div>
      ) : null}
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.22em] text-muted">
        {label}
      </dt>
      <dd className="mt-1.5 text-2xl font-medium tabular-nums text-ink sm:text-3xl">
        {value}
      </dd>
    </div>
  );
}

function CountChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "green" | "amber" | "red" | "muted";
}) {
  const toneClass = {
    green: "text-green",
    amber: "text-amber",
    red: "text-red",
    muted: "text-muted",
  }[tone];
  return (
    <div className="border-t-2 pt-1.5" style={toneBorder(tone)}>
      <div className={`text-lg font-medium tabular-nums ${toneClass}`}>
        {value}
      </div>
      <div className="text-[0.65rem] uppercase tracking-[0.18em] text-muted">
        {label}
      </div>
    </div>
  );
}

function toneBorder(tone: "green" | "amber" | "red" | "muted") {
  const color = {
    green: "var(--color-green)",
    amber: "var(--color-amber)",
    red: "var(--color-red)",
    muted: "var(--color-line)",
  }[tone];
  return { borderTopColor: color };
}

function DiagnosticRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-baseline gap-4 py-3">
      <dt className="text-xs uppercase tracking-[0.22em] text-muted">
        {label}
      </dt>
      <dd className="text-base tabular-nums text-ink">{value}</dd>
    </div>
  );
}

function CopyAction({
  copied,
  label,
  onClick,
  size,
}: {
  copied: boolean;
  label: string;
  onClick: () => void;
  size: "sm" | "lg";
}) {
  const isLg = size === "lg";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-flex items-center gap-2 border-b-2 transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal ${
        copied
          ? "border-green text-green"
          : "border-ink text-ink hover:border-teal hover:text-teal"
      } ${
        isLg
          ? "pb-1 font-mono text-sm uppercase tracking-[0.22em]"
          : "pb-0.5 font-mono text-xs uppercase tracking-[0.18em]"
      }`}
    >
      {copied ? (
        <Check className={isLg ? "size-4" : "size-3.5"} />
      ) : (
        <Copy className={isLg ? "size-4" : "size-3.5"} />
      )}
      {copied ? "copied" : label}
    </button>
  );
}

function BandBadge({ label }: { label: AuditResult["band"]["label"] }) {
  const tone = {
    Critical: "bg-red/10 text-red",
    "Below average": "bg-amber/10 text-amber",
    Average: "bg-teal-soft text-teal",
    Strong: "bg-green/10 text-green",
    Excellent: "bg-ink text-white",
  }[label];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs uppercase tracking-[0.22em] ${tone}`}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {label}
    </span>
  );
}

/* ---------------- helpers ---------------- */

function statusStyle(status: AuditStatus) {
  switch (status) {
    case "pass":
      return {
        label: "Pass",
        icon: CheckCircle2,
        iconClass: "text-green",
        badgeClass:
          "rounded-full bg-green/10 px-2 py-0.5 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-green",
      };
    case "partial":
      return {
        label: "Partial",
        icon: MinusCircle,
        iconClass: "text-amber",
        badgeClass:
          "rounded-full bg-amber/10 px-2 py-0.5 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-amber",
      };
    case "fail":
      return {
        label: "Fail",
        icon: XCircle,
        iconClass: "text-red",
        badgeClass:
          "rounded-full bg-red/10 px-2 py-0.5 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-red",
      };
    case "na":
      return {
        label: "N/A",
        icon: CircleDashed,
        iconClass: "text-muted",
        badgeClass:
          "rounded-full bg-soft px-2 py-0.5 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-muted",
      };
  }
}

function countStatuses(categories: AuditCategory[]) {
  const totals = { pass: 0, partial: 0, fail: 0, na: 0 };
  for (const category of categories) {
    for (const item of category.items) {
      totals[item.status] += 1;
    }
  }
  return totals;
}

function formatTimestamp(ms: number): string {
  const date = new Date(ms);
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
