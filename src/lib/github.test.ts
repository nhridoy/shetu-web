import { describe, expect, it, vi } from 'vitest';
import { getLatestRelease, getReleases, type ReleaseCache } from './github';
import type { Release } from './releases';

const release: Release = {
  tag_name: 'v1.2.3',
  name: 'v1.2.3',
  published_at: '2026-01-01T00:00:00Z',
  html_url: 'https://github.com/nhridoy/terra-client/releases/tag/v1.2.3',
  prerelease: false,
  body: 'Notes',
  assets: [
    {
      name: 'Terra-1.2.3-Linux-x64.AppImage',
      browser_download_url: 'https://example.com/app',
      size: 10,
    },
  ],
};

function memoryCache(): ReleaseCache & { store: Map<string, string> } {
  const store = new Map<string, string>();
  return {
    store,
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value);
    },
  };
}

function jsonResponse(value: unknown, ok = true, status = 200): Response {
  return { ok, status, json: async () => value } as Response;
}

describe('getLatestRelease', () => {
  it('returns live data and caches it', async () => {
    const cache = memoryCache();
    const fetchImpl = vi.fn(async () => jsonResponse(release));
    const result = await getLatestRelease({
      fallback: release,
      cache,
      fetchImpl: fetchImpl as unknown as typeof fetch,
      now: () => 1000,
    });
    expect(result.source).toBe('live');
    expect(result.release.tag_name).toBe('v1.2.3');
    expect(cache.store.size).toBe(1);
  });

  it('uses a fresh cache entry without fetching', async () => {
    const cache = memoryCache();
    const fetchImpl = vi.fn(async () => jsonResponse(release));
    await getLatestRelease({
      fallback: release,
      cache,
      fetchImpl: fetchImpl as unknown as typeof fetch,
      now: () => 1000,
    });
    const second = await getLatestRelease({
      fallback: release,
      cache,
      fetchImpl: fetchImpl as unknown as typeof fetch,
      now: () => 2000,
    });
    expect(second.source).toBe('live');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('falls back when the request fails', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({}, false, 403));
    const result = await getLatestRelease({
      fallback: release,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(result.source).toBe('fallback');
    expect(result.release).toBe(release);
  });

  it('falls back when the payload is malformed', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ nope: true }));
    const result = await getLatestRelease({
      fallback: release,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(result.source).toBe('fallback');
  });
});

describe('getLatestRelease in-flight sharing', () => {
  it('shares one request between concurrent callers', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(release));
    const options = {
      fallback: release,
      fetchImpl: fetchImpl as unknown as typeof fetch,
      apiBase: 'https://example.com/shared',
    };
    const [a, b] = await Promise.all([
      getLatestRelease(options),
      getLatestRelease(options),
    ]);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(a.release.tag_name).toBe('v1.2.3');
    expect(b.release.tag_name).toBe('v1.2.3');
  });

  it('fetches again once the earlier request settled', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(release));
    const options = {
      fallback: release,
      fetchImpl: fetchImpl as unknown as typeof fetch,
      apiBase: 'https://example.com/sequential',
    };
    await getLatestRelease(options);
    await getLatestRelease(options);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});

describe('getReleases', () => {
  it('returns a live list', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse([release]));
    const result = await getReleases({
      fallback: [release],
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(result.source).toBe('live');
    expect(result.releases).toHaveLength(1);
  });

  it('returns the fallback list when the request fails', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({}, false, 500));
    const result = await getReleases({
      fallback: [release],
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(result.source).toBe('fallback');
    expect(result.releases).toEqual([release]);
  });
});
