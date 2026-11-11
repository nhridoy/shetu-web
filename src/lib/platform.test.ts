import { describe, expect, it } from 'vitest';
import { detectArch, detectOs, detectPlatform } from './platform';

describe('detectOs', () => {
  it('prefers userAgentData platform', () => {
    expect(
      detectOs({
        userAgentData: { platform: 'macOS' },
        platform: 'Win32',
        userAgent: 'Windows',
      }),
    ).toBe('macos');
  });

  it('falls back to navigator.platform', () => {
    expect(detectOs({ platform: 'Win32', userAgent: '' })).toBe('windows');
    expect(detectOs({ platform: 'MacIntel', userAgent: '' })).toBe('macos');
    expect(detectOs({ platform: 'Linux x86_64', userAgent: '' })).toBe('linux');
  });

  it('falls back to the user agent', () => {
    expect(
      detectOs({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      }),
    ).toBe('macos');
    expect(
      detectOs({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }),
    ).toBe('windows');
    expect(detectOs({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64)' })).toBe(
      'linux',
    );
  });

  it('does not treat Android as desktop Linux', () => {
    expect(detectOs({ userAgent: 'Mozilla/5.0 (Linux; Android 14)' })).toBe(
      'unknown',
    );
  });

  it('does not treat iOS as desktop macOS', () => {
    expect(
      detectOs({
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      }),
    ).toBe('unknown');
  });

  it('returns unknown for an unrecognized client', () => {
    expect(detectOs({ userAgent: 'curl/8.0' })).toBe('unknown');
  });
});

describe('detectArch', () => {
  it('reads arm64 and x64 from the user agent', () => {
    expect(
      detectArch({ userAgent: 'Mozilla/5.0 (Macintosh; ARM64)' }, 'macos'),
    ).toBe('arm64');
    expect(
      detectArch(
        { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        'windows',
      ),
    ).toBe('x64');
  });

  it('defaults macOS to Apple Silicon', () => {
    expect(detectArch({ userAgent: 'Mozilla/5.0 (Macintosh)' }, 'macos')).toBe(
      'arm64',
    );
  });

  it('defaults macOS to Apple Silicon even with the Intel compatibility token', () => {
    expect(
      detectArch(
        { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
        'macos',
      ),
    ).toBe('arm64');
  });

  it('defaults Windows and Linux to x64', () => {
    expect(detectArch({ userAgent: 'Mozilla/5.0' }, 'windows')).toBe('x64');
    expect(detectArch({ userAgent: 'Mozilla/5.0' }, 'linux')).toBe('x64');
  });
});

describe('detectPlatform', () => {
  it('uses high entropy values when available', async () => {
    await expect(
      detectPlatform({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        userAgentData: {
          platform: 'Windows',
          getHighEntropyValues: async () => ({
            architecture: 'arm',
            bitness: '64',
          }),
        },
      }),
    ).resolves.toEqual({ os: 'windows', arch: 'arm64' });
  });

  it('keeps the best-effort architecture when high entropy fails', async () => {
    await expect(
      detectPlatform({
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
        userAgentData: {
          platform: 'Linux',
          getHighEntropyValues: async () => {
            throw new Error('denied');
          },
        },
      }),
    ).resolves.toEqual({ os: 'linux', arch: 'x64' });
  });
});
