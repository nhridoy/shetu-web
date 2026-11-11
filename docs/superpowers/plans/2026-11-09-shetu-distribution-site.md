# Shetu Distribution and Marketing Site — Implementation Plan

> **For the implementing agent:** Use the `executing-plans` skill to implement this plan task by task. Read the approved design spec at `docs/superpowers/specs/2026-11-09-shetu-distribution-site-design.md` first. Do not invent product claims, pricing, customers, benchmarks, or cloud URLs.

**Goal:** Replace the single-page `shetu-web` landing page with a static, multi-page distribution and marketing site for Shetu, with an OS-aware download experience, fresh MDX docs, a live GitHub release feed, and a Field Manual visual system.

**Architecture:** Astro 7 static output. Marketing pages are pre-rendered `.astro` with no hydration. Two React islands handle runtime GitHub data (`DownloadPanel`, `ReleaseList`). The install command switcher is static HTML/CSS so it works without JavaScript. Docs are MDX content collections rendered through a shared `DocsLayout`. All runtime data has a committed fallback snapshot.

**Tech Stack:** Astro 7, React 19, TypeScript strict, Tailwind v4, MDX, `@astrojs/sitemap`, Vitest + Testing Library + happy-dom, Biome, pnpm.

---

## Global Constraints

- **Only modify `shetu-web`.** Do not touch `shetu-client`, `shetu-server`, or the umbrella `shetu` repo.
- **Static output only.** No Astro adapter, no server runtime, no API routes that require a server.
- **pnpm only.** Do not use npm or yarn. Commit `pnpm-lock.yaml` with dependency changes.
- **Accuracy is a hard requirement.** Never claim SRP6a, XSalsa20, GitLab OAuth, Microsoft OAuth, a mobile app, pricing, customers, testimonials, benchmarks, or cloud signup URLs. The code uses Argon2id, XChaCha20-Poly1305, and X25519; only Google and GitHub OAuth exist.
- **Real release facts.** The current release is `v0.0.15`, published `2026-11-05T10:20:49Z`. Asset names are `Shetu-0.0.15-<Platform>-<Arch>.<ext>` as listed in Task 3.
- **No JavaScript required** for reading, navigating, install commands, or reaching GitHub Releases. Only live release metadata upgrades.
- **Responsive from 360px.** No horizontal scroll at 360, 768, 1024, or 1440px.
- **Accessibility:** semantic landmarks, skip link, one `h1` per page, visible focus, AA contrast, keyboard-operable controls, `prefers-reduced-motion`.
- **No placeholders in shipped copy.** `example.com` may appear only inside documentation examples for self-hosters, never as a Shetu URL.
- **Node `>=22.12.0` and pnpm 12.6.0.** Add `"packageManager": "pnpm@12.6.0"` to `package.json`.

## Review Focus

These are the five failure modes most likely to make the site wrong or unusable. Every one has an owning test or manual check.

1. **GitHub API failure or rate limit.** The page must still render a usable download matrix from `src/data/releases.json` and show a notice with a GitHub link. Owned by `src/lib/github.test.ts` and the `DownloadPanel` fallback test.
2. **Asset filename drift.** Release assets use `macOS-Apple-Silicon`, `macOS-Intel`, `Windows-ARM64-Setup.exe`, `Linux-x64.AppImage`, `.deb`, and `.sig`/`.json` sidecars. Mapping must ignore signatures and manifests and still produce all eight downloadable files. Owned by `src/lib/releases.test.ts`.
3. **Wrong OS or architecture detection.** Detection is a convenience, never a gate. macOS defaults to Apple Silicon, Windows/Linux to x64, Android is not Linux, and high-entropy failure must not break the recommendation. Owned by `src/lib/platform.test.ts`; the full matrix is always visible.
4. **JavaScript disabled.** `/download` must show the committed matrix and both install commands in static HTML. Owned by the `DownloadPanel` initial-state test and the manual no-JS check.
5. **Clipboard permission denied.** Copy controls must fail gracefully and leave the command selectable. Owned by the inline copy handler in `BaseLayout.astro` and the manual clipboard-denied check.

## Deviations from the Spec (justified)

- `InstallCommand` is `InstallCommand.astro`, not `InstallCommand.tsx`. Radio inputs plus CSS tabs keep both commands usable without JavaScript and remove a hydration boundary. This satisfies the spec's progressive-enhancement requirement and its minimal-JS goal.
- `ui/Tabs.astro` is omitted. `InstallCommand` owns the only tab group; a second generic tabs primitive would be dead code.
- `ui/Button.astro` is omitted. The marketing sections use anchor utilities directly, so a wrapper component would add indirection with no reuse.
- The Community page omits GitHub Discussions links because Discussions is disabled on all four repositories (verified via the GitHub API). It links to issues instead and says so explicitly.

---

## File Map

```
.github/workflows/ci.yml
public/favicon.svg                     (keep)
src/
  env.d.ts
  content.config.ts
  content/docs/
    desktop.mdx
    server.mdx
    security.mdx
    troubleshooting.mdx
  data/releases.json
  lib/
    site.ts
    site.test.ts
    platform.ts
    platform.test.ts
    releases.ts
    releases.test.ts
    github.ts
    github.test.ts
    browser.ts
  layouts/
    BaseLayout.astro
    DocsLayout.astro
  components/
    layout/Header.astro
    layout/Footer.astro
    marketing/Hero.astro
    marketing/FactRibbon.astro
    marketing/ValueCards.astro
    marketing/WorkspaceMock.astro
    marketing/SecurityFlow.astro
    marketing/SelfHostPanel.astro
    marketing/OpenSource.astro
    marketing/ClosingCta.astro
    download/DownloadPanel.tsx
    download/DownloadPanel.test.tsx
    download/ReleaseList.tsx
    download/ReleaseList.test.tsx
    download/InstallCommand.astro
    docs/DocsNav.astro
    ui/CodeBlock.astro
    ui/Callout.astro
  pages/
    index.astro
    download.astro
    releases.astro
    security.astro
    community.astro
    docs/index.astro
    docs/[...slug].astro
    404.astro
    robots.txt.ts
  styles/global.css
  test/setup.ts
vitest.config.ts
```

Retired in Task 11: `src/components/landing/*`, `src/components/ui/{badge,button,card,separator}.tsx`, `src/lib/utils.ts`, `src/layouts/Layout.astro`, `public/images/*`, `docs/asset-provenance.md`, `docs/landing-audit.md`, `components.json`.

---

## Task 1: Foundation, Design Tokens, and Base Shell

**Files:**

- Modify: `package.json`
- Modify: `astro.config.mjs`
- Modify: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/env.d.ts`
- Replace: `src/styles/global.css`
- Create: `src/lib/site.ts`
- Create: `src/lib/site.test.ts`
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/layout/Header.astro`
- Create: `src/components/layout/Footer.astro`
- Create: `src/pages/404.astro`
- Create: `src/pages/robots.txt.ts`

**Interfaces:**

- Produces `SITE_NAME`, `SITE_DESCRIPTION`, `REPOS`, `NAV_ITEMS`, `INSTALL_COMMANDS` from `src/lib/site.ts`.
- Produces `BaseLayout` with props `{ title, description, canonical?, jsonLd? }`.
- Produces a global `[data-copy]` click handler used by every copy control.

**Step 1: Install dependencies and add scripts**

Run:

```sh
pnpm add @astrojs/mdx @astrojs/sitemap
pnpm add -D @astrojs/check typescript @types/node vitest happy-dom @testing-library/react @testing-library/dom @testing-library/jest-dom
```

Modify `package.json` scripts to:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "check": "astro check",
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "format": "biome format --write .",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

Add `"packageManager": "pnpm@12.6.0"` next to `"type": "module"`.

**Step 2: Write the failing site-constants test**

Create `src/lib/site.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { INSTALL_COMMANDS, NAV_ITEMS, REPOS } from './site';

describe('site constants', () => {
  it('exposes the five primary routes in navigation order', () => {
    expect(NAV_ITEMS.map((item) => item.href)).toEqual([
      '/download',
      '/docs',
      '/security',
      '/releases',
      '/community',
    ]);
  });

  it('points both install commands at the client repository', () => {
    expect(INSTALL_COMMANDS.unix).toContain('nhridoy/shetu-client');
    expect(INSTALL_COMMANDS.windows).toContain('nhridoy/shetu-client');
  });

  it('uses absolute GitHub URLs for every repository', () => {
    for (const url of Object.values(REPOS)) {
      expect(url.startsWith('https://github.com/')).toBe(true);
    }
  });
});
```

**Step 3: Run the test to verify it fails**

```sh
pnpm test -- src/lib/site.test.ts
```

Expected: fail because `src/lib/site.ts` does not exist.

**Step 4: Implement the constants**

Create `src/lib/site.ts`:

```ts
export const SITE_NAME = 'Shetu';
export const SITE_DESCRIPTION =
  'The open-source, self-hostable SSH client. Direct SSH, encrypted vaults, SFTP, and port forwarding in one desktop workspace.';

export const REPOS = {
  monorepo: 'https://github.com/nhridoy/shetu',
  client: 'https://github.com/nhridoy/shetu-client',
  server: 'https://github.com/nhridoy/shetu-server',
  web: 'https://github.com/nhridoy/shetu-web',
} as const;

export const NAV_ITEMS = [
  { label: 'Download', href: '/download' },
  { label: 'Docs', href: '/docs' },
  { label: 'Security', href: '/security' },
  { label: 'Releases', href: '/releases' },
  { label: 'Community', href: '/community' },
] as const;

export const INSTALL_COMMANDS = {
  unix: 'curl -fsSL https://raw.githubusercontent.com/nhridoy/shetu-client/main/install.sh | bash',
  windows:
    'irm https://raw.githubusercontent.com/nhridoy/shetu-client/main/install.ps1 | iex',
} as const;
```

**Step 5: Run the test to verify it passes**

```sh
pnpm test -- src/lib/site.test.ts
```

Expected: 3 passing tests.

**Step 6: Configure Astro, TypeScript, and Vitest**

Replace `astro.config.mjs`:

```js
// @ts-check

import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

const site = process.env.SITE_URL ?? 'http://localhost:4321';

export default defineConfig({
  site,
  output: 'static',
  integrations: [react(), mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

Add `"resolveJsonModule": true` to `tsconfig.json` `compilerOptions`. Keep the existing `@/*` path alias.

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
```

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

Create `src/env.d.ts`:

```ts
/// <reference types="astro/client" />
```

**Step 7: Replace global styles with the Field Manual system**

Replace `src/styles/global.css` with:

```css
@import "tailwindcss";
@import "@fontsource-variable/geist";

@theme {
  --color-paper: #f7f5ef;
  --color-surface: #ffffff;
  --color-ink: #161816;
  --color-muted: #646a63;
  --color-line: rgba(22, 24, 22, 0.12);
  --color-accent: #1c6b47;
  --color-accent-wash: #e4efe7;
  --color-terminal: #101413;
  --color-terminal-text: #a8dbbd;
  --font-sans: "Geist Variable", ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

@layer base {
  html {
    scroll-behavior: smooth;
  }

  @media (prefers-reduced-motion: reduce) {
    html {
      scroll-behavior: auto;
    }
  }

  body {
    background: var(--color-paper);
    color: var(--color-ink);
    font-family: var(--font-sans);
  }

  ::selection {
    background: var(--color-accent-wash);
    color: var(--color-ink);
  }

  :where(a, button, input, summary, label):focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 3px;
  }

  .skip-link {
    position: absolute;
    left: 1rem;
    top: -4rem;
    z-index: 50;
    border-radius: 0.5rem;
    background: var(--color-ink);
    padding: 0.75rem 1rem;
    color: var(--color-paper);
  }

  .skip-link:focus {
    top: 1rem;
  }
}

.install-panel {
  display: none;
}

#install-unix:checked ~ [data-panel="unix"],
#install-windows:checked ~ [data-panel="windows"] {
  display: block;
}

#install-unix:checked ~ .install-tabs label[for="install-unix"],
#install-windows:checked ~ .install-tabs label[for="install-windows"] {
  border-color: var(--color-accent);
  background: var(--color-accent-wash);
  color: var(--color-accent);
}

#install-unix:focus-visible ~ .install-tabs label[for="install-unix"],
#install-windows:focus-visible ~ .install-tabs label[for="install-windows"] {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}

.docs-prose {
  color: var(--color-ink);
  font-size: 1rem;
  line-height: 1.75;
}

.docs-prose > * + * {
  margin-top: 1.25rem;
}

.docs-prose h2 {
  margin-top: 2.5rem;
  font-size: 1.5rem;
  font-weight: 500;
  letter-spacing: -0.03em;
}

.docs-prose h3 {
  margin-top: 2rem;
  font-size: 1.125rem;
  font-weight: 500;
  letter-spacing: -0.02em;
}

.docs-prose p,
.docs-prose li {
  color: var(--color-muted);
}

.docs-prose strong {
  color: var(--color-ink);
  font-weight: 500;
}

.docs-prose a {
  color: var(--color-accent);
  text-decoration: underline;
  text-underline-offset: 4px;
}

.docs-prose ul,
.docs-prose ol {
  padding-left: 1.25rem;
}

.docs-prose ul {
  list-style: disc;
}

.docs-prose ol {
  list-style: decimal;
}

.docs-prose li + li {
  margin-top: 0.4rem;
}

.docs-prose code:not(pre code) {
  border: 1px solid var(--color-line);
  border-radius: 0.3rem;
  background: var(--color-surface);
  padding: 0.1rem 0.35rem;
  font-family: var(--font-mono);
  font-size: 0.85em;
  color: var(--color-ink);
}

.docs-prose pre {
  overflow-x: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  background: var(--color-terminal);
  padding: 1rem;
  font-size: 0.8rem;
  line-height: 1.7;
}

.docs-prose pre code {
  color: var(--color-terminal-text);
  font-family: var(--font-mono);
}

.docs-prose table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.docs-prose th,
.docs-prose td {
  border-bottom: 1px solid var(--color-line);
  padding: 0.6rem 0.5rem;
  text-align: left;
}

.docs-prose th {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-muted);
}

.docs-prose blockquote {
  border-left: 2px solid var(--color-accent);
  padding-left: 1rem;
  color: var(--color-muted);
}
```

**Step 8: Create the base layout**

Create `src/layouts/BaseLayout.astro`:

```astro
---
import '../styles/global.css';
import Footer from '../components/layout/Footer.astro';
import Header from '../components/layout/Header.astro';
import { SITE_NAME } from '../lib/site';

interface Props {
  title: string;
  description: string;
  canonical?: string;
  jsonLd?: Record<string, unknown>;
}

const { title, description, canonical, jsonLd } = Astro.props;
const site = Astro.site ?? new URL('http://localhost:4321');
const canonicalUrl = canonical
  ? new URL(canonical, site)
  : new URL(Astro.url.pathname, site);
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonicalUrl} />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content={SITE_NAME} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonicalUrl} />
    <meta name="twitter:card" content="summary" />
    {jsonLd && <script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />}
  </head>
  <body class="min-h-screen bg-paper text-ink antialiased">
    <a class="skip-link" href="#main">Skip to content</a>
    <Header />
    <main id="main"><slot /></main>
    <Footer />
    <script is:inline>
      document.addEventListener('click', async (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const button = target.closest('[data-copy]');
        if (!(button instanceof HTMLElement)) return;
        const value = button.getAttribute('data-copy');
        if (!value) return;
        const original = button.textContent ?? 'Copy';
        try {
          if (!navigator.clipboard?.writeText) {
            throw new Error('clipboard unavailable');
          }
          await navigator.clipboard.writeText(value);
          button.textContent = 'Copied';
        } catch {
          button.textContent = 'Select and copy';
        }
        window.setTimeout(() => {
          button.textContent = original;
        }, 1600);
      });
    </script>
  </body>
</html>
```

**Step 9: Create the header and footer**

Create `src/components/layout/Header.astro`:

```astro
---
import { ArrowUpRight } from '@phosphor-icons/react';
import { NAV_ITEMS } from '../../lib/site';

const path = Astro.url.pathname;
const isActive = (href: string) =>
  href === '/' ? path === '/' : path.startsWith(href);
---

<header class="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
  <div class="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
    <a href="/" class="flex items-center gap-2 font-mono text-sm font-medium tracking-tight">
      <span class="grid h-6 w-6 place-items-center rounded border border-ink bg-ink text-[10px] text-paper">T</span>
      shetu
    </a>
    <nav class="hidden items-center gap-7 md:flex" aria-label="Primary">
      {NAV_ITEMS.map((item) => (
        <a
          href={item.href}
          aria-current={isActive(item.href) ? 'page' : undefined}
          class:list={[
            'text-sm transition-colors duration-150 hover:text-accent',
            isActive(item.href) ? 'text-accent' : 'text-muted',
          ]}
        >
          {item.label}
        </a>
      ))}
    </nav>
    <div class="flex items-center gap-3">
      <a
        href="/download"
        class="hidden items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors duration-150 hover:bg-ink/90 sm:inline-flex"
      >
        Download <ArrowUpRight size={14} weight="bold" />
      </a>
      <details class="relative md:hidden">
        <summary class="cursor-pointer list-none rounded-lg border border-line px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          Menu
        </summary>
        <nav class="absolute right-0 mt-2 w-52 rounded-xl border border-line bg-surface p-2" aria-label="Mobile">
          {NAV_ITEMS.map((item) => (
            <a href={item.href} class="block rounded-lg px-3 py-2 text-sm text-muted hover:bg-accent-wash hover:text-accent">
              {item.label}
            </a>
          ))}
          <a href="/download" class="mt-1 block rounded-lg bg-ink px-3 py-2 text-sm text-paper">Download</a>
        </nav>
      </details>
    </div>
  </div>
</header>
```

Create `src/components/layout/Footer.astro`:

```astro
---
import { NAV_ITEMS, REPOS } from '../../lib/site';

const year = new Date().getFullYear();
---

<footer class="border-t border-line">
  <div class="mx-auto grid max-w-[1200px] gap-8 px-6 py-12 md:grid-cols-[1.5fr_1fr_1fr]">
    <div>
      <a href="/" class="font-mono text-sm font-medium">shetu</a>
      <p class="mt-3 max-w-xs text-sm leading-relaxed text-muted">
        The open-source, self-hostable SSH client. Your servers. Your rules.
      </p>
      <p class="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
        MIT licensed · {year}
      </p>
    </div>
    <div>
      <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Site</p>
      <ul class="mt-3 space-y-2">
        {NAV_ITEMS.map((item) => (
          <li><a href={item.href} class="text-sm text-muted hover:text-accent">{item.label}</a></li>
        ))}
      </ul>
    </div>
    <div>
      <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Source</p>
      <ul class="mt-3 space-y-2">
        <li><a href={REPOS.monorepo} class="text-sm text-muted hover:text-accent">shetu</a></li>
        <li><a href={REPOS.client} class="text-sm text-muted hover:text-accent">shetu-client</a></li>
        <li><a href={REPOS.server} class="text-sm text-muted hover:text-accent">shetu-server</a></li>
        <li><a href={REPOS.web} class="text-sm text-muted hover:text-accent">shetu-web</a></li>
      </ul>
    </div>
  </div>
</footer>
```

**Step 10: Create the 404 page and robots endpoint**

Create `src/pages/404.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="Not found — Shetu" description="The page you requested does not exist.">
  <section class="mx-auto max-w-[1200px] px-6 py-24">
    <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">404</p>
    <h1 class="mt-4 text-5xl font-medium tracking-[-0.045em]">That host is unreachable.</h1>
    <p class="mt-4 max-w-xl text-lg text-muted">
      The page you asked for does not exist. Try the download page, the docs, or the home page.
    </p>
    <div class="mt-8 flex flex-wrap gap-3">
      <a href="/" class="rounded-lg bg-ink px-5 py-3 text-sm font-medium text-paper">Home</a>
      <a href="/download" class="rounded-lg border border-line px-5 py-3 text-sm font-medium">Download</a>
      <a href="/docs" class="rounded-lg border border-line px-5 py-3 text-sm font-medium">Docs</a>
    </div>
  </section>
</BaseLayout>
```

Create `src/pages/robots.txt.ts`:

```ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('http://localhost:4321');
  const body = `User-agent: *\nAllow: /\nSitemap: ${new URL('sitemap-index.xml', base).toString()}\n`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
```

**Step 11: Verify**

```sh
pnpm test
pnpm lint:fix
pnpm check
pnpm build
```

Expected: tests pass, `astro check` passes, build succeeds. The old `src/pages/index.astro` still builds because it has not been replaced yet.

**Step 12: Commit**

```sh
git add package.json pnpm-lock.yaml astro.config.mjs tsconfig.json vitest.config.ts src/test/setup.ts src/env.d.ts src/styles/global.css src/lib/site.ts src/lib/site.test.ts src/layouts/BaseLayout.astro src/components/layout src/pages/404.astro src/pages/robots.txt.ts
git commit -m "feat: add site foundation and field manual tokens"
```

---

## Task 2: Platform Detection

**Files:**

- Create: `src/lib/platform.ts`
- Create: `src/lib/platform.test.ts`

**Interfaces:**

- Produces `OS = 'macos' | 'windows' | 'linux' | 'unknown'`.
- Produces `Arch = 'arm64' | 'x64' | 'unknown'`.
- Produces `DetectedPlatform = { os: OS; arch: Arch }`.
- Produces `detectOs(input)`, `detectArch(input, os?)`, `detectPlatform(nav)`.
- `NavigatorLike` is exported for the React island to cast `navigator` without `any`.

**Step 1: Write the failing tests**

Create `src/lib/platform.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { detectArch, detectOs, detectPlatform } from './platform';

describe('detectOs', () => {
  it('prefers userAgentData platform', () => {
    expect(
      detectOs({
        userAgentData: { platform: 'macOS' },
        platform: 'Win32',
        userAgent: 'Windows',
      }),
    ).toBe('macos');
  });

  it('falls back to navigator.platform', () => {
    expect(detectOs({ platform: 'Win32', userAgent: '' })).toBe('windows');
    expect(detectOs({ platform: 'MacIntel', userAgent: '' })).toBe('macos');
    expect(detectOs({ platform: 'Linux x86_64', userAgent: '' })).toBe('linux');
  });

  it('falls back to the user agent', () => {
    expect(
      detectOs({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      }),
    ).toBe('macos');
    expect(
      detectOs({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }),
    ).toBe('windows');
    expect(detectOs({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64)' })).toBe(
      'linux',
    );
  });

  it('does not treat Android as desktop Linux', () => {
    expect(detectOs({ userAgent: 'Mozilla/5.0 (Linux; Android 14)' })).toBe(
      'unknown',
    );
  });

  it('does not treat iOS as desktop macOS', () => {
    expect(
      detectOs({
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      }),
    ).toBe('unknown');
  });

  it('returns unknown for an unrecognized client', () => {
    expect(detectOs({ userAgent: 'curl/8.0' })).toBe('unknown');
  });
});

describe('detectArch', () => {
  it('reads arm64 and x64 from the user agent', () => {
    expect(
      detectArch({ userAgent: 'Mozilla/5.0 (Macintosh; ARM64)' }, 'macos'),
    ).toBe('arm64');
    expect(
      detectArch(
        { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        'windows',
      ),
    ).toBe('x64');
  });

  it('defaults macOS to Apple Silicon', () => {
    expect(detectArch({ userAgent: 'Mozilla/5.0 (Macintosh)' }, 'macos')).toBe(
      'arm64',
    );
  });

  it('defaults macOS to Apple Silicon even with the Intel compatibility token', () => {
    expect(
      detectArch(
        { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
        'macos',
      ),
    ).toBe('arm64');
  });

  it('defaults Windows and Linux to x64', () => {
    expect(detectArch({ userAgent: 'Mozilla/5.0' }, 'windows')).toBe('x64');
    expect(detectArch({ userAgent: 'Mozilla/5.0' }, 'linux')).toBe('x64');
  });
});

describe('detectPlatform', () => {
  it('uses high entropy values when available', async () => {
    await expect(
      detectPlatform({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        userAgentData: {
          platform: 'Windows',
          getHighEntropyValues: async () => ({
            architecture: 'arm',
            bitness: '64',
          }),
        },
      }),
    ).resolves.toEqual({ os: 'windows', arch: 'arm64' });
  });

  it('keeps the best-effort architecture when high entropy fails', async () => {
    await expect(
      detectPlatform({
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
        userAgentData: {
          platform: 'Linux',
          getHighEntropyValues: async () => {
            throw new Error('denied');
          },
        },
      }),
    ).resolves.toEqual({ os: 'linux', arch: 'x64' });
  });
});
```

**Step 2: Run the tests to verify they fail**

```sh
pnpm test -- src/lib/platform.test.ts
```

Expected: fail because `src/lib/platform.ts` does not exist.

**Step 3: Implement the detection**

Create `src/lib/platform.ts`:

```ts
export type OS = 'macos' | 'windows' | 'linux' | 'unknown';
export type Arch = 'arm64' | 'x64' | 'unknown';

export interface PlatformInput {
  userAgentData?: { platform?: string } | null;
  userAgent?: string;
  platform?: string;
}

export interface DetectedPlatform {
  os: OS;
  arch: Arch;
}

export interface NavigatorLike {
  userAgent?: string;
  platform?: string;
  userAgentData?: {
    platform?: string;
    getHighEntropyValues?: (
      hints: string[],
    ) => Promise<{ architecture?: string; bitness?: string }>;
  };
}

export function detectOs(input: PlatformInput): OS {
  const ua = (input.userAgent ?? '').toLowerCase();
  if (/(iphone|ipad|ipod|android|mobile)/.test(ua)) return 'unknown';

  const uaPlatform = input.userAgentData?.platform?.toLowerCase() ?? '';
  if (uaPlatform) {
    if (uaPlatform.includes('mac')) return 'macos';
    if (uaPlatform.includes('win')) return 'windows';
    if (uaPlatform.includes('linux') || uaPlatform.includes('chrome os')) {
      return 'linux';
    }
  }

  const platform = (input.platform ?? '').toLowerCase();
  if (platform.includes('mac')) return 'macos';
  if (platform.includes('win')) return 'windows';
  if (platform.includes('linux') || platform.includes('x11')) return 'linux';

  if (ua.includes('mac os x') || ua.includes('macintosh')) return 'macos';
  if (ua.includes('windows')) return 'windows';
  if (ua.includes('linux') || ua.includes('x11')) return 'linux';
  return 'unknown';
}

export function detectArch(
  input: PlatformInput,
  os: OS = detectOs(input),
): Arch {
  const ua = (input.userAgent ?? '').toLowerCase();
  if (/(aarch64|arm64|apple silicon)/.test(ua)) return 'arm64';
  if (/(x86_64|win64|x64|amd64)/.test(ua)) return 'x64';
  if (os === 'macos') return 'arm64';
  if (os === 'windows' || os === 'linux') return 'x64';
  return 'unknown';
}

export async function detectPlatform(
  nav: NavigatorLike,
): Promise<DetectedPlatform> {
  const os = detectOs(nav);
  let arch = detectArch(nav, os);

  try {
    const high = await nav.userAgentData?.getHighEntropyValues?.([
      'architecture',
      'bitness',
    ]);
    if (high?.architecture === 'arm') arch = 'arm64';
    else if (high?.architecture === 'x86' && high.bitness === '64')
      arch = 'x64';
  } catch {
    // Detection is best-effort. Keep the user-agent result.
  }

  return { os, arch };
}
```

**Step 4: Run the tests to verify they pass**

```sh
pnpm test -- src/lib/platform.test.ts
```

Expected: all tests pass.

**Step 5: Commit**

```sh
git add src/lib/platform.ts src/lib/platform.test.ts
git commit -m "feat: add client-side platform detection"
```

---

## Task 3: Release Parsing, Asset Mapping, and Fallback

**Files:**

- Create: `src/lib/releases.ts`
- Create: `src/lib/releases.test.ts`
- Create: `src/lib/github.ts`
- Create: `src/lib/github.test.ts`
- Create: `src/lib/browser.ts`
- Create: `src/data/releases.json`

**Interfaces:**

- Produces `Release`, `ReleaseAsset`, `PlatformAsset`, `Format`.
- Produces `parseRelease(raw)`, `mapAssets(release)`, `pickRecommended(assets, platform)`, `formatBytes(bytes)`, `formatReleaseDate(iso)`.
- Produces `getLatestRelease({ fallback, ... })` returning `{ release, source }`.
- Produces `getReleases({ fallback, ... })` returning `{ releases, source }`.
- Produces `sessionCache()` returning a `ReleaseCache | null`.

**Step 1: Write the failing release tests**

Create `src/lib/releases.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  formatBytes,
  formatReleaseDate,
  mapAssets,
  parseRelease,
  pickRecommended,
} from './releases';

const raw = {
  tag_name: 'v0.0.15',
  name: 'v0.0.15',
  published_at: '2026-11-05T10:20:49Z',
  html_url: 'https://github.com/nhridoy/shetu-client/releases/tag/v0.0.15',
  prerelease: false,
  body: 'Notes',
  assets: [
    {
      name: 'Shetu-0.0.15-Linux-ARM64.AppImage',
      browser_download_url: 'https://example.com/linux-arm64.AppImage',
      size: 90401288,
    },
    {
      name: 'Shetu-0.0.15-Linux-ARM64.AppImage.sig',
      browser_download_url: 'https://example.com/linux-arm64.AppImage.sig',
      size: 440,
    },
    {
      name: 'Shetu-0.0.15-Linux-ARM64.deb',
      browser_download_url: 'https://example.com/linux-arm64.deb',
      size: 15362046,
    },
    {
      name: 'Shetu-0.0.15-Linux-x64.AppImage',
      browser_download_url: 'https://example.com/linux-x64.AppImage',
      size: 91871736,
    },
    {
      name: 'Shetu-0.0.15-Linux-x64.deb',
      browser_download_url: 'https://example.com/linux-x64.deb',
      size: 14774326,
    },
    {
      name: 'Shetu-0.0.15-macOS-Apple-Silicon.dmg',
      browser_download_url: 'https://example.com/mac-arm64.dmg',
      size: 12292167,
    },
    {
      name: 'Shetu-0.0.15-macOS-Intel.dmg',
      browser_download_url: 'https://example.com/mac-x64.dmg',
      size: 13237946,
    },
    {
      name: 'Shetu-0.0.15-Windows-ARM64-Setup.exe',
      browser_download_url: 'https://example.com/win-arm64.exe',
      size: 7674339,
    },
    {
      name: 'Shetu-0.0.15-Windows-x64-Setup.exe',
      browser_download_url: 'https://example.com/win-x64.exe',
      size: 8653414,
    },
    {
      name: 'Shetu-0.0.15-macOS-Apple-Silicon.app.tar.gz',
      browser_download_url: 'https://example.com/mac-arm64.app.tar.gz',
      size: 12479459,
    },
    {
      name: 'shetu-latest.json',
      browser_download_url: 'https://example.com/latest.json',
      size: 5158,
    },
  ],
};

describe('parseRelease', () => {
  it('keeps the fields the site needs and drops empty assets', () => {
    const release = parseRelease({
      ...raw,
      assets: [...raw.assets, { name: '', browser_download_url: '' }],
    });
    expect(release.tag_name).toBe('v0.0.15');
    expect(release.body).toBe('Notes');
    expect(release.assets).toHaveLength(raw.assets.length);
  });

  it('rejects non-objects', () => {
    expect(() => parseRelease(null)).toThrow();
  });
});

describe('mapAssets', () => {
  it('maps eight build files and ignores signatures and manifests', () => {
    const assets = mapAssets(parseRelease(raw));
    expect(assets).toHaveLength(8);
    expect(
      assets.map((asset) => `${asset.os}/${asset.arch}/${asset.format}`).sort(),
    ).toEqual(
      [
        'linux/arm64/appimage',
        'linux/arm64/deb',
        'linux/x64/appimage',
        'linux/x64/deb',
        'macos/arm64/dmg',
        'macos/x64/dmg',
        'windows/arm64/exe',
        'windows/x64/exe',
      ].sort(),
    );
  });
});

describe('pickRecommended', () => {
  it('picks the matching OS and architecture', () => {
    const assets = mapAssets(parseRelease(raw));
    expect(pickRecommended(assets, { os: 'macos', arch: 'arm64' })?.url).toBe(
      'https://example.com/mac-arm64.dmg',
    );
    expect(pickRecommended(assets, { os: 'windows', arch: 'x64' })?.url).toBe(
      'https://example.com/win-x64.exe',
    );
    expect(pickRecommended(assets, { os: 'linux', arch: 'x64' })?.format).toBe(
      'appimage',
    );
  });

  it('falls back to the other architecture when the exact one is missing', () => {
    const assets = mapAssets(parseRelease(raw)).filter(
      (asset) => !(asset.os === 'windows' && asset.arch === 'arm64'),
    );
    expect(
      pickRecommended(assets, { os: 'windows', arch: 'arm64' })?.arch,
    ).toBe('x64');
  });

  it('returns null for an unknown OS', () => {
    expect(
      pickRecommended(mapAssets(parseRelease(raw)), {
        os: 'unknown',
        arch: 'unknown',
      }),
    ).toBeNull();
  });
});

describe('formatBytes', () => {
  it('formats sizes', () => {
    expect(formatBytes(0)).toBe('—');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(12292167)).toBe('11.7 MB');
  });
});

describe('formatReleaseDate', () => {
  it('formats an ISO date in UTC', () => {
    expect(formatReleaseDate('2026-11-05T10:20:49Z')).toBe('Nov 5, 2026');
  });

  it('handles invalid dates', () => {
    expect(formatReleaseDate('nope')).toBe('Unknown date');
  });
});
```

**Step 2: Run the tests to verify they fail**

```sh
pnpm test -- src/lib/releases.test.ts
```

Expected: fail because `src/lib/releases.ts` does not exist.

**Step 3: Implement release parsing and mapping**

Create `src/lib/releases.ts`:

```ts
import type { Arch, OS } from './platform';

export type Format = 'dmg' | 'exe' | 'appimage' | 'deb';

export interface ReleaseAsset {
  name: string;
  browser_download_url: string;
  size: number;
}

export interface Release {
  tag_name: string;
  name: string;
  published_at: string;
  html_url: string;
  prerelease: boolean;
  body: string;
  assets: ReleaseAsset[];
}

export interface PlatformAsset {
  os: OS;
  arch: Arch;
  format: Format;
  label: string;
  url: string;
  size: number;
}

const FORMATS: Record<string, Format> = {
  dmg: 'dmg',
  exe: 'exe',
  appimage: 'appimage',
  deb: 'deb',
};

function extension(name: string): string {
  const match = /\.([a-z0-9]+)$/i.exec(name);
  return match ? match[1].toLowerCase() : '';
}

function archOf(name: string): Arch {
  const lower = name.toLowerCase();
  if (/(aarch64|arm64|apple[-_ ]?silicon)/.test(lower)) return 'arm64';
  if (/(x86_64|amd64|x64|intel)/.test(lower)) return 'x64';
  return 'unknown';
}

function labelFor(os: OS, arch: Arch, format: Format): string {
  const osName =
    os === 'macos' ? 'macOS' : os === 'windows' ? 'Windows' : 'Linux';
  const archName = arch === 'arm64' ? 'ARM64' : 'x64';
  const formatName =
    format === 'dmg'
      ? 'DMG'
      : format === 'exe'
        ? 'Installer'
        : format === 'appimage'
          ? 'AppImage'
          : 'DEB';
  return `${osName} ${archName} (${formatName})`;
}

export function parseRelease(raw: unknown): Release {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid release payload');
  }

  const value = raw as Record<string, unknown>;
  const assets = Array.isArray(value.assets) ? value.assets : [];

  return {
    tag_name: String(value.tag_name ?? ''),
    name: String(value.name ?? value.tag_name ?? ''),
    published_at: String(value.published_at ?? ''),
    html_url: String(value.html_url ?? ''),
    prerelease: Boolean(value.prerelease),
    body: String(value.body ?? ''),
    assets: assets
      .map((asset) => {
        const item = asset as Record<string, unknown>;
        return {
          name: String(item.name ?? ''),
          browser_download_url: String(item.browser_download_url ?? ''),
          size: Number(item.size ?? 0),
        };
      })
      .filter((asset) => asset.name && asset.browser_download_url),
  };
}

export function mapAssets(release: Release): PlatformAsset[] {
  const mapped: PlatformAsset[] = [];

  for (const asset of release.assets) {
    const format = FORMATS[extension(asset.name)];
    if (!format) continue;

    const os: OS =
      format === 'dmg' ? 'macos' : format === 'exe' ? 'windows' : 'linux';
    const arch = archOf(asset.name);
    if (arch === 'unknown') continue;

    mapped.push({
      os,
      arch,
      format,
      label: labelFor(os, arch, format),
      url: asset.browser_download_url,
      size: asset.size,
    });
  }

  return mapped;
}

export function pickRecommended(
  assets: PlatformAsset[],
  platform: { os: OS; arch: Arch },
): PlatformAsset | null {
  const sameOs = assets.filter((asset) => asset.os === platform.os);
  if (sameOs.length === 0) return null;

  const sameArch = sameOs.filter((asset) => asset.arch === platform.arch);
  const pool = sameArch.length > 0 ? sameArch : sameOs;
  const preference: Format[] =
    platform.os === 'linux'
      ? ['appimage', 'deb', 'dmg', 'exe']
      : ['dmg', 'exe', 'appimage', 'deb'];

  for (const format of preference) {
    const found = pool.find((asset) => asset.format === format);
    if (found) return found;
  }

  return pool[0] ?? null;
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** exponent;
  const rounded = Number.isInteger(value) ? String(value) : value.toFixed(1);
  return `${rounded} ${units[exponent]}`;
}

export function formatReleaseDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
```

**Step 4: Run the release tests to verify they pass**

```sh
pnpm test -- src/lib/releases.test.ts
```

Expected: all tests pass.

**Step 5: Write the failing GitHub client tests**

Create `src/lib/github.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import { getLatestRelease, getReleases, type ReleaseCache } from './github';
import type { Release } from './releases';

const release: Release = {
  tag_name: 'v1.2.3',
  name: 'v1.2.3',
  published_at: '2026-01-01T00:00:00Z',
  html_url: 'https://github.com/nhridoy/shetu-client/releases/tag/v1.2.3',
  prerelease: false,
  body: 'Notes',
  assets: [
    {
      name: 'Shetu-1.2.3-Linux-x64.AppImage',
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
```

**Step 6: Run the GitHub tests to verify they fail**

```sh
pnpm test -- src/lib/github.test.ts
```

Expected: fail because `src/lib/github.ts` does not exist.

**Step 7: Implement the GitHub client and browser cache helper**

Create `src/lib/github.ts`:

```ts
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
  const key = `shetu:latest-release:${apiBase}`;
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
  const key = `shetu:releases:${apiBase}`;
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
```

Create `src/lib/browser.ts`:

```ts
import type { ReleaseCache } from './github';

export function sessionCache(): ReleaseCache | null {
  try {
    if (typeof sessionStorage === 'undefined') return null;
    return sessionStorage;
  } catch {
    return null;
  }
}
```

**Step 8: Create the committed fallback snapshot**

Create `src/data/releases.json` with the real `v0.0.15` assets:

```json
{
  "fetched_at": "2026-11-09T00:00:00Z",
  "latest": {
    "tag_name": "v0.0.15",
    "name": "v0.0.15",
    "published_at": "2026-11-05T10:20:49Z",
    "html_url": "https://github.com/nhridoy/shetu-client/releases/tag/v0.0.15",
    "prerelease": false,
    "body": "",
    "assets": [
      {
        "name": "Shetu-0.0.15-Linux-ARM64.AppImage",
        "browser_download_url": "https://github.com/nhridoy/shetu-client/releases/download/v0.0.15/Shetu-0.0.15-Linux-ARM64.AppImage",
        "size": 90401288
      },
      {
        "name": "Shetu-0.0.15-Linux-ARM64.deb",
        "browser_download_url": "https://github.com/nhridoy/shetu-client/releases/download/v0.0.15/Shetu-0.0.15-Linux-ARM64.deb",
        "size": 15362046
      },
      {
        "name": "Shetu-0.0.15-Linux-x64.AppImage",
        "browser_download_url": "https://github.com/nhridoy/shetu-client/releases/download/v0.0.15/Shetu-0.0.15-Linux-x64.AppImage",
        "size": 91871736
      },
      {
        "name": "Shetu-0.0.15-Linux-x64.deb",
        "browser_download_url": "https://github.com/nhridoy/shetu-client/releases/download/v0.0.15/Shetu-0.0.15-Linux-x64.deb",
        "size": 14774326
      },
      {
        "name": "Shetu-0.0.15-macOS-Apple-Silicon.dmg",
        "browser_download_url": "https://github.com/nhridoy/shetu-client/releases/download/v0.0.15/Shetu-0.0.15-macOS-Apple-Silicon.dmg",
        "size": 12292167
      },
      {
        "name": "Shetu-0.0.15-macOS-Intel.dmg",
        "browser_download_url": "https://github.com/nhridoy/shetu-client/releases/download/v0.0.15/Shetu-0.0.15-macOS-Intel.dmg",
        "size": 13237946
      },
      {
        "name": "Shetu-0.0.15-Windows-ARM64-Setup.exe",
        "browser_download_url": "https://github.com/nhridoy/shetu-client/releases/download/v0.0.15/Shetu-0.0.15-Windows-ARM64-Setup.exe",
        "size": 7674339
      },
      {
        "name": "Shetu-0.0.15-Windows-x64-Setup.exe",
        "browser_download_url": "https://github.com/nhridoy/shetu-client/releases/download/v0.0.15/Shetu-0.0.15-Windows-x64-Setup.exe",
        "size": 8653414
      }
    ]
  },
  "releases": []
}
```

**Step 9: Run all tests**

```sh
pnpm test
```

Expected: platform, releases, GitHub, and site tests pass.

**Step 10: Commit**

```sh
git add src/lib/releases.ts src/lib/releases.test.ts src/lib/github.ts src/lib/github.test.ts src/lib/browser.ts src/data/releases.json
git commit -m "feat: add release parsing, caching, and fallback snapshot"
```

---

## Task 4: Download Panel and Install Commands

**Files:**

- Create: `src/components/download/DownloadPanel.tsx`
- Create: `src/components/download/DownloadPanel.test.tsx`
- Create: `src/components/download/InstallCommand.astro`

**Interfaces:**

- Consumes `detectPlatform`, `getLatestRelease`, `mapAssets`, `pickRecommended`, `formatBytes`, `formatReleaseDate`.
- `DownloadPanel` props: `{ variant?: 'hero' | 'full'; detect?: () => Promise<DetectedPlatform>; load?: () => Promise<ReleaseResult> }`.
- `InstallCommand` has no props; it imports `INSTALL_COMMANDS` directly.

**Step 1: Write the failing download panel tests**

Create `src/components/download/DownloadPanel.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import DownloadPanel from './DownloadPanel';
import type { ReleaseResult } from '../../lib/github';
import type { DetectedPlatform } from '../../lib/platform';
import type { Release } from '../../lib/releases';

const release: Release = {
  tag_name: 'v9.9.9',
  name: 'v9.9.9',
  published_at: '2026-01-01T00:00:00Z',
  html_url: 'https://github.com/nhridoy/shetu-client/releases/tag/v9.9.9',
  prerelease: false,
  body: '',
  assets: [
    {
      name: 'Shetu-9.9.9-Linux-x64.AppImage',
      browser_download_url: 'https://example.com/linux-x64.AppImage',
      size: 1024,
    },
    {
      name: 'Shetu-9.9.9-Windows-x64-Setup.exe',
      browser_download_url: 'https://example.com/windows-x64.exe',
      size: 1024,
    },
  ],
};

describe('DownloadPanel', () => {
  it('renders the committed matrix before live data arrives', () => {
    render(
      <DownloadPanel
        variant="full"
        detect={() => new Promise<DetectedPlatform>(() => {})}
        load={() => new Promise<ReleaseResult>(() => {})}
      />,
    );
    expect(screen.getByTestId('download-matrix')).toBeInTheDocument();
    expect(screen.getByTestId('release-version')).toHaveTextContent('v0.0.15');
  });

  it('recommends the detected platform and links to its asset', async () => {
    render(
      <DownloadPanel
        variant="full"
        detect={async () => ({ os: 'linux', arch: 'x64' })}
        load={async () => ({ release, source: 'live' })}
      />,
    );
    const link = await screen.findByTestId('recommended-download');
    expect(link).toHaveAttribute(
      'href',
      'https://example.com/linux-x64.AppImage',
    );
    expect(screen.getByTestId('release-version')).toHaveTextContent('v9.9.9');
  });

  it('shows a fallback notice when live data is unavailable', async () => {
    render(
      <DownloadPanel
        variant="full"
        detect={async () => ({ os: 'macos', arch: 'arm64' })}
        load={async () => ({ release, source: 'fallback' })}
      />,
    );
    expect(await screen.findByTestId('fallback-notice')).toBeInTheDocument();
  });
});
```

Note: `ReleaseResult` is exported from `src/lib/github.ts`, not `src/lib/releases.ts`. Import it from `../../lib/github` in the test. The component also imports it from there.

**Step 2: Run the tests to verify they fail**

```sh
pnpm test -- src/components/download/DownloadPanel.test.tsx
```

Expected: fail because the component does not exist.

**Step 3: Implement the download panel**

Create `src/components/download/DownloadPanel.tsx`:

```tsx
import { useEffect, useMemo, useState } from 'react';
import fallbackData from '../../data/releases.json';
import { sessionCache } from '../../lib/browser';
import { getLatestRelease, type ReleaseResult } from '../../lib/github';
import {
  detectPlatform,
  type DetectedPlatform,
  type NavigatorLike,
} from '../../lib/platform';
import {
  formatBytes,
  formatReleaseDate,
  mapAssets,
  pickRecommended,
  type Release,
} from '../../lib/releases';

const fallbackRelease = fallbackData.latest as Release;

export interface DownloadPanelProps {
  variant?: 'hero' | 'full';
  detect?: () => Promise<DetectedPlatform>;
  load?: () => Promise<ReleaseResult>;
}

function osLabel(os: string): string {
  if (os === 'macos') return 'macOS';
  if (os === 'windows') return 'Windows';
  if (os === 'linux') return 'Linux';
  return 'your system';
}

export default function DownloadPanel({
  variant = 'full',
  detect,
  load,
}: DownloadPanelProps) {
  const [platform, setPlatform] = useState<DetectedPlatform | null>(null);
  const [release, setRelease] = useState<Release>(fallbackRelease);
  const [source, setSource] = useState<'live' | 'fallback'>('fallback');
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const detected = detect
          ? await detect()
          : await detectPlatform(navigator as unknown as NavigatorLike);
        if (active) setPlatform(detected);

        const result = load
          ? await load()
          : await getLatestRelease({
              fallback: fallbackRelease,
              cache: sessionCache(),
            });
        if (!active) return;
        setRelease(result.release);
        setSource(result.source);
      } catch {
        // Keep the committed snapshot. The matrix is already rendered.
      } finally {
        if (active) setChecked(true);
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [detect, load]);

  const assets = useMemo(() => mapAssets(release), [release]);
  const recommended = useMemo(
    () => (platform ? pickRecommended(assets, platform) : null),
    [assets, platform],
  );

  if (variant === 'hero') {
    return (
      <a
        href={recommended?.url ?? '/download'}
        data-testid="hero-download"
        className="inline-flex items-center justify-center rounded-lg bg-ink px-5 py-3 text-sm font-medium text-paper transition-colors duration-150 hover:bg-ink/90"
      >
        {recommended
          ? `Download for ${osLabel(platform?.os ?? '')}`
          : 'Download Shetu'}
      </a>
    );
  }

  const grouped = ['macos', 'windows', 'linux']
    .map((os) => ({
      os,
      items: assets.filter((asset) => asset.os === os),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="space-y-8">
      <div className="min-h-[190px] rounded-xl border border-line bg-surface p-6">
        {recommended ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                Recommended for your system
              </p>
              <h2 className="mt-2 text-2xl font-medium tracking-[-0.03em]">
                {osLabel(platform?.os ?? '')}{' '}
                {platform?.arch === 'arm64' ? 'ARM64' : 'x64'}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {recommended.label} · {formatBytes(recommended.size)} ·{' '}
                {release.tag_name}
              </p>
            </div>
            <a
              data-testid="recommended-download"
              href={recommended.url}
              className="inline-flex items-center justify-center rounded-lg bg-ink px-5 py-3 text-sm font-medium text-paper transition-colors duration-150 hover:bg-ink/90"
            >
              Download
            </a>
          </div>
        ) : (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
              Choose your platform
            </p>
            <p className="mt-2 text-lg">
              {checked && platform
                ? 'No build matched your system. Pick a build below.'
                : 'Pick the build that matches your computer.'}
            </p>
            <p className="mt-1 text-sm text-muted">
              Every build is listed below. Detection is a convenience, never a
              gate.
            </p>
          </div>
        )}

        {checked && source === 'fallback' && (
          <p
            data-testid="fallback-notice"
            className="mt-4 border-t border-line pt-4 text-sm text-muted"
          >
            Live release metadata is unavailable. Showing the last known
            release. Check{' '}
            <a
              className="underline decoration-line underline-offset-4 hover:text-accent"
              href={release.html_url}
            >
              GitHub Releases
            </a>{' '}
            for the newest build.
          </p>
        )}
      </div>

      <div data-testid="download-matrix" className="space-y-6">
        {grouped.map(({ os, items }) => (
          <section key={os} aria-labelledby={`platform-${os}`}>
            <h3
              id={`platform-${os}`}
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted"
            >
              {osLabel(os)}
            </h3>
            <ul className="mt-3 divide-y divide-line rounded-xl border border-line bg-surface">
              {items.map((asset) => (
                <li
                  key={asset.url}
                  className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">{asset.label}</p>
                    <p className="text-xs text-muted">
                      {formatBytes(asset.size)}
                    </p>
                  </div>
                  <a
                    className="text-sm font-medium text-accent underline decoration-line underline-offset-4 hover:decoration-accent"
                    href={asset.url}
                  >
                    Download
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="text-xs text-muted">
        <span data-testid="release-version">{release.tag_name}</span> · released{' '}
        {formatReleaseDate(release.published_at)} ·{' '}
        <a
          className="underline decoration-line underline-offset-4 hover:text-accent"
          href={release.html_url}
        >
          Release notes
        </a>
      </p>
    </div>
  );
}
```

**Step 4: Run the download panel tests to verify they pass**

```sh
pnpm test -- src/components/download/DownloadPanel.test.tsx
```

Expected: 3 passing tests.

**Step 5: Create the static install command switcher**

Create `src/components/download/InstallCommand.astro`:

```astro
---
import { INSTALL_COMMANDS } from '../../lib/site';

const commands = [
  {
    id: 'unix',
    label: 'macOS / Linux',
    command: INSTALL_COMMANDS.unix,
    hint: 'On Debian or Ubuntu this installs the .deb. Elsewhere it places the AppImage at ~/.local/bin/shetu, which needs libfuse2.',
  },
  {
    id: 'windows',
    label: 'Windows',
    command: INSTALL_COMMANDS.windows,
    hint: 'Installs the NSIS setup for your architecture.',
  },
];
---

<fieldset class="install-command border-0 p-0">
  <legend class="sr-only">Install command by operating system</legend>

  {commands.map((item, index) => (
    <input
      type="radio"
      name="install-os"
      id={`install-${item.id}`}
      class="install-radio sr-only"
      checked={index === 0}
    />
  ))}

  <div class="install-tabs flex flex-wrap gap-2">
    {commands.map((item) => (
      <label
        for={`install-${item.id}`}
        class="cursor-pointer rounded-lg border border-line px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted"
      >
        {item.label}
      </label>
    ))}
  </div>

  {commands.map((item) => (
    <div class="install-panel mt-3" data-panel={item.id}>
      <div class="overflow-hidden rounded-xl border border-white/10 bg-terminal">
        <div class="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
          <span class="font-mono text-[10px] uppercase tracking-[0.18em] text-white/60">
            {item.label}
          </span>
          <button
            type="button"
            data-copy={item.command}
            class="rounded border border-white/15 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white/70 transition-colors duration-150 hover:border-white/30 hover:text-white"
          >
            Copy
          </button>
        </div>
        <pre class="overflow-x-auto p-4 text-[12px] leading-relaxed text-terminal-text"><code>{item.command}</code></pre>
      </div>
      <p class="mt-2 text-xs leading-relaxed text-muted">{item.hint}</p>
    </div>
  ))}
</fieldset>
```

**Step 6: Verify the static commands are in the build**

Temporarily create `src/pages/_check.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import InstallCommand from '../components/download/InstallCommand.astro';
---

<BaseLayout title="check" description="check">
  <InstallCommand />
</BaseLayout>
```

Run:

```sh
pnpm build
grep -q "install.sh | bash" dist/_check/index.html
grep -q "install.ps1 | iex" dist/_check/index.html
grep -q 'id="install-windows"' dist/_check/index.html
```

Expected: all three greps exit 0. Delete `src/pages/_check.astro` after verification.

**Step 7: Commit**

```sh
git add src/components/download/DownloadPanel.tsx src/components/download/DownloadPanel.test.tsx src/components/download/InstallCommand.astro
git commit -m "feat: add download panel and static install commands"
```

---

## Task 5: Home Page and Marketing Sections

**Files:**

- Replace: `src/pages/index.astro`
- Create: `src/components/ui/CodeBlock.astro`
- Create: `src/components/ui/Callout.astro`
- Create: `src/components/marketing/Hero.astro`
- Create: `src/components/marketing/FactRibbon.astro`
- Create: `src/components/marketing/ValueCards.astro`
- Create: `src/components/marketing/WorkspaceMock.astro`
- Create: `src/components/marketing/SecurityFlow.astro`
- Create: `src/components/marketing/SelfHostPanel.astro`
- Create: `src/components/marketing/OpenSource.astro`
- Create: `src/components/marketing/ClosingCta.astro`
- Delete: `src/components/landing/PlanSelector.tsx`
- Delete: `src/components/landing/WorkspaceDemo.tsx`

**Interfaces:**

- `CodeBlock.astro` props: `{ code: string; label?: string }`.
- `Callout.astro` props: `{ tone?: 'note' | 'warning'; title: string }`.
- `Hero.astro` hydrates `DownloadPanel` with `client:load`.

**Step 1: Create the UI primitives**

Create `src/components/ui/CodeBlock.astro`:

```astro
---
interface Props {
  code: string;
  label?: string;
}

const { code, label = 'shell' } = Astro.props;
---

<div class="overflow-hidden rounded-xl border border-white/10 bg-terminal">
  <div class="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
    <span class="font-mono text-[10px] uppercase tracking-[0.18em] text-white/60">
      {label}
    </span>
    <button
      type="button"
      data-copy={code}
      class="rounded border border-white/15 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white/70 transition-colors duration-150 hover:border-white/30 hover:text-white"
    >
      Copy
    </button>
  </div>
  <pre class="overflow-x-auto p-4 text-[13px] leading-relaxed text-terminal-text"><code>{code}</code></pre>
</div>
```

Create `src/components/ui/Callout.astro`:

```astro
---
interface Props {
  tone?: 'note' | 'warning';
  title: string;
}

const { tone = 'note', title } = Astro.props;
---

<div
  class:list={[
    'rounded-xl border p-4',
    tone === 'warning'
      ? 'border-amber-300 bg-amber-50'
      : 'border-line bg-surface',
  ]}
>
  <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
    {title}
  </p>
  <div class="mt-2 text-sm leading-relaxed text-ink"><slot /></div>
</div>
```

**Step 2: Create the marketing sections**

Create `src/components/marketing/Hero.astro`:

```astro
---
import DownloadPanel from '../download/DownloadPanel';
import WorkspaceMock from './WorkspaceMock.astro';
---

<section class="mx-auto max-w-[1200px] px-6 pt-14 pb-20 md:pt-24 md:pb-28">
  <div class="grid items-center gap-12 md:grid-cols-12">
    <div class="md:col-span-7">
      <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
        Open source · Self-hostable
      </p>
      <h1 class="mt-5 text-[clamp(2.75rem,7vw,4.75rem)] font-medium leading-[1.02] tracking-[-0.05em]">
        Your servers.<br /><span class="text-accent">Your rules.</span>
      </h1>
      <p class="mt-6 max-w-xl text-lg leading-relaxed text-muted">
        A desktop SSH workspace that connects straight to your machines.
        Encrypted vault, SFTP, split terminals, and optional sync you can host
        yourself.
      </p>
      <div class="mt-8 flex flex-wrap items-center gap-3">
        <DownloadPanel client:load variant="hero" />
        <a
          href="/docs/server"
          class="inline-flex items-center justify-center rounded-lg border border-line bg-surface px-5 py-3 text-sm font-medium transition-colors duration-150 hover:bg-accent-wash"
        >
          Self-host it
        </a>
      </div>
      <p class="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
        MIT licensed · Windows · macOS · Linux
      </p>
    </div>
    <div class="md:col-span-5">
      <WorkspaceMock />
    </div>
  </div>
</section>
```

Create `src/components/marketing/WorkspaceMock.astro`:

```astro
<div>
  <div
    class="overflow-hidden rounded-xl border border-white/10 bg-terminal text-terminal-text"
    role="img"
    aria-label="Illustration of the Shetu workspace with host list, terminal tabs, and SFTP panel"
  >
    <div class="flex items-center gap-2 border-b border-white/10 px-4 py-3">
      <span class="h-2.5 w-2.5 rounded-full bg-white/20"></span>
      <span class="h-2.5 w-2.5 rounded-full bg-white/20"></span>
      <span class="h-2.5 w-2.5 rounded-full bg-white/20"></span>
      <span class="ml-auto font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
        shetu · workspace
      </span>
    </div>
    <div class="grid grid-cols-[96px_1fr] text-[11px] sm:grid-cols-[120px_1fr]">
      <div class="border-r border-white/10 p-3 font-mono text-white/50">
        <p class="text-[9px] uppercase tracking-[0.16em] text-white/30">Hosts</p>
        <p class="mt-2 rounded bg-white/10 px-2 py-1 text-white/90">prod-web-01</p>
        <p class="mt-1 px-2 py-1">staging-db</p>
        <p class="mt-1 px-2 py-1">edge-eu</p>
        <p class="mt-4 text-[9px] uppercase tracking-[0.16em] text-white/30">SFTP</p>
        <p class="mt-2 px-2 py-1">/var/www</p>
        <p class="mt-1 px-2 py-1">/etc/nginx</p>
      </div>
      <div class="min-w-0 p-4 font-mono leading-relaxed">
        <div class="flex gap-2 text-[9px] uppercase tracking-[0.14em] text-white/40">
          <span class="rounded bg-white/10 px-2 py-1 text-white/80">prod-web-01</span>
          <span class="px-2 py-1">staging-db</span>
        </div>
        <p class="mt-4"><span class="text-white/40">$</span> ssh deploy@prod-web-01</p>
        <p class="mt-1 text-white/50">Connected · 18ms · ed25519</p>
        <p class="mt-4"><span class="text-white/40">$</span> systemctl status nginx</p>
        <p class="mt-1">● nginx.service — active (running)</p>
        <p class="mt-4"><span class="text-white/40">$</span> tail -f /var/log/nginx/access.log</p>
        <p class="mt-1 text-white/50">203.0.113.42 — GET /health 200 2ms</p>
        <p class="mt-1 text-white/50">198.51.100.7 — GET /api/v1/status 200 4ms</p>
        <div class="mt-5 border-t border-white/10 pt-3">
          <p class="text-[9px] uppercase tracking-[0.16em] text-white/30">
            SFTP · /var/www/shetu
          </p>
          <p class="mt-2 text-white/70">index.html <span class="float-right text-white/40">12 KB</span></p>
          <p class="text-white/70">assets/ <span class="float-right text-white/40">dir</span></p>
          <p class="text-white/70">deploy.sh <span class="float-right text-white/40">2 KB</span></p>
        </div>
      </div>
    </div>
  </div>
  <p class="mt-2 text-right font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
    Illustrative workspace, not a screenshot
  </p>
</div>
```

Create `src/components/marketing/FactRibbon.astro`:

```astro
---
const facts = [
  'MIT licensed',
  'Windows · macOS · Linux',
  'Direct SSH',
  'Encrypted vault',
  'Self-hosted sync',
];
---

<section class="border-y border-line bg-surface">
  <div class="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-8 gap-y-3 px-6 py-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
    {facts.map((fact, index) => (
      <>
        {index > 0 && (
          <span class="hidden h-1 w-1 rounded-full bg-line sm:block" aria-hidden="true"></span>
        )}
        <span>{fact}</span>
      </>
    ))}
  </div>
</section>
```

Create `src/components/marketing/ValueCards.astro`:

```astro
---
const values = [
  {
    title: 'Direct connections',
    body: 'SSH and SFTP go from your machine to the host. No relay, no proxy, no server in the path.',
    visual: 'ssh prod-web-01',
  },
  {
    title: 'Encrypted vault',
    body: 'Credentials and keys are encrypted on your device with Argon2id and XChaCha20-Poly1305.',
    visual: 'vault · locked',
  },
  {
    title: 'SFTP and editor',
    body: 'Browse remote files, edit in place, and move files without leaving the workspace.',
    visual: 'sftp /var/www',
  },
  {
    title: 'Port forwarding',
    body: 'Open local and remote forwards for databases, dashboards, and internal services.',
    visual: '127.0.0.1:5432 → db',
  },
];
---

<section class="mx-auto max-w-[1200px] px-6 py-20 md:py-28">
  <div class="max-w-2xl">
    <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
      What you get
    </p>
    <h2 class="mt-3 text-4xl font-medium tracking-[-0.04em] md:text-5xl">
      A terminal workspace, not a browser tab.
    </h2>
  </div>
  <div class="mt-10 grid gap-4 sm:grid-cols-2">
    {values.map((value) => (
      <article class="rounded-xl border border-line bg-surface p-6">
        <div class="rounded-lg border border-white/10 bg-terminal px-3 py-2 font-mono text-[11px] text-terminal-text">
          {value.visual}
        </div>
        <h3 class="mt-5 text-lg font-medium tracking-[-0.02em]">{value.title}</h3>
        <p class="mt-2 text-sm leading-relaxed text-muted">{value.body}</p>
      </article>
    ))}
  </div>
</section>
```

Create `src/components/marketing/SecurityFlow.astro`:

```astro
---
const steps = [
  {
    label: 'Master password',
    detail: 'Argon2id derives the vault key on your device.',
  },
  {
    label: 'Vault key',
    detail: 'XChaCha20-Poly1305 encrypts credentials and keys.',
  },
  {
    label: 'X25519 identity',
    detail: 'Team keys are wrapped for each member.',
  },
  {
    label: 'Sync server',
    detail: 'Stores ciphertext and wrapped keys. Never plaintext.',
  },
];
---

<section class="border-y border-line bg-surface">
  <div class="mx-auto grid max-w-[1200px] gap-10 px-6 py-20 md:grid-cols-2 md:py-28">
    <div>
      <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
        Security model
      </p>
      <h2 class="mt-3 text-4xl font-medium tracking-[-0.04em]">
        The server never sees the keys.
      </h2>
      <p class="mt-4 max-w-lg text-lg leading-relaxed text-muted">
        Shetu encrypts your vault before anything reaches sync. The server can
        store and return ciphertext, but it cannot read your credentials,
        private keys, or SSH traffic.
      </p>
      <a
        href="/security"
        class="mt-6 inline-flex text-sm font-medium text-accent underline decoration-line underline-offset-4 hover:decoration-accent"
      >
        Read the security model
      </a>
    </div>
    <div class="space-y-3">
      {steps.map((step, index) => (
        <div class="flex gap-4 rounded-xl border border-line bg-paper p-4">
          <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line font-mono text-[10px] text-accent">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div>
            <p class="text-sm font-medium">{step.label}</p>
            <p class="mt-1 text-sm text-muted">{step.detail}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
```

Create `src/components/marketing/SelfHostPanel.astro`:

```astro
---
import CodeBlock from '../ui/CodeBlock.astro';

const compose = `services:
  postgres:
    image: postgres:17-alpine
    environment:
      POSTGRES_USER: shetu
      POSTGRES_PASSWORD: change-me
      POSTGRES_DB: shetu
    volumes:
      - shetu-db:/var/lib/postgresql/data

  shetu-server:
    image: ghcr.io/nhridoy/shetu-server:latest
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: postgres://shetu:change-me@postgres:5432/shetu?sslmode=disable
      JWT_SECRET: replace-with-a-long-random-string
      BASE_URL: https://sync.example.com

volumes:
  shetu-db:`;
---

<section class="mx-auto max-w-[1200px] px-6 py-20 md:py-28">
  <div class="grid gap-10 md:grid-cols-[1fr_1.1fr] md:items-start">
    <div>
      <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
        Self-host
      </p>
      <h2 class="mt-3 text-4xl font-medium tracking-[-0.04em]">
        Sync on your infrastructure.
      </h2>
      <p class="mt-4 text-lg leading-relaxed text-muted">
        Shetu works without a Shetu account or sync server. If you want sync
        across devices, run the Go server next to your own PostgreSQL. You
        control the data and the uptime.
      </p>
      <ol class="mt-6 space-y-3 text-sm text-muted">
        <li><span class="font-mono text-accent">01</span> Start PostgreSQL and the server with Docker Compose.</li>
        <li><span class="font-mono text-accent">02</span> Set a long <code class="font-mono text-ink">JWT_SECRET</code> and your public <code class="font-mono text-ink">BASE_URL</code>.</li>
        <li><span class="font-mono text-accent">03</span> Point Shetu at your server in settings and sign in.</li>
      </ol>
      <a
        href="/docs/server"
        class="mt-6 inline-flex text-sm font-medium text-accent underline decoration-line underline-offset-4 hover:decoration-accent"
      >
        Self-hosting guide
      </a>
    </div>
    <CodeBlock code={compose} label="compose.yaml" />
  </div>
</section>
```

Create `src/components/marketing/OpenSource.astro`:

```astro
---
import { REPOS } from '../../lib/site';

const repos = [
  {
    name: 'shetu',
    href: REPOS.monorepo,
    description: 'Project home, docs, and cross-cutting issues.',
  },
  {
    name: 'shetu-client',
    href: REPOS.client,
    description: 'Tauri v2 desktop client: Rust, React, TypeScript.',
  },
  {
    name: 'shetu-server',
    href: REPOS.server,
    description: 'Go sync and auth server: Gin, GORM, PostgreSQL.',
  },
  {
    name: 'shetu-web',
    href: REPOS.web,
    description: 'This site: Astro, React islands, Tailwind.',
  },
];
---

<section class="border-t border-line">
  <div class="mx-auto max-w-[1200px] px-6 py-20 md:py-28">
    <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
          Open source
        </p>
        <h2 class="mt-3 text-4xl font-medium tracking-[-0.04em]">
          Read the code. Run the server. Own the stack.
        </h2>
      </div>
      <a
        href="/community"
        class="text-sm font-medium text-accent underline decoration-line underline-offset-4 hover:decoration-accent"
      >
        Community and contributing
      </a>
    </div>
    <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {repos.map((repo) => (
        <a
          href={repo.href}
          class="rounded-xl border border-line bg-surface p-5 transition-colors duration-150 hover:border-accent/40 hover:bg-accent-wash/40"
        >
          <p class="font-mono text-sm text-ink">{repo.name}</p>
          <p class="mt-2 text-sm leading-relaxed text-muted">{repo.description}</p>
        </a>
      ))}
    </div>
    <p class="mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
      MIT licensed · source on GitHub
    </p>
  </div>
</section>
```

Create `src/components/marketing/ClosingCta.astro`:

```astro
<section class="mx-auto max-w-[1200px] px-6 py-20 md:py-28">
  <div class="rounded-2xl border border-line bg-ink px-6 py-14 text-paper md:px-12">
    <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-terminal-text">
      Ready when you are
    </p>
    <h2 class="mt-3 max-w-2xl text-4xl font-medium tracking-[-0.04em] md:text-5xl">
      Your servers. Your rules.
    </h2>
    <p class="mt-4 max-w-xl text-base leading-relaxed text-paper/70">
      Download Shetu for your platform, or read the docs and self-host the sync
      server when you need it.
    </p>
    <div class="mt-8 flex flex-wrap gap-3">
      <a href="/download" class="rounded-lg bg-paper px-5 py-3 text-sm font-medium text-ink">
        Download Shetu
      </a>
      <a href="/docs" class="rounded-lg border border-white/20 px-5 py-3 text-sm font-medium text-paper">
        Read the docs
      </a>
    </div>
  </div>
</section>
```

**Step 3: Assemble the home page**

Replace `src/pages/index.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import ClosingCta from '../components/marketing/ClosingCta.astro';
import FactRibbon from '../components/marketing/FactRibbon.astro';
import Hero from '../components/marketing/Hero.astro';
import InstallCommand from '../components/download/InstallCommand.astro';
import OpenSource from '../components/marketing/OpenSource.astro';
import SecurityFlow from '../components/marketing/SecurityFlow.astro';
import SelfHostPanel from '../components/marketing/SelfHostPanel.astro';
import ValueCards from '../components/marketing/ValueCards.astro';
import WorkspaceMock from '../components/marketing/WorkspaceMock.astro';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Shetu',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Windows, macOS, Linux',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  license: 'https://opensource.org/licenses/MIT',
  codeRepository: 'https://github.com/nhridoy/shetu',
  downloadUrl: 'https://github.com/nhridoy/shetu-client/releases/latest',
  description:
    'The open-source, self-hostable SSH client. Direct SSH, encrypted vaults, SFTP, and port forwarding in one desktop workspace.',
};
---

<BaseLayout
  title="Shetu — Your servers. Your rules."
  description="The open-source, self-hostable SSH client. Direct SSH, encrypted vaults, SFTP, and port forwarding in one desktop workspace."
  jsonLd={jsonLd}
>
  <Hero />
  <FactRibbon />
  <ValueCards />

  <section class="mx-auto max-w-[1200px] px-6 py-20 md:py-28">
    <div class="grid gap-10 md:grid-cols-[1fr_1.2fr] md:items-center">
      <div>
        <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
          One workspace
        </p>
        <h2 class="mt-3 text-4xl font-medium tracking-[-0.04em]">
          Tabs, splits, hosts, and files in one window.
        </h2>
        <p class="mt-4 text-lg leading-relaxed text-muted">
          Keep production, staging, and edge hosts in the same workspace. Open
          an SFTP panel beside the terminal, split the view, and move between
          sessions without losing context.
        </p>
        <ul class="mt-6 space-y-2 text-sm text-muted">
          <li>Terminal tabs and split panes.</li>
          <li>Host list with search and folders.</li>
          <li>SFTP browser and remote file editor.</li>
          <li>Local and remote port forwards.</li>
        </ul>
      </div>
      <WorkspaceMock />
    </div>
  </section>

  <SecurityFlow />
  <SelfHostPanel />

  <section class="border-y border-line bg-surface">
    <div class="mx-auto max-w-[1200px] px-6 py-20 md:py-28">
      <div class="max-w-2xl">
        <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
          Install
        </p>
        <h2 class="mt-3 text-4xl font-medium tracking-[-0.04em]">
          One command. No installer maze.
        </h2>
        <p class="mt-4 text-lg leading-relaxed text-muted">
          The script picks the right build for your OS and architecture. Both
          commands are listed, so you can copy the one you need.
        </p>
      </div>
      <div class="mt-8 max-w-3xl">
        <InstallCommand />
      </div>
    </div>
  </section>

  <OpenSource />
  <ClosingCta />
</BaseLayout>
```

**Step 4: Delete the retired landing components**

```sh
rm src/components/landing/PlanSelector.tsx src/components/landing/WorkspaceDemo.tsx
rmdir src/components/landing
```

**Step 5: Verify the static home output**

```sh
pnpm build
grep -q "Your servers." dist/index.html
grep -q "Direct SSH" dist/index.html
grep -q "install.sh | bash" dist/index.html
grep -q "Docker Compose" dist/index.html
grep -q "application/ld+json" dist/index.html
grep -q "Illustrative workspace, not a screenshot" dist/index.html
```

Expected: all greps exit 0. Then run `pnpm test`, `pnpm lint:fix`, and `pnpm check`.

**Step 6: Manual responsive check**

Start the dev server in the background:

```sh
pnpm exec astro dev --background
```

Open `/` at 360px, 768px, 1024px, and 1440px. Confirm no horizontal scroll, the hero stacks correctly, the workspace mock remains readable, and the header menu opens at mobile widths. Stop the server with `pnpm exec astro dev stop`.

**Step 7: Commit**

```sh
git add src/pages/index.astro src/components/ui src/components/marketing src/components/landing
git commit -m "feat: build the field manual home page"
```

---

## Task 6: Download Page

**Files:**

- Create: `src/pages/download.astro`

**Interfaces:**

- Consumes `DownloadPanel` (`client:load`), `InstallCommand`, `Callout`.

**Step 1: Create the page**

Create `src/pages/download.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Callout from '../components/ui/Callout.astro';
import DownloadPanel from '../components/download/DownloadPanel';
import InstallCommand from '../components/download/InstallCommand.astro';
---

<BaseLayout
  title="Download Shetu"
  description="Download Shetu for Windows, macOS, or Linux. Direct SSH, encrypted vault, SFTP, and optional self-hosted sync."
>
  <section class="mx-auto max-w-[1200px] px-6 pt-14 pb-16 md:pt-20">
    <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
      Download
    </p>
    <h1 class="mt-4 text-5xl font-medium tracking-[-0.05em] md:text-6xl">
      Get Shetu for your machine.
    </h1>
    <p class="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
      Pick the build that matches your OS and architecture. Detection is a
      convenience; every build is listed below.
    </p>
    <div class="mt-10">
      <DownloadPanel client:load variant="full" />
    </div>
  </section>

  <section class="border-y border-line bg-surface">
    <div class="mx-auto max-w-[1200px] px-6 py-16">
      <h2 class="text-3xl font-medium tracking-[-0.03em]">
        Install in one command
      </h2>
      <p class="mt-3 max-w-2xl text-muted">
        The installer picks the right file for your computer and skips the
        first-launch warning.
      </p>
      <div class="mt-8 max-w-3xl">
        <InstallCommand />
      </div>
    </div>
  </section>

  <section class="mx-auto grid max-w-[1200px] gap-10 px-6 py-16 md:grid-cols-2">
    <div>
      <h2 class="text-3xl font-medium tracking-[-0.03em]">First launch</h2>
      <div class="mt-5 space-y-4">
        <Callout tone="warning" title="macOS">
          Shetu is not signed by Apple yet. Drag it to Applications, open it
          once, then go to <strong>System Settings → Privacy & Security</strong>
          and click <strong>Open Anyway</strong>.
        </Callout>
        <Callout tone="warning" title="Windows">
          Shetu is not signed by Microsoft yet. On the SmartScreen prompt, click
          <strong>More info → Run anyway</strong>. If your browser warns that the
          file is uncommon, choose <strong>Keep</strong>.
        </Callout>
      </div>
    </div>
    <div>
      <h2 class="text-3xl font-medium tracking-[-0.03em]">Requirements</h2>
      <ul class="mt-5 space-y-3 text-sm leading-relaxed text-muted">
        <li>
          <strong class="text-ink">macOS:</strong> Apple Silicon or Intel.
          Download the matching <code class="font-mono text-ink">.dmg</code>.
        </li>
        <li>
          <strong class="text-ink">Windows:</strong> x64 or ARM64. Download the
          matching NSIS <code class="font-mono text-ink">.exe</code>.
        </li>
        <li>
          <strong class="text-ink">Linux:</strong> x64 or ARM64. Use the
          AppImage, or the <code class="font-mono text-ink">.deb</code> on
          Debian and Ubuntu. The AppImage needs
          <code class="font-mono text-ink">libfuse2</code>.
        </li>
        <li>
          <strong class="text-ink">Network:</strong> direct SSH access to your
          hosts. No Shetu account is required for local use.
        </li>
      </ul>
      <p class="mt-5 text-sm text-muted">
        Minimum OS versions are not listed because the project does not publish
        a support matrix. If a build does not run on your system, open an issue
        with your OS version.
      </p>
      <p class="mt-5 text-sm text-muted">
        Need the full release history? See
        <a href="/releases" class="text-accent underline decoration-line underline-offset-4 hover:decoration-accent">Releases</a>.
      </p>
    </div>
  </section>
</BaseLayout>
```

**Step 2: Verify**

```sh
pnpm build
grep -q "Get Shetu for your machine" dist/download/index.html
grep -q "download-matrix" dist/download/index.html
grep -q "System Settings" dist/download/index.html
grep -q "SmartScreen" dist/download/index.html
grep -q "libfuse2" dist/download/index.html
grep -q "install.ps1 | iex" dist/download/index.html
```

Expected: all greps exit 0.

**Step 3: Manual no-JS check**

In the browser dev tools, disable JavaScript and reload `/download`. Confirm:

- The version and all eight build rows are visible.
- Both install commands are visible and switchable via the radio labels.
- The page links to `/releases` and GitHub.

**Step 4: Commit**

```sh
git add src/pages/download.astro
git commit -m "feat: add the download page"
```

---

## Task 7: Releases Page

**Files:**

- Create: `src/components/download/ReleaseList.tsx`
- Create: `src/components/download/ReleaseList.test.tsx`
- Create: `src/pages/releases.astro`

**Interfaces:**

- `ReleaseList` props: `{ load?: () => Promise<ReleasesResult> }`.
- Consumes `getReleases`, `formatReleaseDate`, `Release`.

**Step 1: Write the failing release list test**

Create `src/components/download/ReleaseList.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ReleaseList from './ReleaseList';
import type { Release } from '../../lib/releases';

const release: Release = {
  tag_name: 'v1.0.0',
  name: 'Shetu 1.0.0',
  published_at: '2026-02-01T00:00:00Z',
  html_url: 'https://github.com/nhridoy/shetu-client/releases/tag/v1.0.0',
  prerelease: true,
  body: 'A big release.',
  assets: [],
};

describe('ReleaseList', () => {
  it('renders live releases with tag, date, and prerelease label', async () => {
    render(
      <ReleaseList
        load={async () => ({ releases: [release], source: 'live' })}
      />,
    );
    expect(await screen.findByText('v1.0.0')).toBeInTheDocument();
    expect(screen.getByText('Pre-release')).toBeInTheDocument();
    expect(screen.getByText('Feb 1, 2026')).toBeInTheDocument();
    expect(screen.getByText('A big release.')).toBeInTheDocument();
  });

  it('shows a GitHub fallback when no releases are available', async () => {
    render(
      <ReleaseList load={async () => ({ releases: [], source: 'fallback' })} />,
    );
    expect(
      await screen.findByText('Release history is unavailable right now.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'View releases on GitHub' }),
    ).toHaveAttribute(
      'href',
      'https://github.com/nhridoy/shetu-client/releases',
    );
  });
});
```

**Step 2: Run the test to verify it fails**

```sh
pnpm test -- src/components/download/ReleaseList.test.tsx
```

Expected: fail because the component does not exist.

**Step 3: Implement the release list**

Create `src/components/download/ReleaseList.tsx`:

```tsx
import { useEffect, useState } from 'react';
import fallbackData from '../../data/releases.json';
import { sessionCache } from '../../lib/browser';
import { getReleases, type ReleasesResult } from '../../lib/github';
import { formatReleaseDate, type Release } from '../../lib/releases';

const fallbackReleases = fallbackData.releases as Release[];

export interface ReleaseListProps {
  load?: () => Promise<ReleasesResult>;
}

export default function ReleaseList({ load }: ReleaseListProps) {
  const [releases, setReleases] = useState<Release[]>(fallbackReleases);
  const [source, setSource] = useState<'live' | 'fallback'>('fallback');
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const result = load
          ? await load()
          : await getReleases({
              fallback: fallbackReleases,
              cache: sessionCache(),
            });
        if (!active) return;
        setReleases(result.releases);
        setSource(result.source);
      } catch {
        // Keep the committed snapshot.
      } finally {
        if (active) setChecked(true);
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [load]);

  if (releases.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-surface p-6">
        <p className="text-sm text-muted">
          {checked
            ? 'Release history is unavailable right now.'
            : 'Release history is loaded from GitHub.'}
        </p>
        <a
          href="https://github.com/nhridoy/shetu-client/releases"
          className="mt-3 inline-flex text-sm font-medium text-accent underline decoration-line underline-offset-4 hover:decoration-accent"
        >
          View releases on GitHub
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {checked && source === 'fallback' && (
        <p data-testid="release-fallback-notice" className="text-sm text-muted">
          Live release data is unavailable. Showing the last known release.
        </p>
      )}
      {releases.map((release) => (
        <article
          key={release.tag_name}
          className="rounded-xl border border-line bg-surface p-6"
        >
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-mono text-lg text-ink">{release.tag_name}</h2>
            {release.prerelease && (
              <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-amber-800">
                Pre-release
              </span>
            )}
            <time
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted"
              dateTime={release.published_at}
            >
              {formatReleaseDate(release.published_at)}
            </time>
          </div>
          {release.name && release.name !== release.tag_name && (
            <p className="mt-2 text-sm text-muted">{release.name}</p>
          )}
          {release.body && (
            <p className="mt-3 line-clamp-3 whitespace-pre-line text-sm leading-relaxed text-muted">
              {release.body}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <a
              href={release.html_url}
              className="font-medium text-accent underline decoration-line underline-offset-4 hover:decoration-accent"
            >
              Release notes
            </a>
            {release.assets.length > 0 && (
              <span className="text-muted">{release.assets.length} assets</span>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
```

**Step 4: Run the test to verify it passes**

```sh
pnpm test -- src/components/download/ReleaseList.test.tsx
```

Expected: 2 passing tests.

**Step 5: Create the releases page**

Create `src/pages/releases.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import ReleaseList from '../components/download/ReleaseList';
---

<BaseLayout
  title="Releases — Shetu"
  description="Shetu release history, tags, dates, and download assets."
>
  <section class="mx-auto max-w-[900px] px-6 py-16">
    <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
      Releases
    </p>
    <h1 class="mt-4 text-5xl font-medium tracking-[-0.05em]">
      Every release, in the open.
    </h1>
    <p class="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
      Shetu ships from GitHub Releases. The list below is fetched live and
      falls back to the last known release when the API is unavailable.
    </p>
    <div class="mt-8 flex flex-wrap gap-4 text-sm">
      <a
        href="https://github.com/nhridoy/shetu-client/releases"
        class="font-medium text-accent underline decoration-line underline-offset-4 hover:decoration-accent"
      >
        All releases on GitHub
      </a>
      <a
        href="/download"
        class="font-medium text-muted underline decoration-line underline-offset-4 hover:text-accent"
      >
        Download the latest
      </a>
    </div>
    <div class="mt-10">
      <ReleaseList client:visible />
    </div>
  </section>
</BaseLayout>
```

**Step 6: Verify**

```sh
pnpm build
grep -q "Every release, in the open" dist/releases/index.html
grep -q "View releases on GitHub" dist/releases/index.html
grep -q "All releases on GitHub" dist/releases/index.html
```

Expected: all greps exit 0.

**Step 7: Commit**

```sh
git add src/components/download/ReleaseList.tsx src/components/download/ReleaseList.test.tsx src/pages/releases.astro
git commit -m "feat: add the releases page"
```

---

## Task 8: Documentation

**Files:**

- Create: `src/content.config.ts`
- Create: `src/content/docs/desktop.mdx`
- Create: `src/content/docs/server.mdx`
- Create: `src/content/docs/security.mdx`
- Create: `src/content/docs/troubleshooting.mdx`
- Create: `src/components/docs/DocsNav.astro`
- Create: `src/layouts/DocsLayout.astro`
- Create: `src/pages/docs/index.astro`
- Create: `src/pages/docs/[...slug].astro`

**Interfaces:**

- Collection `docs` schema: `{ title: string; description: string; section: 'desktop' | 'server'; order: number; updated?: string }`.
- `DocsLayout` props: `{ title, description, headings?, prev?, next? }`.
- `DocsNav` reads the collection itself; no props.

**Step 1: Create the content collection config**

Create `src/content.config.ts`:

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const docs = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/docs' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    section: z.enum(['desktop', 'server']),
    order: z.number(),
    updated: z.string().optional(),
  }),
});

export const collections = { docs };
```

**Step 2: Write the desktop guide**

Create `src/content/docs/desktop.mdx`:

````mdx
---
title: Desktop app
description: Install Shetu on macOS, Windows, or Linux, connect your first host, and manage your encrypted vault.
section: desktop
order: 1
updated: 2026-11-09
---

Shetu is a desktop SSH client for macOS, Windows, and Linux. It connects directly from your machine to your servers. The optional sync server never proxies SSH traffic.

## Install

### One command

macOS and Linux:

```bash
curl -fsSL https://raw.githubusercontent.com/nhridoy/shetu-client/main/install.sh | bash
```

Windows PowerShell:

```powershell
irm https://raw.githubusercontent.com/nhridoy/shetu-client/main/install.ps1 | iex
```

The script detects your OS and architecture and installs the matching build. On Debian or Ubuntu it installs the `.deb`. Elsewhere it places the AppImage at `~/.local/bin/shetu`, which needs `libfuse2`.

### From a downloaded file

Download the build for your platform from [the download page](/download). The current release includes:

| Platform | Architecture | Format |
|---|---|---|
| macOS | Apple Silicon | `.dmg` |
| macOS | Intel | `.dmg` |
| Windows | x64 | NSIS `.exe` |
| Windows | ARM64 | NSIS `.exe` |
| Linux | x64 | `.AppImage`, `.deb` |
| Linux | ARM64 | `.AppImage`, `.deb` |

## First launch

Shetu is not signed by Apple or Microsoft yet. You will see a warning once.

**macOS:** drag Shetu to Applications, open it once, then go to **System Settings → Privacy & Security** and click **Open Anyway**.

**Windows:** on the SmartScreen prompt, click **More info → Run anyway**. If your browser warns that the file is uncommon, choose **Keep**.

In-app updates do not repeat the warning.

## Connect your first host

1. Open Shetu and choose **New host**.
2. Enter the hostname, port (usually 22), and username.
3. Choose the authentication method your server allows: password or private key.
4. Save the host and connect.

Shetu opens an SSH session in a tab. From the same workspace you can open an SFTP panel, split the terminal, and add port forwards.

## The vault

The vault stores credentials and keys encrypted on your device. Shetu derives the vault key from your master password with Argon2id and encrypts vault contents with XChaCha20-Poly1305.

Create the vault on first use and store the recovery kit somewhere safe. The recovery kit is the only way to recover the vault if you forget the master password. Shetu cannot recover it for you.

## Updates

Shetu checks for updates from GitHub Releases. You can also download the latest build from [the releases page](/releases). If an update fails, reinstall from the latest release.

## Uninstall

**macOS:** quit Shetu, move it from Applications to the Trash, then remove `~/Library/Application Support/com.nhridoy.shetu` if you want to delete local data.

**Windows:** uninstall Shetu from **Settings → Apps**, then remove `%APPDATA%\com.nhridoy.shetu` if you want to delete local data.

**Linux:** remove the AppImage, or remove the `.deb` with your package manager. Then remove `~/.local/share/com.nhridoy.shetu` if you want to delete local data.

## Next

- [Self-host the sync server](/docs/server)
- [Read the security reference](/docs/security)
- [Troubleshoot a problem](/docs/troubleshooting)
````

**Step 3: Write the server guide**

Create `src/content/docs/server.mdx`:

````mdx
---
title: Self-host the sync server
description: Run the Shetu sync and auth server with Docker Compose, PostgreSQL, TLS, and optional OAuth.
section: server
order: 2
updated: 2026-11-09
---

Shetu works without a server. Self-hosting adds encrypted sync and account features across devices. The server stores ciphertext and wrapped keys. It never sees your SSH traffic or plaintext credentials.

## Requirements

- Docker Engine with Compose v2
- A PostgreSQL database
- A domain name and TLS certificate for production
- A long random `JWT_SECRET`

SQLite works for local development. Use PostgreSQL in production.

## Docker Compose

Create `compose.yaml`:

```yaml
services:
  postgres:
    image: postgres:17-alpine
    environment:
      POSTGRES_USER: shetu
      POSTGRES_PASSWORD: change-me
      POSTGRES_DB: shetu
    volumes:
      - shetu-db:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U shetu"]
      interval: 5s
      timeout: 5s
      retries: 10

  shetu-server:
    image: ghcr.io/nhridoy/shetu-server:latest
    depends_on:
      postgres:
        condition: service_healthy
    ports:
      - "8080:8080"
    environment:
      SHETU_HOST: 0.0.0.0
      SHETU_PORT: "8080"
      DATABASE_URL: postgres://shetu:change-me@postgres:5432/shetu?sslmode=disable
      JWT_SECRET: replace-with-a-long-random-string
      BASE_URL: https://sync.example.com
      CORS_ALLOWED_ORIGINS: http://tauri.localhost,tauri://localhost
    restart: unless-stopped

volumes:
  shetu-db:
```

Generate a secret with:

```bash
openssl rand -base64 48
```

Start the stack:

```bash
docker compose up -d
```

Check the logs:

```bash
docker compose logs -f shetu-server
```

## Environment

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string in production |
| `JWT_SECRET` | Yes | Signs access tokens |
| `BASE_URL` | Yes in production | Public URL, used for OAuth callbacks |
| `SHETU_HOST` | No | Bind address, default `0.0.0.0` |
| `SHETU_PORT` | No | HTTP port, default `8080` |
| `JWT_EXPIRY` | No | Access token lifetime, default `15m` |
| `REFRESH_TOKEN_EXPIRY` | No | Refresh token lifetime, default `720h` |
| `CORS_ALLOWED_ORIGINS` | No | Browser origins allowed to call the API |
| `TRUSTED_PROXIES` | No | CIDRs trusted for `X-Forwarded-For` |
| `REDIS_URL` | No | Shared token storage for multiple instances |

The full list is in [`.env.example`](https://github.com/nhridoy/shetu-server/blob/main/.env.example).

## TLS and reverse proxy

Terminate TLS at a reverse proxy and forward to `127.0.0.1:8080`. Set `BASE_URL` to the public HTTPS URL and set `TRUSTED_PROXIES` to the proxy's CIDR.

If the proxy runs on the host, bind the container to localhost:

```yaml
ports:
  - "127.0.0.1:8080:8080"
```

Example Caddyfile:

```
sync.example.com {
  reverse_proxy 127.0.0.1:8080
}
```

## Accounts and OAuth

Email and password registration works out of the box. Set `JWT_SECRET` before exposing the server.

Google and GitHub OAuth are optional. Set the matching `OAUTH_GOOGLE_CLIENT_ID` / `OAUTH_GOOGLE_CLIENT_SECRET` or `OAUTH_GITHUB_CLIENT_ID` / `OAUTH_GITHUB_CLIENT_SECRET`. The callback URL is based on `BASE_URL`.

The desktop app uses loopback callbacks. Keep the default `SHETU_OAUTH_REDIRECT_URIS` unless you also change the client's listener ports.

## Email verification

Set `REQUIRE_EMAIL_VERIFICATION=true` to require a 6-digit code for new email/password signups. Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, and `SMTP_FROM`.

The server refuses to start when verification is on and neither SMTP nor `LOG_OTP_FALLBACK` is configured. `LOG_OTP_FALLBACK=true` logs codes to the console and is for development only.

## Upgrades

Pull the new image and recreate the container:

```bash
docker compose pull shetu-server
docker compose up -d shetu-server
```

GORM runs schema migrations on startup. Back up PostgreSQL before upgrading production.

## Point the client at your server

Open Shetu's settings and find the sync section. Enter your server URL, for example `https://sync.example.com`. Sign in or create an account. Sync is optional; local-only use keeps working without it.

## Next

- [Security reference](/docs/security)
- [Troubleshooting](/docs/troubleshooting)
````

**Step 4: Write the security reference**

Create `src/content/docs/security.mdx`:

```mdx
---
title: Security reference
description: How Shetu derives keys, encrypts the vault, wraps team keys, and what the sync server can see.
section: server
order: 3
updated: 2026-11-09
---

Shetu is designed so the sync server never needs plaintext credentials. This page is the technical reference. For the shorter trust page, see [Security](/security).

## Key hierarchy

1. **Master password.** You choose it. It never leaves your device.
2. **Vault key.** Shetu derives it from the master password with Argon2id.
3. **Encrypted vault.** Credentials and private keys are encrypted with XChaCha20-Poly1305 before they are stored or synced.
4. **Identity key.** Each account has an X25519 identity key used to wrap team keys.
5. **Team keys.** A team key is wrapped for each member's public key. The server stores the wrapped keys, not the team key.

## What the server stores

The sync server stores:

- Account identifiers and authentication state.
- Encrypted vault records.
- Wrapped team keys.
- Sync metadata needed to order and deliver records.

The server does not receive:

- Your master password.
- Plaintext credentials or private keys.
- SSH traffic. Connections go directly from the client to the remote host.
- Terminal output or file contents.

## Threat model

**Compromised sync server.** An attacker can read ciphertext and wrapped keys, and can delete or withhold records. They cannot decrypt the vault without the master password.

**Stolen device.** A locked device protects the local vault. If the device is unlocked and the vault is open, the attacker has the same access you do.

**Malicious sync response.** Encrypted records are authenticated with XChaCha20-Poly1305. Tampered ciphertext fails to decrypt.

**Network attacker.** Use TLS for the sync server. SSH traffic is protected by SSH itself.

## Recovery kit

Shetu creates a recovery kit when you set up the vault. Store it offline. The recovery kit is the only way to recover the vault if you forget the master password. The server cannot reset it, and the maintainers cannot recover it for you.

## Reporting a vulnerability

Open a private advisory:

[Report a vulnerability](https://github.com/nhridoy/shetu/security/advisories/new)

Do not open a public issue for a vulnerability. Include the affected version, your OS, reproduction steps, and impact.

## Source

- [shetu-client](https://github.com/nhridoy/shetu-client)
- [shetu-server](https://github.com/nhridoy/shetu-server)
```

**Step 5: Write the troubleshooting guide**

Create `src/content/docs/troubleshooting.mdx`:

````mdx
---
title: Troubleshooting
description: Fix first-launch warnings, connection failures, sync problems, and find Shetu's logs.
section: server
order: 4
updated: 2026-11-09
---

## The app will not open on macOS

Shetu is not signed by Apple yet.

1. Drag Shetu to Applications.
2. Open it once and dismiss the warning.
3. Open **System Settings → Privacy & Security**.
4. Click **Open Anyway** next to Shetu.
5. Open Shetu again.

If the app is still blocked, remove the quarantine attribute from the app bundle:

```bash
xattr -dr com.apple.quarantine /Applications/Shetu.app
```

## Windows says "Windows protected your PC"

Click **More info → Run anyway**. If your browser says the file is not commonly downloaded, choose **Keep**. This happens once per downloaded build.

## The AppImage does not start on Linux

The AppImage needs FUSE 2. Install `libfuse2` with your package manager:

```bash
sudo apt install libfuse2
```

On distributions that do not ship FUSE 2, use the `.deb` instead.

## Connection refused or timed out

- Confirm the hostname and port. SSH usually uses port 22.
- Confirm the host is reachable from your network.
- Check that the SSH service is running on the remote host.
- If you use a jump host or VPN, connect to it first.

## Authentication failed

- Confirm the username.
- For key authentication, confirm the server accepts your public key.
- Check private key permissions: `chmod 600 ~/.ssh/id_ed25519`.
- If the key has a passphrase, enter it when Shetu asks.

## Sync does not connect

- Confirm the server URL starts with `https://` in production.
- Confirm `BASE_URL` matches the public URL.
- Confirm the server is running: `docker compose logs -f shetu-server`.
- If you use a reverse proxy, confirm it forwards to the server and that `TRUSTED_PROXIES` is set.
- If the browser console reports a CORS error, add the app origin to `CORS_ALLOWED_ORIGINS`.

## Sync says the account exists but login fails

- Confirm `JWT_SECRET` is set and has not changed since the account was created. Changing it invalidates existing tokens.
- If email verification is on, confirm the account is verified.
- Check the server logs for the specific error.

## Find the logs

If Shetu opens, use **Settings → Advanced → Export logs**.

If Shetu crashes before it opens, attach the newest `shetu*.log` from:

- macOS: `~/Library/Logs/com.nhridoy.shetu/`
- Windows: `%LOCALAPPDATA%\com.nhridoy.shetu\logs\`
- Linux: `~/.local/share/com.nhridoy.shetu/logs/` or `$XDG_DATA_HOME/com.nhridoy.shetu/logs/`

Shetu does not log passwords, keys, or terminal output, and removes IP addresses and hostnames from error messages.

## Report a problem

Open an issue with the log file and your OS version:

[Open a bug report](https://github.com/nhridoy/shetu-client/issues/new)
````

**Step 6: Create the docs navigation**

Create `src/components/docs/DocsNav.astro`:

```astro
---
import { getCollection } from 'astro:content';

const docs = (await getCollection('docs')).sort(
  (a, b) => a.data.order - b.data.order,
);
const groups = [
  {
    id: 'desktop',
    label: 'Desktop',
    items: docs.filter((entry) => entry.data.section === 'desktop'),
  },
  {
    id: 'server',
    label: 'Server',
    items: docs.filter((entry) => entry.data.section === 'server'),
  },
];
const currentPath = Astro.url.pathname.replace(/\/$/, '') || '/';
---

<nav aria-label="Docs">
  <a
    href="/docs"
    aria-current={currentPath === '/docs' ? 'page' : undefined}
    class:list={[
      'block rounded-lg px-3 py-2 text-sm',
      currentPath === '/docs'
        ? 'bg-accent-wash text-accent'
        : 'text-muted hover:bg-accent-wash hover:text-accent',
    ]}
  >
    Docs home
  </a>

  {groups.map((group) => (
    <div class="mt-6">
      <p class="px-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
        {group.label}
      </p>
      <ul class="mt-2 space-y-1">
        {group.items.map((entry) => {
          const href = `/docs/${entry.id}`;
          const active = currentPath === href;
          return (
            <li>
              <a
                href={href}
                aria-current={active ? 'page' : undefined}
                class:list={[
                  'block rounded-lg px-3 py-2 text-sm',
                  active
                    ? 'bg-accent-wash text-accent'
                    : 'text-muted hover:bg-accent-wash hover:text-accent',
                ]}
              >
                {entry.data.title}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  ))}

  <div class="mt-6 border-t border-line pt-4">
    <a href="/security" class="block rounded-lg px-3 py-2 text-sm text-muted hover:bg-accent-wash hover:text-accent">
      Security overview
    </a>
  </div>
</nav>
```

**Step 7: Create the docs layout**

Create `src/layouts/DocsLayout.astro`:

```astro
---
import type { CollectionEntry } from 'astro:content';
import BaseLayout from './BaseLayout.astro';
import DocsNav from '../components/docs/DocsNav.astro';

interface Heading {
  depth: number;
  slug: string;
  text: string;
}

interface Props {
  title: string;
  description: string;
  headings?: Heading[];
  prev?: CollectionEntry<'docs'> | null;
  next?: CollectionEntry<'docs'> | null;
}

const { title, description, headings = [], prev = null, next = null } =
  Astro.props;
const toc = headings.filter(
  (heading) => heading.depth === 2 || heading.depth === 3,
);
---

<BaseLayout title={`${title} — Shetu Docs`} description={description}>
  <div class="mx-auto grid max-w-[1200px] gap-10 px-6 py-10 lg:grid-cols-[210px_minmax(0,1fr)_190px] lg:py-14">
    <aside class="lg:sticky lg:top-24 lg:self-start">
      <details class="rounded-xl border border-line bg-surface p-4 lg:hidden">
        <summary class="cursor-pointer font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
          Docs menu
        </summary>
        <div class="mt-4">
          <DocsNav />
        </div>
      </details>
      <div class="hidden lg:block">
        <DocsNav />
      </div>
    </aside>

    <article class="min-w-0">
      <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
        Documentation
      </p>
      <h1 class="mt-3 text-4xl font-medium tracking-[-0.04em]">{title}</h1>
      <p class="mt-3 max-w-2xl text-lg leading-relaxed text-muted">
        {description}
      </p>
      <div class="docs-prose mt-10">
        <slot />
      </div>

      <nav
        class="mt-12 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:justify-between"
        aria-label="Docs pagination"
      >
        {prev ? (
          <a
            href={`/docs/${prev.id}`}
            class="text-sm font-medium text-accent underline decoration-line underline-offset-4 hover:decoration-accent"
          >
            ← {prev.data.title}
          </a>
        ) : (
          <span></span>
        )}
        {next ? (
          <a
            href={`/docs/${next.id}`}
            class="text-sm font-medium text-accent underline decoration-line underline-offset-4 hover:decoration-accent sm:text-right"
          >
            {next.data.title} →
          </a>
        ) : (
          <span></span>
        )}
      </nav>
    </article>

    <aside class="hidden lg:block">
      {toc.length > 0 && (
        <nav class="sticky top-24" aria-label="On this page">
          <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            On this page
          </p>
          <ul class="mt-3 space-y-2 border-l border-line">
            {toc.map((heading) => (
              <li class:list={[heading.depth === 3 ? 'pl-6' : 'pl-3']}>
                <a
                  href={`#${heading.slug}`}
                  class="block text-sm text-muted hover:text-accent"
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </aside>
  </div>
</BaseLayout>
```

**Step 8: Create the docs hub**

Create `src/pages/docs/index.astro`:

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';

const docs = (await getCollection('docs')).sort(
  (a, b) => a.data.order - b.data.order,
);
const desktop = docs.filter((entry) => entry.data.section === 'desktop');
const server = docs.filter((entry) => entry.data.section === 'server');
---

<BaseLayout
  title="Docs — Shetu"
  description="Install Shetu, self-host the sync server, and read the security reference."
>
  <section class="mx-auto max-w-[1200px] px-6 py-16 md:py-20">
    <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
      Documentation
    </p>
    <h1 class="mt-4 text-5xl font-medium tracking-[-0.05em]">
      Run Shetu your way.
    </h1>
    <p class="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
      Install the desktop app, self-host sync, and read the security model.
      Every guide is written for users and links to the source when you need
      the details.
    </p>

    <div class="mt-10 grid gap-4 md:grid-cols-2">
      <a
        href="/docs/desktop"
        class="rounded-xl border border-line bg-surface p-6 transition-colors duration-150 hover:border-accent/40 hover:bg-accent-wash/40"
      >
        <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
          Track 01
        </p>
        <h2 class="mt-3 text-2xl font-medium tracking-[-0.03em]">
          Desktop app
        </h2>
        <p class="mt-2 text-sm leading-relaxed text-muted">
          Install, connect your first host, manage the vault, update, and
          uninstall.
        </p>
      </a>
      <a
        href="/docs/server"
        class="rounded-xl border border-line bg-surface p-6 transition-colors duration-150 hover:border-accent/40 hover:bg-accent-wash/40"
      >
        <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
          Track 02
        </p>
        <h2 class="mt-3 text-2xl font-medium tracking-[-0.03em]">
          Self-hosted server
        </h2>
        <p class="mt-2 text-sm leading-relaxed text-muted">
          Docker Compose, PostgreSQL, environment variables, TLS, OAuth, email
          verification, and upgrades.
        </p>
      </a>
    </div>

    <div class="mt-4 grid gap-4 md:grid-cols-2">
      <a
        href="/docs/security"
        class="rounded-xl border border-line bg-surface p-6 transition-colors duration-150 hover:border-accent/40 hover:bg-accent-wash/40"
      >
        <h2 class="text-lg font-medium">Security reference</h2>
        <p class="mt-2 text-sm text-muted">
          Key hierarchy, server visibility, threat model, and disclosure.
        </p>
      </a>
      <a
        href="/docs/troubleshooting"
        class="rounded-xl border border-line bg-surface p-6 transition-colors duration-150 hover:border-accent/40 hover:bg-accent-wash/40"
      >
        <h2 class="text-lg font-medium">Troubleshooting</h2>
        <p class="mt-2 text-sm text-muted">
          First-launch warnings, connection failures, sync problems, and logs.
        </p>
      </a>
    </div>

    <div class="mt-12">
      <h2 class="text-2xl font-medium tracking-[-0.03em]">All guides</h2>
      <ul class="mt-4 divide-y divide-line rounded-xl border border-line bg-surface">
        {docs.map((entry) => (
          <li>
            <a
              href={`/docs/${entry.id}`}
              class="flex flex-col gap-1 px-4 py-3 hover:bg-accent-wash/40 sm:flex-row sm:items-center sm:justify-between"
            >
              <span class="text-sm font-medium">{entry.data.title}</span>
              <span class="text-sm text-muted">{entry.data.description}</span>
            </a>
          </li>
        ))}
      </ul>
      <p class="mt-4 text-sm text-muted">
        {desktop.length} desktop {desktop.length === 1 ? 'guide' : 'guides'} ·{' '}
        {server.length} server {server.length === 1 ? 'guide' : 'guides'}
      </p>
    </div>
  </section>
</BaseLayout>
```

**Step 9: Create the dynamic docs route**

Create `src/pages/docs/[...slug].astro`:

```astro
---
import { getCollection, render, type CollectionEntry } from 'astro:content';
import DocsLayout from '../../layouts/DocsLayout.astro';

interface Props {
  entry: CollectionEntry<'docs'>;
  prev: CollectionEntry<'docs'> | null;
  next: CollectionEntry<'docs'> | null;
}

export async function getStaticPaths() {
  const docs = await getCollection('docs');

  return docs.flatMap((entry) => {
    const siblings = docs
      .filter((item) => item.data.section === entry.data.section)
      .sort((a, b) => a.data.order - b.data.order);
    const index = siblings.findIndex((item) => item.id === entry.id);

    return [
      {
        params: { slug: entry.id },
        props: {
          entry,
          prev: siblings[index - 1] ?? null,
          next: siblings[index + 1] ?? null,
        },
      },
    ];
  });
}

const { entry, prev, next } = Astro.props as Props;
const { Content, headings } = await render(entry);
---

<DocsLayout
  title={entry.data.title}
  description={entry.data.description}
  headings={headings}
  prev={prev}
  next={next}
>
  <Content />
</DocsLayout>
```

**Step 10: Verify**

```sh
pnpm build
test -f dist/docs/index.html
test -f dist/docs/desktop/index.html
test -f dist/docs/server/index.html
test -f dist/docs/security/index.html
test -f dist/docs/troubleshooting/index.html
grep -q "Argon2id" dist/docs/security/index.html
grep -q "JWT_SECRET" dist/docs/server/index.html
grep -q "Open Anyway" dist/docs/desktop/index.html
grep -q "Export logs" dist/docs/troubleshooting/index.html
```

Expected: all commands exit 0.

**Step 11: Manual docs check**

At 360px, open `/docs/desktop`. Confirm the "Docs menu" disclosure opens and navigates. At desktop width, confirm the sidebar, on-page TOC, and previous/next links work. Confirm code blocks are highlighted by Shiki.

**Step 12: Commit**

```sh
git add src/content.config.ts src/content/docs src/components/docs src/layouts/DocsLayout.astro src/pages/docs
git commit -m "feat: add MDX documentation"
```

---

## Task 9: Security Page

**Files:**

- Create: `src/pages/security.astro`

**Interfaces:**

- Consumes `BaseLayout` and `SecurityFlow`.

**Step 1: Create the page**

Create `src/pages/security.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import SecurityFlow from '../components/marketing/SecurityFlow.astro';
---

<BaseLayout
  title="Security — Shetu"
  description="Shetu connects directly to your servers and encrypts your vault on your device. The sync server stores ciphertext, never plaintext."
>
  <section class="mx-auto max-w-[1200px] px-6 pt-14 pb-16 md:pt-20">
    <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
      Security
    </p>
    <h1 class="mt-4 max-w-4xl text-5xl font-medium tracking-[-0.05em] md:text-6xl">
      Trust the math, not the server.
    </h1>
    <p class="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
      Shetu connects directly to your servers. Your credentials are encrypted on
      your device before they are stored or synced. The server stores ciphertext
      and wrapped keys, never plaintext.
    </p>
  </section>

  <SecurityFlow />

  <section class="mx-auto max-w-[1200px] px-6 py-20 md:py-28">
    <div class="grid gap-4 md:grid-cols-2">
      <div class="rounded-xl border border-line bg-surface p-6">
        <h2 class="text-2xl font-medium tracking-[-0.03em]">
          What the server stores
        </h2>
        <ul class="mt-4 space-y-2 text-sm leading-relaxed text-muted">
          <li>Account identifiers and authentication state.</li>
          <li>Encrypted vault records.</li>
          <li>Wrapped team keys.</li>
          <li>Sync metadata needed to order and deliver records.</li>
        </ul>
      </div>
      <div class="rounded-xl border border-line bg-surface p-6">
        <h2 class="text-2xl font-medium tracking-[-0.03em]">
          What it never sees
        </h2>
        <ul class="mt-4 space-y-2 text-sm leading-relaxed text-muted">
          <li>Your master password.</li>
          <li>Plaintext credentials or private keys.</li>
          <li>SSH traffic. Connections go directly to the host.</li>
          <li>Terminal output or file contents.</li>
        </ul>
      </div>
    </div>
  </section>

  <section class="border-y border-line bg-surface">
    <div class="mx-auto grid max-w-[1200px] gap-10 px-6 py-20 md:grid-cols-[1fr_1.2fr] md:py-28">
      <div>
        <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
          Key hierarchy
        </p>
        <h2 class="mt-3 text-4xl font-medium tracking-[-0.04em]">
          One password, layered keys.
        </h2>
        <p class="mt-4 text-lg leading-relaxed text-muted">
          The master password unlocks the vault key. The vault key encrypts your
          data. Team keys are wrapped for each member with X25519. The server
          only handles ciphertext and wrapped keys.
        </p>
      </div>
      <ol class="space-y-3">
        <li class="rounded-xl border border-line bg-paper p-4">
          <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">01 · Master password</p>
          <p class="mt-2 text-sm text-muted">Argon2id derives the vault key on your device. The password never leaves it.</p>
        </li>
        <li class="rounded-xl border border-line bg-paper p-4">
          <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">02 · Vault key</p>
          <p class="mt-2 text-sm text-muted">XChaCha20-Poly1305 encrypts credentials and private keys before storage or sync.</p>
        </li>
        <li class="rounded-xl border border-line bg-paper p-4">
          <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">03 · X25519 identity</p>
          <p class="mt-2 text-sm text-muted">Team keys are wrapped for each member's public key. The server stores the envelopes.</p>
        </li>
        <li class="rounded-xl border border-line bg-paper p-4">
          <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">04 · Sync server</p>
          <p class="mt-2 text-sm text-muted">Stores ciphertext and wrapped keys. It cannot decrypt them without the vault key.</p>
        </li>
      </ol>
    </div>
  </section>

  <section class="mx-auto max-w-[1200px] px-6 py-20 md:py-28">
    <div class="grid gap-10 md:grid-cols-2">
      <div>
        <h2 class="text-3xl font-medium tracking-[-0.03em]">Recovery kit</h2>
        <p class="mt-4 text-sm leading-relaxed text-muted">
          Shetu creates a recovery kit when you set up the vault. Store it
          offline. It is the only way to recover the vault if you forget the
          master password. The server cannot reset it, and the maintainers
          cannot recover it for you.
        </p>
      </div>
      <div>
        <h2 class="text-3xl font-medium tracking-[-0.03em]">Disclosure</h2>
        <p class="mt-4 text-sm leading-relaxed text-muted">
          Report vulnerabilities privately through GitHub Security Advisories.
          Do not open a public issue. Include the affected version, your OS,
          reproduction steps, and impact.
        </p>
        <a
          href="https://github.com/nhridoy/shetu/security/advisories/new"
          class="mt-4 inline-flex text-sm font-medium text-accent underline decoration-line underline-offset-4 hover:decoration-accent"
        >
          Report a vulnerability
        </a>
      </div>
    </div>
    <div class="mt-10 border-t border-line pt-6">
      <a
        href="/docs/security"
        class="text-sm font-medium text-accent underline decoration-line underline-offset-4 hover:decoration-accent"
      >
        Read the technical security reference
      </a>
    </div>
  </section>
</BaseLayout>
```

**Step 2: Verify**

```sh
pnpm build
grep -q "Trust the math, not the server" dist/security/index.html
grep -q "XChaCha20-Poly1305" dist/security/index.html
grep -q "X25519" dist/security/index.html
grep -q "security/advisories/new" dist/security/index.html
```

Expected: all greps exit 0.

**Step 3: Commit**

```sh
git add src/pages/security.astro
git commit -m "feat: add the security page"
```

---

## Task 10: Community Page

**Files:**

- Create: `src/pages/community.astro`

**Interfaces:**

- Consumes `BaseLayout`, `REPOS`.

**Step 1: Create the page**

Create `src/pages/community.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { REPOS } from '../lib/site';

const repos = [
  {
    name: 'shetu',
    href: REPOS.monorepo,
    description:
      'Project home, documentation, and cross-cutting issues. Start here if you are new.',
  },
  {
    name: 'shetu-client',
    href: REPOS.client,
    description:
      'The Tauri v2 desktop client. Rust for the native layer, React and TypeScript for the interface.',
  },
  {
    name: 'shetu-server',
    href: REPOS.server,
    description:
      'The Go sync and auth server. Gin, GORM, PostgreSQL, and optional Redis.',
  },
  {
    name: 'shetu-web',
    href: REPOS.web,
    description:
      'This site. Astro, React islands, Tailwind, and MDX documentation.',
  },
];
---

<BaseLayout
  title="Community — Shetu"
  description="Contribute to Shetu, report issues, and read the MIT license."
>
  <section class="mx-auto max-w-[1200px] px-6 pt-14 pb-16 md:pt-20">
    <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
      Community
    </p>
    <h1 class="mt-4 max-w-4xl text-5xl font-medium tracking-[-0.05em] md:text-6xl">
      Built in the open.
    </h1>
    <p class="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
      Shetu is MIT licensed and developed in public. Read the code, report a
      bug, or send a pull request. The project is small enough that a focused
      contribution makes a visible difference.
    </p>
  </section>

  <section class="border-y border-line bg-surface">
    <div class="mx-auto max-w-[1200px] px-6 py-16 md:py-20">
      <h2 class="text-3xl font-medium tracking-[-0.03em]">Repositories</h2>
      <div class="mt-8 grid gap-4 sm:grid-cols-2">
        {repos.map((repo) => (
          <a
            href={repo.href}
            class="rounded-xl border border-line bg-paper p-6 transition-colors duration-150 hover:border-accent/40 hover:bg-accent-wash/40"
          >
            <p class="font-mono text-sm text-ink">{repo.name}</p>
            <p class="mt-2 text-sm leading-relaxed text-muted">
              {repo.description}
            </p>
          </a>
        ))}
      </div>
    </div>
  </section>

  <section class="mx-auto grid max-w-[1200px] gap-10 px-6 py-20 md:grid-cols-2 md:py-28">
    <div>
      <h2 class="text-3xl font-medium tracking-[-0.03em]">Issues and help</h2>
      <p class="mt-4 text-sm leading-relaxed text-muted">
        Use GitHub Issues for bug reports and questions. GitHub Discussions is
        not enabled on these repositories, so issues are the public support
        channel.
      </p>
      <ul class="mt-5 space-y-3 text-sm">
        <li>
          <a class="font-medium text-accent underline decoration-line underline-offset-4 hover:decoration-accent" href="https://github.com/nhridoy/shetu/issues">
            Project issues
          </a>
        </li>
        <li>
          <a class="font-medium text-accent underline decoration-line underline-offset-4 hover:decoration-accent" href="https://github.com/nhridoy/shetu-client/issues">
            Desktop client issues
          </a>
        </li>
        <li>
          <a class="font-medium text-accent underline decoration-line underline-offset-4 hover:decoration-accent" href="https://github.com/nhridoy/shetu-server/issues">
            Server issues
          </a>
        </li>
      </ul>
    </div>
    <div>
      <h2 class="text-3xl font-medium tracking-[-0.03em]">Contributing</h2>
      <p class="mt-4 text-sm leading-relaxed text-muted">
        Read the contributing guide, fork the repository, create a focused
        branch, run the tests, and open a pull request. For a first
        contribution, filter the issue list for good first issues.
      </p>
      <ul class="mt-5 space-y-3 text-sm">
        <li>
          <a class="font-medium text-accent underline decoration-line underline-offset-4 hover:decoration-accent" href="https://github.com/nhridoy/shetu/blob/main/CONTRIBUTING.md">
            Contributing guide
          </a>
        </li>
        <li>
          <a class="font-medium text-accent underline decoration-line underline-offset-4 hover:decoration-accent" href="https://github.com/nhridoy/shetu/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22">
            Good first issues
          </a>
        </li>
        <li>
          <a class="font-medium text-accent underline decoration-line underline-offset-4 hover:decoration-accent" href="https://github.com/nhridoy/shetu/blob/main/LICENSE">
            MIT license
          </a>
        </li>
      </ul>
    </div>
  </section>

  <section class="border-t border-line">
    <div class="mx-auto max-w-[1200px] px-6 py-16">
      <p class="max-w-2xl text-sm leading-relaxed text-muted">
        Shetu is distributed under the MIT license. The client, server, and
        website are separate repositories so each part can be built, tested, and
        released independently.
      </p>
    </div>
  </section>
</BaseLayout>
```

**Step 2: Verify**

```sh
pnpm build
grep -q "Built in the open" dist/community/index.html
grep -q "CONTRIBUTING.md" dist/community/index.html
grep -q "MIT license" dist/community/index.html
grep -q "Discussions is not enabled" dist/community/index.html
```

Expected: all greps exit 0.

**Step 3: Commit**

```sh
git add src/pages/community.astro
git commit -m "feat: add the community page"
```

---

## Task 11: CI, Cleanup, and Final Verification

**Files:**

- Create: `.github/workflows/ci.yml`
- Modify: `README.md`
- Delete: `src/components/ui/{badge,button,card,separator}.tsx`
- Delete: `src/lib/utils.ts`
- Delete: `src/layouts/Layout.astro`
- Delete: `public/images/shetu-servers.webp`
- Delete: `public/images/shetu-transfer.webp`
- Delete: `docs/asset-provenance.md`
- Delete: `docs/landing-audit.md`
- Delete: `components.json`
- Modify: `package.json` (prune unused dependencies)

**Step 1: Verify nothing imports the legacy files**

Run:

```sh
grep -R "components/landing\|components/ui/badge\|components/ui/button\|components/ui/card\|components/ui/separator\|lib/utils\|layouts/Layout" src || true
grep -R "shetu-servers.webp\|shetu-transfer.webp" src || true
```

Expected: no output. If there is output, update the import before deleting.

**Step 2: Delete the legacy files and prune dependencies**

```sh
rm -f src/components/ui/badge.tsx src/components/ui/button.tsx src/components/ui/card.tsx src/components/ui/separator.tsx
rm -f src/lib/utils.ts src/layouts/Layout.astro components.json
rm -f public/images/shetu-servers.webp public/images/shetu-transfer.webp
rm -f docs/asset-provenance.md docs/landing-audit.md
rmdir public/images 2>/dev/null || true
pnpm remove @base-ui/react class-variance-authority cn shadcn tw-animate-css
```

Do not remove `@phosphor-icons/react` (used by `Header.astro`) or `@fontsource-variable/geist` (used by `global.css`).

**Step 3: Create the CI workflow**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm check
      - run: pnpm test
      - run: pnpm build
        env:
          SITE_URL: http://localhost:4321
```

`pnpm/action-setup@v4` reads `packageManager` from `package.json`.

**Step 4: Update the README**

Replace `README.md` with:

````md
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
- `src/styles/global.css`: Field Manual tokens and prose styles.
````

**Step 5: Run the full verification**

```sh
pnpm install
pnpm lint
pnpm check
pnpm test
pnpm build
```

Expected: all four checks pass. Then run the build-output checks:

```sh
test -f dist/index.html
test -f dist/download/index.html
test -f dist/releases/index.html
test -f dist/security/index.html
test -f dist/community/index.html
test -f dist/docs/index.html
test -f dist/docs/desktop/index.html
test -f dist/404.html
test -f dist/robots.txt
test -f dist/sitemap-index.xml
grep -q "Your servers." dist/index.html
grep -q "Get Shetu for your machine" dist/download/index.html
grep -q "Every release, in the open" dist/releases/index.html
grep -q "Trust the math, not the server" dist/security/index.html
grep -q "Built in the open" dist/community/index.html
```

**Step 6: Manual QA**

Run the dev server:

```sh
pnpm exec astro dev --background
```

Check each item:

1. **Responsive:** `/`, `/download`, `/docs/desktop`, `/releases`, `/security`, `/community` at 360, 768, 1024, and 1440px. No horizontal scroll.
2. **No JavaScript:** disable JS and reload `/download`. Confirm the matrix, version, both install commands, and GitHub links are present. Confirm `/docs/desktop` renders content and navigation.
3. **Network blocked:** in dev tools, block `api.github.com` and reload `/download` and `/releases`. Confirm the fallback notice and GitHub link appear.
4. **Clipboard denied:** deny clipboard permission and click a copy button. Confirm it reads "Select and copy" and the command remains selectable.
5. **Reduced motion:** enable `prefers-reduced-motion: reduce`. Confirm smooth scrolling is disabled.
6. **Keyboard:** tab through the header, mobile menu, install tabs, download links, and docs sidebar. Confirm visible focus and logical order.
7. **Lighthouse mobile:** run on `/` and `/download`. Target performance 90+, accessibility 95+, CLS below 0.1. If Chrome is unavailable, record that the audit was not run; do not claim it passed.

Stop the dev server:

```sh
pnpm exec astro dev stop
```

**Step 7: Commit**

```sh
git add .github/workflows/ci.yml README.md package.json pnpm-lock.yaml src public docs
git commit -m "chore: add CI and remove the legacy landing page"
```

---

## Final Acceptance Checklist

- [ ] `/` renders the hero, fact ribbon, value cards, workspace demo, security, self-host, install, open source, and closing CTA without JavaScript.
- [ ] The hero CTA upgrades to a direct asset link after detection and fetch, and falls back to `/download`.
- [ ] `/download` lists all eight build files (six platform/architecture combinations, with AppImage and `.deb` on Linux).
- [ ] `/download` shows the version, release date, install commands, first-launch guidance, and requirements.
- [ ] `/releases` lists live releases and falls back to GitHub when the API is unavailable.
- [ ] `/docs`, `/docs/desktop`, `/docs/server`, `/docs/security`, and `/docs/troubleshooting` build with sidebar, TOC, previous/next, mobile menu, and Shiki highlighting.
- [ ] `/security` and `/community` are complete and contain no invented claims.
- [ ] `robots.txt`, `sitemap-index.xml`, per-page metadata, JSON-LD, and `404.html` exist.
- [ ] `pnpm lint`, `pnpm check`, `pnpm test`, and `pnpm build` pass.
- [ ] No page claims SRP6a, XSalsa20, GitLab OAuth, Microsoft OAuth, a mobile app, pricing, customers, testimonials, benchmarks, or cloud signup.
- [ ] Only `shetu-web` files changed.
