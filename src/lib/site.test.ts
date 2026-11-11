import { describe, expect, it } from 'vitest';
import { INSTALL_COMMANDS, NAV_ITEMS, REPOS } from './site';

describe('site constants', () => {
  it('exposes the six primary routes in navigation order', () => {
    expect(NAV_ITEMS.map((item) => item.href)).toEqual([
      '/#features',
      '/download',
      '/docs',
      '/security',
      '/releases',
      '/community',
    ]);
  });

  it('points both install commands at the client repository', () => {
    expect(INSTALL_COMMANDS.unix).toContain('nhridoy/terra-client');
    expect(INSTALL_COMMANDS.windows).toContain('nhridoy/terra-client');
  });

  it('uses absolute GitHub URLs for every repository', () => {
    for (const url of Object.values(REPOS)) {
      expect(url.startsWith('https://github.com/')).toBe(true);
    }
  });
});
