import type { Metadata } from "next";

import { AuditForm } from "@/components/audit-form";

type HomeProps = {
  searchParams: Promise<{ domain?: string }>;
};

export const metadata: Metadata = {
  title: {
    absolute:
      "AI SEO Audit | Score any page for ChatGPT, Claude & Perplexity",
  },
  description:
    "Paste a URL and get a free 0–100 AI SEO score for ChatGPT, Claude, and Perplexity. Audits crawlability, schema, content chunking, and trust signals, then hands you a copy-paste fix prompt for your coding agent.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "AI SEO Audit | Score any page for ChatGPT, Claude & Perplexity",
    description:
      "Free 0–100 AI visibility score with a copy-paste fix prompt your coding agent can run.",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is an AI SEO audit?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "An AI SEO audit evaluates whether a web page is readable and citation-ready for AI answer engines like ChatGPT, Claude, and Perplexity. It scores crawlability for AI bots, semantic HTML and content chunking, structured data and schema markup, and trust signals such as author and date metadata.",
      },
    },
    {
      "@type": "Question",
      name: "How is AI SEO different from traditional SEO?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Traditional SEO targets ranking algorithms in Google search results, while AI SEO (sometimes called GEO or AEO) targets the retrieval and citation behavior of large language models. AI SEO emphasizes clean Markdown extraction, well-chunked content, robots.txt access for AI crawlers like GPTBot and ClaudeBot, and explicit schema that LLMs can ground answers in.",
      },
    },
    {
      "@type": "Question",
      name: "Which AI crawlers does this audit check?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The audit checks robots.txt and headers for major AI user agents including GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-User, Claude-SearchBot, PerplexityBot, Google-Extended, and Applebot-Extended.",
      },
    },
    {
      "@type": "Question",
      name: "Is the AI SEO Audit free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The tool is free, requires no signup, and is open source on GitHub. Paste a URL, get a 0–100 score in about 30 seconds, and copy a fix prompt into Claude Code, Cursor, or any coding agent.",
      },
    },
    {
      "@type": "Question",
      name: "How long does an audit take?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most audits complete in roughly 30 seconds. The tool fetches your Markdown, raw HTML, robots.txt, and sitemap, then scores 30+ checks across crawlability, content, schema, and trust signals.",
      },
    },
  ],
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to audit a page for AI SEO visibility",
  description:
    "Run a free AI SEO audit and apply the fixes with your coding agent in three steps.",
  totalTime: "PT2M",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Paste a URL",
      text: "Enter the full URL of any public page you want to audit for AI readability.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Get a 0–100 score",
      text: "The audit fetches the page, evaluates 30+ AI-readability rules, and returns a visibility score with a per-category breakdown.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Copy the fix prompt",
      text: "Copy the generated prompt and paste it into your coding agent (Claude Code, Cursor, etc.) to ship the fixes automatically.",
    },
  ],
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const initialDomain = params.domain ?? "";

  return (
    <main className="relative min-h-[calc(100dvh-4rem)] overflow-hidden bg-canvas">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -bottom-32 select-none text-[28rem] font-medium leading-none tracking-tighter text-ink/[0.04] sm:text-[36rem]"
      >
        100
      </div>
      <section className="relative mx-auto grid w-full max-w-7xl gap-12 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[7fr_5fr] lg:items-end lg:gap-16">
        <div className="flex flex-col justify-end">
          <div className="font-mono text-xs uppercase tracking-[0.28em] text-teal">
            ◢ Will ChatGPT cite your site?
          </div>
          <h1 className="mt-6 text-6xl font-medium tracking-[-0.04em] text-balance text-ink sm:text-[8rem]/[0.9]">
            Audit.
            <br />
            <span className="text-ink/35">Score.</span>{" "}
            <span className="text-teal">Fix.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg/7 text-pretty text-muted sm:text-xl/8">
            See your page through the eyes of ChatGPT, Claude, and Perplexity.
            Get a 0–100 visibility score and a copy-paste prompt your coding
            agent can run to fix what&rsquo;s broken.
          </p>
          <ul className="mt-8 grid max-w-2xl gap-3 border-t hairline pt-5 text-base text-ink sm:grid-cols-3 sm:gap-6">
            {[
              ["Free", "no signup, open source"],
              ["~30s", "paste a URL, get a score"],
              ["Agent-ready", "copy/paste fix prompt"],
            ].map(([headline, sub]) => (
              <li key={headline} className="flex gap-3 sm:flex-col sm:gap-1">
                <div className="font-mono text-sm font-medium tracking-wide text-teal sm:text-base">
                  {headline}
                </div>
                <div className="text-sm text-muted sm:text-sm">{sub}</div>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col justify-end">
          <AuditForm initialDomain={initialDomain} />
        </div>
      </section>
    </main>
  );
}
