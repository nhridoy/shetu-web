import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(path, 'utf8');

describe('final review fixes', () => {
  it('lets the install command shrink on phones', () => {
    expect(read('src/components/download/InstallCommand.astro')).toMatch(
      /<fieldset[^>]*min-w-0/,
    );
    expect(read('src/pages/download.astro')).toContain('minmax(0,');
  });

  it('documents only env vars the server reads', () => {
    expect(read('src/content/docs/server.mdx')).not.toContain('REDIS_URL');
  });

  it('hides typer rows before the first frame and keeps observing', () => {
    expect(read('src/styles/global.css')).toMatch(
      /prefers-reduced-motion: no-preference[\s\S]*html\.js \[data-typer\]:not\(\[data-playing\]\) > \*/,
    );
    expect(read('src/components/mockups/TerminalPane.astro')).not.toContain(
      'io.unobserve',
    );
  });

  it('keeps an h2 between the h1 and section h3s', () => {
    expect(read('src/components/marketing/SecurityFlow.astro')).toMatch(
      /<h2 class="sr-only">/,
    );
  });

  it('only claims what the code backs', () => {
    expect(read('src/components/marketing/Comparison.astro')).not.toMatch(
      /not yet/i,
    );
    expect(read('src/components/marketing/SecurityFlow.astro')).toContain(
      'private keys',
    );
    expect(read('src/components/marketing/FaqSection.astro')).not.toMatch(
      /common request/i,
    );
  });

  it('shows the same self-host recipe as the server guide', () => {
    const home = read('src/components/marketing/SelfHostSection.astro');
    expect(home).toContain('compose.yaml');
    expect(home).not.toContain('.env');
    expect(home).not.toContain('text-muted/70');
  });

  it('makes the comparison scroll box keyboard reachable', () => {
    expect(read('src/components/marketing/Comparison.astro')).toMatch(
      /tabindex="0"[^>]*role="region"|role="region"[^>]*tabindex="0"/,
    );
  });
});
