# Terra site redesign: "SSH, without the subscription"

Date: 2026-11-11. Supersedes the look of `2026-11-10-terra-dark-product-site-redesign-design.md`.

## Intent

Terra is a free, MIT-licensed, open-source alternative to Termius: a Tauri desktop SSH client plus an optional self-hosted Go sync server. The current site is a competent but quiet charcoal/mint page built around sparse, partly blurred screenshots. The user wants a modern, open-source-product-style site (references: Raycast, Orca, Terax, CopilotKit Open*, open.bot, Termius) and gave full freedom over look, fonts and copy.

Success: a solo developer who is tired of paying for Termius, or of trusting a closed client with their keys, lands on the homepage and within ten seconds understands _free, open source, everything I use in Termius daily, my keys stay encrypted, I can host sync myself_, then clicks Download.

## Decisions made by the user

- **Primary audience:** solo developers leaving Termius (price, closed source). Teams and self-hosters are secondary sections, not the lead.
- **Look:** Raycast-style dark. Near-black, glossy product visuals, subtle glow gradients, crisp type, premium feel.
- **Accent:** electric violet/blue.
- **Fonts:** Satoshi (UI and headings) + JetBrains Mono (code, terminal, labels).
- **Motion:** tasteful. Scroll-in reveals, hover effects, one animated terminal in the hero that types a realistic SSH session.
- **Scope:** every page. Home, download, releases, docs (layout + prose), security, community, 404, header, footer.
- **Product visuals:** coded UI mockups (HTML/CSS) of the Terra window with demo data, replacing screenshots on the marketing pages. Faithful to the real app layout (top bar with Vaults / SFTP / Editor tabs, Synced / Connected status, left sidebar Hosts / Workspaces / Snippets / Keys / History / Teams).
- **Logo:** a new simple SVG mark plus Satoshi wordmark, also used as favicon.
- **Termius:** a fair, factual comparison table on the homepage.
- **Cloud:** a small "Terra Cloud, coming soon" teaser with a link to GitHub Discussions. No prices.
- **Headline:** left to me (see below).

## Goals

1. One consistent new visual system across all pages.
2. Homepage that sells to solo devs first, with honest, code-verified claims.
3. Crisp coded product mockups instead of weak screenshots.
4. Keep everything that already works: release fetching, OS detection, download matrix, install commands, docs collection, sitemap, robots, JSON-LD, tests.

## Non-goals

- No light theme or theme toggle (dark only, as chosen).
- No pricing page, signup flow, waitlist form or analytics.
- No new framework or animation library. Motion is CSS plus a small inline script.
- No changes to terra-client or terra-server. Modify terra-web only.
- No live GitHub star counter or other new runtime API calls.

## Anti-goals (failure even if it "works")

- Any claim the code does not back. Specifically never say: Termius encryption compatibility, SRP, Mosh/Telnet/serial support, ~/.ssh/config or Termius import, mobile apps, SSH agent forwarding, multi-hop jump chains, GitLab/Microsoft login, 2FA, "zero-knowledge" without qualification, command palette that runs snippets, customizable shortcuts, binary size or startup numbers.
- Invented testimonials, logos, user counts, star counts or benchmarks.
- A comparison table that is unfair to Termius or omits rows where Termius wins.
- Generic AI-slop look: purple gradient everywhere, emoji icons, centered-everything walls of cards. Violet is an accent, not a wash.
- U+2013 and U+2014 dashes anywhere in copy or titles (kept from the previous brief; current `<title>`s that use them get fixed).
- Breaking accessibility: contrast below WCAG AA, motion that ignores `prefers-reduced-motion`, mockups read out as noise by screen readers.

## Verified product facts (copy may use these)

Source: terra-client `b123e20` (v0.0.15) and terra-server `204d376` (v0.0.6).

- Builds: macOS (Apple Silicon, Intel; .dmg), Windows (x64, ARM64; NSIS .exe), Linux (x64, ARM64; AppImage, .deb). One-line install scripts for macOS/Linux and Windows. Auto-update via signed updater (not on .deb). Not notarized by Apple or signed by Microsoft yet.
- Terminal: xterm.js with WebGL, tabs (drag to reorder), split panes horizontal and vertical, focus mode, reconnect, local shell. 36 app themes with matching terminal colors, 8 terminal fonts, cursor/scrollback/bell settings.
- Hosts: nested groups, tags, colors, OS icons, drag and drop, reachability check, quick connect, search in the new-tab host browser.
- SFTP: dual-pane local/remote browser, upload/download with cancel, rename, delete, mkdir, chmod, chown, symlinks, copy, search, conflict dialog, drag and drop.
- Port forwarding: local, remote and dynamic (SOCKS5). Synced.
- Jump host: one saved bastion per host.
- Auth: password and public key. Key generation Ed25519, RSA 4096, ECDSA P-256; import OpenSSH/PEM incl. passphrase-protected.
- Known hosts: trust on first use with prompt, warning on changed host key.
- Editor: CodeMirror 6, about 20 languages, diff view, Markdown preview, quick open, search, edit remote files over SFTP. Git panel for local folders (stage, commit, branches, pull/push, stash).
- Workspaces: save and restore tab and pane layouts.
- Session history: opt-in, encrypted, synced terminal recordings with 7/30/90 day retention.
- Snippets: create, tag and sync. (Do not claim one-click run.)
- Security: Argon2id key derivation, random per-account data key, XChaCha20-Poly1305 encryption, X25519 key pairs, recovery code. Team vaults have their own key sealed to each member; keys rotate when a member is removed. Server never decrypts records. Server can see record names, IDs, timestamps, host OS, auth type, tags, color, group, key fingerprints/public keys, snippet descriptions and tags, forward mode. Host address, port, username, passwords, private keys and commands are encrypted. SSH connects directly from the device; no relay.
- Server: Go, Gin, GORM, PostgreSQL in production (SQLite for development). Docker image `ghcr.io/nhridoy/terra-server` (amd64, arm64) and Linux binaries. Email/password with verification, Google and GitHub OAuth. Teams with owner/admin/member roles, invites, shared vaults.

## Termius comparison (homepage table)

Termius facts from termius.com/pricing and termius.com, checked 2026-11-11. The table footnote says "Termius prices as listed on termius.com/pricing, November 2026" and links there.

| Row                           | Terra                 | Termius                           |
| ----------------------------- | --------------------- | --------------------------------- |
| Price                         | Free, MIT             | Free Starter; Pro $10/mo (annual) |
| Source code                   | Open (MIT)            | Closed                            |
| Self-host the sync server     | Yes, Docker or binary | No                                |
| Encrypted sync across devices | Free with your server | Pro plan                          |
| Shared team vaults            | Free with your server | Team plan, $20/seat/mo (annual)   |
| SSH, SFTP, port forwarding    | Yes                   | Yes                               |
| Mobile apps                   | No                    | iOS and Android                   |
| Mosh, Telnet                  | No                    | Yes                               |

Rows where Termius wins stay in. Use check / cross / text cells, not marketing adjectives.

## Visual system (my calls, user can override)

- **Palette (tokens in `global.css` `@theme`):** background `#07070A`, surface `#0D0D12`, elevated `#14141B`, line `rgba(255,255,255,0.08)`, ink `#F4F4F7`, muted `#9A9AAE`, accent violet `#8B7CFF`, accent blue `#5B8CFF`, accent gradient violet→blue used only for: the primary button glow, the hero light beam, the logo, one highlight word. Terminal green `#7EE2A8` only inside the terminal mockup for prompt text, so it reads as a terminal.
- **Type:** Satoshi Variable loaded from the Fontshare CDN (its ITF Free Font License forbids redistributing the font files through a public repository, so they are not committed). JetBrains Mono via `@fontsource-variable/jetbrains-mono`. Remove `@fontsource-variable/geist`. Headings Satoshi 600-700, tight tracking (-0.035em), body Satoshi 400 at 16-17px. Mono for eyebrows, labels, code, terminal.
- **Shapes:** 14-20px radii on panels, 10px on buttons, 1px hairline borders with a subtle top highlight (`inset 0 1px 0 rgba(255,255,255,0.06)`), soft colored glow behind key visuals.
- **Backgrounds:** faint dot grid or noise with radial masks; one violet/blue light beam behind the hero window. No full-page gradients.
- **Icons:** keep Phosphor (already installed).
- **Motion:** sections fade-and-rise on first view (IntersectionObserver + CSS class, one shared inline script); hover lift/glow on cards; hero terminal types a scripted session (connect to `prod-api`, run a couple of commands, show output), loops slowly. All of it is disabled under `prefers-reduced-motion` (final state shown).
- **Logo:** SVG mark: a rounded square holding a planet ring/orbit with a `>` prompt chevron as the planet (Terra = earth). Gradient violet→blue. Wordmark "Terra" in Satoshi 700. Used in header, footer, `public/favicon.svg`; regenerate `favicon.ico` if practical, else keep the old .ico (builder's call).

## Headline (my call)

- Eyebrow pill: "Open-source Termius alternative · v0.0.15" (version from the committed release snapshot, so it stays correct at build time).
- H1: **"SSH, without the subscription."**
- Sub: "Terra is a free, open-source SSH client with split terminals, SFTP, port forwarding and an encrypted vault you can sync through your own server."
- Primary CTA: existing hero DownloadPanel ("Download for macOS" etc.). Secondary: "Star on GitHub". Below: the one-line install command as a copyable chip.
- Alternates offered to the user: "Every server. One open-source window." / "Your keys. Your server. Your terminal."

## Homepage structure

1. **Hero:** as above, then a large coded Terra window: sidebar (hosts in groups Production / Staging / Homelab with OS icons and colors), main area split terminal with the typing session. Light beam glow behind it.
2. **Fact strip:** MIT licensed · macOS, Windows, Linux (x64 + ARM64) · Direct SSH, no relay · Self-hostable sync.
3. **Feature bento** (Raycast-style asymmetric grid, 6 to 8 tiles, each with a mini coded visual): Split terminal and tabs; Hosts and groups; SFTP dual pane; Port forwarding (local, remote, SOCKS5); Keys (generate Ed25519/RSA/ECDSA, import); Editor + Git; 36 themes (swatch strip); Encrypted session history.
4. **Deep dives** (2 or 3 alternating text + mockup rows): Files (SFTP + editor in one window), Workspaces (save tab and pane layouts), Teams (shared vaults, roles, key rotation).
5. **Security:** a 3-step flow (your device encrypts with Argon2id + XChaCha20-Poly1305 → server stores ciphertext → SSH goes direct to host) plus a short honest note: "The server can see record names, tags and timestamps so it can sync them. Addresses, usernames, passwords, private keys and commands stay encrypted." Link to /security.
6. **Self-host:** short copy plus a `docker compose` / `docker run` code block styled as a terminal, link to server docs.
7. **Terra vs Termius** table.
8. **Terra Cloud teaser:** small card, "Coming soon. Don't want to run a server? Hosted sync is on the way." Link "Follow on GitHub Discussions" to the monorepo discussions.
9. **Built in the open:** repo cards (terra, terra-client, terra-server, terra-web) with stack labels, contribute link.
10. **FAQ:** rewritten for solo devs (Is it really free? Do I need a server? What can the server see? Can I import from Termius? (honest: not yet) Why the macOS/Windows warning?).
11. **Closing CTA** with download + GitHub.

## Other pages

- **Download:** same data logic (`DownloadPanel`, `InstallCommand`, release snapshot). New card styling, OS icons, recommended build as a highlighted card, install command terminal block, first-launch notes and requirements restyled.
- **Releases:** restyle `ReleaseList` as a timeline.
- **Docs:** restyle `DocsLayout`, `DocsNav`, `.docs-prose`, `CodeBlock`, `Callout` to the new tokens and fonts. Fix factual errors in MDX against the verified facts above (e.g. ChaCha20 → XChaCha20).
- **Security:** rewrite to match the verified security model, including the honest metadata list.
- **Community:** restyle; repo cards consistent with homepage.
- **404:** new on-brand page (terminal-style "host not found").
- **Header/footer:** new logo, glassy sticky header, footer with columns. Add Security and Releases links where they fit.

## Constraints

- Stack stays: Astro 7, React islands, Tailwind v4, MDX, Phosphor, pnpm, Biome, Vitest. Only dependency change: add `@fontsource-variable/jetbrains-mono`, remove `@fontsource-variable/geist`.
- Mockups are static HTML/CSS in Astro components (no hydration), marked `aria-hidden="true"` with a visually hidden text description, or `role="img"` + `aria-label`.
- Existing tests (`pnpm test`), `pnpm lint`, `pnpm check` and `pnpm build` must pass. Update test assertions only where copy/markup intentionally changed.
- Update `PRODUCT.md` and `DESIGN.md` to describe the new direction (they are the project's design record and are now stale).
- Mobile: works at 360px width, no horizontal scroll; bento collapses to one column; comparison table scrolls inside its own container if needed.

## Settled after builder check

- **Accounts and keys (from code):** the app requires signing in to a Terra server account (`AuthGuard` redirects to `/login` without one). The key-encryption key is derived with Argon2id from the account password; there is no separate master password. A recovery code can unwrap the data key. Copy must not promise "works with no account". Fix `security.mdx` where it says "master password".
- **Default server (my call, user deferred):** do not describe the server baked into release builds. Say sync goes through a Terra server, and you can run your own (Docker or binary). The Cloud teaser says a hosted, managed option is coming.
- **Cloud teaser link (my call, user deferred):** Discussions are off on `nhridoy/terra`, so link to the monorepo with "Watch the repo on GitHub for release news" wording. No dead link, no GitHub setup needed.
- **Docs accuracy scope (my call):** fix anything that contradicts the verified facts, soften or remove claims the facts do not back, and check the self-host commands and required env vars against terra-server `204d376` (local checkout at `/run/media/nahidujjaman-hridoy/5ECC6955CC69288B/terra/server`). One self-host recipe, used consistently on the homepage and in `server.mdx`.
- **Approval:** the palette, fonts, logo and headline are in this document; approving it approves them. The plan still builds tokens, fonts, logo and hero first so they can be eyeballed before every page is restyled.

## Left to the builder

Exact spacing, component file breakdown, mockup demo data, bento tile sizes, exact animation timings, whether to delete now-unused screenshot assets (prefer deleting if nothing references them), favicon.ico regeneration, final micro-copy within the facts above.
