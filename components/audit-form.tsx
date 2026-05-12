"use client";

import type { FormEvent } from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";

import { normalizeAuditUrl } from "@/lib/url";

const EXAMPLES = ["context.dev", "mintlify.com", "gumroad.com"];

type AuditFormProps = {
  initialDomain?: string;
};

function extractDomainLabel(value: string): string {
  const url = normalizeAuditUrl(value);
  if (!url) return value;
  try {
    return new URL(url).hostname;
  } catch {
    return value;
  }
}

export function AuditForm({ initialDomain = "" }: AuditFormProps) {
  const [value, setValue] = useState(initialDomain);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function goToAudit(target: string) {
    const trimmed = target.trim();
    if (!trimmed) {
      setError("Enter a URL to audit.");
      return;
    }

    const auditUrl = normalizeAuditUrl(trimmed);
    if (!auditUrl) {
      setError("Enter a valid URL.");
      return;
    }

    setError("");
    const domain = extractDomainLabel(auditUrl);
    const query = `url=${encodeURIComponent(auditUrl)}`;
    const href = `/audit/${encodeURIComponent(domain)}?${query}`;
    startTransition(() => {
      router.push(href as never);
    });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    goToAudit(value);
  }

  return (
    <div className="w-full">
      <form onSubmit={onSubmit} className="grid gap-3">
        <label className="font-mono text-xs uppercase tracking-[0.22em] text-muted">
          ◢ paste url
        </label>
        <div className="grid gap-0 border-b-2 border-ink/15 focus-within:border-teal sm:grid-cols-[1fr_auto] sm:items-stretch">
          <input
            aria-label="URL to audit"
            name="url"
            type="text"
            inputMode="url"
            autoComplete="url"
            spellCheck={false}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="example.com"
            className="min-w-0 bg-transparent py-3 pr-2 text-2xl font-medium tracking-tight text-ink placeholder:text-ink/25 focus:outline-none sm:py-4 sm:text-3xl"
          />
          <button
            type="submit"
            disabled={isPending}
            className="group inline-flex items-center justify-center gap-2 self-stretch px-1 pb-3 pt-2 font-mono text-xs uppercase tracking-[0.22em] text-teal transition hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal disabled:cursor-not-allowed disabled:opacity-60 sm:px-2 sm:pt-0 sm:pb-2"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
            )}
            {isPending ? "auditing" : "run audit"}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted">
          <span className="uppercase tracking-[0.18em]">try</span>
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => {
                setValue(example);
                goToAudit(example);
              }}
              className="underline decoration-ink/20 decoration-1 underline-offset-4 transition hover:text-ink hover:decoration-teal"
            >
              {example}
            </button>
          ))}
        </div>

        {error ? (
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-red">
            ✕ {error}
          </p>
        ) : null}
      </form>
    </div>
  );
}
