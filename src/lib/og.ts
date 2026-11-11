import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import satori from 'satori';
import sharp from 'sharp';

export interface OgFont {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 700;
  style: 'normal';
}

const WEIGHTS = [400, 700] as const;
let fontsPromise: Promise<OgFont[]> | null = null;

function toArrayBuffer(buffer: Buffer): ArrayBuffer {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
}

async function fetchSatoshi(fetchImpl: typeof fetch): Promise<OgFont[]> {
  return Promise.all(
    WEIGHTS.map(async (weight) => {
      const css = await (
        await fetchImpl(
          `https://api.fontshare.com/v2/css?f[]=satoshi@${weight}&display=swap`,
          { signal: AbortSignal.timeout(10_000) },
        )
      ).text();
      const url = css.match(/url\('([^']+\.ttf)'\)/)?.[1];
      if (!url) throw new Error('Satoshi TTF not found');
      const res = await fetchImpl(url.startsWith('//') ? `https:${url}` : url, {
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) throw new Error(`Satoshi download failed: ${res.status}`);
      return {
        name: 'Satoshi',
        data: await res.arrayBuffer(),
        weight,
        style: 'normal' as const,
      };
    }),
  );
}

function interFallback(): OgFont[] {
  return WEIGHTS.map((weight) => ({
    name: 'Inter',
    data: toArrayBuffer(
      readFileSync(
        join(
          process.cwd(),
          `node_modules/@fontsource/inter/files/inter-latin-${weight}-normal.woff`,
        ),
      ),
    ),
    weight,
    style: 'normal' as const,
  }));
}

/** Satoshi from Fontshare (never committed: its license forbids it); Inter when offline. */
export function loadOgFonts(
  fetchImpl: typeof fetch = fetch,
): Promise<OgFont[]> {
  fontsPromise ??= fetchSatoshi(fetchImpl).catch(() => interFallback());
  return fontsPromise;
}

export function resetOgFontsForTest(): void {
  fontsPromise = null;
}

const icon = `data:image/svg+xml;base64,${readFileSync(
  join(process.cwd(), 'public/favicon.svg'),
).toString('base64')}`;

const el = (type: string, style: object, children?: unknown, props = {}) => ({
  type,
  props: { style, children, ...props },
});

export async function renderOgPng(
  input: { title: string; subtitle: string },
  fonts: OgFont[],
): Promise<Buffer> {
  const tree = el(
    'div',
    {
      width: 1200,
      height: 630,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: 72,
      backgroundColor: '#07070a',
      backgroundImage:
        'radial-gradient(circle at 85% 15%, rgba(139,124,255,0.38), transparent 45%), radial-gradient(circle at 70% 95%, rgba(91,140,255,0.28), transparent 50%)',
      color: '#f4f4f7',
      fontFamily: fonts[0]?.name ?? 'Inter',
    },
    [
      el('div', { display: 'flex', alignItems: 'center', gap: 20 }, [
        el('img', { width: 88, height: 88 }, undefined, {
          src: icon,
          width: 88,
          height: 88,
        }),
        el('div', { fontSize: 40, fontWeight: 700 }, 'Terra'),
      ]),
      el('div', { display: 'flex', flexDirection: 'column', gap: 22 }, [
        el(
          'div',
          {
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: -2,
            maxWidth: 1000,
          },
          input.title,
        ),
        el(
          'div',
          { fontSize: 28, color: '#9a9aae', lineHeight: 1.35, maxWidth: 980 },
          input.subtitle,
        ),
      ]),
      el(
        'div',
        { display: 'flex', fontSize: 24, color: '#8b7cff' },
        'terra.iamnahid.com',
      ),
    ],
  );
  // biome-ignore lint/suspicious/noExplicitAny: satori takes a React-element-shaped object
  const svg = await satori(tree as any, { width: 1200, height: 630, fonts });
  return sharp(Buffer.from(svg)).png().toBuffer();
}
