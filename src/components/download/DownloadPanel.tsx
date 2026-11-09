import { useEffect, useMemo, useState } from 'react';
import fallbackData from '../../data/releases.json';
import { sessionCache } from '../../lib/browser';
import { getLatestRelease, type ReleaseResult } from '../../lib/github';
import {
  type DetectedPlatform,
  detectPlatform,
  type NavigatorLike,
} from '../../lib/platform';
import {
  formatBytes,
  formatReleaseDate,
  mapAssets,
  pickRecommended,
  type Release,
} from '../../lib/releases';

const fallbackRelease = fallbackData.latest as Release;

export interface DownloadPanelProps {
  variant?: 'hero' | 'full';
  detect?: () => Promise<DetectedPlatform>;
  load?: () => Promise<ReleaseResult>;
}

function osLabel(os: string): string {
  if (os === 'macos') return 'macOS';
  if (os === 'windows') return 'Windows';
  if (os === 'linux') return 'Linux';
  return 'your system';
}

export default function DownloadPanel({
  variant = 'full',
  detect,
  load,
}: DownloadPanelProps) {
  const [platform, setPlatform] = useState<DetectedPlatform | null>(null);
  const [release, setRelease] = useState<Release>(fallbackRelease);
  const [source, setSource] = useState<'live' | 'fallback'>('fallback');
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const detected = detect
          ? await detect()
          : await detectPlatform(navigator as unknown as NavigatorLike);
        if (active) setPlatform(detected);

        const result = load
          ? await load()
          : await getLatestRelease({
              fallback: fallbackRelease,
              cache: sessionCache(),
            });
        if (!active) return;
        setRelease(result.release);
        setSource(result.source);
      } catch {
        // Keep the committed snapshot. The matrix is already rendered.
      } finally {
        if (active) setChecked(true);
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [detect, load]);

  const assets = useMemo(() => mapAssets(release), [release]);
  const recommended = useMemo(
    () => (platform ? pickRecommended(assets, platform) : null),
    [assets, platform],
  );

  if (variant === 'hero') {
    return (
      <a
        href={recommended?.url ?? '/download'}
        data-testid="hero-download"
        className="inline-flex items-center justify-center rounded-lg bg-ink px-5 py-3 text-sm font-medium text-paper transition-colors duration-150 hover:bg-ink/90"
      >
        {recommended
          ? `Download for ${osLabel(platform?.os ?? '')}`
          : 'Download Terra'}
      </a>
    );
  }

  const grouped = ['macos', 'windows', 'linux']
    .map((os) => ({
      os,
      items: assets.filter((asset) => asset.os === os),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="space-y-8">
      <div className="min-h-[190px] rounded-xl border border-line bg-surface p-6">
        {recommended ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                Recommended for your system
              </p>
              <h2 className="mt-2 text-2xl font-medium tracking-[-0.03em]">
                {osLabel(platform?.os ?? '')}{' '}
                {platform?.arch === 'arm64' ? 'ARM64' : 'x64'}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {recommended.label} · {formatBytes(recommended.size)} ·{' '}
                {release.tag_name}
              </p>
            </div>
            <a
              data-testid="recommended-download"
              href={recommended.url}
              className="inline-flex items-center justify-center rounded-lg bg-ink px-5 py-3 text-sm font-medium text-paper transition-colors duration-150 hover:bg-ink/90"
            >
              Download
            </a>
          </div>
        ) : (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
              Choose your platform
            </p>
            <p className="mt-2 text-lg">
              {checked && platform
                ? 'No build matched your system. Pick a build below.'
                : 'Pick the build that matches your computer.'}
            </p>
            <p className="mt-1 text-sm text-muted">
              Every build is listed below. Detection is a convenience, never a
              gate.
            </p>
          </div>
        )}

        {checked && source === 'fallback' && (
          <p
            data-testid="fallback-notice"
            className="mt-4 border-t border-line pt-4 text-sm text-muted"
          >
            Live release metadata is unavailable. Showing the last known
            release. Check{' '}
            <a
              className="underline decoration-line underline-offset-4 hover:text-accent"
              href={release.html_url}
            >
              GitHub Releases
            </a>{' '}
            for the newest build.
          </p>
        )}
      </div>

      <div data-testid="download-matrix" className="space-y-6">
        {grouped.map(({ os, items }) => (
          <section key={os} aria-labelledby={`platform-${os}`}>
            <h3
              id={`platform-${os}`}
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted"
            >
              {osLabel(os)}
            </h3>
            <ul className="mt-3 divide-y divide-line rounded-xl border border-line bg-surface">
              {items.map((asset) => (
                <li
                  key={asset.url}
                  className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">{asset.label}</p>
                    <p className="text-xs text-muted">
                      {formatBytes(asset.size)}
                    </p>
                  </div>
                  <a
                    className="text-sm font-medium text-accent underline decoration-line underline-offset-4 hover:decoration-accent"
                    href={asset.url}
                  >
                    Download
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="text-xs text-muted">
        <span data-testid="release-version">{release.tag_name}</span> · released{' '}
        {formatReleaseDate(release.published_at)} ·{' '}
        <a
          className="underline decoration-line underline-offset-4 hover:text-accent"
          href={release.html_url}
        >
          Release notes
        </a>
      </p>
    </div>
  );
}
