export function normalizeDomain(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    if (!host.includes(".")) return null;
    return host;
  } catch {
    return null;
  }
}

export function auditUrlFromDomain(domain: string): string {
  return `https://${domain}/`;
}

export function displayHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
