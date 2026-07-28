import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.freeaiseoaudit.com/";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  colorScheme: "light",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AI SEO Audit | Score any page for ChatGPT, Claude & Perplexity",
    template: "%s | AI SEO Audit",
  },
  description:
    "Free AI SEO audit. Paste a URL, get a 0–100 visibility score for ChatGPT, Claude, and Perplexity, plus a copy-paste fix prompt for your coding agent.",
  applicationName: "AI SEO Audit",
  authors: [{ name: "context.dev", url: "https://context.dev" }],
  creator: "context.dev",
  publisher: "context.dev",
  keywords: [
    "AI SEO",
    "AI SEO audit",
    "GEO",
    "generative engine optimization",
    "AEO",
    "answer engine optimization",
    "LLM SEO",
    "ChatGPT SEO",
    "Claude SEO",
    "Perplexity SEO",
    "AI crawlability",
    "llms.txt",
    "schema.org",
    "structured data audit",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "AI SEO Audit | Score any page for ChatGPT, Claude & Perplexity",
    description:
      "Free 0–100 AI visibility score with a copy-paste fix prompt your coding agent can run.",
    url: siteUrl,
    siteName: "AI SEO Audit",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI SEO Audit | Score any page for ChatGPT, Claude & Perplexity",
    description:
      "Check whether a page is readable and citation-ready for AI answer engines.",
    creator: "@contextdotdev",
  },
  robots: {
    index: false,
    follow: false,
  },
  category: "technology",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      {
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "AI SEO Audit",
    description:
      "Free AI SEO audit tool. Score any page for ChatGPT, Claude, and Perplexity visibility and get an agent-ready fix prompt.",
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "SEO",
    operatingSystem: "Web",
    url: siteUrl,
    isAccessibleForFree: true,
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    publisher: {
      "@type": "Organization",
      name: "context.dev",
      url: "https://context.dev",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/android-chrome-512x512.png`,
      },
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "context.dev",
    url: "https://context.dev",
    logo: `${siteUrl}/android-chrome-512x512.png`,
    sameAs: ["https://github.com/context-dot-dev/ai-seo-audit"],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AI SEO Audit",
    url: siteUrl,
    publisher: {
      "@type": "Organization",
      name: "context.dev",
      url: "https://context.dev",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/?domain={domain}`,
      "query-input": "required name=domain",
    },
  };

  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <head>
        <Script
          defer
          src="https://plausible.io/js/pa-Of2CCb92I-O9hGQXQRgxw.js"
          strategy="afterInteractive"
        />
        <Script id="plausible-init" strategy="afterInteractive">
          {`window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()`}
        </Script>
      </head>
      <body className="font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <div className="isolate flex min-h-dvh flex-col">
          <a
            href="https://context.dev/?utm_source=ai-seo-audit&utm_medium=widget&utm_campaign=powered_by"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Powered by context.dev, opens in a new tab"
            className="px-4 py-2 fixed bottom-4 left-4 z-40 inline-flex items-center gap-1 rounded-full bg-[#2663eb] text-xs font-medium text-white/85 shadow-lg shadow-[#2663eb]/30 ring-1 ring-inset ring-white/15 transition-transform duration-200 hover:-translate-y-0.5 hover:text-white sm:bottom-6 sm:left-6"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <div className="flex items-center space-x-2">
              <img
                src="/context-logo.png"
                alt=""
                width={20}
                height={20}
                className="size-5 shrink-0 rounded-md"
              />
              <span className="font-semibold text-white">Context.dev</span>
            </div>
          </a>
          <a
            href="https://github.com/context-dot-dev/ai-seo-audit"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open source on GitHub, opens in a new tab"
            className="px-4 py-2 fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-neutral-900 text-xs font-medium text-white/85 shadow-lg shadow-black/30 ring-1 ring-inset ring-white/15 transition-transform duration-200 hover:-translate-y-0.5 hover:text-white sm:bottom-6 sm:right-6"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              width={20}
              height={20}
              className="size-5 shrink-0 fill-current"
            >
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.17c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.77.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.39-5.27 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.68.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
            </svg>
            <span className="font-semibold text-white">Open source</span>
          </a>
          <div className="grow">{children}</div>
        </div>
      </body>
    </html>
  );
}
