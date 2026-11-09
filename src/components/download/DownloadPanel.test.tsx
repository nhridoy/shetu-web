import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ReleaseResult } from '../../lib/github';
import type { DetectedPlatform } from '../../lib/platform';
import type { Release } from '../../lib/releases';
import DownloadPanel from './DownloadPanel';

const release: Release = {
  tag_name: 'v9.9.9',
  name: 'v9.9.9',
  published_at: '2026-01-01T00:00:00Z',
  html_url: 'https://github.com/nhridoy/terra-client/releases/tag/v9.9.9',
  prerelease: false,
  body: '',
  assets: [
    {
      name: 'Terra-9.9.9-Linux-x64.AppImage',
      browser_download_url: 'https://example.com/linux-x64.AppImage',
      size: 1024,
    },
    {
      name: 'Terra-9.9.9-Windows-x64-Setup.exe',
      browser_download_url: 'https://example.com/windows-x64.exe',
      size: 1024,
    },
  ],
};

describe('DownloadPanel', () => {
  it('renders the committed matrix before live data arrives', () => {
    render(
      <DownloadPanel
        variant="full"
        detect={() => new Promise<DetectedPlatform>(() => {})}
        load={() => new Promise<ReleaseResult>(() => {})}
      />,
    );
    expect(screen.getByTestId('download-matrix')).toBeInTheDocument();
    expect(screen.getByTestId('release-version')).toHaveTextContent('v0.0.15');
  });

  it('recommends the detected platform and links to its asset', async () => {
    render(
      <DownloadPanel
        variant="full"
        detect={async () => ({ os: 'linux', arch: 'x64' })}
        load={async () => ({ release, source: 'live' })}
      />,
    );
    const link = await screen.findByTestId('recommended-download');
    expect(link).toHaveAttribute(
      'href',
      'https://example.com/linux-x64.AppImage',
    );
    expect(screen.getByTestId('release-version')).toHaveTextContent('v9.9.9');
  });

  it('shows a fallback notice when live data is unavailable', async () => {
    render(
      <DownloadPanel
        variant="full"
        detect={async () => ({ os: 'macos', arch: 'arm64' })}
        load={async () => ({ release, source: 'fallback' })}
      />,
    );
    expect(await screen.findByTestId('fallback-notice')).toBeInTheDocument();
  });
});
