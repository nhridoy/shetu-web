# Terra dark product site redesign — design spec

Date: 2026-11-10
Status: Draft for review
Scope: `terra-web` only

## 1. Context

The current site uses a light “Field Manual” editorial style. It reads like an organization’s brochure rather than an open-source desktop application. The homepage copy is abstract, the visuals are code-drawn mockups instead of the real product, and the light palette does not match the app.

This redesign moves the whole site to a dark, product-led visual system in the spirit of OnOrca, Terax, Raycast, Coolify, Dokploy, and Openship. The homepage is rewritten around the actual app: real screenshots, concrete capabilities, and a direct download path. The other pages keep their purpose and most of their copy, but adopt the same dark shell and components.

The desktop app screenshots supplied on 2026-11-10 are the primary visual evidence. They are 1366×768 PNGs. They will be redacted, renamed, converted to WebP, and committed as site assets. The original screenshots are not committed.

## 2. Goals

- Make the site feel like an open-source desktop app, not a corporate landing page.
- Make “download the desktop app” the primary action on the homepage.
- Show the real product with real screenshots, not drawn mockups.
- Rewrite the homepage copy around concrete features and outcomes.
- Apply one coherent dark visual system to every page.
- Keep the existing static architecture, OS detection, runtime release data, fallback snapshot, and no-JS behavior.
- Keep the site accurate: no invented customers, pricing, benchmarks, cloud signup, mobile app, or unsupported crypto/OAuth claims.

## 3. Non-goals

- No new product features or backend work.
- No pricing page, cloud signup, blog, analytics, search, or authentication.
- No mobile-app marketing.
- No new runtime dependency for animation, icons, or images.
- No changes outside `terra-web`.
- No rewrite of the docs content beyond what the dark theme requires.
- No fake social proof, customer logos, testimonials, star counts, or benchmark numbers.

## 4. Audience and primary job

**Audience:** developers, sysadmins, and self-hosters who manage Linux servers and want a desktop SSH workspace they can own and inspect.

**Primary job:** get a developer to download the desktop app.

**Secondary jobs:** understand that Terra is open source and self-hostable, see that it handles hosts, terminals, files, teams, and themes, and reach the docs or GitHub.

## 5. Design principles

1. **Product first.** The app is the hero. Screenshots and concrete UI nouns beat abstract claims.
2. **Short, technical copy.** One idea per section. Verbs over adjectives. No “seamless,” “powerful,” or “revolutionary.”
3. **Dark, quiet, high-contrast.** Near-black surfaces, one mint accent, restrained borders, no rainbow gradients.
4. **Open-source confidence.** MIT, public repos, and self-hosting are first-class, not footnotes.
5. **No proof we cannot show.** If there is no real customer, benchmark, or star count, the page does not pretend there is.

## 6. Visual system

### 6.1 Palette

Keep the existing token names to avoid a risky rename, but change their values to dark semantics. Add two tokens.

| Token | Value | Use |
|---|---|---|
| `--color-paper` | `#08090A` | Page background |
| `--color-surface` | `#0E1012` | Cards, panels, header |
| `--color-elevated` | `#14171A` | Raised cards, code headers, hover surfaces |
| `--color-ink` | `#F5F7F6` | Primary text |
| `--color-muted` | `#98A2A0` | Secondary text |
| `--color-line` | `rgba(255, 255, 255, 0.08)` | Borders and dividers |
| `--color-accent` | `#5EEAD4` | Links, focus, highlights, status |
| `--color-accent-wash` | `rgba(94, 234, 212, 0.12)` | Active tabs, badges, soft fills |
| `--color-terminal` | `#0A0C0D` | Code blocks, terminal surfaces |
| `--color-terminal-text` | `#A7F3D0` | Code and terminal text |
| `--color-glow` | `rgba(94, 234, 212, 0.14)` | Hero radial glow |

Primary buttons are white (`#F5F7F6`) with near-black text. Secondary buttons are transparent with a `line` border. Destructive/error states are not introduced on the marketing site.

### 6.2 Typography

- Sans: `Geist Variable` (already installed).
- Mono: the existing system mono stack. No new font dependency.
- Display: tight tracking (`-0.04em` to `-0.05em`), large sizes, medium weight.
- H1: `clamp(2.75rem, 6vw, 5.25rem)`, line-height `1.02`.
- H2: `clamp(2rem, 4vw, 3.25rem)`, line-height `1.08`.
- H3: `1.125rem` to `1.375rem`.
- Body: `1rem`, line-height `1.7`.
- Eyebrow: mono, `11px`, uppercase, `0.18em` tracking, accent.
- Metadata: mono, `11px` to `12px`, muted.

### 6.3 Layout

- Max width: `1200px`.
- Gutters: `24px` on mobile, `32px` on desktop.
- Section spacing: `80px` mobile, `128px` desktop.
- 1px borders, 12–16px radii, no heavy drop shadows except the app window.
- Hero is centered: eyebrow, H1, subhead, CTA row, trust line, then a wide app window.
- Feature sections alternate text/image columns.
- Feature grid: 4 columns on desktop, 2 on tablet, 1 on mobile.
- Background: near-black with a subtle top-center mint radial glow and a faint grid pattern behind the hero only. No full-page image backgrounds.

### 6.4 App window treatment

- Screenshots are cropped to remove the macOS menu bar and desktop chrome, but keep the app’s own title bar and tabs.
- Each screenshot sits in a rounded `surface` frame with a 1px `line` border, a top highlight, and a soft shadow.
- The hero uses a large hosts screenshot with a smaller terminal crop inset at the bottom-right on desktop. The inset is hidden below `md`.
- No fake browser chrome, no invented menu bars, no rounded screenshot corners inside the frame.

### 6.5 Motion

- CSS transitions on hover and focus only.
- No scroll-triggered animation, parallax, or auto-playing video.
- `prefers-reduced-motion: reduce` disables smooth scrolling and transitions.

## 7. Global shell

### 7.1 Header

- Sticky, translucent near-black with `backdrop-blur`.
- Left: `terra` wordmark with a small mint `>_` glyph in a rounded square.
- Center/right nav: `Features`, `Docs`, `Security`, `Releases`, `Community`.
- GitHub icon link to the monorepo, with an accessible label.
- `Download` button in white with black text.
- Mobile: a `<details>` menu with the same links, plus GitHub and Download. Keyboard operable.

`Features` points to `/#features`. The header does not repeat `Download` in the nav list because the button already covers it; the footer keeps a Download link.

### 7.2 Footer

- Wordmark and one-line description.
- Product column: Features, Download, Docs, Security, Releases, Community.
- Source column: `terra`, `terra-client`, `terra-server`, `terra-web`.
- Bottom row: `MIT licensed · © 2026 Terra` and `Open source, self-hostable.`
- No invented social links. GitHub is the only social link.

## 8. Homepage

### 8.1 Hero

- Eyebrow: `Open source · MIT · Windows, macOS, Linux`
- H1: **Every server. One window.**
- Subhead: “Terra is an open-source SSH workspace with encrypted vaults, split terminals, SFTP, and team-shared hosts. Connect directly, and sync on your own terms.”
- Primary CTA: OS-aware `DownloadPanel` (`variant="hero"`, `client:load`).
- Secondary CTA: `View on GitHub` → `REPOS.monorepo`.
- Trust line: `MIT licensed · Direct SSH · Self-hostable sync`.
- Visual: large hosts screenshot in an app frame, with a terminal inset on desktop.
- Background: mint radial glow and faint grid.

### 8.2 Feature grid — `#features`

- Eyebrow: `Features`
- H2: **Everything between you and the server.**
- Subhead: “Organize hosts, keep credentials encrypted, and move between terminals and files without switching apps.”
- Eight cards, each with a Phosphor icon, title, and one or two sentences:
  1. **Hosts & groups** — “Keep production, staging, and home-lab machines organized with groups, tags, and colors.”
  2. **Encrypted vault** — “Hosts, keys, and snippets are encrypted on your device with Argon2id and XChaCha20-Poly1305.”
  3. **Terminal workspace** — “Tabs, split panes, and saved workspaces for local and remote shells.”
  4. **SFTP & editor** — “Browse remote files, transfer them, and edit in place beside the terminal.”
  5. **Port forwarding** — “Local, remote, and dynamic tunnels for databases and internal services.”
  6. **Teams & shared vaults** — “Invite teammates, assign member roles, and share vaults from one workspace.”
  7. **Themes** — “Dark, light, and named themes, so the workspace fits the way you work.”
  8. **Self-hosted sync** — “Run the Terra server on your own infrastructure when you want sync or shared vaults.”

### 8.3 Showcase: hosts

- Eyebrow: `Hosts`
- H2: **Your whole fleet, one list.**
- Body: “Group machines by project or environment, add tags and colors, and find the right host without digging through config files.”
- Bullets: `Groups, tags, and colors` · `Search across hosts` · `Connection status at a glance`
- Image: hosts screenshot, image right.

### 8.4 Showcase: terminal

- Eyebrow: `Terminal`
- H2: **A terminal that keeps up.**
- Body: “Open tabs, split panes, and save a workspace when a task spans several machines. Local and remote shells live in the same window.”
- Bullets: `Tabs and split panes` · `Saved workspaces` · `Local and remote shells`
- Image: terminal screenshot, image left.

### 8.5 Showcase: files

- Eyebrow: `Files`
- H2: **Files without leaving the session.**
- Body: “Open an SFTP browser beside the terminal, transfer files, and edit remote files in place. No separate client, no context switch.”
- Bullets: `SFTP browser` · `Remote file editor` · `Transfers beside the terminal`
- Image: editor screenshot, image right.

### 8.6 Showcase: teams

- Eyebrow: `Teams`
- H2: **Share access with your team.**
- Body: “Create a team, invite members, and share vaults with the people who need them. Member roles keep access organized.”
- Bullets: `Team invites` · `Shared vaults` · `Member roles`
- Image: team screenshot, image left.

### 8.7 Self-hosted server

- Eyebrow: `Self-hosted`
- H2: **Run the sync server yourself.**
- Body: “Terra’s sync server is open source. Run it on your own infrastructure with PostgreSQL, set `JWT_SECRET` and `BASE_URL`, and keep sync and shared vaults where you want them.”
- Code block, label `server/`:

  ```sh
  cd server
  docker compose -f docker-compose.prod.yml pull
  docker compose -f docker-compose.prod.yml up -d
  ```

- Link: `Read the server guide` → `/docs/server`.
- No cloud URL, no pricing, no “one-click deploy” claim.

### 8.8 Open source

- Eyebrow: `Open source`
- H2: **Yours to run, read, and change.**
- Body: “Terra is MIT licensed. The desktop client, the sync server, and this site are all public. Use it, fork it, or send a patch.”
- Four repo cards:
  - `terra` — “The monorepo: desktop client, server, and shared code.”
  - `terra-client` — “The Tauri desktop app.”
  - `terra-server` — “The Go sync server.”
  - `terra-web` — “This site.”
- CTAs: `View on GitHub` → monorepo, `Read the docs` → `/docs`.
- No star counts, contributor counts, or customer logos.

### 8.9 Install

- Eyebrow: `Install`
- H2: **Install in one line.**
- Body: “The install script picks the right build for your OS and architecture. Prefer a direct download? Every build is on the download page.”
- Static `InstallCommand` with both Unix and Windows commands.
- Link: `All downloads` → `/download`.

### 8.10 Closing CTA

- H2: **Your servers are waiting.**
- Body: “Download Terra, connect your first host, and keep the rest of your setup where it belongs.”
- CTA: `Download Terra` → `/download`.
- Secondary: `Read the docs` → `/docs`.

## 9. Screenshot plan

### 9.1 Selected screenshots

Use four, not all fourteen:

| Asset | Source (2026-11-10) | Use |
|---|---|---|
| `hosts.webp` | 13:57:06 hosts list | Hero and hosts showcase |
| `terminal.webp` | 13:59:32 terminal `ls` | Terminal showcase |
| `editor.webp` | 14:05:10 editor + explorer | Files showcase |
| `team-vault.webp` | 13:58:27 team detail | Teams showcase |

A fifth crop, `terminal-inset.webp`, may be derived from the terminal screenshot for the hero inset.

Do not use the six-pane OpenCode screenshot, the save-preset modal, the SFTP empty split, or the settings/themes screenshot. They either contain third-party product names, too much personal context, or are not compelling enough.

### 9.2 Redaction and renaming

The originals live in `~/Pictures/Screenshots` and are not committed. Processed assets go in `src/assets/app/`.

Replace all real data before publishing:

- Name/email in the sidebar footer → `Alex Morgan` / `alex@example.com`.
- `telehack.com` → `acme-prod-01`.
- `Binary Tech` → `Acme`.
- Terminal prompt `nahidujjaman-hridoy@...` → `alex@studio`.
- Local paths such as `/run/media/.../terra/terra-web` → `/home/alex/projects/terra-web`.
- `NaN ago` → `2m ago`.
- Any other personal, local, or third-party text → neutral demo values or crop it out.

Crop the macOS menu bar and desktop chrome. Keep the app’s own title bar and tabs. Do not leave the macOS date/time, battery, or Wi-Fi indicators in the final assets.

Verification: run OCR (if available) or a visual inspection over each processed asset and confirm none of `nahidujjaman`, `hridoyboss`, `telehack`, `/run/media`, or `Binary Tech` remain.

### 9.3 Image handling

- Convert to WebP, quality ~85, strip metadata.
- Put assets in `src/assets/app/` and render with Astro’s `<Image>` component.
- Provide explicit width/height and useful `alt` text.
- Hero image: eager loading, high fetch priority.
- Showcase images: lazy loading.
- The hero inset is hidden below `md`.
- No layout shift: reserve the image box with aspect ratio and dimensions.

## 10. Other pages

All pages adopt the dark tokens and shell. Copy stays mostly unchanged.

- **Download:** dark hero, full download matrix, both install commands, Gatekeeper/SmartScreen guidance, requirements. Keep OS detection and no-JS matrix.
- **Releases:** dark list, live GitHub data, 10-minute cache, committed fallback, GitHub link when unavailable.
- **Docs:** dark docs prose, sidebar, mobile disclosure, on-page TOC, previous/next. Keep content and routes.
- **Security:** dark page, keep `SecurityFlow`, Argon2id/XChaCha20-Poly1305/X25519 claims, link to `/docs/security`.
- **Community:** dark page, four repo cards, GitHub Issues support, contributing, MIT.
- **404:** dark, SSH-themed “Connection refused.” with links to home, docs, and download.

## 11. Component and file architecture

New or rewritten marketing components:

- `src/components/marketing/Hero.astro` — rewritten.
- `src/components/marketing/FeatureGrid.astro` — new.
- `src/components/marketing/FeatureShowcase.astro` — new; props for eyebrow, title, body, bullets, image, alt, and image side.
- `src/components/marketing/AppWindow.astro` — new; frame around a screenshot, optional inset.
- `src/components/marketing/SelfHostSection.astro` — new; replaces `SelfHostPanel.astro`.
- `src/components/marketing/OpenSourceSection.astro` — new; replaces `OpenSource.astro`.
- `src/components/marketing/InstallSection.astro` — new.
- `src/components/marketing/ClosingCta.astro` — rewritten.
- `src/components/marketing/SecurityFlow.astro` — retained for `/security`, restyled.
- Delete `FactRibbon.astro`, `ValueCards.astro`, and `WorkspaceMock.astro` once unused.

Shell and shared:

- `src/components/layout/Header.astro` — rewritten.
- `src/components/layout/Footer.astro` — rewritten.
- `src/layouts/BaseLayout.astro` — dark theme color, body classes, background.
- `src/styles/global.css` — tokens, base styles, docs prose, install tabs, code blocks, tables, focus.
- `src/lib/site.ts` — add `Features` nav item, update description.
- `src/pages/index.astro` — compose the new homepage.
- `src/components/download/DownloadPanel.tsx`, `InstallCommand.astro`, `ReleaseList.tsx`, `Callout.astro` — dark styling; behavior unchanged.
- `src/pages/download.astro`, `releases.astro`, `security.astro`, `community.astro`, `404.astro` — dark styling.
- `src/components/docs/DocsNav.astro`, `src/layouts/DocsLayout.astro`, `src/pages/docs/*` — dark styling.

## 12. Behavior and data

Unchanged:

- Client-side OS/arch detection recommends a download but never hides alternatives.
- The full download matrix and both install commands are in static HTML.
- Latest release data is fetched from `https://api.github.com/repos/nhridoy/terra-client/releases/latest` at runtime, cached in `sessionStorage` for 10 minutes, and falls back to the committed `v0.0.15` snapshot.
- Releases page fetches the latest 20 releases and falls back to a GitHub link.
- Install commands:
  - macOS/Linux: `curl -fsSL https://raw.githubusercontent.com/nhridoy/terra-client/main/install.sh | bash`
  - Windows: `irm https://raw.githubusercontent.com/nhridoy/terra-client/main/install.ps1 | iex`
- No new runtime dependency.

## 13. Accessibility, responsive, and performance

- One `h1` per page; sections use `h2`, cards use `h3`.
- Landmarks: header, nav, main, footer; skip link.
- Visible mint focus ring on all interactive elements.
- Keyboard-operable header menu, install tabs, docs disclosure, and download controls.
- AA contrast for body text and links on all dark surfaces.
- `prefers-reduced-motion` respected.
- No horizontal scroll at 360, 768, 1024, or 1440px.
- Screenshots have descriptive alt text and reserved dimensions.
- Hero image eager; all other images lazy.
- No new client-side JS beyond the existing islands.

## 14. Accuracy constraints

Never claim:

- SRP6a, XSalsa20, GitLab OAuth, Microsoft OAuth, or a mobile app.
- Pricing, plans, customers, testimonials, benchmarks, star counts, or contributor counts.
- A cloud signup URL or hosted Terra service.
- “Zero knowledge,” “end-to-end encrypted,” “no telemetry,” “no account,” “fastest,” “most secure,” or similar unverified claims.
- Minimum OS versions or a support matrix.

Allowed:

- Argon2id, XChaCha20-Poly1305, X25519.
- Google and GitHub OAuth.
- MIT license.
- Windows, macOS, Linux.
- Direct SSH, SFTP, split terminals, port forwarding, teams/shared vaults, themes, self-hosted sync.
- `v0.0.15` and its real release date only where release data is shown.

## 15. Testing and verification

- `pnpm lint`
- `pnpm check`
- `pnpm test` (existing 35 tests must stay green; update only copy assertions that legitimately change)
- `pnpm build`
- Static checks:
  - `/download` contains all 8 build assets and both install commands.
  - `/docs/*` routes and TOC anchors resolve.
  - One `h1` per page.
  - No banned terms in built HTML.
  - No `nahidujjaman`, `hridoyboss`, `telehack`, `/run/media`, or `Binary Tech` in processed assets (OCR or visual check).
- Manual/browser checks if available:
  - 360, 768, 1024, 1440 widths.
  - JS disabled: matrix, install commands, navigation, docs, GitHub Releases links.
  - Keyboard tab-through.
  - Clipboard denied on install/copy controls.
  - Lighthouse or equivalent.
- If a browser check cannot be run, report it as unverified; do not claim it passed.

## 16. Migration and cleanup

- Replace the old homepage sections; remove unused marketing components.
- Remove old screenshot/mock references.
- Keep `SecurityFlow` for `/security`.
- Keep all existing routes.
- Update `SITE_DESCRIPTION` and the homepage JSON-LD description to the new product description.
- No changes outside `terra-web`.

## 17. Approval

The user approved the product-led direction (Approach A), the dark visual system, the homepage flow, the four-screenshot plan, and the dark-only decision on 2026-11-10. This document is the written spec for review before the implementation plan.
