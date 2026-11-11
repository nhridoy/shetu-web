import {
  AppleLogo,
  DownloadSimple,
  LinuxLogo,
  WindowsLogo,
} from '@phosphor-icons/react';
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

const OS_ICONS = { macos: AppleLogo, windows: WindowsLogo, linux: LinuxLogo };

function OsIcon({ os, size = 18 }: { os: string; size?: number }) {
  const Icon = OS_ICONS[os as keyof typeof OS_ICONS];
  return Icon ? <Icon size={size} weight="fill" aria-hidden="true" /> : null;
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
        className="btn-primary px-5 py-3"
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
      <div className="panel relative min-h-[190px] overflow-hidden p-6 md:p-8">
        <div
          aria-hidden="true"
          className="glow-beam pointer-events-none absolute -top-24 -right-24 h-72 w-[28rem] opacity-50"
        />
        {recommended ? (
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-accent/25 to-accent-2/20 text-ink ring-1 ring-accent/40">
                <OsIcon os={platform?.os ?? ''} size={26} />
              </span>
              <div>
                <p className="eyebrow">Recommended for your system</p>
                <h2 className="mt-1.5 text-2xl font-bold tracking-[-0.03em]">
                  {osLabel(platform?.os ?? '')}{' '}
                  {platform?.arch === 'arm64' ? 'ARM64' : 'x64'}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {recommended.label} · {formatBytes(recommended.size)} ·{' '}
                  {release.tag_name}
                </p>
              </div>
            </div>
            <a
              data-testid="recommended-download"
              href={recommended.url}
              className="btn-primary px-5 py-3"
            >
              <DownloadSimple size={16} weight="bold" aria-hidden="true" />
              Download
            </a>
          </div>
        ) : (
          <div className="relative">
            <p className="eyebrow">Choose your platform</p>
            <h2 className="mt-2 text-lg font-semibold">
              {checked && platform
                ? 'No build matched your system. Pick a build below.'
                : 'Pick the build that matches your computer.'}
            </h2>
            <p className="mt-1 text-sm text-muted">
              Every build is listed below. Detection is a convenience, never a
              gate.
            </p>
          </div>
        )}

        {checked && source === 'fallback' && (
          <p
            data-testid="fallback-notice"
            className="relative mt-5 border-t border-line pt-4 text-sm text-muted"
          >
            Live release metadata is unavailable. Showing the last known
            release. Check{' '}
            <a className="link" href={release.html_url}>
              GitHub Releases
            </a>{' '}
            for the newest build.
          </p>
        )}
      </div>

      <div data-testid="download-matrix" className="grid gap-4 md:grid-cols-3">
        {grouped.map(({ os, items }) => (
          <section
            key={os}
            aria-labelledby={`platform-${os}`}
            className="panel p-5"
          >
            <h3
              id={`platform-${os}`}
              className="flex items-center gap-2.5 text-lg font-bold"
            >
              <OsIcon os={os} />
              {osLabel(os)}
            </h3>
            <ul className="mt-4 divide-y divide-line">
              {items.map((asset) => (
                <li
                  key={asset.url}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{asset.label}</p>
                    <p className="font-mono text-xs text-muted">
                      {formatBytes(asset.size)}
                    </p>
                  </div>
                  <a
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-accent/50 hover:bg-accent-wash"
                    href={asset.url}
                  >
                    <DownloadSimple size={13} aria-hidden="true" />
                    Download
                    <span className="sr-only"> {asset.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="font-mono text-xs text-muted">
        <span data-testid="release-version">{release.tag_name}</span> · released{' '}
        {formatReleaseDate(release.published_at)} ·{' '}
        <a className="link" href={release.html_url}>
          Release notes
        </a>
      </p>
    </div>
  );
}
