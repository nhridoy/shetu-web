# Shetu Distribution and Marketing Site — Design Spec

**Date:** 2026-11-09
**Status:** Approved for planning
**Scope:** `shetu-web` only
**Supersedes:** the existing single-page landing design in `src/pages/index.astro`

## 1. Context

Shetu is an open-source, self-hostable SSH client and Termius alternative. It has three parts: a Tauri v2 desktop client, a Go sync/auth server that never proxies SSH, and this web presence. Today `shetu-web` is a single marketing page whose "Get Shetu" action links to the GitHub quick-start. There is no real download experience, no documentation surface, and no release history.

This spec defines a fresh, multi-page distribution and marketing site. The current page and its visual design are discarded. The repo, Astro stack, and brand name are retained.

### What the product actually is (source of truth for copy)

- Desktop app for Windows, macOS, and Linux, version `0.0.15` at the time of writing.
- Direct client-to-remote SSH and SFTP. The server never proxies connections.
- Client-side encryption: Argon2id key derivation, XChaCha20-Poly1305, X25519 identity keys. The server stores ciphertext and wrapped keys, never plaintext credentials.
- Optional self-hosted Go server (Docker image `ghcr.io/nhridoy/shetu-server`) for sync and auth.
- MIT licensed, source on GitHub under `nhridoy/shetu`, `shetu-client`, `shetu-server`, and `shetu-web`.
- Releases are published on GitHub Releases for `nhridoy/shetu-client`, with one-line installers `install.sh` and `install.ps1`.
- Builds are not yet signed by Apple or Microsoft, so first launch shows Gatekeeper or SmartScreen warnings.

### Accuracy rules

Every technical claim must map to behavior that exists in the code. The site must not repeat README claims the code does not support, including SRP6a, XSalsa20, GitLab OAuth, Microsoft OAuth, or a mobile app. No invented prices, customers, testimonials, benchmarks, or cloud signup URLs.

## 2. Goals and non-goals

### Goals

1. Let a visitor understand Shetu and trust it within the first viewport.
2. Let a visitor download the correct build for their OS and architecture in a few seconds.
3. Explain installation, self-hosting, and the security model honestly and completely.
4. Present the project as a credible open-source product, not a prototype.
5. Ship as static, host-agnostic output with minimal JavaScript.

### Non-goals

- No authentication, accounts, or server-side runtime.
- No pricing or Shetu Cloud page. There is no real plan data, so none is invented.
- No blog, changelog authoring UI, analytics, or search.
- No mobile app marketing. The mobile app is not in this repo.
- No changes outside `shetu-web`.

## 3. Audience and success

**Primary:** developers and DevOps engineers evaluating a Termius alternative.

**Secondary:** tech leads and small teams evaluating self-hosting.

**Success is qualitative and testable:**

- A first-time visitor can state what Shetu is and that it is open source after one screen.
- A visitor on a supported OS reaches a direct download in two actions or fewer.
- A visitor can find install, self-host, and security answers without leaving the site.
- Every page works with JavaScript disabled except the live release metadata upgrade.

## 4. Locked decisions

| Decision         | Choice                                                                                       |
| ---------------- | -------------------------------------------------------------------------------------------- |
| Scope            | New multi-page distribution and marketing site, from scratch                                 |
| Pages            | Core distribution set: Home, Download, Docs, Releases, Security, Community                   |
| Visual direction | Field Manual: light editorial open-source aesthetic, one mint accent, dark terminal surfaces |
| Rendering        | Astro static output, React islands only where interaction is required                        |
| Download data    | Runtime fetch of the latest GitHub release, isolated in a client island                      |
| OS handling      | Client-side OS detection with an architecture recommendation                                 |
| Docs             | Fresh user-facing MDX guides in Astro content collections                                    |
| Hosting          | Static and host-agnostic                                                                     |
| Package manager  | pnpm                                                                                         |
| Home page        | Highest design priority; it is the marketing surface                                         |

## 5. Information architecture

**Global navigation:** Download · Docs · Security · Releases · Community, plus a persistent Download button.

| Route                   | Job                          | Primary content                                                                                                     |
| ----------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `/`                     | Convince and route           | Hero with OS-aware download; product proof; security; self-host; install; open source; closing CTA                  |
| `/download`             | Deliver the right binary     | Detected recommendation, full platform matrix, install commands, first-launch notes, requirements, version and date |
| `/docs`                 | Choose a path                | Desktop and Server tracks, Security, Troubleshooting                                                                |
| `/docs/desktop`         | Install and run the app      | Per-OS install, first launch, connecting, updates, uninstall                                                        |
| `/docs/server`          | Self-host sync               | Docker Compose, environment variables, Postgres, TLS, OAuth, email verification, upgrades                           |
| `/docs/security`        | Explain the model            | Key hierarchy, server visibility, recovery kit, threat model                                                        |
| `/docs/troubleshooting` | Recover from common failures | First-launch warnings, connection issues, sync issues, logs                                                         |
| `/releases`             | Prove momentum               | Release list with tag, date, notes, assets, prerelease labels                                                       |
| `/security`             | Build trust                  | Direct SSH, client-side encryption, zero-knowledge sync, disclosure policy                                          |
| `/community`            | Make contributing easy       | Repos, issues, discussions, contributing, MIT license                                                               |
| `404`                   | Recover                      | Friendly not-found page with links to home, download, docs                                                          |

## 6. Visual direction — Field Manual

A light editorial open-source aesthetic. Paper-like canvas, strong typographic hierarchy, generous whitespace, annotated product views, and a single signal-green accent. Dark terminal surfaces provide contrast for code, commands, and downloads.

### Tokens

| Role                | Value                      |
| ------------------- | -------------------------- |
| Canvas              | `#F7F5EF`                  |
| Raised surface      | `#FFFFFF`                  |
| Ink                 | `#161816`                  |
| Muted ink           | `#646A63`                  |
| Hairline            | `rgba(22, 24, 22, 0.12)`   |
| Accent (text/links) | `#1C6B47`                  |
| Accent wash         | `#E4EFE7`                  |
| Terminal surface    | `#101413`                  |
| Terminal text       | `#A8DBBD` and paper        |
| Focus ring          | `#1C6B47`, 2px, 3px offset |

### Typography

- Display and body: Geist Variable, self-hosted via `@fontsource-variable/geist`.
- Labels, commands, metadata: system monospace stack.
- Display sizes use tight tracking and generous line height. No additional font families.

### Layout

- 1200px shell, 12-column grid, 96–128px section rhythm.
- Asymmetric hero at 7/5 columns.
- Numbered steps, margin notes, hairline rules, no drop shadows.
- Responsive from 360px upward.

### Motion

- 160ms ease on hover and press only.
- No automatic or parallax motion.
- Full `prefers-reduced-motion` support.

### Components

- **Buttons:** primary near-black with paper text; secondary hairline outline; mint reserved for emphasis.
- **Code block:** dark terminal surface, monospace, copy control.
- **Tabs:** used for OS-specific install commands.
- **Callout:** used for warnings such as unsigned builds.
- **Cards:** white surface, hairline border, 12px radius.

## 7. Page designs

### 7.1 Home (priority)

1. **Sticky header** — wordmark, nav, persistent Download.
2. **Hero (7/5)** — eyebrow "Open source · Self-hostable"; large two-line headline; one-sentence promise; OS-aware primary download plus "Self-host it"; coded workspace mock on the right.
3. **Fact ribbon** — MIT · Windows/macOS/Linux · Direct SSH · Encrypted vault · Self-hosted sync.
4. **Value cards** — direct connections, encrypted vault, SFTP and editor, port forwarding. Each with a small functional visual.
5. **One workspace** — larger coded product demo showing tabs, splits, hosts, and SFTP.
6. **Security** — direct client-to-remote diagram and plain-language key hierarchy.
7. **Self-host** — dark terminal panel with a copyable `docker compose` snippet and three steps, linking to `/docs/server`.
8. **Install in one command** — OS tabs with `curl` and `irm` commands and copy controls.
9. **Open source** — repositories, MIT, contributing.
10. **Closing CTA and footer** — Download, Docs, Security, Releases, Community.

**Headline:** "Your servers. Your rules." is the default. Alternatives ("A terminal workspace you actually own.", "SSH, without the lock-in.") may be tested during implementation but do not change the layout.

**Asset strategy:** no product screenshots exist, so the hero and product sections use a coded, responsive workspace mock built in HTML and CSS. It stays crisp, themeable, fast, and honest.

### 7.2 Download

- Detected-platform recommendation card with version, format, architecture, size, and a direct link.
- Full matrix: Windows x64 and ARM64, macOS Apple Silicon and Intel, Linux x64 and ARM64 (AppImage primary, `.deb` alternative).
- Install one-liners per OS.
- Unsigned-build first-launch guidance for macOS and Windows.
- Supported formats and platform requirements, derived from the release artifacts. No invented minimum OS versions.
- Latest version, release date, and link to release notes.
- Fallback notice when live metadata is unavailable.

### 7.3 Docs

- `/docs` hub with two primary tracks and links to Security and Troubleshooting.
- `/security` is the persuasive trust page; `/docs/security` is the technical reference. They may share content but serve different intent and must not contradict each other.
- `DocsLayout` with sidebar, on-page table of contents, previous/next links, and mobile navigation.
- MDX content with Shiki code highlighting.
- Content is written fresh for users; deep technical material links to the repositories.

### 7.4 Releases

- Release list from the GitHub API with tag, name, date, prerelease label, notes summary, and asset links.
- Cached and backed by a committed snapshot.
- Link to the full release on GitHub.

### 7.5 Security

- Direct SSH flow diagram.
- Client-side key hierarchy explained in plain language.
- What the server can and cannot see.
- Recovery kit behavior.
- Responsible disclosure contact and policy.

### 7.6 Community

- Repository cards for the four repos.
- Issues and discussions links.
- Contributing summary and good-first-issue link.
- MIT license statement.

## 8. Technical architecture

### 8.1 Stack

- Astro 7, static output, no adapter.
- React 19 islands via `@astrojs/react`.
- Tailwind v4 via `@tailwindcss/vite`.
- TypeScript strict.
- pnpm; Biome for lint and format.
- Added dependencies: `@astrojs/mdx`, `@astrojs/sitemap`, `@astrojs/check`, `vitest`.
- Icons: `@phosphor-icons/react` (already present).
- Fonts: `@fontsource-variable/geist` (already present).

### 8.2 Structure

```
src/
  pages/
    index.astro
    download.astro
    releases.astro
    security.astro
    community.astro
    docs/index.astro
    docs/[...slug].astro
    404.astro
  content/docs/
    desktop.mdx
    server.mdx
    security.mdx
    troubleshooting.mdx
  layouts/BaseLayout.astro
  layouts/DocsLayout.astro
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
    download/DownloadPanel.tsx
    download/InstallCommand.tsx
    download/ReleaseList.tsx
    ui/Button.astro
    ui/CodeBlock.astro
    ui/Tabs.astro
    ui/Callout.astro
  lib/platform.ts
  lib/releases.ts
  lib/github.ts
  data/releases.json
  styles/global.css
```

The existing `PlanSelector` and `WorkspaceDemo` components are retired. UI primitives are rebuilt for the Field Manual system; unused dependencies are pruned after the rebuild.

### 8.3 Rendering strategy

- All pages are pre-rendered HTML.
- Marketing sections are static Astro and CSS with no hydration.
- `DownloadPanel` is `client:load` in the hero and on `/download`.
- `InstallCommand` and `ReleaseList` are `client:visible`.
- Docs use Astro content collections with MDX and built-in Shiki highlighting.
- The `docs` collection schema is `title`, `description`, `section` (`desktop` or `server`), `order`, and optional `updated`. `section` drives sidebar grouping and previous/next order.

## 9. Download subsystem

### 9.1 Platform detection

- OS from `navigator.userAgentData.platform`, falling back to `navigator.platform` and user agent parsing.
- Architecture from `userAgentData.getHighEntropyValues(['architecture', 'bitness'])` where available, otherwise best-effort user agent parsing.
- Defaults: macOS Apple Silicon, Windows x64, Linux x64 AppImage.
- The alternative architecture is always shown. Detection is a convenience, never a gate.

### 9.2 Release fetch

- `GET https://api.github.com/repos/nhridoy/shetu-client/releases/latest`.
- `GET https://api.github.com/repos/nhridoy/shetu-client/releases?per_page=20` for `/releases`.
- Public, CORS-enabled, no token.
- Responses cached in `sessionStorage` for 10 minutes.
- Only the fields the site needs are retained.

### 9.3 Asset mapping

- Ignore `.sig`, `.json`, and updater manifest assets.
- macOS: `.dmg`, Apple Silicon versus Intel.
- Windows: NSIS `.exe`, x64 versus ARM64.
- Linux: `.AppImage` primary and `.deb` alternative, x64 versus ARM64.
- Each mapped option carries format, architecture, size, and download URL.

### 9.4 Fallback snapshot

`src/data/releases.json` is a committed snapshot with the same shape the UI consumes. It is used when the API fails, is rate-limited, or returns malformed data. The UI then shows a notice and links to GitHub.

Shape:

```json
{
  "fetched_at": "2026-11-09T00:00:00Z",
  "latest": {
    "tag_name": "v0.0.15",
    "name": "v0.0.15",
    "published_at": "2026-11-05T00:00:00Z",
    "html_url": "https://github.com/nhridoy/shetu-client/releases/tag/v0.0.15",
    "prerelease": false,
    "assets": [
      {
        "name": "Shetu_0.0.15_x64.dmg",
        "browser_download_url": "https://github.com/...",
        "size": 12345678
      }
    ]
  },
  "releases": []
}
```

### 9.5 Progressive enhancement

- The hero and page CTAs are real anchors in static HTML.
- The island upgrades them to direct asset links after detection and fetch succeed.
- With JavaScript disabled, `/download`, the install scripts, and GitHub Releases remain fully usable.

## 10. Error states

| Condition                                   | Behavior                                                          |
| ------------------------------------------- | ----------------------------------------------------------------- |
| GitHub API unreachable or rate-limited      | Render the committed snapshot with a notice and GitHub link       |
| Release found but no asset for the platform | Show the release page and the full matrix                         |
| OS or architecture undetectable             | Skip the recommendation and show the matrix                       |
| Clipboard blocked                           | Select the command text and show a copy hint                      |
| No JavaScript                               | Static links to `/download`, install scripts, and GitHub Releases |

## 11. Accessibility, SEO, and performance

- Semantic landmarks, skip link, logical headings, visible focus, AA contrast.
- Reduced-motion support and keyboard-operable tabs and menus.
- Per-page title, description, Open Graph, and canonical URL.
- `SoftwareApplication` JSON-LD on the home page.
- Sitemap and robots.
- Custom 404.
- Fixed-height download skeleton to avoid layout shift.
- Lighthouse mobile targets: performance 90+, accessibility 95+, CLS below 0.1.
- Static HTML under roughly 100 KB per page, with small, page-scoped island bundles.

## 12. Testing and CI

- **Vitest** unit tests for platform detection, asset mapping, release parsing, cache, and fallback behavior.
- `astro check` for type safety.
- `astro build` for the full static build.
- Biome check in CI.
- Manual verification of the download flow with the network blocked.
- Optional later: Playwright smoke test.

## 13. Deployment

- `pnpm build` produces a static `dist/`.
- No adapter, base path, or server dependency.
- Deployable to any static host or object store.
- Runtime behavior depends only on the GitHub API and its fallback snapshot.

## 14. Acceptance criteria

**Home**

- Static HTML renders hero, all sections, and footer without JavaScript.
- Download CTA reaches the correct asset on supported platforms and falls back to `/download`.
- Responsive from 360px to 1440px with no horizontal scroll.
- Reduced motion respected.

**Download**

- Correct OS recommendation.
- All six platform and architecture combinations listed.
- Version and release date shown.
- Install commands, first-launch guidance, and requirements present.
- API-failure fallback verified.

**Docs**

- MDX builds; sidebar, TOC, highlighting, mobile nav, and previous/next links work.

**Releases**

- Releases listed with tag, date, notes link, and prerelease label.
- Fallback works.

**Global**

- Sitemap, robots, per-page metadata, JSON-LD, and 404 present.
- `pnpm build`, `astro check`, Biome, and Vitest pass.
- Island JavaScript stays within the agreed budget.

## 15. Risks and mitigations

| Risk                                             | Mitigation                                                                     |
| ------------------------------------------------ | ------------------------------------------------------------------------------ |
| GitHub API rate limits (60/hour unauthenticated) | 10-minute session cache plus committed snapshot                                |
| Architecture detection is unreliable             | Detect OS only; recommend the common architecture and always show alternatives |
| Unsigned builds trigger OS warnings              | Explicit first-launch guidance on Download and in Docs                         |
| Copy drifts from the product                     | Accuracy rules and links to source; review claims against code                 |
| Coded product mock diverges from real UI         | Keep the mock abstract and representative, never claim it is a screenshot      |

## 16. Out of scope

- Pricing, Shetu Cloud signup, and plan comparison.
- Blog, changelog authoring, analytics, search.
- Mobile app pages.
- Authentication and user accounts.
- Changes to `shetu-client` or `shetu-server`.
