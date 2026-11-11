# Terra website

The distribution and marketing site for Terra, an open-source, self-hostable SSH client.

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

Set `SITE_URL` to the public origin before a production build so canonical URLs, Open Graph URLs, the sitemap, and robots point at the right host:

```sh
SITE_URL=https://example.com pnpm build
```

The output is a static `dist/` directory. No adapter or server runtime is required.

## Content

- `src/pages/`: marketing and distribution pages.
- `src/content/docs/`: MDX documentation.
- `src/lib/`: platform detection, release mapping, and GitHub data.
- `src/data/releases.json`: committed fallback snapshot.
- `src/styles/global.css`: dark product tokens and prose styles.
- `src/components/mockups/`: coded HTML/CSS mockups of the Terra window used on the homepage.
- `src/test/copy-guard.test.ts`: blocks unsupported product claims and en/em dashes in `src/`.
