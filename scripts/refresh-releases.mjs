// Refreshes src/data/releases.json, the fallback used when GitHub is unreachable.
// Usage: pnpm releases:snapshot   (set GITHUB_TOKEN for a higher rate limit)
import { writeFileSync } from 'node:fs';

const API = 'https://api.github.com/repos/nhridoy/terra-client';
const headers = {
  Accept: 'application/vnd.github+json',
  ...(process.env.GITHUB_TOKEN && {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  }),
};

async function get(path) {
  const res = await fetch(`${API}${path}`, { headers });
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

const [latest, all] = await Promise.all([
  get('/releases/latest'),
  get('/releases?per_page=100'),
]);
const snapshot = {
  fetched_at: new Date().toISOString(),
  latest: pick(latest),
  releases: all.filter((r) => !r.draft).map(pick),
};
writeFileSync(
  'src/data/releases.json',
  `${JSON.stringify(snapshot, null, 2)}\n`,
);
console.log(
  `Saved ${snapshot.releases.length} releases (latest ${snapshot.latest.tag_name}).`,
);
