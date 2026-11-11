import { describe, expect, it } from 'vitest';
import {
  formatBytes,
  formatReleaseDate,
  mapAssets,
  parseRelease,
  pickRecommended,
} from './releases';

const raw = {
  tag_name: 'v0.0.15',
  name: 'v0.0.15',
  published_at: '2026-11-05T10:20:49Z',
  html_url: 'https://github.com/nhridoy/shetu-client/releases/tag/v0.0.15',
  prerelease: false,
  body: 'Notes',
  assets: [
    {
      name: 'Shetu-0.0.15-Linux-ARM64.AppImage',
      browser_download_url: 'https://example.com/linux-arm64.AppImage',
      size: 90401288,
    },
    {
      name: 'Shetu-0.0.15-Linux-ARM64.AppImage.sig',
      browser_download_url: 'https://example.com/linux-arm64.AppImage.sig',
      size: 440,
    },
    {
      name: 'Shetu-0.0.15-Linux-ARM64.deb',
      browser_download_url: 'https://example.com/linux-arm64.deb',
      size: 15362046,
    },
    {
      name: 'Shetu-0.0.15-Linux-x64.AppImage',
      browser_download_url: 'https://example.com/linux-x64.AppImage',
      size: 91871736,
    },
    {
      name: 'Shetu-0.0.15-Linux-x64.deb',
      browser_download_url: 'https://example.com/linux-x64.deb',
      size: 14774326,
    },
    {
      name: 'Shetu-0.0.15-macOS-Apple-Silicon.dmg',
      browser_download_url: 'https://example.com/mac-arm64.dmg',
      size: 12292167,
    },
    {
      name: 'Shetu-0.0.15-macOS-Intel.dmg',
      browser_download_url: 'https://example.com/mac-x64.dmg',
      size: 13237946,
    },
    {
      name: 'Shetu-0.0.15-Windows-ARM64-Setup.exe',
      browser_download_url: 'https://example.com/win-arm64.exe',
      size: 7674339,
    },
    {
      name: 'Shetu-0.0.15-Windows-x64-Setup.exe',
      browser_download_url: 'https://example.com/win-x64.exe',
      size: 8653414,
    },
    {
      name: 'Shetu-0.0.15-macOS-Apple-Silicon.app.tar.gz',
      browser_download_url: 'https://example.com/mac-arm64.app.tar.gz',
      size: 12479459,
    },
    {
      name: 'shetu-latest.json',
      browser_download_url: 'https://example.com/latest.json',
      size: 5158,
    },
  ],
};

describe('parseRelease', () => {
  it('keeps the fields the site needs and drops empty assets', () => {
    const release = parseRelease({
      ...raw,
      assets: [...raw.assets, { name: '', browser_download_url: '' }],
    });
    expect(release.tag_name).toBe('v0.0.15');
    expect(release.body).toBe('Notes');
    expect(release.assets).toHaveLength(raw.assets.length);
  });

  it('rejects non-objects', () => {
    expect(() => parseRelease(null)).toThrow();
  });
});

describe('mapAssets', () => {
  it('maps eight build files and ignores signatures and manifests', () => {
    const assets = mapAssets(parseRelease(raw));
    expect(assets).toHaveLength(8);
    expect(
      assets.map((asset) => `${asset.os}/${asset.arch}/${asset.format}`).sort(),
    ).toEqual(
      [
        'linux/arm64/appimage',
        'linux/arm64/deb',
        'linux/x64/appimage',
        'linux/x64/deb',
        'macos/arm64/dmg',
        'macos/x64/dmg',
        'windows/arm64/exe',
        'windows/x64/exe',
      ].sort(),
    );
  });
});

describe('pickRecommended', () => {
  it('picks the matching OS and architecture', () => {
    const assets = mapAssets(parseRelease(raw));
    expect(pickRecommended(assets, { os: 'macos', arch: 'arm64' })?.url).toBe(
      'https://example.com/mac-arm64.dmg',
    );
    expect(pickRecommended(assets, { os: 'windows', arch: 'x64' })?.url).toBe(
      'https://example.com/win-x64.exe',
    );
    expect(pickRecommended(assets, { os: 'linux', arch: 'x64' })?.format).toBe(
      'appimage',
    );
  });

  it('falls back to the other architecture when the exact one is missing', () => {
    const assets = mapAssets(parseRelease(raw)).filter(
      (asset) => !(asset.os === 'windows' && asset.arch === 'arm64'),
    );
    expect(
      pickRecommended(assets, { os: 'windows', arch: 'arm64' })?.arch,
    ).toBe('x64');
  });

  it('returns null for an unknown OS', () => {
    expect(
      pickRecommended(mapAssets(parseRelease(raw)), {
        os: 'unknown',
        arch: 'unknown',
      }),
    ).toBeNull();
  });
});

describe('formatBytes', () => {
  it('formats sizes', () => {
    expect(formatBytes(0)).toBe('Size unknown');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(12292167)).toBe('11.7 MB');
  });
});

describe('formatReleaseDate', () => {
  it('formats an ISO date in UTC', () => {
    expect(formatReleaseDate('2026-11-05T10:20:49Z')).toBe('Nov 5, 2026');
  });

  it('handles invalid dates', () => {
    expect(formatReleaseDate('nope')).toBe('Unknown date');
  });
});
