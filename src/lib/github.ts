import { parseRelease, type Release } from './releases';

export interface ReleaseCache {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface ReleaseResult {
  release: Release;
  source: 'live' | 'fallback';
}

export interface ReleasesResult {
  releases: Release[];
  source: 'live' | 'fallback';
}

const API_BASE = 'https://api.github.com/repos/nhridoy/shetu-client';
const TTL_MS = 10 * 60 * 1000;

interface Options {
  fetchImpl?: typeof fetch;
  cache?: ReleaseCache | null;
  now?: () => number;
  ttlMs?: number;
  apiBase?: string;
  /** Optional GitHub token (build time only) for a higher rate limit. */
  token?: string;
}

async function request(
  url: string,
  fetchImpl: typeof fetch,
  token?: string,
): Promise<unknown> {
  const response = await fetchImpl(url, {
    // A hung request must not stall the build or a visitor's page.
    signal: AbortSignal.timeout(10_000),
    headers: {
      Accept: 'application/vnd.github+json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!response.ok) {
    throw new Error(`GitHub request failed: ${response.status}`);
  }
  return response.json();
}

function readCache<T>(
  cache: ReleaseCache | null | undefined,
  key: string,
  now: () => number,
  ttlMs: number,
): T | null {
  if (!cache) return null;
  try {
    const raw = cache.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as { at: number; value: T };
    if (now() - entry.at >= ttlMs) return null;
    return entry.value;
  } catch {
    return null;
  }
}

function writeCache<T>(
  cache: ReleaseCache | null | undefined,
  key: string,
  value: T,
  now: () => number,
): void {
  if (!cache) return;
  try {
    cache.setItem(key, JSON.stringify({ at: now(), value }));
  } catch {
    // Ignore quota and privacy-mode failures.
  }
}

// Islands on one page (hero tag, hero button) share a single request.
const pendingLatest = new Map<string, Promise<ReleaseResult>>();

export async function getLatestRelease(
  options: Options & { fallback: Release },
): Promise<ReleaseResult> {
  const {
    fetchImpl = fetch,
    cache = null,
    now = Date.now,
    ttlMs = TTL_MS,
    apiBase = API_BASE,
    fallback,
  } = options;
  const key = `shetu:latest-release:${apiBase}`;
  const cached = readCache<Release>(cache, key, now, ttlMs);
  if (cached) return { release: cached, source: 'live' };

  const pending = pendingLatest.get(key);
  if (pending) return pending;

  const result = (async (): Promise<ReleaseResult> => {
    try {
      const release = parseRelease(
        await request(`${apiBase}/releases/latest`, fetchImpl),
      );
      if (!release.tag_name) throw new Error('Release is missing a tag');
      writeCache(cache, key, release, now);
      return { release, source: 'live' };
    } catch {
      return { release: fallback, source: 'fallback' };
    }
  })().finally(() => pendingLatest.delete(key));
  pendingLatest.set(key, result);
  return result;
}

export async function getReleases(
  options: Options & { fallback: Release[] },
): Promise<ReleasesResult> {
  const {
    fetchImpl = fetch,
    cache = null,
    now = Date.now,
    ttlMs = TTL_MS,
    apiBase = API_BASE,
    token,
    fallback,
  } = options;
  const key = `shetu:releases:${apiBase}`;
  const cached = readCache<Release[]>(cache, key, now, ttlMs);
  if (cached) return { releases: cached, source: 'live' };

  try {
    const items: unknown[] = [];
    for (let page = 1; ; page++) {
      const payload = await request(
        `${apiBase}/releases?per_page=100&page=${page}`,
        fetchImpl,
        token,
      );
      if (!Array.isArray(payload)) throw new Error('Invalid releases payload');
      items.push(...payload);
      if (payload.length < 100) break;
    }
    const releases = items
      .filter((raw) => !(raw as { draft?: boolean }).draft)
      .map(parseRelease)
      .filter((release) => release.tag_name)
      // GitHub lists by creation date; pages read newest-published first.
      .sort((a, b) => b.published_at.localeCompare(a.published_at));
    writeCache(cache, key, releases, now);
    return { releases, source: 'live' };
  } catch {
    return { releases: fallback, source: 'fallback' };
  }
}
