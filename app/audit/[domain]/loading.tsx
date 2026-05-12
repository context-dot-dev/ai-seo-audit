export default function Loading() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-canvas">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -bottom-24 select-none text-[24rem] font-medium leading-none tracking-tighter text-ink/[0.04] sm:text-[34rem]"
      >
        ◐
      </div>
      <section className="relative mx-auto grid w-full max-w-7xl gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[7fr_5fr] lg:items-end lg:gap-16">
        <div>
          <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.28em] text-teal">
            <span className="inline-block size-2 animate-pulse rounded-full bg-teal" />
            running audit
          </div>
          <h1 className="mt-6 text-5xl font-medium tracking-[-0.04em] text-balance text-ink sm:text-7xl/[0.95]">
            Fetching page<span className="text-teal">…</span>
            <br />
            <span className="text-ink/35">Inspecting markup.</span>
            <br />
            <span className="text-ink/20">Scoring rubric.</span>
          </h1>
          <p className="mt-8 max-w-prose text-base/7 text-pretty text-muted sm:text-lg/8">
            Pulling Markdown, raw HTML, robots, and sitemap, then evaluating
            crawlability, content chunks, schema, and trust signals against the
            AI-readability rubric.
          </p>

          <ul className="mt-10 grid max-w-md gap-3 font-mono text-xs uppercase tracking-[0.18em] text-muted" role="list">
            {[
              "fetch · markdown",
              "fetch · raw html",
              "fetch · robots + sitemap",
              "score · 30+ checks",
              "build · agent fix prompt",
            ].map((step, index) => (
              <li
                key={step}
                className="flex items-center gap-3 [animation:1.8s_ease-in-out_infinite_pulse] [animation-delay:var(--d)]"
                style={{ "--d": `${index * 180}ms` } as React.CSSProperties}
              >
                <span className="inline-block size-1.5 rounded-full bg-teal/50" />
                {step}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:text-right">
          <div className="font-mono text-xs uppercase tracking-[0.28em] text-muted">
            score
          </div>
          <div className="mt-2 flex items-baseline gap-2 lg:justify-end">
            <span className="animate-pulse text-8xl font-medium leading-none tracking-[-0.04em] tabular-nums text-ink/20 sm:text-9xl lg:text-[10rem]">
              --
            </span>
            <span className="font-mono text-2xl tabular-nums text-ink/20">
              /100
            </span>
          </div>
          <div className="mt-5 h-1.5 w-full overflow-hidden bg-ink/5">
            <div className="h-full w-1/3 animate-pulse bg-teal/40" />
          </div>
        </div>
      </section>
    </main>
  );
}
