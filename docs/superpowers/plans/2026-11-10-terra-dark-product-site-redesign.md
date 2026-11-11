# Terra dark product site redesign — implementation plan

> **For the implementer:** Follow this plan task by task. Each task ends with a build check and a commit. Do not deploy between Tasks 2 and 4; the homepage is mid-migration during that window.

**Goal:** Replace the light “Field Manual” marketing site with a dark, product-led open-source app site, using real screenshots with sensitive text blurred and rewritten homepage copy.

**Architecture:** Static Astro output with React islands. Keep the existing routing, OS detection, runtime GitHub release fetching, committed fallback, docs content collections, and no-JS behavior. Change the design tokens, shell, homepage composition, and component styling.

**Tech stack:** Astro 7, React 19 islands, Tailwind CSS 4, TypeScript strict, Biome, Vitest, pnpm.

**Spec:** `docs/superpowers/specs/2026-11-10-terra-dark-product-site-redesign-design.md`

**Worktree/branch:** Continue on `learn-terra-client-server`. Do not create a new worktree.

---

## Constraints

- Modify `terra-web` only.
- Do not commit the original screenshots or the redaction script.
- Never claim SRP6a, XSalsa20, GitLab OAuth, Microsoft OAuth, a mobile app, pricing, customers, testimonials, benchmarks, star counts, or a cloud signup URL.
- Allowed crypto/OAuth claims: Argon2id, XChaCha20-Poly1305, X25519, Google and GitHub OAuth.
- No placeholders in shipped copy. `example.com` may appear only inside self-hoster documentation examples.
- Builds remain unsigned by Apple and Microsoft; keep Gatekeeper and SmartScreen guidance.
- No JavaScript required for reading, navigation, install commands, or reaching GitHub Releases.
- Responsive from 360px. One `h1` per page. Visible focus. AA contrast. Keyboard controls. `prefers-reduced-motion`.

---

## Task 1: Process and add the redacted app screenshots

**Files:**

- Create: `src/assets/app/hosts.webp`
- Create: `src/assets/app/edit-host.webp`
- Create: `src/assets/app/terminal.webp`
- Create: `src/assets/app/terminal-inset.webp`
- Create: `src/assets/app/editor.webp`
- Create: `src/assets/app/team-vault.webp`
- Create: `src/assets/app/themes.webp`
- Do not commit: `/tmp/process-terra-screenshots.py`
- Do not commit: the source PNGs in `~/Pictures/Screenshots/`

**Step 1: Write the one-off processing script to `/tmp`**

Create `/tmp/process-terra-screenshots.py` with:

```python
from pathlib import Path

from PIL import Image, ImageFilter

SRC = Path.home() / "Pictures/Screenshots"
OUT = Path("src/assets/app")
OUT.mkdir(parents=True, exist_ok=True)


def load(name: str) -> Image.Image:
    return Image.open(SRC / name).convert("RGB")


def crop_chrome(img: Image.Image) -> Image.Image:
    return img.crop((0, 30, img.width, img.height))


def blur_region(img: Image.Image, box: tuple[int, int, int, int], radius: int) -> None:
    region = img.crop(box).filter(ImageFilter.GaussianBlur(radius))
    img.paste(region, box)


def blur_sidebar_footer(img: Image.Image) -> None:
    blur_region(img, (40, 680, 210, 732), 16)


def blur_host_card(img: Image.Image) -> None:
    blur_region(img, (292, 244, 470, 276), 14)
    blur_region(img, (250, 272, 480, 310), 20)


def blur_edit_modal(img: Image.Image) -> None:
    blur_region(img, (487, 132, 600, 154), 14)
    blur_region(img, (487, 196, 600, 214), 14)


def blur_terminal_split(img: Image.Image) -> None:
    # Tab label, left-pane prompt and listing, right-pane host label, and lower prompt.
    blur_region(img, (275, 12, 340, 34), 14)
    blur_region(img, (0, 60, 670, 150), 16)
    blur_region(img, (670, 40, 800, 70), 18)
    blur_region(img, (650, 414, 1366, 442), 14)


def blur_terminal_inset(img: Image.Image) -> None:
    # Tab label and the connection status label.
    blur_region(img, (345, 8, 430, 32), 14)
    blur_region(img, (12, 44, 98, 62), 14)


def blur_editor(img: Image.Image) -> None:
    blur_region(img, (0, 52, 460, 78), 16)
    blur_region(img, (60, 450, 145, 475), 24)


def blur_team(img: Image.Image) -> None:
    blur_region(img, (286, 118, 380, 144), 14)
    blur_region(img, (500, 126, 650, 160), 20)


def blur_themes(img: Image.Image) -> None:
    blur_region(img, (730, 610, 800, 638), 14)


def save(img: Image.Image, name: str) -> None:
    img.save(OUT / name, "WEBP", quality=85, method=6)


def main() -> None:
    hosts = crop_chrome(load("Screenshot From 2026-11-10 13-57-06.png"))
    blur_sidebar_footer(hosts)
    blur_host_card(hosts)
    save(hosts, "hosts.webp")

    edit = crop_chrome(load("Screenshot From 2026-11-10 13-57-26.png"))
    blur_sidebar_footer(edit)
    blur_host_card(edit)
    blur_edit_modal(edit)
    save(edit, "edit-host.webp")

    terminal = crop_chrome(load("Screenshot From 2026-11-10 14-00-25.png"))
    blur_terminal_split(terminal)
    save(terminal, "terminal.webp")

    inset = crop_chrome(load("Screenshot From 2026-11-10 13-59-48.png"))
    blur_terminal_inset(inset)
    save(inset.crop((0, 0, 1000, 360)), "terminal-inset.webp")

    editor = crop_chrome(load("Screenshot From 2026-11-10 14-05-10.png"))
    blur_editor(editor)
    save(editor, "editor.webp")

    team = crop_chrome(load("Screenshot From 2026-11-10 13-58-27.png"))
    blur_sidebar_footer(team)
    blur_team(team)
    save(team, "team-vault.webp")

    themes = crop_chrome(load("Screenshot From 2026-11-10 14-05-35.png"))
    blur_sidebar_footer(themes)
    blur_themes(themes)
    save(themes, "themes.webp")


if __name__ == "__main__":
    main()

```

**Step 2: Run the script from the repo root**

```sh
python3 /tmp/process-terra-screenshots.py
```

Expected: seven WebP files in `src/assets/app/`, no errors.

**Step 3: Inspect every processed image**

Open each file with the `read` tool and check:

- No name, email, `telehack.com`, `/run/media`, `Binary Tech`, `Claude`, or `CLAUDE.md` is readable.
- The blur covers only the text, leaving the surrounding UI, icons, borders, and layout intact.
- The right-pane `whoami` output is readable; the left-pane prompt and listing and the lower-pane prompt are blurred.
- The team avatar is still visible, and the team name and detail title are blurred.
- The themes label is blurred.
- The macOS menu bar, date/time, battery, and Wi-Fi are gone.

If a blur box is misaligned, adjust the coordinates in `/tmp/process-terra-screenshots.py`, rerun, and inspect again. Do not commit until the images look clean.

**Step 4: Verify dimensions and file sizes**

```sh
python3 - <<'PY'
from pathlib import Path
from PIL import Image
for path in sorted(Path("src/assets/app").glob("*.webp")):
    with Image.open(path) as img:
        print(f"{path.name}: {img.width}x{img.height} {path.stat().st_size // 1024} KB")
PY
```

Expected: full screenshots are 1366×738; `terminal-inset.webp` is 1000×360; each file is reasonably small.

**Step 5: Commit**

```sh
git add src/assets/app
git commit -m "chore: add blurred app screenshots"
```

---

## Task 2: Add the dark design system and global shell

**Files:**

- Modify: `src/styles/global.css`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/lib/site.ts`
- Rewrite: `src/components/layout/Header.astro`
- Rewrite: `src/components/layout/Footer.astro`
- Modify: `README.md`

**Step 1: Replace the token block in `src/styles/global.css`**

Replace lines 4–16 with:

```css
@theme {
  --color-paper: #08090a;
  --color-surface: #0e1012;
  --color-elevated: #14171a;
  --color-ink: #f5f7f6;
  --color-muted: #98a2a0;
  --color-line: rgba(255, 255, 255, 0.08);
  --color-accent: #5eead4;
  --color-accent-wash: rgba(94, 234, 212, 0.12);
  --color-terminal: #0a0c0d;
  --color-terminal-text: #a7f3d0;
  --color-glow: rgba(94, 234, 212, 0.14);
  --font-sans: "Geist Variable", ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
```

**Step 2: Update base styles and add the hero/CTA backgrounds**

In the same file, change `::selection` to:

```css
::selection {
  background: rgba(94, 234, 212, 0.25);
  color: var(--color-ink);
}
```

After the `@layer base` block, add:

```css
.hero-grid {
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  background-size: 64px 64px;
  -webkit-mask-image: radial-gradient(
    ellipse 80% 60% at 50% 0%,
    black 20%,
    transparent 75%
  );
  mask-image: radial-gradient(
    ellipse 80% 60% at 50% 0%,
    black 20%,
    transparent 75%
  );
}

.cta-glow {
  background: radial-gradient(
    ellipse at center,
    var(--color-glow),
    transparent 70%
  );
}
```

**Step 3: Update the docs prose for dark surfaces**

In the same file:

- Change `.docs-prose code:not(pre code)` background to `var(--color-elevated)`.
- Change `.docs-prose pre` border to `1px solid var(--color-line)`.
- Change `.docs-prose th, .docs-prose td` border to `var(--color-line)`.
- Add:

```css
.docs-prose thead {
  background: var(--color-elevated);
}

.docs-prose h2,
.docs-prose h3 {
  color: var(--color-ink);
}

.docs-prose hr {
  border-color: var(--color-line);
}
```

The existing `.docs-prose` colors already use `--color-ink`, `--color-muted`, `--color-accent`, and `--color-terminal`, so they inherit the dark values.

**Step 4: Update `src/layouts/BaseLayout.astro`**

Add these tags inside `<head>` after the viewport meta:

```astro
    <meta name="color-scheme" content="dark" />
    <meta name="theme-color" content="#08090A" />
```

Keep the body class and copy handler unchanged.

**Step 5: Update `src/lib/site.ts`**

Replace `SITE_DESCRIPTION` with:

```ts
export const SITE_DESCRIPTION =
  'The open-source SSH workspace. Encrypted vaults, split terminals, SFTP, and team-shared hosts. Windows, macOS, and Linux.';
```

Add `Features` to `NAV_ITEMS` before `Download`:

```ts
export const NAV_ITEMS = [
  { label: 'Features', href: '/#features' },
  { label: 'Download', href: '/download' },
  { label: 'Docs', href: '/docs' },
  { label: 'Security', href: '/security' },
  { label: 'Releases', href: '/releases' },
  { label: 'Community', href: '/community' },
] as const;
```

**Step 6: Rewrite `src/components/layout/Header.astro`**

```astro
---
import { ArrowUpRight, GithubLogo } from '@phosphor-icons/react';
import { NAV_ITEMS, REPOS } from '../../lib/site';

const path = Astro.url.pathname;
const isActive = (href: string) =>
  href === '/' ? path === '/' : path.startsWith(href);
const headerNav = NAV_ITEMS.filter((item) => item.href !== '/download');
---

<header class="sticky top-0 z-40 border-b border-line bg-paper/80 backdrop-blur-xl">
  <div class="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-6">
    <a
      href="/"
      class="flex items-center gap-2.5 font-mono text-sm font-medium tracking-tight"
    >
      <span
        class="grid h-7 w-7 place-items-center rounded-md border border-accent/30 bg-accent-wash font-mono text-[11px] text-accent"
        aria-hidden="true"
      >
        &gt;_
      </span>
      <span>terra</span>
    </a>

    <nav class="hidden items-center gap-7 md:flex" aria-label="Primary">
      {headerNav.map((item) => (
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

    <div class="flex items-center gap-2">
      <a
        href={REPOS.monorepo}
        aria-label="Terra on GitHub"
        class="hidden h-9 w-9 place-items-center rounded-lg border border-line text-muted transition-colors duration-150 hover:border-accent/40 hover:text-accent sm:grid"
      >
        <GithubLogo size={17} weight="fill" />
      </a>
      <a
        href="/download"
        class="hidden items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors duration-150 hover:bg-ink/90 sm:inline-flex"
      >
        Download <ArrowUpRight size={14} weight="bold" />
      </a>

      <details class="relative md:hidden">
        <summary
          class="cursor-pointer list-none rounded-lg border border-line px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted"
        >
          Menu
        </summary>
        <nav
          class="absolute right-0 mt-2 w-56 rounded-xl border border-line bg-surface p-2 shadow-2xl shadow-black/50"
          aria-label="Mobile"
        >
          {headerNav.map((item) => (
            <a
              href={item.href}
              class="block rounded-lg px-3 py-2 text-sm text-muted hover:bg-accent-wash hover:text-accent"
            >
              {item.label}
            </a>
          ))}
          <a
            href={REPOS.monorepo}
            class="block rounded-lg px-3 py-2 text-sm text-muted hover:bg-accent-wash hover:text-accent"
          >
            GitHub
          </a>
          <a
            href="/download"
            class="mt-1 block rounded-lg bg-ink px-3 py-2 text-sm font-medium text-paper"
          >
            Download
          </a>
        </nav>
      </details>
    </div>
  </div>
</header>
```

**Step 7: Rewrite `src/components/layout/Footer.astro`**

```astro
---
import { NAV_ITEMS, REPOS } from '../../lib/site';

const year = new Date().getFullYear();
---

<footer class="border-t border-line">
  <div
    class="mx-auto grid max-w-[1200px] gap-10 px-6 py-14 md:grid-cols-[1.6fr_1fr_1fr]"
  >
    <div>
      <a href="/" class="font-mono text-sm font-medium">terra</a>
      <p class="mt-3 max-w-xs text-sm leading-relaxed text-muted">
        The open-source SSH workspace. Encrypted vaults, split terminals, SFTP,
        and team-shared hosts.
      </p>
      <p
        class="mt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted"
      >
        MIT licensed · {year}
      </p>
    </div>

    <div>
      <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
        Product
      </p>
      <ul class="mt-3 space-y-2">
        {NAV_ITEMS.map((item) => (
          <li>
            <a
              href={item.href}
              class="text-sm text-muted transition-colors duration-150 hover:text-accent"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>

    <div>
      <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
        Source
      </p>
      <ul class="mt-3 space-y-2">
        <li>
          <a
            href={REPOS.monorepo}
            class="text-sm text-muted transition-colors duration-150 hover:text-accent"
          >
            terra
          </a>
        </li>
        <li>
          <a
            href={REPOS.client}
            class="text-sm text-muted transition-colors duration-150 hover:text-accent"
          >
            terra-client
          </a>
        </li>
        <li>
          <a
            href={REPOS.server}
            class="text-sm text-muted transition-colors duration-150 hover:text-accent"
          >
            terra-server
          </a>
        </li>
        <li>
          <a
            href={REPOS.web}
            class="text-sm text-muted transition-colors duration-150 hover:text-accent"
          >
            terra-web
          </a>
        </li>
      </ul>
    </div>
  </div>

  <div class="border-t border-line">
    <div
      class="mx-auto flex max-w-[1200px] flex-col gap-2 px-6 py-5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted sm:flex-row sm:items-center sm:justify-between"
    >
      <span>Open source, self-hostable.</span>
      <span>© {year} Terra</span>
    </div>
  </div>
</footer>
```

**Step 8: Update `README.md`**

Change the `global.css` bullet and add the assets bullet:

```md
- `src/styles/global.css`: dark product tokens and prose styles.
- `src/assets/app/`: blurred product screenshots used on the homepage.
```

**Step 9: Build**

```sh
pnpm build
```

Expected: build succeeds. The old homepage will look inconsistent because it still uses the old components, but it should compile and be dark.

**Step 10: Commit**

```sh
git add src/styles/global.css src/layouts/BaseLayout.astro src/lib/site.ts src/components/layout/Header.astro src/components/layout/Footer.astro README.md
git commit -m "feat: add dark design system and shell"
```

---

## Task 3: Rebuild the homepage hero and feature grid

**Files:**

- Create: `src/components/marketing/AppWindow.astro`
- Rewrite: `src/components/marketing/Hero.astro`
- Create: `src/components/marketing/FeatureGrid.astro`
- Create: `src/components/marketing/FactStrip.astro`
- Modify: `src/pages/index.astro` (partial)

**Step 1: Create `src/components/marketing/AppWindow.astro`**

```astro
---
import { Image } from 'astro:assets';
import type { ImageMetadata } from 'astro';

interface Props {
  image: ImageMetadata;
  alt: string;
  title?: string;
  widths?: number[];
  sizes?: string;
  loading?: 'eager' | 'lazy';
  fetchpriority?: 'high' | 'low' | 'auto';
  class?: string;
}

const {
  image,
  alt,
  title = 'Terra',
  widths = [640, 960, 1366],
  sizes = '(min-width: 1200px) 560px, 100vw',
  loading = 'lazy',
  fetchpriority = 'auto',
  class: className = '',
} = Astro.props;
---

<div
  class:list={[
    'overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl shadow-black/50',
    className,
  ]}
>
  <div class="flex items-center gap-1.5 border-b border-line px-4 py-2.5">
    <span class="h-2.5 w-2.5 rounded-full bg-white/15"></span>
    <span class="h-2.5 w-2.5 rounded-full bg-white/15"></span>
    <span class="h-2.5 w-2.5 rounded-full bg-white/15"></span>
    <span
      class="ml-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted"
    >
      {title}
    </span>
  </div>
  <Image
    src={image}
    alt={alt}
    widths={widths}
    sizes={sizes}
    loading={loading}
    fetchpriority={fetchpriority}
    class="h-auto w-full"
  />
</div>
```

**Step 2: Rewrite `src/components/marketing/Hero.astro`**

```astro
---
import { Image } from 'astro:assets';
import { ArrowUpRight } from '@phosphor-icons/react';
import hosts from '../../assets/app/hosts.webp';
import terminalInset from '../../assets/app/terminal-inset.webp';
import { REPOS } from '../../lib/site';
import DownloadPanel from '../download/DownloadPanel';
import AppWindow from './AppWindow.astro';
---

<section class="relative overflow-hidden">
  <div
    class="hero-grid pointer-events-none absolute inset-0"
    aria-hidden="true"
  ></div>
  <div
    class="pointer-events-none absolute left-1/2 top-0 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-glow blur-[120px]"
    aria-hidden="true"
  ></div>

  <div
    class="relative mx-auto max-w-[1200px] px-6 pt-20 pb-20 md:pt-28 md:pb-28"
  >
    <div class="mx-auto max-w-3xl text-center">
      <p
        class="font-mono text-[10px] uppercase tracking-[0.2em] text-accent"
      >
        Open source · MIT · Windows, macOS, Linux
      </p>
      <h1
        class="mt-6 text-balance text-[clamp(2.75rem,6vw,5.25rem)] font-medium leading-[1.02] tracking-[-0.055em]"
      >
        Every server. One window.
      </h1>
      <p class="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">
        Terra is an open-source SSH workspace with encrypted vaults, split
        terminals, SFTP, and team-shared hosts. Connect directly, and sync on
        your own terms.
      </p>

      <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
        <DownloadPanel client:load variant="hero" />
        <a
          href={REPOS.monorepo}
          class="inline-flex items-center justify-center gap-1.5 rounded-lg border border-line bg-surface/60 px-5 py-3 text-sm font-medium text-ink transition-colors duration-150 hover:border-accent/40 hover:text-accent"
        >
          View on GitHub <ArrowUpRight size={14} weight="bold" />
        </a>
      </div>

      <p
        class="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted"
      >
        MIT licensed · Direct SSH · Self-hostable sync
      </p>
    </div>

    <div class="relative mx-auto mt-14 max-w-[1060px] md:mt-20">
      <AppWindow
        image={hosts}
        alt="Terra host list with groups, tags, and connection status"
        title="Terra · Vaults"
        widths={[640, 960, 1366]}
        sizes="(min-width: 1200px) 1060px, 100vw"
        loading="eager"
        fetchpriority="high"
      />

      <div
        class="absolute -bottom-10 -right-6 hidden w-[42%] overflow-hidden rounded-xl border border-line bg-surface shadow-2xl shadow-black/70 md:block"
      >
        <Image
          src={terminalInset}
          alt="Terra terminal connected to a host"
          widths={[400, 640, 1000]}
          sizes="420px"
          loading="eager"
          class="h-auto w-full"
        />
      </div>
    </div>
  </div>
</section>
```

**Step 3: Create `src/components/marketing/FeatureGrid.astro`**

```astro
---
import {
  ArrowUpRight,
  ArrowsLeftRight,
  FileCode,
  FolderSimple,
  HardDrives,
  LockKey,
  Palette,
  TerminalWindow,
  UsersThree,
} from '@phosphor-icons/react';

const features = [
  {
    icon: FolderSimple,
    title: 'Hosts & groups',
    body: 'Keep production, staging, and home-lab machines organized with groups, tags, and colors.',
    href: '#hosts',
  },
  {
    icon: LockKey,
    title: 'Encrypted vault',
    body: 'Hosts, keys, and snippets are encrypted on your device with Argon2id and XChaCha20-Poly1305.',
    href: '#security',
  },
  {
    icon: TerminalWindow,
    title: 'Terminal workspace',
    body: 'Tabs, split panes, and saved workspaces for local and remote shells.',
    href: '#terminal',
  },
  {
    icon: FileCode,
    title: 'SFTP & editor',
    body: 'Browse remote files, transfer them, and edit in place beside the terminal.',
    href: '#files',
  },
  {
    icon: ArrowsLeftRight,
    title: 'Port forwarding',
    body: 'Local, remote, and dynamic tunnels for databases and internal services.',
    href: '#port-forwarding',
  },
  {
    icon: UsersThree,
    title: 'Teams & shared vaults',
    body: 'Invite teammates, assign member roles, and share vaults from one workspace.',
    href: '#teams',
  },
  {
    icon: Palette,
    title: 'Themes',
    body: 'Dark, light, and named themes, so the workspace fits the way you work.',
    href: '#themes',
  },
  {
    icon: HardDrives,
    title: 'Self-hosted sync',
    body: 'Run the Terra server on your own infrastructure when you want sync or shared vaults.',
    href: '#self-hosted',
  },
];
---

<section id="features" class="scroll-mt-24 border-t border-line">
  <div class="mx-auto max-w-[1200px] px-6 py-20 md:py-28">
    <div class="max-w-2xl">
      <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
        Features
      </p>
      <h2
        class="mt-3 text-balance text-4xl font-medium tracking-[-0.04em] md:text-5xl"
      >
        Everything between you and the server.
      </h2>
      <p class="mt-4 text-lg leading-relaxed text-muted">
        Organize hosts, keep credentials encrypted, and move between terminals
        and files without switching apps.
      </p>
    </div>

    <div
      class="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4"
    >
      {features.map(({ icon: Icon, title, body, href }) => (
        <a
          href={href}
          class="group bg-paper p-6 transition-colors duration-150 hover:bg-surface"
        >
          <div class="flex items-start justify-between gap-3">
            <Icon size={20} weight="duotone" class="text-accent" />
            <ArrowUpRight
              size={14}
              weight="bold"
              class="text-muted transition-colors group-hover:text-accent"
            />
          </div>
          <h3 class="mt-5 text-base font-medium tracking-[-0.01em]">
            {title}
          </h3>
          <p class="mt-2 text-sm leading-relaxed text-muted">{body}</p>
        </a>
      ))}
    </div>
  </div>
</section>
```

**Step 4: Create `src/components/marketing/FactStrip.astro`**

```astro
---
const facts = [
  { label: 'License', value: 'MIT' },
  { label: 'Systems', value: 'Windows, macOS, Linux' },
  { label: 'Connections', value: 'Direct SSH' },
  { label: 'Sync', value: 'Self-hosted' },
];
---

<section class="border-y border-line bg-surface">
  <div
    class="mx-auto grid max-w-[1200px] grid-cols-2 gap-px bg-line md:grid-cols-4"
  >
    {facts.map((fact) => (
      <div class="bg-surface px-6 py-5">
        <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
          {fact.label}
        </p>
        <p class="mt-1 text-sm font-medium text-ink">{fact.value}</p>
      </div>
    ))}
  </div>
</section>
```

**Step 5: Update `src/pages/index.astro` partially**

For this task, replace the top of the page with the new hero and grid, remove the old one-workspace section, and keep the remaining old sections until Task 4. The file should be:

```astro
---
import InstallCommand from '../components/download/InstallCommand.astro';
import ClosingCta from '../components/marketing/ClosingCta.astro';
import FactStrip from '../components/marketing/FactStrip.astro';
import FeatureGrid from '../components/marketing/FeatureGrid.astro';
import Hero from '../components/marketing/Hero.astro';
import OpenSource from '../components/marketing/OpenSource.astro';
import SecurityFlow from '../components/marketing/SecurityFlow.astro';
import SelfHostPanel from '../components/marketing/SelfHostPanel.astro';
import BaseLayout from '../layouts/BaseLayout.astro';
import { SITE_DESCRIPTION } from '../lib/site';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Terra',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Windows, macOS, Linux',
  license: 'https://opensource.org/licenses/MIT',
  codeRepository: 'https://github.com/nhridoy/terra',
  downloadUrl: 'https://github.com/nhridoy/terra-client/releases/latest',
  description: SITE_DESCRIPTION,
};
---

<BaseLayout
  title="Terra — Every server. One window."
  description={SITE_DESCRIPTION}
  jsonLd={jsonLd}
>
  <Hero />
  <FactStrip />
  <FeatureGrid />
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

Note: this removes the old `FactRibbon`, `ValueCards`, and `WorkspaceMock` usage. Do not delete those files yet; Task 4 removes them.

**Step 6: Build and check**

```sh
pnpm build
```

Expected: build succeeds. Check the built homepage contains:

```sh
grep -c "Every server. One window." dist/index.html
grep -c "Everything between you and the server." dist/index.html
grep -c "Terra host list with groups" dist/index.html
```

Each should be at least 1.

**Step 7: Commit**

```sh
git add src/components/marketing/AppWindow.astro src/components/marketing/Hero.astro src/components/marketing/FeatureGrid.astro src/components/marketing/FactStrip.astro src/pages/index.astro
git commit -m "feat: rebuild homepage hero and feature grid"
```

---

## Task 4: Complete the product-led homepage

**Files:**

- Create: `src/components/marketing/FeatureShowcase.astro`
- Create: `src/components/marketing/PortForwardingSection.astro`
- Create: `src/components/marketing/SelfHostSection.astro`
- Create: `src/components/marketing/OpenSourceSection.astro`
- Create: `src/components/marketing/InstallSection.astro`
- Create: `src/components/marketing/FaqSection.astro`
- Rewrite: `src/components/marketing/ClosingCta.astro`
- Rewrite: `src/pages/index.astro`
- Delete: `src/components/marketing/FactRibbon.astro`
- Delete: `src/components/marketing/ValueCards.astro`
- Delete: `src/components/marketing/WorkspaceMock.astro`
- Delete: `src/components/marketing/SelfHostPanel.astro`
- Delete: `src/components/marketing/OpenSource.astro`

**Step 1: Create `src/components/marketing/FeatureShowcase.astro`**

```astro
---
import type { ImageMetadata } from 'astro';
import AppWindow from './AppWindow.astro';

interface Props {
  id?: string;
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  image: ImageMetadata;
  alt: string;
  imageSide?: 'left' | 'right';
  widths?: number[];
  sizes?: string;
}

const {
  id,
  eyebrow,
  title,
  body,
  bullets,
  image,
  alt,
  imageSide = 'right',
  widths = [640, 960, 1366],
  sizes = '(min-width: 1200px) 560px, 100vw',
} = Astro.props;
---

<section id={id} class="scroll-mt-24 border-t border-line">
  <div
    class="mx-auto grid max-w-[1200px] items-center gap-10 px-6 py-20 md:grid-cols-2 md:gap-16 md:py-28"
  >
    <div class:list={[imageSide === 'left' ? 'md:order-2' : '']}>
      <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
        {eyebrow}
      </p>
      <h2
        class="mt-3 text-balance text-3xl font-medium tracking-[-0.04em] md:text-4xl"
      >
        {title}
      </h2>
      <p class="mt-4 text-lg leading-relaxed text-muted">{body}</p>
      <ul class="mt-6 space-y-2 text-sm text-muted">
        {bullets.map((bullet) => (
          <li class="flex gap-2.5">
            <span
              class="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent"
              aria-hidden="true"
            ></span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </div>

    <div class:list={[imageSide === 'left' ? 'md:order-1' : '']}>
      <AppWindow
        image={image}
        alt={alt}
        widths={widths}
        sizes={sizes}
        loading="lazy"
      />
    </div>
  </div>
</section>
```

**Step 2: Create `src/components/marketing/PortForwardingSection.astro`**

```astro
---
import CodeBlock from '../ui/CodeBlock.astro';

const command = 'ssh -L 5432:localhost:5432 deploy@acme-prod-01';
---

<section id="port-forwarding" class="scroll-mt-24 border-t border-line">
  <div
    class="mx-auto grid max-w-[1200px] gap-10 px-6 py-20 md:grid-cols-2 md:items-center md:gap-16 md:py-28"
  >
    <div>
      <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
        Port forwarding
      </p>
      <h2
        class="mt-3 text-balance text-3xl font-medium tracking-[-0.04em] md:text-4xl"
      >
        Reach the services behind the firewall.
      </h2>
      <p class="mt-4 text-lg leading-relaxed text-muted">
        Open local, remote, and dynamic tunnels for databases, dashboards, and
        internal APIs without leaving the workspace.
      </p>
      <ul class="mt-6 space-y-2 text-sm text-muted">
        <li class="flex gap-2.5">
          <span class="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent"></span>
          Local and remote forwards
        </li>
        <li class="flex gap-2.5">
          <span class="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent"></span>
          Dynamic SOCKS proxies
        </li>
        <li class="flex gap-2.5">
          <span class="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent"></span>
          No extra client
        </li>
      </ul>
    </div>

    <div>
      <CodeBlock code={command} label="shell" />
      <p class="mt-3 text-xs leading-relaxed text-muted">
        Example: forward a local PostgreSQL port through an SSH host.
      </p>
    </div>
  </div>
</section>
```

**Step 3: Create `src/components/marketing/SelfHostSection.astro`**

```astro
---
import CodeBlock from '../ui/CodeBlock.astro';

const commands = `cd server
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d`;
---

<section id="self-hosted" class="scroll-mt-24 border-t border-line bg-surface">
  <div
    class="mx-auto grid max-w-[1200px] gap-10 px-6 py-20 md:grid-cols-2 md:items-start md:gap-16 md:py-28"
  >
    <div>
      <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
        Self-hosted
      </p>
      <h2
        class="mt-3 text-balance text-3xl font-medium tracking-[-0.04em] md:text-4xl"
      >
        Run the sync server yourself.
      </h2>
      <p class="mt-4 text-lg leading-relaxed text-muted">
        Terra’s sync server is open source. Run it on your own infrastructure
        with PostgreSQL, set
        <code
          class="rounded border border-line bg-elevated px-1.5 py-0.5 font-mono text-[0.85em] text-ink"
        >
          JWT_SECRET
        </code>
        and
        <code
          class="rounded border border-line bg-elevated px-1.5 py-0.5 font-mono text-[0.85em] text-ink"
        >
          BASE_URL
        </code>
        , and keep sync and shared vaults where you want them.
      </p>
      <ul class="mt-6 space-y-2 text-sm text-muted">
        <li class="flex gap-2.5">
          <span class="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent"></span>
          PostgreSQL for production
        </li>
        <li class="flex gap-2.5">
          <span class="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent"></span>
          Google and GitHub OAuth
        </li>
        <li class="flex gap-2.5">
          <span class="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent"></span>
          Your own domain and TLS
        </li>
      </ul>
      <a
        href="/docs/server"
        class="mt-6 inline-flex text-sm font-medium text-accent underline decoration-line underline-offset-4 hover:decoration-accent"
      >
        Read the server guide
      </a>
    </div>

    <CodeBlock code={commands} label="server/" />
  </div>
</section>
```

**Step 4: Create `src/components/marketing/OpenSourceSection.astro`**

```astro
---
import { ArrowUpRight } from '@phosphor-icons/react';
import { REPOS } from '../../lib/site';

const repos = [
  {
    name: 'terra',
    href: REPOS.monorepo,
    description: 'The monorepo: desktop client, server, and shared code.',
  },
  {
    name: 'terra-client',
    href: REPOS.client,
    description: 'The Tauri desktop app.',
  },
  {
    name: 'terra-server',
    href: REPOS.server,
    description: 'The Go sync server.',
  },
  {
    name: 'terra-web',
    href: REPOS.web,
    description: 'This site.',
  },
];
---

<section class="border-t border-line">
  <div class="mx-auto max-w-[1200px] px-6 py-20 md:py-28">
    <div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div class="max-w-2xl">
        <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
          Open source
        </p>
        <h2
          class="mt-3 text-balance text-4xl font-medium tracking-[-0.04em] md:text-5xl"
        >
          Yours to run, read, and change.
        </h2>
        <p class="mt-4 text-lg leading-relaxed text-muted">
          Terra is MIT licensed. The desktop client, the sync server, and this
          site are all public. Use it, fork it, or send a patch.
        </p>
      </div>
      <a
        href={REPOS.monorepo}
        class="inline-flex w-fit items-center gap-1.5 rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-ink transition-colors duration-150 hover:border-accent/40 hover:text-accent"
      >
        View on GitHub <ArrowUpRight size={14} weight="bold" />
      </a>
    </div>

    <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {repos.map((repo) => (
        <a
          href={repo.href}
          class="group rounded-xl border border-line bg-surface p-5 transition-colors duration-150 hover:border-accent/40 hover:bg-elevated"
        >
          <div class="flex items-center justify-between gap-3">
            <p class="font-mono text-sm text-ink">{repo.name}</p>
            <ArrowUpRight
              size={14}
              class="text-muted transition-colors duration-150 group-hover:text-accent"
            />
          </div>
          <p class="mt-3 text-sm leading-relaxed text-muted">
            {repo.description}
          </p>
        </a>
      ))}
    </div>

    <div class="mt-6 flex flex-wrap items-center gap-4 text-sm">
      <a
        href="/docs"
        class="font-medium text-accent underline decoration-line underline-offset-4 hover:decoration-accent"
      >
        Read the docs
      </a>
      <span
        class="font-mono text-[10px] uppercase tracking-[0.16em] text-muted"
      >
        MIT licensed · source on GitHub
      </span>
    </div>
  </div>
</section>
```

**Step 5: Create `src/components/marketing/InstallSection.astro`**

```astro
---
import { ArrowUpRight } from '@phosphor-icons/react';
import InstallCommand from '../download/InstallCommand.astro';

const platforms = [
  {
    name: 'Windows',
    detail: 'x64 and ARM64 installers',
    href: '/download#platform-windows',
  },
  {
    name: 'macOS',
    detail: 'Apple Silicon and Intel .dmg',
    href: '/download#platform-macos',
  },
  {
    name: 'Linux',
    detail: 'AppImage and .deb for x64 and ARM64',
    href: '/download#platform-linux',
  },
];
---

<section class="border-t border-line bg-surface">
  <div class="mx-auto max-w-[1200px] px-6 py-20 md:py-28">
    <div class="mx-auto max-w-2xl text-center">
      <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
        Download
      </p>
      <h2
        class="mt-3 text-balance text-4xl font-medium tracking-[-0.04em] md:text-5xl"
      >
        Download Terra.
      </h2>
      <p class="mt-4 text-lg leading-relaxed text-muted">
        Pick your platform, or use the install script. Every build is on the
        download page.
      </p>
    </div>

    <div class="mt-10 grid gap-3 sm:grid-cols-3">
      {platforms.map((platform) => (
        <a
          href={platform.href}
          class="group flex items-start justify-between gap-4 rounded-xl border border-line bg-paper p-5 transition-colors duration-150 hover:border-accent/40"
        >
          <div>
            <p class="text-base font-medium">{platform.name}</p>
            <p class="mt-1 text-sm text-muted">{platform.detail}</p>
          </div>
          <ArrowUpRight
            size={14}
            weight="bold"
            class="mt-1 text-muted transition-colors group-hover:text-accent"
          />
        </a>
      ))}
    </div>

    <div class="mx-auto mt-12 max-w-3xl">
      <h3 class="text-center text-lg font-medium">Install in one line.</h3>
      <p class="mt-2 text-center text-sm text-muted">
        The script picks the right build for your OS and architecture.
      </p>
      <div class="mt-5">
        <InstallCommand />
      </div>
    </div>

    <p class="mt-6 text-center text-sm text-muted">
      <a
        href="/download"
        class="font-medium text-accent underline decoration-line underline-offset-4 hover:decoration-accent"
      >
        All downloads
      </a>
    </p>
  </div>
</section>
```

**Step 6: Create `src/components/marketing/FaqSection.astro`**

```astro
---
import { ArrowUpRight } from '@phosphor-icons/react';

const faqs = [
  {
    question: 'Is Terra open source?',
    answer:
      'Yes. The desktop client, the sync server, and this site are MIT licensed.',
  },
  {
    question: 'Do I need a Terra server?',
    answer:
      'No for direct SSH. Sync and shared vaults require a Terra server you run.',
  },
  {
    question: 'Why does macOS or Windows warn me?',
    answer:
      'Terra is not signed by Apple or Microsoft yet. Follow the first-launch steps in the docs.',
    href: '/docs/troubleshooting',
    linkLabel: 'First-launch steps',
  },
];
---

<section class="border-t border-line">
  <div class="mx-auto max-w-[1200px] px-6 py-20 md:py-28">
    <div class="max-w-2xl">
      <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
        Before you install
      </p>
      <h2
        class="mt-3 text-balance text-4xl font-medium tracking-[-0.04em] md:text-5xl"
      >
        A few things to know.
      </h2>
    </div>

    <div class="mt-10 max-w-3xl">
      {faqs.map((faq) => (
        <details class="group border-b border-line py-5">
          <summary
            class="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium"
          >
            {faq.question}
            <span
              class="font-mono text-lg text-accent group-open:hidden"
              aria-hidden="true"
            >
              +
            </span>
            <span
              class="hidden font-mono text-lg text-accent group-open:inline"
              aria-hidden="true"
            >
              −
            </span>
          </summary>
          <p class="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            {faq.answer}
            {faq.href && (
              <a
                href={faq.href}
                class="ml-1 inline-flex items-center gap-1 font-medium text-accent underline decoration-line underline-offset-4 hover:decoration-accent"
              >
                {faq.linkLabel}
                <ArrowUpRight size={12} weight="bold" />
              </a>
            )}
          </p>
        </details>
      ))}
    </div>
  </div>
</section>
```

**Step 7: Rewrite `src/components/marketing/ClosingCta.astro`**

```astro
<section class="mx-auto max-w-[1200px] px-6 py-20 md:py-28">
  <div
    class="relative overflow-hidden rounded-3xl border border-line bg-surface px-6 py-16 text-center md:px-12 md:py-20"
  >
    <div class="cta-glow pointer-events-none absolute inset-0" aria-hidden="true">
    </div>
    <div class="relative">
      <h2
        class="mx-auto max-w-2xl text-balance text-4xl font-medium tracking-[-0.04em] md:text-5xl"
      >
        Your servers are waiting.
      </h2>
      <p class="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted">
        Download Terra, connect your first host, and keep the rest of your
        setup where it belongs.
      </p>
      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <a
          href="/download"
          class="rounded-lg bg-ink px-5 py-3 text-sm font-medium text-paper transition-colors duration-150 hover:bg-ink/90"
        >
          Download Terra
        </a>
        <a
          href="/docs"
          class="rounded-lg border border-line px-5 py-3 text-sm font-medium text-ink transition-colors duration-150 hover:border-accent/40 hover:text-accent"
        >
          Read the docs
        </a>
      </div>
    </div>
  </div>
</section>
```

**Step 8: Rewrite `src/pages/index.astro`**

```astro
---
import editHost from '../assets/app/edit-host.webp';
import editor from '../assets/app/editor.webp';
import teamVault from '../assets/app/team-vault.webp';
import terminal from '../assets/app/terminal.webp';
import themes from '../assets/app/themes.webp';
import ClosingCta from '../components/marketing/ClosingCta.astro';
import FactStrip from '../components/marketing/FactStrip.astro';
import FaqSection from '../components/marketing/FaqSection.astro';
import FeatureGrid from '../components/marketing/FeatureGrid.astro';
import FeatureShowcase from '../components/marketing/FeatureShowcase.astro';
import Hero from '../components/marketing/Hero.astro';
import InstallSection from '../components/marketing/InstallSection.astro';
import OpenSourceSection from '../components/marketing/OpenSourceSection.astro';
import PortForwardingSection from '../components/marketing/PortForwardingSection.astro';
import SecurityFlow from '../components/marketing/SecurityFlow.astro';
import SelfHostSection from '../components/marketing/SelfHostSection.astro';
import BaseLayout from '../layouts/BaseLayout.astro';
import { SITE_DESCRIPTION } from '../lib/site';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Terra',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Windows, macOS, Linux',
  license: 'https://opensource.org/licenses/MIT',
  codeRepository: 'https://github.com/nhridoy/terra',
  downloadUrl: 'https://github.com/nhridoy/terra-client/releases/latest',
  description: SITE_DESCRIPTION,
};
---

<BaseLayout
  title="Terra — Every server. One window."
  description={SITE_DESCRIPTION}
  jsonLd={jsonLd}
>
  <Hero />
  <FactStrip />
  <FeatureGrid />

  <FeatureShowcase
    id="hosts"
    eyebrow="Hosts"
    title="Your whole fleet, one list."
    body="Group machines by project or environment, add tags and colors, and find the right host without digging through config files."
    bullets={[
      'Groups, tags, and colors',
      'Search across hosts',
      'Connection status at a glance',
    ]}
    image={editHost}
    alt="Terra edit-host form with groups, tags, color, and authentication options"
    imageSide="right"
  />

  <FeatureShowcase
    id="terminal"
    eyebrow="Terminal"
    title="A terminal that keeps up."
    body="Open tabs, split panes, and save a workspace when a task spans several machines. Local and remote shells live in the same window."
    bullets={[
      'Tabs and split panes',
      'Saved workspaces',
      'Local and remote shells',
    ]}
    image={terminal}
    alt="Terra terminal with split panes, tabs, and a connected host"
    imageSide="left"
  />

  <FeatureShowcase
    id="files"
    eyebrow="Files"
    title="Files without leaving the session."
    body="Open an SFTP browser beside the terminal, transfer files, and edit remote files in place. No separate client, no context switch."
    bullets={[
      'SFTP browser',
      'Remote file editor',
      'Transfers beside the terminal',
    ]}
    image={editor}
    alt="Terra file editor with a project explorer open"
    imageSide="right"
  />

  <FeatureShowcase
    id="teams"
    eyebrow="Teams"
    title="Share access with your team."
    body="Create a team, invite members, and share vaults with the people who need them. Member roles keep access organized."
    bullets={['Team invites', 'Shared vaults', 'Member roles']}
    image={teamVault}
    alt="Terra team page with an invite dialog and member role controls"
    imageSide="left"
  />

  <FeatureShowcase
    id="themes"
    eyebrow="Themes"
    title="Make the workspace yours."
    body="Choose a dark, light, or named theme. The whole workspace changes, not just the terminal."
    bullets={['Dark and light', 'Named themes', 'Workspace-wide']}
    image={themes}
    alt="Terra appearance settings with a grid of themes"
    imageSide="right"
  />

  <PortForwardingSection />
  <SecurityFlow />
  <SelfHostSection />
  <OpenSourceSection />
  <InstallSection />
  <FaqSection />
  <ClosingCta />
</BaseLayout>
```

**Step 9: Delete the unused marketing components**

```sh
rm src/components/marketing/FactRibbon.astro
rm src/components/marketing/ValueCards.astro
rm src/components/marketing/WorkspaceMock.astro
rm src/components/marketing/SelfHostPanel.astro
rm src/components/marketing/OpenSource.astro
```

**Step 10: Build and check**

```sh
pnpm build
```

Then check the homepage contains all sections:

```sh
grep -c "Your whole fleet, one list." dist/index.html
grep -c "A terminal that keeps up." dist/index.html
grep -c "Files without leaving the session." dist/index.html
grep -c "Share access with your team." dist/index.html
grep -c "Make the workspace yours." dist/index.html
grep -c "Reach the services behind the firewall." dist/index.html
grep -c "The server never sees the keys." dist/index.html
grep -c "Run the sync server yourself." dist/index.html
grep -c "Yours to run, read, and change." dist/index.html
grep -c "Download Terra." dist/index.html
grep -c "A few things to know." dist/index.html
grep -c "Your servers are waiting." dist/index.html
```

Each should be at least 1. Check the install commands:

```sh
grep -c "curl -fsSL https://raw.githubusercontent.com/nhridoy/terra-client/main/install.sh | bash" dist/index.html
grep -c "irm https://raw.githubusercontent.com/nhridoy/terra-client/main/install.ps1 | iex" dist/index.html
```

Both should be 1.

**Step 11: Commit**

```sh
git add -A src/components/marketing src/pages/index.astro
git commit -m "feat: complete product-led homepage"
```

---

## Task 5: Re-skin download and releases

**Files:**

- Modify: `src/components/ui/CodeBlock.astro`
- Modify: `src/components/ui/Callout.astro`
- Modify: `src/components/download/InstallCommand.astro`
- Modify: `src/components/download/ReleaseList.tsx`
- Modify: `src/pages/download.astro`
- Modify: `src/pages/releases.astro`

**Step 1: Update `src/components/ui/CodeBlock.astro`**

Replace the component markup with:

```astro
<div class="overflow-hidden rounded-xl border border-line bg-terminal">
  <div class="flex items-center justify-between border-b border-line px-4 py-2.5">
    <span class="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
      {label}
    </span>
    <button
      type="button"
      data-copy={code}
      class="rounded border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted transition-colors duration-150 hover:border-accent/40 hover:text-ink"
    >
      Copy
    </button>
  </div>
  <pre class="overflow-x-auto p-4 text-[13px] leading-relaxed text-terminal-text"><code>{code}</code></pre>
</div>
```

**Step 2: Update `src/components/ui/Callout.astro`**

Replace the markup with:

```astro
<div
  class:list={[
    'rounded-xl border p-4',
    tone === 'warning'
      ? 'border-amber-400/30 bg-amber-400/10'
      : 'border-line bg-surface',
  ]}
>
  <p
    class:list={[
      'font-mono text-[10px] uppercase tracking-[0.18em]',
      tone === 'warning' ? 'text-amber-300' : 'text-muted',
    ]}
  >
    {title}
  </p>
  <div class="mt-2 text-sm leading-relaxed text-ink"><slot /></div>
</div>
```

**Step 3: Update `src/components/download/InstallCommand.astro`**

Replace the code block markup inside the panel with token classes:

```astro
      <div class="overflow-hidden rounded-xl border border-line bg-terminal">
        <div class="flex items-center justify-between border-b border-line px-4 py-2.5">
          <span class="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            {item.label}
          </span>
          <button
            type="button"
            data-copy={item.command}
            class="rounded border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted transition-colors duration-150 hover:border-accent/40 hover:text-ink"
          >
            Copy
          </button>
        </div>
        <pre class="overflow-x-auto p-4 text-[12px] leading-relaxed text-terminal-text"><code>{item.command}</code></pre>
      </div>
```

Leave the fieldset, radios, tabs, and hints unchanged.

**Step 4: Update the pre-release badge in `src/components/download/ReleaseList.tsx`**

Change:

```tsx
<span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-amber-800">
```

to:

```tsx
<span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-amber-300">
```

**Step 5: Update `src/pages/download.astro`**

The page already uses tokens. Make these small changes:

- Add `text-balance` to the `h1`.
- Change the section heading `Install in one command` to `Install in one line` to match the homepage.
- Replace the Network requirements bullet with an accurate server statement:

  ```astro
        <li>
          <strong class="text-ink">Network:</strong> direct SSH access to your
          hosts. Sync and shared vaults require a Terra server.
        </li>
  ```

- Keep all Gatekeeper, SmartScreen, requirements, and no-support-matrix copy.

The `Callout` warning is now dark via Step 2.

**Step 6: Update `src/pages/releases.astro`**

No structural change is required; the tokens and `ReleaseList` update handle the dark styling. Add `text-balance` to the `h1` if it is not already present.

**Step 7: Run tests and build**

```sh
pnpm test
pnpm build
```

Expected: 35 tests pass; build succeeds.

Check the download page still contains the full matrix and both commands:

```sh
grep -o "Terra-[0-9.]*-[A-Za-z0-9-]*\.\(AppImage\|deb\|dmg\|exe\)" dist/download/index.html | sort -u | wc -l
```

Expected: 8. If the built filename pattern differs, inspect `dist/download/index.html` and confirm all eight assets are present.

```sh
grep -c "install.sh | bash" dist/download/index.html
grep -c "install.ps1 | iex" dist/download/index.html
```

Both should be 1.

**Step 8: Commit**

```sh
git add src/components/ui/CodeBlock.astro src/components/ui/Callout.astro src/components/download/InstallCommand.astro src/components/download/ReleaseList.tsx src/pages/download.astro src/pages/releases.astro
git commit -m "style: re-skin download and releases"
```

---

## Task 6: Re-skin the docs

**Files:**

- Modify: `src/layouts/DocsLayout.astro`
- Modify: `src/components/docs/DocsNav.astro`
- Modify: `src/pages/docs/index.astro`

**Step 1: Update `src/layouts/DocsLayout.astro`**

- Change the mobile `<details>` background from `bg-surface` to `bg-elevated`.
- Change the article `h1` size to `text-4xl md:text-5xl` and add `text-balance`.
- Keep the sidebar, TOC, pagination, and content unchanged.

The resulting article header:

```astro
      <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
        Documentation
      </p>
      <h1 class="mt-3 text-balance text-4xl font-medium tracking-[-0.04em] md:text-5xl">
        {title}
      </h1>
```

**Step 2: Update `src/components/docs/DocsNav.astro`**

Change the active/hover surfaces from `bg-accent-wash` to `bg-accent-wash` (already correct) and ensure the hover text uses `hover:text-accent`. No structural change is needed. If any `bg-surface` or `bg-paper` is used for the nav, change it to `bg-elevated` for contrast. The existing nav uses tokens and is already dark.

**Step 3: Update `src/pages/docs/index.astro`**

- Change the hero `h1` to `text-5xl md:text-6xl` and add `text-balance`.
- Change the track cards from `bg-surface` to `bg-elevated` for contrast against the page background.
- Keep the guides list and copy unchanged.

**Step 4: Build and check docs routes**

```sh
pnpm build
```

Check the built docs pages:

```sh
find dist/docs -name index.html | sort
```

Expected: the docs index plus the four guide pages. Check one guide for the dark prose classes:

```sh
grep -c "docs-prose" dist/docs/desktop/index.html
```

Expected: at least 1.

**Step 5: Commit**

```sh
git add src/layouts/DocsLayout.astro src/components/docs/DocsNav.astro src/pages/docs/index.astro
git commit -m "style: re-skin docs"
```

---

## Task 7: Re-skin security, community, and 404

**Files:**

- Modify: `src/components/marketing/SecurityFlow.astro`
- Modify: `src/pages/security.astro`
- Modify: `src/pages/community.astro`
- Modify: `src/pages/404.astro`

**Step 1: Update `src/components/marketing/SecurityFlow.astro`**

Add `id="security"` and `scroll-mt-24` to the section, and change the step cards from `bg-paper` to `bg-elevated`:

```astro
<section id="security" class="scroll-mt-24 bg-surface">
```

```astro
        <div class="flex gap-4 rounded-xl border border-line bg-elevated p-4">
```

Keep the section `bg-surface`, the copy, the four steps, and the `/security` link.

**Step 2: Update `src/pages/security.astro`**

Change the four `bg-paper` key-hierarchy cards to `bg-elevated`. Keep all copy and links.

**Step 3: Update `src/pages/community.astro`**

Change the repository cards from `bg-paper` to `bg-elevated`. Keep all copy and links.

**Step 4: Update `src/pages/404.astro`**

Replace the section with:

```astro
<BaseLayout
  title="Not found — Terra"
  description="The page you requested does not exist."
>
  <section class="mx-auto max-w-[1200px] px-6 py-24 md:py-32">
    <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
      404
    </p>
    <h1
      class="mt-4 text-balance text-5xl font-medium tracking-[-0.045em] md:text-6xl"
    >
      Connection refused.
    </h1>
    <p class="mt-4 max-w-xl text-lg leading-relaxed text-muted">
      This page isn’t in the vault. Try the homepage, the docs, or the download
      page.
    </p>
    <div class="mt-8 flex flex-wrap gap-3">
      <a
        href="/"
        class="rounded-lg bg-ink px-5 py-3 text-sm font-medium text-paper"
      >
        Home
      </a>
      <a
        href="/download"
        class="rounded-lg border border-line px-5 py-3 text-sm font-medium text-ink hover:border-accent/40 hover:text-accent"
      >
        Download
      </a>
      <a
        href="/docs"
        class="rounded-lg border border-line px-5 py-3 text-sm font-medium text-ink hover:border-accent/40 hover:text-accent"
      >
        Docs
      </a>
    </div>
  </section>
</BaseLayout>
```

**Step 5: Build and check**

```sh
pnpm build
```

Check each page has one `h1`:

```sh
for f in dist/security/index.html dist/community/index.html dist/404.html; do
  printf "%s: " "$f"
  grep -o "<h1" "$f" | wc -l
done
```

Expected: 1 for each.

**Step 6: Commit**

```sh
git add src/components/marketing/SecurityFlow.astro src/pages/security.astro src/pages/community.astro src/pages/404.astro
git commit -m "style: re-skin security community and 404"
```

---

## Task 8: Final verification and cleanup

**Files:**

- No new files expected.
- Review the full diff.

**Step 1: Run the full suite**

```sh
pnpm lint
pnpm check
pnpm test
pnpm build
```

Expected: lint clean, 0 type errors, 35 tests pass, build succeeds.

**Step 2: Check for stale imports and deleted components**

```sh
grep -RIn "FactRibbon\|ValueCards\|WorkspaceMock\|SelfHostPanel\|OpenSource.astro" src || true
```

Expected: no output.

**Step 3: Check for banned claims in the built HTML**

```sh
grep -RIniE "srp6a|xsalsa20|gitlab|microsoft oauth|mobile app|pricing|customers|testimonials|benchmark|cloud signup|zero knowledge|end-to-end encrypted|no account|no terra account|telemetry" dist --include='*.html' || true
```

Expected: no output. If a word appears in an unrelated context, inspect it and remove the claim if needed.

**Step 4: Check one `h1` per page**

```sh
for f in $(find dist -name '*.html' | sort); do
  count=$(grep -o "<h1" "$f" | wc -l)
  if [ "$count" -ne 1 ]; then
    echo "$f: $count"
  fi
done
```

Expected: no output. If `404.html` or a redirect page has zero, inspect and fix.

**Step 5: Check the install commands and download assets**

```sh
grep -c "install.sh | bash" dist/download/index.html
grep -c "install.ps1 | iex" dist/download/index.html
grep -o "Terra-[0-9.]*-[A-Za-z0-9-]*\.\(AppImage\|deb\|dmg\|exe\)" dist/download/index.html | sort -u | wc -l
```

Expected: 1, 1, 8.

**Step 6: Check screenshot redactions visually**

Open every file in `src/assets/app/` with the `read` tool again. Confirm no `nahidujjaman`, `hridoyboss`, `telehack`, `/run/media`, `Binary Tech`, `Claude`, or `CLAUDE.md` is readable. This is a visual check because the assets are binary.

**Step 7: Check the diff for whitespace errors**

```sh
git diff --check
```

Expected: no output.

**Step 8: Manual/browser checks**

If a browser is available, check:

- Homepage at 360, 768, 1024, and 1440 widths.
- Header mobile menu opens and closes with the keyboard.
- No horizontal scroll.
- Focus rings are visible on links, buttons, install tabs, and the mobile menu.
- JS disabled: the homepage, install commands, docs, navigation, and GitHub Releases links are still usable.
- Clipboard denied: the copy controls show `Select and copy` instead of breaking.
- `/download` still lists all eight assets and both install commands.
- `/docs/*` pages render dark prose and the TOC anchors work.

If a browser is not available, report these as unverified. Do not claim they passed.

**Step 9: Commit any final fixes**

If Steps 1–7 required changes:

```sh
git add -A
git commit -m "chore: verify dark redesign"
```

If no changes were required, do not create an empty commit.

---

## Completion checklist

- [ ] Seven blurred WebP assets in `src/assets/app/`, no originals or script committed.
- [ ] Dark tokens and shell applied to every page.
- [ ] Homepage has hero, feature grid, hosts, terminal, files, teams, themes, port forwarding, security, self-host, open source, install, and closing sections.
- [ ] All eight feature cards present.
- [ ] `SecurityFlow` used on the homepage and `/security`.
- [ ] `DownloadPanel`, `InstallCommand`, `ReleaseList`, and `Callout` work on dark surfaces.
- [ ] Docs, security, community, and 404 re-skinned.
- [ ] `pnpm lint`, `pnpm check`, `pnpm test`, and `pnpm build` pass.
- [ ] No banned claims in the built HTML.
- [ ] No sensitive text in the processed screenshots.
- [ ] Manual/browser checks either pass or are reported as unverified.
