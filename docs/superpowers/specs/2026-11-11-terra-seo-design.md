# Terra site SEO

Date: 2026-11-11. Site: https://terra.iamnahid.com (Astro 7 static, Cloudflare Workers static assets, deployed from `main`).

## Intent

The redesigned site is live but invisible: nothing targets real searches, links render as plain text when shared, every nav click passes through a redirect, and the repos that should link to the site do not. The user wants proper SEO across the board, aimed at people searching for a Termius alternative, an open-source SSH client, an SSH client for their OS, and self-hosted SSH sync.

Success: every page is indexable at one clean URL, has a specific title, description and share image, carries correct structured data, and there are genuinely useful pages for each target search plus one indexable page per app release.

## Decisions made by the user

- **Scope:** everything: technical fixes, new search-targeted pages, and a build-time changelog with one page per release.
- **Search targets:** all four: "Termius alternative", "open source SSH client", "SSH client for Windows / macOS / Linux", "self-hosted SSH sync".
- **Share images:** one auto-generated 1200x630 image per page, built at build time.
- **GitHub:** set homepage, description and topics on nhridoy/terra, terra-client, terra-server, terra-web.
- **Changelog content (from an earlier answer):** GitHub release notes only, no hand-written layer, no backfill.

## Goals

1. One canonical URL per page, linked directly (no redirect hops), http and https not both indexable.
2. Specific titles (50-60 chars) and descriptions (120-160 chars) for every page, written for the target searches.
3. A per-page Open Graph / Twitter image and `summary_large_image` cards.
4. Structured data: `WebSite` + `Organization` site-wide, `SoftwareApplication` on home and download pages, `BreadcrumbList` on nested pages, `TechArticle` on docs.
5. New pages, each with real, unique content (not doorway pages): a Termius alternative page, three per-OS download pages, a self-hosting page, and a changelog with per-release pages.
6. Faster repeat visits: long-lived caching for hashed assets.
7. Off-site: GitHub repo metadata; a short checklist for Search Console, Bing and directory listings.

## Non-goals

- No blog, no hand-written release highlights, no translations/hreflang.
- No analytics or tracking scripts.
- No FAQPage schema (Google stopped showing FAQ rich results for most sites in 2023) and no `aggregateRating` (there are no real ratings; inventing them violates Google policy).
- No paid tools or services.

## Anti-goals

- Thin or duplicated "SEO pages". Each new page must answer its search with content a visitor actually needs; near-identical per-OS pages with swapped words would hurt rankings.
- Any claim outside the redesign spec's verified product facts (`2026-11-11-terra-violet-redesign-design.md`). The copy guard test stays green.
- Committing Satoshi font files (license forbids repo redistribution).
- A build that fails because GitHub's API is slow, rate-limited or down.
- Visual regressions to the approved design.

## Technical fixes (my calls unless noted)

- **URLs without trailing slash:** set Astro `build.format: 'file'` and `trailingSlash: 'never'`. Pages become `/download`, `/docs/server`, matching how every internal link is already written. Cloudflare's `auto-trailing-slash` serves `download.html` at `/download` and redirects `/download/` to it. Canonicals and the sitemap follow automatically.
- **http to https:** user turns on "Always Use HTTPS" for `iamnahid.com` in Cloudflare (SSL/TLS > Edge Certificates). Listed as a user action; it cannot be done from the repo.
- **Asset caching:** `public/_headers` with `/_astro/*` -> `Cache-Control: public, max-age=31536000, immutable`. HTML keeps the default revalidation.
- **Redirects:** `public/_redirects` with `/releases /changelog 301` once the changelog exists.
- **Metadata:** `BaseLayout` takes an optional `image` and `type` (`website` | `article`), emits `og:image` (+ width, height, alt), `twitter:card=summary_large_image`, `twitter:image`. `SITE_DESCRIPTION` rewritten to the new positioning. Every page gets a hand-written title and description (list in the plan).
- **Sitemap:** keep `@astrojs/sitemap`; add `lastmod` (build date for marketing pages, `published_at` for release pages).
- **Fonts:** leave the Fontshare stylesheet as is (measured time to first byte is about 0.4s; changing font loading is not worth the complexity here).

## Structured data

- Site-wide `WebSite` (name, url) and `Organization` (name, url, logo `/favicon.svg`, `sameAs` the four GitHub repos).
- `SoftwareApplication` on `/` and the download pages: name, `operatingSystem`, `applicationCategory: DeveloperApplication`, `offers` price 0, `softwareVersion` from the release snapshot, `downloadUrl`, `license`, `codeRepository`. No rating.
- `BreadcrumbList` on every nested page (docs, per-OS download, changelog entries).
- `TechArticle` on docs pages with `dateModified` from front matter `updated`.
- One small JSON-LD helper; schema built from existing data (`releases.json`, `REPOS`, docs front matter), not hand-duplicated per page.

## New pages

All use the existing design system (`PageHeader`, panels, mockups) and must pass the copy guard.

1. **`/termius-alternative`**: "The open-source Termius alternative". Why people switch (price, closed source, cloud you don't control), the full comparison table (reuse `Comparison.astro`), what Terra does not do yet (mobile, Mosh/Telnet, Termius import), how to move hosts over today (add hosts manually; export from Termius is not something Terra imports), self-hosting, FAQ. Target: "Termius alternative", "open source Termius".
2. **`/download/windows`, `/download/macos`, `/download/linux`**: real per-OS install guides: the builds for that OS from the release (both architectures and formats), the one-line installer for that OS, first-launch warning steps for that OS, requirements, update behavior (`.deb` opens the release page instead of updating in place), uninstall. Title pattern "Free open-source SSH client for Windows | Terra". `/download` stays the hub and links to all three.
3. **`/self-hosted`**: "Self-hosted SSH sync": what the server stores and cannot read, Docker deploy summary, team vaults and roles, links to `/docs/server`. Target: "self-hosted SSH sync", "self-hosted Termius".
4. **`/changelog` and `/changelog/<version>`** (e.g. `/changelog/v0-0-15`): index of all releases, newest first, each with date, version and a rendered excerpt; per-release page with full rendered notes, that release's downloads grouped by OS, previous/next links. The repeated "## Install" section of every GitHub release body is stripped. "Open source SSH client" is targeted by the homepage title plus the depth these pages add.

Navigation: header gets "Changelog" in place of "Releases"; footer adds the new pages. The homepage links to `/termius-alternative` from the comparison section and to the per-OS pages from the download area.

## Changelog data

- Fetched at build time from `https://api.github.com/repos/nhridoy/terra-client/releases` (13 releases today; paginate to be safe). Uses `GITHUB_TOKEN` if the build environment provides one (optional; raises the rate limit).
- **Never fails the build:** on any fetch error, fall back to the committed `src/data/releases.json`, which gets a full `releases` array (today it holds only `latest`). A small script refreshes that snapshot.
- Release notes are Markdown; render with a Markdown library already in the dependency tree if possible (Astro ships one), sanitize (notes come from GitHub, treat as untrusted HTML), strip the `## Install` section.
- **Freshness (user action):** the site rebuilds on every push to `main`. To publish a new release page automatically, create a Cloudflare deploy hook and call it from terra-client's release workflow. That needs GitHub Actions, which is blocked by the account billing lock, so it is listed as a follow-up, not part of this work. The hero tag, download buttons and `/download` already fetch the latest release live.

## Settled after builder check (user's answers)

- **Releases with empty notes** (after stripping `## Install`, nothing left but the "Full Changelog" link; today v0.0.3 to v0.0.7 and v0.0.9): still get a page (downloads, previous/next), but marked `<meta name="robots" content="noindex">` and excluded from the sitemap. The rule is automatic, so future empty releases behave the same. They still appear on the `/changelog` index. This replaces "one indexable page per release" in Goals: one page per release, indexable when it has notes. `BaseLayout` gains an optional `noindex` prop.
- **workers.dev duplicate:** set `"workers_dev": false` in `wrangler.jsonc` so only `terra.iamnahid.com` serves production. PR preview URLs stay; their canonical tags already point at the real domain.

## Share images

- Generated at build time, one PNG per page, 1200x630, matching the site: near-black background, violet/blue glow, app icon, page title, short subtitle, `terra.iamnahid.com`.
- Font: must not commit Satoshi. Builder's call between fetching Satoshi from Fontshare at build time (with a committed open-license fallback such as JetBrains Mono from the installed `@fontsource-variable/jetbrains-mono`) or using an open-license font throughout.
- A build-time generator (e.g. `satori` + a PNG renderer, or `astro-og-canvas`) is acceptable as a new dependency; prefer the option with fewest native build steps, since pnpm blocks unapproved install scripts on Cloudflare.

## GitHub repo metadata (approved)

Set on all four repos: `homepage = https://terra.iamnahid.com`, a one-line description, and topics from: `ssh`, `ssh-client`, `sftp`, `terminal`, `termius-alternative`, `tauri`, `rust`, `self-hosted`, `open-source` (server: `go`, `sync-server`; web: `astro`). Done with `gh api` after the site changes ship.

## User actions (checklist delivered at the end)

- Cloudflare: turn on Always Use HTTPS.
- Google Search Console and Bing Webmaster Tools: verify `terra.iamnahid.com` (DNS TXT via Cloudflare), submit `/sitemap.xml`.
- Optional listings: AlternativeTo (as a Termius alternative), awesome-selfhosted, awesome-ssh style lists, Product Hunt when ready.
- Later: Cloudflare deploy hook called from terra-client's release workflow once GitHub Actions works.

## Constraints

- Static output only; Cloudflare Workers static assets (`wrangler.jsonc`); must keep deploying from `main`.
- Gate: `pnpm lint && pnpm check && pnpm test && pnpm build` green, plus `npx wrangler deploy --dry-run`.
- Copy guard and all existing tests stay green; new logic (release fetch fallback, notes cleanup, JSON-LD helper, share-image generation) gets tests.
- No co-author or "Generated with" lines in commits or PRs; commits stay signed.
- Works at 360px; no new client-side JavaScript except what already exists.

## Left to the builder

Exact copy within the verified facts, page section order, the Markdown library and sanitizer choice, the share-image generator and font approach (within the rules above), component breakdown, and the snapshot refresh script's shape.
