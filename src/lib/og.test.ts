// @vitest-environment node
import sharp from 'sharp';
import { afterEach, describe, expect, it } from 'vitest';
import { loadOgFonts, renderOgPng, resetOgFontsForTest } from './og';

const offline = async (): Promise<Response> => {
  throw new Error('offline');
};

afterEach(() => resetOgFontsForTest());

describe('share images', () => {
  it('falls back to Inter when Fontshare is unreachable', async () => {
    const fonts = await loadOgFonts(offline);
    expect(fonts.map((f) => f.name)).toEqual(['Inter', 'Inter']);
    expect(fonts.map((f) => f.weight)).toEqual([400, 700]);
  });

  it('renders a 1200x630 PNG', async () => {
    const fonts = await loadOgFonts(offline);
    const png = await renderOgPng(
      {
        title: 'Free open-source SSH client for Linux',
        subtitle: 'Install Shetu on Linux.',
      },
      fonts,
    );
    expect([...png.subarray(0, 8)]).toEqual([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);
    const { width, height } = await sharp(png).metadata();
    expect([width, height]).toEqual([1200, 630]);
  }, 20000);
});
