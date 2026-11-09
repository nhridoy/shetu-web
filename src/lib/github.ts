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

const API_BASE = 'https://api.github.com/repos/nhridoy/terra-client';
const TTL_MS = 10 * 60 * 1000;

interface Options {
  fetchImpl?: typeof fetch;
  cache?: ReleaseCache | null;
  now?: () => number;
  ttlMs?: number;
  apiBase?: string;
}

async function request(url: string, fetchImpl: typeof fetch): Promise<unknown> {
  const response = await fetchImpl(url, {
    headers: { Accept: 'application/vnd.github+json' },
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
  const key = `terra:latest-release:${apiBase}`;
  const cached = readCache<Release>(cache, key, now, ttlMs);
  if (cached) return { release: cached, source: 'live' };

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
    fallback,
  } = options;
  const key = `terra:releases:${apiBase}`;
  const cached = readCache<Release[]>(cache, key, now, ttlMs);
  if (cached) return { releases: cached, source: 'live' };

  try {
    const payload = await request(`${apiBase}/releases?per_page=20`, fetchImpl);
    if (!Array.isArray(payload)) throw new Error('Invalid releases payload');
    const releases = payload
      .map(parseRelease)
      .filter((release) => release.tag_name);
    writeCache(cache, key, releases, now);
    return { releases, source: 'live' };
  } catch {
    return { releases: fallback, source: 'fallback' };
  }
}
