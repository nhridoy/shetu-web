import { describe, expect, it } from 'vitest';
import { OS_GUIDES } from './os-guides';

describe('OS guides', () => {
  it('gives each OS its own installer and data folder', () => {
    const dirs = Object.values(OS_GUIDES).map((g) => g.dataDir);
    expect(new Set(dirs).size).toBe(3);
    expect(OS_GUIDES.windows.command).toContain('install.ps1');
    expect(OS_GUIDES.macos.command).toContain('install.sh');
    expect(OS_GUIDES.linux.command).toContain('install.sh');
  });

  it('mentions libfuse2 only for Linux', () => {
    for (const [os, guide] of Object.entries(OS_GUIDES)) {
      expect(guide.formats.join(' ').includes('libfuse2'), os).toBe(
        os === 'linux',
      );
    }
  });
});
