import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(path, 'utf8');

describe('site config', () => {
  it('builds clean URLs', () => {
    const config = read('astro.config.mjs');
    expect(config).toContain("format: 'file'");
    expect(config).toContain("trailingSlash: 'never'");
  });

  it('caches hashed assets for a year', () => {
    const headers = read('public/_headers');
    expect(headers).toContain('/_astro/*');
    expect(headers).toContain(
      'Cache-Control: public, max-age=31536000, immutable',
    );
  });

  it('serves only the custom domain', () => {
    const json = read('wrangler.jsonc')
      .split('\n')
      .filter((line) => !line.trim().startsWith('//'))
      .join('\n');
    expect(JSON.parse(json).workers_dev).toBe(false);
  });

  it('redirects the old releases page', () => {
    const redirects = read('public/_redirects');
    expect(redirects).toContain('/releases /changelog 301');
    expect(redirects).toContain('/releases/ /changelog 301');
  });
});
