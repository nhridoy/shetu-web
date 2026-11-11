// Refreshes src/data/releases.json, the fallback used when GitHub is unreachable.
// Usage: pnpm releases:snapshot   (set GITHUB_TOKEN for a higher rate limit)
import { renameSync, writeFileSync } from 'node:fs';

const API = 'https://api.github.com/repos/nhridoy/shetu-client';
const headers = {
  Accept: 'application/vnd.github+json',
  ...(process.env.GITHUB_TOKEN && {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  }),
};

async function get(path) {
  const res = await fetch(`${API}${path}`, {
    headers,
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`GitHub ${path}: ${res.status}`);
  return res.json();
}

// Same fields as parseRelease in src/lib/releases.ts.
const pick = (r) => ({
  tag_name: r.tag_name,
  name: r.name ?? r.tag_name,
  published_at: r.published_at,
  html_url: r.html_url,
  prerelease: Boolean(r.prerelease),
  body: r.body ?? '',
  assets: (r.assets ?? []).map((a) => ({
    name: a.name,
    browser_download_url: a.browser_download_url,
    size: a.size,
  })),
});

// One list, all pages, so `latest` can never disagree with `releases`.
const all = [];
for (let page = 1; ; page++) {
  const batch = await get(`/releases?per_page=100&page=${page}`);
  all.push(...batch);
  if (batch.length < 100) break;
}
const releases = all
  .filter((r) => !r.draft)
  .map(pick)
  .sort((a, b) => b.published_at.localeCompare(a.published_at));
const snapshot = {
  fetched_at: new Date().toISOString(),
  latest: releases.find((r) => !r.prerelease) ?? releases[0],
  releases,
};
// Write then rename, so an interrupted run never leaves broken JSON behind.
const target = 'src/data/releases.json';
writeFileSync(`${target}.tmp`, `${JSON.stringify(snapshot, null, 2)}\n`);
renameSync(`${target}.tmp`, target);
console.log(
  `Saved ${releases.length} releases (latest ${snapshot.latest.tag_name}).`,
);
