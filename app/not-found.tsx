import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70dvh] w-full max-w-3xl flex-col justify-center px-5 py-16 sm:px-8">
      <p className="font-mono text-xs uppercase tracking-wide text-teal">404</p>
      <h1 className="mt-4 text-4xl font-medium tracking-tight text-balance text-ink sm:text-5xl">
        Page not found
      </h1>
      <p className="mt-4 text-base/7 text-pretty text-muted sm:text-lg/8">
        This app keeps the public surface intentionally small. The audit tool is
        on the home page.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex w-fit items-center rounded-md bg-teal px-4 py-3 text-base font-medium text-white shadow-sm shadow-teal/20 transition hover:bg-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal sm:text-sm"
      >
        Run an audit
      </Link>
    </main>
  );
}
