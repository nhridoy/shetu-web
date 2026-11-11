import { fireEvent, render, screen, within } from '@testing-library/react';
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
  it('puts an h2 above the platform headings before detection', () => {
    render(
      <DownloadPanel
        variant="full"
        detect={() => new Promise<DetectedPlatform>(() => {})}
        load={() => new Promise<ReleaseResult>(() => {})}
      />,
    );
    expect(
      screen.getByRole('heading', { level: 2, name: /pick the build/i }),
    ).toBeInTheDocument();
  });

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

  describe('hero build menu', () => {
    const renderHero = () =>
      render(
        <DownloadPanel
          variant="hero"
          detect={async () => ({ os: 'linux', arch: 'x64' })}
          load={async () => ({ release, source: 'live' })}
        />,
      );

    it('keeps the main button pointing at the detected build', async () => {
      renderHero();
      expect(await screen.findByTestId('hero-download')).toHaveAttribute(
        'href',
        'https://example.com/linux-x64.AppImage',
      );
    });

    it('opens a list of every build in the release', async () => {
      renderHero();
      const toggle = await screen.findByRole('button', {
        name: /other downloads/i,
      });
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      fireEvent.click(toggle);
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
      const menu = screen.getByTestId('hero-build-menu');
      expect(
        within(menu).getByRole('link', { name: /windows x64/i }),
      ).toHaveAttribute('href', 'https://example.com/windows-x64.exe');
      expect(
        within(menu).getByRole('link', { name: /linux x64/i }),
      ).toHaveAttribute('href', 'https://example.com/linux-x64.AppImage');
      expect(
        within(menu).getByRole('link', { name: /older releases/i }),
      ).toHaveAttribute('href', '/releases');
    });

    it('closes on Escape and returns focus to the toggle', async () => {
      renderHero();
      const toggle = await screen.findByRole('button', {
        name: /other downloads/i,
      });
      fireEvent.click(toggle);
      fireEvent.keyDown(screen.getByTestId('hero-build-menu'), {
        key: 'Escape',
      });
      expect(screen.queryByTestId('hero-build-menu')).not.toBeInTheDocument();
      expect(toggle).toHaveFocus();
    });

    it('closes when clicking outside', async () => {
      renderHero();
      fireEvent.click(
        await screen.findByRole('button', { name: /other downloads/i }),
      );
      fireEvent.pointerDown(document.body);
      expect(screen.queryByTestId('hero-build-menu')).not.toBeInTheDocument();
    });
  });
});
