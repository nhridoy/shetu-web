---

name: Terra
description: SSH, without the subscription. A free, open-source Termius alternative.
colors:
paper: "#07070A"
surface: "#0D0D12"
elevated: "#14141B"
ink: "#F4F4F7"
muted: "#9A9AAE"
line: "rgba(255,255,255,0.08)"
line-strong: "rgba(255,255,255,0.14)"
accent: "#8B7CFF"
accent-2: "#5B8CFF"
accent-wash: "rgba(139,124,255,0.12)"
terminal: "#09090D"
terminal-text: "#7EE2A8"
typography:
display:
fontFamily: '"Satoshi", system-ui, sans-serif'
fontSize: "clamp(2.6rem, 7vw, 5.4rem)"
fontWeight: 700
lineHeight: 1
letterSpacing: "-0.045em"
headline:
fontFamily: '"Satoshi", system-ui, sans-serif'
fontSize: "clamp(2.25rem, 4.5vw, 3.25rem)"
fontWeight: 700
lineHeight: 1.05
letterSpacing: "-0.035em"
body:
fontFamily: '"Satoshi", system-ui, sans-serif'
fontSize: "16-18px"
lineHeight: 1.65
eyebrow:
fontFamily: '"JetBrains Mono Variable", monospace'
fontSize: "11px"
letterSpacing: "0.18em"
textTransform: uppercase
terminal:
fontFamily: '"JetBrains Mono Variable", monospace'
fontSize: "11.5-12.5px"
lineHeight: 1.75
rounded:
panel: "20px"
window: "12px"
button: "10px"
components:
btn-primary: "ink fill, paper text, violet and blue glow shadow"
btn-ghost: "hairline border, faint white fill, violet border on hover"
panel: "surface gradient, hairline border, inset top highlight"
---

# Design System: Terra

## North star

"SSH, without the subscription." A Raycast-style dark product site for solo developers leaving Termius. Near-black surfaces, crisp Satoshi headlines, JetBrains Mono for anything technical, and violet/blue used as an accent, never a wash. The product is shown with coded HTML/CSS mockups of the real Terra window, not screenshots.

Spec: `docs/superpowers/specs/2026-11-11-terra-violet-redesign-design.md`.

## Color

Tokens live in `src/styles/global.css` under `@theme`. The violet to blue gradient appears only on the primary button glow, the hero and section light beams (`.glow-beam`), the logo, and one highlighted headline word (`.text-gradient`). Terminal green (`terminal-text`) appears only inside terminal mockups and status dots. Dark theme only.

## Type

Satoshi loads from the Fontshare CDN (its license forbids redistributing the files through a public repo). JetBrains Mono is self-hosted through `@fontsource-variable/jetbrains-mono`. Headings are 700 with tight tracking. Eyebrows (`.eyebrow`) are mono, 11px, uppercase, accent colored.

## Components

- **Logo** `src/components/brand/Logo.astro`: the desktop app icon (terra-client `src-tauri/icons/icon.svg`, margin trimmed) served from `public/favicon.svg`, plus `public/favicon.ico`. Update both when the app icon changes.
- **Mockups** `src/components/mockups/`: `TerraWindow` (app chrome, container-query responsive), `HostSidebar`, `TerminalPane` (optional typing animation), `SftpPanes`, demo data in `demo.ts`. All are `aria-hidden` with an `sr-only` sentence beside them.
- **Panels** `.panel`, hover lift `.lift`, buttons `.btn-primary` / `.btn-ghost`, links `.link`.
- **PageHeader** `src/components/ui/PageHeader.astro`: shared header for inner pages.

## Motion

Sections fade and rise once on first view (`.reveal`, observed in `BaseLayout`). The hero terminal types a scripted session and loops. Cards lift 3px on hover. Under `prefers-reduced-motion` all of it is off and final states show. Reveal hiding only applies under `html.js`, so nothing is hidden without JavaScript.

## Do and don't

- **Do** keep every claim inside the spec's verified product facts. `src/test/copy-guard.test.ts` blocks the known false claims and U+2013/U+2014 dashes.
- **Do** keep the Termius comparison fair, including the rows where Termius wins, with a dated price source.
- **Don't** invent customers, testimonials, user or star counts, benchmarks, or prices.
- **Don't** spread the gradient beyond the places listed above.
