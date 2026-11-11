# Shetu website

The distribution and marketing site for Shetu, an open-source, self-hostable SSH client.

## Stack

- Astro 7, static output
- React 19 islands for live release data
- Tailwind v4
- MDX docs via Astro content collections
- Vitest, Biome, TypeScript strict

## Development

```sh
pnpm install
pnpm exec astro dev --background
pnpm exec astro dev status
pnpm exec astro dev logs
pnpm exec astro dev stop
```

## Verification

```sh
pnpm lint
pnpm check
pnpm test
pnpm build
```

## Build

The public origin, `https://shetu.iamnahid.com`, is set as `site` in `astro.config.mjs`; canonical URLs, Open Graph URLs, the sitemap and robots use it. Change it there if the domain moves.

The output is a static `dist/` directory. No adapter or server runtime is required. Pages build as files with no trailing slash (`/download`).

At build time the site fetches every shetu-client release from GitHub for `/changelog` (set `GITHUB_TOKEN` for a higher rate limit). If GitHub is unreachable it uses `src/data/releases.json`; refresh that snapshot with `pnpm releases:snapshot` after a release. Share images (`/og/*.png`) are generated during the build; Satoshi is fetched from Fontshare and Inter is the offline fallback.

Cloudflare deploys `dist` as static assets (`wrangler.jsonc`, `public/_headers`, `public/_redirects`).

## Content

- `src/pages/`: marketing, download (`/download/<os>`), changelog, docs, share-image (`og/`) and `sitemap.xml` routes.
- `src/lib/seo.ts`: every page's title and description, share-image paths and JSON-LD builders.
- `src/lib/changelog.ts`: build-time releases, notes cleanup and sanitized rendering.
- `src/content/docs/`: MDX documentation.
- `src/lib/`: platform detection, release mapping, and GitHub data.
- `src/data/releases.json`: committed fallback snapshot.
- `src/styles/global.css`: dark product tokens and prose styles.
- `src/components/mockups/`: coded HTML/CSS mockups of the Shetu window used on the homepage.
- `src/test/copy-guard.test.ts`: blocks unsupported product claims and en/em dashes in `src/`.
