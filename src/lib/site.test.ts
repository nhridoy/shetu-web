import { describe, expect, it } from 'vitest';
import {
  cleanPath,
  INSTALL_COMMANDS,
  NAV_ITEMS,
  REPOS,
  SITE_NAME,
} from './site';

describe('site constants', () => {
  it('exposes the six primary routes in navigation order', () => {
    expect(NAV_ITEMS.map((item) => item.href)).toEqual([
      '/#features',
      '/download',
      '/docs',
      '/security',
      '/changelog',
      '/community',
    ]);
  });

  it('points both install commands at the client repository', () => {
    expect(INSTALL_COMMANDS.unix).toContain('nhridoy/shetu-client');
    expect(INSTALL_COMMANDS.windows).toContain('nhridoy/shetu-client');
  });

  it('is named Shetu', () => {
    expect(SITE_NAME).toBe('Shetu');
  });

  it('points every repository link at the renamed Shetu repos', () => {
    for (const url of Object.values(REPOS)) {
      expect(url).toMatch(
        /^https:\/\/github\.com\/nhridoy\/shetu(-client|-server|-web)?$/,
      );
    }
  });

  it('uses absolute GitHub URLs for every repository', () => {
    for (const url of Object.values(REPOS)) {
      expect(url.startsWith('https://github.com/')).toBe(true);
    }
  });
});

describe('cleanPath', () => {
  it('drops .html and index so URLs match the served ones', () => {
    expect(cleanPath('/index.html')).toBe('/');
    expect(cleanPath('/download.html')).toBe('/download');
    expect(cleanPath('/docs/server.html')).toBe('/docs/server');
    expect(cleanPath('/download')).toBe('/download');
  });
});
