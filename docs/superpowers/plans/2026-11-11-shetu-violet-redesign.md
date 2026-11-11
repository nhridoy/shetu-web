# Shetu violet redesign implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild every page of shetu-web in a Raycast-style dark, violet/blue system with Satoshi + JetBrains Mono, coded Shetu UI mockups, a new logo, and code-verified copy aimed at solo devs leaving Termius.

**Architecture:** Static Astro output. Keep routing, React islands (`DownloadPanel`, `ReleaseList`), release fetching with the committed fallback, the docs collection, sitemap, robots and JSON-LD. Replace tokens, fonts, shell, and all marketing components. Mockups are static Astro markup plus two small inline scripts (scroll reveal, hero terminal typing).

**Tech Stack:** Astro 7, React 19 islands, Tailwind CSS 4 (`@theme` tokens in `src/styles/global.css`), MDX, Phosphor icons, Biome, Vitest + happy-dom, pnpm.

**Spec:** `docs/superpowers/specs/2026-11-11-shetu-violet-redesign-design.md` (read it; the "Verified product facts", "Anti-goals" and "Termius comparison" sections are the copy authority).

## Global Constraints

- Modify shetu-web only. Branch `learn-shetu-client-server`, no new worktree. Commit only when the user has said to commit (ask once before the first commit of the session).
- Dependencies: add `@fontsource-variable/jetbrains-mono`; remove `@fontsource-variable/geist`. Nothing else.
- Satoshi Variable loads from the Fontshare CDN (`https://api.fontshare.com/v2/css?f[]=satoshi@1&display=swap`). Never commit the font files: the ITF Free Font License forbids redistribution through a public repository.
- Tokens: paper `#07070A`, surface `#0D0D12`, elevated `#14141B`, line `rgba(255,255,255,0.08)`, ink `#F4F4F7`, muted `#9A9AAE`, accent (violet) `#8B7CFF`, accent-2 (blue) `#5B8CFF`, terminal green `#7EE2A8` (terminal mockup only).
- Gradient violet→blue only on: primary button glow, hero light beam, logo, one highlighted headline word.
- No U+2013 or U+2014 characters in `src/` (copy, titles, comments in shipped markup). Use a period, comma, colon or "·".
- Never claim: Termius encryption compatibility, SRP, Mosh/Telnet/serial, `~/.ssh/config` or Termius import, mobile apps, SSH agent forwarding, multi-hop jump chains, GitLab/Microsoft login, 2FA, unqualified "zero-knowledge", "master password", "works without a server/account", runnable snippet palette, custom shortcuts, size/speed numbers, testimonials, logos, user or star counts.
- Hero H1 exactly: `SSH, without the subscription.`
- Hero sub exactly: `Shetu is a free, open-source SSH client with split terminals, SFTP, port forwarding and an encrypted vault you can sync through your own server.`
- Hero eyebrow: `Open-source Termius alternative · ` + `releases.json` `latest.tag_name`.
- Mockups: static markup, `aria-hidden="true"` with a sibling `sr-only` sentence describing what is shown. No hydration.
- Motion off under `prefers-reduced-motion: reduce` (final state shown). Content visible with JS disabled: reveal-hiding CSS applies only under `html.js`.
- Works at 360px with no horizontal page scroll. One `h1` per page. Visible focus ring in accent. AA contrast for text.
- Gate per task: `pnpm lint && pnpm check && pnpm test && pnpm build` all pass.

## Review Focus

1. Reduced motion: hero terminal must render the full finished session immediately, and `.reveal` blocks must be visible, when the OS asks for reduced motion. (Task 2 manual check + CSS media query.)
2. No JS: every section visible and every link/download works. Reveal CSS is scoped to `html.js`, set by an inline head script. (Task 1 copy-guard test asserts the scoping string exists in `global.css`.)
3. 360px phones: comparison table, code blocks and mockups must not push the page wider than the viewport; table scrolls in its own `overflow-x-auto` wrapper. (Task 8 manual check at 360px.)
4. Claim drift: copy reintroducing a banned claim or a dash. (Task 7 extends `src/test/copy-guard.test.ts` to scan all of `src/`.)
5. Release API down: download CTA and matrix still render from `src/data/releases.json`. (Existing `DownloadPanel.test.tsx` fallback test must stay green in Task 6.)

---

### Task 1: Foundation: fonts, tokens, logo, shell, copy guard

**Files:**

- Create: `src/components/brand/Logo.astro`, `src/test/copy-guard.test.ts`
- Modify: `package.json`, `src/styles/global.css`, `src/layouts/BaseLayout.astro`, `src/components/layout/Header.astro`, `src/components/layout/Footer.astro`, `public/favicon.svg`
- Test: `src/test/copy-guard.test.ts`

**Interfaces:**

- Produces: Tailwind color utilities `paper surface elevated line ink muted accent accent-2 terminal-green`; fonts `font-sans` (Satoshi) and `font-mono` (JetBrains Mono); CSS classes `.reveal` (fade+rise, becomes visible with `.is-visible`), `.glow-beam`, `.dot-grid`, `.btn-primary`, `.btn-ghost`, `.panel` (rounded-2xl, hairline border, inset top highlight), `.eyebrow` (mono 11px uppercase tracking .18em), `.sr-only` from Tailwind; `Logo.astro` props `{ size?: number; wordmark?: boolean }`. Any element with class `reveal` is auto-observed by BaseLayout.

- [ ] **Step 1: Write the failing test** `src/test/copy-guard.test.ts` with one test now (Task 7 adds two more): `it('hides reveal blocks only when JS runs')`: `readFileSync('src/styles/global.css')` contains `html.js .reveal`.
- [ ] **Step 2: Run** `pnpm vitest run src/test/copy-guard.test.ts`. Expected: FAIL (no `html.js .reveal` yet).
- [ ] **Step 3: Fonts.** `pnpm add @fontsource-variable/jetbrains-mono && pnpm remove @fontsource-variable/geist`. Link the Fontshare Satoshi stylesheet in the `BaseLayout` head with `preconnect` to `api.fontshare.com` and `cdn.fontshare.com`.
- [ ] **Step 4: Tokens and utilities** in `global.css` per Global Constraints and Interfaces. Keep existing `.skip-link`, focus, `.install-panel` tab CSS (restyled to new tokens) and `.docs-prose` (restyled in Task 7). Add reduced-motion block that sets `.reveal` visible with no transition.
- [ ] **Step 5: BaseLayout.** Inline head script `document.documentElement.classList.add('js')`. Inline body script: IntersectionObserver adds `is-visible` to `.reveal` once (threshold 0.15); if no IntersectionObserver, add it immediately. `theme-color` `#07070A`. Keep the copy-button script. Add `og:image`-free meta as is. Default OG title stays page title.
- [ ] **Step 6: Logo + favicon.** `Logo.astro`: inline SVG 32×32 viewBox, rounded square (rx 8) filled `#0D0D12` with 1px line stroke, a tilted orbit ellipse stroked with a violet→blue `linearGradient`, and a `>` chevron as the planet in ink. Unique gradient id per instance (`Astro.props` counter or `crypto.randomUUID()` at build). `aria-hidden`; wordmark "Shetu" in Satoshi 700 when `wordmark`. Write the same mark as `public/favicon.svg` (keep `favicon.ico`).
- [ ] **Step 7: Header.** Sticky, `bg-paper/70 backdrop-blur-xl`, border-b line. Left Logo with wordmark; center nav from `NAV_ITEMS` minus Download; right GitHub icon button + `.btn-primary` "Download". Mobile `<details>` menu kept (no-JS).
- [ ] **Step 8: Footer.** Logo + one-line description (`SITE_DESCRIPTION`), columns Product (`NAV_ITEMS`), Source (four `REPOS`), Project (MIT license link `REPOS.monorepo + '/blob/main/LICENSE'`, Releases, Security). Bottom row `MIT licensed · Built in the open` and `© {year} Shetu`.
- [ ] **Step 9: Run** `pnpm vitest run src/test/copy-guard.test.ts` (PASS) then the gate. Expected: all pass.
- [ ] **Step 10: Commit** `feat: new violet design tokens, Satoshi and JetBrains Mono, logo and shell`.

### Task 2: Mockup kit and hero (eyeball checkpoint)

**Files:**

- Create: `src/components/mockups/ShetuWindow.astro`, `src/components/mockups/HostSidebar.astro`, `src/components/mockups/TerminalPane.astro`, `src/components/mockups/demo.ts`
- Modify: `src/components/marketing/Hero.astro`, `src/components/marketing/FactStrip.astro`, `src/pages/index.astro`

**Interfaces:**

- Produces:
  - `demo.ts`: `export const DEMO_GROUPS: { name: string; hosts: { name: string; user: string; os: 'ubuntu'|'debian'|'alpine'|'macos'|'freebsd'; color: string; online: boolean }[] }[]` with groups `Production`, `Staging`, `Homelab`; `export const HERO_SESSION: { prompt: string; cmd: string; out: string[] }[]` (e.g. `ssh deploy@prod-api`, `uptime`, `docker ps --format ...`, `tail -n 3 /var/log/nginx/access.log`), fictional data only.
  - `ShetuWindow.astro` props `{ tab?: 'Vaults'|'SFTP'|'Editor'; title?: string; class?: string }`, default slot = window body. Renders top bar with Vaults / SFTP / Editor tabs, a session pill, "Synced" and green "Connected" status, faux window controls; `aria-hidden="true"`.
  - `HostSidebar.astro` props `{ active?: string }`: Vault nav (Hosts, Workspaces, Snippets, Keys, History, Teams with Phosphor icons) and the `DEMO_GROUPS` list.
  - `TerminalPane.astro` props `{ title: string; lines?: typeof HERO_SESSION; animate?: boolean }`. With `animate`, it emits `data-typer` and the full session as static markup; an inline script types it char by char (35 ms/char, 600 ms between commands, restarts after 6 s) only if `matchMedia('(prefers-reduced-motion: reduce)')` is false and the pane is in view. Otherwise the static finished session stays.
- [ ] **Step 1: Build `demo.ts`, `ShetuWindow`, `HostSidebar`, `TerminalPane`** per Interfaces. Terminal font mono 12.5px, prompt in terminal-green, output muted, block cursor blinking (CSS, off under reduced motion).
- [ ] **Step 2: Hero.** Eyebrow pill (`.eyebrow` inside a rounded-full hairline pill with a small accent dot) linking to `/releases`; H1 and sub exactly per Global Constraints, with "subscription" in the gradient text; CTAs `DownloadPanel client:load variant="hero"` (restyle its hero `<a>` to `.btn-primary`; keep `data-testid="hero-download"`) and `.btn-ghost` "Star on GitHub" with Phosphor `GithubLogo`; below them a copyable `INSTALL_COMMANDS.unix` chip (mono, truncates on mobile, `data-copy`). Then `ShetuWindow` with `HostSidebar` (active `prod-api`) and a vertical split: animated `TerminalPane` "deploy@prod-api" and a static second pane "Local". `.glow-beam` and `.dot-grid` behind. `sr-only` sentence: "Shetu window showing a host list grouped into Production, Staging and Homelab, and a split terminal connected to prod-api."
- [ ] **Step 3: FactStrip** items: `MIT licensed`, `macOS, Windows, Linux · x64 and ARM64`, `Direct SSH, no relay`, `Self-hostable sync`. Mono, separated by hairlines, wraps on mobile.
- [ ] **Step 4: index.astro.** Title `Shetu · Open-source SSH client and Termius alternative`. Render Hero + FactStrip; leave the remaining old sections in place for now (they are restyled in Tasks 3 and 4).
- [ ] **Step 5: Run** `pnpm lint && pnpm check && pnpm test && pnpm build`. Expected: all pass. Then `astro dev --background` and check `/` at 1280px and 360px: no horizontal scroll, terminal types; with reduced motion emulated, finished session shows.
- [ ] **Step 6: Commit** `feat: coded Shetu window mockups and new hero`.
- [ ] **Step 7: Stop for the user's eyeball review** of tokens, fonts, logo and hero. Apply feedback before Task 3.

### Task 3: Feature bento and deep dives

**Files:**

- Create: `src/components/marketing/FeatureBento.astro`, `src/components/mockups/SftpPanes.astro` (bento mini visuals are inlined in their tiles; split one into its own `src/components/mockups/*.astro` only if it passes ~40 lines)
- Modify: `src/components/marketing/FeatureShowcase.astro`, `src/pages/index.astro`
- Delete: `src/components/marketing/FeatureGrid.astro`, `src/components/marketing/PortForwardingSection.astro`, `src/components/marketing/AppWindow.astro`, and every `src/assets/app/*.webp` no longer imported anywhere (`grep -r "assets/app" src` must be empty before deleting).

**Interfaces:**

- Consumes: `ShetuWindow`, `HostSidebar`, `TerminalPane`, `DEMO_GROUPS` from Task 2.
- Produces: `FeatureShowcase.astro` props `{ id: string; eyebrow: string; title: string; body: string; bullets: string[]; side: 'left'|'right' }` with a default slot for the mockup (replaces the `image` prop). `SftpPanes.astro` props `{ class?: string }`.
- [ ] **Step 1: FeatureBento** `id="features"`, heading "Everything you open Termius for. Free." Asymmetric 6-column grid (2 large, 6 small tiles; one column under `sm`). Tiles and copy facts (from spec "Verified product facts"): Split terminal and tabs (mini split panes); Hosts and groups (nested groups, tags, colors; mini host list); SFTP (dual pane, drag and drop, chmod/chown); Port forwarding (local, remote, SOCKS5; three rows `L 5432 → db-01:5432` style); Keys (generate Ed25519, RSA 4096, ECDSA P-256; import OpenSSH and PEM); Editor and Git (CodeMirror, about 20 languages, diff, stage/commit/push); 36 themes (swatch strip of 8 colored chips + "36 themes, 8 terminal fonts"); Session history (opt-in, encrypted, 7/30/90-day retention). Each tile `.panel .reveal`, hover border-accent/30 and slight lift.
- [ ] **Step 2: FeatureShowcase** rewritten to the new props with slot; text column + `ShetuWindow` mockup column, alternating by `side`.
- [ ] **Step 3: Deep dives in index.astro:** `files` ("Files without a second app." SFTP + remote editing; `ShetuWindow tab="SFTP"` with `SftpPanes`), `workspaces` ("Pick up where you left off." save and restore tab and pane layouts; window with 3-pane terminal grid), `teams` ("Share a vault, not a password." shared vaults, owner/admin/member roles, keys rotate when someone leaves; window with a team member list and role pills).
- [ ] **Step 4: Delete** the listed files after confirming nothing imports them.
- [ ] **Step 5: Run** the gate. Expected: pass (except copy-guard Task 7 items).
- [ ] **Step 6: Commit** `feat: feature bento and coded deep-dive mockups`.

### Task 4: Trust sections: security, self-host, comparison, cloud, open source, FAQ, CTA

**Files:**

- Create: `src/components/marketing/Comparison.astro`, `src/components/marketing/CloudTeaser.astro`
- Modify: `src/components/marketing/SecurityFlow.astro`, `SelfHostSection.astro`, `OpenSourceSection.astro`, `FaqSection.astro`, `ClosingCta.astro`, `src/pages/index.astro`
- Delete: `src/components/marketing/InstallSection.astro` (install command now lives in hero and on /download)

**Interfaces:**

- Produces: `SecurityFlow.astro` props `{ compact?: boolean }` (reused on /security in Task 8).
- [ ] **Step 1: SecurityFlow.** Three connected steps: "Your device encrypts" (Argon2id from your account password, XChaCha20-Poly1305), "The server stores ciphertext" (it never decrypts records), "SSH goes straight to the host" (no relay). Honest note exactly: `The server can see record names, tags and timestamps so it can sync them. Addresses, usernames, passwords, private keys and commands stay encrypted.` Link "How Shetu handles your keys" → `/security`.
- [ ] **Step 2: SelfHostSection.** Copy: sync runs through a Shetu server you can run yourself; Go, PostgreSQL, multi-arch Docker image. Terminal-styled block with `openssl rand -base64 48` (for `JWT_SECRET`), `docker compose pull`, `docker compose up -d`, captioned "using the compose file from the server guide", link `/docs/server`. Image tag `ghcr.io/nhridoy/shetu-server`.
- [ ] **Step 3: Comparison.astro** `id="compare"`, heading "Shetu and Termius, side by side." Rows exactly as the spec table (8 rows, editor row removed). Cells: Phosphor `Check`/`X` icons with visible text for screen readers. Wrapper `overflow-x-auto`. Footnote: `Termius prices as listed on ` + link `termius.com/pricing` + `, November 2026. Paid plans billed annually.`
- [ ] **Step 4: CloudTeaser.** Small `.panel` with "Coming soon" pill, title "Shetu Cloud", body `Don't want to run a server? A hosted, managed sync option is on the way.`, link `Watch the repo on GitHub for release news` → `REPOS.monorepo`.
- [ ] **Step 5: OpenSourceSection.** Heading "Built in the open." Four repo cards from `REPOS`: shetu (project home, docs, issues), shetu-client (Tauri v2, Rust, React, TypeScript), shetu-server (Go, Gin, GORM, PostgreSQL), shetu-web (Astro, this site). Link "Contribute" → `/community`.
- [ ] **Step 6: FaqSection** (native `<details>`), questions: Is Shetu really free? (yes, MIT, no paid tier today); Do I need a server? (sync and sign-in go through a Shetu server; you can run your own with Docker; a hosted option is coming); What can the server see? (the honest note); Can I import my Termius hosts? (not yet; add hosts by hand); Why does macOS or Windows warn me? (builds are not notarized by Apple or signed by Microsoft yet; see /download); Does Shetu have mobile apps? (not today: desktop only).
- [ ] **Step 7: ClosingCta.** "Your servers deserve a better client." + hero DownloadPanel + GitHub ghost button, glow beam.
- [ ] **Step 8: index.astro order:** Hero, FactStrip, FeatureBento, three deep dives, SecurityFlow, SelfHostSection, Comparison, CloudTeaser, OpenSourceSection, FaqSection, ClosingCta. Update JSON-LD `description` only if `SITE_DESCRIPTION` changes (leave it).
- [ ] **Step 9: Run** the gate. **Step 10: Commit** `feat: security, self-host, Termius comparison and cloud teaser sections`.

### Task 5: Download and releases

**Files:**

- Modify: `src/components/download/DownloadPanel.tsx`, `ReleaseList.tsx`, `InstallCommand.astro`, `src/components/ui/Callout.astro`, `src/pages/download.astro`, `src/pages/releases.astro`
- Test: existing `DownloadPanel.test.tsx`, `ReleaseList.test.tsx` (unchanged; all `data-testid`s and the texts `Release history is unavailable right now.`, `View releases on GitHub`, `Pre-release` must survive)

- [ ] **Step 1: DownloadPanel** class changes only: recommended build card is a `.panel` with accent glow and Phosphor `AppleLogo`/`WindowsLogo`/`LinuxLogo`; matrix grouped per OS as cards in a 3-column grid on `md`. No logic change.
- [ ] **Step 2: ReleaseList** as a vertical timeline (dot + line on the left, tag in mono, date, body). No logic change.
- [ ] **Step 3: InstallCommand and Callout** restyled to terminal block and new tokens.
- [ ] **Step 4: download.astro / releases.astro** headers use `.eyebrow` + Satoshi headings; titles `Download Shetu` and `Shetu releases` (no dashes).
- [ ] **Step 5: Run** `pnpm vitest run src/components/download` (PASS) then the gate. **Step 6: Commit** `style: restyle download and releases`.

### Task 6: Docs restyle and accuracy

**Files:**

- Modify: `src/layouts/DocsLayout.astro`, `src/components/docs/DocsNav.astro`, `src/components/ui/CodeBlock.astro`, `src/styles/global.css` (`.docs-prose`), `src/pages/docs/index.astro`, `src/content/docs/*.mdx`

- [ ] **Step 1: Restyle** layout (title `{title} · Shetu Docs`), nav (active item accent bar), TOC, prose, code blocks to new tokens and fonts.
- [ ] **Step 2: Content fixes** against the spec's verified facts and "Settled after builder check": remove "master password" (it is the account password), remove "works without a server" (the app requires signing in to a Shetu server), ChaCha20 → XChaCha20-Poly1305, keep `server.mdx`'s Postgres + `ghcr.io/nhridoy/shetu-server` compose as the single recipe and list required env vars `DATABASE_URL`, `JWT_SECRET`, `BASE_URL`, plus optional `OAUTH_GOOGLE_*`, `OAUTH_GITHUB_*`, `SMTP_*`, `REQUIRE_EMAIL_VERIFICATION` (source: shetu-server `.env.example`). Replace every U+2013/U+2014. Bump `updated: "2026-11-11"` on touched pages.
- [ ] **Step 3: Run** the gate. **Step 4: Commit** `docs: restyle docs and correct security and server facts`.

### Task 7: Security, community, 404, copy guard green

**Files:**

- Modify: `src/pages/security.astro`, `src/pages/community.astro`, `src/pages/404.astro`, any remaining file the copy guard flags
- Test: `src/test/copy-guard.test.ts`

- [ ] **Step 0a: Add the failing tests** to `copy-guard.test.ts`, walking `src/` (`.astro .mdx .tsx .ts`, skip `*.test.*`) with `node:fs`:
  - `it('has no en or em dashes')`: no file contains `–` or `—`.
  - `it('makes no banned claims')`: case-insensitive, no file matches any of `termius-compatible`, `termius compatibility`, `\bsrp\b`, `xsalsa20`, `mosh support`, `gitlab`, `microsoft login`, `master password`, `works without a server`, `zero-knowledge`, `\b2fa\b`, `two-factor`. Failure message lists file and term.
- [ ] **Step 0b: Run** `pnpm vitest run src/test/copy-guard.test.ts`. Expected: FAIL on the pages this task still has to rewrite (and anything earlier tasks missed).
- [ ] **Step 1: security.astro** title `Security · Shetu`. H1 `Your keys never leave your device unencrypted.` Sections: `SecurityFlow`; "What the server stores" vs "What stays encrypted" lists using exactly the spec's server-visible and encrypted field lists; key hierarchy (account password → Argon2id → key-encryption key → data key; X25519 key pair per account; team vault keys sealed to each member, rotated on removal; recovery code); limits (offline copies on a removed member's device cannot be wiped remotely; builds not notarized/signed yet); report a vulnerability → GitHub issues of `REPOS.monorepo`.
- [ ] **Step 2: community.astro** title `Community · Shetu`, repo cards consistent with `OpenSourceSection`, contribute steps, MIT license link.
- [ ] **Step 3: 404.astro** terminal-styled: `ssh: Could not resolve hostname this-page` in a `TerminalPane` (static), buttons Home and Docs.
- [ ] **Step 4: Run** `pnpm vitest run src/test/copy-guard.test.ts`. Expected: all 3 PASS. Fix any remaining flagged file.
- [ ] **Step 5: Gate + commit** `style: re-skin security, community and 404; copy guard green`.

### Task 8: Design record and final verification

**Files:**

- Modify: `PRODUCT.md`, `DESIGN.md`

- [ ] **Step 1:** Rewrite `PRODUCT.md` brand commitments (violet/blue, Satoshi + JetBrains Mono, dark only, solo-dev-first, honesty rules) and `DESIGN.md` tokens/typography/components to match what shipped. Keep their front-matter shape.
- [ ] **Step 2: Gate.** `pnpm lint && pnpm check && pnpm test && pnpm build`. Expected: all pass, 0 errors.
- [ ] **Step 3: Visual pass** with `astro dev --background`: every route at 1280px and 360px (no horizontal scroll, comparison table scrolls inside its box), keyboard tab order reaches every link with a visible ring, reduced motion shows finished terminal, JS disabled shows all sections. Record what was and was not checked.
- [ ] **Step 4: Commit** `docs: record violet design system`.
