const MAX_URL_LENGTH = 2048;
const HTTP_PROTOCOLS = new Set(['http:', 'https:']);

export interface ValidHttpUrl {
  ok: true;
  href: string;
  url: URL;
}

export interface InvalidHttpUrl {
  ok: false;
  message: string;
}

export type HttpUrlParseResult = ValidHttpUrl | InvalidHttpUrl;

export interface ResolvedPreviewUrl {
  ok: true;
  href: string;
}

export interface InvalidPreviewUrl {
  ok: false;
  message: string;
}

export type PreviewUrlResult = ResolvedPreviewUrl | InvalidPreviewUrl;

export function parseHttpUrl(rawUrl: string, label = 'URL'): HttpUrlParseResult {
  const trimmed = rawUrl.trim();
  if (trimmed.length === 0) {
    return { ok: false, message: `${label} is required.` };
  }
  if (trimmed.length > MAX_URL_LENGTH) {
    return { ok: false, message: `${label} is too long.` };
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return { ok: false, message: `${label} must be a valid URL.` };
  }

  if (!HTTP_PROTOCOLS.has(url.protocol)) {
    return { ok: false, message: `${label} must start with http:// or https://.` };
  }

  return { ok: true, href: url.toString(), url };
}

export function resolvePreviewUrl(
  baseUrl: string | null | undefined,
  route: string,
): PreviewUrlResult {
  if (baseUrl === null || baseUrl === undefined) {
    return { ok: false, message: 'Base URL is required.' };
  }

  const parsedBaseUrl = parseHttpUrl(baseUrl, 'Base URL');
  if (!parsedBaseUrl.ok) {
    return parsedBaseUrl;
  }

  const resolvedUrl = new URL(normalizeRoutePath(route), parsedBaseUrl.url);
  if (!HTTP_PROTOCOLS.has(resolvedUrl.protocol)) {
    return { ok: false, message: 'Resolved URL must start with http:// or https://.' };
  }

  return { ok: true, href: resolvedUrl.toString() };
}

function normalizeRoutePath(route: string): string {
  const trimmed = route.trim();
  if (trimmed.length === 0) {
    return '/';
  }
  if (trimmed.startsWith('?') || trimmed.startsWith('#')) {
    return `/${trimmed}`;
  }
  return `/${trimmed.replace(/^\/+/, '')}`;
}
